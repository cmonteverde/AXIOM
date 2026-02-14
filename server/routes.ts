import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertManuscriptSchema, profileSetupSchema } from "@shared/schema";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerObjectStorageRoutes, ObjectStorageService } from "./replit_integrations/object_storage";
import OpenAI from "openai";
import { buildAxiomSystemPrompt, LEARN_LINK_URLS } from "./axiom-prompt";
import { autoDetectPaperType, loadModulesForType, loadWritingWorkflow, loadPaperTypesExplained, getPaperTypeLabel, type PaperType } from "./module-loader";
import { rateLimit } from "./rate-limit";

// General API rate limit: 100 requests per minute per user
const apiLimiter = rateLimit({ windowMs: 60_000, maxRequests: 100 });

// Track in-flight analysis requests to prevent duplicate OpenAI calls
const activeAnalyses = new Set<string>();

// Strict rate limit for expensive AI analysis: 5 requests per minute per user
const analyzeLimiter = rateLimit({
  windowMs: 60_000,
  maxRequests: 5,
  message: "Analysis rate limit exceeded. Please wait before running another analysis.",
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  registerObjectStorageRoutes(app);

  // Apply general rate limiting to all /api routes
  app.use("/api", apiLimiter);

  app.post("/api/users/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = profileSetupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid profile data" });
      }
      const user = await storage.updateUserProfile(userId, parsed.data);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(user);
    } catch (error) {
      console.error("Error updating user profile:", error);
      return res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get("/api/users/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.delete("/api/users/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteUser(userId);
      // Destroy the session so the deleted user's cookie is invalidated
      req.logout(() => {
        req.session.destroy(() => {
          return res.json({ success: true });
        });
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.get("/api/manuscripts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const manuscriptList = await storage.getManuscriptsByUserId(userId);
      return res.json(manuscriptList);
    } catch (error) {
      console.error("Error fetching manuscripts:", error);
      return res.status(500).json({ message: "Failed to fetch manuscripts" });
    }
  });

  app.get("/api/manuscripts/:id", isAuthenticated, async (req: any, res) => {
    try {
      let manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript) {
        return res.status(404).json({ message: "Manuscript not found" });
      }
      const userId = req.user.claims.sub;
      if (manuscript.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      if (manuscript.analysisStatus === "processing" && !manuscript.analysisJson) {
        manuscript = (await storage.updateManuscriptAnalysis(manuscript.id, null, "none")) || manuscript;
      }
      return res.json(manuscript);
    } catch (error) {
      console.error("Error fetching manuscript:", error);
      return res.status(500).json({ message: "Failed to fetch manuscript" });
    }
  });

  app.post("/api/manuscripts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertManuscriptSchema.safeParse({ ...req.body, userId });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid manuscript data" });
      }
      const manuscript = await storage.createManuscript(parsed.data);
      return res.json(manuscript);
    } catch (error) {
      console.error("Error creating manuscript:", error);
      return res.status(500).json({ message: "Failed to create manuscript" });
    }
  });

  app.delete("/api/manuscripts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript || manuscript.userId !== userId) {
        return res.status(404).json({ message: "Manuscript not found" });
      }
      await storage.deleteManuscript(manuscript.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting manuscript:", error);
      return res.status(500).json({ message: "Failed to delete manuscript" });
    }
  });

  app.post("/api/manuscripts/:id/extract", isAuthenticated, async (req: any, res) => {
    try {
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript) {
        return res.status(404).json({ message: "Manuscript not found" });
      }
      const userId = req.user.claims.sub;
      if (manuscript.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (!manuscript.fileKey) {
        await storage.updateManuscriptExtraction(manuscript.id, "", "no_file");
        return res.json({ status: "no_file", previewText: "" });
      }

      await storage.updateManuscriptExtraction(manuscript.id, "", "processing");

      try {
        const objectStorageService = new ObjectStorageService();
        const objectFile = await objectStorageService.getObjectEntityFile(manuscript.fileKey);
        const [buffer] = await objectFile.download();
        
        let extractedText = "";
        const fname = (manuscript.fileName || "").toLowerCase();

        if (fname.endsWith(".pdf")) {
          const pdfParse = require("pdf-parse");
          const pdfData = await pdfParse(buffer);
          extractedText = pdfData.text;
        } else if (fname.endsWith(".docx")) {
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result.value;
        } else if (fname.endsWith(".txt")) {
          extractedText = buffer.toString("utf-8");
        } else {
          extractedText = buffer.toString("utf-8");
        }

        const previewText = extractedText.slice(0, 500).trim();
        await storage.updateManuscriptExtraction(manuscript.id, previewText, "completed", extractedText);
        return res.json({ status: "completed", previewText });
      } catch (extractError) {
        console.error("Extraction error:", extractError);
        await storage.updateManuscriptExtraction(manuscript.id, "", "failed");
        return res.status(500).json({ status: "failed", message: "Failed to extract text from file" });
      }
    } catch (error) {
      console.error("Error in extraction endpoint:", error);
      return res.status(500).json({ message: "Failed to process extraction request" });
    }
  });

  app.post("/api/manuscripts/:id/analyze", isAuthenticated, analyzeLimiter, async (req: any, res) => {
    const manuscriptId = req.params.id;

    // Prevent concurrent analysis on the same manuscript
    if (activeAnalyses.has(manuscriptId)) {
      return res.status(409).json({ message: "Analysis is already in progress for this manuscript." });
    }

    try {
      const manuscript = await storage.getManuscript(manuscriptId);
      if (!manuscript) {
        return res.status(404).json({ message: "Manuscript not found" });
      }
      const userId = req.user.claims.sub;
      if (manuscript.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      activeAnalyses.add(manuscriptId);

      const textToAnalyze = manuscript.fullText || manuscript.previewText;
      if (!textToAnalyze || textToAnalyze.trim().length === 0) {
        return res.status(400).json({ message: "No manuscript text available for analysis" });
      }

      const selectedHelpTypes: string[] = req.body?.helpTypes || manuscript.helpTypes || [];
      const paperType = (req.body?.paperType || manuscript.paperType || "generic") as PaperType;

      await storage.updateManuscriptAnalysis(manuscript.id, null, "processing");

      if (paperType !== manuscript.paperType) {
        await storage.updateManuscriptPaperType(manuscript.id, paperType);
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        await storage.updateManuscriptAnalysis(manuscript.id, null, "failed");
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }

      const openai = new OpenAI({ apiKey });

      const truncatedText = textToAnalyze.slice(0, 30000);

      const moduleData = loadModulesForType(paperType);
      const paperTypeLabel = getPaperTypeLabel(paperType);

      const systemPrompt = buildAxiomSystemPrompt(manuscript.stage || "draft", selectedHelpTypes);
      const moduleContext = `\n\n--- LOADED MODULES: ${moduleData.files.join(", ")} ---\n--- PAPER TYPE: ${paperTypeLabel} ---\n\n${moduleData.content}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt + moduleContext },
          { role: "user", content: `Paper Type: ${paperTypeLabel}\nModules Loaded: ${moduleData.files.join(", ")}\n\nPlease provide a comprehensive, section-by-section analysis of this manuscript using the loaded type-specific modules. Be exhaustive - cover every section present and provide multiple feedback items per section:\n\n${truncatedText}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 8000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        await storage.updateManuscriptAnalysis(manuscript.id, null, "failed");
        return res.status(500).json({ message: "No response from AI" });
      }

      let analysisJson;
      try {
        analysisJson = JSON.parse(content);
      } catch {
        await storage.updateManuscriptAnalysis(manuscript.id, null, "failed");
        return res.status(500).json({ message: "Failed to parse AI response" });
      }

      if (analysisJson.learnLinks && Array.isArray(analysisJson.learnLinks)) {
        analysisJson.learnLinks = analysisJson.learnLinks.map((link: any) => {
          const topicKey = (link.topic || "").toLowerCase().replace(/[\s&]+/g, "_").replace(/[^a-z_]/g, "");
          const matches = LEARN_LINK_URLS[topicKey] || LEARN_LINK_URLS["writing_quality"] || [];
          const picked = matches[0];
          return {
            ...link,
            url: picked?.url || "https://owl.purdue.edu/owl/general_writing/academic_writing/index.html",
            source: picked?.source || "Purdue OWL",
          };
        });
      }

      if (analysisJson.detailedFeedback && Array.isArray(analysisJson.detailedFeedback)) {
        analysisJson.detailedFeedback = analysisJson.detailedFeedback.map((fb: any) => {
          const topicKey = (fb.resourceTopic || fb.section || "").toLowerCase().replace(/[\s&]+/g, "_").replace(/[^a-z_]/g, "");
          const matches = LEARN_LINK_URLS[topicKey] || LEARN_LINK_URLS["writing_quality"] || [];
          const picked = matches[0];
          return {
            ...fb,
            resourceUrl: picked?.url || "",
            resourceSource: picked?.source || "",
          };
        });
      }

      analysisJson.paperType = paperType;
      analysisJson.paperTypeLabel = paperTypeLabel;
      analysisJson.modulesUsed = moduleData.files;

      const readinessScore = analysisJson.readinessScore ?? null;
      await storage.updateManuscriptAnalysis(manuscript.id, analysisJson, "completed", readinessScore, moduleData.files);

      activeAnalyses.delete(manuscriptId);
      return res.json({ status: "completed", analysis: analysisJson });
    } catch (error) {
      activeAnalyses.delete(manuscriptId);
      console.error("Analysis error:", error);
      try {
        await storage.updateManuscriptAnalysis(manuscriptId, null, "failed");
      } catch {}
      return res.status(500).json({ message: "Analysis failed. Please try again." });
    }
  });

  app.post("/api/manuscripts/:id/paper-type", isAuthenticated, async (req: any, res) => {
    try {
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript) {
        return res.status(404).json({ message: "Manuscript not found" });
      }
      const userId = req.user.claims.sub;
      if (manuscript.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { paperType } = req.body;
      const validTypes = ["quantitative_experimental", "observational", "qualitative", "systematic_review", "mixed_methods", "generic"];
      if (!paperType || !validTypes.includes(paperType)) {
        return res.status(400).json({ message: "Invalid paper type" });
      }
      const updated = await storage.updateManuscriptPaperType(manuscript.id, paperType);
      return res.json(updated);
    } catch (error) {
      console.error("Error updating paper type:", error);
      return res.status(500).json({ message: "Failed to update paper type" });
    }
  });

  app.post("/api/manuscripts/:id/auto-detect", isAuthenticated, async (req: any, res) => {
    try {
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript) {
        return res.status(404).json({ message: "Manuscript not found" });
      }
      const userId = req.user.claims.sub;
      if (manuscript.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const text = manuscript.fullText || manuscript.previewText || "";
      if (!text.trim()) {
        return res.status(400).json({ message: "No manuscript text available for detection" });
      }
      const result = autoDetectPaperType(text);
      return res.json(result);
    } catch (error) {
      console.error("Error detecting paper type:", error);
      return res.status(500).json({ message: "Failed to detect paper type" });
    }
  });

  app.get("/api/knowledge-base/paper-types", async (_req, res) => {
    try {
      const content = loadPaperTypesExplained();
      return res.json({ content });
    } catch (error) {
      console.error("Error loading paper types:", error);
      return res.status(500).json({ message: "Failed to load paper types" });
    }
  });

  app.get("/api/knowledge-base/writing-workflow", async (_req, res) => {
    try {
      const content = loadWritingWorkflow();
      return res.json({ content });
    } catch (error) {
      console.error("Error loading writing workflow:", error);
      return res.status(500).json({ message: "Failed to load writing workflow" });
    }
  });

  app.post("/api/manuscripts/:id/paste-text", isAuthenticated, async (req: any, res) => {
    try {
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript) {
        return res.status(404).json({ message: "Manuscript not found" });
      }
      const userId = req.user.claims.sub;
      if (manuscript.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { text } = req.body;
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({ message: "Text content is required" });
      }

      // Limit paste text to 500KB (~500,000 characters) to prevent abuse
      const MAX_PASTE_LENGTH = 500_000;
      if (text.length > MAX_PASTE_LENGTH) {
        return res.status(400).json({ message: `Text too large. Maximum ${MAX_PASTE_LENGTH.toLocaleString()} characters allowed.` });
      }

      const previewText = text.slice(0, 500).trim();
      await storage.updateManuscriptExtraction(manuscript.id, previewText, "completed", text);
      return res.json({ status: "completed", previewText });
    } catch (error) {
      console.error("Error pasting text:", error);
      return res.status(500).json({ message: "Failed to save pasted text" });
    }
  });

  return httpServer;
}

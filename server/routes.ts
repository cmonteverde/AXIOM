import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertManuscriptSchema, profileSetupSchema } from "@shared/schema";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerObjectStorageRoutes, ObjectStorageService } from "./replit_integrations/object_storage";
import OpenAI from "openai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  registerObjectStorageRoutes(app);

  app.post("/api/users/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = profileSetupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.message });
      }
      const user = await storage.updateUserProfile(userId, parsed.data);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(user);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
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
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/users/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteUser(userId);
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/manuscripts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const manuscriptList = await storage.getManuscriptsByUserId(userId);
      return res.json(manuscriptList);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/manuscripts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript) {
        return res.status(404).json({ message: "Manuscript not found" });
      }
      const userId = req.user.claims.sub;
      if (manuscript.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      return res.json(manuscript);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/manuscripts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertManuscriptSchema.safeParse({ ...req.body, userId });
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.message });
      }
      const manuscript = await storage.createManuscript(parsed.data);
      return res.json(manuscript);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
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
      } catch (extractError: any) {
        console.error("Extraction error:", extractError);
        await storage.updateManuscriptExtraction(manuscript.id, "", "failed");
        return res.json({ status: "failed", error: extractError.message });
      }
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/manuscripts/:id/analyze", isAuthenticated, async (req: any, res) => {
    try {
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript) {
        return res.status(404).json({ message: "Manuscript not found" });
      }
      const userId = req.user.claims.sub;
      if (manuscript.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const textToAnalyze = manuscript.fullText || manuscript.previewText;
      if (!textToAnalyze || textToAnalyze.trim().length === 0) {
        return res.status(400).json({ message: "No manuscript text available for analysis" });
      }

      const selectedHelpTypes: string[] = req.body?.helpTypes || manuscript.helpTypes || [];

      await storage.updateManuscriptAnalysis(manuscript.id, null, "processing");

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        await storage.updateManuscriptAnalysis(manuscript.id, null, "failed");
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }

      const openai = new OpenAI({ apiKey });

      const truncatedText = textToAnalyze.slice(0, 30000);

      const systemPrompt = `You are SAGE (Scholarly Assistant for Guided Excellence), an expert academic manuscript reviewer. You analyze manuscripts using the Universal Manuscript Architecture (UMA) framework.

## UMA KNOWLEDGE BASE

### PRE-TEXT ELEMENTS
**Title Selection**: Evaluate if the title follows claim-based or descriptive structure. Flag filler phrases like "Observations on," "An Investigation into."
**Strategic Keywords & SEO**: Check synonym mapping (no repeated title words), Quadrant Index coverage (Core Method, Subject/Population, Theoretical Framework, Geographic/Temporal Context).
**The Structured 5-Move Abstract**: Check for these 5 sentences:
1. The Hook: Broad significance of the research area
2. The Gap: The "Pain Point" - why current knowledge is insufficient
3. The Approach: High-level methodology and scale
4. The Findings: Concrete, quantified/qualified data (no vague "Significant results were found")
5. The Impact: The "So What" - how this shifts the field's trajectory

### STRUCTURAL CORE
**Introduction**: Check for (1) Global Context, (2) "However" Moment, (3) Resolution, (4) Roadmap with RQs/Hypotheses.
**Materials & Methods**: Assess replication detail ("Recipe Rule"), sampling justification, instrumentation specifics, ethics/transparency.
**Results**: Check Mirror Principle (follows RQ order), Objective Neutrality (no interpretation), significance reporting, stand-alone visuals.
**Discussion**: Check 4 moves: Interpretation, Comparison (5-10 key papers), Implication, Novelty resolution.
**Limitations**: Frame as generalizability boundaries, cover sample, methodological, contextual biases.
**Conclusions**: No repeated statistics, synthesize "New Reality," actionable recommendations, identify next research gap.

### ZERO-I PERSPECTIVE (CRITICAL CHECK)
Total removal of: I, we, our, us, my. Subject should be: "The Data," "The Study," "The Analysis," "The Framework."
Use passive for procedure ("Interviews were conducted") and active for findings ("The analysis reveals").

### WRITING STANDARDS
**Causal vs Descriptive**: Unless RCT, avoid "causes," "triggers," "proves." Use "is associated with," "suggests," "indicates."
**Tone & Precision**: Remove subjective modifiers ("crucial," "very," "important," "shocking"). Quantify claims.
**Technical Sweep**: Unit spaces, acronym definitions, reference hygiene, Oxford comma consistency.

## CRITICAL INSTRUCTIONS FOR COMPREHENSIVE ANALYSIS

You MUST provide exhaustive, section-by-section analysis. Do NOT summarize or abbreviate.

1. **detailedFeedback**: Provide feedback for EVERY section of the manuscript that is present (Title, Abstract, Introduction, Methods, Results, Discussion, Limitations, Conclusions, References, and any other sections). Each section should have MULTIPLE feedback items covering different aspects. Aim for at least 2-3 feedback items per section present in the manuscript, for a total of 15-30+ items.

2. **actionItems**: Provide specific, actionable tasks for EVERY issue found. Each action item should be concrete enough that the author knows exactly what to change. Aim for at least 15-25 action items covering all sections. Group by priority (high items first, then medium, then low).

3. **criticalIssues**: List ALL significant issues, not just the top 3. Include issues across every section.

4. **scoreBreakdown**: Provide scores for each category that contributes to the overall readiness score, so the user understands exactly how their score was calculated.

5. **learnLinks**: Provide at least 5-8 learning resources covering different UMA topics relevant to the manuscript's weaknesses.

## YOUR TASK
Analyze the manuscript and return a JSON object with this exact structure:

{
  "readinessScore": <number 0-100>,
  "summary": "<brief 2-3 sentence assessment>",
  "scoreBreakdown": {
    "titleAndKeywords": { "score": <0-100>, "maxWeight": 10, "notes": "<brief explanation>" },
    "abstract": { "score": <0-100>, "maxWeight": 15, "notes": "<brief explanation>" },
    "introduction": { "score": <0-100>, "maxWeight": 10, "notes": "<brief explanation>" },
    "methods": { "score": <0-100>, "maxWeight": 15, "notes": "<brief explanation>" },
    "results": { "score": <0-100>, "maxWeight": 15, "notes": "<brief explanation>" },
    "discussion": { "score": <0-100>, "maxWeight": 15, "notes": "<brief explanation>" },
    "writingQuality": { "score": <0-100>, "maxWeight": 10, "notes": "<brief explanation>" },
    "zeroIPerspective": { "score": <0-100>, "maxWeight": 10, "notes": "<brief explanation>" }
  },
  "criticalIssues": [
    {
      "title": "<issue title>",
      "description": "<what's wrong and where in the manuscript>",
      "severity": "high" | "medium" | "low",
      "umaReference": "<which UMA section this relates to>"
    }
  ],
  "detailedFeedback": [
    {
      "section": "<manuscript section name e.g. Title, Abstract, Introduction, Methods, Results, Discussion, Limitations, Conclusions, References>",
      "finding": "<specific observation with quotes from the text when possible>",
      "suggestion": "<specific, actionable improvement with example rewording when applicable>",
      "whyItMatters": "<explanation from UMA principles why this matters for publication>"
    }
  ],
  "actionItems": [
    {
      "task": "<specific, concrete fix to make - include the section and what exactly to change>",
      "priority": "high" | "medium" | "low",
      "section": "<which section this applies to>",
      "completed": false
    }
  ],
  "abstractAnalysis": {
    "hasHook": <boolean>,
    "hasGap": <boolean>,
    "hasApproach": <boolean>,
    "hasFindings": <boolean>,
    "hasImpact": <boolean>,
    "feedback": "<specific feedback on the 5-Move structure with suggestions for each missing move>"
  },
  "zeroIPerspective": {
    "compliant": <boolean>,
    "violations": ["<exact quoted instances of I/we/our/us/my with surrounding context>"],
    "feedback": "<detailed guidance on fixing each violation with suggested rewording>"
  },
  "learnLinks": [
    {
      "title": "<tutorial/resource title>",
      "description": "<what they'll learn and how it applies to their manuscript>",
      "topic": "<UMA topic area>"
    }
  ]
}

Be exhaustive, specific, constructive, and ground ALL feedback in UMA principles. Quote specific text from the manuscript whenever possible. The manuscript stage is: "${manuscript.stage}". The user requested help with: ${selectedHelpTypes.join(", ") || "all areas"}.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please provide a comprehensive, section-by-section analysis of this manuscript. Be exhaustive - cover every section present and provide multiple feedback items per section:\n\n${truncatedText}` },
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

      const readinessScore = analysisJson.readinessScore ?? null;
      await storage.updateManuscriptAnalysis(manuscript.id, analysisJson, "completed", readinessScore);

      return res.json({ status: "completed", analysis: analysisJson });
    } catch (error: any) {
      console.error("Analysis error:", error);
      try {
        await storage.updateManuscriptAnalysis(req.params.id, null, "failed");
      } catch {}
      return res.status(500).json({ message: error.message });
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

      const previewText = text.slice(0, 500).trim();
      await storage.updateManuscriptExtraction(manuscript.id, previewText, "completed", text);
      return res.json({ status: "completed", previewText });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}

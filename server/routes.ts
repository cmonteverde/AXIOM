import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { insertManuscriptSchema, profileSetupSchema } from "@shared/schema";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerObjectStorageRoutes, ObjectStorageService } from "./replit_integrations/object_storage";
import OpenAI from "openai";
import { buildAxiomSystemPrompt, LEARN_LINK_URLS } from "./axiom-prompt";
import { autoDetectPaperType, loadModulesForType, loadWritingWorkflow, loadPaperTypesExplained, getPaperTypeLabel, type PaperType } from "./module-loader";
import { rateLimit } from "./rate-limit";
import { validateAnalysisResponse } from "./analysis-validator";

/**
 * Smart truncation: instead of hard-cutting at a character limit,
 * detect section boundaries and keep proportional content from each section.
 * This ensures the AI sees the full structure of the manuscript.
 */
function smartTruncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;

  // Try to find major section headers (common patterns in academic papers)
  const sectionPattern = /\n\s*(abstract|introduction|background|literature review|methods|methodology|materials and methods|results|findings|discussion|conclusion|conclusions|limitations|references|acknowledgements|appendix|ethics|declarations?)\s*\n/gi;
  const sections: { name: string; start: number; end: number }[] = [];
  let match;

  while ((match = sectionPattern.exec(text)) !== null) {
    if (sections.length > 0) {
      sections[sections.length - 1].end = match.index;
    }
    sections.push({ name: match[1].toLowerCase(), start: match.index, end: text.length });
  }

  // If we can't detect sections, fall back to keeping beginning and end
  if (sections.length < 3) {
    const keepFromStart = Math.floor(maxChars * 0.7);
    const keepFromEnd = maxChars - keepFromStart - 100;
    return text.slice(0, keepFromStart) +
      "\n\n[... middle section truncated for length ...]\n\n" +
      text.slice(text.length - keepFromEnd);
  }

  // Allocate characters proportionally, but ensure minimum per section
  const minPerSection = Math.min(2000, Math.floor(maxChars / sections.length));
  const overhead = 200; // for truncation markers
  const available = maxChars - overhead;

  // References section gets less space, methods/results/discussion get more
  const priorityMultiplier: Record<string, number> = {
    abstract: 1.5, introduction: 1.2, methods: 1.5, methodology: 1.5,
    "materials and methods": 1.5, results: 1.5, findings: 1.5,
    discussion: 1.3, conclusion: 1.0, conclusions: 1.0,
    limitations: 1.2, references: 0.3, acknowledgements: 0.2,
  };

  const totalWeight = sections.reduce((sum, s) => {
    const sectionLen = s.end - s.start;
    return sum + sectionLen * (priorityMultiplier[s.name] || 1.0);
  }, 0);

  const parts: string[] = [];
  for (const section of sections) {
    const sectionText = text.slice(section.start, section.end);
    const weight = sectionText.length * (priorityMultiplier[section.name] || 1.0);
    const allocation = Math.max(minPerSection, Math.floor((weight / totalWeight) * available));

    if (sectionText.length <= allocation) {
      parts.push(sectionText);
    } else {
      parts.push(sectionText.slice(0, allocation) + "\n[... section truncated ...]");
    }
  }

  // Include any text before the first section (title, author info, etc.)
  const preSection = text.slice(0, sections[0].start);
  if (preSection.trim()) {
    return preSection.slice(0, 2000) + parts.join("");
  }

  return parts.join("");
}

/**
 * Build specific instructions based on user-selected focus areas.
 * This makes the AI spend more tokens on the areas the user cares about.
 */
function buildFocusInstructions(helpTypes: string[]): string {
  if (!helpTypes || helpTypes.length === 0 || helpTypes.includes("Comprehensive Review")) {
    return "AUDIT SCOPE: Comprehensive review — audit ALL sections with equal depth. Provide maximum feedback items across every area.";
  }

  const focusMap: Record<string, string> = {
    "Title": "Title evaluation (length, keywords, SEO, filler phrases, field norms)",
    "Abstract": "Abstract evaluation (Hyland Five-Move Model, word limits, structure, critical errors)",
    "Introduction": "Introduction structure (CARS Model, gap statement, literature review depth)",
    "Methods": "Methods reproducibility audit (study design, sample size, statistical plan, ethics, reporting guideline compliance)",
    "Results": "Results audit (statistical reporting, effect sizes, CIs, figure/table quality, negative results)",
    "Discussion": "Discussion evaluation (inverted pyramid, causal language, literature comparison, implications)",
    "Limitations": "Limitations audit (3-part structure, coverage of methodological/scope/generalizability issues)",
    "Conclusions & Recommendations": "Conclusions completeness and strength of evidence",
    "Keywords": "Keywords optimization (MeSH alignment, synonym mapping, controlled vocabularies)",
    "Structural Analysis": "Overall structural analysis (IMRAD compliance, section ordering, word count proportions)",
    "Language & Clarity": "Writing quality audit (voice/tense by section, precision, grammar, nominalization, jargon)",
    "Statistics": "Statistical reporting audit (APA 7th compliance, effect sizes, CIs, test selection, assumptions)",
    "Reference Management": "Reference audit (citation density, recency, self-citation, format, DOIs)",
    "Ethics": "Ethics and transparency audit (IRB, informed consent, COI, CRediT, data/code availability, AI disclosure)",
    "Cover Letter": "Cover letter evaluation (journal fit, key findings summary, suggested reviewers)",
    "Reviewer Response": "Reviewer response strategy (point-by-point structure, diplomatic tone, evidence-based rebuttals)",
    "Journal Selection": "Journal selection guidance (scope fit, impact factor, turnaround time, open access options)",
  };

  const focusAreas = helpTypes
    .map(t => focusMap[t])
    .filter(Boolean);

  if (focusAreas.length === 0) return "";

  return `AUDIT SCOPE: The user has specifically requested DEEP analysis of the following areas. Provide EXTRA detailed feedback for these:\n${focusAreas.map((a, i) => `${i + 1}. ${a}`).join("\n")}\n\nFor the selected focus areas, provide at minimum 3 feedback items per area with specific quotes from the manuscript. You should still briefly cover other sections, but allocate 70% of your analysis to the focus areas above.`;
}

/**
 * Calculate XP to award for a completed audit.
 */
function calculateAuditXP(textLength: number, helpTypes: string[], readinessScore: number | null): number {
  let xp = 100; // base XP per audit

  // Bonus for longer manuscripts (more effort to review)
  if (textLength > 20000) xp += 100;
  else if (textLength > 5000) xp += 50;

  // Bonus for comprehensive audit
  if (helpTypes.includes("Comprehensive Review") || helpTypes.length >= 5) {
    xp += 50;
  }

  // Bonus for high-quality manuscripts (scored well)
  if (readinessScore !== null && readinessScore >= 80) {
    xp += 25;
  }

  return xp;
}

/**
 * Update user streak based on last active date.
 * Returns the new streak value.
 */
function calculateStreak(lastActiveDate: string | null, currentStreak: number): { streak: number; dateStr: string } {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD

  if (!lastActiveDate) {
    return { streak: 1, dateStr };
  }

  if (lastActiveDate === dateStr) {
    // Already active today, no change
    return { streak: currentStreak, dateStr };
  }

  // Check if last active was yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (lastActiveDate === yesterdayStr) {
    return { streak: currentStreak + 1, dateStr };
  }

  // Streak broken — reset to 1
  return { streak: 1, dateStr };
}

/**
 * Determine user level from total XP.
 * Each level requires level * 1000 XP (matches frontend getLevelThreshold).
 */
function calculateLevel(totalXP: number): number {
  let level = 1;
  let threshold = 1000;
  while (totalXP >= threshold) {
    level++;
    threshold = level * 1000;
  }
  return level;
}

/**
 * Extract citations from manuscript text using common academic reference patterns.
 */
function extractCitations(text: string) {
  // Find in-text citations: (Author, Year), (Author et al., Year), [1], [1,2], [1-3]
  const parentheticalRefs = text.match(/\([A-Z][a-z]+(?:\s(?:et\s+al\.?|&\s+[A-Z][a-z]+))?,?\s*\d{4}[a-z]?\)/g) || [];
  const numericRefs = text.match(/\[\d+(?:[,\s-]+\d+)*\]/g) || [];
  const inTextCount = parentheticalRefs.length + numericRefs.length;

  // Try to find the references/bibliography section
  const refSectionMatch = text.match(/\n\s*(References|Bibliography|Works Cited|Literature Cited)\s*\n/i);
  const refSectionStart = refSectionMatch ? refSectionMatch.index! : -1;
  const refText = refSectionStart >= 0 ? text.slice(refSectionStart) : "";

  // Extract individual reference entries from the reference list
  const refEntries: { text: string; year: number | null; hasDoiOrUrl: boolean }[] = [];
  if (refText) {
    // Split by common patterns: numbered refs [1], or lines starting with author names
    const lines = refText.split(/\n/).filter(l => l.trim().length > 20);
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip the section header itself
      if (/^(References|Bibliography|Works Cited|Literature Cited)$/i.test(trimmed)) continue;
      // Skip lines that are clearly not references
      if (trimmed.length < 30) continue;

      const yearMatch = trimmed.match(/\b(19|20)\d{2}[a-z]?\b/);
      const year = yearMatch ? parseInt(yearMatch[0]) : null;
      const hasDoiOrUrl = /doi[:\s]|https?:\/\/|10\.\d{4,}/i.test(trimmed);

      refEntries.push({ text: trimmed.slice(0, 200), year, hasDoiOrUrl });
    }
  }

  // Analyze issues
  const issues: string[] = [];
  const currentYear = new Date().getFullYear();

  if (inTextCount === 0) {
    issues.push("No in-text citations detected. Ensure citations follow (Author, Year) or [Number] format.");
  }

  if (refEntries.length === 0 && refSectionStart < 0) {
    issues.push("No References section found. Add a clearly labeled 'References' section.");
  }

  if (refEntries.length > 0) {
    const withDoi = refEntries.filter(r => r.hasDoiOrUrl).length;
    const doiPercent = Math.round((withDoi / refEntries.length) * 100);
    if (doiPercent < 50) {
      issues.push(`Only ${doiPercent}% of references include DOIs or URLs. Adding DOIs improves verifiability.`);
    }

    const years = refEntries.map(r => r.year).filter((y): y is number => y !== null);
    if (years.length > 0) {
      const recentCount = years.filter(y => y >= currentYear - 5).length;
      const recentPercent = Math.round((recentCount / years.length) * 100);
      if (recentPercent < 30) {
        issues.push(`Only ${recentPercent}% of references are from the last 5 years. Consider adding more recent sources.`);
      }
      const oldestYear = Math.min(...years);
      const newestYear = Math.max(...years);
      if (newestYear < currentYear - 3) {
        issues.push(`Most recent reference is from ${newestYear}. Consider updating with more current literature.`);
      }
    }

    if (refEntries.length < 10) {
      issues.push(`Only ${refEntries.length} references found. Most journals expect 20-50 references for a full paper.`);
    }
  }

  // Check for self-citation issues (rough heuristic)
  const style = numericRefs.length > parentheticalRefs.length ? "numeric" : "author-year";

  return {
    inTextCitationCount: inTextCount,
    referenceCount: refEntries.length,
    citationStyle: style,
    hasReferenceSection: refSectionStart >= 0,
    references: refEntries.slice(0, 50), // cap at 50 for response size
    issues,
    stats: {
      withDoi: refEntries.filter(r => r.hasDoiOrUrl).length,
      recentFiveYears: refEntries.filter(r => r.year !== null && r.year >= currentYear - 5).length,
      oldestYear: refEntries.length > 0 ? Math.min(...refEntries.map(r => r.year).filter((y): y is number => y !== null)) : null,
      newestYear: refEntries.length > 0 ? Math.max(...refEntries.map(r => r.year).filter((y): y is number => y !== null)) : null,
    },
  };
}

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

  // Health check endpoint (no auth required)
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || "1.0.0",
    });
  });

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

  // Leaderboard: top users by XP
  app.get("/api/leaderboard", isAuthenticated, async (_req: any, res) => {
    try {
      const leaders = await storage.getLeaderboard(10);
      return res.json(leaders);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return res.status(500).json({ message: "Failed to fetch leaderboard" });
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

      // Fetch user profile for learning mode adaptation
      const user = await storage.getUser(userId);
      const learningMode = user?.learningMode || "adaptive";
      const researchLevel = user?.researchLevel || "postdoc";

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

      // Smart truncation: preserve all sections proportionally instead of hard cutoff
      const truncatedText = smartTruncate(textToAnalyze, 50000);

      const moduleData = loadModulesForType(paperType);
      const paperTypeLabel = getPaperTypeLabel(paperType);

      const systemPrompt = buildAxiomSystemPrompt(manuscript.stage || "draft", selectedHelpTypes, learningMode, researchLevel);
      const moduleContext = `\n\n--- LOADED MODULES: ${moduleData.files.join(", ")} ---\n--- PAPER TYPE: ${paperTypeLabel} ---\n\n${moduleData.content}`;

      // Build focus area instructions
      const focusInstructions = buildFocusInstructions(selectedHelpTypes);

      // Retry logic for OpenAI calls
      let content: string | null = null;
      let lastError: any = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt + moduleContext },
              { role: "user", content: `LOADED MODULE: ${moduleData.files.join(", ")}
PAPER TYPE: ${paperTypeLabel}
STAGE: ${manuscript.stage || "draft"}
MANUSCRIPT LENGTH: ${textToAnalyze.length} characters

${focusInstructions}

CRITICAL INSTRUCTIONS FOR THIS AUDIT:
1. ALL feedback MUST quote specific text from the manuscript using quotation marks in the "finding" field
2. The loaded module is MANDATORY — enforce EVERY applicable checklist item from that module
3. ${(manuscript.stage === "submitted" || manuscript.stage === "final") ? "This is a FINAL/SUBMITTED manuscript — flag ANYTHING not publication-ready as critical" : "This is a draft — distinguish between critical (desk-rejection risk) and minor (polish) issues"}
4. Minimum output: 20 detailed feedback items, 15 action items
5. Every critical issue MUST have a corresponding high-priority action item
6. For OBSERVATIONAL studies: Apply the causal language detection matrix. Flag ANY causal verbs (causes, increases, leads to, prevents) in non-RCT manuscripts
7. Check cross-references: Results must mirror Methods order. Discussion must address all Results. Abstract must reflect actual findings.

--- MANUSCRIPT TEXT ---
${truncatedText}` },
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
            max_tokens: 16000,
          });
          content = response.choices[0]?.message?.content ?? null;
          if (content) break;
        } catch (err: any) {
          lastError = err;
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
          }
        }
      }

      if (!content) {
        await storage.updateManuscriptAnalysis(manuscript.id, null, "failed");
        console.error("OpenAI failed after 3 attempts:", lastError);
        return res.status(500).json({ message: "Analysis failed after multiple attempts. Please try again." });
      }

      let analysisJson;
      try {
        analysisJson = JSON.parse(content);
      } catch {
        await storage.updateManuscriptAnalysis(manuscript.id, null, "failed");
        return res.status(500).json({ message: "Failed to parse AI response" });
      }

      // Validate and fill defaults for missing fields
      analysisJson = validateAnalysisResponse(analysisJson);

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

      // --- Audit History: save snapshot for version comparison ---
      try {
        await storage.addAuditHistory({
          manuscriptId: manuscript.id,
          readinessScore: readinessScore ?? 0,
          paperType: paperType,
          helpTypes: selectedHelpTypes,
          summary: analysisJson.executiveSummary || analysisJson.summary || "",
          criticalIssueCount: (analysisJson.criticalIssues || []).length,
          feedbackCount: (analysisJson.detailedFeedback || []).length,
          actionItemCount: (analysisJson.actionItems || []).length,
          scoreBreakdown: analysisJson.scoreBreakdown || null,
        });
      } catch (histErr) {
        console.error("Audit history save error:", histErr);
      }

      // --- Gamification: award XP, update streak, check level-up ---
      try {
        const xpEarned = calculateAuditXP(textToAnalyze.length, selectedHelpTypes, readinessScore);
        const currentUser = await storage.getUser(userId);
        if (currentUser) {
          const newTotalXP = (currentUser.xp ?? 0) + xpEarned;
          const newLevel = calculateLevel(newTotalXP);
          await storage.updateUserXP(userId, newTotalXP, newLevel);

          const { streak: newStreak, dateStr } = calculateStreak(
            currentUser.lastActiveDate,
            currentUser.streak ?? 0
          );
          await storage.updateUserStreak(userId, newStreak, dateStr);
        }
      } catch (gamErr) {
        // Gamification errors should never block the analysis response
        console.error("Gamification update error:", gamErr);
      }

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
      const validTypes = ["quantitative_experimental", "observational", "qualitative", "systematic_review", "mixed_methods", "case_report", "generic"];
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

  // Citation extraction and analysis
  app.post("/api/manuscripts/:id/citations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript || manuscript.userId !== userId) {
        return res.status(404).json({ message: "Manuscript not found" });
      }

      const text = manuscript.fullText || manuscript.previewText || "";
      if (!text) {
        return res.status(400).json({ message: "No manuscript text available" });
      }

      const citations = extractCitations(text);
      return res.json(citations);
    } catch (error) {
      console.error("Citation extraction error:", error);
      return res.status(500).json({ message: "Failed to extract citations" });
    }
  });

  // ── Reviewer Response Table ──

  // Get reviewer comments for a manuscript
  app.get("/api/manuscripts/:id/reviewer-comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript || manuscript.userId !== userId) {
        return res.status(404).json({ message: "Manuscript not found" });
      }
      const comments = await storage.getReviewerComments(req.params.id);
      return res.json(comments);
    } catch (error) {
      console.error("Error fetching reviewer comments:", error);
      return res.status(500).json({ message: "Failed to fetch reviewer comments" });
    }
  });

  // Upload reviewer comments (parse pasted text into individual comments)
  app.post("/api/manuscripts/:id/reviewer-comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript || manuscript.userId !== userId) {
        return res.status(404).json({ message: "Manuscript not found" });
      }

      const { comments } = req.body;
      if (!Array.isArray(comments) || comments.length === 0) {
        return res.status(400).json({ message: "Comments array is required" });
      }

      // Clear old comments if re-uploading
      await storage.deleteReviewerComments(req.params.id);
      const saved = await storage.addReviewerComments(req.params.id, comments.filter((c: string) => c.trim()));
      return res.json(saved);
    } catch (error) {
      console.error("Error saving reviewer comments:", error);
      return res.status(500).json({ message: "Failed to save reviewer comments" });
    }
  });

  // Update a single reviewer comment (response, change, status)
  app.patch("/api/reviewer-comments/:commentId", isAuthenticated, async (req: any, res) => {
    try {
      const { response, changeMade, status } = req.body;
      const updated = await storage.updateReviewerComment(req.params.commentId, { response, changeMade, status });
      if (!updated) {
        return res.status(404).json({ message: "Comment not found" });
      }
      return res.json(updated);
    } catch (error) {
      console.error("Error updating reviewer comment:", error);
      return res.status(500).json({ message: "Failed to update comment" });
    }
  });

  // AI-draft responses to all reviewer comments
  app.post("/api/manuscripts/:id/reviewer-comments/draft", isAuthenticated, analyzeLimiter, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript || manuscript.userId !== userId) {
        return res.status(404).json({ message: "Manuscript not found" });
      }

      const comments = await storage.getReviewerComments(req.params.id);
      if (comments.length === 0) {
        return res.status(400).json({ message: "No reviewer comments to respond to" });
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }

      const openai = new OpenAI({ apiKey });
      const manuscriptSnippet = smartTruncate(manuscript.fullText || manuscript.previewText || "", 15000);
      const analysisContext = manuscript.analysisJson
        ? `\nAudit summary: ${(manuscript.analysisJson as any).executiveSummary || (manuscript.analysisJson as any).summary || ""}`
        : "";

      const commentList = comments.map((c, i) => `Comment ${i + 1}: ${c.comment}`).join("\n\n");

      const systemPrompt = `You are an expert academic writing assistant helping a researcher respond to peer reviewer comments.

For EACH reviewer comment, provide:
1. "response" - A diplomatic, evidence-based response to the reviewer (professional tone, acknowledging the point, explaining what you did or will do)
2. "changeMade" - A specific description of what was or should be changed in the manuscript (e.g., "Added statistical power analysis to Section 2.3" or "Revised Discussion paragraph 4 to address limitations")

Guidelines:
- Be respectful and grateful to reviewers
- When the reviewer is correct, acknowledge it clearly
- When you disagree, do so diplomatically with evidence
- Reference specific manuscript sections where changes were/should be made
- Suggest concrete text additions or revisions when possible`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is the manuscript (truncated):\n\n${manuscriptSnippet}\n${analysisContext}\n\nHere are the reviewer comments to respond to:\n\n${commentList}\n\nProvide a JSON array with one object per comment, each having "index" (0-based), "response", and "changeMade" fields.` },
        ],
        temperature: 0.4,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      let drafts: Array<{ index: number; response: string; changeMade: string }>;
      try {
        const parsed = JSON.parse(content);
        drafts = Array.isArray(parsed) ? parsed : parsed.responses || parsed.drafts || parsed.comments || [];
      } catch {
        return res.status(500).json({ message: "Failed to parse AI response" });
      }

      // Save drafted responses back to DB
      for (const draft of drafts) {
        const comment = comments[draft.index];
        if (comment) {
          await storage.updateReviewerComment(comment.id, {
            response: draft.response,
            changeMade: draft.changeMade,
            status: "drafted",
          });
        }
      }

      const updated = await storage.getReviewerComments(req.params.id);
      return res.json(updated);
    } catch (error) {
      console.error("Reviewer draft error:", error);
      return res.status(500).json({ message: "Failed to draft reviewer responses" });
    }
  });

  // ── Cover Letter Generator ──

  app.post("/api/manuscripts/:id/cover-letter", isAuthenticated, analyzeLimiter, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript || manuscript.userId !== userId) {
        return res.status(404).json({ message: "Manuscript not found" });
      }
      if (!manuscript.analysisJson) {
        return res.status(400).json({ message: "Run an audit first to generate a cover letter" });
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }

      const openai = new OpenAI({ apiKey });
      const analysis = manuscript.analysisJson as any;
      const manuscriptSnippet = smartTruncate(manuscript.fullText || manuscript.previewText || "", 10000);
      const { journalName } = req.body || {};

      const systemPrompt = `You are an expert academic cover letter writer. Generate a professional cover letter for a journal editor based on the manuscript audit results.

The cover letter must include:
1. A clear statement of the manuscript title and type
2. Key findings and their significance
3. Why this manuscript is a good fit for the journal (if a journal name is provided)
4. Confirmation of ethical standards and originality
5. Author willingness to address reviewer feedback

Keep the tone professional, concise, and compelling. The letter should be 3-5 paragraphs.
Do NOT include placeholder brackets like [Your Name] — leave those as blank lines the author fills in.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Manuscript title: ${manuscript.title || manuscript.fileName || "Untitled"}
Paper type: ${analysis.paperTypeLabel || manuscript.paperType || "Research Article"}
Classification: ${analysis.documentClassification?.discipline || "Not specified"}, ${analysis.documentClassification?.manuscriptType || ""}
Study design: ${analysis.documentClassification?.studyDesign || "Not specified"}
Audit score: ${analysis.readinessScore}/100
Key strengths: ${(analysis.strengthsToMaintain || []).join("; ")}
Executive summary: ${analysis.executiveSummary || analysis.summary || ""}
${journalName ? `Target journal: ${journalName}` : "No specific journal targeted yet."}

Manuscript excerpt:
${manuscriptSnippet.slice(0, 5000)}` },
        ],
        temperature: 0.5,
      });

      const letter = response.choices[0]?.message?.content || "";
      return res.json({ coverLetter: letter });
    } catch (error) {
      console.error("Cover letter error:", error);
      return res.status(500).json({ message: "Failed to generate cover letter" });
    }
  });

  // ── Journal Selection Tool ──

  app.post("/api/manuscripts/:id/journal-suggestions", isAuthenticated, analyzeLimiter, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript || manuscript.userId !== userId) {
        return res.status(404).json({ message: "Manuscript not found" });
      }
      if (!manuscript.analysisJson) {
        return res.status(400).json({ message: "Run an audit first to get journal suggestions" });
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }

      const openai = new OpenAI({ apiKey });
      const analysis = manuscript.analysisJson as any;
      const manuscriptSnippet = smartTruncate(manuscript.fullText || manuscript.previewText || "", 8000);

      const systemPrompt = `You are an expert academic publishing advisor. Based on the manuscript details, suggest 5-8 target journals ranked by fit.

For each journal, provide:
- "name": Full journal name
- "publisher": Publisher name
- "fitScore": 1-10 score for how well the manuscript fits
- "impactFactor": Approximate impact factor (or "N/A")
- "openAccess": true/false
- "turnaroundWeeks": Typical review turnaround in weeks (estimate)
- "reasoning": 1-2 sentence explanation of why this journal is a good fit
- "tier": "reach" (ambitious), "target" (good fit), or "safety" (likely acceptance)

Consider: discipline, study design, methodology rigor, manuscript quality score, and scope alignment.
Return a JSON object with a "journals" array.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Manuscript title: ${manuscript.title || manuscript.fileName || "Untitled"}
Paper type: ${analysis.paperTypeLabel || manuscript.paperType}
Discipline: ${analysis.documentClassification?.discipline || "Not specified"}
Manuscript type: ${analysis.documentClassification?.manuscriptType || "Research Article"}
Study design: ${analysis.documentClassification?.studyDesign || "Not specified"}
Reporting guideline: ${analysis.documentClassification?.reportingGuideline || "N/A"}
Audit score: ${analysis.readinessScore}/100
Key strengths: ${(analysis.strengthsToMaintain || []).join("; ")}
Summary: ${analysis.executiveSummary || analysis.summary || ""}

Manuscript excerpt:
${manuscriptSnippet.slice(0, 4000)}` },
        ],
        temperature: 0.4,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      try {
        const parsed = JSON.parse(content);
        return res.json({ journals: parsed.journals || [] });
      } catch {
        return res.status(500).json({ message: "Failed to parse journal suggestions" });
      }
    } catch (error) {
      console.error("Journal suggestion error:", error);
      return res.status(500).json({ message: "Failed to get journal suggestions" });
    }
  });

  // Generate a share link for a manuscript's audit report
  app.post("/api/manuscripts/:id/share", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript || manuscript.userId !== userId) {
        return res.status(404).json({ message: "Manuscript not found" });
      }
      if (!manuscript.analysisJson) {
        return res.status(400).json({ message: "Run an audit first before sharing." });
      }

      const token = crypto.randomBytes(32).toString("hex");
      await storage.updateManuscriptShareToken(req.params.id, token);
      return res.json({ shareToken: token });
    } catch (error) {
      console.error("Share link error:", error);
      return res.status(500).json({ message: "Failed to generate share link" });
    }
  });

  // Revoke a share link
  app.delete("/api/manuscripts/:id/share", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript || manuscript.userId !== userId) {
        return res.status(404).json({ message: "Manuscript not found" });
      }

      await storage.updateManuscriptShareToken(req.params.id, null);
      return res.json({ success: true });
    } catch (error) {
      console.error("Revoke share error:", error);
      return res.status(500).json({ message: "Failed to revoke share link" });
    }
  });

  // View a shared report (public, no auth required)
  app.get("/api/shared/:token", async (req, res) => {
    try {
      const manuscript = await storage.getManuscriptByShareToken(req.params.token);
      if (!manuscript || !manuscript.shareToken) {
        return res.status(404).json({ message: "Shared report not found" });
      }

      // Return only the audit data, not the full manuscript text
      const analysis = manuscript.analysisJson as any;
      return res.json({
        title: manuscript.title || manuscript.fileName || "Untitled",
        paperType: manuscript.paperType,
        readinessScore: manuscript.readinessScore,
        analysisStatus: manuscript.analysisStatus,
        analysis: analysis ? {
          readinessScore: analysis.readinessScore,
          executiveSummary: analysis.executiveSummary || analysis.summary,
          scoreBreakdown: analysis.scoreBreakdown,
          criticalIssues: analysis.criticalIssues,
          detailedFeedback: analysis.detailedFeedback,
          actionItems: analysis.actionItems,
          strengthsToMaintain: analysis.strengthsToMaintain,
          paperTypeLabel: analysis.paperTypeLabel,
          documentClassification: analysis.documentClassification,
        } : null,
        createdAt: manuscript.createdAt,
      });
    } catch (error) {
      console.error("Shared report error:", error);
      return res.status(500).json({ message: "Failed to load shared report" });
    }
  });

  // Chat about audit results
  app.post("/api/manuscripts/:id/chat", isAuthenticated, analyzeLimiter, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript || manuscript.userId !== userId) {
        return res.status(404).json({ message: "Manuscript not found" });
      }
      if (!manuscript.analysisJson) {
        return res.status(400).json({ message: "Run an audit first before asking questions." });
      }

      const { message, history: chatHistory } = req.body;
      if (!message || typeof message !== "string" || message.trim().length === 0) {
        return res.status(400).json({ message: "Message is required" });
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }

      const analysis = manuscript.analysisJson as any;
      const auditContext = JSON.stringify({
        readinessScore: analysis.readinessScore,
        executiveSummary: analysis.executiveSummary,
        criticalIssues: analysis.criticalIssues?.slice(0, 5),
        detailedFeedback: analysis.detailedFeedback?.slice(0, 10),
        actionItems: analysis.actionItems?.slice(0, 10),
        strengthsToMaintain: analysis.strengthsToMaintain,
      });

      const openai = new OpenAI({ apiKey });
      const messages: any[] = [
        {
          role: "system",
          content: `You are AXIOM's research writing assistant. The user is asking questions about their manuscript audit results. Be concise, specific, and actionable. Reference specific findings from the audit when relevant.

Here is the audit context:
${auditContext}

Manuscript title: ${manuscript.title || "Untitled"}
Paper type: ${manuscript.paperType || "generic"}

Guidelines:
- Keep answers concise (2-4 paragraphs max)
- Reference specific audit findings when relevant
- Provide actionable, concrete suggestions
- Use academic writing conventions`,
        },
      ];

      // Include recent chat history for context (max 6 messages)
      if (Array.isArray(chatHistory)) {
        for (const msg of chatHistory.slice(-6)) {
          if (msg.role === "user" || msg.role === "assistant") {
            messages.push({ role: msg.role, content: String(msg.content).slice(0, 1000) });
          }
        }
      }

      messages.push({ role: "user", content: message.slice(0, 2000) });

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 1000,
        temperature: 0.4,
      });

      const reply = response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
      return res.json({ reply });
    } catch (error: any) {
      console.error("Chat error:", error);
      return res.status(500).json({ message: "Chat failed. Please try again." });
    }
  });

  // Audit history endpoint
  app.get("/api/manuscripts/:id/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript || manuscript.userId !== userId) {
        return res.status(404).json({ message: "Manuscript not found" });
      }
      const history = await storage.getAuditHistory(req.params.id);
      return res.json(history);
    } catch (error) {
      console.error("Error fetching audit history:", error);
      return res.status(500).json({ message: "Failed to fetch audit history" });
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

  // Update action item completion state
  app.patch("/api/manuscripts/:id/action-items", isAuthenticated, async (req: any, res) => {
    try {
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript) {
        return res.status(404).json({ message: "Manuscript not found" });
      }
      const userId = req.user.claims.sub;
      if (manuscript.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { completedIndices } = req.body;
      if (!Array.isArray(completedIndices) || !completedIndices.every((i: any) => typeof i === "number" && i >= 0)) {
        return res.status(400).json({ message: "Invalid completedIndices array" });
      }
      const updated = await storage.updateManuscriptActionItems(manuscript.id, completedIndices);
      return res.json(updated);
    } catch (error) {
      console.error("Error updating action items:", error);
      return res.status(500).json({ message: "Failed to update action items" });
    }
  });

  // Update manuscript stage
  app.patch("/api/manuscripts/:id/stage", isAuthenticated, async (req: any, res) => {
    try {
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript) {
        return res.status(404).json({ message: "Manuscript not found" });
      }
      const userId = req.user.claims.sub;
      if (manuscript.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { stage } = req.body;
      const validStages = ["draft", "revision", "final", "submitted", "published"];
      if (!stage || !validStages.includes(stage)) {
        return res.status(400).json({ message: "Invalid stage. Must be one of: " + validStages.join(", ") });
      }
      const updated = await storage.updateManuscriptStage(manuscript.id, stage);
      return res.json(updated);
    } catch (error) {
      console.error("Error updating stage:", error);
      return res.status(500).json({ message: "Failed to update stage" });
    }
  });

  // Update manuscript text (re-upload revised text)
  app.patch("/api/manuscripts/:id/text", isAuthenticated, async (req: any, res) => {
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
      const MAX_PASTE_LENGTH = 500_000;
      if (text.length > MAX_PASTE_LENGTH) {
        return res.status(400).json({ message: `Text too large. Maximum ${MAX_PASTE_LENGTH.toLocaleString()} characters allowed.` });
      }
      const previewText = text.slice(0, 500).trim();
      await storage.updateManuscriptExtraction(manuscript.id, previewText, "completed", text);
      return res.json({ status: "completed", previewText });
    } catch (error) {
      console.error("Error updating manuscript text:", error);
      return res.status(500).json({ message: "Failed to update manuscript text" });
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

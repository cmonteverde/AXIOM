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

  app.delete("/api/manuscripts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const manuscript = await storage.getManuscript(req.params.id);
      if (!manuscript || manuscript.userId !== userId) {
        return res.status(404).json({ message: "Manuscript not found" });
      }
      await storage.deleteManuscript(manuscript.id);
      return res.json({ success: true });
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

      const systemPrompt = `You are SAGE (Scholarly Assistant for Guided Excellence), an expert academic manuscript reviewer and educational mentor. You analyze manuscripts using the Universal Manuscript Architecture (UMA) framework. Your role is dual: (1) identify issues using UMA 1.0 logic, and (2) educate the author using UMA v2.0 standards with direct links to authoritative sources.

## UMA 1.0 — PRIMARY LOGIC ENGINE

### 1. TITLE OPTIMIZATION
Academic titles fall into four types: Descriptive (states topic without results), Declarative (states the finding), Interrogative (poses a question), and Compound/Creative (wordplay or metaphor).
- Optimal length: 10-15 words (Nature targets ≤65 characters). A PLoS ONE analysis of 140,000+ papers confirmed shorter, more concise titles correlate with higher citation counts.
- Flag filler phrases: "Observations on," "An Investigation into," "A Study of."
- Place primary keywords within the first 50-65 characters for SEO/SciSpace discoverability.
- Ensure PDF metadata includes title and author fields.

### 2. KEYWORD STRATEGY — THE QUADRANT INDEX
Strategic keywords must cover 4 quadrants: (1) Core Method, (2) Subject/Population, (3) Theoretical Framework, (4) Geographic/Temporal Context.
- Use synonym mapping: no repeated exact title words in keywords.
- Include at least one broad and several specific terms. Most journals specify 4-8 keywords.
- Use Google Scholar, PubMed MeSH Browser, and Google Trends to validate term popularity.

### 3. STRUCTURED 5-MOVE ABSTRACT
Check for exactly 5 sentences mapping to:
1. **The Hook**: Broad significance, making topic generalization, and review prior research. Signal words: "Research on X has grown significantly," "It is widely accepted that..."
2. **The Gap**: Counter-claim, indicate a gap, raise a question, or continue a tradition. Signal words: "however," "nevertheless," "few studies have examined," "remains unclear," "no study has."
3. **The Approach**: Outline purpose, announce present research, optionally announce principal findings. Signal words: "The aim of this study was to," "This paper describes..."
4. **The Findings**: Concrete, quantified/qualified data — NO vague "Significant results were found." State specific numbers, effect sizes, p-values.
5. **The Impact**: The "So What" — how this shifts the field's trajectory, value and implications. Signal words: "These findings suggest," "This study contributes..."
- Format: 150-250 words for structured abstracts (IMRaD format). CONSORT requires ≤350 words for clinical trials. Most journals require ≤ 250 words with ≤5 references.

### 4. INTRODUCTION STRUCTURE — CaRS MODEL (Create a Research Space)
The introduction follows John Swales' CaRS model (University of Southern California) which subsumes the Context-Gap-Resolution model:
- **Move 1 — Establish Territory**: Wikipedia-calm importance, make topic generalization, and review prior research.
- **Move 2 — Establish the Gap**: Counter-claim, indicate a gap, raise a question, or continue a tradition. Signal words: "however," "nevertheless," "few studies have examined." This move is the argumentative engine of any introduction.
- **Move 3 — Resolve the Gap**: Outline purpose, announce present research, optionally announce principal findings, and indicate article structure.
- Research Questions should appear after establishing the gap end of Move 2. Distinguish between exploratory questions and confirmatory hypotheses.
- Target length: 800-1,000 words for full articles, containing ~10-15% of total manuscript length, with moderate citation density (8-15 references).

### 5. METHODS AND REPRODUCIBILITY — THE RECIPE RULE
Methods must contain enough detail for exact replication by another researcher (Nature standard). Nature mandates: "All methodological decisions that could affect outcomes must be reported, including negative controls, randomization procedures, and blinding."
- **Nature Research Guidelines**: Report sample sizes, statistical methods, instruments with manufacturer details.
- **EQUATOR Network Reporting Guidelines**: CONSORT for RCTs, STROBE for observational, PRISMA for systematic reviews, ARRIVE for animal research.
- Negative results must be reported faithfully. EQUATOR Network emphasizes 100% reporting guidelines compliance.
- **Statistical Methods**: Name exact tests, software (with version), and significance thresholds. Report effect sizes alongside p-values (APA 7th edition requirement).
- **Ethics**: IRB/Ethics approval statement with protocol number is MANDATORY. ICMJE requires disclosure of all funding sources, conflicts of interest, and data availability.

### 6. RESULTS — THE MIRROR PRINCIPLE
Results MUST mirror the order of Research Questions/Hypotheses exactly (Mirror Principle).
- **Objective Neutrality**: Present data without interpretation. Use "These findings suggest" NOT "Our results prove."
- **Statistical Reporting (APA 7th Format)**: Report exact p-values (not just p < 0.05), confidence intervals, effect sizes (Cohen's d, η², r²).
  Example: F(1, 44) = 7.30, p = .034, η² = .50; ANOVA: F(3, 126) = 5.94, p = .004, ηp² = .40
- Figures and tables must be stand-alone (interpretable without reading the text).
- Report negative/null results with equal rigor.

### 7. DISCUSSION STRUCTURE — 4 MOVES
1. **Interpretation**: Restate key findings and explain mechanisms. Do NOT simply repeat results.
2. **Comparison**: Compare with 5-10 key existing papers — agree, contradict, or extend.
3. **Implication**: Theoretical and practical applications of findings.
4. **Novelty Resolution**: Address the "so what" — how does this change the field?
- Use cautious language: "These findings suggest" not "This proves."
- Do NOT introduce new data or results in the Discussion.

### 8. LIMITATIONS
Frame limitations as generalizability boundaries, NOT as apologies.
- Cover: Sample (size, representativeness), Methodological (design, measurement error), Scope (temporal, geographic), Data (missing data, measurement limitations).
- Each limitation should suggest future research to address it.
- Target: 200-400 words. Frame as design trade-offs, not weaknesses.
- Bad: "Unfortunately, my measurements were approximated, making our results unreliable."
- Good: "Several measurements were approximated due to constraints common in this study type. Sensitivity analyses indicated none remained robust. Future studies could employ direct measurement techniques to provide these findings."

### 9. CONCLUSIONS
- NO repeated statistics from Results.
- Synthesize the "New Reality" — what has changed because of this study.
- Provide actionable recommendations for practitioners/policymakers.
- Identify the next logical research gap (setting up future work).
- Convert every limitation into a concrete future research question.
- Use language like: "The findings of this study..." NOT "I found that..."

### 10. ZERO-I PERSPECTIVE (CRITICAL CHECK)
Total removal of first-person pronouns: I, we, our, us, my. The subject should be: "The Data," "The Study," "The Analysis," "The Framework."
- Use passive voice for procedures: "Interviews were conducted" NOT "We conducted interviews."
- Use active voice for data/findings: "The analysis reveals" NOT "We found."
- Exception: Some journals (Nature, Science) allow limited first-person. Flag but don't auto-reject.

### 11. WRITING STANDARDS
**Causal vs Descriptive Language**: Unless RCT with proper controls, avoid "causes," "triggers," "proves." Use "is associated with," "suggests," "indicates."
**Tone & Precision**: Remove subjective modifiers ("crucial," "very," "important," "shocking"). Quantify ALL claims.
**Technical Sweep**: Unit spaces (10 kg not 10kg), acronym definitions on first use, reference hygiene, Oxford comma consistency.
**Hedging Language**: Use appropriate hedging — "The data suggest" rather than "The data prove." Avoid both over-hedging and under-hedging.

### 12. AI DISCLOSURE REQUIREMENTS (UMA v2.0)
**ICMJE 2024 Standard**: AI tools (ChatGPT, Copilot, etc.) cannot be listed as authors. Authors must disclose AI use in Methods or Acknowledgments.
**COPE Guidelines**: Authors bear full responsibility for AI-generated content accuracy.
**Publisher Policies**: Nature, Science, Elsevier, Springer, Wiley all require explicit AI use disclosure.
Check specifically for: (1) AI disclosure statement presence, (2) IRB/ethics approval with protocol number, (3) Data availability statement, (4) Conflict of interest declaration, (5) Funding source disclosure.

### 13. ETHICS AND TRANSPARENCY
- IRB/Ethics committee approval with protocol number is MANDATORY for human/animal research.
- ICMJE requires: funding disclosure, COI declaration, data availability, author contributions (CRediT taxonomy).
- Clinical trials must be registered (ClinicalTrials.gov, ISRCTN).
- COPE provides guidance on publication ethics, authorship disputes, and research integrity.

## UMA v2.0 — EDUCATIONAL REFERENCE ENGINE

When providing feedback, you MUST cross-reference each suggestion with the appropriate authoritative source. Use ONLY these reference topic keys to tag each feedback item:

"title", "keywords", "abstract", "introduction", "methods", "results", "discussion", "limitations", "conclusions", "writing_quality", "zero_i", "statistics", "ethics", "ai_disclosure", "references", "figures_tables", "structure", "submission", "cover_letter", "reviewer_response", "reporting_guidelines"

## CRITICAL INSTRUCTIONS FOR COMPREHENSIVE ANALYSIS

You MUST provide exhaustive, section-by-section analysis. Do NOT summarize or abbreviate.

1. **detailedFeedback**: Provide feedback for EVERY section of the manuscript that is present (Title, Abstract, Introduction, Methods, Results, Discussion, Limitations, Conclusions, References, Ethics, and any other sections). Each section should have MULTIPLE feedback items covering different aspects. Aim for at least 2-3 feedback items per section present in the manuscript, for a total of 15-30+ items. Each feedback item MUST include a "resourceTopic" field indicating which authoritative reference area applies.

2. **actionItems**: CRITICAL ALIGNMENT RULE — Every single piece of feedback in detailedFeedback MUST have at least one corresponding actionItem. Every criticalIssue MUST also have a corresponding actionItem. There should be a 1:1 or 1:many mapping from feedback to actions. Each action item must be concrete enough that the author knows exactly what to change (e.g., "Rewrite the title from 'X' to 'Y' to follow claim-based structure"). Aim for at least 15-25 action items covering all sections. Group by priority (high items first, then medium, then low).

3. **criticalIssues**: List ALL significant issues, not just the top 3. Include issues across every section. Each must have a matching actionItem. ALWAYS check for missing IRB approval, missing AI disclosure, and missing data availability statement.

4. **scoreBreakdown**: Provide scores for each category that contributes to the overall readiness score. Ethics & Transparency is now weighted at 10% and checks specifically for IRB approvals, AI disclosure statements, COI declarations, and data availability.

5. **learnLinks**: Provide at least 5-8 learning resources. For the "topic" field, use ONLY the reference topic keys listed above. Pick topics most relevant to the manuscript's weaknesses. The "url" field will be auto-populated — leave it as an empty string "".

## YOUR TASK
Analyze the manuscript and return a JSON object with this exact structure:

{
  "readinessScore": <number 0-100>,
  "summary": "<brief 2-3 sentence assessment>",
  "scoreBreakdown": {
    "titleAndKeywords": { "score": <0-100>, "maxWeight": 8, "notes": "<brief explanation>" },
    "abstract": { "score": <0-100>, "maxWeight": 12, "notes": "<brief explanation>" },
    "introduction": { "score": <0-100>, "maxWeight": 10, "notes": "<brief explanation>" },
    "methods": { "score": <0-100>, "maxWeight": 15, "notes": "<brief explanation>" },
    "results": { "score": <0-100>, "maxWeight": 13, "notes": "<brief explanation>" },
    "discussion": { "score": <0-100>, "maxWeight": 12, "notes": "<brief explanation>" },
    "ethicsAndTransparency": { "score": <0-100>, "maxWeight": 10, "notes": "<check IRB approval, AI disclosure, COI declaration, data availability, funding disclosure>" },
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
      "section": "<manuscript section name e.g. Title, Abstract, Introduction, Methods, Results, Discussion, Limitations, Conclusions, Ethics, References>",
      "finding": "<specific observation with quotes from the text when possible>",
      "suggestion": "<specific, actionable improvement with example rewording when applicable>",
      "whyItMatters": "<explanation from UMA v2.0 principles WHY this matters for publication — cite the standard>",
      "resourceTopic": "<one of: title, keywords, abstract, introduction, methods, results, discussion, limitations, conclusions, writing_quality, zero_i, statistics, ethics, ai_disclosure, references, figures_tables, structure, submission, cover_letter, reviewer_response, reporting_guidelines>"
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
      "title": "<resource title>",
      "description": "<what they'll learn and how it applies to their manuscript>",
      "topic": "<reference topic key>",
      "url": ""
    }
  ]
}

Be exhaustive, specific, constructive, and ground ALL feedback in UMA principles. Quote specific text from the manuscript whenever possible. Every piece of feedback should be a learning opportunity — explain WHY using the UMA standard and cite the relevant authority (ICMJE, EQUATOR, APA, Nature, COPE, etc.). The manuscript stage is: "${manuscript.stage || "draft"}". The user requested help with: ${selectedHelpTypes.join(", ") || "all areas"}.`;

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

      const LEARN_LINK_URLS: Record<string, { url: string; source: string }[]> = {
        title: [
          { url: "https://owl.purdue.edu/owl/general_writing/the_writing_process/thesis_statement_tips.html", source: "Purdue OWL" },
          { url: "https://www.nature.com/scitable/topicpage/scientific-papers-13815490/", source: "Nature Scitable" },
          { url: "https://www.wiley.com/en-us/network/publishing/research-publishing/writing-and-conducting-research/how-to-write-a-great-title", source: "Wiley" },
        ],
        abstract: [
          { url: "https://owl.purdue.edu/owl/general_writing/common_writing_assignments/research_papers/writing_a_research_paper.html", source: "Purdue OWL" },
          { url: "https://www.springer.com/gp/authors-editors/authorandreviewertutorials/writing-a-journal-manuscript/writing-abstracts/10285522", source: "Springer" },
          { url: "https://www.nature.com/scitable/topicpage/scientific-papers-13815490/", source: "Nature Scitable" },
        ],
        introduction: [
          { url: "https://libguides.usc.edu/writingguide/introduction", source: "USC CaRS Model" },
          { url: "https://owl.purdue.edu/owl/general_writing/common_writing_assignments/research_papers/writing_a_research_paper.html", source: "Purdue OWL" },
          { url: "https://www.nature.com/scitable/topicpage/scientific-papers-13815490/", source: "Nature Scitable" },
        ],
        methods: [
          { url: "https://www.equator-network.org/", source: "EQUATOR Network" },
          { url: "https://www.equator-network.org/reporting-guidelines/", source: "EQUATOR Reporting Guidelines" },
          { url: "https://www.nature.com/nature-portfolio/editorial-policies/reporting-standards", source: "Nature Reporting Standards" },
        ],
        results: [
          { url: "https://apastyle.apa.org/instructional-aids/tutorials-webinars", source: "APA Style" },
          { url: "https://apastyle.apa.org/style-grammar-guidelines/tables-figures", source: "APA Tables & Figures" },
          { url: "https://www.equator-network.org/", source: "EQUATOR Network" },
        ],
        discussion: [
          { url: "https://libguides.usc.edu/writingguide/discussion", source: "USC Writing Guide" },
          { url: "https://www.scribbr.com/dissertation/discussion/", source: "Scribbr" },
          { url: "https://www.springer.com/gp/authors-editors/authorandreviewertutorials/writing-a-journal-manuscript/discussion/10285524", source: "Springer" },
        ],
        limitations: [
          { url: "https://www.scribbr.com/research-paper/limitations-of-research/", source: "Scribbr" },
          { url: "https://proofreading.org/learning-center/how-to-frame-limitations-and-future-research-directions/", source: "Cambridge Proofreading" },
          { url: "https://www.yomu.ai/blog/how-to-write-study-limitations", source: "Yomu AI" },
        ],
        conclusions: [
          { url: "https://owl.purdue.edu/owl/general_writing/common_writing_assignments/research_papers/writing_a_research_paper.html", source: "Purdue OWL" },
          { url: "https://www.springer.com/gp/authors-editors/authorandreviewertutorials/writing-a-journal-manuscript/overview/10285518", source: "Springer" },
        ],
        keywords: [
          { url: "https://www.springer.com/gp/authors-editors/authorandreviewertutorials/writing-a-journal-manuscript/title-abstract-and-keywords/10285522", source: "Springer" },
          { url: "https://www.nlm.nih.gov/mesh/meshhome.html", source: "PubMed MeSH Browser" },
        ],
        writing_quality: [
          { url: "https://www.phrasebank.manchester.ac.uk/", source: "Academic Phrasebank" },
          { url: "https://owl.purdue.edu/owl/general_writing/academic_writing/index.html", source: "Purdue OWL" },
          { url: "https://apastyle.apa.org/", source: "APA Style" },
        ],
        zero_i: [
          { url: "https://owl.purdue.edu/owl/general_writing/academic_writing/active_and_passive_voice/index.html", source: "Purdue OWL" },
          { url: "https://www.phrasebank.manchester.ac.uk/", source: "Academic Phrasebank" },
        ],
        statistics: [
          { url: "https://www.equator-network.org/reporting-guidelines/", source: "EQUATOR Network" },
          { url: "https://apastyle.apa.org/instructional-aids/tutorials-webinars", source: "APA Style" },
          { url: "https://www.nature.com/articles/nmeth.2738", source: "Nature Methods — Statistics" },
        ],
        ethics: [
          { url: "https://publicationethics.org/guidance", source: "COPE" },
          { url: "https://www.icmje.org/recommendations/", source: "ICMJE Recommendations" },
          { url: "https://www.icmje.org/recommendations/browse/roles-and-responsibilities/defining-the-role-of-authors-and-contributors.html", source: "ICMJE Authorship" },
        ],
        ai_disclosure: [
          { url: "https://publicationethics.org/guidance", source: "COPE" },
          { url: "https://publicationethics.org/cope-position-statements/ai-author", source: "COPE AI Position" },
          { url: "https://www.icmje.org/recommendations/", source: "ICMJE 2024" },
          { url: "https://publicationethics.org/news/cope-position-statement-authorship-and-ai-tools", source: "COPE AI & Authorship" },
        ],
        references: [
          { url: "https://owl.purdue.edu/owl/research_and_citation/resources.html", source: "Purdue OWL" },
          { url: "https://apastyle.apa.org/style-grammar-guidelines/references", source: "APA Style" },
        ],
        figures_tables: [
          { url: "https://apastyle.apa.org/style-grammar-guidelines/tables-figures", source: "APA Tables & Figures" },
          { url: "https://www.nature.com/nature-portfolio/editorial-policies/image-integrity", source: "Nature Image Integrity" },
          { url: "https://www.equator-network.org/", source: "EQUATOR Network" },
        ],
        reporting_guidelines: [
          { url: "https://www.equator-network.org/reporting-guidelines/", source: "EQUATOR Network" },
          { url: "https://www.equator-network.org/reporting-guidelines/consort/", source: "CONSORT (RCTs)" },
          { url: "https://www.equator-network.org/reporting-guidelines/strobe/", source: "STROBE (Observational)" },
          { url: "https://www.equator-network.org/reporting-guidelines/prisma/", source: "PRISMA (Systematic Reviews)" },
        ],
        structure: [
          { url: "https://www.nature.com/scitable/topicpage/scientific-papers-13815490/", source: "Nature Scitable" },
          { url: "https://www.springer.com/gp/authors-editors/authorandreviewertutorials/writing-a-journal-manuscript/overview/10285518", source: "Springer" },
        ],
        submission: [
          { url: "https://www.springer.com/gp/authors-editors/authorandreviewertutorials/submitting-to-a-journal/cover-letters/10285726", source: "Springer" },
          { url: "https://authorservices.wiley.com/author-resources/Journal-Authors/Prepare/index.html", source: "Wiley" },
        ],
        cover_letter: [
          { url: "https://www.springer.com/gp/authors-editors/authorandreviewertutorials/submitting-to-a-journal/cover-letters/10285726", source: "Springer" },
        ],
        reviewer_response: [
          { url: "https://www.springer.com/gp/authors-editors/authorandreviewertutorials/submitting-to-a-journal/revision-and-appeals/10285730", source: "Springer" },
          { url: "https://authorservices.wiley.com/author-resources/Journal-Authors/Prepare/index.html", source: "Wiley" },
        ],
      };

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

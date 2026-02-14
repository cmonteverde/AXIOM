import * as fs from "fs";
import * as path from "path";

export type PaperType =
  | "quantitative_experimental"
  | "observational"
  | "qualitative"
  | "systematic_review"
  | "mixed_methods"
  | "case_report"
  | "generic";

export interface AutoDetectResult {
  detectedType: PaperType;
  confidence: "high" | "medium" | "low";
  explanation: string;
  keywordsFound: Record<string, string[]>;
  topMatchCount: number;
}

const KEYWORD_MAP: Record<PaperType, { primary: string[]; secondary: string[] }> = {
  quantitative_experimental: {
    primary: [
      "randomized controlled trial", "rct", "random assignment", "randomly assigned",
      "experimental group", "control group", "intervention", "treatment group",
      "double-blind", "single-blind", "blinding", "placebo", "placebo-controlled",
      "consort", "trial registration", "clinical trial"
    ],
    secondary: [
      "experiment", "experimental design", "manipulation check",
      "controlled experiment", "between-subjects", "within-subjects",
      "factorial design"
    ]
  },
  observational: {
    primary: [
      "cohort study", "prospective cohort", "retrospective cohort",
      "case-control study", "case-control design", "cross-sectional study",
      "cross-sectional survey", "observational study", "observational design",
      "correlational study", "correlation analysis", "strobe", "epidemiological",
      "survey", "questionnaire study", "prevalence", "incidence"
    ],
    secondary: [
      "association", "relationship between", "predictor", "predicted",
      "regression analysis", "longitudinal", "naturalistic observation"
    ]
  },
  qualitative: {
    primary: [
      "qualitative study", "qualitative research", "interviews",
      "semi-structured interviews", "in-depth interviews", "focus groups",
      "focus group discussions", "ethnography", "ethnographic",
      "participant observation", "phenomenology", "phenomenological",
      "grounded theory", "thematic analysis", "coding", "themes emerged",
      "coreq", "saturation", "lived experience", "participant narratives",
      "reflexivity", "researcher positionality"
    ],
    secondary: [
      "thick description", "member checking", "participant validation",
      "constant comparative method", "axial coding", "open coding",
      "selective coding", "credibility", "transferability", "dependability",
      "ipa", "discourse analysis", "conversation analysis"
    ]
  },
  systematic_review: {
    primary: [
      "systematic review", "systematic literature review", "meta-analysis",
      "meta-analytic", "prisma", "prisma 2020", "prospero",
      "protocol registration", "search strategy", "databases searched",
      "inclusion criteria", "exclusion criteria", "risk of bias",
      "quality assessment", "forest plot", "funnel plot",
      "effect size pooled", "pooled estimate", "heterogeneity"
    ],
    secondary: [
      "scoping review", "scoping study", "evidence synthesis",
      "grade", "certainty of evidence", "network meta-analysis",
      "living systematic review"
    ]
  },
  mixed_methods: {
    primary: [
      "mixed methods", "mixed-methods", "sequential explanatory",
      "sequential exploratory", "concurrent design", "convergent design",
      "embedded design", "integration", "mixing", "merged", "connected",
      "triangulation"
    ],
    secondary: [
      "quan", "qual", "qualitative and quantitative"
    ]
  },
  case_report: {
    primary: [
      "case report", "case study", "case presentation", "case series",
      "clinical case", "case description", "patient presentation",
      "care report", "clinical vignette", "clinical presentation"
    ],
    secondary: [
      "chief complaint", "clinical findings", "diagnostic assessment",
      "therapeutic intervention", "follow-up", "patient history",
      "timeline", "care timeline", "clinical course"
    ]
  },
  generic: { primary: [], secondary: [] }
};

const MODULE_FILE_MAP: Record<PaperType, string[]> = {
  quantitative_experimental: ["00_SAGE_CORE_INSTRUCTIONS.md", "01_MODULE_QUANTITATIVE_EXPERIMENTAL.md"],
  observational: ["00_SAGE_CORE_INSTRUCTIONS.md", "02_MODULE_OBSERVATIONAL.md"],
  qualitative: ["00_SAGE_CORE_INSTRUCTIONS.md", "03_MODULE_QUALITATIVE.md"],
  systematic_review: ["00_SAGE_CORE_INSTRUCTIONS.md", "04_MODULE_SYSTEMATIC_REVIEW.md"],
  mixed_methods: ["00_SAGE_CORE_INSTRUCTIONS.md", "05_MODULE_MIXED_METHODS.md"],
  case_report: ["00_SAGE_CORE_INSTRUCTIONS.md", "07_MODULE_CASE_REPORT.md"],
  generic: ["00_SAGE_CORE_INSTRUCTIONS.md", "06_MODULE_GENERIC.md"],
};

const PAPER_TYPE_LABELS: Record<PaperType, string> = {
  quantitative_experimental: "Quantitative Experimental",
  observational: "Observational/Correlational",
  qualitative: "Qualitative",
  systematic_review: "Systematic Review",
  mixed_methods: "Mixed Methods",
  case_report: "Case Report / Case Series",
  generic: "Generic Review",
};

export function getPaperTypeLabel(type: PaperType): string {
  return PAPER_TYPE_LABELS[type] || "Generic Review";
}

export function autoDetectPaperType(text: string): AutoDetectResult {
  const lowerText = text.toLowerCase();
  const scores: Record<string, { score: number; found: string[] }> = {};

  for (const [type, keywords] of Object.entries(KEYWORD_MAP)) {
    if (type === "generic") continue;
    let score = 0;
    const found: string[] = [];

    for (const kw of keywords.primary) {
      if (lowerText.includes(kw)) {
        score += 2;
        found.push(kw);
      }
    }
    for (const kw of keywords.secondary) {
      if (lowerText.includes(kw)) {
        score += 1;
        found.push(kw);
      }
    }
    scores[type] = { score, found };
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1].score - a[1].score);
  const topType = sorted[0];
  const topScore = topType[1].score;

  if (topScore === 0) {
    return {
      detectedType: "generic",
      confidence: "low",
      explanation: "No strong indicators found for any specific paper type. A generic review will provide broad coverage.",
      keywordsFound: {},
      topMatchCount: 0,
    };
  }

  let confidence: "high" | "medium" | "low";
  if (topScore >= 8) confidence = "high";
  else if (topScore >= 4) confidence = "medium";
  else confidence = "low";

  const keywordsFound: Record<string, string[]> = {};
  for (const [type, data] of Object.entries(scores)) {
    if (data.found.length > 0) {
      keywordsFound[type] = data.found;
    }
  }

  const detectedType = topType[0] as PaperType;
  const label = getPaperTypeLabel(detectedType);

  let explanation = `Detected as ${label} based on ${topType[1].found.length} matching keywords.`;
  if (confidence === "high") {
    explanation += " Strong match with high confidence.";
  } else if (confidence === "medium") {
    explanation += " Moderate match. Please confirm this is correct.";
  } else {
    explanation += " Weak match. Consider selecting the type manually.";
  }

  return {
    detectedType,
    confidence,
    explanation,
    keywordsFound,
    topMatchCount: topScore,
  };
}

export function loadModulesForType(paperType: PaperType): { files: string[]; content: string } {
  const knowledgeBasePath = path.join(process.cwd(), "server", "knowledge-base");
  const fileNames = MODULE_FILE_MAP[paperType] || MODULE_FILE_MAP.generic;

  const parts: string[] = [];
  for (const fileName of fileNames) {
    const filePath = path.join(knowledgeBasePath, fileName);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      parts.push(content);
    } catch (err) {
      console.error(`Failed to load module file: ${fileName}`, err);
    }
  }

  return {
    files: fileNames,
    content: parts.join("\n\n---\n\n"),
  };
}

export function loadWritingWorkflow(): string {
  const filePath = path.join(process.cwd(), "server", "knowledge-base", "SAGE_WRITING_WORKFLOW.md");
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    console.error("Failed to load writing workflow", err);
    return "";
  }
}

export function loadPaperTypesExplained(): string {
  const filePath = path.join(process.cwd(), "server", "knowledge-base", "SAGE_PAPER_TYPES_EXPLAINED.md");
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    console.error("Failed to load paper types explained", err);
    return "";
  }
}

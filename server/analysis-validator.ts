/**
 * Validates and normalizes the AI analysis response.
 * Fills in defaults for missing fields to prevent UI crashes
 * and ensures consistent data structure.
 */

interface AnalysisResponse {
  readinessScore: number;
  executiveSummary: string;
  documentClassification: {
    manuscriptType: string;
    discipline: string;
    studyDesign: string;
    reportingGuideline: string;
  };
  scoreBreakdown: Record<string, { score: number; maxWeight: number; notes: string }>;
  criticalIssues: Array<{
    title: string;
    description: string;
    severity: string;
    umaReference: string;
  }>;
  detailedFeedback: Array<{
    section: string;
    finding: string;
    suggestion: string;
    whyItMatters: string;
    severity: string;
    resourceTopic: string;
  }>;
  actionItems: Array<{
    task: string;
    priority: string;
    section: string;
    completed: boolean;
  }>;
  abstractAnalysis: {
    hasHook: boolean;
    hasGap: boolean;
    hasApproach: boolean;
    hasFindings: boolean;
    hasImpact: boolean;
    feedback: string;
  };
  zeroIPerspective: {
    compliant: boolean;
    violations: string[];
    feedback: string;
  };
  strengthsToMaintain: string[];
  learnLinks: Array<{
    title: string;
    description: string;
    topic: string;
    url: string;
  }>;
  [key: string]: any;
}

const VALID_SEVERITIES = ["critical", "important", "minor"];
const VALID_PRIORITIES = ["high", "medium", "low"];

const DEFAULT_SCORE_BREAKDOWN: Record<string, { score: number; maxWeight: number; notes: string }> = {
  titleAndKeywords: { score: 0, maxWeight: 8, notes: "Not evaluated" },
  abstract: { score: 0, maxWeight: 12, notes: "Not evaluated" },
  introduction: { score: 0, maxWeight: 10, notes: "Not evaluated" },
  methods: { score: 0, maxWeight: 15, notes: "Not evaluated" },
  results: { score: 0, maxWeight: 13, notes: "Not evaluated" },
  discussion: { score: 0, maxWeight: 12, notes: "Not evaluated" },
  ethicsAndTransparency: { score: 0, maxWeight: 10, notes: "Not evaluated" },
  writingQuality: { score: 0, maxWeight: 10, notes: "Not evaluated" },
  zeroIPerspective: { score: 0, maxWeight: 10, notes: "Not evaluated" },
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function normalizeSeverity(severity: string | undefined): string {
  if (!severity) return "minor";
  const lower = severity.toLowerCase().trim();
  if (lower === "high" || lower === "critical") return "critical";
  if (lower === "medium" || lower === "important") return "important";
  if (VALID_SEVERITIES.includes(lower)) return lower;
  return "minor";
}

function normalizePriority(priority: string | undefined): string {
  if (!priority) return "medium";
  const lower = priority.toLowerCase().trim();
  if (VALID_PRIORITIES.includes(lower)) return lower;
  return "medium";
}

export function validateAnalysisResponse(raw: any): AnalysisResponse {
  if (!raw || typeof raw !== "object") {
    return createEmptyResponse("AI returned invalid response format");
  }

  const result: any = { ...raw };

  // readinessScore: must be 0-100
  result.readinessScore = typeof raw.readinessScore === "number"
    ? clamp(Math.round(raw.readinessScore), 0, 100)
    : 0;

  // executiveSummary: must be a string
  result.executiveSummary = typeof raw.executiveSummary === "string" && raw.executiveSummary.trim()
    ? raw.executiveSummary
    : (typeof raw.summary === "string" ? raw.summary : "Analysis completed. See detailed feedback below.");

  // documentClassification: ensure all fields present
  result.documentClassification = {
    manuscriptType: raw.documentClassification?.manuscriptType || "Unknown",
    discipline: raw.documentClassification?.discipline || "Unknown",
    studyDesign: raw.documentClassification?.studyDesign || "Unknown",
    reportingGuideline: raw.documentClassification?.reportingGuideline || "N/A",
  };

  // scoreBreakdown: validate each category
  if (raw.scoreBreakdown && typeof raw.scoreBreakdown === "object") {
    const validated: Record<string, { score: number; maxWeight: number; notes: string }> = {};
    for (const [key, defaultVal] of Object.entries(DEFAULT_SCORE_BREAKDOWN)) {
      const val = raw.scoreBreakdown[key];
      if (val && typeof val === "object") {
        validated[key] = {
          score: typeof val.score === "number" ? clamp(Math.round(val.score), 0, 100) : defaultVal.score,
          maxWeight: typeof val.maxWeight === "number" ? val.maxWeight : defaultVal.maxWeight,
          notes: typeof val.notes === "string" ? val.notes : defaultVal.notes,
        };
      } else {
        validated[key] = defaultVal;
      }
    }
    result.scoreBreakdown = validated;
  } else {
    result.scoreBreakdown = DEFAULT_SCORE_BREAKDOWN;
  }

  // criticalIssues: validate array
  if (Array.isArray(raw.criticalIssues)) {
    result.criticalIssues = raw.criticalIssues
      .filter((issue: any) => issue && typeof issue === "object" && issue.title)
      .map((issue: any) => ({
        title: String(issue.title || "Untitled issue"),
        description: String(issue.description || ""),
        severity: normalizeSeverity(issue.severity),
        umaReference: String(issue.umaReference || "General"),
      }));
  } else {
    result.criticalIssues = [];
  }

  // detailedFeedback: validate array
  if (Array.isArray(raw.detailedFeedback)) {
    result.detailedFeedback = raw.detailedFeedback
      .filter((fb: any) => fb && typeof fb === "object" && (fb.finding || fb.suggestion))
      .map((fb: any) => ({
        section: String(fb.section || "General"),
        finding: String(fb.finding || ""),
        suggestion: String(fb.suggestion || ""),
        whyItMatters: String(fb.whyItMatters || fb.why_it_matters || ""),
        severity: normalizeSeverity(fb.severity),
        resourceTopic: String(fb.resourceTopic || fb.resource_topic || "writing_quality"),
        ...(fb.resourceUrl ? { resourceUrl: fb.resourceUrl } : {}),
        ...(fb.resourceSource ? { resourceSource: fb.resourceSource } : {}),
      }));
  } else {
    result.detailedFeedback = [];
  }

  // actionItems: validate array
  if (Array.isArray(raw.actionItems)) {
    result.actionItems = raw.actionItems
      .filter((item: any) => item && typeof item === "object" && item.task)
      .map((item: any) => ({
        task: String(item.task || ""),
        priority: normalizePriority(item.priority),
        section: item.section ? String(item.section) : undefined,
        completed: false, // Always start unchecked
      }));
  } else {
    result.actionItems = [];
  }

  // abstractAnalysis: validate
  if (raw.abstractAnalysis && typeof raw.abstractAnalysis === "object") {
    result.abstractAnalysis = {
      hasHook: Boolean(raw.abstractAnalysis.hasHook),
      hasGap: Boolean(raw.abstractAnalysis.hasGap),
      hasApproach: Boolean(raw.abstractAnalysis.hasApproach),
      hasFindings: Boolean(raw.abstractAnalysis.hasFindings),
      hasImpact: Boolean(raw.abstractAnalysis.hasImpact),
      feedback: String(raw.abstractAnalysis.feedback || ""),
    };
  }
  // If missing, leave undefined — UI handles this

  // zeroIPerspective: validate
  if (raw.zeroIPerspective && typeof raw.zeroIPerspective === "object") {
    result.zeroIPerspective = {
      compliant: Boolean(raw.zeroIPerspective.compliant),
      violations: Array.isArray(raw.zeroIPerspective.violations)
        ? raw.zeroIPerspective.violations.map(String)
        : [],
      feedback: String(raw.zeroIPerspective.feedback || ""),
    };
  }

  // strengthsToMaintain: validate array of strings
  if (Array.isArray(raw.strengthsToMaintain)) {
    result.strengthsToMaintain = raw.strengthsToMaintain
      .filter((s: any) => typeof s === "string" && s.trim())
      .map(String);
  } else {
    result.strengthsToMaintain = [];
  }

  // learnLinks: validate array
  if (Array.isArray(raw.learnLinks)) {
    result.learnLinks = raw.learnLinks
      .filter((link: any) => link && typeof link === "object" && link.title)
      .map((link: any) => ({
        title: String(link.title || ""),
        description: String(link.description || ""),
        topic: String(link.topic || "writing_quality"),
        url: link.url || "",
        ...(link.source ? { source: link.source } : {}),
      }));
  } else {
    result.learnLinks = [];
  }

  // === RIGOR ENFORCEMENT ===

  // 1. Score-feedback consistency: cap score if critical issues are high
  const criticalCount = result.criticalIssues.filter((i: any) => i.severity === "critical").length;
  if (criticalCount >= 5 && result.readinessScore > 60) {
    result.readinessScore = Math.min(result.readinessScore, 55);
  } else if (criticalCount >= 3 && result.readinessScore > 75) {
    result.readinessScore = Math.min(result.readinessScore, 65);
  } else if (criticalCount >= 1 && result.readinessScore > 85) {
    result.readinessScore = Math.min(result.readinessScore, 80);
  }

  // 2. Ensure action items cover critical issues (at minimum 1:1 mapping)
  const highPriorityActions = result.actionItems.filter((a: any) => a.priority === "high").length;
  if (highPriorityActions < criticalCount) {
    // Add missing action items for uncovered critical issues
    const coveredTitles = new Set(result.actionItems.map((a: any) => a.task.toLowerCase()));
    for (const issue of result.criticalIssues) {
      const taskText = `Address critical issue: ${issue.title}`;
      if (!coveredTitles.has(taskText.toLowerCase())) {
        result.actionItems.push({
          task: taskText,
          priority: "high",
          section: issue.umaReference || "General",
          completed: false,
        });
      }
    }
  }

  // 3. Log rigor warnings (useful for monitoring audit quality)
  const rigorWarnings: string[] = [];
  if (result.detailedFeedback.length < 10) {
    rigorWarnings.push(`Low feedback count: ${result.detailedFeedback.length} items (target: ≥20)`);
  }
  if (result.actionItems.length < 8) {
    rigorWarnings.push(`Low action item count: ${result.actionItems.length} items (target: ≥15)`);
  }

  // Check that feedback items quote manuscript text (contain quotation marks)
  const quotingRate = result.detailedFeedback.length > 0
    ? result.detailedFeedback.filter((fb: any) => fb.finding.includes('"') || fb.finding.includes("'")).length / result.detailedFeedback.length
    : 0;
  if (quotingRate < 0.3 && result.detailedFeedback.length > 0) {
    rigorWarnings.push(`Low quoting rate: ${Math.round(quotingRate * 100)}% of feedback items quote manuscript text (target: ≥50%)`);
  }

  if (rigorWarnings.length > 0) {
    console.warn("AXIOM RIGOR WARNINGS:", rigorWarnings.join("; "));
    result._rigorWarnings = rigorWarnings;
  }

  return result as AnalysisResponse;
}

function createEmptyResponse(message: string): AnalysisResponse {
  return {
    readinessScore: 0,
    executiveSummary: message,
    documentClassification: {
      manuscriptType: "Unknown",
      discipline: "Unknown",
      studyDesign: "Unknown",
      reportingGuideline: "N/A",
    },
    scoreBreakdown: DEFAULT_SCORE_BREAKDOWN,
    criticalIssues: [],
    detailedFeedback: [],
    actionItems: [],
    abstractAnalysis: {
      hasHook: false,
      hasGap: false,
      hasApproach: false,
      hasFindings: false,
      hasImpact: false,
      feedback: message,
    },
    zeroIPerspective: {
      compliant: false,
      violations: [],
      feedback: message,
    },
    strengthsToMaintain: [],
    learnLinks: [],
  };
}

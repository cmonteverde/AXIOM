import { describe, it, expect } from "vitest";
import { validateAnalysisResponse } from "./analysis-validator";

describe("validateAnalysisResponse", () => {
  it("returns empty response for null input", () => {
    const result = validateAnalysisResponse(null);
    expect(result.readinessScore).toBe(0);
    expect(result.executiveSummary).toBeTruthy();
    expect(result.criticalIssues).toEqual([]);
    expect(result.detailedFeedback).toEqual([]);
    expect(result.actionItems).toEqual([]);
  });

  it("returns empty response for non-object input", () => {
    const result = validateAnalysisResponse("just a string");
    expect(result.readinessScore).toBe(0);
  });

  it("clamps readinessScore to 0-100", () => {
    expect(validateAnalysisResponse({ readinessScore: 150 }).readinessScore).toBe(100);
    expect(validateAnalysisResponse({ readinessScore: -10 }).readinessScore).toBe(0);
    expect(validateAnalysisResponse({ readinessScore: 75.6 }).readinessScore).toBe(76);
  });

  it("falls back executiveSummary to summary field", () => {
    const result = validateAnalysisResponse({ summary: "Test summary" });
    expect(result.executiveSummary).toBe("Test summary");
  });

  it("provides default executiveSummary when both missing", () => {
    const result = validateAnalysisResponse({});
    expect(result.executiveSummary).toContain("Analysis completed");
  });

  it("normalizes documentClassification with defaults", () => {
    const result = validateAnalysisResponse({});
    expect(result.documentClassification).toEqual({
      manuscriptType: "Unknown",
      discipline: "Unknown",
      studyDesign: "Unknown",
      reportingGuideline: "N/A",
    });
  });

  it("preserves valid documentClassification", () => {
    const result = validateAnalysisResponse({
      documentClassification: {
        manuscriptType: "Experimental",
        discipline: "Biology",
        studyDesign: "RCT",
        reportingGuideline: "CONSORT",
      },
    });
    expect(result.documentClassification.manuscriptType).toBe("Experimental");
    expect(result.documentClassification.reportingGuideline).toBe("CONSORT");
  });

  it("provides default scoreBreakdown when missing", () => {
    const result = validateAnalysisResponse({});
    expect(result.scoreBreakdown).toBeDefined();
    expect(result.scoreBreakdown.methods).toEqual({
      score: 0,
      maxWeight: 15,
      notes: "Not evaluated",
    });
  });

  it("clamps scores in scoreBreakdown to 0-100", () => {
    const result = validateAnalysisResponse({
      scoreBreakdown: {
        methods: { score: 200, maxWeight: 15, notes: "Great" },
        abstract: { score: -5, maxWeight: 12, notes: "Bad" },
      },
    });
    expect(result.scoreBreakdown.methods.score).toBe(100);
    expect(result.scoreBreakdown.abstract.score).toBe(0);
  });

  it("normalizes severity values", () => {
    const result = validateAnalysisResponse({
      criticalIssues: [
        { title: "A", severity: "high", description: "d", umaReference: "r" },
        { title: "B", severity: "medium", description: "d", umaReference: "r" },
        { title: "C", severity: "LOW", description: "d", umaReference: "r" },
      ],
    });
    expect(result.criticalIssues[0].severity).toBe("critical");
    expect(result.criticalIssues[1].severity).toBe("important");
    expect(result.criticalIssues[2].severity).toBe("minor");
  });

  it("normalizes priority values", () => {
    const result = validateAnalysisResponse({
      actionItems: [
        { task: "A", priority: "HIGH" },
        { task: "B", priority: "Medium" },
        { task: "C", priority: "low" },
        { task: "D", priority: "unknown_value" },
      ],
    });
    expect(result.actionItems[0].priority).toBe("high");
    expect(result.actionItems[1].priority).toBe("medium");
    expect(result.actionItems[2].priority).toBe("low");
    expect(result.actionItems[3].priority).toBe("medium");
  });

  it("filters out invalid feedback items", () => {
    const result = validateAnalysisResponse({
      detailedFeedback: [
        { section: "Methods", finding: "Good point", suggestion: "Fix it" },
        { section: "Results" }, // missing finding and suggestion
        null,
        "not an object",
      ],
    });
    expect(result.detailedFeedback.length).toBe(1);
    expect(result.detailedFeedback[0].section).toBe("Methods");
  });

  it("filters out action items without task", () => {
    const result = validateAnalysisResponse({
      actionItems: [
        { task: "Do something", priority: "high" },
        { priority: "low" }, // missing task
        {},
      ],
    });
    expect(result.actionItems.length).toBe(1);
  });

  it("always sets actionItems completed to false", () => {
    const result = validateAnalysisResponse({
      actionItems: [
        { task: "A", priority: "high", completed: true },
      ],
    });
    expect(result.actionItems[0].completed).toBe(false);
  });

  it("validates abstractAnalysis boolean fields", () => {
    const result = validateAnalysisResponse({
      abstractAnalysis: {
        hasHook: 1,
        hasGap: "",
        hasApproach: true,
        hasFindings: null,
        hasImpact: "yes",
        feedback: "Good abstract",
      },
    });
    expect(result.abstractAnalysis.hasHook).toBe(true);
    expect(result.abstractAnalysis.hasGap).toBe(false);
    expect(result.abstractAnalysis.hasApproach).toBe(true);
    expect(result.abstractAnalysis.hasFindings).toBe(false);
    expect(result.abstractAnalysis.hasImpact).toBe(true);
  });

  it("validates zeroIPerspective", () => {
    const result = validateAnalysisResponse({
      zeroIPerspective: {
        compliant: false,
        violations: ["We found", "I believe"],
        feedback: "Remove first person",
      },
    });
    expect(result.zeroIPerspective.compliant).toBe(false);
    expect(result.zeroIPerspective.violations).toHaveLength(2);
  });

  it("caps score when many critical issues exist", () => {
    const issues = Array.from({ length: 5 }, (_, i) => ({
      title: `Issue ${i}`,
      description: "d",
      severity: "critical",
      umaReference: "r",
    }));
    const result = validateAnalysisResponse({
      readinessScore: 90,
      criticalIssues: issues,
    });
    expect(result.readinessScore).toBeLessThanOrEqual(55);
  });

  it("caps score to 80 with 1 critical issue", () => {
    const result = validateAnalysisResponse({
      readinessScore: 95,
      criticalIssues: [
        { title: "Big problem", description: "d", severity: "critical", umaReference: "r" },
      ],
    });
    expect(result.readinessScore).toBeLessThanOrEqual(80);
  });

  it("preserves strengthsToMaintain strings", () => {
    const result = validateAnalysisResponse({
      strengthsToMaintain: ["Good methods", "Clear writing", 42, null],
    });
    expect(result.strengthsToMaintain).toEqual(["Good methods", "Clear writing"]);
  });

  it("validates learnLinks", () => {
    const result = validateAnalysisResponse({
      learnLinks: [
        { title: "Guide", description: "A guide", topic: "methods", url: "https://example.com" },
        { description: "no title" }, // filtered out
      ],
    });
    expect(result.learnLinks.length).toBe(1);
    expect(result.learnLinks[0].title).toBe("Guide");
  });

  it("handles a realistic full AI response", () => {
    const realistic = {
      readinessScore: 72,
      executiveSummary: "This manuscript shows promise but needs work.",
      documentClassification: {
        manuscriptType: "Quantitative Experimental",
        discipline: "Psychology",
        studyDesign: "Between-subjects experiment",
        reportingGuideline: "CONSORT",
      },
      scoreBreakdown: {
        titleAndKeywords: { score: 85, maxWeight: 8, notes: "Good title" },
        abstract: { score: 70, maxWeight: 12, notes: "Missing impact" },
        methods: { score: 60, maxWeight: 15, notes: "Insufficient detail" },
      },
      criticalIssues: [
        { title: "Missing sample size justification", description: "No power analysis", severity: "critical", umaReference: "Methods Recipe" },
      ],
      detailedFeedback: [
        { section: "Methods", finding: "Sample size not justified", suggestion: "Add power analysis", severity: "critical", whyItMatters: "Reproducibility", resourceTopic: "methods" },
      ],
      actionItems: [
        { task: "Add power analysis to Methods", priority: "high", section: "Methods" },
      ],
      abstractAnalysis: { hasHook: true, hasGap: true, hasApproach: true, hasFindings: true, hasImpact: false, feedback: "Missing impact statement" },
      zeroIPerspective: { compliant: true, violations: [], feedback: "Good" },
      strengthsToMaintain: ["Clear research questions", "Well-structured introduction"],
      learnLinks: [],
    };

    const result = validateAnalysisResponse(realistic);
    expect(result.readinessScore).toBe(72);
    expect(result.criticalIssues).toHaveLength(1);
    expect(result.detailedFeedback).toHaveLength(1);
    expect(result.actionItems).toHaveLength(1);
    expect(result.abstractAnalysis.hasImpact).toBe(false);
    expect(result.strengthsToMaintain).toHaveLength(2);
  });
});

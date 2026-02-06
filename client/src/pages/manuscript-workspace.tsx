import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { isUnauthorizedError } from "@/lib/auth-utils";
import type { Manuscript } from "@shared/schema";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  BookOpen,
  ClipboardList,
  BarChart3,
  GraduationCap,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";

const SECTION_HELP_TYPES = [
  "Title",
  "Abstract",
  "Introduction",
  "Methods",
  "Results",
  "Discussion",
  "Limitations",
  "Conclusions & Recommendations",
  "Keywords",
  "Structural Analysis",
  "Language & Clarity",
  "Statistics",
  "Reference Management",
  "Ethics",
  "Journal Selection",
  "Cover Letter",
  "Reviewer Response",
];

const ALL_HELP_TYPES = ["Comprehensive Review", ...SECTION_HELP_TYPES];

interface ScoreCategory {
  score: number;
  maxWeight: number;
  notes: string;
}

interface AnalysisData {
  readinessScore: number;
  summary: string;
  scoreBreakdown?: {
    titleAndKeywords?: ScoreCategory;
    abstract?: ScoreCategory;
    introduction?: ScoreCategory;
    methods?: ScoreCategory;
    results?: ScoreCategory;
    discussion?: ScoreCategory;
    writingQuality?: ScoreCategory;
    zeroIPerspective?: ScoreCategory;
  };
  criticalIssues: Array<{
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
    umaReference: string;
  }>;
  detailedFeedback: Array<{
    section: string;
    finding: string;
    suggestion: string;
    whyItMatters: string;
  }>;
  actionItems: Array<{
    task: string;
    priority: "high" | "medium" | "low";
    section?: string;
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
  learnLinks: Array<{
    title: string;
    description: string;
    topic: string;
  }>;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 75
      ? "text-sage"
      : score >= 50
        ? "text-gold-dark"
        : "text-destructive";

  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted/30"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${color} transition-all duration-1000`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${color}`} data-testid="text-readiness-score">
          {score}
        </span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, weight }: { label: string; score: number; weight: number }) {
  const color =
    score >= 75
      ? "bg-sage"
      : score >= 50
        ? "bg-gold-dark"
        : "bg-destructive";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground">{score}/100 ({weight}%)</span>
      </div>
      <div className="w-full h-2 rounded-full bg-muted/30">
        <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const variant =
    severity === "high"
      ? "destructive"
      : severity === "medium"
        ? "secondary"
        : "outline";
  return (
    <Badge variant={variant} className="text-xs">
      {severity}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const variant =
    priority === "high"
      ? "destructive"
      : priority === "medium"
        ? "secondary"
        : "outline";
  return (
    <Badge variant={variant} className="text-xs">
      {priority}
    </Badge>
  );
}

function FiveMoveCheck({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {passed ? (
        <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
      ) : (
        <CircleDot className="w-4 h-4 text-destructive shrink-0" />
      )}
      <span className={`text-sm ${passed ? "text-foreground" : "text-destructive"}`}>
        {label}
      </span>
    </div>
  );
}

function AnalysisOptionsDialog({
  open,
  onOpenChange,
  defaultHelpTypes,
  onConfirm,
  isAnalyzing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultHelpTypes: string[];
  onConfirm: (helpTypes: string[]) => void;
  isAnalyzing: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultHelpTypes));

  useEffect(() => {
    if (open) {
      setSelected(new Set(defaultHelpTypes));
    }
  }, [open, defaultHelpTypes]);

  const toggleType = (type: string) => {
    if (type === "Comprehensive Review") {
      setSelected((prev) => {
        if (prev.has("Comprehensive Review")) {
          return new Set();
        }
        return new Set(ALL_HELP_TYPES);
      });
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
        next.delete("Comprehensive Review");
      } else {
        next.add(type);
        if (SECTION_HELP_TYPES.every((t) => next.has(t))) {
          next.add("Comprehensive Review");
        }
      }
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(ALL_HELP_TYPES));
  const clearAll = () => setSelected(new Set());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Analysis Focus</DialogTitle>
          <DialogDescription>
            Select which areas you want SAGE to focus on during analysis. More focus areas = more comprehensive feedback.
          </DialogDescription>
        </DialogHeader>
        <div className="py-3">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs text-muted-foreground">{selected.size} selected</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll} data-testid="button-select-all">
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll} data-testid="button-clear-all">
                Clear
              </Button>
            </div>
          </div>
          <label
            className={`flex items-center gap-2 p-2.5 rounded-md border cursor-pointer transition-colors mb-2 ${
              selected.has("Comprehensive Review") ? "border-primary bg-primary/10" : "border-border"
            }`}
            data-testid="option-help-comprehensive-review"
          >
            <Checkbox
              checked={selected.has("Comprehensive Review")}
              onCheckedChange={() => toggleType("Comprehensive Review")}
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold">Comprehensive Review</span>
              <p className="text-xs text-muted-foreground mt-0.5">All areas. May take a few minutes for longer manuscripts.</p>
            </div>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SECTION_HELP_TYPES.map((type) => (
              <label
                key={type}
                className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                  selected.has(type) ? "border-primary bg-primary/5" : "border-border"
                }`}
                data-testid={`option-help-${type.toLowerCase().replace(/[^a-z]/g, "-")}`}
              >
                <Checkbox
                  checked={selected.has(type)}
                  onCheckedChange={() => toggleType(type)}
                />
                <span className="text-xs">{type}</span>
              </label>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-analysis">
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(Array.from(selected))}
            disabled={selected.size === 0 || isAnalyzing}
            data-testid="button-confirm-analysis"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ScoreBreakdownPanel({ breakdown, onClose }: { breakdown: NonNullable<AnalysisData["scoreBreakdown"]>; onClose: () => void }) {
  const categories = [
    { key: "titleAndKeywords", label: "Title & Keywords", data: breakdown.titleAndKeywords },
    { key: "abstract", label: "Abstract", data: breakdown.abstract },
    { key: "introduction", label: "Introduction", data: breakdown.introduction },
    { key: "methods", label: "Methods", data: breakdown.methods },
    { key: "results", label: "Results", data: breakdown.results },
    { key: "discussion", label: "Discussion", data: breakdown.discussion },
    { key: "writingQuality", label: "Writing Quality", data: breakdown.writingQuality },
    { key: "zeroIPerspective", label: "Zero-I Perspective", data: breakdown.zeroIPerspective },
  ].filter((c) => c.data);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Score Breakdown
        </h4>
        <Button variant="outline" size="sm" onClick={onClose} data-testid="button-close-breakdown">
          <X className="w-3 h-3" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Your readiness score is a weighted average across these categories. Each category is scored 0-100 and weighted by its importance to publication readiness.
      </p>
      <div className="space-y-3">
        {categories.map(({ key, label, data }) => (
          <div key={key}>
            <ScoreBar label={label} score={data!.score} weight={data!.maxWeight} />
            {data!.notes && (
              <p className="text-xs text-muted-foreground mt-1 pl-1">{data!.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ManuscriptWorkspace() {
  const [, navigate] = useLocation();
  const [matched, params] = useRoute("/manuscript/:id");
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [feedbackFilter, setFeedbackFilter] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [extractionAttempted, setExtractionAttempted] = useState(false);

  const manuscriptId = params?.id;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [authLoading, isAuthenticated]);

  const { data: manuscript, isLoading } = useQuery<Manuscript>({
    queryKey: ["/api/manuscripts", manuscriptId],
    enabled: !!manuscriptId && isAuthenticated,
  });

  const extractMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/manuscripts/${manuscriptId}/extract`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts", manuscriptId] });
      toast({ title: "Text Extracted", description: "Full manuscript text has been loaded." });
    },
    onError: (error: Error) => {
      toast({ title: "Extraction Failed", description: error.message, variant: "destructive" });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (helpTypes: string[]) => {
      setShowAnalysisDialog(false);
      const res = await apiRequest("POST", `/api/manuscripts/${manuscriptId}/analyze`, { helpTypes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts", manuscriptId] });
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts"] });
      toast({ title: "Analysis Complete", description: "SAGE has completed a comprehensive review of your manuscript." });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({ title: "Analysis Failed", description: error.message, variant: "destructive" });
    },
  });

  const toggleActionItem = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  useEffect(() => {
    if (
      manuscript &&
      !manuscript.fullText &&
      manuscript.fileKey &&
      !extractionAttempted &&
      !extractMutation.isPending
    ) {
      setExtractionAttempted(true);
      extractMutation.mutate();
    }
  }, [manuscript?.id, manuscript?.fullText, manuscript?.fileKey, extractionAttempted]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-[95%] mx-auto">
          <Skeleton className="h-10 w-48 mb-4" />
          <div className="flex gap-4">
            <Skeleton className="h-[80vh] w-[60%]" />
            <Skeleton className="h-[80vh] w-[40%]" />
          </div>
        </div>
      </div>
    );
  }

  if (!manuscript) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Manuscript not found</p>
          <Button onClick={() => navigate("/dashboard")} data-testid="button-back-dashboard">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const analysis = manuscript.analysisJson as AnalysisData | null;
  const hasAnalysis = manuscript.analysisStatus === "completed" && analysis;
  const isAnalyzing = analyzeMutation.isPending;
  const manuscriptText = manuscript.fullText || manuscript.previewText || "";
  const isReExtracting = extractMutation.isPending;

  const feedbackSections = hasAnalysis
    ? Array.from(new Set(analysis.detailedFeedback.map((f) => f.section)))
    : [];

  const actionSections = hasAnalysis
    ? Array.from(new Set(analysis.actionItems.filter((a) => a.section).map((a) => a.section!)))
    : [];

  const filteredFeedback = hasAnalysis
    ? feedbackFilter
      ? analysis.detailedFeedback.filter((f) => f.section === feedbackFilter)
      : analysis.detailedFeedback
    : [];

  const filteredActions = hasAnalysis
    ? actionFilter
      ? analysis.actionItems.filter((a) => a.section === actionFilter)
      : analysis.actionItems
    : [];

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background sticky top-0 z-50">
        <div className="max-w-[95%] mx-auto flex items-center justify-between gap-4 py-3 px-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate" data-testid="text-manuscript-title">
                {manuscript.title || "Untitled Manuscript"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {manuscript.stage} {manuscript.fileName ? `\u00b7 ${manuscript.fileName}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={hasAnalysis ? "outline" : "default"}
              size="sm"
              onClick={() => setShowAnalysisDialog(true)}
              disabled={isAnalyzing || !manuscriptText}
              data-testid="button-run-analysis"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : hasAnalysis ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-analyze
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Run SAGE Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <AnalysisOptionsDialog
        open={showAnalysisDialog}
        onOpenChange={setShowAnalysisDialog}
        defaultHelpTypes={manuscript.helpTypes || ALL_HELP_TYPES}
        onConfirm={(helpTypes) => analyzeMutation.mutate(helpTypes)}
        isAnalyzing={analyzeMutation.isPending}
      />

      <div className="max-w-[95%] mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-4" style={{ minHeight: "calc(100vh - 100px)" }}>
          <div className="w-full lg:w-[60%]">
            <Card className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center gap-2 flex-wrap">
                <BookOpen className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold">Manuscript Content</h2>
                {manuscriptText && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {manuscriptText.length.toLocaleString()} characters
                  </span>
                )}
                {isReExtracting && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Loading full text...
                  </Badge>
                )}
              </div>
              <ScrollArea className="flex-1 p-4" style={{ height: "calc(100vh - 180px)" }}>
                {manuscriptText ? (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono" data-testid="text-manuscript-content">
                    {manuscriptText}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-16">
                    <BookOpen className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No manuscript text available</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a file or paste text to get started
                    </p>
                    {manuscript.fileKey && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => extractMutation.mutate()}
                        disabled={extractMutation.isPending}
                        data-testid="button-extract-text"
                      >
                        {extractMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          "Extract Text from File"
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>

          <div className="w-full lg:w-[40%]">
            {isAnalyzing && !hasAnalysis ? (
              <Card className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">SAGE is Analyzing</h3>
                  <p className="text-sm text-muted-foreground">
                    Performing comprehensive section-by-section review using UMA framework...
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">This may take 30-60 seconds for a thorough analysis</p>
                </div>
              </Card>
            ) : !hasAnalysis ? (
              <Card className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click "Run SAGE Analysis" to get comprehensive, section-by-section feedback based on the Universal Manuscript Architecture.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    SAGE will review every section, check for the Structured 5-Move Abstract, Zero-I Perspective, and provide detailed action items.
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex flex-col">
                <Tabs defaultValue="overview" className="flex flex-col h-full">
                  <div className="p-3 border-b">
                    <TabsList className="w-full">
                      <TabsTrigger value="overview" className="flex-1 text-xs" data-testid="tab-overview">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="feedback" className="flex-1 text-xs" data-testid="tab-feedback">
                        Feedback ({analysis.detailedFeedback.length})
                      </TabsTrigger>
                      <TabsTrigger value="actions" className="flex-1 text-xs" data-testid="tab-actions">
                        Actions ({analysis.actionItems.length})
                      </TabsTrigger>
                      <TabsTrigger value="learn" className="flex-1 text-xs" data-testid="tab-learn">
                        Learn
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <ScrollArea className="flex-1" style={{ height: "calc(100vh - 230px)" }}>
                    <TabsContent value="overview" className="p-4 mt-0">
                      <div className="space-y-6">
                        <div className="text-center">
                          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Publication Readiness</h3>
                          <ScoreRing score={analysis.readinessScore} />
                          <p className="text-sm text-muted-foreground mt-3">{analysis.summary}</p>
                          {analysis.scoreBreakdown && (
                            <button
                              onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
                              className="text-xs text-primary mt-2 flex items-center gap-1 mx-auto transition-colors"
                              data-testid="button-score-breakdown"
                            >
                              <Info className="w-3 h-3" />
                              {showScoreBreakdown ? "Hide score breakdown" : "How is this score calculated?"}
                            </button>
                          )}
                        </div>

                        {showScoreBreakdown && analysis.scoreBreakdown && (
                          <ScoreBreakdownPanel
                            breakdown={analysis.scoreBreakdown}
                            onClose={() => setShowScoreBreakdown(false)}
                          />
                        )}

                        <div>
                          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            5-Move Abstract Check
                          </h3>
                          <Card className="p-3 space-y-2">
                            <FiveMoveCheck label="1. Hook (Broad Significance)" passed={analysis.abstractAnalysis.hasHook} />
                            <FiveMoveCheck label="2. Gap (Pain Point)" passed={analysis.abstractAnalysis.hasGap} />
                            <FiveMoveCheck label="3. Approach (Methodology)" passed={analysis.abstractAnalysis.hasApproach} />
                            <FiveMoveCheck label="4. Findings (Quantified Data)" passed={analysis.abstractAnalysis.hasFindings} />
                            <FiveMoveCheck label="5. Impact (So What)" passed={analysis.abstractAnalysis.hasImpact} />
                            {analysis.abstractAnalysis.feedback && (
                              <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                                {analysis.abstractAnalysis.feedback}
                              </p>
                            )}
                          </Card>
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-primary" />
                            Zero-I Perspective
                          </h3>
                          <Card className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              {analysis.zeroIPerspective.compliant ? (
                                <Badge variant="secondary" className="bg-sage/20 text-sage-dark">Compliant</Badge>
                              ) : (
                                <Badge variant="destructive">Violations Found</Badge>
                              )}
                            </div>
                            {analysis.zeroIPerspective.violations.length > 0 && (
                              <ul className="space-y-1 mb-2">
                                {analysis.zeroIPerspective.violations.map((v, i) => (
                                  <li key={i} className="text-xs text-destructive flex items-start gap-1">
                                    <span className="shrink-0">&bull;</span>
                                    <span>{v}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            <p className="text-xs text-muted-foreground">{analysis.zeroIPerspective.feedback}</p>
                          </Card>
                        </div>

                        {analysis.criticalIssues.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-destructive" />
                              Critical Issues ({analysis.criticalIssues.length})
                            </h3>
                            <div className="space-y-2">
                              {analysis.criticalIssues.map((issue, i) => (
                                <Card key={i} className="p-3">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <span className="text-sm font-medium">{issue.title}</span>
                                    <SeverityBadge severity={issue.severity} />
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-1">{issue.description}</p>
                                  <p className="text-xs text-primary/70">UMA: {issue.umaReference}</p>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="feedback" className="p-4 mt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-primary" />
                            Section-by-Section Feedback
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {filteredFeedback.length} items
                          </span>
                        </div>

                        {feedbackSections.length > 1 && (
                          <div className="flex flex-wrap gap-1">
                            <Badge
                              variant={feedbackFilter === null ? "default" : "outline"}
                              className="cursor-pointer text-xs"
                              onClick={() => setFeedbackFilter(null)}
                              data-testid="filter-feedback-all"
                            >
                              All
                            </Badge>
                            {feedbackSections.map((section) => (
                              <Badge
                                key={section}
                                variant={feedbackFilter === section ? "default" : "outline"}
                                className="cursor-pointer text-xs"
                                onClick={() => setFeedbackFilter(feedbackFilter === section ? null : section)}
                                data-testid={`filter-feedback-${section.toLowerCase().replace(/[^a-z]/g, "-")}`}
                              >
                                {section} ({analysis.detailedFeedback.filter((f) => f.section === section).length})
                              </Badge>
                            ))}
                          </div>
                        )}

                        {feedbackSections.map((section) => {
                          const sectionItems = filteredFeedback.filter((f) => f.section === section);
                          if (sectionItems.length === 0) return null;
                          const isExpanded = expandedSections.has(`fb-${section}`) || feedbackFilter !== null;

                          return (
                            <div key={section}>
                              {feedbackFilter === null && (
                                <button
                                  onClick={() => toggleSection(`fb-${section}`)}
                                  className="flex items-center gap-2 w-full text-left py-2"
                                  data-testid={`toggle-section-${section.toLowerCase().replace(/[^a-z]/g, "-")}`}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                  )}
                                  <span className="text-sm font-medium">{section}</span>
                                  <Badge variant="outline" className="text-xs ml-auto">{sectionItems.length}</Badge>
                                </button>
                              )}
                              {(isExpanded || feedbackFilter !== null) && sectionItems.map((fb, i) => (
                                <Card key={i} className="p-3 mb-2">
                                  {feedbackFilter !== null && (
                                    <Badge variant="outline" className="mb-2 text-xs">{fb.section}</Badge>
                                  )}
                                  <p className="text-sm font-medium mb-1">{fb.finding}</p>
                                  <p className="text-sm text-sage-dark mb-2">{fb.suggestion}</p>
                                  <div className="bg-primary/5 rounded-md p-2">
                                    <p className="text-xs font-medium text-primary mb-0.5">Why it Matters (UMA)</p>
                                    <p className="text-xs text-muted-foreground">{fb.whyItMatters}</p>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          );
                        })}
                        {filteredFeedback.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">No detailed feedback available.</p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="actions" className="p-4 mt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            Action Items
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {checkedItems.size}/{filteredActions.length} done
                          </span>
                        </div>

                        {actionSections.length > 1 && (
                          <div className="flex flex-wrap gap-1">
                            <Badge
                              variant={actionFilter === null ? "default" : "outline"}
                              className="cursor-pointer text-xs"
                              onClick={() => setActionFilter(null)}
                              data-testid="filter-actions-all"
                            >
                              All ({analysis.actionItems.length})
                            </Badge>
                            {actionSections.map((section) => (
                              <Badge
                                key={section}
                                variant={actionFilter === section ? "default" : "outline"}
                                className="cursor-pointer text-xs"
                                onClick={() => setActionFilter(actionFilter === section ? null : section)}
                                data-testid={`filter-actions-${section.toLowerCase().replace(/[^a-z]/g, "-")}`}
                              >
                                {section}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {filteredActions.map((item, i) => {
                          const globalIndex = analysis.actionItems.indexOf(item);
                          return (
                            <div
                              key={globalIndex}
                              className={`flex items-start gap-3 p-3 rounded-md border transition-colors ${
                                checkedItems.has(globalIndex) ? "bg-sage/5 border-sage/30" : "border-border"
                              }`}
                            >
                              <Checkbox
                                checked={checkedItems.has(globalIndex)}
                                onCheckedChange={() => toggleActionItem(globalIndex)}
                                className="mt-0.5"
                                data-testid={`checkbox-action-${globalIndex}`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${checkedItems.has(globalIndex) ? "line-through text-muted-foreground" : ""}`}>
                                  {item.task}
                                </p>
                                {item.section && (
                                  <Badge variant="outline" className="text-xs mt-1">{item.section}</Badge>
                                )}
                              </div>
                              <PriorityBadge priority={item.priority} />
                            </div>
                          );
                        })}
                        {filteredActions.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">No action items.</p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="learn" className="p-4 mt-0">
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          Learning Resources ({analysis.learnLinks.length})
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Based on your manuscript's areas for improvement, here are UMA resources to strengthen your writing.
                        </p>
                        {analysis.learnLinks.map((link, i) => (
                          <Card key={i} className="p-3 hover-elevate cursor-pointer" data-testid={`card-learn-${i}`}>
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                <GraduationCap className="w-4 h-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium">{link.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
                                <Badge variant="outline" className="mt-1 text-xs">{link.topic}</Badge>
                              </div>
                            </div>
                          </Card>
                        ))}
                        {analysis.learnLinks.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">No learning resources available.</p>
                        )}
                      </div>
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

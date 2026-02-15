import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Layout,
  Zap,
  Repeat,
  ChevronDown,
  ChevronRight,
  X,
  ExternalLink,
  FlaskConical,
  Eye,
  MessageSquare,
  Search,
  Layers,
  FileText,
  Wand2,
  Download,
  Upload,
  ChevronUp,
  HelpCircle,
  Lightbulb,
  Sun,
  Moon,
  History,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/hooks/use-theme";

/** Only allow http: and https: URLs to prevent javascript: / data: XSS */
function sanitizeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return url;
    }
  } catch {
    // invalid URL
  }
  return undefined;
}

const HELP_TYPE_GROUPS = [
  {
    label: "Manuscript Sections",
    types: ["Title", "Abstract", "Introduction", "Methods", "Results", "Discussion", "Limitations", "Conclusions & Recommendations"],
  },
  {
    label: "Quality & Structure",
    types: ["Keywords", "Structural Analysis", "Language & Clarity", "Statistics", "Reference Management", "Ethics"],
  },
  {
    label: "Submission Package",
    types: ["Cover Letter", "Reviewer Response"],
  },
  {
    label: "Pre-Submission",
    types: ["Journal Selection"],
  },
];

const SECTION_HELP_TYPES = HELP_TYPE_GROUPS.flatMap((g) => g.types);

const ALL_HELP_TYPES = ["Comprehensive Review", ...SECTION_HELP_TYPES];

interface ScoreCategory {
  score: number;
  maxWeight: number;
  notes: string;
}

interface AnalysisData {
  readinessScore: number;
  summary?: string;
  executiveSummary?: string;
  paperType?: string;
  paperTypeLabel?: string;
  modulesUsed?: string[];
  documentClassification?: {
    manuscriptType?: string;
    discipline?: string;
    studyDesign?: string;
    reportingGuideline?: string;
  };
  scoreBreakdown?: {
    titleAndKeywords?: ScoreCategory;
    abstract?: ScoreCategory;
    introduction?: ScoreCategory;
    methods?: ScoreCategory;
    results?: ScoreCategory;
    discussion?: ScoreCategory;
    ethicsAndTransparency?: ScoreCategory;
    writingQuality?: ScoreCategory;
    zeroIPerspective?: ScoreCategory;
  };
  criticalIssues?: Array<{
    title: string;
    description: string;
    severity: string;
    umaReference: string;
  }>;
  detailedFeedback?: Array<{
    section: string;
    finding: string;
    suggestion: string;
    whyItMatters: string;
    severity?: string;
    resourceTopic?: string;
    resourceUrl?: string;
    resourceSource?: string;
  }>;
  actionItems?: Array<{
    task: string;
    priority: "high" | "medium" | "low";
    section?: string;
    completed: boolean;
  }>;
  abstractAnalysis?: {
    hasHook: boolean;
    hasGap: boolean;
    hasApproach: boolean;
    hasFindings: boolean;
    hasImpact: boolean;
    feedback: string;
  };
  zeroIPerspective?: {
    compliant: boolean;
    violations: string[];
    feedback: string;
  };
  strengthsToMaintain?: string[];
  learnLinks?: Array<{
    title: string;
    description: string;
    topic: string;
    url?: string;
    source?: string;
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
  const s = severity.toLowerCase();
  const isCritical = s === "critical" || s === "high";
  const isImportant = s === "important" || s === "medium";
  const variant = isCritical ? "destructive" : isImportant ? "secondary" : "outline";
  const label = isCritical ? "Critical" : isImportant ? "Important" : "Minor";
  const dotColor = isCritical ? "bg-destructive" : isImportant ? "bg-gold-dark" : "bg-primary/50";
  return (
    <Badge variant={variant} className="text-xs gap-1">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
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

function AuditGuidePanel() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="w-full text-left"
    >
      <Card className="p-3 bg-muted/30 border-dashed">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold">How to use this audit</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
        {isOpen && (
          <div className="mt-2 pt-2 border-t border-border/50 space-y-1.5 text-xs text-muted-foreground">
            <p><span className="font-medium text-foreground">1.</span> Review your <span className="font-medium">Audit Score</span> and executive summary below</p>
            <p><span className="font-medium text-foreground">2.</span> Check the <span className="font-medium">Feedback</span> tab — start with Critical items (red badges)</p>
            <p><span className="font-medium text-foreground">3.</span> Click any feedback card to highlight the relevant text in your manuscript</p>
            <p><span className="font-medium text-foreground">4.</span> Use the <span className="font-medium">Actions</span> tab to track your fixes with checkboxes</p>
            <p><span className="font-medium text-foreground">5.</span> Visit the <span className="font-medium">Learn</span> tab for resources tailored to your gaps</p>
            <p><span className="font-medium text-foreground">6.</span> After revisions, click <span className="font-medium">Re-analyze</span> to verify improvements</p>
          </div>
        )}
      </Card>
    </button>
  );
}

const PAPER_TYPES = [
  { value: "quantitative_experimental", label: "Quantitative Experimental", description: "RCTs, controlled experiments, clinical trials", icon: FlaskConical },
  { value: "observational", label: "Observational / Correlational", description: "Cohort, case-control, cross-sectional, surveys", icon: Eye },
  { value: "qualitative", label: "Qualitative", description: "Interviews, focus groups, ethnography, phenomenology", icon: MessageSquare },
  { value: "systematic_review", label: "Systematic Review", description: "Meta-analysis, PRISMA, evidence synthesis", icon: Search },
  { value: "mixed_methods", label: "Mixed Methods", description: "Combined quantitative + qualitative designs", icon: Layers },
  { value: "case_report", label: "Case Report / Case Series", description: "Clinical cases, CARE guideline, patient presentations", icon: ClipboardList },
  { value: "generic", label: "Generic Review", description: "Broad coverage for any manuscript type", icon: FileText },
];

function AnalysisOptionsDialog({
  open,
  onOpenChange,
  defaultHelpTypes,
  currentPaperType,
  manuscriptId,
  hasText,
  onConfirm,
  isAnalyzing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultHelpTypes: string[];
  currentPaperType: string;
  manuscriptId: string;
  hasText: boolean;
  onConfirm: (helpTypes: string[], paperType: string) => void;
  isAnalyzing: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [paperType, setPaperType] = useState(currentPaperType || "generic");
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<{ detectedType: string; confidence: string; explanation: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setSelected(new Set());
      setPaperType(currentPaperType || "generic");
      setDetectionResult(null);
    }
  }, [open, currentPaperType]);

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      const res = await apiRequest("POST", `/api/manuscripts/${manuscriptId}/auto-detect`);
      const result = await res.json();
      setDetectionResult(result);
      setPaperType(result.detectedType);
    } catch (err: any) {
      toast({ title: "Detection failed", description: err.message, variant: "destructive" });
    } finally {
      setIsDetecting(false);
    }
  };

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
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure AXIOM Audit</DialogTitle>
          <DialogDescription>
            Select your paper type and focus areas for the audit.
          </DialogDescription>
        </DialogHeader>
        <div className="py-3 space-y-5">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paper Type</p>
              {hasText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAutoDetect}
                  disabled={isDetecting}
                  data-testid="button-auto-detect"
                >
                  {isDetecting ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3 h-3 mr-1" />
                      Auto-detect
                    </>
                  )}
                </Button>
              )}
            </div>
            {detectionResult && (
              <div className={`text-xs p-2 rounded-md mb-2 ${
                detectionResult.confidence === "high" ? "bg-sage/10 text-sage-dark" :
                detectionResult.confidence === "medium" ? "bg-gold/10 text-gold-dark" :
                "bg-muted text-muted-foreground"
              }`} data-testid="text-detection-result">
                {detectionResult.explanation}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {PAPER_TYPES.map((pt) => {
                const Icon = pt.icon;
                return (
                  <button
                    key={pt.value}
                    onClick={() => setPaperType(pt.value)}
                    className={`flex items-start gap-2 p-2.5 rounded-md border text-left transition-colors ${
                      paperType === pt.value ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    data-testid={`option-paper-type-${pt.value}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${paperType === pt.value ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="min-w-0">
                      <span className="text-xs font-medium block">{pt.label}</span>
                      <span className="text-xs text-muted-foreground">{pt.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Audit Focus Areas</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{selected.size} selected</span>
              <Button variant="outline" size="sm" onClick={selectAll} data-testid="button-select-all">
                All
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
          {HELP_TYPE_GROUPS.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{group.label}</p>
              <div className="grid grid-cols-2 gap-2">
                {group.types.map((type) => (
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
          ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-analysis">
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(Array.from(selected), paperType)}
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
                Run Audit
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const MANUSCRIPT_STAGES = [
  { value: "draft", label: "Draft" },
  { value: "revision", label: "Revision" },
  { value: "final", label: "Final" },
  { value: "submitted", label: "Submitted" },
  { value: "published", label: "Published" },
];

function StageSelector({ manuscriptId, currentStage }: { manuscriptId: string; currentStage: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const stageMutation = useMutation({
    mutationFn: async (stage: string) => {
      const res = await apiRequest("PATCH", `/api/manuscripts/${manuscriptId}/stage`, { stage });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts", manuscriptId] });
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update stage", description: error.message, variant: "destructive" });
    },
  });

  const current = MANUSCRIPT_STAGES.find(s => s.value === currentStage) || MANUSCRIPT_STAGES[0];
  const stageIndex = MANUSCRIPT_STAGES.findIndex(s => s.value === currentStage);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border border-border hover:bg-muted/50 transition-colors"
        data-testid="button-stage-selector"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${
          stageIndex >= 4 ? "bg-sage" : stageIndex >= 2 ? "bg-primary" : "bg-gold-dark"
        }`} />
        {current.label}
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-background border rounded-md shadow-lg py-1 min-w-[120px]">
          {MANUSCRIPT_STAGES.map((stage) => (
            <button
              key={stage.value}
              onClick={() => {
                stageMutation.mutate(stage.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors flex items-center gap-2 ${
                stage.value === currentStage ? "font-semibold text-primary" : ""
              }`}
              data-testid={`option-stage-${stage.value}`}
            >
              {stage.label}
              {stage.value === currentStage && <CheckCircle2 className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UpdateTextDialog({
  open,
  onOpenChange,
  manuscriptId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manuscriptId: string;
}) {
  const [text, setText] = useState("");
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/manuscripts/${manuscriptId}/text`, { text });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts", manuscriptId] });
      toast({ title: "Manuscript Updated", description: "Your revised text has been saved. Run a new audit to see updated results." });
      onOpenChange(false);
      setText("");
    },
    onError: (error: Error) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Manuscript Text</DialogTitle>
          <DialogDescription>
            Paste your revised manuscript text below. This will replace the current text. You can then re-run the audit to check your improvements.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your revised manuscript text here..."
          className="min-h-[300px] font-mono text-sm"
          data-testid="textarea-update-text"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {text.length.toLocaleString()} characters
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={!text.trim() || updateMutation.isPending}
              data-testid="button-confirm-update-text"
            >
              {updateMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" />Update Text</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function generateExportMarkdown(analysis: AnalysisData, manuscript: Manuscript, checkedItems: Set<number>): string {
  const lines: string[] = [];

  lines.push(`# AXIOM Audit Report`);
  lines.push(`## ${manuscript.title || "Untitled Manuscript"}`);
  lines.push(`**Date:** ${new Date().toLocaleDateString()}`);
  lines.push(`**Stage:** ${manuscript.stage || "draft"}`);
  if (analysis.paperTypeLabel) lines.push(`**Paper Type:** ${analysis.paperTypeLabel}`);
  if (analysis.documentClassification) {
    const dc = analysis.documentClassification;
    if (dc.discipline) lines.push(`**Discipline:** ${dc.discipline}`);
    if (dc.studyDesign) lines.push(`**Study Design:** ${dc.studyDesign}`);
    if (dc.reportingGuideline && dc.reportingGuideline !== "N/A") lines.push(`**Reporting Guideline:** ${dc.reportingGuideline}`);
  }
  lines.push("");

  lines.push(`## Readiness Score: ${analysis.readinessScore}/100`);
  lines.push("");
  if (analysis.executiveSummary || analysis.summary) {
    lines.push(analysis.executiveSummary || analysis.summary || "");
    lines.push("");
  }

  if (analysis.scoreBreakdown) {
    lines.push(`## Score Breakdown`);
    const categories: [string, ScoreCategory | undefined][] = [
      ["Title & Keywords", analysis.scoreBreakdown.titleAndKeywords],
      ["Abstract", analysis.scoreBreakdown.abstract],
      ["Introduction", analysis.scoreBreakdown.introduction],
      ["Methods", analysis.scoreBreakdown.methods],
      ["Results", analysis.scoreBreakdown.results],
      ["Discussion", analysis.scoreBreakdown.discussion],
      ["Ethics & Transparency", analysis.scoreBreakdown.ethicsAndTransparency],
      ["Writing Quality", analysis.scoreBreakdown.writingQuality],
      ["Zero-I Perspective", analysis.scoreBreakdown.zeroIPerspective],
    ];
    for (const [label, data] of categories) {
      if (data) {
        lines.push(`- **${label}:** ${data.score}/100 (weight: ${data.maxWeight}%) — ${data.notes}`);
      }
    }
    lines.push("");
  }

  const criticalIssues = analysis.criticalIssues || [];
  if (criticalIssues.length > 0) {
    lines.push(`## Critical Issues (${criticalIssues.length})`);
    for (const issue of criticalIssues) {
      lines.push(`### ${issue.severity.toUpperCase()}: ${issue.title}`);
      lines.push(issue.description);
      lines.push(`*UMA Reference: ${issue.umaReference}*`);
      lines.push("");
    }
  }

  const feedback = analysis.detailedFeedback || [];
  if (feedback.length > 0) {
    lines.push(`## Detailed Feedback (${feedback.length} items)`);
    const sections = Array.from(new Set(feedback.map(f => f.section)));
    for (const section of sections) {
      lines.push(`### ${section}`);
      const items = feedback.filter(f => f.section === section);
      for (const fb of items) {
        lines.push(`**[${(fb.severity || "minor").toUpperCase()}]** ${fb.finding}`);
        lines.push(`> Suggestion: ${fb.suggestion}`);
        if (fb.whyItMatters) lines.push(`> Why it matters: ${fb.whyItMatters}`);
        lines.push("");
      }
    }
  }

  const actionItems = analysis.actionItems || [];
  if (actionItems.length > 0) {
    lines.push(`## Action Items (${checkedItems.size}/${actionItems.length} completed)`);
    for (let i = 0; i < actionItems.length; i++) {
      const item = actionItems[i];
      const checked = checkedItems.has(i) ? "x" : " ";
      lines.push(`- [${checked}] **[${item.priority}]** ${item.task}${item.section ? ` *(${item.section})*` : ""}`);
    }
    lines.push("");
  }

  if (analysis.strengthsToMaintain && analysis.strengthsToMaintain.length > 0) {
    lines.push(`## Strengths to Maintain`);
    for (const s of analysis.strengthsToMaintain) {
      lines.push(`- ${s}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("*Generated by AXIOM — Universal Manuscript Architecture Audit*");

  return lines.join("\n");
}

function generateExportHTML(analysis: AnalysisData, manuscript: Manuscript, checkedItems: Set<number>): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const score = analysis.readinessScore ?? 0;
  const scoreColor = score >= 75 ? "#16a34a" : score >= 50 ? "#ca8a04" : "#dc2626";

  const feedbackBySection: Record<string, typeof analysis.detailedFeedback> = {};
  for (const fb of (analysis.detailedFeedback || [])) {
    const sec = fb.section || "General";
    if (!feedbackBySection[sec]) feedbackBySection[sec] = [];
    feedbackBySection[sec].push(fb);
  }

  const severityColor = (s: string) => {
    if (s === "critical") return "#dc2626";
    if (s === "important") return "#ca8a04";
    return "#6b7280";
  };
  const priorityColor = (p: string) => {
    if (p === "high") return "#dc2626";
    if (p === "medium") return "#ca8a04";
    return "#6b7280";
  };

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>AXIOM Audit Report — ${esc(manuscript.title || "Untitled")}</title>
<style>
  @page { margin: 0.75in; size: letter; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1a1a1a; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px; font-size: 11pt; }
  h1 { font-size: 20pt; margin: 0 0 4px; color: #111; }
  h2 { font-size: 14pt; margin: 24px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #e5e7eb; color: #111; }
  h3 { font-size: 12pt; margin: 16px 0 6px; color: #374151; }
  .meta { color: #6b7280; font-size: 10pt; margin-bottom: 20px; }
  .meta span { margin-right: 16px; }
  .score-ring { display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; border-radius: 50%; border: 6px solid ${scoreColor}; font-size: 22pt; font-weight: 700; color: ${scoreColor}; margin-right: 16px; }
  .score-section { display: flex; align-items: center; margin: 16px 0 20px; }
  .score-label { font-size: 10pt; color: #6b7280; }
  .badge { display: inline-block; padding: 1px 8px; border-radius: 4px; font-size: 8pt; font-weight: 600; text-transform: uppercase; color: white; margin-right: 4px; }
  .summary { background: #f9fafb; border-left: 3px solid #6366f1; padding: 12px 16px; margin: 12px 0; font-size: 10pt; border-radius: 0 4px 4px 0; }
  .feedback-card { border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 14px; margin: 8px 0; page-break-inside: avoid; }
  .feedback-card .finding { font-size: 10pt; margin: 4px 0; }
  .feedback-card .suggestion { font-size: 9pt; color: #4b5563; background: #f3f4f6; padding: 6px 10px; border-radius: 4px; margin-top: 6px; }
  .action-item { display: flex; align-items: flex-start; gap: 8px; margin: 6px 0; font-size: 10pt; }
  .action-item .checkbox { width: 14px; height: 14px; border: 2px solid #d1d5db; border-radius: 3px; flex-shrink: 0; margin-top: 2px; display: flex; align-items: center; justify-content: center; font-size: 10px; }
  .action-item .checkbox.checked { background: #6366f1; border-color: #6366f1; color: white; }
  .breakdown-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 10pt; }
  .breakdown-bar { height: 6px; border-radius: 3px; background: #e5e7eb; flex: 1; margin: 0 12px; max-width: 200px; }
  .breakdown-bar-fill { height: 100%; border-radius: 3px; background: #6366f1; }
  .strength { font-size: 10pt; padding: 4px 0; }
  .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 9pt; color: #9ca3af; text-align: center; }
  @media print { body { padding: 0; } }
</style></head><body>
<h1>AXIOM Audit Report</h1>
<div class="meta">
  <span><strong>${esc(manuscript.title || "Untitled Manuscript")}</strong></span><br>
  <span>Date: ${new Date().toLocaleDateString()}</span>
  <span>Stage: ${esc(manuscript.stage || "draft")}</span>
  ${analysis.paperTypeLabel ? `<span>Type: ${esc(analysis.paperTypeLabel)}</span>` : ""}
</div>

<div class="score-section">
  <div class="score-ring">${score}</div>
  <div>
    <div style="font-size:14pt;font-weight:700;color:${scoreColor}">${score >= 75 ? "Submission Ready" : score >= 50 ? "Revisions Needed" : "Major Work Needed"}</div>
    <div class="score-label">Readiness Score out of 100</div>
  </div>
</div>

${(analysis.executiveSummary || analysis.summary) ? `<div class="summary">${esc(analysis.executiveSummary || analysis.summary || "")}</div>` : ""}

${analysis.scoreBreakdown ? `<h2>Score Breakdown</h2>
${[
  ["Title & Keywords", analysis.scoreBreakdown.titleAndKeywords],
  ["Abstract", analysis.scoreBreakdown.abstract],
  ["Introduction", analysis.scoreBreakdown.introduction],
  ["Methods", analysis.scoreBreakdown.methods],
  ["Results", analysis.scoreBreakdown.results],
  ["Discussion", analysis.scoreBreakdown.discussion],
  ["Ethics & Transparency", analysis.scoreBreakdown.ethicsAndTransparency],
  ["Writing Quality", analysis.scoreBreakdown.writingQuality],
  ["Zero-I Perspective", analysis.scoreBreakdown.zeroIPerspective],
].filter(([, d]) => d).map(([label, data]: any) => `<div class="breakdown-row">
  <span style="min-width:140px">${label}</span>
  <div class="breakdown-bar"><div class="breakdown-bar-fill" style="width:${data.score}%"></div></div>
  <span style="min-width:50px;text-align:right;font-weight:600">${data.score}/100</span>
</div>`).join("")}` : ""}

${(analysis.criticalIssues || []).length > 0 ? `<h2>Critical Issues (${analysis.criticalIssues!.length})</h2>
${analysis.criticalIssues!.map(issue => `<div class="feedback-card" style="border-left:3px solid #dc2626">
  <div><span class="badge" style="background:${severityColor(issue.severity)}">${esc(issue.severity)}</span> <strong>${esc(issue.title)}</strong></div>
  <div class="finding">${esc(issue.description)}</div>
  <div style="font-size:9pt;color:#6b7280;margin-top:4px"><em>UMA: ${esc(issue.umaReference)}</em></div>
</div>`).join("")}` : ""}

${Object.keys(feedbackBySection).length > 0 ? `<h2>Detailed Feedback (${(analysis.detailedFeedback || []).length} items)</h2>
${Object.entries(feedbackBySection).map(([section, items]) => `<h3>${esc(section)}</h3>
${items!.map(fb => `<div class="feedback-card">
  <div><span class="badge" style="background:${severityColor(fb.severity || "minor")}">${esc(fb.severity || "minor")}</span> ${esc(fb.finding)}</div>
  <div class="suggestion"><strong>Fix:</strong> ${esc(fb.suggestion)}</div>
</div>`).join("")}`).join("")}` : ""}

${(analysis.actionItems || []).length > 0 ? `<h2>Action Items (${checkedItems.size}/${analysis.actionItems!.length} completed)</h2>
${analysis.actionItems!.map((item, i) => `<div class="action-item">
  <div class="checkbox ${checkedItems.has(i) ? "checked" : ""}">${checkedItems.has(i) ? "✓" : ""}</div>
  <div><span class="badge" style="background:${priorityColor(item.priority)}">${esc(item.priority)}</span> ${esc(item.task)}${item.section ? ` <em style="color:#6b7280">(${esc(item.section)})</em>` : ""}</div>
</div>`).join("")}` : ""}

${(analysis.strengthsToMaintain || []).length > 0 ? `<h2>Strengths to Maintain</h2>
${analysis.strengthsToMaintain!.map(s => `<div class="strength">✓ ${esc(s)}</div>`).join("")}` : ""}

<div class="footer">Generated by AXIOM — Universal Manuscript Architecture Audit</div>
</body></html>`;
}

const CATEGORY_TIPS: Record<string, string> = {
  titleAndKeywords: "Add 4-5 discipline-specific keywords (MeSH terms for biomedical). Keep title under 15 words with key finding.",
  abstract: "Follow the 5-Move structure: Hook, Gap, Approach, Findings (with numbers), Impact. Stay under 250 words.",
  introduction: "End with an explicit gap statement and research questions. Cite 10-30 relevant papers.",
  methods: "Enough detail for replication: instruments, sample size justification, exact statistical tests, software versions.",
  results: "Report every test with statistic, df, exact p-value, effect size, and 95% CI. Mirror Methods order.",
  discussion: "Start with findings restatement, compare to 5-10 key papers, discuss implications, then limitations.",
  ethicsAndTransparency: "Include IRB number, consent method, conflict of interest statement, data availability, and CRediT roles.",
  writingQuality: "Use correct tense per section (Methods = past, Discussion = present). Replace vague language with numbers.",
  zeroIPerspective: "Replace 'I/we found' with 'Results indicated' or 'The analysis revealed'. Maintain formal academic voice.",
};

function ScoreBreakdownPanel({ breakdown, onClose }: { breakdown: NonNullable<AnalysisData["scoreBreakdown"]>; onClose: () => void }) {
  const categories = [
    { key: "titleAndKeywords", label: "Title & Keywords", data: breakdown.titleAndKeywords },
    { key: "abstract", label: "Abstract", data: breakdown.abstract },
    { key: "introduction", label: "Introduction", data: breakdown.introduction },
    { key: "methods", label: "Methods", data: breakdown.methods },
    { key: "results", label: "Results", data: breakdown.results },
    { key: "discussion", label: "Discussion", data: breakdown.discussion },
    { key: "ethicsAndTransparency", label: "Ethics & Transparency", data: breakdown.ethicsAndTransparency },
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
        Your audit score is a weighted average across these categories. Each category is scored 0-100 and weighted by its importance to publication compliance. Categories scoring below 75 include improvement tips.
      </p>
      <div className="space-y-3">
        {categories.map(({ key, label, data }) => (
          <div key={key}>
            <ScoreBar label={label} score={data!.score} weight={data!.maxWeight} />
            {data!.notes && (
              <p className="text-xs text-muted-foreground mt-1 pl-1">{data!.notes}</p>
            )}
            {data!.score < 75 && CATEGORY_TIPS[key] && (
              <p className="text-xs text-primary/70 mt-1 pl-1 flex items-start gap-1">
                <Lightbulb className="w-3 h-3 shrink-0 mt-0.5" />
                {CATEGORY_TIPS[key]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface AuditHistoryEntry {
  id: string;
  readinessScore: number;
  criticalIssueCount: number;
  feedbackCount: number;
  actionItemCount: number;
  createdAt: string;
}

function AuditScoreTrend({ manuscriptId }: { manuscriptId: string }) {
  const { data: history = [] } = useQuery<AuditHistoryEntry[]>({
    queryKey: ["/api/manuscripts", manuscriptId, "history"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/manuscripts/${manuscriptId}/history`);
      return res.json();
    },
  });

  if (history.length < 2) return null;

  const sorted = [...history].reverse(); // oldest first
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  const delta = latest.readinessScore - previous.readinessScore;
  const DeltaIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const deltaColor = delta > 0 ? "text-green-600" : delta < 0 ? "text-red-500" : "text-muted-foreground";

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <History className="w-4 h-4 text-primary" />
        Score History
        <Badge variant="secondary" className="text-[10px]">{history.length} audits</Badge>
      </h3>
      <Card className="p-3">
        <div className="flex items-center gap-3 mb-3">
          <DeltaIcon className={`w-5 h-5 ${deltaColor}`} />
          <span className={`text-lg font-bold ${deltaColor}`}>
            {delta > 0 ? "+" : ""}{delta} points
          </span>
          <span className="text-xs text-muted-foreground">vs previous audit</span>
        </div>

        <div className="flex items-end gap-1 h-16">
          {sorted.map((entry, i) => {
            const height = `${Math.max(8, entry.readinessScore)}%`;
            const isLatest = i === sorted.length - 1;
            return (
              <Tooltip key={entry.id}>
                <TooltipTrigger asChild>
                  <div
                    className={`flex-1 rounded-t-sm transition-all cursor-help ${isLatest ? "bg-primary" : "bg-primary/30"}`}
                    style={{ height }}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-semibold">{entry.readinessScore}/100</p>
                  <p className="text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-muted-foreground">
                    {entry.criticalIssueCount} critical, {entry.feedbackCount} feedback
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>{new Date(sorted[0].createdAt).toLocaleDateString()}</span>
          <span>{new Date(sorted[sorted.length - 1].createdAt).toLocaleDateString()}</span>
        </div>
      </Card>
    </div>
  );
}

export default function ManuscriptWorkspace() {
  const [, navigate] = useLocation();
  const [matched, params] = useRoute("/manuscript/:id");
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [checkedItemsLoaded, setCheckedItemsLoaded] = useState(false);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [showUpdateTextDialog, setShowUpdateTextDialog] = useState(false);
  const [feedbackFilter, setFeedbackFilter] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [extractionAttempted, setExtractionAttempted] = useState(false);
  const [highlightText, setHighlightText] = useState<string | null>(null);
  const manuscriptContentRef = useRef<HTMLDivElement>(null);
  const manuscriptTextRef = useRef<string>("");

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
    mutationFn: async ({ helpTypes, paperType }: { helpTypes: string[]; paperType: string }) => {
      setShowAnalysisDialog(false);
      const res = await apiRequest("POST", `/api/manuscripts/${manuscriptId}/analyze`, { helpTypes, paperType });
      return res.json();
    },
    onSuccess: (_data, { helpTypes }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts", manuscriptId] });
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts", manuscriptId, "history"] });
      // Reset UI state that references old analysis data
      setCheckedItems(new Set());
      setCheckedItemsLoaded(false);
      setFeedbackFilter(null);
      setActionFilter(null);
      setExpandedSections(new Set());
      setShowScoreBreakdown(false);
      setHighlightText(null);
      const isComprehensive = helpTypes.includes("Comprehensive Review") || helpTypes.length >= SECTION_HELP_TYPES.length;
      const description = isComprehensive
        ? "AXIOM has completed a comprehensive audit of your manuscript."
        : `AXIOM has completed audit of: ${helpTypes.join(", ")}.`;
      toast({ title: "Audit Complete", description });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({ title: "Audit Failed", description: error.message, variant: "destructive" });
    },
  });

  const actionItemsMutation = useMutation({
    mutationFn: async (completedIndices: number[]) => {
      const res = await apiRequest("PATCH", `/api/manuscripts/${manuscriptId}/action-items`, { completedIndices });
      return res.json();
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
      // Persist to DB
      actionItemsMutation.mutate(Array.from(next));
      return next;
    });
  };


  const extractQuotedText = useCallback((text: string): string | null => {
    const normalized = text.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
    const doubleQuoted = normalized.match(/"([^"]{8,})"/g);
    if (doubleQuoted && doubleQuoted.length > 0) {
      return doubleQuoted[0].replace(/^"|"$/g, "");
    }
    const singleQuoted = normalized.match(/'([^']{8,})'/g);
    if (singleQuoted && singleQuoted.length > 0) {
      return singleQuoted[0].replace(/^'|'$/g, "");
    }
    return null;
  }, []);

  const findBestMatch = useCallback((finding: string, section: string, fullText: string): string | null => {
    if (!fullText) return null;
    const lowerFull = fullText.toLowerCase();

    const quoted = extractQuotedText(finding);
    if (quoted && lowerFull.includes(quoted.toLowerCase())) {
      return quoted;
    }

    const sectionLower = section.toLowerCase();
    if (sectionLower === "title" || sectionLower === "title/keywords") {
      const firstLine = fullText.split(/\n/).find(l => l.trim().length > 0);
      if (firstLine && firstLine.trim().length >= 5) {
        return firstLine.trim();
      }
    }

    const sectionHeaders = [
      section,
      section.toLowerCase(),
      section.toUpperCase(),
      `${section}:`,
      `${section.toUpperCase()}:`,
    ];
    for (const header of sectionHeaders) {
      if (lowerFull.includes(header.toLowerCase())) {
        return header;
      }
    }

    const words = finding.split(/\s+/).filter(w => w.length > 4);
    for (let len = Math.min(6, words.length); len >= 3; len--) {
      for (let i = 0; i <= words.length - len; i++) {
        const phrase = words.slice(i, i + len).join(" ");
        if (lowerFull.includes(phrase.toLowerCase())) {
          return phrase;
        }
      }
    }

    return null;
  }, [extractQuotedText]);

  const handleFeedbackClick = useCallback((finding: string, section: string) => {
    const sectionLower = section.toLowerCase();
    const isTopSection = sectionLower === "title" || sectionLower === "title/keywords" || sectionLower === "keywords";

    const match = findBestMatch(finding, section, manuscriptTextRef.current);

    if (!match && isTopSection) {
      setHighlightText(null);
      setTimeout(() => {
        const el = manuscriptContentRef.current;
        if (el) {
          el.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 50);
      return;
    }

    if (!match) {
      toast({ title: "Location not found", description: `Could not locate the "${section}" reference in the manuscript text.` });
      return;
    }
    setHighlightText(match);

    setTimeout(() => {
      const el = manuscriptContentRef.current;
      if (!el) return;
      const mark = el.querySelector("mark");
      if (mark) {
        mark.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }, [findBestMatch, toast]);

  // Load checked action items from DB when analysis data is available
  useEffect(() => {
    if (manuscript?.analysisJson && !checkedItemsLoaded) {
      const analysis = manuscript.analysisJson as AnalysisData;
      if (Array.isArray(analysis.actionItems)) {
        const completed = new Set<number>();
        analysis.actionItems.forEach((item, idx) => {
          if (item.completed) completed.add(idx);
        });
        setCheckedItems(completed);
      }
      setCheckedItemsLoaded(true);
    }
  }, [manuscript?.analysisJson, checkedItemsLoaded]);

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
          <div className="flex flex-col lg:flex-row gap-4">
            <Skeleton className="h-[50vh] lg:h-[80vh] w-full lg:w-[60%]" />
            <Skeleton className="h-[50vh] lg:h-[80vh] w-full lg:w-[40%]" />
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
  manuscriptTextRef.current = manuscriptText;
  const isReExtracting = extractMutation.isPending;

  const handleExportMarkdown = () => {
    if (!analysis || !manuscript) return;
    const markdown = generateExportMarkdown(analysis, manuscript, checkedItems);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `axiom-audit-${(manuscript.title || "manuscript").replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Report Downloaded", description: "Your audit report has been saved as a Markdown file." });
  };

  const handleExportPDF = () => {
    if (!analysis || !manuscript) return;
    const html = generateExportHTML(analysis, manuscript, checkedItems);
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Popup Blocked", description: "Allow popups to export as PDF.", variant: "destructive" });
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => printWindow.print(), 300);
    };
    toast({ title: "PDF Ready", description: "Use Print > Save as PDF in the dialog." });
  };

  const [showExportMenu, setShowExportMenu] = useState(false);

  // Close export menu when clicking outside
  useEffect(() => {
    if (!showExportMenu) return;
    const handler = () => setShowExportMenu(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showExportMenu]);

  const detailedFeedback = analysis?.detailedFeedback || [];
  const actionItems = analysis?.actionItems || [];
  const criticalIssues = analysis?.criticalIssues || [];

  const feedbackSections = hasAnalysis
    ? Array.from(new Set(detailedFeedback.map((f) => f.section)))
    : [];

  const actionSections = hasAnalysis
    ? Array.from(new Set(actionItems.filter((a) => a.section).map((a) => a.section!)))
    : [];

  const filteredFeedback = hasAnalysis
    ? feedbackFilter
      ? detailedFeedback.filter((f) => f.section === feedbackFilter)
      : detailedFeedback
    : [];

  const filteredActions = hasAnalysis
    ? actionFilter
      ? actionItems.filter((a) => a.section === actionFilter)
      : actionItems
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
        <div className="max-w-[95%] mx-auto flex items-center justify-between gap-2 sm:gap-4 py-2 sm:py-3 px-3 sm:px-4 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold truncate" data-testid="text-manuscript-title">
                {manuscript.title || "Untitled Manuscript"}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <StageSelector manuscriptId={manuscript.id} currentStage={manuscript.stage || "draft"} />
                {manuscript.fileName && (
                  <span className="text-xs text-muted-foreground hidden sm:inline">{manuscript.fileName}</span>
                )}
                {manuscript.paperType && manuscript.paperType !== "generic" && (
                  <Badge variant="outline" className="text-xs" data-testid="badge-paper-type">
                    {PAPER_TYPES.find(pt => pt.value === manuscript.paperType)?.label || manuscript.paperType}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors shrink-0"
              data-testid="button-theme-toggle"
            >
              {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {manuscriptText && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpdateTextDialog(true)}
                data-testid="button-update-text"
                className="px-2 sm:px-3"
              >
                <Upload className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Update Text</span>
              </Button>
            )}
            {hasAnalysis && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  data-testid="button-export-report"
                  className="px-2 sm:px-3"
                >
                  <Download className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-md py-1 w-40 animate-in fade-in slide-in-from-top-1">
                    <button
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                      onClick={() => { handleExportPDF(); setShowExportMenu(false); }}
                      data-testid="button-export-pdf"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Export as PDF
                    </button>
                    <button
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                      onClick={() => { handleExportMarkdown(); setShowExportMenu(false); }}
                      data-testid="button-export-markdown"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Export as Markdown
                    </button>
                  </div>
                )}
              </div>
            )}
            <Button
              variant={hasAnalysis ? "outline" : "default"}
              size="sm"
              onClick={() => setShowAnalysisDialog(true)}
              disabled={isAnalyzing || !manuscriptText}
              data-testid="button-run-analysis"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 sm:mr-2 animate-spin" />
                  <span className="hidden sm:inline">Analyzing...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : hasAnalysis ? (
                <>
                  <RefreshCw className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Re-analyze</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Run AXIOM Audit</span>
                  <span className="sm:hidden">Audit</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <AnalysisOptionsDialog
        open={showAnalysisDialog}
        onOpenChange={setShowAnalysisDialog}
        defaultHelpTypes={manuscript.helpTypes && manuscript.helpTypes.length > 0 ? manuscript.helpTypes : ALL_HELP_TYPES}
        currentPaperType={manuscript.paperType || "generic"}
        manuscriptId={manuscript.id}
        hasText={!!manuscriptText}
        onConfirm={(helpTypes, paperType) => analyzeMutation.mutate({ helpTypes, paperType })}
        isAnalyzing={analyzeMutation.isPending}
      />

      <UpdateTextDialog
        open={showUpdateTextDialog}
        onOpenChange={setShowUpdateTextDialog}
        manuscriptId={manuscript.id}
      />

      <div className="max-w-[95%] mx-auto p-2 sm:p-4">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4" style={{ minHeight: "calc(100vh - 100px)" }}>
          <div className="w-full lg:w-[60%]">
            <Card className="h-full flex flex-col">
              <div className="p-3 sm:p-4 border-b flex items-center gap-2 flex-wrap">
                <BookOpen className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold">Manuscript Content</h2>
                {highlightText && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHighlightText(null)}
                    className="ml-2"
                    data-testid="button-clear-highlight"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear highlight
                  </Button>
                )}
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
              <ScrollArea className="flex-1 p-3 sm:p-4 h-[50vh] lg:h-[calc(100vh-180px)]">
                {manuscriptText ? (
                  <div ref={manuscriptContentRef} className="whitespace-pre-wrap text-sm leading-relaxed font-mono" data-testid="text-manuscript-content">
                    {highlightText ? (() => {
                      const lowerText = manuscriptText.toLowerCase();
                      const lowerSearch = highlightText.toLowerCase();
                      const idx = lowerText.indexOf(lowerSearch);
                      if (idx === -1) return manuscriptText;
                      const before = manuscriptText.slice(0, idx);
                      const match = manuscriptText.slice(idx, idx + highlightText.length);
                      const after = manuscriptText.slice(idx + highlightText.length);
                      return (
                        <>
                          {before}
                          <mark className="bg-gold/40 text-foreground rounded px-0.5">{match}</mark>
                          {after}
                        </>
                      );
                    })() : manuscriptText}
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
                  <h3 className="text-lg font-semibold text-primary mb-2">AXIOM is Auditing</h3>
                  <p className="text-sm text-muted-foreground">
                    Running section-by-section rigor check against UMA framework...
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">This may take 30-60 seconds for a thorough audit</p>
                </div>
              </Card>
            ) : !hasAnalysis ? (
              <Card className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Audit</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click "Run AXIOM Audit" to stress-test your manuscript section-by-section against the Universal Manuscript Architecture.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    AXIOM will validate every section, check the 5-Move Abstract, Zero-I Perspective, and surface all compliance gaps.
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex flex-col">
                <Tabs defaultValue="overview" className="flex flex-col h-full">
                  <div className="p-2 sm:p-3 border-b">
                    <TabsList className="w-full">
                      <TabsTrigger value="overview" className="flex-1 text-[11px] sm:text-xs px-1 sm:px-3" data-testid="tab-overview">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="feedback" className="flex-1 text-[11px] sm:text-xs px-1 sm:px-3" data-testid="tab-feedback">
                        Feedback ({detailedFeedback.length})
                      </TabsTrigger>
                      <TabsTrigger value="actions" className="flex-1 text-[11px] sm:text-xs px-1 sm:px-3" data-testid="tab-actions">
                        Actions ({actionItems.length})
                      </TabsTrigger>
                      <TabsTrigger value="learn" className="flex-1 text-[11px] sm:text-xs px-1 sm:px-3" data-testid="tab-learn">
                        Learn
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <ScrollArea className="flex-1 h-[50vh] lg:h-[calc(100vh-230px)]">
                    <TabsContent value="overview" className="p-4 mt-0">
                      <div className="space-y-6">
                        <AuditGuidePanel />
                        {(analysis.documentClassification || analysis.paperTypeLabel) && (
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.paperTypeLabel && (
                              <Badge variant="default" className="text-xs" data-testid="badge-audit-paper-type">{analysis.paperTypeLabel}</Badge>
                            )}
                            {analysis.documentClassification?.manuscriptType && (
                              <Badge variant="outline" className="text-xs">{analysis.documentClassification.manuscriptType}</Badge>
                            )}
                            {analysis.documentClassification?.discipline && (
                              <Badge variant="outline" className="text-xs">{analysis.documentClassification.discipline}</Badge>
                            )}
                            {analysis.documentClassification?.studyDesign && (
                              <Badge variant="outline" className="text-xs">{analysis.documentClassification.studyDesign}</Badge>
                            )}
                            {analysis.documentClassification?.reportingGuideline && analysis.documentClassification.reportingGuideline !== "N/A" && (
                              <Badge variant="secondary" className="text-xs">{analysis.documentClassification.reportingGuideline}</Badge>
                            )}
                          </div>
                        )}

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1.5 mb-3">
                            <h3 className="text-sm font-semibold text-muted-foreground">Audit Score</h3>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-[220px]">
                                <p className="font-medium mb-1">Readiness Scale</p>
                                <div className="space-y-0.5 text-xs">
                                  <p><span className="text-sage font-medium">75-100:</span> Submission-ready</p>
                                  <p><span className="text-gold-dark font-medium">50-74:</span> Revisions needed</p>
                                  <p><span className="text-destructive font-medium">0-49:</span> Major work needed</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <ScoreRing score={analysis.readinessScore} />
                          <p className="text-sm text-muted-foreground mt-3">{analysis.executiveSummary || analysis.summary}</p>
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

                        <AuditScoreTrend manuscriptId={manuscriptId!} />

                        {analysis.abstractAnalysis && (
                        <div>
                          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            5-Move Abstract Check
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-[250px]">
                                Top-tier abstracts follow a 5-part structure: Hook (why it matters), Gap (what's missing), Approach (what you did), Findings (key results with numbers), and Impact (so what). Missing any of these weakens your abstract.
                              </TooltipContent>
                            </Tooltip>
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
                        )}

                        {analysis.zeroIPerspective && (
                        <div>
                          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-primary" />
                            Zero-I Perspective
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-[250px]">
                                Academic writing convention: avoid first-person pronouns ("I", "we", "my") in formal manuscripts. Use passive voice or third-person instead. Some journals accept first-person, but most top-tier journals expect formal voice.
                              </TooltipContent>
                            </Tooltip>
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
                        )}

                        {criticalIssues.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-destructive" />
                              Critical Issues ({criticalIssues.length})
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-[250px]">
                                  Critical issues are violations likely to trigger desk rejection or Major Revisions. Fix these FIRST before addressing other feedback.
                                </TooltipContent>
                              </Tooltip>
                            </h3>
                            <div className="space-y-2">
                              {criticalIssues.map((issue, i) => (
                                <Card key={i} className="p-3">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <span className="text-sm font-medium">{issue.title}</span>
                                    <SeverityBadge severity={issue.severity} />
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-1">{issue.description}</p>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <p className="text-xs text-primary/70 cursor-help inline-flex items-center gap-1">
                                        UMA: {issue.umaReference}
                                        <HelpCircle className="w-3 h-3" />
                                      </p>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="max-w-[220px]">
                                      UMA = Universal Manuscript Architecture. This references the specific audit phase where this issue was detected.
                                    </TooltipContent>
                                  </Tooltip>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        {analysis.strengthsToMaintain && analysis.strengthsToMaintain.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-sage" />
                              Strengths to Maintain
                            </h3>
                            <Card className="p-3">
                              <ul className="space-y-2">
                                {analysis.strengthsToMaintain.map((strength, i) => (
                                  <li key={i} className="text-xs flex items-start gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-sage shrink-0 mt-0.5" />
                                    <span className="text-foreground">{strength}</span>
                                  </li>
                                ))}
                              </ul>
                            </Card>
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
                                {section} ({detailedFeedback.filter((f) => f.section === section).length})
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
                                <Card
                                  key={i}
                                  className="p-3 mb-2 cursor-pointer hover-elevate"
                                  onClick={() => handleFeedbackClick(fb.finding, fb.section)}
                                  data-testid={`card-feedback-${fb.section.toLowerCase().replace(/[^a-z]/g, "-")}-${i}`}
                                >
                                  <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                                    {feedbackFilter !== null && (
                                      <Badge variant="outline" className="text-xs">{fb.section}</Badge>
                                    )}
                                    {fb.severity && <SeverityBadge severity={fb.severity} />}
                                  </div>
                                  <p className="text-sm font-medium mb-1">{fb.finding}</p>
                                  <p className="text-sm text-sage-dark mb-2">{fb.suggestion}</p>
                                  <div className="bg-primary/5 rounded-md p-2">
                                    <p className="text-xs font-medium text-primary mb-0.5">Why it Matters (UMA)</p>
                                    <p className="text-xs text-muted-foreground">{fb.whyItMatters}</p>
                                  </div>
                                  {sanitizeUrl(fb.resourceUrl) && (
                                    <a
                                      href={sanitizeUrl(fb.resourceUrl)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-xs text-primary mt-2 flex items-center gap-1 hover:underline"
                                      data-testid={`link-resource-${fb.section.toLowerCase().replace(/[^a-z]/g, "-")}-${i}`}
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      Learn More: {fb.resourceSource || "Reference"}
                                    </a>
                                  )}
                                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    Click to locate in manuscript
                                  </p>
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

                        {/* Priority Roadmap */}
                        {actionItems.length > 0 && (() => {
                          const highCount = actionItems.filter(a => a.priority === "high").length;
                          const medCount = actionItems.filter(a => a.priority === "medium").length;
                          const lowCount = actionItems.filter(a => a.priority === "low").length;
                          const highDone = actionItems.filter((a, i) => a.priority === "high" && checkedItems.has(i)).length;
                          const medDone = actionItems.filter((a, i) => a.priority === "medium" && checkedItems.has(i)).length;
                          const lowDone = actionItems.filter((a, i) => a.priority === "low" && checkedItems.has(i)).length;
                          return (
                            <Card className="p-3 bg-muted/30 border-dashed">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Lightbulb className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-semibold">Recommended Fix Order</span>
                              </div>
                              <div className="space-y-1.5">
                                {highCount > 0 && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className={highDone === highCount ? "line-through text-muted-foreground" : "text-destructive font-medium"}>
                                      1. Fix {highCount} high-priority items first
                                    </span>
                                    <span className="text-muted-foreground">{highDone}/{highCount}</span>
                                  </div>
                                )}
                                {medCount > 0 && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className={medDone === medCount ? "line-through text-muted-foreground" : ""}>
                                      2. Address {medCount} medium-priority items
                                    </span>
                                    <span className="text-muted-foreground">{medDone}/{medCount}</span>
                                  </div>
                                )}
                                {lowCount > 0 && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className={lowDone === lowCount ? "line-through text-muted-foreground" : "text-muted-foreground"}>
                                      3. Polish {lowCount} minor items
                                    </span>
                                    <span className="text-muted-foreground">{lowDone}/{lowCount}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-2">After fixes, click "Re-analyze" to verify improvements.</p>
                            </Card>
                          );
                        })()}

                        {actionSections.length > 1 && (
                          <div className="flex flex-wrap gap-1">
                            <Badge
                              variant={actionFilter === null ? "default" : "outline"}
                              className="cursor-pointer text-xs"
                              onClick={() => setActionFilter(null)}
                              data-testid="filter-actions-all"
                            >
                              All ({actionItems.length})
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
                          const globalIndex = actionItems.indexOf(item);
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
                      <div className="space-y-6">
                        {/* AXIOM Advanced Workflow Strategies Section */}
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-primary" />
                            AXIOM Advanced Workflow Strategies
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Professional writing strategies to reduce cognitive load and overcome writer's block.
                          </p>
                          <div className="grid grid-cols-1 gap-3">
                            {[
                              {
                                title: "Inverted Assembly Line",
                                description: "Stop writing linearly. Start with Figures and Methods to build momentum.",
                                icon: <Layout className="w-3 h-3" />
                              },
                              {
                                title: "Zero Draft Protocol",
                                description: "Separate generation from evaluation. Write fast, edit later.",
                                icon: <Zap className="w-3 h-3" />
                              },
                              {
                                title: "Three-Move Methods Loop",
                                description: "Contextualize, Describe, and Justify every methodological choice.",
                                icon: <Repeat className="w-3 h-3" />
                              }
                            ].map((strategy, i) => (
                              <Card key={i} className="p-3 border-dashed bg-muted/30">
                                <div className="flex items-start gap-2">
                                  <div className="mt-0.5 p-1 rounded-sm bg-primary/10 text-primary">
                                    {strategy.icon}
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-medium">{strategy.title}</h4>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{strategy.description}</p>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                          <a 
                            href="https://lennartnacke.com/reviewer-2-cant-touch-a-paper-structured-like-this/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block text-[10px] text-primary hover:underline mt-2"
                          >
                            View full Advanced Writing Workflow by Lennart Nacke →
                          </a>
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                          <h3 className="text-sm font-semibold flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-primary" />
                            Learning Resources ({(analysis.learnLinks || []).length})
                          </h3>
                        <p className="text-xs text-muted-foreground">
                          Curated for your manuscript based on the specific gaps flagged in your audit. Each resource links to authoritative sources (ICMJE, EQUATOR, APA, COPE).
                        </p>
                        {(analysis.learnLinks || []).map((link, i) => (
                          <a
                            key={i}
                            href={sanitizeUrl(link.url) || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                            data-testid={`card-learn-${i}`}
                          >
                            <Card className="p-3 hover-elevate cursor-pointer">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                  <GraduationCap className="w-4 h-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium">{link.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <Badge variant="outline" className="text-xs">{link.topic}</Badge>
                                    {link.source && (
                                      <Badge variant="secondary" className="text-xs">{link.source}</Badge>
                                    )}
                                    {link.url && (
                                      <span className="text-xs text-primary underline">Visit resource</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </a>
                        ))}
                        {(!analysis.learnLinks || analysis.learnLinks.length === 0) && (
                          <p className="text-sm text-muted-foreground text-center py-4">No learning resources available.</p>
                        )}
                      </div>
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

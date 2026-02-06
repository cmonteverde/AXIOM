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
} from "lucide-react";

interface AnalysisData {
  readinessScore: number;
  summary: string;
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

export default function ManuscriptWorkspace() {
  const [, navigate] = useLocation();
  const [matched, params] = useRoute("/manuscript/:id");
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

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

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/manuscripts/${manuscriptId}/analyze`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts", manuscriptId] });
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts"] });
      toast({ title: "Analysis Complete", description: "Your manuscript has been reviewed by SAGE." });
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
  const isAnalyzing = manuscript.analysisStatus === "processing" || analyzeMutation.isPending;
  const manuscriptText = manuscript.fullText || manuscript.previewText || "";

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
            {hasAnalysis && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => analyzeMutation.mutate()}
                disabled={isAnalyzing}
                data-testid="button-reanalyze"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
                Re-analyze
              </Button>
            )}
            {!hasAnalysis && (
              <Button
                onClick={() => analyzeMutation.mutate()}
                disabled={isAnalyzing || !manuscriptText}
                data-testid="button-run-analysis"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Run SAGE Analysis
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[95%] mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-4" style={{ minHeight: "calc(100vh - 100px)" }}>
          <div className="w-full lg:w-[60%]">
            <Card className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold">Manuscript Content</h2>
                {manuscriptText && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {manuscriptText.length.toLocaleString()} characters
                  </span>
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
                    Reviewing your manuscript against the Universal Manuscript Architecture...
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">This may take 15-30 seconds</p>
                </div>
              </Card>
            ) : !hasAnalysis ? (
              <Card className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click "Run SAGE Analysis" to get AI-powered feedback based on the Universal Manuscript Architecture.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    SAGE will check for the Structured 5-Move Abstract, Zero-I Perspective, and more.
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
                        Feedback
                      </TabsTrigger>
                      <TabsTrigger value="actions" className="flex-1 text-xs" data-testid="tab-actions">
                        Actions
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
                        </div>

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
                                {analysis.zeroIPerspective.violations.slice(0, 5).map((v, i) => (
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
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-primary" />
                          Detailed Feedback
                        </h3>
                        {analysis.detailedFeedback.map((fb, i) => (
                          <Card key={i} className="p-3">
                            <Badge variant="outline" className="mb-2 text-xs">{fb.section}</Badge>
                            <p className="text-sm font-medium mb-1">{fb.finding}</p>
                            <p className="text-sm text-sage-dark mb-2">{fb.suggestion}</p>
                            <div className="bg-primary/5 rounded-md p-2 border-l-2 border-primary">
                              <p className="text-xs font-medium text-primary mb-0.5">Why it Matters (UMA)</p>
                              <p className="text-xs text-muted-foreground">{fb.whyItMatters}</p>
                            </div>
                          </Card>
                        ))}
                        {analysis.detailedFeedback.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">No detailed feedback available.</p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="actions" className="p-4 mt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            Action Items
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {checkedItems.size}/{analysis.actionItems.length} done
                          </span>
                        </div>
                        {analysis.actionItems.map((item, i) => (
                          <div
                            key={i}
                            className={`flex items-start gap-3 p-3 rounded-md border transition-colors ${
                              checkedItems.has(i) ? "bg-sage/5 border-sage/30" : "border-border"
                            }`}
                          >
                            <Checkbox
                              checked={checkedItems.has(i)}
                              onCheckedChange={() => toggleActionItem(i)}
                              className="mt-0.5"
                              data-testid={`checkbox-action-${i}`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${checkedItems.has(i) ? "line-through text-muted-foreground" : ""}`}>
                                {item.task}
                              </p>
                            </div>
                            <PriorityBadge priority={item.priority} />
                          </div>
                        ))}
                        {analysis.actionItems.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">No action items.</p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="learn" className="p-4 mt-0">
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          Learning Resources
                        </h3>
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

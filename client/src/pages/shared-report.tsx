import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Sparkles,
  BookOpen,
  Zap,
  ExternalLink,
} from "lucide-react";

interface SharedAnalysis {
  title: string;
  paperType: string;
  readinessScore: number | null;
  analysisStatus: string;
  analysis: {
    readinessScore: number;
    executiveSummary: string;
    scoreBreakdown: Record<string, number> | null;
    criticalIssues: { title: string; description: string; severity: string }[];
    detailedFeedback: { section: string; severity: string; title: string; feedback: string }[];
    actionItems: { text: string; priority: string; completed?: boolean }[];
    strengthsToMaintain: string[];
    paperTypeLabel: string;
    documentClassification: { manuscriptType?: string; discipline?: string } | null;
  } | null;
  createdAt: string;
}

function ScoreDisplay({ score }: { score: number }) {
  const color =
    score >= 75 ? "text-green-600 dark:text-green-400" :
    score >= 50 ? "text-amber-600 dark:text-amber-400" :
    "text-red-600 dark:text-red-400";
  const bg =
    score >= 75 ? "bg-green-100 dark:bg-green-900/30" :
    score >= 50 ? "bg-amber-100 dark:bg-amber-900/30" :
    "bg-red-100 dark:bg-red-900/30";

  return (
    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${bg}`}>
      <span className={`text-3xl font-bold ${color}`}>{score}</span>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const variant = severity === "critical" ? "destructive" : severity === "major" ? "default" : "secondary";
  return <Badge variant={variant} className="text-[10px] capitalize">{severity}</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const color =
    priority === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
    priority === "medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  return <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${color}`}>{priority}</span>;
}

export default function SharedReport() {
  const [, params] = useRoute("/shared/:token");
  const token = params?.token;

  const { data: report, isLoading, error } = useQuery<SharedAnalysis>({
    queryKey: ["/api/shared", token],
    queryFn: async () => {
      const res = await fetch(`/api/shared/${token}`);
      if (!res.ok) throw new Error("Report not found");
      return res.json();
    },
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !report || !report.analysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Report Not Found</h1>
          <p className="text-sm text-muted-foreground">
            This shared report link may have expired or been revoked.
          </p>
        </Card>
      </div>
    );
  }

  const { analysis } = report;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AXIOM Shared Audit Report
          </div>
          <h1 className="text-xl font-bold">{report.title}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {analysis.paperTypeLabel && (
              <Badge variant="default" className="text-xs">{analysis.paperTypeLabel}</Badge>
            )}
            {analysis.documentClassification?.manuscriptType && (
              <Badge variant="outline" className="text-xs">{analysis.documentClassification.manuscriptType}</Badge>
            )}
            {analysis.documentClassification?.discipline && (
              <Badge variant="outline" className="text-xs">{analysis.documentClassification.discipline}</Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Score */}
        <Card className="p-6 text-center">
          <p className="text-sm font-semibold text-muted-foreground mb-3">Audit Readiness Score</p>
          <ScoreDisplay score={analysis.readinessScore} />
          <p className="text-sm text-muted-foreground mt-4 max-w-lg mx-auto">{analysis.executiveSummary}</p>
        </Card>

        {/* Score breakdown */}
        {analysis.scoreBreakdown && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Score Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(analysis.scoreBreakdown).map(([key, value]) => (
                <div key={key} className="text-center p-2 bg-muted/50 rounded-md">
                  <p className="text-lg font-bold text-primary">{value}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Critical issues */}
        {analysis.criticalIssues && analysis.criticalIssues.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Critical Issues ({analysis.criticalIssues.length})
            </h3>
            <div className="space-y-3">
              {analysis.criticalIssues.map((issue, i) => (
                <div key={i} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-sm font-medium">{issue.title}</span>
                    <SeverityBadge severity={issue.severity} />
                  </div>
                  <p className="text-xs text-muted-foreground">{issue.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Detailed feedback */}
        {analysis.detailedFeedback && analysis.detailedFeedback.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" />
              Section Feedback ({analysis.detailedFeedback.length})
            </h3>
            <div className="space-y-3">
              {analysis.detailedFeedback.map((fb, i) => (
                <div key={i} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <Badge variant="outline" className="text-[10px] mr-2">{fb.section}</Badge>
                      <span className="text-sm font-medium">{fb.title}</span>
                    </div>
                    <SeverityBadge severity={fb.severity} />
                  </div>
                  <p className="text-xs text-muted-foreground">{fb.feedback}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Action items */}
        {analysis.actionItems && analysis.actionItems.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Action Items ({analysis.actionItems.length})
            </h3>
            <ul className="space-y-2">
              {analysis.actionItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <span className={`mt-0.5 ${item.completed ? "text-green-500" : "text-muted-foreground"}`}>
                    {item.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="block w-3.5 h-3.5 rounded-full border border-current" />}
                  </span>
                  <span className={item.completed ? "line-through text-muted-foreground" : ""}>{item.text}</span>
                  <PriorityBadge priority={item.priority} />
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Strengths */}
        {analysis.strengthsToMaintain && analysis.strengthsToMaintain.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Strengths to Maintain
            </h3>
            <ul className="space-y-2">
              {analysis.strengthsToMaintain.map((strength, i) => (
                <li key={i} className="text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-4 text-xs text-muted-foreground">
          <p>Generated by AXIOM — AI-Powered Manuscript Audit</p>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Sparkles,
  Loader2,
  ExternalLink,
  Target,
  TrendingUp,
  Clock,
  X,
} from "lucide-react";

interface Journal {
  name: string;
  publisher: string;
  fitScore: number;
  impactFactor: string;
  openAccess: boolean;
  turnaroundWeeks: number;
  reasoning: string;
  tier: "reach" | "target" | "safety";
}

interface JournalSelectorProps {
  manuscriptId: string;
  hasAnalysis: boolean;
}

function TierBadge({ tier }: { tier: string }) {
  switch (tier) {
    case "reach":
      return <Badge className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Reach</Badge>;
    case "target":
      return <Badge className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Target</Badge>;
    case "safety":
      return <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Safety</Badge>;
    default:
      return <Badge variant="secondary" className="text-[10px]">{tier}</Badge>;
  }
}

function FitScoreBar({ score }: { score: number }) {
  const color = score >= 8 ? "bg-green-500" : score >= 6 ? "bg-blue-500" : score >= 4 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score * 10}%` }} />
      </div>
      <span className="text-xs font-bold">{score}/10</span>
    </div>
  );
}

export function JournalSelector({ manuscriptId, hasAnalysis }: JournalSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggest = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", `/api/manuscripts/${manuscriptId}/journal-suggestions`);
      const data = await res.json();
      setJournals(data.journals || []);
    } catch {
      toast({ title: "Error", description: "Failed to get journal suggestions", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasAnalysis) return null;

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => { setIsOpen(true); if (journals.length === 0) handleSuggest(); }}
        className="px-2 sm:px-3"
        data-testid="button-journal-selection"
      >
        <Target className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Journal Match</span>
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Journal Selection</h2>
            {journals.length > 0 && (
              <Badge variant="secondary" className="text-xs">{journals.length} suggestions</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {journals.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleSuggest} disabled={isLoading} className="text-xs">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Refresh
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Analyzing manuscript fit against journals...</span>
            </div>
          ) : journals.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No suggestions yet.</p>
              <Button className="mt-4" onClick={handleSuggest}>
                <Sparkles className="w-4 h-4 mr-2" /> Get Journal Suggestions
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground mb-3">
                Journals ranked by fit score based on your manuscript's discipline, methodology, and quality.
              </p>
              {journals.map((journal, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-semibold">{journal.name}</h3>
                        <TierBadge tier={journal.tier} />
                        {journal.openAccess && (
                          <Badge variant="outline" className="text-[10px]">Open Access</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{journal.publisher}</p>
                    </div>
                    <FitScoreBar score={journal.fitScore} />
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">{journal.reasoning}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      IF: {journal.impactFactor}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ~{journal.turnaroundWeeks} weeks
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

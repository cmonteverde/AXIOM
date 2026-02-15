import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Sparkles,
  Loader2,
  Copy,
  Download,
  X,
} from "lucide-react";

interface CoverLetterGeneratorProps {
  manuscriptId: string;
  hasAnalysis: boolean;
}

export function CoverLetterGenerator({ manuscriptId, hasAnalysis }: CoverLetterGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [journalName, setJournalName] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await apiRequest("POST", `/api/manuscripts/${manuscriptId}/cover-letter`, {
        journalName: journalName.trim() || undefined,
      });
      const data = await res.json();
      setCoverLetter(data.coverLetter);
    } catch {
      toast({ title: "Error", description: "Failed to generate cover letter", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    toast({ title: "Copied!", description: "Cover letter copied to clipboard." });
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cover-letter.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasAnalysis) return null;

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="px-2 sm:px-3"
        data-testid="button-cover-letter"
      >
        <FileText className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Cover Letter</span>
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Cover Letter Generator</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!coverLetter ? (
            <>
              <p className="text-sm text-muted-foreground">
                Generate a professional cover letter based on your audit results. Optionally specify a target journal for tailored content.
              </p>
              <div>
                <label className="text-sm font-medium mb-1 block">Target Journal (optional)</label>
                <Input
                  value={journalName}
                  onChange={(e) => setJournalName(e.target.value)}
                  placeholder="e.g., Nature Medicine, JAMA, The Lancet..."
                  className="text-sm"
                />
              </div>
              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Cover Letter...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Generate Cover Letter</>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs">
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="text-xs">
                  <Download className="w-3.5 h-3.5 mr-1" /> Download
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCoverLetter("")} className="text-xs ml-auto">
                  Regenerate
                </Button>
              </div>
              <Card className="p-4 bg-muted/30">
                <pre className="text-sm whitespace-pre-wrap font-serif leading-relaxed">{coverLetter}</pre>
              </Card>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

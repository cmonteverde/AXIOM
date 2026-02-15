import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Sparkles,
  Loader2,
  Upload,
  Check,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Download,
} from "lucide-react";
import type { ReviewerComment } from "@shared/schema";

interface ReviewerResponseTableProps {
  manuscriptId: string;
  hasAnalysis: boolean;
}

function parseComments(rawText: string): string[] {
  // Split reviewer comments by common patterns:
  // 1. Numbered: "1.", "1)", "Comment 1:", "#1"
  // 2. Bullets: "- ", "• "
  // 3. Double newlines (paragraphs)
  const lines = rawText.split(/\n/);
  const comments: string[] = [];
  let current = "";

  for (const line of lines) {
    const trimmed = line.trim();
    // Detect new comment boundaries
    const isNewComment = /^(\d+[\.\)]\s|#\d+|Comment\s+\d+|Reviewer\s+\d+|Major\s+Comment|Minor\s+Comment|•\s|-\s{2,})/.test(trimmed);

    if (isNewComment && current.trim()) {
      comments.push(current.trim());
      current = trimmed;
    } else if (trimmed === "" && current.trim()) {
      // Double newline = new paragraph/comment
      comments.push(current.trim());
      current = "";
    } else {
      current += (current ? " " : "") + trimmed;
    }
  }
  if (current.trim()) {
    comments.push(current.trim());
  }

  return comments.filter(c => c.length > 10); // Filter out too-short fragments
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "addressed":
      return <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Addressed</Badge>;
    case "drafted":
      return <Badge className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Drafted</Badge>;
    default:
      return <Badge variant="secondary" className="text-[10px]">Pending</Badge>;
  }
}

export function ReviewerResponseTable({ manuscriptId, hasAnalysis }: ReviewerResponseTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rawText, setRawText] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editResponse, setEditResponse] = useState("");
  const [editChange, setEditChange] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery<ReviewerComment[]>({
    queryKey: ["/api/manuscripts", manuscriptId, "reviewer-comments"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/manuscripts/${manuscriptId}/reviewer-comments`);
      return res.json();
    },
    enabled: isOpen,
  });

  const uploadMutation = useMutation({
    mutationFn: async (comments: string[]) => {
      const res = await apiRequest("POST", `/api/manuscripts/${manuscriptId}/reviewer-comments`, { comments });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts", manuscriptId, "reviewer-comments"] });
      setRawText("");
      setShowUpload(false);
      toast({ title: "Comments Saved", description: "Reviewer comments have been parsed and saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save comments", variant: "destructive" });
    },
  });

  const draftMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/manuscripts/${manuscriptId}/reviewer-comments/draft`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts", manuscriptId, "reviewer-comments"] });
      toast({ title: "Responses Drafted", description: "AI has drafted responses to all reviewer comments." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to draft responses", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; response?: string; changeMade?: string; status?: string }) => {
      const res = await apiRequest("PATCH", `/api/reviewer-comments/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts", manuscriptId, "reviewer-comments"] });
      setEditingId(null);
    },
  });

  const handleUpload = () => {
    const parsed = parseComments(rawText);
    if (parsed.length === 0) {
      toast({ title: "No Comments Found", description: "Could not parse any reviewer comments. Try separating each comment with a blank line.", variant: "destructive" });
      return;
    }
    uploadMutation.mutate(parsed);
  };

  const handleExportTable = () => {
    const rows = comments.map((c, i) => [
      `"${(c.comment || "").replace(/"/g, '""')}"`,
      `"${(c.response || "").replace(/"/g, '""')}"`,
      `"${(c.changeMade || "").replace(/"/g, '""')}"`,
      `"${c.status}"`,
    ].join(","));
    const csv = ["Comment,Response,Change Made,Status", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reviewer-response-table.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "Response table downloaded as CSV." });
  };

  const startEditing = (comment: ReviewerComment) => {
    setEditingId(comment.id);
    setEditResponse(comment.response || "");
    setEditChange(comment.changeMade || "");
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateMutation.mutate({
      id: editingId,
      response: editResponse,
      changeMade: editChange,
      status: editResponse && editChange ? "addressed" : editResponse ? "drafted" : "pending",
    });
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="px-2 sm:px-3"
        data-testid="button-reviewer-response"
      >
        <MessageSquare className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Reviewer Response</span>
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Reviewer Response Table</h2>
            {comments.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {comments.filter(c => c.status === "addressed").length}/{comments.length} addressed
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {comments.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={handleExportTable} className="text-xs">
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Export CSV
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => draftMutation.mutate()}
                  disabled={draftMutation.isPending}
                  className="text-xs"
                >
                  {draftMutation.isPending ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Drafting...</>
                  ) : (
                    <><Sparkles className="w-3.5 h-3.5 mr-1" /> AI Draft All</>
                  )}
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-xs">
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {comments.length === 0 && !showUpload ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-sm font-semibold mb-2">No Reviewer Comments Yet</h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-md mx-auto">
                Paste your reviewer comments below. AXIOM will parse them into a response tracking table and use AI to draft point-by-point responses.
              </p>
              <Button onClick={() => setShowUpload(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Reviewer Comments
              </Button>
            </div>
          ) : showUpload || comments.length === 0 ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Paste Reviewer Comments</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Paste the full reviewer feedback. Separate each comment with a blank line, or use numbered format (1. 2. 3.).
                </p>
                <Textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={"1. The authors should provide more details about the sample size calculation...\n\n2. The discussion section does not adequately address the limitations...\n\n3. Figure 2 needs higher resolution..."}
                  className="min-h-[200px] text-sm font-mono"
                />
              </div>
              {rawText.trim() && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground flex-1">
                    {parseComments(rawText).length} comment(s) detected
                  </p>
                  <Button variant="outline" size="sm" onClick={() => { setShowUpload(false); setRawText(""); }}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending || parseComments(rawText).length === 0}
                  >
                    {uploadMutation.isPending ? (
                      <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Saving...</>
                    ) : (
                      <>Save & Parse</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => setShowUpload(true)} className="text-xs">
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  Re-upload Comments
                </Button>
              </div>

              {/* Response Table */}
              <div className="border rounded-md overflow-hidden">
                <div className="grid grid-cols-[2fr_2fr_2fr_auto] bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <div className="p-3 border-r">Reviewer Comment</div>
                  <div className="p-3 border-r">Your Response</div>
                  <div className="p-3 border-r">Change Made</div>
                  <div className="p-3 w-24 text-center">Status</div>
                </div>
                {comments.map((comment, i) => (
                  <div
                    key={comment.id}
                    className={`grid grid-cols-[2fr_2fr_2fr_auto] border-t ${i % 2 === 0 ? "" : "bg-muted/20"}`}
                  >
                    <div className="p-3 border-r">
                      <span className="text-xs font-bold text-primary mr-1">#{i + 1}</span>
                      <span className="text-xs">{comment.comment}</span>
                    </div>
                    {editingId === comment.id ? (
                      <>
                        <div className="p-2 border-r">
                          <Textarea
                            value={editResponse}
                            onChange={(e) => setEditResponse(e.target.value)}
                            className="text-xs min-h-[80px]"
                            placeholder="Write your response..."
                          />
                        </div>
                        <div className="p-2 border-r">
                          <Textarea
                            value={editChange}
                            onChange={(e) => setEditChange(e.target.value)}
                            className="text-xs min-h-[80px]"
                            placeholder="Describe changes made..."
                          />
                        </div>
                        <div className="p-2 w-24 flex flex-col items-center gap-1">
                          <Button size="sm" className="text-[10px] w-full h-7" onClick={saveEdit} disabled={updateMutation.isPending}>
                            <Check className="w-3 h-3 mr-1" /> Save
                          </Button>
                          <Button variant="ghost" size="sm" className="text-[10px] w-full h-7" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 border-r text-xs text-muted-foreground">
                          {comment.response || <span className="italic opacity-50">No response yet</span>}
                        </div>
                        <div className="p-3 border-r text-xs text-muted-foreground">
                          {comment.changeMade || <span className="italic opacity-50">No change recorded</span>}
                        </div>
                        <div className="p-3 w-24 flex flex-col items-center gap-1">
                          <StatusBadge status={comment.status} />
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => startEditing(comment)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useUpload } from "@/hooks/use-upload";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { Textarea } from "@/components/ui/textarea";
import { Upload, CheckCircle2, Loader2, FileText, X, ClipboardPaste } from "lucide-react";

const PROGRESS_STEPS_UPLOAD = [
  "Uploading file to secure storage...",
  "Creating manuscript record...",
  "Extracting text from document...",
  "Done!",
];

const PROGRESS_STEPS_PASTE = [
  "Processing your text...",
  "Creating manuscript record...",
  "Saving manuscript content...",
  "Done!",
];

export default function NewManuscript() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [authLoading, isAuthenticated]);

  const { uploadFile, isUploading } = useUpload({
    onError: (error) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  const createManuscriptMutation = useMutation({
    mutationFn: async (data: { title: string | null; fileName: string | null; fileKey: string | null }) => {
      const res = await apiRequest("POST", "/api/manuscripts", data);
      return res.json();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsProcessing(false);
    },
  });

  const extractMutation = useMutation({
    mutationFn: async (manuscriptId: string) => {
      const res = await apiRequest("POST", `/api/manuscripts/${manuscriptId}/extract`);
      return res.json();
    },
    onError: (error: Error) => {
      console.error("Extraction error:", error);
    },
  });

  const pasteTextMutation = useMutation({
    mutationFn: async ({ manuscriptId, text }: { manuscriptId: string; text: string }) => {
      const res = await apiRequest("POST", `/api/manuscripts/${manuscriptId}/paste-text`, { text });
      return res.json();
    },
    onError: (error: Error) => {
      console.error("Paste text error:", error);
    },
  });

  const handleSubmit = async () => {
    setIsProcessing(true);
    setProgressPercent(0);
    setProgressStep(0);

    let fileKey: string | null = null;

    if (inputMode === "upload" && selectedFile) {
      setProgressStep(0);
      setProgressPercent(15);
      const uploadResult = await uploadFile(selectedFile);
      if (uploadResult) {
        fileKey = uploadResult.objectPath;
      } else {
        setIsProcessing(false);
        return;
      }
      setProgressPercent(35);
    } else {
      setProgressStep(0);
      setProgressPercent(20);
    }

    setProgressStep(1);
    setProgressPercent(45);

    try {
      const manuscript = await createManuscriptMutation.mutateAsync({
        title: title || null,
        fileName: fileName || null,
        fileKey,
      });

      setProgressPercent(60);
      setProgressStep(2);

      if (fileKey) {
        await extractMutation.mutateAsync(manuscript.id);
      } else if (inputMode === "paste" && pastedText.trim()) {
        await pasteTextMutation.mutateAsync({ manuscriptId: manuscript.id, text: pastedText.trim() });
      }

      setProgressPercent(100);
      setProgressStep(3);
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts"] });

      setTimeout(() => {
        navigate(`/manuscript/${manuscript.id}`);
      }, 600);
    } catch (error) {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({ title: "File too large", description: "Maximum file size is 50MB", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const canSubmit = () => {
    if (inputMode === "upload") return selectedFile !== null;
    if (inputMode === "paste") return pastedText.trim().length > 0;
    return false;
  };

  if (isProcessing) {
    const steps = inputMode === "paste" ? PROGRESS_STEPS_PASTE : PROGRESS_STEPS_UPLOAD;
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {progressStep >= steps.length - 1 ? (
                <CheckCircle2 className="w-8 h-8 text-sage" />
              ) : (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              )}
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2 text-primary" data-testid="text-processing-title">
            {progressStep >= steps.length - 1 ? "Manuscript Ready" : "Preparing Your Manuscript"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {progressStep >= steps.length - 1 ? "Opening your workspace..." : "SAGE is setting things up..."}
          </p>

          <div className="w-full h-3 bg-muted rounded-full mb-2 overflow-hidden">
            <div
              className="h-full bg-sage rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
              data-testid="progress-upload-bar"
            />
          </div>
          <p className="text-sm text-muted-foreground mb-6">{Math.round(progressPercent)}% complete</p>

          <div className="text-left space-y-3">
            {steps.map((stepText, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className={`w-5 h-5 shrink-0 ${progressStep > i ? "text-sage" : progressStep === i ? "text-primary" : "text-muted-foreground/30"}`} />
                <span className={`text-sm ${progressStep > i ? "text-foreground" : progressStep === i ? "text-primary font-medium" : "text-muted-foreground/50"}`}>
                  {stepText}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg p-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 block"
          data-testid="link-back-dashboard"
        >
          ← Dashboard
        </button>

        <h1 className="text-2xl font-bold tracking-tight text-primary mb-1" data-testid="text-new-manuscript-title">New Manuscript</h1>
        <p className="text-sm text-muted-foreground mb-6">Upload your manuscript or paste the text to get started.</p>

        <div className="flex gap-2 mb-4">
          <Button
            variant={inputMode === "upload" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setInputMode("upload");
              setPastedText("");
            }}
            data-testid="button-mode-upload"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
          <Button
            variant={inputMode === "paste" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setInputMode("paste");
              removeFile();
            }}
            data-testid="button-mode-paste"
          >
            <ClipboardPaste className="w-4 h-4 mr-2" />
            Paste Text
          </Button>
        </div>

        {inputMode === "upload" && (
          <>
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-border rounded-md p-8 text-center mb-4 cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                data-testid="dropzone-upload"
              >
                <Upload className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-muted-foreground">Supported: PDF, DOCX, TXT (max 50MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="input-file"
                />
                <Button className="mt-3" size="sm" data-testid="button-choose-file">
                  Choose File
                </Button>
              </div>
            ) : (
              <div className="border border-primary/30 bg-primary/5 rounded-md p-4 mb-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    data-testid="button-remove-file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {inputMode === "paste" && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">
              Paste your manuscript sections below (abstract, introduction, methods, etc.)
            </p>
            <Textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your manuscript text here... You can include any section such as the abstract, introduction, methodology, results, or discussion."
              className="min-h-[200px] text-sm"
              data-testid="textarea-paste-manuscript"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {pastedText.length > 0 ? `${pastedText.length.toLocaleString()} characters` : "No text entered"}
            </p>
          </div>
        )}

        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Manuscript title (optional):</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Amazon Deforestation Climate Impact"
            data-testid="input-manuscript-title"
          />
        </div>

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!canSubmit() || isUploading}
          data-testid="button-submit-manuscript"
        >
          {isUploading ? "Uploading..." : "Add Manuscript"}
        </Button>
      </Card>
    </div>
  );
}

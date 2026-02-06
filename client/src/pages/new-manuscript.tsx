import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useUpload } from "@/hooks/use-upload";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { Textarea } from "@/components/ui/textarea";
import { Upload, CheckCircle2, Loader2, FileText, X, ClipboardPaste } from "lucide-react";

const STAGES = [
  { value: "planning", label: "Planning & Design", description: "Still developing idea" },
  { value: "first_draft", label: "First Draft", description: "Complete draft ready" },
  { value: "pre_submission", label: "Pre-Submission", description: "Final review before submit" },
  { value: "first_review", label: "First Review", description: "Received reviewer comments" },
  { value: "revision", label: "Revision", description: "Working on revisions" },
];

const HELP_TYPES = [
  "Comprehensive Review",
  "Structural Analysis",
  "Language & Clarity",
  "Reference Management",
  "Keywords",
  "Journal Selection",
  "Methods",
  "Statistics",
  "Cover Letter",
  "Reviewer Response",
  "Abstract",
  "Ethics",
];

const ANALYSIS_STEPS_UPLOAD = [
  "Uploading file to secure storage...",
  "Extracting text content...",
  "Analyzing structure and organization...",
  "Generating manuscript preview...",
];

const ANALYSIS_STEPS_PASTE = [
  "Processing your text...",
  "Saving manuscript content...",
  "Analyzing structure and organization...",
  "Generating manuscript preview...",
];

export default function NewManuscript() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [stage, setStage] = useState("");
  const [selectedHelp, setSelectedHelp] = useState<string[]>([]);
  const [everything, setEverything] = useState(false);
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
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

  const progressWidth = `${(step / 3) * 100}%`;

  const toggleHelp = (type: string) => {
    if (everything) return;
    setSelectedHelp((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleEverything = () => {
    if (!everything) {
      setEverything(true);
      setSelectedHelp(HELP_TYPES);
    } else {
      setEverything(false);
      setSelectedHelp([]);
    }
  };

  const createManuscriptMutation = useMutation({
    mutationFn: async (data: { title: string | null; stage: string; helpTypes: string[]; fileName: string | null; fileKey: string | null }) => {
      const res = await apiRequest("POST", "/api/manuscripts", data);
      return res.json();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsAnalyzing(false);
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

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStep(0);

    let fileKey: string | null = null;

    if (inputMode === "upload" && selectedFile) {
      setAnalysisStep(0);
      setAnalysisProgress(10);
      const uploadResult = await uploadFile(selectedFile);
      if (uploadResult) {
        fileKey = uploadResult.objectPath;
      }
      setAnalysisProgress(25);
    }

    setAnalysisStep(1);
    setAnalysisProgress(35);

    try {
      const manuscript = await createManuscriptMutation.mutateAsync({
        title: title || null,
        stage,
        helpTypes: selectedHelp,
        fileName: fileName || null,
        fileKey,
      });

      setAnalysisProgress(50);
      setAnalysisStep(2);

      if (fileKey) {
        await extractMutation.mutateAsync(manuscript.id);
      } else if (inputMode === "paste" && pastedText.trim()) {
        await pasteTextMutation.mutateAsync({ manuscriptId: manuscript.id, text: pastedText.trim() });
      }

      setAnalysisProgress(85);
      setAnalysisStep(3);
      setAnalysisProgress(100);
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts"] });

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (error) {
      setIsAnalyzing(false);
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

  const canContinue = () => {
    if (step === 1) return stage !== "";
    if (step === 2) return selectedHelp.length > 0;
    if (step === 3) {
      const hasContent = inputMode === "upload" ? selectedFile !== null : pastedText.trim().length > 0;
      return hasContent || title !== "";
    }
    return false;
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2 text-primary" data-testid="text-analyzing-title">Analyzing Your Manuscript</h2>
          <p className="text-sm text-muted-foreground mb-6">SAGE is reviewing your work...</p>

          <div className="w-full h-3 bg-muted rounded-full mb-2 overflow-hidden">
            <div
              className="h-full bg-sage rounded-full transition-all duration-500"
              style={{ width: `${analysisProgress}%` }}
              data-testid="progress-analysis-bar"
            />
          </div>
          <p className="text-sm text-muted-foreground mb-6">{Math.round(analysisProgress)}% complete</p>

          <div className="text-left space-y-3">
            {(inputMode === "paste" ? ANALYSIS_STEPS_PASTE : ANALYSIS_STEPS_UPLOAD).map((stepText, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className={`w-5 h-5 shrink-0 ${analysisStep > i ? "text-sage" : analysisStep === i ? "text-primary" : "text-muted-foreground/30"}`} />
                <span className={`text-sm ${analysisStep > i ? "text-foreground" : analysisStep === i ? "text-primary font-medium" : "text-muted-foreground/50"}`}>
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

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight text-primary" data-testid="text-new-manuscript-title">New Manuscript</h1>
          <span className="text-sm text-muted-foreground">Step {step}/3</span>
        </div>

        <div className="w-full h-2 bg-muted rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-sage rounded-full transition-all duration-500 ease-out"
            style={{ width: progressWidth }}
            data-testid="progress-manuscript-bar"
          />
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-base font-semibold mb-4">Where are you in your research journey?</h2>
            <div className="space-y-3">
              {STAGES.map((s) => (
                <label
                  key={s.value}
                  className={`flex items-center gap-3 p-4 rounded-md border cursor-pointer transition-colors ${
                    stage === s.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                  data-testid={`option-stage-${s.value}`}
                >
                  <input
                    type="radio"
                    name="stage"
                    value={s.value}
                    checked={stage === s.value}
                    onChange={() => setStage(s.value)}
                    className="w-4 h-4 accent-primary"
                  />
                  <div>
                    <span className="text-sm font-medium">{s.label}</span>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-base font-semibold mb-4">What help do you need?</h2>

            <label
              className={`flex items-center gap-3 p-4 rounded-md border cursor-pointer transition-colors mb-4 ${
                everything ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}
              data-testid="option-help-everything"
            >
              <Checkbox
                checked={everything}
                onCheckedChange={() => toggleEverything()}
              />
              <span className="text-sm font-medium">Everything (Comprehensive Review)</span>
            </label>

            <p className="text-xs text-muted-foreground mb-3">Or select specific:</p>

            <div className="grid grid-cols-2 gap-3">
              {HELP_TYPES.map((type) => (
                <label
                  key={type}
                  className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer transition-colors text-sm ${
                    selectedHelp.includes(type)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                  data-testid={`option-help-${type.toLowerCase().replace(/[^a-z]/g, "-")}`}
                >
                  <Checkbox
                    checked={selectedHelp.includes(type)}
                    onCheckedChange={() => toggleHelp(type)}
                    disabled={everything}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-base font-semibold mb-4">Add Your Manuscript</h2>

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
              <label className="text-sm font-medium mb-2 block">Manuscript title:</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Amazon Deforestation Climate Impact"
                data-testid="input-manuscript-title"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-manuscript-back"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}
          <Button
            onClick={() => {
              if (step < 3) {
                setStep(step + 1);
              } else {
                handleStartAnalysis();
              }
            }}
            disabled={!canContinue() || isUploading}
            data-testid="button-manuscript-continue"
          >
            {step === 3 ? "Start Analysis" : "Continue →"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

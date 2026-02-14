import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { isUnauthorizedError } from "@/lib/auth-utils";

const RESEARCH_LEVELS = [
  "Undergraduate",
  "Master's Student",
  "PhD Student",
  "Postdoc / Early Career",
  "Established Researcher",
  "Other",
];

const ACADEMIC_FIELDS = [
  "Biology",
  "Chemistry",
  "Physics",
  "Psychology",
  "Sociology",
  "Economics",
  "Political Science",
  "Environmental Science",
  "Computer Science",
  "Engineering",
  "Medicine",
  "Neuroscience",
  "Education",
  "Public Health",
  "Other",
];

const LEARNING_MODES = [
  { value: "adaptive", label: "Adaptive", description: "AXIOM adjusts to your expertise level (Recommended)", detail: "Matches feedback depth to your research level. We recommend starting here." },
  { value: "learning", label: "Learning Mode", description: "Detailed explanations with 'why it matters' context", detail: "Every finding explains WHY the standard exists, defines jargon, and provides before/after examples." },
  { value: "fast", label: "Fast Mode", description: "Concise expert-level feedback", detail: "Just the problem + fix in 2 sentences. Best for experienced researchers doing resubmissions." },
];

export default function ProfileSetup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [researchLevel, setResearchLevel] = useState("");
  const [otherResearchLevel, setOtherResearchLevel] = useState("");
  const [primaryField, setPrimaryField] = useState("");
  const [otherPrimaryField, setOtherPrimaryField] = useState("");
  const [learningMode, setLearningMode] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (user && user.researchLevel && user.primaryField && user.learningMode) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const createProfileMutation = useMutation({
    mutationFn: async (data: { researchLevel: string; primaryField: string; learningMode: string }) => {
      const res = await apiRequest("POST", "/api/users/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session expired", description: "Redirecting to login...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-lg p-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-2 w-full mb-6" />
          <Skeleton className="h-12 w-full mb-3" />
          <Skeleton className="h-12 w-full mb-3" />
          <Skeleton className="h-12 w-full" />
        </Card>
      </div>
    );
  }

  const progressWidth = `${(step / 3) * 100}%`;

  const canContinue = () => {
    if (step === 1) {
      if (researchLevel === "Other") return otherResearchLevel.trim() !== "";
      return researchLevel !== "";
    }
    if (step === 2) {
      if (primaryField === "Other") return otherPrimaryField.trim() !== "";
      return primaryField !== "";
    }
    if (step === 3) return learningMode !== "";
    return false;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const finalResearchLevel = researchLevel === "Other" ? otherResearchLevel : researchLevel;
      const finalPrimaryField = primaryField === "Other" ? otherPrimaryField : primaryField;
      createProfileMutation.mutate({ 
        researchLevel: finalResearchLevel, 
        primaryField: finalPrimaryField, 
        learningMode 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg p-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight text-primary" data-testid="text-setup-title">Profile Setup</h1>
          <span className="text-sm text-muted-foreground" data-testid="text-step-indicator">Step {step}/3</span>
        </div>

        <div className="w-full h-2 bg-muted rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-sage rounded-full transition-all duration-500 ease-out"
            style={{ width: progressWidth }}
            data-testid="progress-bar"
          />
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-base font-semibold mb-1" data-testid="text-step1-title">Research level?</h2>
            <p className="text-xs text-muted-foreground mb-4">This helps AXIOM tailor feedback depth to your experience. PhDs get nuanced methodological detail; undergrads get more foundational context.</p>
            <div className="space-y-3">
              {RESEARCH_LEVELS.map((level) => (
                <div key={level}>
                  <label
                    className={`flex items-center gap-3 p-4 rounded-md border cursor-pointer transition-colors ${
                      researchLevel === level
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                    data-testid={`option-level-${level.toLowerCase().replace(/[^a-z]/g, "-")}`}
                  >
                    <input
                      type="radio"
                      name="researchLevel"
                      value={level}
                      checked={researchLevel === level}
                      onChange={() => setResearchLevel(level)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm font-medium">{level}</span>
                  </label>
                  {level === "Other" && researchLevel === "Other" && (
                    <div className="mt-2 pl-7">
                      <Input
                        placeholder="Please specify your research level..."
                        value={otherResearchLevel}
                        onChange={(e) => setOtherResearchLevel(e.target.value)}
                        className="text-sm"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-base font-semibold mb-1" data-testid="text-step2-title">Primary field?</h2>
            <p className="text-xs text-muted-foreground mb-4">AXIOM adapts reporting guidelines and terminology to your discipline. A clinical trial gets CONSORT checks; a qualitative study gets COREQ.</p>
            <Select value={primaryField} onValueChange={setPrimaryField}>
              <SelectTrigger data-testid="select-field">
                <SelectValue placeholder="Select your field..." />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_FIELDS.map((field) => (
                  <SelectItem key={field} value={field} data-testid={`option-field-${field.toLowerCase().replace(/\s/g, "-")}`}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {primaryField === "Other" && (
              <div className="mt-4">
                <Input
                  placeholder="Please specify your primary field..."
                  value={otherPrimaryField}
                  onChange={(e) => setOtherPrimaryField(e.target.value)}
                  className="text-sm"
                  autoFocus
                />
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-base font-semibold mb-1" data-testid="text-step3-title">Learning preference?</h2>
            <p className="text-xs text-muted-foreground mb-4">This changes how AXIOM writes audit feedback. You can change this anytime in settings.</p>
            <div className="space-y-3">
              {LEARNING_MODES.map((mode) => (
                <label
                  key={mode.value}
                  className={`flex items-center gap-3 p-4 rounded-md border cursor-pointer transition-colors ${
                    learningMode === mode.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                  data-testid={`option-mode-${mode.value}`}
                >
                  <input
                    type="radio"
                    name="learningMode"
                    value={mode.value}
                    checked={learningMode === mode.value}
                    onChange={() => setLearningMode(mode.value)}
                    className="w-4 h-4 accent-primary"
                  />
                  <div>
                    <span className="text-sm font-medium">{mode.label}</span>
                    <p className="text-xs text-muted-foreground">{mode.description}</p>
                    {learningMode === mode.value && mode.detail && (
                      <p className="text-xs text-primary/70 mt-1">{mode.detail}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-back"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}
          <Button
            onClick={handleNext}
            disabled={!canContinue() || createProfileMutation.isPending}
            data-testid="button-continue"
          >
            {createProfileMutation.isPending
              ? "Saving..."
              : step === 3
              ? "Complete"
              : "Continue →"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

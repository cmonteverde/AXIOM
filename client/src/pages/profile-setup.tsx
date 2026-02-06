import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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
  { value: "fast", label: "Fast Mode", description: "Concise feedback" },
  { value: "learning", label: "Learning Mode", description: "Detailed explanations" },
  { value: "adaptive", label: "Adaptive", description: "SAGE adjusts (Recommended)" },
];

export default function ProfileSetup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [researchLevel, setResearchLevel] = useState("");
  const [primaryField, setPrimaryField] = useState("");
  const [learningMode, setLearningMode] = useState("");

  const createProfileMutation = useMutation({
    mutationFn: async (data: { researchLevel: string; primaryField: string; learningMode: string }) => {
      const res = await apiRequest("POST", "/api/users", data);
      return res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("sage_user_id", data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const progressWidth = `${(step / 3) * 100}%`;

  const canContinue = () => {
    if (step === 1) return researchLevel !== "";
    if (step === 2) return primaryField !== "";
    if (step === 3) return learningMode !== "";
    return false;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      createProfileMutation.mutate({ researchLevel, primaryField, learningMode });
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
            <h2 className="text-base font-semibold mb-4" data-testid="text-step1-title">Research level?</h2>
            <div className="space-y-3">
              {RESEARCH_LEVELS.map((level) => (
                <label
                  key={level}
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
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-base font-semibold mb-4" data-testid="text-step2-title">Primary field?</h2>
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
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-base font-semibold mb-4" data-testid="text-step3-title">Learning preference?</h2>
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

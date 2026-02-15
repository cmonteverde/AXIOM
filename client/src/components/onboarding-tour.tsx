import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

interface TourStep {
  target: string; // data-testid to highlight
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "text-dashboard-title",
    title: "Welcome to AXIOM!",
    description: "This is your research dashboard. Here you can track your manuscripts, earn XP, and level up your writing skills.",
    position: "bottom",
  },
  {
    target: "button-new-manuscript",
    title: "Upload a Manuscript",
    description: "Start by uploading a manuscript (PDF, DOCX, or paste text). AXIOM will extract the text and prepare it for audit.",
    position: "bottom",
  },
  {
    target: "progress-xp-bar",
    title: "Level Up Your Writing",
    description: "Every audit earns XP. The more manuscripts you analyze, the higher your level. Longer and more comprehensive audits earn bonus XP.",
    position: "bottom",
  },
  {
    target: "text-streak",
    title: "Build a Streak",
    description: "Run at least one audit per day to build your streak. Consecutive daily audits keep the streak going!",
    position: "bottom",
  },
  {
    target: "button-theme-toggle",
    title: "Light & Dark Mode",
    description: "Prefer working at night? Toggle between light and dark themes with this button.",
    position: "bottom",
  },
];

const STORAGE_KEY = "axiom-onboarding-complete";

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    // Small delay to let the dashboard render
    const timer = setTimeout(() => setIsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const positionTooltip = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    const el = document.querySelector(`[data-testid="${step.target}"]`);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const pos = step.position || "bottom";

    let top = 0;
    let left = 0;

    if (pos === "bottom") {
      top = rect.bottom + 12;
      left = rect.left + rect.width / 2;
    } else if (pos === "top") {
      top = rect.top - 12;
      left = rect.left + rect.width / 2;
    } else if (pos === "right") {
      top = rect.top + rect.height / 2;
      left = rect.right + 12;
    } else {
      top = rect.top + rect.height / 2;
      left = rect.left - 12;
    }

    // Keep tooltip on screen
    left = Math.max(180, Math.min(left, window.innerWidth - 180));
    top = Math.max(20, Math.min(top, window.innerHeight - 200));

    setTooltipPos({ top, left });
  }, [currentStep]);

  useEffect(() => {
    if (!isVisible) return;
    positionTooltip();
    window.addEventListener("resize", positionTooltip);
    window.addEventListener("scroll", positionTooltip);
    return () => {
      window.removeEventListener("resize", positionTooltip);
      window.removeEventListener("scroll", positionTooltip);
    };
  }, [isVisible, positionTooltip]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const next = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      dismiss();
    }
  }, [currentStep, dismiss]);

  const prev = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  useEffect(() => {
    if (!isVisible) return;
    const step = TOUR_STEPS[currentStep];
    const el = document.querySelector(`[data-testid="${step.target}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStep, isVisible]);

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[998] transition-opacity"
        onClick={dismiss}
      />

      {/* Spotlight — highlight the target element */}
      <SpotlightRing target={step.target} />

      {/* Tooltip */}
      <div
        className="fixed z-[1000] w-80 bg-card border border-border rounded-lg shadow-lg p-4 animate-in fade-in slide-in-from-top-2"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          transform: "translateX(-50%)",
        }}
      >
        <button
          onClick={dismiss}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold">{step.title}</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{step.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {currentStep + 1} of {TOUR_STEPS.length}
          </span>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button variant="ghost" size="sm" onClick={prev} className="h-7 text-xs">
                <ChevronLeft className="w-3 h-3 mr-1" />
                Back
              </Button>
            )}
            <Button size="sm" onClick={next} className="h-7 text-xs">
              {isLast ? "Get Started" : "Next"}
              {!isLast && <ChevronRight className="w-3 h-3 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function SpotlightRing({ target }: { target: string }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const el = document.querySelector(`[data-testid="${target}"]`);
    if (el) {
      setRect(el.getBoundingClientRect());
    }
    const update = () => {
      const el = document.querySelector(`[data-testid="${target}"]`);
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [target]);

  if (!rect) return null;

  const padding = 6;
  return (
    <div
      className="fixed z-[999] rounded-md ring-2 ring-primary ring-offset-2 ring-offset-background pointer-events-none transition-all duration-300"
      style={{
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      }}
    />
  );
}

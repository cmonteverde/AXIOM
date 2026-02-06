import { useLocation } from "wouter";
import { BookOpen, Target, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Welcome() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, hsl(260 60% 96%) 0%, hsl(260 40% 94%) 50%, hsl(260 60% 96%) 100%)" }}>
      <Card className="w-full max-w-lg p-8 border-2 border-primary/20 bg-white dark:bg-card" style={{ borderStyle: "dashed" }}>
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-1" data-testid="text-welcome-title">
            Welcome to SAGE
          </h1>
          <p className="text-muted-foreground text-base mb-1">
            Scholarly Assistant for Guided Excellence
          </p>
          <p className="text-muted-foreground/70 text-sm mb-6">
            Developed by Corrie Monteverde, PhD
          </p>

          <div className="w-full border-l-4 border-primary bg-primary/5 rounded-md p-4 text-left mb-4">
            <p className="text-sm text-foreground">
              This AI mentor helps you learn, improve, and publish with confidence through the entire research lifecycle.
            </p>
          </div>

          <div className="w-full border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-4 text-left mb-5">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">IMPORTANT:</p>
                <p className="text-sm text-muted-foreground">
                  SAGE complements — never replaces — human guidance. Always consult your advisor, mentor, and colleagues.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mb-5">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-md p-4 text-left">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Learn While You Work</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Understand WHY behind every suggestion
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-4 text-left">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold">Gamified Learning</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Track progress, earn achievements, level up!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 w-full text-left mb-6">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <span className="text-sm font-semibold">Your Privacy: </span>
              <span className="text-sm text-muted-foreground">
                SAGE stores learning progress only (not manuscript content). Delete anytime.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              data-testid="button-new-user"
              onClick={() => navigate("/setup")}
              className="w-full"
            >
              New User
            </Button>
            <Button
              data-testid="button-returning"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="w-full border-primary text-primary"
            >
              Returning
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

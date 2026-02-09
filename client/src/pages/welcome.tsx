import { useLocation } from "wouter";
import { BookOpen, Target, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MouseFireworks } from "@/components/mouse-fireworks";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import sageLogoPath from "@assets/SAGE_logo_1770411503546.png";

export default function Welcome() {
  const [, navigate] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-lg p-8">
          <Skeleton className="h-48 w-48 mx-auto mb-6 rounded-full" />
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-48 mx-auto mb-2" />
          <Skeleton className="h-10 w-full mt-6" />
        </Card>
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (user.researchLevel && user.primaryField && user.learningMode) {
      navigate("/dashboard");
      return null;
    } else {
      navigate("/setup");
      return null;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <MouseFireworks />
      <Card className="w-full max-w-lg p-8 border border-primary/15 bg-card/90 backdrop-blur-sm relative z-10">
        <div className="flex flex-col items-center text-center">
          <img src={sageLogoPath} alt="SAGE Logo" className="w-48 h-48 mb-6 object-contain" />

          <h1 className="text-3xl font-bold tracking-tight mb-1 text-primary" data-testid="text-welcome-title">
            Welcome to SAGE
          </h1>
          <p className="text-muted-foreground text-base mb-1">
            Scholarly Assistant for Guided Excellence
          </p>
          <p className="text-muted-foreground/70 text-sm mb-6">
            Developed by Corrie Monteverde, PhD
          </p>

          <div className="w-full bg-primary/5 border border-primary/20 rounded-md p-4 text-left mb-4">
            <p className="text-sm text-foreground">
              This AI mentor helps you learn, improve, and publish with confidence through the entire research lifecycle.
            </p>
          </div>

          <div className="w-full bg-gold/10 border border-gold/30 rounded-md p-4 text-left mb-5">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-gold-dark mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">IMPORTANT:</p>
                <p className="text-sm text-muted-foreground">
                  SAGE complements — never replaces — human guidance. Always consult your advisor, mentor, and colleagues.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mb-5">
            <div className="bg-primary/5 rounded-md p-4 text-left">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Learn While You Work</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Understand WHY behind every suggestion
              </p>
            </div>
            <div className="bg-sage/10 rounded-md p-4 text-left">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-sage-dark" />
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

          <Button
            data-testid="button-login"
            onClick={() => { window.location.href = "/api/login"; }}
            className="w-full"
          >
            Sign In to Get Started
          </Button>
        </div>
      </Card>
    </div>
  );
}

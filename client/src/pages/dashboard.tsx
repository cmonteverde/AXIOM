import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Flame, Trophy, FileText, Zap, BarChart3, Upload, ArrowLeft, Trash2, GraduationCap, AlertTriangle } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import type { User, Manuscript } from "@shared/schema";

function getLevelThreshold(level: number) {
  return level * 1000;
}

function DeleteAllDataButton() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<number>(0);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const userId = localStorage.getItem("sage_user_id");
      if (!userId) throw new Error("No user found");
      await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      localStorage.removeItem("sage_user_id");
      queryClient.clear();
      navigate("/");
      toast({ title: "All data deleted", description: "Your data has been permanently removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const [showDangerZone, setShowDangerZone] = useState(false);

  const startHold = useCallback(() => {
    setIsHolding(true);
    startTime.current = Date.now();
    holdTimer.current = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const pct = Math.min((elapsed / 3000) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        if (holdTimer.current) clearInterval(holdTimer.current);
        deleteMutation.mutate();
      }
    }, 50);
  }, [deleteMutation]);

  const stopHold = useCallback(() => {
    setIsHolding(false);
    setProgress(0);
    if (holdTimer.current) clearInterval(holdTimer.current);
  }, []);

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearInterval(holdTimer.current);
    };
  }, []);

  return (
    <div className="relative group">
      <button
        onMouseEnter={() => setShowDangerZone(true)}
        onMouseLeave={() => setShowDangerZone(false)}
        onMouseDown={startHold}
        onMouseUp={stopHold}
        onTouchStart={startHold}
        onTouchEnd={stopHold}
        className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors select-none"
        data-testid="button-delete-all"
      >
        <Trash2 className="w-4 h-4" />
        {isHolding ? `Hold to Delete... ${Math.round(progress)}%` : "Delete All Data"}
      </button>
      
      {showDangerZone && (
        <div className="absolute top-full right-0 mt-2 z-50 w-64 animate-in fade-in slide-in-from-top-1">
          <div className="bg-red-900/95 backdrop-blur-sm text-white rounded-md p-3 text-xs shadow-lg border border-red-700/50">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-gold shrink-0" />
              <div>
                <p className="font-bold">DANGER ZONE</p>
                <p>Hold button for 3 seconds to permanently delete ALL data. This cannot be undone!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const userId = localStorage.getItem("sage_user_id");

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  const { data: manuscripts = [], isLoading: manuscriptsLoading } = useQuery<Manuscript[]>({
    queryKey: ["/api/manuscripts", userId],
    enabled: !!userId,
  });

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="p-8 text-center">
          <p className="mb-4 text-muted-foreground">No profile found. Please set up your profile first.</p>
          <Button onClick={() => navigate("/setup")} data-testid="button-go-setup">Get Started</Button>
        </Card>
      </div>
    );
  }

  const isLoading = userLoading || manuscriptsLoading;
  const xp = user?.xp ?? 0;
  const level = user?.level ?? 1;
  const streak = user?.streak ?? 0;
  const nextLevelXp = getLevelThreshold(level);
  const progressPct = nextLevelXp > 0 ? Math.min((xp / nextLevelXp) * 100, 100) : 0;
  const activeManuscripts = manuscripts.filter((m) => m.status === "active");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[90%] lg:max-w-6xl mx-auto p-4 pb-12">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-home"
          >
            ← Home
          </button>
          <DeleteAllDataButton />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-md" />
            <Skeleton className="h-60 w-full rounded-md" />
          </div>
        ) : (
          <>
            <Card className="p-6 mb-6">
              <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-primary" />
                  <h1 className="text-xl font-bold text-primary" data-testid="text-dashboard-title">SAGE Dashboard</h1>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">Level {level}</span>
                  <span className="text-xl font-bold text-primary" data-testid="text-xp">{xp} XP</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Welcome back!</p>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress to Level {level + 1}</span>
                <span>{xp}/{nextLevelXp}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-sage rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                  data-testid="progress-xp-bar"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gold/10 rounded-md p-6 text-center shadow-sm">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame className="w-6 h-6 text-gold-dark" />
                    <span className="text-3xl font-bold text-gold-dark" data-testid="text-streak">{streak}</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Day Streak</p>
                </div>
                <div className="bg-sage/10 rounded-md p-6 text-center shadow-sm">
                  <span className="text-3xl font-bold text-sage-dark" data-testid="text-achievements">0/50</span>
                  <p className="text-sm font-medium text-muted-foreground mt-2">Achievements</p>
                </div>
                <div className="bg-primary/5 rounded-md p-6 text-center shadow-sm">
                  <span className="text-3xl font-bold text-primary" data-testid="text-manuscript-count">{manuscripts.length}</span>
                  <p className="text-sm font-medium text-muted-foreground mt-2">Manuscripts</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 mb-6 border border-dashed border-primary/20">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold">Active Manuscripts</h2>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate("/manuscript/new")}
                  data-testid="button-new-manuscript"
                >
                  + New
                </Button>
              </div>

              {activeManuscripts.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Upload className="w-10 h-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">No manuscripts yet</p>
                  <p className="text-xs text-muted-foreground mb-4">Upload your first manuscript to begin</p>
                  <Button
                    onClick={() => navigate("/manuscript/new")}
                    data-testid="button-upload-manuscript"
                  >
                    Upload Manuscript
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeManuscripts.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-md border border-border hover-elevate cursor-pointer"
                      data-testid={`card-manuscript-${m.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{m.title || "Untitled"}</p>
                          <p className="text-xs text-muted-foreground">{m.stage}</p>
                        </div>
                      </div>
                      {m.readinessScore !== null && (
                        <span className="text-sm font-semibold text-sage-dark">{m.readinessScore}%</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-gold-dark" />
                <h2 className="text-lg font-bold">Today's Challenges</h2>
              </div>
              <div className="p-4 rounded-md bg-gold/10 border border-gold/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-gold-dark mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">Citation Detective</p>
                      <p className="text-xs text-muted-foreground mb-1">Add 3 recent papers to strengthen lit review</p>
                      <p className="text-xs text-muted-foreground">20 min · 250 XP</p>
                    </div>
                  </div>
                  <Button size="sm" data-testid="button-accept-challenge">Accept</Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">This Week</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Sessions", value: "5", color: "" },
                  { label: "XP Gained", value: "+420", color: "text-sage-dark" },
                  { label: "Global Rank", value: "#147", color: "text-primary" },
                  { label: "Field Rank", value: "#12", color: "text-primary" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 border-primary text-primary"
                data-testid="button-leaderboard"
              >
                Leaderboard
              </Button>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

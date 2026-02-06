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
    <div className="space-y-2">
      <button
        onMouseDown={startHold}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={startHold}
        onTouchEnd={stopHold}
        className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors select-none"
        data-testid="button-delete-all"
      >
        <Trash2 className="w-4 h-4" />
        {isHolding ? `Hold to Delete... ${Math.round(progress)}%` : "Delete All Data"}
      </button>
      <div className="bg-red-900/90 text-white rounded-md p-3 text-xs">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
          <div>
            <p className="font-bold">DANGER ZONE</p>
            <p>Hold button for 3 seconds to permanently delete ALL data. This cannot be undone!</p>
          </div>
        </div>
      </div>
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
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, hsl(260 60% 96%) 0%, hsl(260 40% 94%) 50%, hsl(260 60% 96%) 100%)" }}>
        <Card className="p-8 text-center bg-white dark:bg-card">
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
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, hsl(260 60% 96%) 0%, hsl(260 40% 94%) 50%, hsl(260 60% 96%) 100%)" }}>
      <div className="max-w-2xl mx-auto p-4 pb-12">
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
            <Card className="p-6 mb-6 bg-white dark:bg-card">
              <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-foreground" />
                  <h1 className="text-xl font-bold" data-testid="text-dashboard-title">SAGE Dashboard</h1>
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
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                  data-testid="progress-xp-bar"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-lg font-bold text-orange-500" data-testid="text-streak">{streak}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-3 text-center">
                  <span className="text-lg font-bold text-green-600" data-testid="text-achievements">0/50</span>
                  <p className="text-xs text-muted-foreground">Achievements</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-md p-3 text-center">
                  <span className="text-lg font-bold text-primary" data-testid="text-manuscript-count">{manuscripts.length}</span>
                  <p className="text-xs text-muted-foreground">Manuscripts</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 mb-6 bg-white dark:bg-card border border-dashed border-primary/20">
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
                        <span className="text-sm font-semibold text-primary">{m.readinessScore}%</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6 mb-6 bg-white dark:bg-card">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-bold">Today's Challenges</h2>
              </div>
              <div className="p-4 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
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

            <Card className="p-6 bg-white dark:bg-card">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">This Week</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Sessions", value: "5", color: "" },
                  { label: "XP Gained", value: "+420", color: "text-green-600" },
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

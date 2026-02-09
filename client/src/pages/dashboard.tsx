import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { isUnauthorizedError } from "@/lib/auth-utils";
import {
  Flame,
  Trophy,
  FileText,
  Zap,
  BarChart3,
  Upload,
  Trash2,
  GraduationCap,
  AlertTriangle,
  LogOut,
  Loader2,
  Plus,
  Star,
  TrendingUp,
  Target,
  ChevronRight,
  Award,
  Sparkles,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import type { Manuscript } from "@shared/schema";
import sageLogoPath from "@assets/SAGE_logo_transparent.png";

function getLevelThreshold(level: number) {
  return level * 1000;
}

function getLevelTitle(level: number) {
  if (level >= 10) return "Distinguished Scholar";
  if (level >= 8) return "Senior Researcher";
  if (level >= 6) return "Research Fellow";
  if (level >= 4) return "Graduate Scholar";
  if (level >= 2) return "Research Apprentice";
  return "Novice Researcher";
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
      await apiRequest("DELETE", "/api/users/me");
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/api/logout";
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
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
        onMouseLeave={() => { setShowDangerZone(false); stopHold(); }}
        onMouseDown={startHold}
        onMouseUp={stopHold}
        onTouchStart={startHold}
        onTouchEnd={stopHold}
        className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors select-none"
        data-testid="button-delete-all"
      >
        <Trash2 className="w-4 h-4" />
        {isHolding ? `Hold... ${Math.round(progress)}%` : "Delete All Data"}
      </button>

      {showDangerZone && (
        <div className="absolute top-full right-0 mt-2 z-50 w-64 animate-in fade-in slide-in-from-top-1">
          <div className="bg-destructive/95 backdrop-blur-sm text-destructive-foreground rounded-md p-3 text-xs shadow-lg border border-destructive/50">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
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
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (user && (!user.researchLevel || !user.primaryField || !user.learningMode)) {
      navigate("/setup");
    }
  }, [user, navigate]);

  const { toast } = useToast();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: manuscripts = [], isLoading: manuscriptsLoading } = useQuery<Manuscript[]>({
    queryKey: ["/api/manuscripts"],
    enabled: isAuthenticated,
    refetchInterval: (query) => {
      const data = query.state.data as Manuscript[] | undefined;
      if (data?.some(m => m.analysisStatus === "processing" || m.extractionStatus === "processing")) {
        return 3000;
      }
      return false;
    },
  });

  const deleteManuscriptMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/manuscripts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts"] });
      toast({ title: "Manuscript deleted" });
      setDeleteConfirmId(null);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-lg p-8">
          <Skeleton className="h-40 w-full rounded-md mb-4" />
          <Skeleton className="h-60 w-full rounded-md" />
        </Card>
      </div>
    );
  }

  if (!user) return null;

  const isLoading = manuscriptsLoading;
  const xp = user.xp ?? 0;
  const level = user.level ?? 1;
  const streak = user.streak ?? 0;
  const nextLevelXp = getLevelThreshold(level);
  const progressPct = nextLevelXp > 0 ? Math.min((xp / nextLevelXp) * 100, 100) : 0;
  const activeManuscripts = manuscripts.filter((m) => m.status === "active");
  const displayName = user.firstName || user.email || "Researcher";
  const analyzedCount = manuscripts.filter(m => m.analysisStatus === "completed").length;
  const levelTitle = getLevelTitle(level);

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 h-16">
          <div className="flex items-center" data-testid="text-dashboard-logo">
            <img src={sageLogoPath} alt="SAGE" className="w-14 h-14 object-contain" data-testid="img-logo" />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              {user.profileImageUrl && (
                <img src={user.profileImageUrl} alt="" className="w-7 h-7 rounded-full" data-testid="img-profile" />
              )}
              <span className="text-sm font-medium hidden sm:inline" data-testid="text-username">{displayName}</span>
            </div>
            <DeleteAllDataButton />
            <a
              href="/api/logout"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors"
              data-testid="link-logout"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-md" />
            <Skeleton className="h-60 w-full rounded-md" />
          </div>
        ) : (
          <>
            <section className="mb-8">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" data-testid="text-dashboard-title">
                    Welcome back, {displayName}
                  </h1>
                  <p className="text-muted-foreground">
                    Continue strengthening your scholarly writing.
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/manuscript/new")}
                  data-testid="button-new-manuscript"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Manuscript
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Card className="lg:col-span-2 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold">Level {level}</h2>
                        <Badge variant="secondary">{levelTitle}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{xp} / {nextLevelXp} XP to next level</p>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-muted rounded-full mb-6 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${progressPct}%` }}
                      data-testid="progress-xp-bar"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-md bg-muted/50">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Flame className="w-5 h-5 text-chart-3" />
                        <span className="text-2xl font-bold" data-testid="text-streak">{streak}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Day Streak</p>
                    </div>
                    <div className="text-center p-4 rounded-md bg-muted/50">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-bold" data-testid="text-xp">{xp}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Total XP</p>
                    </div>
                    <div className="text-center p-4 rounded-md bg-muted/50">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Trophy className="w-5 h-5 text-chart-2" />
                        <span className="text-2xl font-bold" data-testid="text-achievements">0</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Achievements</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-chart-3" />
                    <h2 className="text-base font-bold">Daily Challenge</h2>
                  </div>
                  <div className="rounded-md bg-muted/50 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      <p className="text-sm font-semibold">Citation Detective</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">Add 3 recent papers to strengthen your literature review.</p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>20 min</span>
                        <span className="font-medium text-primary">+250 XP</span>
                      </div>
                      <Button size="sm" data-testid="button-accept-challenge">Accept</Button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">This Week</h3>
                    {[
                      { label: "Sessions", value: "5", icon: BarChart3 },
                      { label: "XP Earned", value: "+420", icon: TrendingUp },
                      { label: "Analyzed", value: String(analyzedCount), icon: FileText },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold">Your Manuscripts</h2>
                  {activeManuscripts.length > 0 && (
                    <Badge variant="secondary" className="text-xs">{activeManuscripts.length}</Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/manuscript/new")}
                  data-testid="button-new-manuscript-secondary"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add
                </Button>
              </div>

              {activeManuscripts.length === 0 ? (
                <Card className="p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Upload className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold mb-1">No manuscripts yet</h3>
                    <p className="text-sm text-muted-foreground mb-5 max-w-sm">
                      Upload your first manuscript and let SAGE analyze it across 11 scholarly phases.
                    </p>
                    <Button
                      onClick={() => navigate("/manuscript/new")}
                      data-testid="button-upload-manuscript"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Manuscript
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {activeManuscripts.map((m) => (
                    <div key={m.id} data-testid={`card-manuscript-${m.id}`}>
                      {deleteConfirmId === m.id ? (
                        <Card className="p-4 border-destructive/40 bg-destructive/5">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm">Delete this manuscript?</p>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteConfirmId(null)}
                                data-testid={`button-cancel-delete-${m.id}`}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteManuscriptMutation.mutate(m.id)}
                                disabled={deleteManuscriptMutation.isPending}
                                data-testid={`button-confirm-delete-${m.id}`}
                              >
                                {deleteManuscriptMutation.isPending ? "Deleting..." : "Delete"}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ) : (
                        <Card
                          className="p-4 hover-elevate cursor-pointer"
                          onClick={() => navigate(`/manuscript/${m.id}`)}
                          data-testid={`button-manuscript-${m.id}`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{m.title || "Untitled"}</p>
                                {m.previewText && (
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{m.previewText}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {m.extractionStatus === "processing" && (
                                <Badge variant="secondary" className="text-xs">
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Extracting
                                </Badge>
                              )}
                              {m.analysisStatus === "processing" && (
                                <Badge variant="secondary" className="text-xs">
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Analyzing
                                </Badge>
                              )}
                              {m.analysisStatus === "completed" && m.readinessScore !== null && (
                                <Badge variant="secondary" className="text-xs font-semibold">
                                  <Star className="w-3 h-3 mr-1" />
                                  {m.readinessScore}%
                                </Badge>
                              )}
                              {m.analysisStatus === "none" && !m.readinessScore && m.extractionStatus !== "processing" && (
                                <Badge variant="outline" className="text-xs">Not analyzed</Badge>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(m.id);
                                }}
                                data-testid={`button-delete-manuscript-${m.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-muted-foreground" />
                              </Button>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Achievements</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "First Upload", description: "Upload your first manuscript", icon: Upload, earned: manuscripts.length > 0 },
                  { title: "First Analysis", description: "Run your first SAGE analysis", icon: Sparkles, earned: analyzedCount > 0 },
                  { title: "Streak Starter", description: "Maintain a 3-day streak", icon: Flame, earned: streak >= 3 },
                  { title: "Scholar Rising", description: "Reach Level 5", icon: TrendingUp, earned: level >= 5 },
                ].map((achievement) => (
                  <Card
                    key={achievement.title}
                    className={`p-4 ${achievement.earned ? "" : "opacity-50"}`}
                    data-testid={`card-achievement-${achievement.title.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${achievement.earned ? "bg-primary/10" : "bg-muted"}`}>
                        <achievement.icon className={`w-4.5 h-4.5 ${achievement.earned ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

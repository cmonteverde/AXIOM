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
  HelpCircle,
  Sun,
  Moon,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useRef, useCallback, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { OnboardingTour } from "@/components/onboarding-tour";
import type { Manuscript } from "@shared/schema";
import axiomLogoPath from "@assets/image_(2)_1771052353785.png";

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
  const { theme, setTheme, resolvedTheme } = useTheme();
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

  interface LeaderboardEntry {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    primaryField: string | null;
    xp: number;
    level: number;
    streak: number;
  }

  const { data: leaderboard = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
    enabled: isAuthenticated,
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
  const achievementsEarned = [
    manuscripts.length > 0,
    analyzedCount > 0,
    streak >= 3,
    level >= 5,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <OnboardingTour />
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 h-16">
          <div className="flex items-center" data-testid="text-dashboard-logo">
            <img src={axiomLogoPath} alt="AXIOM" className="w-10 h-10 object-contain" data-testid="img-logo" />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              {user.profileImageUrl && (
                <img src={user.profileImageUrl} alt="" className="w-7 h-7 rounded-full" data-testid="img-profile" />
              )}
              <span className="text-sm font-medium hidden sm:inline" data-testid="text-username">{displayName}</span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors"
                  data-testid="button-theme-toggle"
                >
                  {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Switch to {resolvedTheme === "dark" ? "light" : "dark"} mode
              </TooltipContent>
            </Tooltip>
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center p-4 rounded-md bg-muted/50 cursor-help">
                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            <Flame className="w-5 h-5 text-chart-3" />
                            <span className="text-2xl font-bold" data-testid="text-streak">{streak}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Day Streak</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px] text-center">
                        Consecutive days with at least 1 manuscript analyzed. Keep the streak going!
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center p-4 rounded-md bg-muted/50 cursor-help">
                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <span className="text-2xl font-bold" data-testid="text-xp">{xp}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Total XP</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px] text-center">
                        Experience points earned from completing audits. More complex manuscripts earn more XP.
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center p-4 rounded-md bg-muted/50 cursor-help">
                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            <Trophy className="w-5 h-5 text-chart-2" />
                            <span className="text-2xl font-bold" data-testid="text-achievements">{achievementsEarned}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Achievements</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px] text-center">
                        Unlock badges by hitting milestones: first upload, first audit, streaks, and level-ups.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-chart-3" />
                    <h2 className="text-base font-bold">Daily Challenge</h2>
                  </div>
                  {(() => {
                    const challenges = [
                      { title: "Citation Detective", desc: "Run a citation analysis on your latest manuscript to check reference quality.", xp: 250, time: "10 min", action: "analyze-citations" },
                      { title: "Audit Sprint", desc: "Upload and audit a new manuscript from start to finish.", xp: 400, time: "30 min", action: "new-manuscript" },
                      { title: "Revision Tracker", desc: "Upload reviewer comments and draft point-by-point responses.", xp: 300, time: "20 min", action: "reviewer-response" },
                      { title: "Cover Letter Pro", desc: "Generate a cover letter for your most recent audited manuscript.", xp: 200, time: "10 min", action: "cover-letter" },
                      { title: "Journal Scout", desc: "Use the journal selection tool to find target journals for your paper.", xp: 200, time: "10 min", action: "journal-match" },
                      { title: "Score Booster", desc: "Re-analyze a manuscript and try to improve your audit score.", xp: 350, time: "25 min", action: "re-analyze" },
                      { title: "Action Item Hero", desc: "Complete 3 action items from your latest audit feedback.", xp: 250, time: "20 min", action: "action-items" },
                    ];
                    const dayIndex = Math.floor(Date.now() / 86400000) % challenges.length;
                    const challenge = challenges[dayIndex];
                    const latestManuscript = activeManuscripts[0];

                    const handleAccept = () => {
                      if (challenge.action === "new-manuscript") {
                        navigate("/manuscript/new");
                      } else if (latestManuscript) {
                        navigate(`/manuscript/${latestManuscript.id}`);
                      } else {
                        navigate("/manuscript/new");
                      }
                    };

                    return (
                      <div className="rounded-md bg-muted/50 p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-primary" />
                          <p className="text-sm font-semibold">{challenge.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{challenge.desc}</p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{challenge.time}</span>
                            <span className="font-medium text-primary">+{challenge.xp} XP</span>
                          </div>
                          <Button size="sm" onClick={handleAccept} data-testid="button-accept-challenge">Accept</Button>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">This Week</h3>
                    {[
                      { label: "Manuscripts", value: String(activeManuscripts.length), icon: BarChart3 },
                      { label: "Total XP", value: xp > 0 ? xp.toLocaleString() : "0", icon: TrendingUp },
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
                    <h3 className="text-base font-semibold mb-1">Get started in 3 steps</h3>
                    <div className="text-left max-w-sm space-y-3 mb-5 mt-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">1</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Upload your manuscript</p>
                          <p className="text-xs text-muted-foreground">PDF, DOCX, or paste text directly. Drafts and final versions both work.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">2</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Select audit focus areas</p>
                          <p className="text-xs text-muted-foreground">Choose which sections to audit, or select "Comprehensive Review" for full coverage.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">3</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Review findings and fix issues</p>
                          <p className="text-xs text-muted-foreground">AXIOM scores your manuscript, flags critical issues, and gives actionable fix suggestions.</p>
                        </div>
                      </div>
                    </div>
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
                                  Auditing
                                </Badge>
                              )}
                              {m.analysisStatus === "completed" && m.readinessScore !== null && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="secondary" className="text-xs font-semibold cursor-help">
                                      <Star className="w-3 h-3 mr-1" />
                                      {m.readinessScore}%
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="max-w-[180px] text-center">
                                    {m.readinessScore >= 75 ? "Submission-ready" : m.readinessScore >= 50 ? "Revisions needed" : "Major work needed"}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {m.analysisStatus === "none" && !m.readinessScore && m.extractionStatus !== "processing" && (
                                <Badge variant="outline" className="text-xs">Not audited</Badge>
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

            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Achievements</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "First Upload", description: "Upload your first manuscript", icon: Upload, earned: manuscripts.length > 0 },
                  { title: "First Audit", description: "Run your first AXIOM audit", icon: Sparkles, earned: analyzedCount > 0 },
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

            <section className="mb-8">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-chart-3" />
                  <h2 className="text-lg font-bold">Leaderboard</h2>
                </div>
                <Badge variant="secondary" className="text-xs">Global</Badge>
              </div>
              <Card className="p-0 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Top Researchers</h3>
                      {leaderboard.length > 0 && <Badge variant="outline" className="text-[10px]">{leaderboard.length} active</Badge>}
                    </div>
                    <div className="space-y-1">
                      {leaderboard.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No rankings yet. Be the first to earn XP!</p>
                      ) : (
                        leaderboard.slice(0, 5).map((entry, i) => {
                          const rank = i + 1;
                          const entryName = [entry.firstName, entry.lastName].filter(Boolean).join(" ") || "Researcher";
                          return (
                            <div
                              key={entry.id}
                              className={`flex items-center justify-between gap-3 p-2.5 rounded-md hover-elevate ${entry.id === user.id ? "bg-primary/5 border border-primary/10" : ""}`}
                              data-testid={`row-leaderboard-${rank}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-6 text-center text-sm font-bold ${rank <= 3 ? "text-chart-3" : "text-muted-foreground"}`}>
                                  {rank}
                                </span>
                                {entry.profileImageUrl ? (
                                  <img src={entry.profileImageUrl} alt={entryName} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <GraduationCap className="w-4 h-4 text-primary" />
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium">{entryName}{entry.id === user.id ? " (You)" : ""}</p>
                                  <p className="text-xs text-muted-foreground">{entry.primaryField || "Researcher"}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right">
                                  <p className="text-sm font-bold">{entry.xp.toLocaleString()}</p>
                                  <p className="text-[10px] text-muted-foreground">XP</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Flame className="w-3 h-3 text-chart-3" />
                                  {entry.streak}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div className="p-5 bg-muted/30 border-l border-border">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Your Standing</h3>
                    <div className="flex items-center gap-3 p-3 rounded-md bg-primary/5 border border-primary/10 mb-5">
                      <span className="w-6 text-center text-sm font-bold text-primary">#{Math.max(1, leaderboard.filter(e => e.xp > xp).length + 1)}</span>
                      {user.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.primaryField || "Researcher"}</p>
                      </div>
                      <div className="ml-auto text-right shrink-0">
                        <p className="text-sm font-bold text-primary">{xp.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">XP</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        {(() => {
                          const rank = leaderboard.filter(e => e.xp > xp).length + 1;
                          const nextAbove = leaderboard.filter(e => e.xp > xp).sort((a, b) => a.xp - b.xp)[0];
                          const xpNeeded = nextAbove ? nextAbove.xp - xp : 0;
                          const progressToNext = nextAbove ? Math.min((xp / nextAbove.xp) * 100, 100) : 100;
                          return (
                            <>
                              <div className="flex items-center justify-between gap-2 text-xs mb-1">
                                <span className="text-muted-foreground">{nextAbove ? `To rank #${rank - 1}` : "Top of the board!"}</span>
                                <span className="font-medium">{xpNeeded > 0 ? `${xpNeeded.toLocaleString()} XP needed` : "You're #1!"}</span>
                              </div>
                              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${progressToNext}%` }} />
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      <div className="pt-2 space-y-2">
                        {[
                          { label: "Level", value: `${level} — ${levelTitle}`, sublabel: `${nextLevelXp - xp} XP to next level` },
                          { label: "Streak", value: streak > 0 ? `${streak} day${streak !== 1 ? "s" : ""}` : "Start today!", sublabel: streak >= 3 ? "Keep it up!" : "Audit daily to build streak" },
                        ].map((stat) => (
                          <div key={stat.label} className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm text-muted-foreground">{stat.label}</p>
                              <p className="text-[10px] text-muted-foreground">{stat.sublabel}</p>
                            </div>
                            <span className="text-sm font-semibold">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {leaderboard.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-5">
                <Star className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Top Scholars</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }} data-testid="scroll-top-scholars">
                {leaderboard.map((scholar, i) => {
                  const scholarName = [scholar.firstName, scholar.lastName].filter(Boolean).join(" ") || "Researcher";
                  const badge = getLevelTitle(scholar.level);
                  return (
                    <Card
                      key={scholar.id}
                      className={`p-5 shrink-0 w-56 ${scholar.id === user.id ? "border-primary/30" : ""}`}
                      data-testid={`card-scholar-${i}`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="relative mb-3">
                          {scholar.profileImageUrl ? (
                            <img
                              src={scholar.profileImageUrl}
                              alt={scholarName}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                              <GraduationCap className="w-8 h-8 text-primary" />
                            </div>
                          )}
                          {i < 3 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-chart-3 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-primary-foreground">#{i + 1}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-semibold truncate w-full">{scholarName}{scholar.id === user.id ? " (You)" : ""}</p>
                        <p className="text-xs text-muted-foreground mb-2">{scholar.primaryField || "Researcher"}</p>
                        <Badge variant="secondary" className="text-[10px] mb-3">{badge}</Badge>
                        <div className="flex items-center justify-center gap-4 w-full">
                          <div className="text-center">
                            <p className="text-sm font-bold text-primary">{scholar.xp.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground">XP</p>
                          </div>
                          <div className="w-px h-6 bg-border" />
                          <div className="text-center">
                            <p className="text-sm font-bold">Lv.{scholar.level}</p>
                            <p className="text-[10px] text-muted-foreground">Level</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

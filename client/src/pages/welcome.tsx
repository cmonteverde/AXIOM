import { useLocation } from "wouter";
import {
  FileSearch,
  BookOpen,
  Target,
  Shield,
  GraduationCap,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  Award,
  BookOpenCheck,
  Layers,
  FileText,
  Info,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import axiomLogoPath from "@assets/image_(2)_1771052353785.png";
import analysisScreenshot from "@assets/image_1770620881472.png";
import dashboardScreenshot from "@assets/image_1770620853328.png";
import testimonial1 from "@assets/testimonial-1.png";
import testimonial2 from "@assets/testimonial-2.png";
import testimonial3 from "@assets/testimonial-3.png";
import testimonial4 from "@assets/testimonial-4.png";
import testimonial5 from "@assets/testimonial-5.png";
import testimonial6 from "@assets/testimonial-6.png";
import { useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    icon: FileSearch,
    title: "11-Phase Rigor Audit",
    description: "Every section stress-tested against publication standards. No blind spots, no guesswork.",
    badge: null,
  },
  {
    icon: ClipboardList,
    title: "Reporting Guideline Enforcement",
    description: "Auto-detects your study design and maps to CONSORT, PRISMA, STROBE, COREQ, STARD, and more.",
    badge: "Auto",
  },
  {
    icon: AlertTriangle,
    title: "Severity-Ranked Violations",
    description: "Critical, Important, or Minor — so you fix what will get you desk-rejected first.",
    badge: null,
  },
  {
    icon: BookOpenCheck,
    title: "CaRS & 5-Move Models",
    description: "Abstract and Introduction audited against the 5-Move Abstract and Create-a-Research-Space models.",
    badge: null,
  },
  {
    icon: Target,
    title: "Evidence-Backed Standards",
    description: "Every finding cites ICMJE, EQUATOR, APA, COPE, or Nature guidelines. No vague suggestions.",
    badge: "Cited",
  },
  {
    icon: Award,
    title: "Gamified Progress",
    description: "Earn XP, level up, maintain streaks, and unlock achievements as you strengthen your manuscripts.",
    badge: null,
  },
  {
    icon: Shield,
    title: "Ethics & Transparency Audit",
    description: "Catches missing IRB approvals, AI disclosure gaps (ICMJE 2024), COI omissions, and CRediT roles.",
    badge: null,
  },
  {
    icon: Layers,
    title: "Zero-I Perspective Check",
    description: "Flags first-person pronouns and subjective adjectives that undermine objectivity.",
    badge: null,
  },
];

const BENEFITS = [
  {
    icon: AlertTriangle,
    title: "Catch Desk Rejections Early",
    description: "Surface the exact compliance gaps that editors flag in the first 60 seconds.",
  },
  {
    icon: BarChart3,
    title: "Audit Score",
    description: "A weighted score across 9 categories tells you exactly how far you are from submission-ready.",
  },
  {
    icon: Zap,
    title: "Powered by UMA Framework",
    description: "Built on the Universal Manuscript Architecture with dual-engine validation logic.",
  },
  {
    icon: BookOpen,
    title: "21+ Curated Standards",
    description: "Direct links to authoritative guidelines from ICMJE, Nature, EQUATOR, APA, and COPE.",
  },
];

const FAQ_ITEMS = [
  {
    q: "What is AXIOM?",
    a: "AXIOM is an AI-powered pre-submission audit tool that stress-tests your manuscript across 11 phases and surfaces severity-ranked compliance gaps based on reporting guidelines like CONSORT, PRISMA, and STROBE.",
  },
  {
    q: "Does AXIOM write my paper for me?",
    a: "No. AXIOM validates your existing manuscript against publication standards and explains why specific issues will trigger reviewer objections. It complements — never replaces — advisor feedback.",
  },
  {
    q: "What types of manuscripts does AXIOM support?",
    a: "AXIOM audits RCTs, systematic reviews, observational studies, qualitative research, diagnostic studies, animal research, and prediction models. It auto-classifies your document and selects the correct reporting guideline.",
  },
  {
    q: "Is my manuscript data private?",
    a: "AXIOM stores your audit results but does not permanently store your full manuscript text beyond what is needed for the session. You can delete all your data at any time from the dashboard.",
  },
  {
    q: "What file formats can I upload?",
    a: "AXIOM accepts PDF, DOCX, and TXT files up to 50MB. You can also paste your manuscript text directly for immediate auditing.",
  },
  {
    q: "How does the scoring work?",
    a: "Your audit score is weighted across 9 categories: Title/Keywords (8%), Abstract (12%), Introduction (10%), Methods (15%), Results (13%), Discussion (12%), Ethics & Transparency (10%), Writing Quality (10%), and Zero-I (10%).",
  },
];

const STATS = [
  { value: "11", label: "Audit Phases" },
  { value: "7+", label: "Reporting Guidelines" },
  { value: "9", label: "Scoring Categories" },
];

const TESTIMONIALS = [
  {
    name: "Dr. Priya Sharma",
    role: "Epidemiology, Johns Hopkins",
    photo: testimonial1,
    quote: "AXIOM caught 3 CONSORT violations I completely missed. Without it, that would have been a desk rejection.",
    stars: 5,
  },
  {
    name: "Prof. Marcus Johnson",
    role: "Biostatistics, Duke University",
    photo: testimonial2,
    quote: "The reporting guideline matching is incredible. It auto-detected my RCT needed CONSORT 2025 and flagged critical items immediately.",
    stars: 5,
  },
  {
    name: "Dr. Wei Lin",
    role: "Public Health, UCLA",
    photo: testimonial3,
    quote: "My first manuscript was rejected twice. After the AXIOM audit, I addressed every compliance gap before resubmission. Accepted with minor revisions.",
    stars: 5,
  },
  {
    name: "Prof. Richard Hensley",
    role: "Clinical Research, Oxford",
    photo: testimonial4,
    quote: "The 5-Move Abstract check alone saved me hours. I now run AXIOM on every manuscript before sending to co-authors.",
    stars: 5,
  },
  {
    name: "Dr. Sofia Reyes",
    role: "Neuroscience, Stanford",
    photo: testimonial5,
    quote: "As a non-native English speaker, the Zero-I check is a game-changer. It catches subtle objectivity issues that spell-checkers miss entirely.",
    stars: 5,
  },
  {
    name: "Dr. Karim Al-Rashid",
    role: "Environmental Science, MIT",
    photo: testimonial6,
    quote: "The ethics audit caught my missing data availability statement and CRediT taxonomy. Those would have been instant desk rejections.",
    stars: 5,
  },
];

const PREVIEW_TABS = [
  { id: "analysis", label: "Manuscript Audit", icon: FileSearch },
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
] as const;

function TestimonialMarquee() {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <div className="w-full overflow-hidden py-8" data-testid="section-testimonials">
      <div className="flex animate-marquee gap-5" style={{ width: "max-content" }}>
        {doubled.map((t, i) => (
          <div
            key={`${t.name}-${i}`}
            className="shrink-0 w-[340px] rounded-md border border-border bg-card p-5 flex flex-col gap-3"
            data-testid={`card-testimonial-${i}`}
          >
            <div className="flex gap-0.5">
              {Array.from({ length: t.stars }).map((_, s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-chart-3 text-chart-3" />
              ))}
            </div>
            <p className="text-sm text-foreground leading-relaxed flex-1">"{t.quote}"</p>
            <div className="flex items-center gap-3 pt-1">
              <img
                src={t.photo}
                alt={t.name}
                className="w-9 h-9 rounded-full object-cover"
                data-testid={`img-testimonial-${i}`}
              />
              <div>
                <p className="text-sm font-semibold" data-testid={`text-testimonial-name-${i}`}>{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductPreview() {
  const [activeTab, setActiveTab] = useState<"analysis" | "dashboard">("analysis");

  return (
    <div className="relative" data-testid="product-preview">
      <div className="absolute -inset-4 bg-gradient-to-b from-primary/5 via-primary/3 to-transparent rounded-2xl blur-xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-center gap-1 mb-4 flex-wrap">
          {PREVIEW_TABS.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id as "analysis" | "dashboard")}
              data-testid={`button-preview-${tab.id}`}
            >
              <tab.icon className="w-3.5 h-3.5 mr-1.5" />
              {tab.label}
            </Button>
          ))}
        </div>
        <div className="rounded-md border border-border bg-card overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/70 border-b border-border">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-chart-3/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-chart-2/70" />
            <span className="text-[11px] text-foreground/50 ml-2">
              {activeTab === "analysis" ? "axiom — manuscript audit" : "axiom — dashboard"}
            </span>
          </div>
          <div className="relative">
            <img
              src={activeTab === "analysis" ? analysisScreenshot : dashboardScreenshot}
              alt={activeTab === "analysis" ? "AXIOM manuscript audit workspace showing split-view with manuscript text and rigor analysis panel" : "AXIOM dashboard with gamification stats, manuscripts list, and audit history"}
              className="w-full h-auto block"
              data-testid={`img-preview-${activeTab}`}
            />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Welcome() {
  const [, navigate] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [navScrolled, setNavScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    life: number; maxLife: number; size: number;
    color: string;
  }>>([]);
  const animFrameRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    if (!hero || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const syncSize = () => {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    };
    syncSize();

    const ro = new ResizeObserver(syncSize);
    ro.observe(hero);

    const COLORS = [
      "hsla(258, 70%, 60%,",
      "hsla(258, 60%, 70%,",
      "hsla(142, 55%, 55%,",
      "hsla(142, 50%, 65%,",
      "hsla(45, 85%, 60%,",
      "hsla(280, 60%, 65%,",
    ];

    const spawnBurst = (cx: number, cy: number) => {
      const count = 6 + Math.floor(Math.random() * 6);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3;
        particlesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 0.5 + Math.random() * 0.8,
          size: 2 + Math.random() * 3,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSpawnRef.current < 40) return;
      lastSpawnRef.current = now;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spawnBurst(x, y);
    };

    hero.addEventListener("mousemove", handleMouseMove);

    let prev = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.1);
      prev = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const arr = particlesRef.current;
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        p.life -= dt / p.maxLife;
        if (p.life <= 0) { arr.splice(i, 1); continue; }

        p.vy += 30 * dt;
        p.vx *= 0.98;
        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;

        const alpha = Math.pow(p.life, 1.5);
        const radius = p.size * (0.3 + 0.7 * p.life);

        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius + 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color + (alpha * 0.3).toFixed(3) + ")";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + alpha.toFixed(3) + ")";
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      ro.disconnect();
      hero.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.researchLevel && user.primaryField && user.learningMode) {
        navigate("/dashboard");
      } else {
        navigate("/setup");
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

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
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          navScrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border"
            : "bg-transparent"
        }`}
        data-testid="nav-bar"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2" data-testid="text-nav-logo">
            <img src={axiomLogoPath} alt="AXIOM" className="w-10 h-10 object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-base font-medium text-foreground hover:text-primary transition-colors" data-testid="link-nav-features">Features</a>
            <a href="#benefits" className="text-base font-medium text-foreground hover:text-primary transition-colors" data-testid="link-nav-benefits">Why AXIOM</a>
            <a href="#faq" className="text-base font-medium text-foreground hover:text-primary transition-colors" data-testid="link-nav-faq">FAQ</a>
          </div>
          <Button
            data-testid="button-nav-login"
            onClick={() => { window.location.href = "/api/login"; }}
            size="sm"
          >
            Sign In
          </Button>
        </div>
      </nav>

      <section ref={heroRef} className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
          aria-hidden="true"
          style={{ display: "block" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <Badge variant="secondary" className="mb-6" data-testid="badge-hero">
            <Shield className="w-3 h-3 mr-1.5" />
            Pre-Submission Manuscript Audit
          </Badge>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6"
            data-testid="text-welcome-title"
          >
            Stop Guessing.{" "}
            <span className="text-primary">Start Publishing.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Your research is too valuable to risk a desk rejection. AXIOM stress-tests your manuscript across 11 phases against CONSORT, PRISMA, and STROBE before you submit.
          </p>
          <p className="text-sm text-muted-foreground/70 mb-8">
            Developed by Corrie Monteverde, PhD
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Button
              data-testid="button-login"
              onClick={() => { window.location.href = "/api/login"; }}
              size="lg"
              className="px-8"
            >
              Run Pre-Submission Audit
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
                <p className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialMarquee />

      <section className="pb-20 px-4 sm:px-6 lg:px-8" data-testid="section-product-preview">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">See AXIOM in action</p>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Built for Publication-Grade Rigor
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Every audit phase targets the exact gaps that trigger desk rejections and reviewer objections.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feature) => (
              <Card
                key={feature.title}
                className="p-5 relative group"
                data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s/g, "-")}`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  {feature.badge && (
                    <Badge variant="secondary" className="text-[10px]">{feature.badge}</Badge>
                  )}
                </div>
                <h3 className="text-sm font-semibold mb-1.5">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="axiom-dark-section py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Why Researchers Trust AXIOM
            </h2>
            <p className="opacity-70 text-base sm:text-lg max-w-2xl mx-auto">
              Surface compliance gaps before editors do. Every audit is backed by authoritative standards.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-md border border-white/10 p-5 bg-white/5"
                data-testid={`card-benefit-${benefit.title.toLowerCase().replace(/\s/g, "-")}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
                    <benefit.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-xs opacity-60 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-md border border-primary/30 bg-primary/10 p-5 flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                AXIOM validates — it never writes for you.
              </p>
              <p className="text-xs opacity-60 mt-1">
                Always consult your advisor, mentor, and colleagues. AXIOM is a rigor-checking tool, not a co-author.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">How AXIOM Works</h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Three steps from upload to actionable audit results.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {[
              {
                step: "01",
                title: "Upload Your Manuscript",
                description: "Upload a PDF, DOCX, or TXT file — or paste your text directly. AXIOM extracts and prepares your content automatically.",
                icon: FileText,
              },
              {
                step: "02",
                title: "Select Audit Focus",
                description: "Choose which sections and standards to stress-test. AXIOM tailors the audit to your manuscript stage and needs.",
                icon: Target,
              },
              {
                step: "03",
                title: "Get Your Audit Report",
                description: "Receive severity-ranked violations, an audit score, and cited standards — all in a split-view workspace.",
                icon: CheckCircle2,
              },
            ].map((item) => (
              <Card key={item.step} className="p-6 text-center" data-testid={`card-step-${item.step}`}>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-sm font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Frequently Asked Questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} data-testid={`faq-item-${i}`}>
                <AccordionTrigger className="text-sm font-medium text-left" data-testid={`button-faq-${i}`}>
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="axiom-dark-section py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Don't Submit Without an Audit.
          </h2>
          <p className="opacity-70 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Upload your manuscript and surface compliance gaps before editors do.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button
              data-testid="button-cta-final"
              onClick={() => { window.location.href = "/api/login"; }}
              size="lg"
              className="px-8"
            >
              Start Rigor Check
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs opacity-50 flex-wrap">
            <span className="flex items-center gap-1.5" data-testid="text-no-credit-card"><CheckCircle2 className="w-3.5 h-3.5" /> No credit card required</span>
            <span className="flex items-center gap-1.5" data-testid="text-delete-data"><CheckCircle2 className="w-3.5 h-3.5" /> Delete your data anytime</span>
            <span className="flex items-center gap-1.5" data-testid="text-privacy"><CheckCircle2 className="w-3.5 h-3.5" /> Privacy-first design</span>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-3">
                <img src={axiomLogoPath} alt="AXIOM" className="w-10 h-10 object-contain" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AXIOM stress-tests manuscripts against top-tier rigor standards (CONSORT, PRISMA, STROBE) before submission.
                <br />
                Developed by Corrie Monteverde, PhD
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-features">Features</a></li>
                <li><a href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-benefits">Why AXIOM</a></li>
                <li><a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-faq">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Standards</h4>
              <ul className="space-y-2">
                <li><a href="https://www.icmje.org/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-icmje">ICMJE</a></li>
                <li><a href="https://www.equator-network.org/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-equator">EQUATOR Network</a></li>
                <li><a href="https://apastyle.apa.org/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-apa">APA Style</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} AXIOM. All rights reserved.</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> Privacy-first. Your data, your control.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

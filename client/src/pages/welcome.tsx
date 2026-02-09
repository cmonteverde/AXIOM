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
import sageLogoPath from "@assets/SAGE_logo_transparent.png";
import analysisScreenshot from "@assets/image_1770620881472.png";
import dashboardScreenshot from "@assets/image_1770620853328.png";
import { useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    icon: FileSearch,
    title: "11-Phase Manuscript Analysis",
    description: "From document classification to writing standards — every section evaluated against scholarly best practices.",
    badge: null,
  },
  {
    icon: ClipboardList,
    title: "Reporting Guideline Matching",
    description: "Automatically identifies your study design and maps to CONSORT, PRISMA, STROBE, COREQ, STARD, and more.",
    badge: "Smart",
  },
  {
    icon: AlertTriangle,
    title: "Severity-Based Feedback",
    description: "Issues ranked as Critical, Important, or Minor so you know exactly what to fix first before submission.",
    badge: null,
  },
  {
    icon: BookOpenCheck,
    title: "CaRS & 5-Move Models",
    description: "Your Abstract and Introduction analyzed against the 5-Move Abstract and Create-a-Research-Space models.",
    badge: null,
  },
  {
    icon: Target,
    title: "Why-Based Pedagogy",
    description: "Every suggestion explains WHY it matters with links to ICMJE, EQUATOR, APA, COPE, and Nature standards.",
    badge: "Learn",
  },
  {
    icon: Award,
    title: "Gamified Progress",
    description: "Earn XP, level up, maintain streaks, and unlock achievements as you improve your scholarly writing.",
    badge: null,
  },
  {
    icon: Shield,
    title: "Ethics & Transparency Audit",
    description: "Checks for IRB approvals, AI disclosure (ICMJE 2024), COI declarations, and CRediT author roles.",
    badge: null,
  },
  {
    icon: Layers,
    title: "Zero-I Perspective Check",
    description: "Detects first-person pronouns and subjective adjectives for objective, publication-ready writing.",
    badge: null,
  },
];

const BENEFITS = [
  {
    icon: GraduationCap,
    title: "Learn While You Write",
    description: "Every piece of feedback is a micro-lesson backed by authoritative sources.",
  },
  {
    icon: BarChart3,
    title: "Readiness Score",
    description: "A weighted score across 9 categories tells you exactly how close you are to submission.",
  },
  {
    icon: Sparkles,
    title: "Powered by UMA Framework",
    description: "Built on the Universal Manuscript Architecture with dual-engine evaluation logic.",
  },
  {
    icon: BookOpen,
    title: "21+ Curated Resources",
    description: "Direct links to authoritative writing guides from ICMJE, Nature, EQUATOR, APA, and COPE.",
  },
];

const FAQ_ITEMS = [
  {
    q: "What is SAGE?",
    a: "SAGE (Scholarly Assistant for Guided Excellence) is an AI-powered research mentor that analyzes your manuscript across 11 phases and provides severity-ranked feedback based on reporting guidelines like CONSORT, PRISMA, and STROBE.",
  },
  {
    q: "Does SAGE write my paper for me?",
    a: "No. SAGE is an educational tool that evaluates your existing manuscript and explains why specific changes strengthen your work. It complements — never replaces — human mentorship from advisors and colleagues.",
  },
  {
    q: "What types of manuscripts does SAGE support?",
    a: "SAGE supports RCTs, systematic reviews, observational studies, qualitative research, diagnostic studies, animal research, and prediction models. It automatically classifies your document and selects the appropriate reporting guideline.",
  },
  {
    q: "Is my manuscript data private?",
    a: "SAGE stores your learning progress and analysis results but does not permanently store your full manuscript text beyond what is needed for the session. You can delete all your data at any time from the dashboard.",
  },
  {
    q: "What file formats can I upload?",
    a: "SAGE accepts PDF, DOCX, and TXT files up to 50MB. You can also paste your manuscript text directly for immediate analysis.",
  },
  {
    q: "How does the scoring work?",
    a: "Your readiness score is weighted across 9 categories: Title/Keywords (8%), Abstract (12%), Introduction (10%), Methods (15%), Results (13%), Discussion (12%), Ethics & Transparency (10%), Writing Quality (10%), and Zero-I (10%).",
  },
];

const STATS = [
  { value: "11", label: "Analysis Phases" },
  { value: "7+", label: "Reporting Guidelines" },
  { value: "9", label: "Scoring Categories" },
];

const PREVIEW_TABS = [
  { id: "analysis", label: "Manuscript Analysis", icon: FileSearch },
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
] as const;

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
              {activeTab === "analysis" ? "sage — manuscript workspace" : "sage — dashboard"}
            </span>
          </div>
          <div className="relative">
            <img
              src={activeTab === "analysis" ? analysisScreenshot : dashboardScreenshot}
              alt={activeTab === "analysis" ? "SAGE manuscript analysis workspace showing split-view with manuscript text and AI-powered feedback panel" : "SAGE dashboard with gamification stats, manuscripts list, and leaderboard"}
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
          <div className="flex items-center" data-testid="text-nav-logo">
            <img src={sageLogoPath} alt="SAGE" className="w-14 h-14 object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-base font-medium text-foreground hover:text-primary transition-colors" data-testid="link-nav-features">Features</a>
            <a href="#benefits" className="text-base font-medium text-foreground hover:text-primary transition-colors" data-testid="link-nav-benefits">Benefits</a>
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
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <Badge variant="secondary" className="mb-6" data-testid="badge-hero">
            <Sparkles className="w-3 h-3 mr-1.5" />
            AI-Powered Manuscript Mentor
          </Badge>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6"
            data-testid="text-welcome-title"
          >
            Your Research Deserves{" "}
            <span className="text-primary">Expert-Level</span>{" "}
            Feedback
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            SAGE analyzes your manuscript across 11 phases using reporting guidelines like CONSORT, PRISMA, and STROBE — so you can publish with confidence.
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
              Get Started Free
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

      <section className="pb-20 px-4 sm:px-6 lg:px-8" data-testid="section-product-preview">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">See SAGE in action</p>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Designed for Scholarly Rigor
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Features built to strengthen every section of your manuscript against publication standards.
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

      <section id="benefits" className="sage-dark-section py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Why Researchers Choose SAGE
            </h2>
            <p className="opacity-70 text-base sm:text-lg max-w-2xl mx-auto">
              More than feedback — a guided learning experience for every stage of your manuscript.
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
                SAGE complements — never replaces — human guidance.
              </p>
              <p className="text-xs opacity-60 mt-1">
                Always consult your advisor, mentor, and colleagues. SAGE is a teaching tool, not a co-author.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">How SAGE Works</h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Three simple steps from upload to actionable feedback.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {[
              {
                step: "01",
                title: "Upload Your Manuscript",
                description: "Upload a PDF, DOCX, or TXT file — or paste your text directly. SAGE extracts and prepares your content automatically.",
                icon: FileText,
              },
              {
                step: "02",
                title: "Choose Your Focus Areas",
                description: "Select which sections and standards matter most. SAGE tailors the analysis to your needs and manuscript stage.",
                icon: Target,
              },
              {
                step: "03",
                title: "Get Expert Feedback",
                description: "Receive severity-ranked issues, a readiness score, and curated learning resources — all in a split-view workspace.",
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

      <section className="sage-dark-section py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Ready to Strengthen Your Manuscript?
          </h2>
          <p className="opacity-70 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Upload your paper and get actionable, evidence-based feedback in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button
              data-testid="button-cta-final"
              onClick={() => { window.location.href = "/api/login"; }}
              size="lg"
              className="px-8"
            >
              Get Started Free
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
                <img src={sageLogoPath} alt="SAGE" className="w-12 h-12 object-contain" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scholarly Assistant for Guided Excellence.
                <br />
                Developed by Corrie Monteverde, PhD
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-features">Features</a></li>
                <li><a href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-benefits">Benefits</a></li>
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
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} SAGE. All rights reserved.</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> Privacy-first. Your data, your control.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

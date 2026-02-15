import { ArrowLeft, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AIDisclosure() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">AI Disclosure</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-lg font-semibold mb-2">How AXIOM Uses AI</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AXIOM uses OpenAI's GPT-4o model to analyze your manuscript text and generate audit feedback. When you run an audit, your manuscript text is sent to OpenAI's API for processing. The AI evaluates your manuscript against reporting guidelines (CONSORT, PRISMA, STROBE, etc.) and returns structured feedback including severity-ranked findings, compliance scores, and actionable suggestions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">What AI Does in AXIOM</h2>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5">
              <li>Analyzes manuscript sections against publication standards</li>
              <li>Generates severity-ranked compliance findings</li>
              <li>Calculates readiness scores across 9 weighted categories</li>
              <li>Suggests journal matches based on manuscript characteristics</li>
              <li>Drafts cover letters based on audit results</li>
              <li>Generates suggested responses to reviewer comments</li>
              <li>Provides follow-up answers in the AI chat</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">What AI Does NOT Do</h2>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5">
              <li>Write or rewrite your manuscript</li>
              <li>Generate research data or fabricate results</li>
              <li>Replace peer review or editorial judgment</li>
              <li>Serve as a co-author on your publication</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Data Privacy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Per OpenAI's API data usage policy, content submitted through their API is not used to train or improve OpenAI's models. Your manuscript text is processed in real-time and is not retained by OpenAI after the API response is returned. See our <a href="/privacy" className="text-primary underline hover:opacity-80">Privacy Policy</a> for details on how we handle your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">ICMJE 2024 Guidelines</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The International Committee of Medical Journal Editors (ICMJE) recommends that authors disclose the use of AI-assisted tools in their manuscripts. While AXIOM is a validation tool (not a content generator), we recommend transparency. Below is suggested disclosure language you can adapt:
            </p>
            <Card className="p-4 bg-muted/30">
              <p className="text-sm italic leading-relaxed">
                "The manuscript was reviewed using AXIOM, an AI-powered pre-submission audit tool that evaluates compliance with reporting guidelines (e.g., CONSORT, PRISMA, STROBE). AXIOM uses OpenAI GPT-4o to generate feedback on manuscript structure, methodology reporting, and ethics compliance. The tool was used for validation purposes only; all manuscript content was written by the authors. No AI-generated text was included in the final manuscript."
              </p>
            </Card>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Questions</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have questions about how AXIOM uses AI, please contact us through our website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function AcceptableUse() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Acceptable Use Policy</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-lg font-semibold mb-2">Purpose</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This Acceptable Use Policy ("AUP") outlines the rules and guidelines for using AXIOM. By using our service, you agree to comply with this policy. Violations may result in suspension or termination of your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Permitted Use</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              AXIOM is designed for legitimate academic and research purposes. You may use AXIOM to:
            </p>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5">
              <li>Upload and audit manuscripts you have authored or co-authored</li>
              <li>Upload manuscripts for which you have explicit permission to submit for analysis</li>
              <li>Generate cover letters, reviewer responses, and journal suggestions based on your own work</li>
              <li>Use audit feedback to improve your manuscript before submission</li>
              <li>Share audit reports with co-authors, advisors, or collaborators</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Prohibited Use</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              You may NOT use AXIOM to:
            </p>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5">
              <li><strong>Upload content you don't own</strong> — Do not upload manuscripts, articles, or papers authored by others without their explicit authorization</li>
              <li><strong>Facilitate plagiarism</strong> — Do not use AXIOM to disguise plagiarized work or to make stolen content appear original</li>
              <li><strong>Fabricate research</strong> — Do not upload fabricated data, falsified results, or fraudulent manuscripts</li>
              <li><strong>Circumvent peer review</strong> — AXIOM is a pre-submission tool, not a replacement for peer review. Do not represent AXIOM audit results as peer review</li>
              <li><strong>Abuse the AI system</strong> — Do not attempt to extract training data, reverse-engineer the AI models, or use prompt injection to alter system behavior</li>
              <li><strong>Misrepresent AI involvement</strong> — Do not claim AI-generated suggestions from AXIOM as your own original analysis when disclosure is required by journal policies</li>
              <li><strong>Overwhelm the service</strong> — Do not use automated scripts, bots, or other tools to submit excessive requests or attempt to degrade service performance</li>
              <li><strong>Upload illegal content</strong> — Do not upload content that violates applicable laws, including content that contains malware, illegal material, or violates export controls</li>
              <li><strong>Share accounts</strong> — Do not share your account credentials with others or allow unauthorized access to your account</li>
              <li><strong>Harass or abuse</strong> — Do not use any part of the service (including shared reports) to harass, threaten, or abuse others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Research Ethics</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Users are expected to uphold the highest standards of research ethics. AXIOM helps identify compliance gaps, but the responsibility for ethical conduct rests with the researcher. Always follow your institution's research ethics guidelines, IRB requirements, and applicable journal policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Rate Limits &amp; Fair Use</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AXIOM enforces rate limits to ensure fair access for all users. Exceeding rate limits may result in temporary throttling. Persistent abuse may lead to account suspension. Free-tier users are subject to monthly audit limits as described in our pricing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Enforcement</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Violations of this policy may result in one or more of the following actions, at our sole discretion:
            </p>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5 mt-2">
              <li>Warning notification</li>
              <li>Temporary suspension of your account</li>
              <li>Permanent termination of your account</li>
              <li>Removal of content that violates this policy</li>
              <li>Reporting to relevant authorities or institutions where required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Reporting Violations</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you become aware of any violation of this Acceptable Use Policy, please contact us through the information provided on our website. We take all reports seriously and will investigate promptly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

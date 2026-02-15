import { ArrowLeft, Accessibility } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function AccessibilityStatement() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Accessibility className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Accessibility Statement</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-lg font-semibold mb-2">Our Commitment</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AXIOM is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to ensure we provide equal access to all users.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Conformance Status</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. These guidelines explain how to make web content more accessible for people with disabilities and more user-friendly for everyone.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Measures We Take</h2>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5">
              <li>Semantic HTML elements for proper document structure and screen reader compatibility</li>
              <li>ARIA labels and roles on interactive elements, navigation, and landmarks</li>
              <li>Skip-to-content links on all pages for keyboard navigation</li>
              <li>Sufficient color contrast ratios between text and backgrounds</li>
              <li>Visible focus indicators for keyboard-only navigation</li>
              <li>Support for <code className="text-xs bg-muted px-1 py-0.5 rounded">prefers-reduced-motion</code> to pause animations for users who are sensitive to motion</li>
              <li>Responsive design that supports text resizing up to 200% without loss of content</li>
              <li>Alt text on all meaningful images</li>
              <li>Form inputs with associated labels</li>
              <li>Light and dark mode themes for visual comfort</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Known Limitations</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              While we strive for full accessibility, some areas may have limitations:
            </p>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5">
              <li>PDF export reports may not be fully screen-reader accessible</li>
              <li>Some third-party components may have partial ARIA support</li>
              <li>Complex data visualizations (charts, progress indicators) include text alternatives but may not convey all details to screen readers</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed mt-3">
              We are actively working to address these limitations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Assistive Technologies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AXIOM is designed to be compatible with common assistive technologies including screen readers (NVDA, JAWS, VoiceOver), screen magnification software, speech recognition software, and keyboard-only navigation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Standards</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This website aims to conform to:
            </p>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5">
              <li>Web Content Accessibility Guidelines (WCAG) 2.1, Level AA</li>
              <li>Americans with Disabilities Act (ADA) Title III</li>
              <li>Section 508 of the Rehabilitation Act</li>
              <li>EN 301 549 (European accessibility standard)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Feedback</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We welcome your feedback on the accessibility of AXIOM. If you encounter accessibility barriers or have suggestions for improvement, please contact us. We take accessibility feedback seriously and will make reasonable efforts to address reported issues.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Enforcement</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you are not satisfied with our response to your accessibility concern, you may file a complaint with the U.S. Department of Justice, Civil Rights Division, or with the relevant enforcement body in your jurisdiction.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

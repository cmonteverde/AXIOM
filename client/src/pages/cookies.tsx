import { ArrowLeft, Cookie } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CookiePolicy() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Cookie className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Cookie Policy</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-lg font-semibold mb-2">What Are Cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cookies are small text files stored on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">How AXIOM Uses Cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              AXIOM uses a minimal set of cookies, limited to what is strictly necessary to operate the service. We do not use advertising, tracking, or analytics cookies.
            </p>

            <Card className="p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-semibold">Cookie</th>
                    <th className="text-left p-3 font-semibold">Purpose</th>
                    <th className="text-left p-3 font-semibold">Type</th>
                    <th className="text-left p-3 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="p-3"><code className="text-xs bg-muted px-1 py-0.5 rounded">connect.sid</code></td>
                    <td className="p-3">Session authentication — keeps you signed in</td>
                    <td className="p-3">Strictly necessary</td>
                    <td className="p-3">Session / 24 hours</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3"><code className="text-xs bg-muted px-1 py-0.5 rounded">theme</code></td>
                    <td className="p-3">Remembers your light/dark mode preference</td>
                    <td className="p-3">Functional</td>
                    <td className="p-3">1 year</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Cookies We Do NOT Use</h2>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5">
              <li><strong>Analytics cookies</strong> — We do not use Google Analytics, Mixpanel, Hotjar, or similar tracking tools</li>
              <li><strong>Advertising cookies</strong> — We do not serve ads or use retargeting pixels</li>
              <li><strong>Third-party tracking cookies</strong> — We do not embed social media trackers, fingerprinting scripts, or cross-site tracking</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Managing Cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can control and delete cookies through your browser settings. Disabling cookies may prevent you from signing in or using certain features of AXIOM. Most browsers allow you to:
            </p>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5 mt-2">
              <li>View cookies stored on your device</li>
              <li>Delete individual or all cookies</li>
              <li>Block cookies from specific or all websites</li>
              <li>Set preferences for first-party vs. third-party cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">EU/EEA Users (GDPR)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Under the General Data Protection Regulation (GDPR) and ePrivacy Directive, strictly necessary cookies do not require consent. AXIOM's session cookie falls into this category. We do not set any cookies that require opt-in consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Changes to This Policy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If we introduce new cookies in the future, we will update this page and, where required by law, obtain your consent before setting non-essential cookies.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

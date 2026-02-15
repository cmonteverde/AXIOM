import { ArrowLeft, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Information We Collect</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When you sign in, we collect your name, email address, and profile image from your authentication provider. When you upload manuscripts, we store the document text, audit results, and metadata associated with your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. How We Use Your Information</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your manuscript text is sent to OpenAI GPT-4o for analysis. We use this solely to generate audit feedback, readiness scores, and compliance reports. We do not sell, share, or use your data for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. AI Processing</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AXIOM uses OpenAI's API with data privacy protections. Per OpenAI's API data usage policy, content submitted through their API is not used to train or improve their models. Your manuscript content is processed in real-time and is not retained by OpenAI after processing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Data Storage</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your account data, manuscripts, and audit results are stored in a secure PostgreSQL database. Data is encrypted in transit using TLS. We retain your data only as long as your account is active.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Data Deletion</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can delete individual manuscripts from your dashboard at any time. You can also delete your entire account and all associated data using the "Delete All Data" button on your dashboard. Deletion is permanent and cannot be reversed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Cookies & Sessions</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use session cookies to maintain your authentication state. We do not use tracking cookies, analytics pixels, or third-party advertising scripts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Third-Party Services</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AXIOM integrates with OpenAI (for manuscript analysis) and your authentication provider (for sign-in). No other third-party services receive your manuscript data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Changes to This Policy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">9. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy or your data, please reach out via the contact information provided on our website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

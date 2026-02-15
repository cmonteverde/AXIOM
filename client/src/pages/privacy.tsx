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
              We use session cookies to maintain your authentication state. We do not use tracking cookies, analytics pixels, or third-party advertising scripts. For details, see our <a href="/cookies" className="text-primary underline hover:opacity-80">Cookie Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Third-Party Services</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AXIOM integrates with OpenAI (for manuscript analysis) and your authentication provider (for sign-in). No other third-party services receive your manuscript data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Your Rights Under GDPR (EU/EEA Users)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              If you are located in the European Union or European Economic Area, you have the following rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5">
              <li><strong>Right of access</strong> — You can request a copy of the personal data we hold about you</li>
              <li><strong>Right to rectification</strong> — You can request correction of inaccurate personal data</li>
              <li><strong>Right to erasure</strong> — You can request deletion of your personal data (also available via the "Delete All Data" button on your dashboard)</li>
              <li><strong>Right to restrict processing</strong> — You can request that we limit how we use your data</li>
              <li><strong>Right to data portability</strong> — You can request your data in a structured, machine-readable format</li>
              <li><strong>Right to object</strong> — You can object to processing of your personal data</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed mt-3">
              <strong>Lawful basis for processing:</strong> We process your data based on (a) your consent when you create an account, (b) contractual necessity to provide the audit service, and (c) legitimate interest in improving our service. You may withdraw consent at any time by deleting your account.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              <strong>International transfers:</strong> Your data may be processed in the United States, where our servers and OpenAI's API are located. We rely on standard contractual clauses and data processing agreements to ensure adequate protection.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">9. Your Rights Under CCPA/CPRA (California Residents)</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):
            </p>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-2 list-disc pl-5">
              <li><strong>Right to know</strong> — You can request information about the categories and specific pieces of personal information we collect, use, and disclose</li>
              <li><strong>Right to delete</strong> — You can request deletion of your personal information</li>
              <li><strong>Right to opt-out of sale</strong> — We do not sell your personal information to third parties</li>
              <li><strong>Right to non-discrimination</strong> — We will not discriminate against you for exercising your privacy rights</li>
              <li><strong>Right to correct</strong> — You can request correction of inaccurate personal information</li>
              <li><strong>Right to limit use of sensitive data</strong> — You can limit use of sensitive personal information to what is necessary to provide the service</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed mt-3">
              <strong>Categories of data collected:</strong> Identifiers (name, email), internet activity (manuscripts uploaded, audit results), and professional information (research field, institution). We do not collect financial information, biometric data, or geolocation.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              To exercise any of these rights, use the "Delete All Data" button on your dashboard or contact us using the information below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">10. Children's Privacy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AXIOM is not intended for use by children under the age of 13 (or 16 in the EU/EEA). We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">11. Data Retention</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We retain your personal data and manuscripts for as long as your account is active. If you delete your account, all associated data is permanently removed from our systems within 30 days. Anonymized, aggregated data (such as total audit counts) may be retained for service improvement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">12. Changes to This Policy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. Material changes will be communicated via a notice on our website. Changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">13. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy, wish to exercise your data rights, or have a privacy concern, please reach out via the contact information provided on our website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

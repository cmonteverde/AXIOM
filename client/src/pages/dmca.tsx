import { ArrowLeft, Copyright } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function DMCA() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Copyright className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">DMCA &amp; Copyright Policy</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-lg font-semibold mb-2">Respect for Intellectual Property</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AXIOM respects the intellectual property rights of others and expects its users to do the same. We comply with the Digital Millennium Copyright Act (DMCA) and will respond promptly to notices of alleged copyright infringement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">User-Uploaded Content</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AXIOM allows users to upload manuscripts for the purpose of pre-submission audit and analysis. Users represent and warrant that they have the right to upload any content they submit, including manuscripts, drafts, and supporting materials. AXIOM does not claim ownership of any user-uploaded content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Filing a DMCA Takedown Notice</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              If you believe that content hosted on AXIOM infringes your copyright, you may submit a DMCA takedown notice. Your notice must include:
            </p>
            <ol className="text-sm text-muted-foreground leading-relaxed space-y-2 list-decimal pl-5">
              <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf</li>
              <li>Identification of the copyrighted work claimed to have been infringed</li>
              <li>Identification of the material that is claimed to be infringing and information reasonably sufficient to locate the material on our service</li>
              <li>Your contact information, including address, telephone number, and email address</li>
              <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law</li>
              <li>A statement, made under penalty of perjury, that the information in the notification is accurate and that you are authorized to act on behalf of the copyright owner</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Counter-Notification</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              If you believe your content was removed in error, you may file a counter-notification that includes:
            </p>
            <ol className="text-sm text-muted-foreground leading-relaxed space-y-2 list-decimal pl-5">
              <li>Your physical or electronic signature</li>
              <li>Identification of the material that was removed and the location at which the material appeared before it was removed</li>
              <li>A statement under penalty of perjury that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification</li>
              <li>Your name, address, and telephone number, and a statement that you consent to the jurisdiction of the federal district court for the judicial district in which your address is located</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Repeat Infringers</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AXIOM will, in appropriate circumstances, terminate the accounts of users who are repeat infringers of intellectual property rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">How to Contact Us</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              DMCA notices and counter-notifications should be sent to our designated copyright agent. Contact information is available on our website. Please include "DMCA Notice" in the subject line.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

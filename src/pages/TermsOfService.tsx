import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-3xl py-12 px-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: March 30, 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing or using AutoClient AI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
            <p>AutoClient AI is an AI-powered lead discovery and client acquisition platform designed for freelancers and agencies. The Service includes lead search, AI-generated outreach messages, pipeline CRM, client intelligence reports, and analytics.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Account Registration</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must provide accurate and complete information during registration</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must be at least 18 years old to use the Service</li>
              <li>One person may not maintain more than one free account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Credits & Subscriptions</h2>
            <p><strong className="text-foreground">Credits:</strong> The Service operates on a credit-based system. Credits are consumed when using features such as lead searches, AI email generation, intelligence reports, and contact unlocks.</p>
            <p><strong className="text-foreground">Subscriptions:</strong> Paid plans provide monthly credit allocations and additional features. Credits reset at the start of each billing cycle and do not roll over.</p>
            <p><strong className="text-foreground">Refunds:</strong> All purchases are final. We do not offer refunds on credits or subscriptions. If you believe there was a billing error, contact support within 7 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Service for spam, harassment, or any unlawful purpose</li>
              <li>Scrape, copy, or redistribute lead data obtained through the Service</li>
              <li>Attempt to reverse-engineer, hack, or disrupt the Service</li>
              <li>Share your account credentials with third parties</li>
              <li>Use automated tools to access the Service beyond normal usage</li>
              <li>Violate any applicable laws, including anti-spam regulations (CAN-SPAM, GDPR, etc.)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. AI-Generated Content</h2>
            <p>The Service uses artificial intelligence to generate outreach messages, lead analysis, and recommendations. You acknowledge that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>AI-generated content may not always be accurate or appropriate</li>
              <li>You are responsible for reviewing and editing all outreach messages before sending</li>
              <li>We are not liable for any consequences of using AI-generated content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Lead Data Accuracy</h2>
            <p>We strive to provide accurate lead information, but we do not guarantee the accuracy, completeness, or availability of any lead data including business names, emails, phone numbers, or ratings. You are responsible for verifying contact information before reaching out.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Intellectual Property</h2>
            <p>The Service, including its design, code, AI models, and branding, is owned by AutoClient AI. You retain ownership of content you create using the Service (e.g., customized outreach messages, notes).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, AutoClient AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to loss of revenue, clients, or data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">10. Service Availability</h2>
            <p>We aim for high availability but do not guarantee uninterrupted access. We may modify, suspend, or discontinue features with reasonable notice. Scheduled maintenance will be communicated in advance when possible.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">11. Termination</h2>
            <p>We reserve the right to suspend or terminate your account for violation of these Terms. You may delete your account at any time via Settings. Upon termination, your data will be deleted within 30 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">12. Governing Law</h2>
            <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">13. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">14. Contact Us</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:support@autoclientai.com" className="text-primary hover:underline">support@autoclientai.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

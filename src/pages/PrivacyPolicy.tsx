import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-3xl py-12 px-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: March 30, 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Introduction</h2>
            <p>AutoClient AI ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at autoclientai.com (the "Service").</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Information We Collect</h2>
            <p><strong className="text-foreground">Account Information:</strong> When you register, we collect your name, email address, and password. If you sign in via Google, we receive your name, email, and profile picture from Google.</p>
            <p><strong className="text-foreground">Profile Data:</strong> Industry, country, service type, and other onboarding details you provide.</p>
            <p><strong className="text-foreground">Usage Data:</strong> Search queries, lead interactions, pipeline activity, and feature usage patterns to improve our service.</p>
            <p><strong className="text-foreground">Payment Data:</strong> Payment transactions are processed by Razorpay. We store transaction IDs and plan details but never store your card numbers or bank details.</p>
            <p><strong className="text-foreground">Device & Log Data:</strong> IP address, browser type, device information, and access timestamps.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide, maintain, and improve the Service</li>
              <li>To process transactions and manage your subscription</li>
              <li>To personalize lead discovery and AI-generated outreach messages</li>
              <li>To send service-related notifications and updates</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Data Sharing & Disclosure</h2>
            <p>We do not sell your personal data. We may share information with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-foreground">Service Providers:</strong> Razorpay (payments), Google (authentication), and cloud infrastructure providers</li>
              <li><strong className="text-foreground">AI Providers:</strong> We use AI models to analyze leads and generate content. Queries are processed without linking to your identity.</li>
              <li><strong className="text-foreground">Legal Requirements:</strong> When required by law, court order, or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Data Security</h2>
            <p>We use industry-standard encryption (TLS/SSL), row-level security policies, and secure authentication to protect your data. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Data Retention</h2>
            <p>We retain your data for as long as your account is active or as needed to provide the Service. You may request deletion of your account and associated data by contacting us.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access, update, or delete your personal data via Settings</li>
              <li>Export your data upon request</li>
              <li>Opt out of promotional communications</li>
              <li>Withdraw consent for data processing where applicable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use tracking cookies for advertising.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Children's Privacy</h2>
            <p>The Service is not intended for users under 18 years of age. We do not knowingly collect data from minors.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes via email or in-app notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">11. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, contact us at <a href="mailto:support@autoclientai.com" className="text-primary hover:underline">support@autoclientai.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

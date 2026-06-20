import { Link } from "wouter";
import { Zap } from "lucide-react";

const LAST_UPDATED = "January 15, 2025";

export default function Terms() {
  return (
    <div className="flex-1 overflow-y-auto">
      <nav className="border-b border-border/30 px-6 py-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Sync</span>
          </div>
        </Link>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/privacy"><span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span></Link>
          <Link href="/about"><span className="hover:text-foreground cursor-pointer transition-colors">About</span></Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-3">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Demure Platform Inc. · Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-10 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">By accessing or using Sync ("the Service"), a product of Demure Platform Inc. ("Company", "we", "us"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground">Sync is an AI-powered website builder that generates HTML, CSS, and JavaScript websites based on natural language descriptions. The Service uses large language models (LLMs) via the Groq API to generate website code. Outputs are previewed in a sandboxed environment within the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Accounts and Registration</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>3.1. You must be at least 13 years old to use the Service.</p>
              <p>3.2. You are responsible for maintaining the confidentiality of your account credentials and API keys.</p>
              <p>3.3. You agree to notify us immediately at security@sync.demure.ai of any unauthorized use of your account.</p>
              <p>3.4. We reserve the right to terminate accounts that violate these Terms.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Acceptable Use</h2>
            <p className="text-muted-foreground mb-3">You agree not to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Generate content that is illegal, harmful, threatening, abusive, or defamatory</li>
              <li>Create websites for phishing, fraud, or malware distribution</li>
              <li>Infringe on the intellectual property rights of others</li>
              <li>Circumvent rate limits or access controls through automated means</li>
              <li>Resell or sublicense the Service without written permission</li>
              <li>Reverse engineer or attempt to extract the underlying AI models</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Intellectual Property</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>5.1. <strong className="text-foreground">Your content:</strong> You retain ownership of the prompts you provide and the websites generated for you. By using the Service, you grant Demure Platform Inc. a non-exclusive license to store, display, and process your content to provide the Service.</p>
              <p>5.2. <strong className="text-foreground">Our platform:</strong> The Sync platform, branding, and underlying infrastructure are the intellectual property of Demure Platform Inc. You may not copy, modify, or redistribute the platform.</p>
              <p>5.3. <strong className="text-foreground">AI outputs:</strong> Generated website code is provided as-is. We make no warranty that outputs do not infringe third-party rights.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Subscription and Billing</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>6.1. Free tier access is provided without charge subject to usage limits.</p>
              <p>6.2. Paid plans are billed in advance on a monthly, yearly, or one-time (lifetime) basis as selected.</p>
              <p>6.3. All fees are non-refundable except where required by law or at our discretion for billing errors.</p>
              <p>6.4. We reserve the right to change pricing with 30 days' notice. Existing subscribers are grandfathered for their current billing period.</p>
              <p>6.5. Credits purchased do not expire and are non-transferable.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">TO THE MAXIMUM EXTENT PERMITTED BY LAW, DEMURE PLATFORM INC. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT AI-GENERATED OUTPUTS WILL BE ACCURATE, COMPLETE, OR FIT FOR ANY PARTICULAR PURPOSE.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Termination</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>9.1. You may terminate your account at any time via Settings → Security → Clear all data.</p>
              <p>9.2. We may suspend or terminate accounts that violate these Terms, with or without prior notice.</p>
              <p>9.3. Upon termination, your right to use the Service ceases immediately.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Governing Law</h2>
            <p className="text-muted-foreground">These Terms are governed by the laws of the jurisdiction in which Demure Platform Inc. is incorporated. Disputes shall be resolved through binding arbitration, except where prohibited by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Changes to Terms</h2>
            <p className="text-muted-foreground">We may update these Terms periodically. Material changes will be communicated via email or in-app notification. Continued use of the Service after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Contact</h2>
            <p className="text-muted-foreground">For questions about these Terms, contact us at <a href="mailto:legal@sync.demure.ai" className="text-primary hover:underline">legal@sync.demure.ai</a>.</p>
          </section>

        </div>
      </div>

      <footer className="border-t border-border/30 px-6 py-8">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">© 2025 Demure Platform Inc. All rights reserved.</span>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/privacy"><span className="hover:text-foreground cursor-pointer">Privacy Policy</span></Link>
            <Link href="/about"><span className="hover:text-foreground cursor-pointer">About</span></Link>
            <Link href="/pricing"><span className="hover:text-foreground cursor-pointer">Pricing</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

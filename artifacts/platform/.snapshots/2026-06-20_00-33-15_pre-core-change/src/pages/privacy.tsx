import { Link } from "wouter";
import { Zap } from "lucide-react";

const LAST_UPDATED = "January 15, 2025";

export default function Privacy() {
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
          <Link href="/terms"><span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span></Link>
          <Link href="/about"><span className="hover:text-foreground cursor-pointer transition-colors">About</span></Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-3">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Demure Platform Inc. · Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-10">
          <p className="text-sm text-foreground font-medium mb-1">The short version:</p>
          <p className="text-sm text-muted-foreground">We collect only what we need to run the service. We don't sell your data. We don't train AI models on your content. Your websites are yours.</p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">1.1 Account Information</h3>
                <p>When you create an account: name, email address, and (if provided) avatar URL. This is stored securely and used to identify you within the platform.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">1.2 Usage Data</h3>
                <p>We collect anonymized usage statistics including page views, feature usage, and error reports to improve the platform. This data cannot be used to identify you individually.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">1.3 Conversation & Build Data</h3>
                <p>The prompts you submit and the websites generated are stored to provide the Service (conversation history, project persistence). This data is associated with your account and is not shared with third parties.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">1.4 Payment Information</h3>
                <p>Payment processing is handled by Stripe. We do not store credit card numbers. We receive only anonymized transaction confirmations.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">1.5 Technical Data</h3>
                <p>IP address (for rate limiting and fraud prevention), browser type, and device type. This data is retained for 30 days and then deleted.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>To provide, maintain, and improve the Sync platform</li>
              <li>To process payments and manage subscriptions</li>
              <li>To communicate important service updates and security notices</li>
              <li>To enforce our Terms of Service and prevent abuse</li>
              <li>To send weekly digests if you opt in to email notifications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. AI and Your Content</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">We do not train AI models on your content.</strong> Your prompts and generated websites are not used to train, fine-tune, or evaluate any AI models — including the models used by Sync.</p>
              <p>Prompts are transmitted to our AI provider (Groq) to generate responses. Groq's data handling is governed by their own privacy policy. We recommend reviewing it at groq.com/privacy.</p>
              <p>You own the output. Websites generated by Sync belong to you, subject to the licenses in our Terms of Service.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Data Sharing</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">We do not sell your personal data.</strong> We share data only in the following circumstances:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-foreground">Service providers:</strong> Groq (AI inference), Stripe (payments), and infrastructure providers bound by confidentiality agreements.</li>
                <li><strong className="text-foreground">Legal requirements:</strong> When required by law, subpoena, or court order.</li>
                <li><strong className="text-foreground">Business transfers:</strong> In connection with a merger or acquisition, with appropriate privacy protections.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Data Retention</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { type: "Conversation history", retention: "Until account deletion" },
                { type: "Generated websites", retention: "Until account deletion" },
                { type: "Technical/IP logs", retention: "30 days" },
                { type: "Payment records", retention: "7 years (legal requirement)" },
                { type: "Settings/preferences", retention: "Until account deletion" },
                { type: "Support tickets", retention: "2 years after resolution" },
              ].map((r) => (
                <div key={r.type} className="bg-card border border-border/30 rounded-xl p-3">
                  <div className="text-xs font-medium text-foreground">{r.type}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{r.retention}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Your Rights</h2>
            <p className="text-muted-foreground mb-3">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li><strong className="text-foreground">Access:</strong> Request a copy of all data we hold about you</li>
              <li><strong className="text-foreground">Correction:</strong> Update inaccurate personal information</li>
              <li><strong className="text-foreground">Deletion:</strong> Request erasure of your account and associated data</li>
              <li><strong className="text-foreground">Portability:</strong> Export your data in machine-readable format</li>
              <li><strong className="text-foreground">Objection:</strong> Opt out of certain processing activities</li>
            </ul>
            <p className="text-muted-foreground mt-3">Exercise these rights via Settings → Security, or email <a href="mailto:privacy@sync.demure.ai" className="text-primary hover:underline">privacy@sync.demure.ai</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Cookies</h2>
            <p className="text-muted-foreground">Sync uses essential session cookies for authentication. We do not use tracking cookies, advertising cookies, or third-party analytics that identify individual users. Settings and preferences are stored in localStorage on your device.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Security</h2>
            <p className="text-muted-foreground">All data is transmitted over TLS. Passwords are hashed using bcrypt. We conduct regular security reviews and follow responsible disclosure practices. Report security issues to <a href="mailto:security@sync.demure.ai" className="text-primary hover:underline">security@sync.demure.ai</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Children's Privacy</h2>
            <p className="text-muted-foreground">The Service is not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us information, contact us at privacy@sync.demure.ai.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Changes to This Policy</h2>
            <p className="text-muted-foreground">We will notify you of material changes via email (if provided) or in-app notification at least 7 days before they take effect. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Contact</h2>
            <div className="text-muted-foreground space-y-1">
              <p>Demure Platform Inc.</p>
              <p>Privacy Officer: <a href="mailto:privacy@sync.demure.ai" className="text-primary hover:underline">privacy@sync.demure.ai</a></p>
            </div>
          </section>

        </div>
      </div>

      <footer className="border-t border-border/30 px-6 py-8">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">© 2025 Demure Platform Inc. All rights reserved.</span>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/terms"><span className="hover:text-foreground cursor-pointer">Terms</span></Link>
            <Link href="/about"><span className="hover:text-foreground cursor-pointer">About</span></Link>
            <Link href="/pricing"><span className="hover:text-foreground cursor-pointer">Pricing</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

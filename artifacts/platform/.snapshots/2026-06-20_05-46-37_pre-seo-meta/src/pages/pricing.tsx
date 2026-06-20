import { useState } from "react";
import { Link } from "wouter";
import { Check, Zap, Shield, Crown, CreditCard, ChevronDown, ChevronUp } from "lucide-react";

const PLANS = {
  monthly: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "Perfect for trying out Sync.",
      color: "border-border/40",
      badge: null,
      cta: "Get started free",
      ctaStyle: "bg-secondary text-foreground hover:bg-secondary/80",
      features: [
        "10 AI website builds / month",
        "Preview on sync.demure.ai",
        "Groq Llama 3.3 70B",
        "1 active project",
        "Community support",
        "Basic templates",
      ],
      limits: { builds: "10/mo", concurrent: "1", storage: "50 MB" },
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      desc: "For builders who ship fast.",
      color: "border-primary/50 shadow-[0_0_30px_rgba(99,102,241,0.15)]",
      badge: "Most Popular",
      cta: "Start Pro free trial",
      ctaStyle: "bg-primary text-primary-foreground hover:bg-primary/90",
      features: [
        "Unlimited builds",
        "Custom domain connection",
        "All AI models (Llama, Mixtral, Gemma)",
        "10 active projects",
        "Priority queue (2× faster)",
        "30-day build history",
        "GSAP + Three.js + Lenis included",
        "Email support (24h response)",
      ],
      limits: { builds: "Unlimited", concurrent: "3", storage: "10 GB" },
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      desc: "For teams and agencies.",
      color: "border-border/40",
      badge: null,
      cta: "Contact sales",
      ctaStyle: "bg-secondary text-foreground hover:bg-secondary/80",
      features: [
        "Everything in Pro",
        "White-label platform",
        "REST API access",
        "5 team seats",
        "Unlimited projects",
        "Custom AI model fine-tuning",
        "99.9% SLA uptime guarantee",
        "Dedicated Slack + priority support",
      ],
      limits: { builds: "Unlimited", concurrent: "10", storage: "100 GB" },
    },
  ],
  yearly: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "Perfect for trying out Sync.",
      color: "border-border/40",
      badge: null,
      cta: "Get started free",
      ctaStyle: "bg-secondary text-foreground hover:bg-secondary/80",
      features: [
        "10 AI website builds / month",
        "Preview on sync.demure.ai",
        "Groq Llama 3.3 70B",
        "1 active project",
        "Community support",
        "Basic templates",
      ],
      limits: { builds: "10/mo", concurrent: "1", storage: "50 MB" },
    },
    {
      name: "Pro",
      price: "$15",
      period: "/month",
      badge: "Most Popular",
      desc: "Billed $180/year — save $48.",
      color: "border-primary/50 shadow-[0_0_30px_rgba(99,102,241,0.15)]",
      cta: "Start Pro free trial",
      ctaStyle: "bg-primary text-primary-foreground hover:bg-primary/90",
      features: [
        "Unlimited builds",
        "Custom domain connection",
        "All AI models (Llama, Mixtral, Gemma)",
        "10 active projects",
        "Priority queue (2× faster)",
        "30-day build history",
        "GSAP + Three.js + Lenis included",
        "Email support (24h response)",
      ],
      limits: { builds: "Unlimited", concurrent: "3", storage: "10 GB" },
    },
    {
      name: "Enterprise",
      price: "$79",
      period: "/month",
      badge: null,
      desc: "Billed $948/year — save $240.",
      color: "border-border/40",
      cta: "Contact sales",
      ctaStyle: "bg-secondary text-foreground hover:bg-secondary/80",
      features: [
        "Everything in Pro",
        "White-label platform",
        "REST API access",
        "5 team seats",
        "Unlimited projects",
        "Custom AI model fine-tuning",
        "99.9% SLA uptime guarantee",
        "Dedicated Slack + priority support",
      ],
      limits: { builds: "Unlimited", concurrent: "10", storage: "100 GB" },
    },
  ],
  lifetime: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "Perfect for trying out Sync.",
      color: "border-border/40",
      badge: null,
      cta: "Get started free",
      ctaStyle: "bg-secondary text-foreground hover:bg-secondary/80",
      features: [
        "10 AI website builds / month",
        "Preview on sync.demure.ai",
        "Groq Llama 3.3 70B",
        "1 active project",
        "Community support",
        "Basic templates",
      ],
      limits: { builds: "10/mo", concurrent: "1", storage: "50 MB" },
    },
    {
      name: "Pro",
      price: "$299",
      period: "one-time",
      badge: "Best Value",
      desc: "Pay once, build forever.",
      color: "border-primary/50 shadow-[0_0_30px_rgba(99,102,241,0.15)]",
      cta: "Buy lifetime access",
      ctaStyle: "bg-primary text-primary-foreground hover:bg-primary/90",
      features: [
        "Unlimited builds — forever",
        "Custom domain connection",
        "All AI models (Llama, Mixtral, Gemma)",
        "10 active projects",
        "Priority queue (2× faster)",
        "Lifetime build history",
        "GSAP + Three.js + Lenis included",
        "All future Pro features",
      ],
      limits: { builds: "Unlimited", concurrent: "3", storage: "10 GB" },
    },
    {
      name: "Enterprise",
      price: "$999",
      period: "one-time",
      badge: null,
      desc: "Full platform, no recurring fees.",
      color: "border-border/40",
      cta: "Contact sales",
      ctaStyle: "bg-secondary text-foreground hover:bg-secondary/80",
      features: [
        "Everything in Pro (lifetime)",
        "White-label platform",
        "REST API access",
        "5 team seats",
        "Unlimited projects",
        "Custom AI model fine-tuning",
        "99.9% SLA uptime guarantee",
        "Priority support for 2 years",
      ],
      limits: { builds: "Unlimited", concurrent: "10", storage: "100 GB" },
    },
  ],
};

const CREDIT_PACKS = [
  { credits: 50, price: "$9", per: "$0.18/build", label: "Starter" },
  { credits: 200, price: "$29", per: "$0.14/build", label: "Builder", popular: true },
  { credits: 500, price: "$59", per: "$0.12/build", label: "Pro" },
  { credits: 1000, price: "$99", per: "$0.10/build", label: "Agency", badge: "Best Rate" },
];

const FAQ = [
  { q: "What counts as one 'build'?", a: "Each AI response that generates or modifies a website consumes one build credit. Follow-up edits (like 'change the button color') also count as one build." },
  { q: "Can I use my own AI API key?", a: "Yes — Pro and Enterprise plans can supply a Groq, OpenAI, or Anthropic API key in Settings → AI Preferences. Builds using your own key don't count toward your monthly limit." },
  { q: "What happens when I hit the Free tier limit?", a: "You'll see a friendly prompt to upgrade or top up with credits. Your existing projects remain untouched." },
  { q: "Do credits expire?", a: "No. Purchased credits never expire and roll over indefinitely." },
  { q: "Can I cancel anytime?", a: "Yes. Monthly and yearly plans can be cancelled at any time. You keep access until the end of your billing period." },
  { q: "Is there a free trial for Pro?", a: "Yes — all new accounts get a 14-day Pro trial with no credit card required." },
];

type BillingCycle = "monthly" | "yearly" | "lifetime";

export default function Pricing() {
  const [billing, setBilling] = useState<BillingCycle>("yearly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = PLANS[billing];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Nav */}
      <nav className="border-b border-border/30 px-6 py-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Sync</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/docs"><span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Docs</span></Link>
          <Link href="/about"><span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">About</span></Link>
          <Link href="/"><button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Get started free</button></Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">Pricing</span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-4 mb-4">Build anything. Pay fairly.</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">Start free, upgrade when you're ready. All plans include Lenis, GSAP, and Three.js animations out of the box.</p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-1 mb-12 bg-secondary/40 border border-border/40 rounded-xl p-1 w-fit mx-auto">
          {(["monthly", "yearly", "lifetime"] as BillingCycle[]).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBilling(cycle)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize relative ${billing === cycle ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {cycle}
              {cycle === "yearly" && (
                <span className="absolute -top-2 -right-1 text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">-20%</span>
              )}
              {cycle === "lifetime" && (
                <span className="absolute -top-2 -right-1 text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">🔥</span>
              )}
            </button>
          ))}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative rounded-2xl border ${plan.color} bg-card p-8 flex flex-col`}>
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">{plan.badge}</span>
                </div>
              )}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {plan.name === "Free" && <Shield className="w-4 h-4 text-muted-foreground" />}
                  {plan.name === "Pro" && <Zap className="w-4 h-4 text-primary" />}
                  {plan.name === "Enterprise" && <Crown className="w-4 h-4 text-amber-400" />}
                  <span className="font-semibold text-foreground">{plan.name}</span>
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground mb-1.5">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.desc}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="border-t border-border/30 pt-5 mb-6">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Builds", val: plan.limits.builds },
                    { label: "Concurrent", val: plan.limits.concurrent },
                    { label: "Storage", val: plan.limits.storage },
                  ].map((l) => (
                    <div key={l.label}>
                      <div className="text-sm font-semibold text-foreground">{l.val}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{l.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Link href="/">
                <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${plan.ctaStyle}`}>
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* Credits top-up */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Pay as you go — Credits</h2>
            <p className="text-muted-foreground">No subscription needed. Buy credits when you need them. Works with all plans.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CREDIT_PACKS.map((pack) => (
              <div key={pack.credits} className={`relative rounded-xl border ${pack.popular ? "border-primary/40 bg-primary/5" : "border-border/40 bg-card"} p-5 text-center hover:border-primary/40 transition-colors cursor-pointer`}>
                {pack.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pack.badge}</span>
                  </div>
                )}
                <div className="text-xs font-semibold text-muted-foreground mb-1">{pack.label}</div>
                <div className="text-2xl font-bold text-foreground mb-0.5">{pack.credits}<span className="text-sm font-normal text-muted-foreground ml-1">credits</span></div>
                <div className="text-xl font-semibold text-foreground mb-1">{pack.price}</div>
                <div className="text-xs text-muted-foreground">{pack.per}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rate limits table */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Rate Limits & Quotas</h2>
          <div className="overflow-x-auto rounded-xl border border-border/40">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-secondary/30">
                  <th className="text-left px-6 py-4 font-semibold text-foreground">Feature</th>
                  <th className="text-center px-6 py-4 font-semibold text-muted-foreground">Free</th>
                  <th className="text-center px-6 py-4 font-semibold text-primary">Pro</th>
                  <th className="text-center px-6 py-4 font-semibold text-amber-400">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {[
                  ["AI builds / month", "10", "Unlimited", "Unlimited"],
                  ["Builds per day", "5", "50", "Unlimited"],
                  ["Concurrent builds", "1", "3", "10"],
                  ["Max response tokens", "4,096", "8,192", "32,768"],
                  ["Storage", "50 MB", "10 GB", "100 GB"],
                  ["File uploads per build", "—", "10", "50"],
                  ["API requests / minute", "—", "60", "600"],
                  ["Active projects", "1", "10", "Unlimited"],
                  ["Team members", "1", "1", "5"],
                  ["Custom domains", "—", "✓", "✓"],
                  ["REST API access", "—", "—", "✓"],
                  ["White-label", "—", "—", "✓"],
                ].map(([feature, free, pro, ent]) => (
                  <tr key={feature} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-3.5 text-foreground/80">{feature}</td>
                    <td className="px-6 py-3.5 text-center text-muted-foreground">{free}</td>
                    <td className="px-6 py-3.5 text-center text-primary font-medium">{pro}</td>
                    <td className="px-6 py-3.5 text-center text-amber-400/80">{ent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="border border-border/40 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
                >
                  <span className="font-medium text-foreground text-sm">{item.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground border-t border-border/30 pt-3">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center rounded-2xl border border-primary/20 bg-primary/5 p-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">Ready to build?</h2>
          <p className="text-muted-foreground mb-6">Start free — no credit card required. Your first 10 builds are on us.</p>
          <Link href="/">
            <button className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95">
              Start building for free
            </button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/30 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <Zap className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">Sync</span>
            <span className="text-xs text-muted-foreground ml-2">by Demure Platform Inc.</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/about"><span className="hover:text-foreground cursor-pointer transition-colors">About</span></Link>
            <Link href="/docs"><span className="hover:text-foreground cursor-pointer transition-colors">Docs</span></Link>
            <Link href="/terms"><span className="hover:text-foreground cursor-pointer transition-colors">Terms</span></Link>
            <Link href="/privacy"><span className="hover:text-foreground cursor-pointer transition-colors">Privacy</span></Link>
          </div>
          <div className="text-xs text-muted-foreground">© 2025 Demure Platform Inc.</div>
        </div>
      </footer>
    </div>
  );
}

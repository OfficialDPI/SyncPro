import { Link } from "wouter";
import { Zap, Globe, Shield, Sparkles, Mail, ArrowRight } from "lucide-react";

export default function About() {
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
          <Link href="/pricing"><span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Pricing</span></Link>
          <Link href="/docs"><span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Docs</span></Link>
          <Link href="/"><button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Get started</button></Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            About Us
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            We're building the future of<br />
            <span className="text-primary">web development.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Sync (formerly Demuregram) is developed by Demure Platforms, Inc. — a company on a mission to make professional web development
            accessible to everyone through the power of AI.
          </p>
        </div>

        {/* Story & Demuregram */}
        <div className="prose prose-invert max-w-none mb-16">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card border border-border/40 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Our Story (formerly Demuregram)</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Demure Platforms, Inc. was founded with a simple belief: the gap between having an idea and shipping
                it to the world is too wide. Talented people with brilliant ideas shouldn't need months of coding
                experience to build and launch a professional website.
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm mt-3">
                Sync started as an experiment under its former name, Demuregram—what if you could describe a website in plain English and watch it
                materialize in real-time? That experiment grew into our core engine, and that product has evolved into a complete, next-generation AI-powered development workspace.
              </p>
            </div>
            <div className="bg-card border border-border/40 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                To compress the time from idea to live website from weeks to minutes. We believe every person with
                an idea deserves a beautiful, functional web presence—and we're building the tools to make that
                universally true.
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm mt-3">
                With Sync, we are making web development collaborative, AI-first, design-obsessed, and engineering-rigorous. Every build that ships from our platform should look and feel world-class.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">What we stand for</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Sparkles, title: "AI-First", color: "text-primary bg-primary/10", desc: "We don't bolt AI on — we build around it. Every feature starts with the question: how does AI make this better?" },
              { icon: Shield, title: "Privacy-Respecting", color: "text-emerald-400 bg-emerald-400/10", desc: "We don't sell your data, train on your projects, or share what you build. Your IP is yours, always." },
              { icon: Globe, title: "Globally Accessible", color: "text-cyan-400 bg-cyan-400/10", desc: "Sync works everywhere. Our infrastructure is deployed across regions with low-latency access worldwide." },
            ].map((v) => (
              <div key={v.title} className="bg-card border border-border/40 rounded-2xl p-6">
                <div className={`w-10 h-10 rounded-xl ${v.color} flex items-center justify-center mb-4`}>
                  <v.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="border border-border/40 rounded-2xl bg-card p-10 mb-16">
          <h2 className="text-xl font-bold text-foreground mb-8 text-center">Sync by the numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: "10,000+", label: "Websites built" },
              { val: "< 60s", label: "Avg. build time" },
              { val: "99.9%", label: "Uptime SLA (Pro)" },
              { val: "50+", label: "Countries served" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-primary mb-1">{s.val}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Company info */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-card border border-border/40 rounded-2xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <dl className="space-y-3 text-sm">
              {[
                { label: "Legal name", val: "Demure Platforms, Inc." },
                { label: "Product", val: "Sync (formerly Demuregram)" },
                { label: "Founded", val: "2025" },
                { label: "Status", val: "Active" },
              ].map((d) => (
                <div key={d.label} className="flex justify-between">
                  <dt className="text-muted-foreground">{d.label}</dt>
                  <dd className="text-foreground font-medium">{d.val}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="bg-card border border-border/40 rounded-2xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <div className="space-y-4 text-sm">
              {[
                { label: "General", val: "hello@sync.demuregram.app" },
                { label: "Support", val: "support@sync.demuregram.app" },
                { label: "Press", val: "press@sync.demuregram.app" },
                { label: "Legal", val: "legal@sync.demuregram.app" },
              ].map((c) => (
                <div key={c.label} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{c.label}</span>
                  <a href={`mailto:${c.val}`} className="text-primary hover:underline flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {c.val}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center rounded-2xl border border-primary/20 bg-primary/5 p-12">
          <h2 className="text-2xl font-bold text-foreground mb-3">Start building today</h2>
          <p className="text-muted-foreground mb-6">No credit card. No setup. Just describe and build.</p>
          <Link href="/">
            <button className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:scale-105">
              Open Sync <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      <footer className="border-t border-border/30 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">© 2026 Demure Platforms, Inc. All rights reserved.</span>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/terms"><span className="hover:text-foreground cursor-pointer">Terms</span></Link>
            <Link href="/privacy"><span className="hover:text-foreground cursor-pointer">Privacy</span></Link>
            <Link href="/docs"><span className="hover:text-foreground cursor-pointer">Docs</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

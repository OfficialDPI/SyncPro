import { useState } from "react";
import { Link } from "wouter";
import { Zap, ChevronDown, ChevronRight, Copy, Check, Terminal } from "lucide-react";

const NAV = [
  { id: "quickstart", label: "Quick Start" },
  { id: "building", label: "Building Websites" },
  { id: "ai-commands", label: "AI Commands" },
  { id: "logos", label: "Logo & Branding" },
  { id: "colors", label: "Colors & Effects" },
  { id: "animations", label: "Animations" },
  { id: "api", label: "REST API" },
  { id: "faq", label: "FAQ" },
];

function CodeBlock({ code, lang = "html" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-xl overflow-hidden border border-border/40 mb-4">
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border/30">
        <span className="text-xs text-muted-foreground font-mono">{lang}</span>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <><Check className="w-3 h-3 text-emerald-400" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
        </button>
      </div>
      <pre className="p-4 text-xs overflow-x-auto bg-[#050810] text-zinc-300 leading-relaxed"><code>{code}</code></pre>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-14 scroll-mt-20">
      <h2 className="text-xl font-bold text-foreground mb-4 pb-3 border-b border-border/30">{title}</h2>
      {children}
    </section>
  );
}

function Callout({ type = "info", children }: { type?: "info" | "tip" | "warning"; children: React.ReactNode }) {
  const styles = {
    info: "bg-primary/5 border-primary/30 text-primary",
    tip: "bg-emerald-500/5 border-emerald-500/30 text-emerald-400",
    warning: "bg-amber-500/5 border-amber-500/30 text-amber-400",
  };
  const labels = { info: "ℹ Info", tip: "✓ Tip", warning: "⚠ Note" };
  return (
    <div className={`border-l-2 ${styles[type]} pl-4 py-3 pr-4 rounded-r-xl mb-4 bg-opacity-5`}>
      <span className="text-xs font-bold uppercase tracking-wider mb-1 block">{labels[type]}</span>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export default function Docs() {
  const [activeSection, setActiveSection] = useState("quickstart");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <nav className="border-b border-border/30 px-6 py-4 flex items-center justify-between flex-shrink-0 bg-background/80 backdrop-blur-md z-10">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Sync</span>
            <span className="text-muted-foreground/50 ml-1">/</span>
            <span className="text-sm text-muted-foreground ml-1">Docs</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/pricing"><span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Pricing</span></Link>
          <Link href="/"><button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Open Sync</button></Link>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar nav */}
        <aside className="w-56 flex-shrink-0 border-r border-border/30 p-4 overflow-y-auto">
          <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-3 px-2">Documentation</p>
          <nav className="space-y-0.5">
            {NAV.map((item) => (
              <button key={item.id} onClick={() => scrollTo(item.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${activeSection === item.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-8 max-w-3xl" onScroll={(e) => {
          const el = e.currentTarget;
          for (const item of NAV) {
            const section = document.getElementById(item.id);
            if (section && section.offsetTop - el.scrollTop < 100) {
              setActiveSection(item.id);
            }
          }
        }}>

          <Section id="quickstart" title="Quick Start">
            <p className="text-muted-foreground mb-4">Get from zero to live website in under 60 seconds.</p>
            <div className="space-y-4">
              {[
                { step: 1, title: "Open Sync", desc: "Navigate to the home page and type your website description in the chat box." },
                { step: 2, title: "Describe your site", desc: "Be as specific or general as you like. The AI handles the rest." },
                { step: 3, title: "Watch it build", desc: "See your website appear live in the right panel as the AI writes it." },
                { step: 4, title: "Iterate naturally", desc: "Say things like 'make the hero darker' or 'add a pricing section' to refine." },
              ].map((s) => (
                <div key={s.step} className="flex gap-4 p-4 bg-card border border-border/30 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">{s.step}</div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{s.title}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <Callout type="tip">Your first 10 builds are free — no credit card required.</Callout>
          </Section>

          <Section id="building" title="Building Websites">
            <p className="text-muted-foreground mb-4">Every website Sync builds is a complete, self-contained HTML file with Tailwind CSS, Google Fonts, and optionally GSAP, Lenis, and Three.js.</p>

            <h3 className="font-semibold text-foreground mb-2 mt-6">Example prompts that work well</h3>
            <div className="space-y-2 mb-6">
              {[
                "Build a SaaS landing page for a project management tool called 'FlowDesk'",
                "Create a portfolio website for a freelance photographer with a dark editorial look",
                "Build an e-commerce homepage for a luxury candle brand",
                "Make a restaurant website for 'Sakura Tokyo' with menu, reservations, and gallery",
                "Create a coming-soon page with countdown timer and email capture",
              ].map((p) => (
                <div key={p} className="flex items-start gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground font-mono text-xs bg-secondary/50 px-3 py-1.5 rounded-lg">{p}</span>
                </div>
              ))}
            </div>

            <h3 className="font-semibold text-foreground mb-2">Iteration commands</h3>
            <div className="overflow-x-auto rounded-xl border border-border/40">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-border/40 bg-secondary/30"><th className="text-left px-4 py-3 font-semibold text-foreground">Say this</th><th className="text-left px-4 py-3 font-semibold text-foreground">What happens</th></tr></thead>
                <tbody className="divide-y divide-border/20">
                  {[
                    ["change the headline to [text]", "Updates hero headline only"],
                    ["add a testimonials section", "Inserts 3 testimonial cards"],
                    ["make the buttons rounded", "Applies border-radius to all CTAs"],
                    ["add a sticky navigation", "Wraps nav in sticky + backdrop-blur"],
                    ["make it mobile responsive", "Adds responsive breakpoints"],
                    ["add a dark footer with links", "Appends styled footer section"],
                  ].map(([say, does]) => (
                    <tr key={say} className="hover:bg-secondary/20">
                      <td className="px-4 py-2.5 font-mono text-primary">{say}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{does}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="ai-commands" title="AI Commands Reference">
            <p className="text-muted-foreground mb-6">Natural language commands you can use during any build session.</p>
            <div className="space-y-4">
              {[
                { category: "Content", commands: ["'Change the hero headline to [text]'", "'Update the pricing to show $29/mo for Pro'", "'Replace all placeholder text with real copy for a gym'"] },
                { category: "Layout", commands: ["'Add a features grid with 6 cards'", "'Add a sticky nav at the top'", "'Move the CTA above the fold'"] },
                { category: "Style", commands: ["'Make it darker with glowing blur effects'", "'Change the accent color to emerald'", "'Use a glassmorphism card style'"] },
                { category: "Components", commands: ["'Add a pricing section with 3 tiers'", "'Add an FAQ accordion'", "'Add a newsletter signup form'"] },
              ].map((group) => (
                <div key={group.category} className="border border-border/40 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-secondary/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.category}</div>
                  <div className="p-4 space-y-2">
                    {group.commands.map((cmd) => (
                      <div key={cmd} className="flex items-center gap-2 text-sm">
                        <Terminal className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground/80 font-mono text-xs">{cmd}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="logos" title="Logo & Branding">
            <p className="text-muted-foreground mb-4">Sync's AI understands logo placement commands and handles images, SVGs, and text-based marks.</p>

            <h3 className="font-semibold text-foreground mb-3 mt-6">Adding a logo</h3>
            <Callout type="tip">Simply describe where you want it — the AI positions it correctly in the nav automatically.</Callout>
            <div className="space-y-3 mb-6">
              {[
                { prompt: "Add my logo to the header top left corner", result: "Places a branded SVG logo mark in the leftmost nav position" },
                { prompt: "Use my logo image at https://example.com/logo.png", result: "Embeds your image as an <img> tag in the nav, properly sized" },
                { prompt: "Replace the company name with my logo", result: "Replaces text nav label with your provided image" },
                { prompt: "Add a favicon using my logo", result: "Adds a <link rel='icon'> tag pointing to your logo URL" },
              ].map((ex) => (
                <div key={ex.prompt} className="border border-border/30 rounded-xl p-4 bg-card/50">
                  <div className="text-xs font-mono text-primary mb-1.5">"{ex.prompt}"</div>
                  <div className="text-xs text-muted-foreground">→ {ex.result}</div>
                </div>
              ))}
            </div>

            <h3 className="font-semibold text-foreground mb-3">Logo best practices</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "Use PNG or SVG format for crisp rendering at all sizes",
                "Provide a URL to a publicly-accessible image (CDN, GitHub raw, etc.)",
                "Logos work best with transparent backgrounds (PNG with alpha)",
                "For dark backgrounds, provide a light/white version of your logo",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="colors" title="Colors & Effects">
            <p className="text-muted-foreground mb-4">Sync understands color and visual effect requests in plain English.</p>

            <h3 className="font-semibold text-foreground mb-3 mt-6">Color commands</h3>
            <div className="overflow-x-auto rounded-xl border border-border/40 mb-6">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-border/40 bg-secondary/30"><th className="text-left px-4 py-3 font-semibold text-foreground">Say this</th><th className="text-left px-4 py-3 font-semibold text-foreground">Applied style</th></tr></thead>
                <tbody className="divide-y divide-border/20">
                  {[
                    ["make it darker", "Switches to #050810 background, #0a0d1a sections"],
                    ["add glowing blur effects", "box-shadow + backdrop-filter blur on cards/nav"],
                    ["change the accent to emerald", "Replaces primary color with #10b981"],
                    ["make the hero gradient purple", "linear-gradient hero background"],
                    ["add a glassmorphism style", "bg-white/5 backdrop-blur-xl border-white/10"],
                    ["make buttons glow", "box-shadow: 0 0 20px rgba(accent, 0.4)"],
                  ].map(([say, applied]) => (
                    <tr key={say} className="hover:bg-secondary/20">
                      <td className="px-4 py-2.5 font-mono text-primary">"{say}"</td>
                      <td className="px-4 py-2.5 text-muted-foreground font-mono text-[11px]">{applied}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold text-foreground mb-3">Dark theme with glow — example</h3>
            <CodeBlock lang="css" code={`/* Applied when you say "make it darker with glowing blur effects" */
:root {
  --bg: #05070f;
  --surface: #0a0d1a;
  --border: rgba(255,255,255,0.08);
  --accent: #6366f1;
  --glow: rgba(99, 102, 241, 0.35);
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  backdrop-filter: blur(12px);
  box-shadow: 0 0 20px var(--glow), inset 0 1px 0 rgba(255,255,255,0.05);
}

.hero-title {
  text-shadow: 0 0 40px var(--glow), 0 0 80px rgba(99,102,241,0.2);
}

.btn-primary {
  background: var(--accent);
  box-shadow: 0 0 20px var(--glow), 0 0 40px rgba(99,102,241,0.2);
}`} />
          </Section>

          <Section id="animations" title="GSAP, Lenis & Three.js">
            <p className="text-muted-foreground mb-4">Sync automatically includes premium animation libraries for immersive, high-end builds.</p>

            <Callout type="info">GSAP and Lenis are included automatically on landing pages. Three.js is added when you ask for 3D effects or particle backgrounds.</Callout>

            <h3 className="font-semibold text-foreground mb-3 mt-6">Animation commands</h3>
            <div className="space-y-3 mb-6">
              {[
                { cmd: "'Add GSAP scroll animations to each section'", desc: "Adds ScrollTrigger reveal on every .section element" },
                { cmd: "'Add Lenis smooth scrolling'", desc: "Wraps the page in buttery-smooth native-feel scroll" },
                { cmd: "'Add a particle background'", desc: "Adds a Three.js BufferGeometry particle field behind the hero" },
                { cmd: "'Add a 3D rotating logo in the hero'", desc: "Creates a Three.js mesh object in the hero section" },
                { cmd: "'Make the hero animate on load'", desc: "GSAP timeline: opacity+translateY entrance on DOMContentLoaded" },
              ].map((ex) => (
                <div key={ex.cmd} className="border border-border/30 rounded-xl p-4 bg-card/50">
                  <div className="text-xs font-mono text-primary mb-1.5">{ex.cmd}</div>
                  <div className="text-xs text-muted-foreground">→ {ex.desc}</div>
                </div>
              ))}
            </div>

            <h3 className="font-semibold text-foreground mb-3">CDN references (auto-included)</h3>
            <CodeBlock lang="html" code={`<!-- GSAP + ScrollTrigger -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

<!-- Lenis smooth scroll -->
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>

<!-- Three.js r128 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>`} />
          </Section>

          <Section id="api" title="REST API Reference">
            <Callout type="warning">REST API access requires a Pro or Enterprise plan. Get your API key from Settings → API Keys.</Callout>

            <h3 className="font-semibold text-foreground mb-3 mt-6">Base URL</h3>
            <CodeBlock lang="bash" code={`https://sync.demure.ai/api`} />

            <h3 className="font-semibold text-foreground mb-3 mt-6">Authentication</h3>
            <CodeBlock lang="bash" code={`curl -H "Authorization: Bearer sk-sync-YOUR_KEY" \\
  https://sync.demure.ai/api/conversations`} />

            <h3 className="font-semibold text-foreground mb-3 mt-6">Endpoints</h3>
            <div className="space-y-3">
              {[
                { method: "GET", path: "/conversations", desc: "List all conversations" },
                { method: "POST", path: "/conversations", desc: "Create a new conversation" },
                { method: "GET", path: "/conversations/:id", desc: "Get conversation by ID" },
                { method: "DELETE", path: "/conversations/:id", desc: "Delete conversation" },
                { method: "POST", path: "/conversations/:id/messages", desc: "Send message (streams SSE)" },
                { method: "GET", path: "/conversations/:id/messages", desc: "List messages" },
                { method: "GET", path: "/projects", desc: "List all projects" },
                { method: "POST", path: "/projects", desc: "Create a new project" },
                { method: "PATCH", path: "/projects/:id", desc: "Update project" },
                { method: "DELETE", path: "/projects/:id", desc: "Delete project" },
              ].map((ep) => (
                <div key={ep.path} className="flex items-center gap-3 p-3 bg-card border border-border/30 rounded-xl text-sm">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono w-14 text-center ${ep.method === "GET" ? "bg-emerald-500/20 text-emerald-400" : ep.method === "POST" ? "bg-primary/20 text-primary" : ep.method === "DELETE" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>{ep.method}</span>
                  <span className="font-mono text-foreground/80 text-xs">{ep.path}</span>
                  <span className="text-muted-foreground text-xs ml-auto">{ep.desc}</span>
                </div>
              ))}
            </div>

            <h3 className="font-semibold text-foreground mb-3 mt-6">Create a conversation & build a website</h3>
            <CodeBlock lang="bash" code={`# 1. Create a conversation
curl -X POST https://sync.demure.ai/api/conversations \\
  -H "Authorization: Bearer sk-sync-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "My Website", "model": "llama-3.3-70b-versatile"}'

# 2. Send your build prompt (streams SSE)
curl -X POST https://sync.demure.ai/api/conversations/1/messages \\
  -H "Authorization: Bearer sk-sync-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"content": "Build a SaaS landing page for a task manager"}' \\
  --no-buffer`} />
          </Section>

          <Section id="faq" title="FAQ">
            <div className="space-y-4">
              {[
                { q: "Can I export the generated website?", a: "Yes. Click 'Code' in the preview panel, select all, and copy. The output is a single self-contained HTML file you can host anywhere." },
                { q: "Can the AI add my real images?", a: "Provide a publicly-accessible URL in your prompt. Say 'use the image at [url] in the hero section' and it will be embedded directly." },
                { q: "What if the AI makes a mistake?", a: "Just describe what needs fixing: 'the nav logo is missing' or 'the mobile menu doesn't close'. The AI will update the relevant section." },
                { q: "Can I host the website on my own domain?", a: "Yes — copy the generated HTML file and deploy it to Netlify, Vercel, GitHub Pages, or any static host. Custom domain connection is available on Pro." },
                { q: "Does Sync support multi-page websites?", a: "Currently Sync generates single-page applications. Multi-page support is on the roadmap for Pro users." },
                { q: "Can I use the built websites commercially?", a: "Yes. You own the output. There is no attribution requirement." },
              ].map((item, i) => (
                <div key={i} className="border border-border/40 rounded-xl p-5">
                  <h4 className="font-semibold text-foreground mb-2 text-sm">{item.q}</h4>
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}

import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  User, Key, Shield, Palette, Sparkles, Bell, CreditCard,
  HelpCircle, ChevronRight, Eye, EyeOff, Copy, Check, RefreshCw,
  Zap, LogOut, Trash2, ArrowLeft, ExternalLink, Globe,
} from "lucide-react";
import { useSettings, applyAccentColor } from "@/lib/settings-context";
import { Link as WouterLink } from "wouter";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "apikeys", label: "API Keys", icon: Key },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "ai", label: "AI Preferences", icon: Sparkles },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "help", label: "Help & Support", icon: HelpCircle },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

const MODELS = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile", badge: "Recommended" },
  { id: "llama-3.1-70b-versatile", label: "Llama 3.1 70B", badge: null },
  { id: "mixtral-8x7b-32768", label: "Mixtral 8×7B", badge: "Fast" },
  { id: "gemma2-9b-it", label: "Gemma 2 9B", badge: "Lightweight" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant", badge: "Fastest" },
];

const ACCENT_COLORS = [
  { name: "Indigo", hue: 235, class: "bg-[hsl(235,80%,65%)]" },
  { name: "Violet", hue: 265, class: "bg-[hsl(265,80%,65%)]" },
  { name: "Emerald", hue: 160, class: "bg-[hsl(160,80%,45%)]" },
  { name: "Cyan", hue: 195, class: "bg-[hsl(195,80%,55%)]" },
  { name: "Rose", hue: 345, class: "bg-[hsl(345,80%,65%)]" },
  { name: "Orange", hue: 25, class: "bg-[hsl(25,80%,60%)]" },
  { name: "Gold", hue: 45, class: "bg-[hsl(45,80%,60%)]" },
  { name: "Sky", hue: 210, class: "bg-[hsl(210,80%,65%)]" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-secondary"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="border border-border/40 rounded-2xl p-6 bg-card/50">
      <div className="mb-5">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {desc && <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-background border border-border/50 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
      />
    </div>
  );
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [, setLocation] = useLocation();
  const { settings, updateSettings } = useSettings();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: settings.name,
    email: settings.email,
    bio: settings.bio,
    avatarUrl: settings.avatarUrl,
  });

  const saveProfile = () => {
    updateSettings(profileForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(settings.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateKey = () => {
    if (!confirm("Regenerate API key? Your old key will stop working immediately.")) return;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const key = "sk-sync-" + Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    updateSettings({ apiKey: key });
  };

  const clearAllData = () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    localStorage.clear();
    window.location.href = "/";
  };

  const maskedKey = settings.apiKey.slice(0, 12) + "•".repeat(20) + settings.apiKey.slice(-4);

  const PLAN_LIMITS = { free: 10, pro: Infinity, enterprise: Infinity };
  const buildLimit = PLAN_LIMITS[settings.plan];
  const buildPct = buildLimit === Infinity ? 0 : Math.min(100, (settings.buildsThisMonth / buildLimit) * 100);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Topbar */}
      <div className="border-b border-border/30 px-6 py-4 flex items-center gap-3 sticky top-0 bg-background/90 backdrop-blur-md z-10">
        <button onClick={() => setLocation("/")} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-semibold text-foreground text-sm">Settings</h1>
          <p className="text-xs text-muted-foreground">Demure Platform Inc. · Sync</p>
        </div>
      </div>

      <div className="flex min-h-full">
        {/* Left nav */}
        <div className="w-52 flex-shrink-0 border-r border-border/30 p-4 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <nav className="space-y-0.5">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-left ${
                  activeSection === s.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <s.icon className="w-4 h-4 flex-shrink-0" />
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right content */}
        <div className="flex-1 p-8 max-w-2xl">

          {/* PROFILE */}
          {activeSection === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Profile</h2>
                <p className="text-sm text-muted-foreground mt-1">Your public-facing identity on Sync.</p>
              </div>

              <SectionCard title="Avatar" desc="Shown in the sidebar and on your public profile.">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {profileForm.avatarUrl ? (
                      <img src={profileForm.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-primary">{profileForm.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <InputField label="Avatar URL" value={profileForm.avatarUrl} onChange={(v) => setProfileForm((p) => ({ ...p, avatarUrl: v }))} placeholder="https://example.com/avatar.png" />
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Personal Info">
                <div className="space-y-4">
                  <InputField label="Display Name" value={profileForm.name} onChange={(v) => setProfileForm((p) => ({ ...p, name: v }))} placeholder="Your name" />
                  <InputField label="Email" value={profileForm.email} onChange={(v) => setProfileForm((p) => ({ ...p, email: v }))} type="email" placeholder="you@example.com" />
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Bio</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                      placeholder="Tell us a little about yourself..."
                      rows={3}
                      className="w-full bg-background border border-border/50 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                </div>
              </SectionCard>

              <button
                onClick={saveProfile}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${saved ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
              >
                {saved ? <><Check className="w-4 h-4" />Saved!</> : "Save changes"}
              </button>
            </div>
          )}

          {/* API KEYS */}
          {activeSection === "apikeys" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">API Keys</h2>
                <p className="text-sm text-muted-foreground mt-1">Use your Sync API key to access the platform programmatically.</p>
              </div>

              <SectionCard title="Your Sync API Key" desc="Include this in the Authorization header: Bearer sk-sync-...">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 bg-background border border-border/50 rounded-xl px-3.5 py-2.5 font-mono text-sm text-foreground/80 overflow-hidden">
                    {showKey ? settings.apiKey : maskedKey}
                  </div>
                  <button onClick={() => setShowKey(!showKey)} className="p-2.5 rounded-xl border border-border/50 hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={copyKey} className="p-2.5 rounded-xl border border-border/50 hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={regenerateKey} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 hover:bg-secondary/60 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                  </button>
                  <span className="text-xs text-muted-foreground">Regenerating invalidates your current key immediately.</span>
                </div>
              </SectionCard>

              <SectionCard title="API Usage" desc="Current month's API call statistics.">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Builds this month", val: settings.buildsThisMonth.toString() },
                    { label: "API calls", val: "—" },
                    { label: "Rate limit", val: "60 / min" },
                  ].map((s) => (
                    <div key={s.label} className="bg-background/50 rounded-xl p-3 border border-border/30">
                      <div className="text-xl font-bold text-foreground">{s.val}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="REST API" desc="Integrate Sync into your own tools and workflows.">
                <p className="text-sm text-muted-foreground mb-4">The Sync API is available on Pro and Enterprise plans. Browse the full reference documentation.</p>
                <WouterLink href="/docs">
                  <button className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" /> View API Documentation
                  </button>
                </WouterLink>
              </SectionCard>
            </div>
          )}

          {/* SECURITY */}
          {activeSection === "security" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Privacy & Security</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage your account security and session.</p>
              </div>

              <SectionCard title="Current Session">
                <div className="space-y-3">
                  {[
                    { label: "Browser", val: navigator.userAgent.includes("Chrome") ? "Chrome" : navigator.userAgent.includes("Firefox") ? "Firefox" : "Browser" },
                    { label: "IP Address", val: "Hidden for privacy" },
                    { label: "Signed in", val: "This session" },
                    { label: "Last active", val: "Just now" },
                  ].map((s) => (
                    <div key={s.label} className="flex justify-between items-center text-sm py-2 border-b border-border/20 last:border-0">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="text-foreground">{s.val}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Two-Factor Authentication" desc="Add an extra layer of security to your account.">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">2FA is not enabled</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Available on Pro and Enterprise plans.</p>
                  </div>
                  <WouterLink href="/pricing">
                    <button className="px-3.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                      Upgrade to enable
                    </button>
                  </WouterLink>
                </div>
              </SectionCard>

              <SectionCard title="Data & Privacy" desc="Control your data stored on Demure Platform Inc. servers.">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">Export my data</p>
                      <p className="text-xs text-muted-foreground">Download all your conversations and projects.</p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                      Export
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                    <div>
                      <p className="text-sm font-medium text-destructive">Clear all local data</p>
                      <p className="text-xs text-muted-foreground">Resets settings, pins, archives. Cannot be undone.</p>
                    </div>
                    <button
                      onClick={clearAllData}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${clearConfirm ? "bg-destructive text-white" : "border border-destructive/40 text-destructive hover:bg-destructive/10"}`}
                    >
                      {clearConfirm ? "Confirm clear" : "Clear data"}
                    </button>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Sign Out">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Sign out of Sync on this device.</p>
                  <button
                    onClick={() => { localStorage.clear(); window.location.href = "/"; }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 text-sm text-destructive hover:bg-destructive/10 hover:border-destructive/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </SectionCard>
            </div>
          )}

          {/* APPEARANCE */}
          {activeSection === "appearance" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Appearance</h2>
                <p className="text-sm text-muted-foreground mt-1">Customize how Sync looks and feels.</p>
              </div>

              <SectionCard title="Theme" desc="Sync uses a pitch-black dark theme tuned for low-light focused work.">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "pitch-black", label: "Pitch Black", desc: "The original", active: true },
                    { id: "dark", label: "Dark", desc: "Coming soon", active: false, disabled: true },
                  ].map((t) => (
                    <div
                      key={t.id}
                      className={`relative p-4 rounded-xl border cursor-pointer transition-all ${t.active ? "border-primary/50 bg-primary/5" : "border-border/30 opacity-40"} ${t.disabled ? "cursor-not-allowed" : ""}`}
                    >
                      {t.active && <span className="absolute top-2 right-2 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Active</span>}
                      <div className="w-8 h-5 rounded bg-[#0a0a0a] border border-white/10 mb-2" />
                      <div className="text-sm font-medium text-foreground">{t.label}</div>
                      <div className="text-xs text-muted-foreground">{t.desc}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Accent Color" desc="Changes the primary color throughout the app — applied instantly.">
                <div className="grid grid-cols-4 gap-3">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => updateSettings({ accentHue: c.hue })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${settings.accentHue === c.hue ? "border-white/30 bg-white/5" : "border-border/30 hover:border-border"}`}
                    >
                      <div
                        className="w-8 h-8 rounded-full shadow-lg"
                        style={{ backgroundColor: `hsl(${c.hue}, 80%, 65%)`, boxShadow: settings.accentHue === c.hue ? `0 0 16px hsl(${c.hue},80%,65%,0.5)` : undefined }}
                      />
                      <span className="text-[11px] text-muted-foreground">{c.name}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Custom Hue (0–360)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range" min={0} max={360} value={settings.accentHue}
                      onChange={(e) => updateSettings({ accentHue: Number(e.target.value) })}
                      className="flex-1 accent-primary"
                    />
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: `hsl(${settings.accentHue}, 80%, 65%)` }}
                    />
                    <span className="text-sm text-muted-foreground w-8">{settings.accentHue}°</span>
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

          {/* AI PREFERENCES */}
          {activeSection === "ai" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">AI Preferences</h2>
                <p className="text-sm text-muted-foreground mt-1">Configure how Sync's AI builds websites for you.</p>
              </div>

              <SectionCard title="Default Model" desc="Used for all new conversations. You can change it per-chat.">
                <div className="space-y-2">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => updateSettings({ defaultModel: m.id })}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${settings.defaultModel === m.id ? "border-primary/50 bg-primary/5" : "border-border/30 hover:border-border/60 hover:bg-secondary/30"}`}
                    >
                      <div>
                        <div className="text-sm font-medium text-foreground">{m.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Groq · {m.id}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {m.badge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.badge === "Recommended" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                            {m.badge}
                          </span>
                        )}
                        {settings.defaultModel === m.id && <Check className="w-4 h-4 text-primary" />}
                      </div>
                    </button>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Temperature" desc="Controls creativity vs. consistency. Lower = more predictable, higher = more creative.">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-16">Precise</span>
                  <input
                    type="range" min={0} max={1} step={0.05} value={settings.temperature}
                    onChange={(e) => updateSettings({ temperature: Number(e.target.value) })}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-xs text-muted-foreground w-16 text-right">Creative</span>
                  <div className="w-12 text-center">
                    <span className="text-sm font-semibold text-foreground">{settings.temperature.toFixed(2)}</span>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Build Tips for Best Results">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "Describe your target audience and purpose upfront",
                    "Mention the industry or niche (SaaS, portfolio, restaurant, etc.)",
                    "Say 'add my logo at [url]' to embed your real logo",
                    "Say 'make it darker with glowing effects' for premium dark UI",
                    "Say 'add GSAP animations' for scroll-triggered reveals",
                    "Iterate naturally: 'change the hero headline to...' or 'add a pricing section'",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">→</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Notifications</h2>
                <p className="text-sm text-muted-foreground mt-1">Choose what you hear about and when.</p>
              </div>

              <SectionCard title="In-App Notifications">
                {[
                  { key: "inApp" as const, label: "In-app alerts", desc: "Show notifications inside the Sync platform." },
                  { key: "builds" as const, label: "Build complete", desc: "Alert when a long build finishes." },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-border/20 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                    <Toggle
                      checked={settings.notifications[item.key]}
                      onChange={(v) => updateSettings({ notifications: { ...settings.notifications, [item.key]: v } })}
                    />
                  </div>
                ))}
              </SectionCard>

              <SectionCard title="Email Notifications" desc="Requires a verified email address.">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">Weekly digest</div>
                    <div className="text-xs text-muted-foreground">Summary of your builds and account activity.</div>
                  </div>
                  <Toggle
                    checked={settings.notifications.email}
                    onChange={(v) => updateSettings({ notifications: { ...settings.notifications, email: v } })}
                  />
                </div>
              </SectionCard>
            </div>
          )}

          {/* BILLING */}
          {activeSection === "billing" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Billing</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage your plan, usage, and payment method.</p>
              </div>

              <SectionCard title="Current Plan">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold capitalize ${settings.plan === "pro" ? "text-primary" : settings.plan === "enterprise" ? "text-amber-400" : "text-foreground"}`}>
                        {settings.plan.charAt(0).toUpperCase() + settings.plan.slice(1)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${settings.plan === "free" ? "bg-secondary text-muted-foreground" : "bg-primary/20 text-primary"}`}>
                        {settings.plan === "free" ? "Active" : "Pro"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {settings.plan === "free" ? "10 builds/month included" : "Unlimited builds"}
                    </p>
                  </div>
                  {settings.plan === "free" && (
                    <WouterLink href="/pricing">
                      <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                        Upgrade to Pro
                      </button>
                    </WouterLink>
                  )}
                </div>

                {settings.plan === "free" && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Builds this month</span>
                      <span className="text-foreground font-medium">{settings.buildsThisMonth} / 10</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${buildPct}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Resets on the 1st of each month.</p>
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Top Up Credits" desc="Buy build credits for one-off use. Works alongside your plan.">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { credits: 50, price: "$9" },
                    { credits: 200, price: "$29", popular: true },
                    { credits: 500, price: "$59" },
                    { credits: 1000, price: "$99", badge: "Best rate" },
                  ].map((pack) => (
                    <button key={pack.credits} className={`relative p-4 rounded-xl border text-left transition-all hover:border-primary/40 ${pack.popular ? "border-primary/30 bg-primary/5" : "border-border/40 hover:bg-secondary/30"}`}>
                      {pack.badge && <span className="absolute -top-2 right-2 text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">{pack.badge}</span>}
                      <div className="text-lg font-bold text-foreground">{pack.credits} <span className="text-sm font-normal text-muted-foreground">credits</span></div>
                      <div className="text-base font-semibold text-primary">{pack.price}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Credits never expire. Payment via Stripe — coming soon.</p>
              </SectionCard>

              <SectionCard title="Payment Method" desc="Add a credit card to enable Pro subscription or credit top-ups.">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">No payment method on file.</p>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 text-sm text-foreground hover:bg-secondary/50 transition-colors">
                    <CreditCard className="w-4 h-4" /> Add card
                  </button>
                </div>
              </SectionCard>
            </div>
          )}

          {/* HELP */}
          {activeSection === "help" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Help & Support</h2>
                <p className="text-sm text-muted-foreground mt-1">Everything you need to get the most out of Sync.</p>
              </div>

              <SectionCard title="Resources">
                <div className="space-y-2">
                  {[
                    { icon: Globe, label: "Platform Documentation", desc: "Full guides, tips, and AI command reference", href: "/docs" },
                    { icon: Zap, label: "Quick Start Guide", desc: "Build your first website in under 2 minutes", href: "/docs#quickstart" },
                    { icon: ExternalLink, label: "Changelog", desc: "See what's new in Sync", href: "#" },
                    { icon: Shield, label: "Status Page", desc: "Live platform health and uptime", href: "#" },
                  ].map((item) => (
                    <a key={item.label} href={item.href} className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-secondary/40 transition-colors group border border-transparent hover:border-border/40">
                      <div className="w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                        <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Contact Support" desc="Get in touch with the Demure Platform team.">
                <div className="space-y-3">
                  {[
                    { label: "General Support", val: "support@sync.demure.ai" },
                    { label: "Billing Questions", val: "billing@sync.demure.ai" },
                    { label: "Security Reports", val: "security@sync.demure.ai" },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center justify-between text-sm py-2 border-b border-border/20 last:border-0">
                      <span className="text-muted-foreground">{c.label}</span>
                      <a href={`mailto:${c.val}`} className="text-primary hover:underline">{c.val}</a>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="About">
                <div className="space-y-2 text-sm">
                  {[
                    { label: "Product", val: "Sync — AI Website Builder" },
                    { label: "Company", val: "Demure Platform Inc." },
                    { label: "Version", val: "1.0.0" },
                  ].map((i) => (
                    <div key={i.label} className="flex justify-between py-1.5 border-b border-border/20 last:border-0">
                      <span className="text-muted-foreground">{i.label}</span>
                      <span className="text-foreground">{i.val}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-3">
                  <WouterLink href="/about"><button className="text-xs text-primary hover:underline">About us</button></WouterLink>
                  <span className="text-muted-foreground">·</span>
                  <WouterLink href="/terms"><button className="text-xs text-primary hover:underline">Terms</button></WouterLink>
                  <span className="text-muted-foreground">·</span>
                  <WouterLink href="/privacy"><button className="text-xs text-primary hover:underline">Privacy</button></WouterLink>
                </div>
              </SectionCard>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

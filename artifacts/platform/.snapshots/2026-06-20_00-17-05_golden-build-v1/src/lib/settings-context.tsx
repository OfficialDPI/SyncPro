import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AppSettings {
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  accentHue: number;
  defaultModel: string;
  temperature: number;
  notifications: { email: boolean; inApp: boolean; builds: boolean };
  apiKey: string;
  plan: "free" | "pro" | "enterprise";
  buildsThisMonth: number;
}

const ACCENT_PRESETS: Record<string, number> = {
  Indigo: 235,
  Violet: 265,
  Emerald: 160,
  Cyan: 195,
  Rose: 345,
  Orange: 25,
  Gold: 45,
  Sky: 210,
};

function generateKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const arr = Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]);
  return "sk-sync-" + arr.join("");
}

export function applyAccentColor(hue: number) {
  const r = document.documentElement;
  r.style.setProperty("--primary", `${hue} 80% 65%`);
  r.style.setProperty("--ring", `${hue} 80% 65%`);
  r.style.setProperty("--sidebar-primary", `${hue} 80% 65%`);
  r.style.setProperty("--sidebar-ring", `${hue} 80% 65%`);
  r.style.setProperty("--chart-1", `${hue} 80% 65%`);
}

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem("sync_settings");
    const parsed = stored ? JSON.parse(stored) : {};
    return {
      name: parsed.name ?? "Developer",
      email: parsed.email ?? "dev@example.com",
      bio: parsed.bio ?? "",
      avatarUrl: parsed.avatarUrl ?? "",
      accentHue: parsed.accentHue ?? 235,
      defaultModel: parsed.defaultModel ?? "llama-3.3-70b-versatile",
      temperature: parsed.temperature ?? 0.7,
      notifications: {
        email: parsed.notifications?.email ?? false,
        inApp: parsed.notifications?.inApp ?? true,
        builds: parsed.notifications?.builds ?? true,
      },
      apiKey: parsed.apiKey ?? generateKey(),
      plan: parsed.plan ?? "free",
      buildsThisMonth: parsed.buildsThisMonth ?? 3,
    };
  } catch {
    return {
      name: "Developer", email: "dev@example.com", bio: "", avatarUrl: "",
      accentHue: 235, defaultModel: "llama-3.3-70b-versatile", temperature: 0.7,
      notifications: { email: false, inApp: true, builds: true },
      apiKey: generateKey(), plan: "free", buildsThisMonth: 3,
    };
  }
}

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  ACCENT_PRESETS: Record<string, number>;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: loadSettings(),
  updateSettings: () => {},
  ACCENT_PRESETS,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    applyAccentColor(settings.accentHue);
  }, [settings.accentHue]);

  const updateSettings = (patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("sync_settings", JSON.stringify(next));
      if (patch.accentHue !== undefined) applyAccentColor(patch.accentHue);
      return next;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, ACCENT_PRESETS }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);

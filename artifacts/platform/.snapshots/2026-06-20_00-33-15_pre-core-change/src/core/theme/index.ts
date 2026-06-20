/**
 * @protected CORE ENGINE — src/core/theme/index.ts
 * Centralized design token access and accent system.
 * Features should import theme utilities from here, not from lib/ directly.
 * Do not modify without approval.
 */

// Re-export from lib so features use this as the single entry point
export {
  SettingsProvider,
  useSettings,
  applyAccentColor,
  type AppSettings,
} from "@/lib/settings-context";

// ── Design Token Constants ────────────────────────────────────────────────────
// These mirror the CSS custom properties in index.css.
// Use them in TypeScript logic (e.g., chart colors, canvas rendering).

export const THEME_TOKENS = {
  // Base
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  card: "hsl(var(--card))",
  cardForeground: "hsl(var(--card-foreground))",
  popover: "hsl(var(--popover))",
  popoverForeground: "hsl(var(--popover-foreground))",

  // Brand
  primary: "hsl(var(--primary))",
  primaryForeground: "hsl(var(--primary-foreground))",

  // Neutral
  secondary: "hsl(var(--secondary))",
  secondaryForeground: "hsl(var(--secondary-foreground))",
  muted: "hsl(var(--muted))",
  mutedForeground: "hsl(var(--muted-foreground))",
  accent: "hsl(var(--accent))",
  accentForeground: "hsl(var(--accent-foreground))",

  // State
  destructive: "hsl(var(--destructive))",
  destructiveForeground: "hsl(var(--destructive-foreground))",

  // Structure
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",

  // Radii
  radiusSm: "calc(var(--radius) - 4px)",
  radiusMd: "calc(var(--radius) - 2px)",
  radiusLg: "var(--radius)",
  radiusXl: "calc(var(--radius) + 4px)",
} as const;

// ── Accent Presets ─────────────────────────────────────────────────────────────
export const ACCENT_PRESETS = {
  Indigo: 235,
  Violet: 265,
  Emerald: 160,
  Cyan: 195,
  Rose: 345,
  Orange: 25,
  Gold: 45,
  Sky: 210,
} as const;

export type AccentPresetName = keyof typeof ACCENT_PRESETS;

/** Generate the CSS color string for a given hue. */
export function accentColor(hue: number, lightness = 65, saturation = 80): string {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

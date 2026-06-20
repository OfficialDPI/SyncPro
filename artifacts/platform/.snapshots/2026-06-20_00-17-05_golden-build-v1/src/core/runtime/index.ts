/**
 * @protected CORE ENGINE — src/core/runtime/index.ts
 * Platform runtime: version info, environment detection, feature flags.
 * Do not modify without approval.
 */

export const PLATFORM_VERSION = "1.0.0";
export const PLATFORM_NAME = "Sync";
export const PLATFORM_COMPANY = "Demure Platform Inc.";

// ── Environment ───────────────────────────────────────────────────────────────
export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;
export const BASE_URL = import.meta.env.BASE_URL ?? "/";

// ── Feature Flags ─────────────────────────────────────────────────────────────
// Feature flags gate new capabilities without requiring core changes.
// Add new flags here and read them in features via `getFlag()`.
const DEFAULT_FLAGS: Record<string, boolean> = {
  "ai-workspace": false,      // AI sandboxed code generation pipeline
  "deployment": false,        // One-click deploy pipeline
  "voice": false,             // Voice input module
  "video": false,             // Video collaboration module
  "analytics": false,         // Usage analytics dashboard
  "marketplace": false,       // Plugin/feature marketplace
  "multi-workspace": false,   // Multiple workspace support
};

let _flags: Record<string, boolean> = { ...DEFAULT_FLAGS };

/**
 * Get a feature flag value.
 * Flags can be overridden via localStorage for local testing.
 */
export function getFlag(name: string): boolean {
  try {
    const override = localStorage.getItem(`sync_flag_${name}`);
    if (override !== null) return override === "true";
  } catch { /* ignore */ }
  return _flags[name] ?? false;
}

/** Override flags at runtime (dev/testing only). */
export function setFlag(name: string, value: boolean): void {
  if (!IS_DEV) {
    console.warn(`[Runtime] setFlag() is only available in development mode.`);
    return;
  }
  _flags = { ..._flags, [name]: value };
}

/** Return all current feature flag values. */
export function getAllFlags(): Readonly<Record<string, boolean>> {
  return { ..._flags };
}

// ── Build Info ────────────────────────────────────────────────────────────────
export const BUILD_INFO = {
  version: PLATFORM_VERSION,
  name: PLATFORM_NAME,
  company: PLATFORM_COMPANY,
  buildTime: new Date().toISOString(),
  env: IS_PROD ? "production" : "development",
};

/**
 * @protected CORE ENGINE — src/core/sdk/index.ts
 * The public SDK surface exposed to all feature modules.
 *
 * Features MUST use this SDK for cross-cutting concerns.
 * Features MUST NOT import from each other directly.
 * Features MUST NOT import from core internals directly (except @/components/ui).
 *
 * Do not modify without approval.
 */

import { useLocation } from "wouter";
import { useSettings } from "@/lib/settings-context";
import { logger } from "@/core/observability/logger";
import { getFlag, getAllFlags, PLATFORM_VERSION, BUILD_INFO } from "@/core/runtime";

// ── Navigation ────────────────────────────────────────────────────────────────
/**
 * Hook: navigate imperatively within the platform.
 * Features should use this instead of importing wouter directly.
 */
export function useNavigate() {
  const [, setLocation] = useLocation();
  return {
    push: (path: string) => setLocation(path),
    replace: (path: string) => setLocation(path, { replace: true }),
  };
}

/**
 * Hook: get current pathname.
 */
export function useCurrentPath() {
  const [location] = useLocation();
  return location;
}

// ── User & Settings ───────────────────────────────────────────────────────────
/**
 * Hook: access current user settings from any feature.
 */
export { useSettings } from "@/lib/settings-context";

// ── Feature Flags ─────────────────────────────────────────────────────────────
export { getFlag, getAllFlags };

// ── Logging & Observability ───────────────────────────────────────────────────
export { logger };

// ── Platform Info ─────────────────────────────────────────────────────────────
export { PLATFORM_VERSION, BUILD_INFO };

// ── Toast Notifications ───────────────────────────────────────────────────────
// Re-exported through SDK so features don't import from hooks directly
export { useToast } from "@/hooks/use-toast";

// ── Type exports ─────────────────────────────────────────────────────────────
export type { AppSettings } from "@/lib/settings-context";
export type { FeaturePlugin, FeatureRoute, FeatureNavigation } from "@/core/registry/types";

/**
 * @protected CORE ENGINE — src/core/runtime/version-lock.ts
 * Pinned dependency versions. The AI CANNOT modify this file without approval.
 * The check-versions.cjs script reads this and validates installed versions.
 *
 * To upgrade a dependency:
 *   1. Get explicit user approval
 *   2. Update the version here
 *   3. Run: node scripts/check-versions.cjs
 *   4. Run: node scripts/validate-build.cjs
 *   5. Run the dev server to confirm no breakage
 */

export const PINNED_VERSIONS = {
  // Core runtime
  react: "19.x",
  "react-dom": "19.x",
  typescript: "5.x",

  // Build tooling
  vite: "7.x",
  "@vitejs/plugin-react": "4.x",
  "@tailwindcss/vite": "4.x",
  tailwindcss: "4.x",

  // Routing & state
  wouter: "3.x",
  "@tanstack/react-query": "5.x",

  // Runtime utilities
  "lucide-react": "0.x",
  "framer-motion": "12.x",
  zod: "3.x",

  // Node engine constraint
  node: ">=20.0.0",
} as const;

export type PinnedPackageName = keyof typeof PINNED_VERSIONS;

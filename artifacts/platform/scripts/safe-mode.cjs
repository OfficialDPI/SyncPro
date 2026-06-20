#!/usr/bin/env node
/**
 * safe-mode.cjs — Sync Platform Safe Mode Check
 * Determines whether a file path is protected before allowing a write.
 *
 * Usage:
 *   node scripts/safe-mode.cjs <filepath>
 *
 * Returns exit code:
 *   0 = ALLOWED (safe to modify)
 *   1 = BLOCKED (protected file — requires explicit approval)
 *
 * Agents and scripts must call this before writing to any file.
 */

const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// ── Protected file manifest ───────────────────────────────────────────────────
// Any file matching one of these patterns is PROTECTED.
// Globs are matched by prefix (directory) or exact path.

const PROTECTED_EXACT = new Set([
  "src/main.tsx",
  "src/App.tsx",
  "src/index.css",
  "src/core/providers/index.tsx",
  "src/core/router/index.tsx",
  "src/core/registry/types.ts",
  "src/core/registry/feature-registry.ts",
  "src/core/runtime/index.ts",
  "src/core/runtime/version-lock.ts",
  "src/core/theme/index.ts",
  "src/core/sdk/index.ts",
  "src/core/auth/index.tsx",
  "src/core/database/index.ts",
  "src/core/validation/index.ts",
  "src/core/security/index.ts",
  "src/core/observability/logger.ts",
  "src/core/builder/index.ts",
  "src/core/preview/index.ts",
  "src/core/compiler/index.ts",
  "src/core/deployment/index.ts",
  "vite.config.ts",
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "tsconfig.json",
  "tailwind.config.js",
  "postcss.config.js",
  "eslint.config.js",
  "prettier.config.js",
  "index.html",
  ".agents/AGENTS.md",
  "scripts/validate-build.cjs",
  "scripts/safe-mode.cjs",
  "scripts/snapshot.cjs",
  "scripts/restore-snapshot.cjs",
  "scripts/check-versions.cjs",
]);

// Any file under these directory prefixes is PROTECTED
const PROTECTED_PREFIXES = [
  "src/core/",
];

// ── Allowed areas — explicitly safe for AI modification ───────────────────────
const ALWAYS_ALLOWED_PREFIXES = [
  "src/features/",
  "src/pages/",
  "src/components/ui/",
  "src/workspace/sandbox/",
  "src/design-system/",
];

// ── Check ─────────────────────────────────────────────────────────────────────
function normalize(filePath) {
  // Make relative to project root, normalize separators
  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
  return path.relative(ROOT, absolute).replace(/\\/g, "/");
}

function isProtected(relPath) {
  if (PROTECTED_EXACT.has(relPath)) return true;
  if (PROTECTED_PREFIXES.some((p) => relPath.startsWith(p))) return true;
  return false;
}

function isAlwaysAllowed(relPath) {
  return ALWAYS_ALLOWED_PREFIXES.some((p) => relPath.startsWith(p));
}

// ── Main ──────────────────────────────────────────────────────────────────────
const input = process.argv[2];

if (!input) {
  console.log("\n🛡️   Sync Safe Mode Checker\n");
  console.log("  Usage: node scripts/safe-mode.cjs <filepath>\n");
  console.log("  Examples:");
  console.log("    node scripts/safe-mode.cjs src/App.tsx");
  console.log("    node scripts/safe-mode.cjs src/features/home/index.tsx\n");
  process.exit(0);
}

const relPath = normalize(input);

console.log("\n🛡️   Sync Safe Mode Check\n");
console.log(`  File: ${relPath}`);

if (isAlwaysAllowed(relPath)) {
  console.log(`  Status: ✅  ALLOWED — Safe to modify (feature/page/component area)\n`);
  process.exit(0);
}

if (isProtected(relPath)) {
  console.log(`  Status: 🔒  BLOCKED — Protected core file\n`);
  console.log("  To modify this file:");
  console.log("    1. Get explicit user approval");
  console.log("    2. Run: node scripts/snapshot.cjs pre-core-change");
  console.log("    3. Make your change");
  console.log("    4. Run: node scripts/validate-build.cjs");
  console.log("    5. Confirm the dev server still starts\n");
  process.exit(1);
}

console.log(`  Status: ✅  ALLOWED — Not a protected file\n`);
console.log("  Note: Still run validate-build.cjs after your change.\n");
process.exit(0);

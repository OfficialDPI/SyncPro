#!/usr/bin/env node
/**
 * validate-build.js — Sync Platform Build Validator
 * Run before deploying or letting AI modify files.
 *
 * Usage: node scripts/validate-build.js
 * Exit code 0 = OK, 1 = errors found
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

let errors = [];
let warnings = [];

function check(condition, message, isWarning = false) {
  if (!condition) {
    if (isWarning) warnings.push(`⚠  ${message}`);
    else errors.push(`✗  ${message}`);
  }
}

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function fileContains(relPath, pattern) {
  const content = fs.readFileSync(path.join(ROOT, relPath), "utf8");
  return typeof pattern === "string" ? content.includes(pattern) : pattern.test(content);
}

// ── Core file integrity ───────────────────────────────────────────────────────
const LOCKED_CORE_FILES = [
  "src/main.tsx",
  "src/App.tsx",
  "src/index.css",
  "src/core/providers/index.tsx",
  "src/core/router/index.tsx",
  "src/core/registry/types.ts",
  "src/core/registry/feature-registry.ts",
  "vite.config.ts",
  "package.json",
  "tsconfig.json",
  "index.html",
];

LOCKED_CORE_FILES.forEach((f) => {
  check(fileExists(f), `Core file missing: ${f}`);
});

// ── App.tsx must NOT hardcode routes ──────────────────────────────────────────
if (fileExists("src/App.tsx")) {
  const appContent = fs.readFileSync(path.join(ROOT, "src/App.tsx"), "utf8");
  const forbiddenInApp = [
    "import Home from",
    "import Chat from",
    "import Settings from",
    "import Projects from",
    "<Route path=",
    "QueryClient",
    "SettingsProvider",
    "TooltipProvider",
  ];
  forbiddenInApp.forEach((token) => {
    check(
      !appContent.includes(token),
      `App.tsx contains hardcoded dependency "${token}" — move to feature module or CoreProviders`
    );
  });
}

// ── Feature registry must import all plugins ─────────────────────────────────
if (fileExists("src/core/registry/feature-registry.ts")) {
  const reg = fs.readFileSync(path.join(ROOT, "src/core/registry/feature-registry.ts"), "utf8");
  const requiredPlugins = ["homePlugin", "chatPlugin", "projectsPlugin", "settingsPlugin", "staticPagesPlugin"];
  requiredPlugins.forEach((p) => {
    check(reg.includes(p), `Feature registry missing plugin: ${p}`);
  });
}

// ── Feature modules exist ─────────────────────────────────────────────────────
const REQUIRED_FEATURES = ["home", "chat", "projects", "settings", "static-pages"];
REQUIRED_FEATURES.forEach((f) => {
  check(fileExists(`src/features/${f}/index.tsx`), `Feature module missing: src/features/${f}/index.tsx`);
});

// ── CoreProviders must include key providers ──────────────────────────────────
if (fileExists("src/core/providers/index.tsx")) {
  const providers = fs.readFileSync(path.join(ROOT, "src/core/providers/index.tsx"), "utf8");
  ["QueryClientProvider", "SettingsProvider", "TooltipProvider"].forEach((p) => {
    check(providers.includes(p), `CoreProviders is missing: ${p}`);
  });
}

// ── Report ────────────────────────────────────────────────────────────────────
console.log("\n🔍  Sync Build Validator\n");

if (warnings.length > 0) {
  console.log("Warnings:");
  warnings.forEach((w) => console.log("  " + w));
  console.log();
}

if (errors.length === 0) {
  console.log("✅  All checks passed. Build is valid.\n");
  process.exit(0);
} else {
  console.log("Errors:");
  errors.forEach((e) => console.log("  " + e));
  console.log(`\n❌  ${errors.length} error(s) found. Fix them before building.\n`);
  process.exit(1);
}

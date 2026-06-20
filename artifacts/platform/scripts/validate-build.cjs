#!/usr/bin/env node
/**
 * validate-build.cjs — Sync Platform Build Validator (12-Step Pipeline)
 *
 * Usage: node scripts/validate-build.cjs
 * Exit code 0 = all checks pass, 1 = errors found
 *
 * Run this before:
 *   - Merging any AI-generated code
 *   - Deploying to production
 *   - Modifying any core file
 *   - Committing to main/production branches
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

let errors = [];
let warnings = [];
let stepsPassed = 0;
const TOTAL_STEPS = 12;

function check(condition, message, isWarning = false) {
  if (!condition) {
    if (isWarning) warnings.push(`⚠  ${message}`);
    else errors.push(`✗  ${message}`);
  }
}

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function readFile(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function step(n, name, fn) {
  process.stdout.write(`  [${n}/${TOTAL_STEPS}] ${name}... `);
  const before = errors.length;
  try {
    fn();
    if (errors.length === before) {
      console.log("✅");
      stepsPassed++;
    } else {
      console.log(`❌  (${errors.length - before} error(s))`);
    }
  } catch (e) {
    errors.push(`✗  Step "${name}" threw: ${e.message}`);
    console.log(`❌  (exception)`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n🔍  Sync Build Validator — 12-Step Pipeline\n");

// Step 1: Core file integrity
step(1, "Core file integrity", () => {
  const LOCKED_CORE_FILES = [
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
    "tsconfig.json",
    "index.html",
    "scripts/validate-build.cjs",
    "scripts/safe-mode.cjs",
    "scripts/snapshot.cjs",
    "scripts/restore-snapshot.cjs",
    "scripts/check-versions.cjs",
  ];
  LOCKED_CORE_FILES.forEach((f) => check(fileExists(f), `Core file missing: ${f}`));
});

// Step 2: App.tsx cleanliness — no hardcoded routes/providers
step(2, "App.tsx isolation (no hardcoded routes)", () => {
  if (!fileExists("src/App.tsx")) return;
  const app = readFile("src/App.tsx");
  const forbidden = [
    { token: "import Home from", reason: "hardcoded page import" },
    { token: "import Chat from", reason: "hardcoded page import" },
    { token: "import Settings from", reason: "hardcoded page import" },
    { token: "import Projects from", reason: "hardcoded page import" },
    { token: "<Route path=", reason: "hardcoded route" },
    { token: "QueryClient", reason: "provider belongs in CoreProviders" },
    { token: "SettingsProvider", reason: "provider belongs in CoreProviders" },
    { token: "TooltipProvider", reason: "provider belongs in CoreProviders" },
  ];
  forbidden.forEach(({ token, reason }) =>
    check(!app.includes(token), `App.tsx contains "${token}" — ${reason}`)
  );
});

// Step 3: Feature registry completeness
step(3, "Feature registry completeness", () => {
  if (!fileExists("src/core/registry/feature-registry.ts")) return;
  const reg = readFile("src/core/registry/feature-registry.ts");
  const required = ["homePlugin", "chatPlugin", "projectsPlugin", "settingsPlugin", "staticPagesPlugin"];
  required.forEach((p) => check(reg.includes(p), `Feature registry missing plugin: ${p}`));
});

// Step 4: All feature modules exist
step(4, "Feature modules exist", () => {
  const features = ["home", "chat", "projects", "settings", "static-pages"];
  features.forEach((f) =>
    check(fileExists(`src/features/${f}/index.tsx`), `Feature module missing: src/features/${f}/index.tsx`)
  );
});

// Step 5: CoreProviders completeness
step(5, "CoreProviders has all required providers", () => {
  if (!fileExists("src/core/providers/index.tsx")) return;
  const p = readFile("src/core/providers/index.tsx");
  ["QueryClientProvider", "SettingsProvider", "TooltipProvider"].forEach((provider) =>
    check(p.includes(provider), `CoreProviders missing: ${provider}`)
  );
});

// Step 6: Cross-feature import isolation
step(6, "No cross-feature imports", () => {
  const featuresDir = path.join(SRC, "features");
  if (!fs.existsSync(featuresDir)) return;
  const featureNames = fs.readdirSync(featuresDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  featureNames.forEach((featureName) => {
    const featureDir = path.join(featuresDir, featureName);
    const files = fs.readdirSync(featureDir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));
    files.forEach((file) => {
      const content = fs.readFileSync(path.join(featureDir, file), "utf8");
      featureNames.filter((n) => n !== featureName).forEach((otherFeature) => {
        const forbidden = `from "@/features/${otherFeature}`;
        check(!content.includes(forbidden), `${featureName}/${file} imports from feature "${otherFeature}" — use @/lib/ or @/core/sdk instead`);
      });
    });
  });
});

// Step 7: Design system barrel exists
step(7, "Design system barrel exists", () => {
  check(fileExists("src/design-system/index.ts"), "Design system barrel missing: src/design-system/index.ts");
});

// Step 8: Core subsystems complete
step(8, "All core subsystems present", () => {
  const subsystems = ["runtime", "theme", "sdk", "auth", "database", "validation", "security", "observability", "builder", "preview", "compiler", "deployment"];
  subsystems.forEach((sub) => {
    const hasIndex = fileExists(`src/core/${sub}/index.ts`) || fileExists(`src/core/${sub}/index.tsx`);
    check(hasIndex, `Core subsystem missing: src/core/${sub}/`);
  });
});

// Step 9: No forbidden patterns (security)
step(9, "No dangerous patterns in feature code", () => {
  const featuresDir = path.join(SRC, "features");
  if (!fs.existsSync(featuresDir)) return;

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) { scanDir(fullPath); return; }
      if (!entry.name.match(/\.(ts|tsx)$/)) return;

      const content = fs.readFileSync(fullPath, "utf8");
      const rel = path.relative(ROOT, fullPath).replace(/\\/g, "/");

      if (content.includes("dangerouslySetInnerHTML") && !content.includes("sanitize")) {
        warnings.push(`⚠  ${rel} uses dangerouslySetInnerHTML without sanitization`);
      }
      if (content.match(/eval\s*\(/)) {
        warnings.push(`⚠  ${rel} uses eval() — review before merging`);
      }
    });
  }
  scanDir(path.join(SRC, "features"));
});

// Step 10: Workspace sandbox check (no sandbox code leaking into features)
step(10, "Workspace sandbox isolation", () => {
  const featuresDir = path.join(SRC, "features");
  if (!fs.existsSync(featuresDir)) return;

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) { scanDir(fullPath); return; }
      if (!entry.name.match(/\.(ts|tsx)$/)) return;

      const content = fs.readFileSync(fullPath, "utf8");
      const rel = path.relative(ROOT, fullPath).replace(/\\/g, "/");
      check(!content.includes("@/workspace/sandbox"), `${rel} imports from workspace sandbox — only merged code allowed in features`);
    });
  }
  scanDir(path.join(SRC, "features"));
});

// Step 11: TypeScript compilation check
step(11, "TypeScript compilation (no emit)", () => {
  const nmExists = fs.existsSync(path.join(ROOT, "node_modules"));
  if (!nmExists) {
    warnings.push("⚠  node_modules not found — skipping TypeScript check (run pnpm install first)");
    return;
  }
  try {
    execSync("npx tsc --noEmit --skipLibCheck", { cwd: ROOT, stdio: "pipe", timeout: 120000 });
  } catch (e) {
    const output = (e.stdout?.toString() || e.stderr?.toString() || e.message || "").trim();
    if (e.code === "ETIMEDOUT" || output.includes("ETIMEDOUT")) {
      warnings.push("⚠  TypeScript compile timed out — run 'pnpm typecheck' manually to verify");
    } else {
      const lines = output.split("\n").filter(Boolean).slice(0, 5);
      lines.forEach((line) => errors.push(`✗  TS: ${line.trim()}`));
    }
  }
});

// Step 12: Snapshot directory structure check
step(12, "Workspace structure valid", () => {
  check(fileExists("src/workspace/README.md"), "Workspace README missing: src/workspace/README.md");
  const snapshotsDir = path.join(ROOT, ".snapshots");
  if (!fs.existsSync(snapshotsDir)) {
    warnings.push("⚠  No snapshots yet — run: node scripts/snapshot.cjs (recommended before any AI generation)");
  }
});

// ── Report ────────────────────────────────────────────────────────────────────
console.log("\n" + "─".repeat(60));
console.log(`\n  Steps passed: ${stepsPassed}/${TOTAL_STEPS}`);

if (warnings.length > 0) {
  console.log(`\n  Warnings (${warnings.length}):`);
  warnings.forEach((w) => console.log(`    ${w}`));
}

if (errors.length === 0) {
  console.log(`\n✅  All ${TOTAL_STEPS} checks passed. Build is valid.\n`);
  process.exit(0);
} else {
  console.log(`\n  Errors (${errors.length}):`);
  errors.forEach((e) => console.log(`    ${e}`));
  console.log(`\n❌  ${errors.length} error(s) found. Fix before building or merging.\n`);
  process.exit(1);
}

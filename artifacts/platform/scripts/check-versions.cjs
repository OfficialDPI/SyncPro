#!/usr/bin/env node
/**
 * check-versions.cjs — Sync Platform Version Pin Validator
 * Reads installed package versions from node_modules and compares
 * them against the pinned versions in src/core/runtime/version-lock.ts.
 *
 * Usage: node scripts/check-versions.cjs
 * Exit code 0 = all versions within pinned range, 1 = violations found
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const NM = path.join(ROOT, "node_modules");

// ── Pinned versions (must match version-lock.ts) ──────────────────────────────
// Semver major.x means "any version of this major"
const PINNED = {
  react: "19.x",
  "react-dom": "19.x",
  vite: "7.x",
  tailwindcss: "4.x",
  wouter: "3.x",
  "lucide-react": "0.x",
  "framer-motion": "12.x",
  zod: "3.x",
  "@tanstack/react-query": "5.x",
};

function getInstalledVersion(pkgName) {
  try {
    const pkgPath = path.join(NM, pkgName, "package.json");
    if (!fs.existsSync(pkgPath)) return null;
    return JSON.parse(fs.readFileSync(pkgPath, "utf8")).version;
  } catch {
    return null;
  }
}

function parseMajor(versionStr) {
  if (!versionStr) return null;
  const match = versionStr.replace(/^[^0-9]*/, "").match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function parseExpectedMajor(pin) {
  // "19.x" → 19
  const match = pin.match(/^(\d+)\./);
  return match ? parseInt(match[1], 10) : null;
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log("\n🔢  Sync Version Pin Validator\n");

let errors = [];
let ok = [];
let missing = [];

for (const [pkg, pin] of Object.entries(PINNED)) {
  const installed = getInstalledVersion(pkg);

  if (!installed) {
    missing.push({ pkg, pin });
    continue;
  }

  const installedMajor = parseMajor(installed);
  const expectedMajor = parseExpectedMajor(pin);

  if (expectedMajor !== null && installedMajor !== expectedMajor) {
    errors.push({ pkg, pin, installed, installedMajor, expectedMajor });
  } else {
    ok.push({ pkg, installed, pin });
  }
}

// ── Report ─────────────────────────────────────────────────────────────────
if (ok.length > 0) {
  console.log("  ✅ Pinned packages (correct major version):\n");
  ok.forEach(({ pkg, installed, pin }) => {
    console.log(`    ${pkg.padEnd(30)} installed: ${installed.padEnd(12)} pinned: ${pin}`);
  });
}

if (missing.length > 0) {
  console.log("\n  ⚠️  Not installed (may be in node_modules under a scope):\n");
  missing.forEach(({ pkg, pin }) => {
    console.log(`    ${pkg.padEnd(30)} pinned: ${pin}  (not found in node_modules)`);
  });
}

if (errors.length > 0) {
  console.log("\n  ❌ Version mismatches:\n");
  errors.forEach(({ pkg, installed, pin }) => {
    console.log(`    ${pkg.padEnd(30)} installed: ${installed.padEnd(12)} pinned: ${pin}`);
  });
  console.log(`\n  ❌  ${errors.length} version mismatch(es). Update version-lock.ts or downgrade packages.\n`);
  process.exit(1);
}

console.log("\n  ✅  All installed versions match pinned requirements.\n");
process.exit(0);

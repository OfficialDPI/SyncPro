#!/usr/bin/env node
/**
 * restore-snapshot.cjs — Sync Platform Snapshot Restore
 * Restores src/ from a named snapshot, replacing the current state.
 *
 * Usage:
 *   node scripts/restore-snapshot.cjs               (lists available snapshots)
 *   node scripts/restore-snapshot.cjs <snapshot-id>  (restores that snapshot)
 *
 * ⚠️  This operation OVERWRITES your current src/ directory.
 *     Create a new snapshot first if you want to save current state.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src");
const SNAPSHOTS_DIR = path.join(ROOT, ".snapshots");

function deleteDirRecursive(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirRecursive(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

function listSnapshots() {
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    console.log("  No snapshots found. Run: node scripts/snapshot.cjs");
    return [];
  }
  const entries = fs.readdirSync(SNAPSHOTS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      try {
        const manifest = JSON.parse(
          fs.readFileSync(path.join(SNAPSHOTS_DIR, e.name, "manifest.json"), "utf8")
        );
        return { id: e.name, ...manifest };
      } catch {
        return { id: e.name, label: "unknown", timestamp: "unknown", files: "?" };
      }
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return entries;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const snapshotId = process.argv[2];

console.log("\n🔄  Sync Snapshot Restore\n");

if (!snapshotId) {
  const snapshots = listSnapshots();
  if (snapshots.length === 0) { process.exit(1); }

  console.log("  Available snapshots (newest first):\n");
  snapshots.slice(0, 10).forEach((s, i) => {
    console.log(`  [${i + 1}] ${s.id}`);
    console.log(`      Label: ${s.label} | Files: ${s.files} | Time: ${s.timestamp}`);
  });

  console.log(`\n  Usage: node scripts/restore-snapshot.cjs <snapshot-id>\n`);
  process.exit(0);
}

const snapshotSrc = path.join(SNAPSHOTS_DIR, snapshotId, "src");
if (!fs.existsSync(snapshotSrc)) {
  console.error(`\n❌  Snapshot not found: ${snapshotId}\n`);
  process.exit(1);
}

const manifest = JSON.parse(
  fs.readFileSync(path.join(SNAPSHOTS_DIR, snapshotId, "manifest.json"), "utf8")
);

console.log(`  Restoring:  ${snapshotId}`);
console.log(`  Label:      ${manifest.label}`);
console.log(`  Captured:   ${manifest.timestamp}`);
console.log(`  Files:      ${manifest.files}`);
console.log(`\n  ⚠️  This will OVERWRITE your current src/ directory.`);
console.log(`  Create a snapshot first if you want to save current state:\n`);
console.log(`      node scripts/snapshot.cjs pre-restore\n`);

// Confirm
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("  Type YES to confirm restore: ", (answer) => {
  rl.close();
  if (answer.trim().toUpperCase() !== "YES") {
    console.log("\n  Restore cancelled.\n");
    process.exit(0);
  }

  console.log("\n  Restoring...");
  deleteDirRecursive(SRC_DIR);
  copyDirRecursive(snapshotSrc, SRC_DIR);

  console.log(`\n✅  Restore complete. src/ has been restored to snapshot "${snapshotId}".\n`);
  console.log(`  Run: node scripts/validate-build.cjs  to verify integrity.\n`);
  process.exit(0);
});

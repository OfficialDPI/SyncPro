#!/usr/bin/env node
/**
 * snapshot.cjs — Sync Platform Snapshot System
 * Creates a timestamped snapshot of src/ before any AI modification.
 *
 * Usage: node scripts/snapshot.cjs [label]
 * Example: node scripts/snapshot.cjs "before-chat-feature"
 *
 * Snapshots are stored in .snapshots/ at the project root.
 * Use restore-snapshot.cjs to roll back.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src");
const SNAPSHOTS_DIR = path.join(ROOT, ".snapshots");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyDirRecursive(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function countFiles(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) count += countFiles(path.join(dir, entry.name));
    else count++;
  }
  return count;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const label = process.argv[2] || "manual";
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
const snapshotName = `${timestamp}_${label.replace(/[^a-z0-9-_]/gi, "_")}`;
const snapshotDir = path.join(SNAPSHOTS_DIR, snapshotName);

console.log("\n📸  Sync Snapshot System\n");
console.log(`  Label:     ${label}`);
console.log(`  Snapshot:  ${snapshotName}`);

ensureDir(SNAPSHOTS_DIR);
copyDirRecursive(SRC_DIR, path.join(snapshotDir, "src"));

// Write manifest
const manifest = {
  id: snapshotName,
  label,
  timestamp: new Date().toISOString(),
  files: countFiles(path.join(snapshotDir, "src")),
  srcPath: SRC_DIR,
};
fs.writeFileSync(path.join(snapshotDir, "manifest.json"), JSON.stringify(manifest, null, 2));

console.log(`  Files:     ${manifest.files} files captured`);
console.log(`  Location:  .snapshots/${snapshotName}/`);
console.log(`\n✅  Snapshot created. To restore: node scripts/restore-snapshot.cjs ${snapshotName}\n`);

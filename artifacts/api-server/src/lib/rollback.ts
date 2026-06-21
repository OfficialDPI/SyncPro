import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

const WORKSPACE_ROOT = path.resolve(process.cwd(), "..", "user-workspaces");

export async function createWorkspaceSnapshot(workspaceId: number): Promise<string | null> {
  const src = path.join(WORKSPACE_ROOT, String(workspaceId));
  const dest = path.join(WORKSPACE_ROOT, `${workspaceId}-backup`);
  
  if (!fsSync.existsSync(src)) {
    return null;
  }
  
  try {
    await fs.rm(dest, { recursive: true, force: true });
    await fs.cp(src, dest, { recursive: true });
    return dest;
  } catch (err) {
    console.error(`Failed to create snapshot for workspace ${workspaceId}:`, err);
    return null;
  }
}

export async function restoreWorkspaceSnapshot(workspaceId: number): Promise<boolean> {
  const src = path.join(WORKSPACE_ROOT, `${workspaceId}-backup`);
  const dest = path.join(WORKSPACE_ROOT, String(workspaceId));
  
  if (!fsSync.existsSync(src)) {
    return false;
  }
  
  try {
    await fs.rm(dest, { recursive: true, force: true });
    await fs.rename(src, dest);
    return true;
  } catch (err) {
    console.error(`Failed to restore snapshot for workspace ${workspaceId}:`, err);
    return false;
  }
}

export async function discardWorkspaceSnapshot(workspaceId: number): Promise<void> {
  const backupPath = path.join(WORKSPACE_ROOT, `${workspaceId}-backup`);
  try {
    await fs.rm(backupPath, { recursive: true, force: true });
  } catch (err) {
    console.error(`Failed to discard snapshot for workspace ${workspaceId}:`, err);
  }
}

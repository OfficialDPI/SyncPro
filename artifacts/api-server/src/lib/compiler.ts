import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function installDependencies(projectPath: string, logCallback?: (msg: string) => void): Promise<boolean> {
  if (logCallback) logCallback("Installing dependencies (pnpm install)...");
  
  try {
    await execAsync("pnpm install --ignore-workspace --dangerously-allow-all-builds", { cwd: projectPath, timeout: 300000 });
    if (logCallback) logCallback("Dependencies installed successfully!");
    return true;
  } catch (err: any) {
    if (logCallback) logCallback(`Warning: pnpm install failed, trying npm install... Error: ${err.message}`);
    try {
      await execAsync("npm install", { cwd: projectPath, timeout: 300000 });
      if (logCallback) logCallback("Dependencies installed successfully via npm!");
      return true;
    } catch (npmErr: any) {
      if (logCallback) logCallback(`Error: npm install failed. Error: ${npmErr.message}`);
      return false;
    }
  }
}

export async function compileBuild(projectPath: string, logCallback?: (msg: string) => void): Promise<{ success: boolean; error: string }> {
  if (logCallback) logCallback("Running compile and build tests...");
  
  // 1. Run Prettier format before building
  try {
    await execAsync("pnpm exec prettier --write .", { cwd: projectPath, timeout: 30000 });
  } catch (prettierErr: any) {
    const errorMsg = `Formatting Error: Prettier failed to format files due to a syntax error:\n${prettierErr.stderr || prettierErr.message}`;
    if (logCallback) logCallback(errorMsg);
    return { success: false, error: errorMsg };
  }

  // 2. Run pnpm build compilation
  try {
    await execAsync("pnpm run build", {
      cwd: projectPath,
      timeout: 120000,
      env: {
        ...process.env,
        PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN: "false"
      }
    });
    if (logCallback) logCallback("Compilation and build successful!");
    return { success: true, error: "" };
  } catch (buildErr: any) {
    const lastBuildError = buildErr.stderr || buildErr.stdout || buildErr.message || "Unknown build error";
    if (logCallback) logCallback(`Compilation failed:\n${lastBuildError}`);
    return { success: false, error: lastBuildError };
  }
}

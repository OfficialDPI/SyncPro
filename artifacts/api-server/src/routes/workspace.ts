import { Router } from "express";
import fs from "fs/promises";
import path from "path";

const router = Router();

// Define the root directory for user workspaces
const WORKSPACE_ROOT = path.resolve(process.cwd(), "..", "user-workspaces");

// Ensure the root exists
fs.mkdir(WORKSPACE_ROOT, { recursive: true }).catch(console.error);

function getProjectPath(projectId: string) {
  return path.join(WORKSPACE_ROOT, projectId);
}

// Ensure the path is within the project directory to prevent directory traversal
function getSafePath(projectId: string, relativePath: string) {
  const projectPath = getProjectPath(projectId);
  const absolutePath = path.resolve(projectPath, relativePath.replace(/^\/+/, ""));
  if (!absolutePath.startsWith(projectPath)) {
    throw new Error("Invalid path");
  }
  return absolutePath;
}

// GET /api/workspace/:projectId/files - Recursively list files
router.get("/api/workspace/:projectId/files", async (req, res) => {
  try {
    const projectPath = getProjectPath(req.params.projectId);
    
    try {
      await fs.access(projectPath);
    } catch {
      // If project directory doesn't exist, return empty
      res.json([]);
      return;
    }

    const getFiles = async (dir: string, baseDir: string): Promise<any[]> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const files = await Promise.all(
        entries.map(async (entry) => {
          const resPath = path.join(dir, entry.name);
          const relativePath = path.relative(baseDir, resPath).replace(/\\/g, "/");
          
          if (entry.isDirectory()) {
            return {
              name: entry.name,
              path: relativePath,
              type: "directory",
              children: await getFiles(resPath, baseDir)
            };
          } else {
            return {
              name: entry.name,
              path: relativePath,
              type: "file"
            };
          }
        })
      );
      return files.flat();
    };

    const files = await getFiles(projectPath, projectPath);
    res.json(files);
  } catch (error: any) {
    console.error("Error listing files:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/workspace/:projectId/file?path=... - Read file content
router.get("/api/workspace/:projectId/file", async (req, res) => {
  try {
    const relativePath = req.query.path as string;
    if (!relativePath) {
      res.status(400).json({ error: "Path required" });
      return;
    }

    const safePath = getSafePath(req.params.projectId, relativePath);
    const content = await fs.readFile(safePath, "utf-8");
    res.json({ content });
  } catch (error: any) {
    console.error("Error reading file:", error);
    res.status(404).json({ error: "File not found" });
  }
});

// POST /api/workspace/:projectId/file - Write file content
router.post("/api/workspace/:projectId/file", async (req, res) => {
  try {
    const { path: relativePath, content } = req.body;
    if (!relativePath || content === undefined) {
      res.status(400).json({ error: "Path and content required" });
      return;
    }

    const safePath = getSafePath(req.params.projectId, relativePath);
    
    // Create directories if they don't exist
    await fs.mkdir(path.dirname(safePath), { recursive: true });
    
    await fs.writeFile(safePath, content, "utf-8");
    res.json({ success: true, path: relativePath });
  } catch (error: any) {
    console.error("Error writing file:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

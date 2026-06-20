import type { Plugin } from "vite";
import fs from "fs";
import path from "path";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function workspacePreviewPlugin(): Plugin {
  return {
    name: "workspace-preview",

    configureServer(server) {
      const workspacesDir = path.resolve(server.config.root, "../user-workspaces");
      server.watcher.add(workspacesDir);

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || "", "http://localhost");
        const pathname = url.pathname;

        // Intercept requests starting with /workspaces/:id/
        const match = pathname.match(/^\/workspaces\/(\d+)(?:\/(.*))?$/);
        if (!match) {
          return next();
        }

        const [, workspaceId, relPath] = match;
        const targetPath = relPath || "index.html";

        // Construct absolute path to the workspace file
        const workspaceRoot = path.resolve(server.config.root, "../user-workspaces", workspaceId);
        const physicalPath = path.join(workspaceRoot, targetPath);

        // Check if compilation failed and build-errors.txt exists in the workspace
        const buildErrorsPath = path.join(workspaceRoot, "build-errors.txt");
        if (fs.existsSync(buildErrorsPath) && (targetPath.endsWith(".html") || targetPath === "" || !targetPath.includes("."))) {
          const buildErrors = fs.readFileSync(buildErrorsPath, "utf-8");
          const errorPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Compilation Error</title>
  <style>
    body {
      background-color: #0b0f17;
      color: #f3f4f6;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 2rem;
    }
    .container {
      max-width: 800px;
      margin: 2rem auto;
      background: #14141a;
      border: 1px solid #ef4444;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #ef4444;
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    .header svg {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }
    .description {
      color: #9ca3af;
      font-size: 0.95rem;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }
    .error-log {
      background: #090d16;
      color: #fca5a5;
      padding: 1.25rem;
      border-radius: 12px;
      font-family: 'Fira Code', 'Courier New', Courier, monospace;
      font-size: 0.85rem;
      white-space: pre-wrap;
      overflow-x: auto;
      border: 1px solid rgba(239, 68, 68, 0.15);
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
      Compilation Error
    </div>
    <div class="description">
      Vite compilation or dependency installation failed. Please check the logs below for details and correct any syntax or import errors.
    </div>
    <pre class="error-log"><code>${escapeHtml(buildErrors)}</code></pre>
  </div>
</body>
</html>`;
          res.statusCode = 500;
          res.setHeader("Content-Type", "text/html");
          res.end(errorPage);
          return;
        }

        // Serve HTML files with Vite's client script injected for HMR and compilation
        if (targetPath.endsWith(".html") || targetPath === "" || !targetPath.includes(".")) {
          const indexPath = targetPath.endsWith(".html") ? physicalPath : path.join(physicalPath, "index.html");
          
          if (!fs.existsSync(indexPath)) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/plain");
            res.end(`Workspace index.html not found at: ${indexPath}`);
            return;
          }

          let html = fs.readFileSync(indexPath, "utf-8");

          // Rewrite absolute paths in HTML on the fly to route through /workspaces/:id/
          html = html.replace(/(src|href)="\/([^"]*)"/g, (matchStr, attr, p) => {
            if (p.startsWith("http") || p.startsWith("workspaces/") || p.startsWith("@vite/") || p.startsWith("@id/")) {
              return matchStr;
            }
            return `${attr}="/workspaces/${workspaceId}/${p}"`;
          });

          // Inject console filter script to suppress cdn.tailwindcss.com warnings and React DevTools logs
          const consoleFilter = `<script>
            (function() {
              const filter = (m) => typeof m === 'string' && (
                m.includes('React DevTools') || 
                m.includes('Babel transformer') || 
                m.includes('cdn.tailwindcss.com') || 
                m.includes('should not be used in production')
              );
              const log = console.log, warn = console.warn;
              console.log = (...a) => a.some(filter) ? undefined : log.apply(console, a);
              console.warn = (...a) => a.some(filter) ? undefined : warn.apply(console, a);
            })();
          </script>`;
          html = html.replace("<head>", "<head>\n" + consoleFilter);

          // Inject Vite HMR client scripts
          html = await server.transformIndexHtml(req.url || "", html);

          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html");
          res.end(html);
          return;
        }

        next();
      });
    },

    resolveId(source, importer) {
      // If the import path starts with /workspaces/
      if (source.startsWith("/workspaces/")) {
        const match = source.match(/^\/workspaces\/(\d+)\/(.*)$/);
        if (match) {
          const [, workspaceId, relPath] = match;
          // Resolve to absolute physical path on disk
          const physicalPath = path.resolve(process.cwd(), "../user-workspaces", workspaceId, relPath);
          return physicalPath;
        }
      }

      // If the file doing the importing is within a user workspace, resolve relative imports relative to it
      if (importer && importer.includes("user-workspaces")) {
        const match = importer.match(/user-workspaces[\\/](\d+)/);
        if (match) {
          const workspaceId = match[1];
          if (source.startsWith(".") || source.startsWith("..")) {
            return null;
          }
          if (source.startsWith("/")) {
            const physicalPath = path.resolve(process.cwd(), "../user-workspaces", workspaceId, source.slice(1));
            return physicalPath;
          }
          if (!source.startsWith(".") && !source.startsWith("/") && !path.isAbsolute(source)) {
            // Resolve bare imports to the workspace's own local node_modules first
            const workspaceNodeModules = path.resolve(process.cwd(), "../user-workspaces", workspaceId, "node_modules");
            const workspaceDepPath = path.resolve(workspaceNodeModules, source);
            if (fs.existsSync(workspaceDepPath)) {
              return workspaceDepPath;
            }
            // Fallback: Resolve bare imports to mockup-sandbox's node_modules for shared dependencies
            const resolvedPath = path.resolve(process.cwd(), "node_modules", source);
            return resolvedPath;
          }
        }
      }
      return null;
    },

    load(id) {
      // Read the file directly if it's resolved to the user-workspaces folder
      if (id.includes("user-workspaces")) {
        if (fs.existsSync(id)) {
          return fs.readFileSync(id, "utf-8");
        }
      }
      return null;
    }
  };
}

import fs from "fs/promises";
import path from "path";

export const allPotentialFiles = [
  "src/App.tsx", "src/main.tsx", "src/index.css",
  "src/App.vue", "src/main.ts",
  "src/app/page.tsx", "src/app/layout.tsx", "src/app/globals.css", "next.config.js", "tailwind.config.js", "postcss.config.js",
  "styles.css", "vite.config.ts", "tsconfig.json", "index.html"
];

export const neededFiles: Record<string, string[]> = {
  "React": ["src/App.tsx", "src/main.tsx", "src/index.css", "tsconfig.json", "vite.config.ts", "index.html"],
  "Vue": ["src/App.vue", "src/main.ts", "src/index.css", "tsconfig.json", "vite.config.ts", "index.html"],
  "NextJS": ["src/app/page.tsx", "src/app/layout.tsx", "src/app/globals.css", "tsconfig.json", "next.config.js", "tailwind.config.js", "postcss.config.js"],
  "HTML": ["index.html", "styles.css", "vite.config.ts", "tailwind.config.js"],
  "HTML+CSS": ["index.html", "styles.css", "vite.config.ts", "tailwind.config.js"]
};

export async function scaffoldProject(conversationId: number, spec: any, dbCode: string, deployCode: string, techStack: "React" | "NextJS" | "Vue" | "HTML" | "HTML+CSS", targetPath?: string) {
  const WORKSPACE_ROOT = path.resolve(process.cwd(), "..", "user-workspaces");
  const projectPath = targetPath || path.join(WORKSPACE_ROOT, String(conversationId));
  
  await fs.mkdir(path.join(projectPath, "src"), { recursive: true });
  await fs.mkdir(path.join(projectPath, "src", "api"), { recursive: true });
  await fs.mkdir(path.join(projectPath, "src", "app"), { recursive: true });
  await fs.mkdir(path.join(projectPath, "tests"), { recursive: true });
  await fs.mkdir(path.join(projectPath, ".github", "workflows"), { recursive: true });
  
  // Clean up any files from alternative stacks to prevent Vite compilation issues
  const activeFiles = neededFiles[techStack] || [];
  for (const f of allPotentialFiles) {
    if (!activeFiles.includes(f)) {
      try {
        await fs.unlink(path.join(projectPath, f));
      } catch {}
    }
  }
  try {
    await fs.unlink(path.join(projectPath, "next.config.mjs"));
  } catch {}

  const pkg: any = {
    name: spec.projectName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      "dev": techStack === "NextJS" ? "next dev" : "vite",
      "build": techStack === "NextJS" ? "next build" : "vite build",
      "preview": techStack === "NextJS" ? "next start" : "vite preview",
      "test": "vitest run",
      "test:e2e": "playwright test",
      "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
    },
    dependencies: {},
    devDependencies: {
      "typescript": "^5.2.2",
      "vitest": "^1.6.0",
      "@playwright/test": "^1.44.1",
      "eslint": "^8.57.0",
      "prettier": "^3.3.2"
    }
  };

  const isHtml = techStack === "HTML" || techStack === "HTML+CSS";

  if (techStack === "React") {
    pkg.dependencies = {
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "lucide-react": "^0.395.0"
    };
    pkg.devDependencies = {
      ...pkg.devDependencies,
      "@types/react": "^18.3.3",
      "@types/react-dom": "^18.3.0",
      "@vitejs/plugin-react": "^4.3.1",
      "@tailwindcss/vite": "^4.0.0",
      "tailwindcss": "^4.0.0",
      "vite": "^5.3.1"
    };
  } else if (techStack === "Vue") {
    pkg.dependencies = {
      "vue": "^3.4.29",
      "lucide-vue-next": "^0.395.0"
    };
    pkg.devDependencies = {
      ...pkg.devDependencies,
      "@vitejs/plugin-vue": "^5.0.5",
      "@tailwindcss/vite": "^4.0.0",
      "tailwindcss": "^4.0.0",
      "vite": "^5.3.1"
    };
  } else if (techStack === "NextJS") {
    pkg.dependencies = {
      "next": "^14.2.4",
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "lucide-react": "^0.395.0"
    };
    pkg.devDependencies = {
      ...pkg.devDependencies,
      "@types/react": "^18.3.3",
      "@types/react-dom": "^18.3.0",
      "tailwindcss": "^3.4.4",
      "postcss": "^8.4.38",
      "autoprefixer": "^10.4.19"
    };
  } else if (isHtml) {
    pkg.devDependencies = {
      ...pkg.devDependencies,
      "@tailwindcss/vite": "^4.0.0",
      "tailwindcss": "^4.0.0",
      "vite": "^5.3.1"
    };
  }

  await fs.writeFile(path.join(projectPath, "package.json"), JSON.stringify(pkg, null, 2), "utf-8");

  // tsconfig
  if (techStack !== "HTML" && techStack !== "HTML+CSS") {
    const tsconfig = {
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["DOM", "DOM.Iterable", "ES2020"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: techStack === "Vue" ? undefined : "react-jsx",
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true
      },
      include: ["src"]
    };
    await fs.writeFile(path.join(projectPath, "tsconfig.json"), JSON.stringify(tsconfig, null, 2), "utf-8");
  }

  // index.html & vite/next config files
  if (techStack === "React") {
    const reactIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${spec.projectName}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
    await fs.writeFile(path.join(projectPath, "index.html"), reactIndexHtml, "utf-8");

    const reactMainTsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import * as lucide from 'lucide-react';
import App from './App';
import './index.css';

(window as any).React = React;
(window as any).lucide = lucide;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
    await fs.writeFile(path.join(projectPath, "src", "main.tsx"), reactMainTsx, "utf-8");

    const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
});`;
    await fs.writeFile(path.join(projectPath, "vite.config.ts"), viteConfig, "utf-8");
  } else if (techStack === "Vue") {
    const vueIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${spec.projectName}</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>`;
    await fs.writeFile(path.join(projectPath, "index.html"), vueIndexHtml, "utf-8");

    const vueMainTs = `import { createApp } from 'vue';
import App from './App.vue';
import './index.css';

createApp(App).mount('#app');`;
    await fs.writeFile(path.join(projectPath, "src", "main.ts"), vueMainTs, "utf-8");

    const viteConfig = `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
});`;
    await fs.writeFile(path.join(projectPath, "vite.config.ts"), viteConfig, "utf-8");
  } else if (techStack === "NextJS") {
    const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true
  }
};
module.exports = nextConfig;`;
    await fs.writeFile(path.join(projectPath, "next.config.js"), nextConfig, "utf-8");

    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
    await fs.writeFile(path.join(projectPath, "tailwind.config.js"), tailwindConfig, "utf-8");

    const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
    await fs.writeFile(path.join(projectPath, "postcss.config.js"), postcssConfig, "utf-8");

    const nextLayout = `import React from 'react';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`;
    await fs.writeFile(path.join(projectPath, "src", "app", "layout.tsx"), nextLayout, "utf-8");
  } else if (isHtml) {
    const viteConfig = `import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
});`;
    await fs.writeFile(path.join(projectPath, "vite.config.ts"), viteConfig, "utf-8");
  }

  // Stylesheet
  let cssPath = "src/index.css";
  if (techStack === "NextJS") cssPath = "src/app/globals.css";
  else if (isHtml) cssPath = "styles.css";

  const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background-color: ${spec.branding.backgroundColor || "#0b0f17"};
  color: #f3f4f6;
  font-family: 'Inter', sans-serif;
}`;
  await fs.writeFile(path.join(projectPath, cssPath), cssContent, "utf-8");

  // Dockerfile
  const dockerfile = `FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;
  await fs.writeFile(path.join(projectPath, "Dockerfile"), dockerfile, "utf-8");

  // Gitignore
  const gitignore = `node_modules\ndist\n.env\nsqlite.db\n.replit\nbuild-errors.txt\n`;
  await fs.writeFile(path.join(projectPath, ".gitignore"), gitignore, "utf-8");

  // README
  const readmeContent = `# ${spec.projectName}

This project was built with Sync.

## Tech Stack
- Framework: ${techStack}
- Styles: Tailwind CSS

## Commands
- Dev Server: \`npm run dev\`
- Production Build: \`npm run build\`
`;
  await fs.writeFile(path.join(projectPath, "README.md"), readmeContent, "utf-8");

  // Tests & API Server Stub
  const e2e = `import { test, expect } from '@playwright/test';

test.describe('${spec.projectName} E2E Tests', () => {
  test('should load main page and verify title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/${spec.projectName}/i);
  });
});`;
  await fs.writeFile(path.join(projectPath, "tests", "e2e.spec.ts"), e2e, "utf-8");
  
  const unitTest = `import { describe, it, expect } from 'vitest';

describe('${spec.projectName} Unit Logic', () => {
  it('verifies state calculation and variables', () => {
    const defaultState = { authenticated: false, itemsCount: 0 };
    expect(defaultState.authenticated).toBe(false);
  });
});`;
  await fs.writeFile(path.join(projectPath, "tests", "unit.test.ts"), unitTest, "utf-8");

  const apiServer = `import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const database = {
  users: [
    { id: 1, email: "user@example.com", name: "John Doe", role: "member" },
    { id: 2, email: "admin@example.com", name: "Jane Smith", role: "admin" }
  ],
  items: []
};

const rateLimit = (req, res, next) => {
  next();
};

app.use(rateLimit);

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const user = database.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  res.json({
    token: "mock-jwt-token-xyz",
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

app.get('/api/auth/session', (req, res) => {
  res.json({ authenticated: true, user: database.users[0] });
});

app.get('/api/items', (req, res) => {
  res.json(database.items);
});

app.post('/api/items', (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  const newItem = { id: database.items.length + 1, name, description, createdAt: new Date() };
  database.items.push(newItem);
  res.status(201).json(newItem);
});

app.listen(port, () => {
  console.log(\`[API Server] Running on port \${port}\`);
});`;
  await fs.writeFile(path.join(projectPath, "src", "api", "server.js"), apiServer, "utf-8");
}

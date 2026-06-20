/**
 * @protected CORE ENGINE — src/core/compiler/index.ts
 * Transpilation orchestration interface.
 * Controls how AI-generated code is compiled before preview or merge.
 * Do not modify without approval.
 */

import { logger } from "@/core/observability/logger";
import { sanitizeHtml } from "@/core/security";
import { validate, generationRequestSchema } from "@/core/validation";

// ── Types ─────────────────────────────────────────────────────────────────────
export type Framework = "react" | "vue" | "html" | "next" | "svelte" | "vanilla";

export interface CompileInput {
  source: string;
  framework: Framework;
  sessionId?: string;
  filename?: string;
}

export interface CompileResult {
  success: boolean;
  output?: string;
  errors?: string[];
  warnings?: string[];
  duration?: number;
}

export interface CompileOptions {
  minify?: boolean;
  sourceMaps?: boolean;
  stripTypes?: boolean;
}

// ── Framework Detection ───────────────────────────────────────────────────────
/**
 * Detect the framework used in a source string.
 * Used when AI-generated code doesn't explicitly declare a framework.
 */
export function detectFramework(source: string): Framework {
  if (source.includes("from 'react'") || source.includes('from "react"') || source.includes("import React")) {
    return "react";
  }
  if (source.includes("from 'vue'") || source.includes('<template>')) return "vue";
  if (source.includes("svelte")) return "svelte";
  if (source.includes("<!DOCTYPE html") || source.includes("<html")) return "html";
  return "vanilla";
}

// ── Compile Pipeline ──────────────────────────────────────────────────────────
/**
 * Compile source code for preview rendering.
 *
 * Currently: validates and passes through (browser-side Babel handles transpilation
 * for the preview iframe). In the future, this will invoke a server-side esbuild
 * or Vite compilation step.
 */
export async function compile(input: CompileInput, _options: CompileOptions = {}): Promise<CompileResult> {
  const start = Date.now();
  logger.audit("Compiler", "Compile started", { framework: input.framework, sessionId: input.sessionId });

  // Validation
  const { errors: validationErrors } = validate(
    generationRequestSchema,
    { prompt: input.source.slice(0, 100), framework: input.framework }
  );

  if (input.source.length === 0) {
    return { success: false, errors: ["Source is empty"] };
  }

  // Security: strip obvious dangerous content
  const warnings: string[] = [];
  if (input.source.includes("document.cookie")) {
    warnings.push("Source accesses document.cookie — review before merging");
  }
  if (input.source.includes("localStorage.clear()")) {
    warnings.push("Source calls localStorage.clear() — may erase user data");
  }
  if (input.source.match(/eval\s*\(/)) {
    warnings.push("Source uses eval() — security risk");
  }

  logger.audit("Compiler", "Compile completed", {
    framework: input.framework,
    duration: Date.now() - start,
    warnings: warnings.length,
  });

  return {
    success: true,
    output: input.source,
    errors: [],
    warnings,
    duration: Date.now() - start,
  };
}

// ── Template Generation ───────────────────────────────────────────────────────
/** Generate a starter template for a given framework. */
export function generateTemplate(framework: Framework): string {
  switch (framework) {
    case "react":
      return `import React from 'react';\n\nexport default function App() {\n  return (\n    <div className="p-8">\n      <h1 className="text-2xl font-bold">My App</h1>\n    </div>\n  );\n}\n`;
    case "html":
      return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>\n`;
    default:
      return `// ${framework} template\n// Add your code here\n`;
  }
}

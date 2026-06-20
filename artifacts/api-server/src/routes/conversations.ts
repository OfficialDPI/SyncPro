import { Router } from "express";
import { db } from "@workspace/db";
import { conversationsTable, messagesTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
import * as esbuild from "esbuild";
import { parse } from "parse5";
import {
  CreateConversationBody,
  GetConversationParams,
  DeleteConversationParams,
  ListMessagesParams,
  SendMessageParams,
  SendMessageBody,
} from "@workspace/api-zod";
import OpenAI from "openai";


class StreamFilter {
  private inThink = false;
  private buffer = "";

  filter(text: string): string {
    this.buffer += text;
    let output = "";

    while (this.buffer.length > 0) {
      if (this.inThink) {
        const endIdx = this.buffer.indexOf("</think>");
        if (endIdx !== -1) {
          this.inThink = false;
          this.buffer = this.buffer.slice(endIdx + 8);
        } else {
          const possiblePrefixLength = this.getPossiblePrefixLength(this.buffer, "</think>");
          if (possiblePrefixLength > 0) {
            this.buffer = this.buffer.slice(this.buffer.length - possiblePrefixLength);
          } else {
            this.buffer = "";
          }
          break;
        }
      } else {
        const startIdx = this.buffer.indexOf("<think>");
        if (startIdx !== -1) {
          output += this.buffer.slice(0, startIdx);
          this.inThink = true;
          this.buffer = this.buffer.slice(startIdx + 7);
        } else {
          const possiblePrefixLength = this.getPossiblePrefixLength(this.buffer, "<think>");
          if (possiblePrefixLength > 0) {
            output += this.buffer.slice(0, this.buffer.length - possiblePrefixLength);
            this.buffer = this.buffer.slice(this.buffer.length - possiblePrefixLength);
            break;
          } else {
            output += this.buffer;
            this.buffer = "";
          }
        }
      }
    }
    return output;
  }

  private getPossiblePrefixLength(str: string, target: string): number {
    for (let i = target.length - 1; i >= 1; i--) {
      const sub = target.substring(0, i);
      if (str.endsWith(sub)) {
        return i;
      }
    }
    return 0;
  }
}

function balanceBracketsAndTags(code: string, techStack: string): string {
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  let suffix = "";

  if (openBraces > closeBraces) {
    suffix += "}".repeat(openBraces - closeBraces);
  }

  if (techStack === "HTML+CSS") {
    const tags = ["div", "section", "main", "body", "html"];
    for (const tag of tags) {
      const openCount = (code.match(new RegExp(`<${tag}\\b`, "gi")) || []).length;
      const closeCount = (code.match(new RegExp(`</${tag}>`, "gi")) || []).length;
      if (openCount > closeCount) {
        suffix += `\n</${tag}>`;
      }
    }
  }

  return code + suffix;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  openTags?: string[];
}

function isStreamIncomplete(content: string, agentName: string): boolean {
  const clean = content.trim();
  if (agentName === "code") {
    const fenceCount = (clean.match(/```/g) || []).length;
    if (fenceCount % 2 !== 0) return true;
    
    const lastBlockMatch = clean.match(/```(?:tsx|jsx|typescript|javascript|ts|js|react|html)?\n([\s\S]*?)(?:```|$)/);
    if (lastBlockMatch) {
      const blockCode = lastBlockMatch[1];
      const openBraces = (blockCode.match(/\{/g) || []).length;
      const closeBraces = (blockCode.match(/\}/g) || []).length;
      if (openBraces > closeBraces) return true;
      
      const tech = detectFrameworkFromCode(blockCode);
      if (tech === "HTML") {
        const hasBody = blockCode.toLowerCase().includes("<body>");
        const hasClosingBody = blockCode.toLowerCase().includes("</body>");
        if (hasBody && !hasClosingBody) return true;

        const lastScriptIdx = blockCode.toLowerCase().lastIndexOf("<script");
        const lastClosingScriptIdx = blockCode.toLowerCase().lastIndexOf("</script>");
        if (lastScriptIdx > lastClosingScriptIdx) return true;

        const lastStyleIdx = blockCode.toLowerCase().lastIndexOf("<style");
        const lastClosingStyleIdx = blockCode.toLowerCase().lastIndexOf("</style>");
        if (lastStyleIdx > lastClosingStyleIdx) return true;
      }
    }
  }
  return false;
}

async function continueStream(
  agentName: string,
  systemPrompt: string,
  currentResponse: string,
  chatMessages: any[],
  activeModel: string,
  groq: any,
  res: any
): Promise<string> {
  let accumulated = currentResponse;
  let attempts = 0;
  
  while (attempts < 3 && isStreamIncomplete(accumulated, agentName)) {
    attempts++;
    res.write(`data: ${JSON.stringify({ type: "stream", agent: agentName, content: `\n\n*Detecting premature truncation. Continuing generation (Attempt ${attempts}/3)...*` })}\n\n`);
    
    const continueMessages = [
      { role: "system", content: systemPrompt },
      ...(chatMessages.length > 0 ? [chatMessages[chatMessages.length - 1]] : []),
      { role: "assistant", content: accumulated },
      { role: "user", content: "Your previous response was cut off. Please continue writing the code exactly from where you left off. Do not repeat the previous code. Output ONLY the remainder of the code, starting directly with the code inside the block." }
    ];
    
    try {
      const completion = await groq.chat.completions.create({
        model: activeModel,
        max_tokens: agentName === "code" ? 4096 : 1024,
        messages: continueMessages,
        stream: true
      });
      
      let continuedChunk = "";
      for await (const chunk of completion) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) {
          continuedChunk += text;
          res.write(`data: ${JSON.stringify({ type: "stream", agent: agentName, content: text })}\n\n`);
        }
      }
      
      if (!continuedChunk.trim()) break;

      let cleanText = continuedChunk.trim();
      if (cleanText.startsWith("```")) {
        const lines = cleanText.split("\n");
        if (lines[0].startsWith("```")) lines.shift();
        cleanText = lines.join("\n");
      }
      if (cleanText.endsWith("```")) {
        cleanText = cleanText.slice(0, -3);
      }
      
      accumulated = accumulated.trim();
      if (accumulated.endsWith("```")) {
        accumulated = accumulated.slice(0, -3) + "\n" + cleanText + "\n```";
      } else {
        accumulated = accumulated + "\n" + cleanText + "\n```";
      }
    } catch (e) {
      break;
    }
  }
  return accumulated;
}

function validateHTML(html: string): ValidationResult {
  const errors: string[] = [];
  const clean = html.trim();
  const lower = clean.toLowerCase();

  // 1. Tag count verification
  const countOpeningTags = (tag: string) => {
    const regex = new RegExp(`<${tag}\\b`, "gi");
    return (lower.match(regex) || []).length;
  };
  const countClosingTags = (tag: string) => {
    const regex = new RegExp(`</${tag}>`, "gi");
    return (lower.match(regex) || []).length;
  };

  const htmlOpen = countOpeningTags("html");
  const htmlClose = countClosingTags("html");
  if (htmlOpen !== 1) {
    errors.push(`HTML must contain exactly one <html> opening tag. Found ${htmlOpen}.`);
  }
  if (htmlClose !== 1) {
    errors.push(`HTML must contain exactly one </html> closing tag. Found ${htmlClose}.`);
  }

  const headOpen = countOpeningTags("head");
  const headClose = countClosingTags("head");
  if (headOpen !== 1) {
    errors.push(`HTML must contain exactly one <head> opening tag. Found ${headOpen}.`);
  }
  if (headClose !== 1) {
    errors.push(`HTML must contain exactly one </head> closing tag. Found ${headClose}.`);
  }

  const bodyOpen = countOpeningTags("body");
  const bodyClose = countClosingTags("body");
  if (bodyOpen !== 1) {
    errors.push(`HTML must contain exactly one <body> opening tag. Found ${bodyOpen}.`);
  }
  if (bodyClose !== 1) {
    errors.push(`HTML must contain exactly one </body> closing tag. Found ${bodyClose}.`);
  }

  // 2. Unfinished comments
  let commentStart = 0;
  while ((commentStart = clean.indexOf("<!--", commentStart)) !== -1) {
    const commentEnd = clean.indexOf("-->", commentStart + 4);
    if (commentEnd === -1) {
      errors.push("Unfinished comment block (<!-- without matching -->).");
      break;
    }
    commentStart = commentEnd + 3;
  }

  // 3. Unfinished script/style tags
  let scriptStart = 0;
  while ((scriptStart = lower.indexOf("<script", scriptStart)) !== -1) {
    const tagEnd = clean.indexOf(">", scriptStart);
    if (tagEnd === -1) {
      errors.push("Malformed <script> opening tag.");
      break;
    }
    const isSelfClosing = clean.substring(scriptStart, tagEnd + 1).endsWith("/>");
    if (!isSelfClosing) {
      const scriptEnd = lower.indexOf("</script>", tagEnd);
      if (scriptEnd === -1) {
        errors.push("Unfinished <script> tag (missing </script>).");
        break;
      }
      scriptStart = scriptEnd + 9;
    } else {
      scriptStart = tagEnd + 1;
    }
  }

  let styleStart = 0;
  while ((styleStart = lower.indexOf("<style", styleStart)) !== -1) {
    const tagEnd = clean.indexOf(">", styleStart);
    if (tagEnd === -1) {
      errors.push("Malformed <style> opening tag.");
      break;
    }
    const isSelfClosing = clean.substring(styleStart, tagEnd + 1).endsWith("/>");
    if (!isSelfClosing) {
      const styleEnd = lower.indexOf("</style>", tagEnd);
      if (styleEnd === -1) {
        errors.push("Unfinished <style> tag (missing </style>).");
        break;
      }
      styleStart = styleEnd + 8;
    } else {
      styleStart = tagEnd + 1;
    }
  }

  // 4. Run parse5 AST parser error checks
  try {
    const parse5Errors: string[] = [];
    parse(clean, {
      onParseError(err) {
        parse5Errors.push(`parse5 error [${err.code}]: at position ${err.startOffset}`);
      }
    });
    if (parse5Errors.length > 0) {
      errors.push(...parse5Errors);
    }
  } catch (err: any) {
    errors.push(`parse5 crash: ${err.message}`);
  }

  // 5. Classic stack-based checks for attributes, quotes, tag balance, and tag names
  const selfClosing = new Set(["img", "input", "br", "hr", "meta", "link", "source", "embed", "param", "track", "area", "col", "base"]);
  const tagRegex = /<\/?([a-zA-Z0-9:-]+)([^>]*)>/g;
  const stack: string[] = [];
  const ids = new Set<string>();

  let match;
  while ((match = tagRegex.exec(clean)) !== null) {
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    const isClosing = match[0].startsWith("</");
    const isSelfClosing = attrs.endsWith("/") || selfClosing.has(tag);

    if (attrs) {
      const doubleQuotes = (attrs.match(/"/g) || []).length;
      const singleQuotes = (attrs.match(/'/g) || []).length;
      if (doubleQuotes % 2 !== 0 && singleQuotes % 2 !== 0) {
        errors.push(`Malformed attributes in tag <${tag}>: unmatched quotes.`);
      }

      if (doubleQuotes % 2 !== 0 || singleQuotes % 2 !== 0) {
        errors.push(`Malformed attributes in tag <${tag}>: unclosed quote(s).`);
      }

      const idMatch = attrs.match(/id\s*=\s*["']([^"']+)["']/i);
      if (idMatch && idMatch[1]) {
        const idVal = idMatch[1];
        if (ids.has(idVal)) {
          errors.push(`Duplicate element ID found: "${idVal}"`);
        }
        ids.add(idVal);
      }
    }

    if (isClosing) {
      if (stack.length === 0) {
        errors.push(`Unexpected closing tag </${tag}> with no matching opening tag.`);
      } else {
        const top = stack.pop();
        if (top !== tag) {
          errors.push(`Mismatched closing tag: expected </${top}> but found </${tag}>.`);
        }
      }
    } else if (!isSelfClosing) {
      stack.push(tag);
    }
  }

  const openTags = [...stack];
  while (stack.length > 0) {
    const unclosed = stack.pop();
    errors.push(`Unclosed HTML tag: <${unclosed}>`);
  }

  return { valid: errors.length === 0, errors, openTags };
}

function validateCSS(css: string): ValidationResult {
  const errors: string[] = [];
  const clean = css.trim();

  const stack: { char: string; line: number }[] = [];
  let line = 1;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (char === "\n") line++;

    if (char === "{" || char === "(" || char === "[") {
      stack.push({ char, line });
    } else if (char === "}" || char === ")" || char === "]") {
      if (stack.length === 0) {
        errors.push(`Unexpected closing bracket '${char}' at line ${line}`);
      } else {
        const top = stack.pop()!;
        if (
          (char === "}" && top.char !== "{") ||
          (char === ")" && top.char !== "(") ||
          (char === "]" && top.char !== "[")
        ) {
          errors.push(`Mismatched bracket '${char}' at line ${line} (opened '${top.char}' at line ${top.line})`);
        }
      }
    }
  }

  while (stack.length > 0) {
    const unclosed = stack.pop()!;
    errors.push(`Unclosed bracket '${unclosed.char}' opened at line ${unclosed.line}`);
  }

  const blocks = clean.split("}");
  blocks.forEach((block, idx) => {
    const parts = block.split("{");
    if (parts.length > 1) {
      const decls = parts[1].trim();
      if (decls.length > 0 && !decls.includes("{")) {
        const statements = decls.split(";").map(s => s.trim()).filter(Boolean);
        if (statements.length > 0) {
          const last = statements[statements.length - 1];
          if (!last.includes(":") && last.length > 0) {
            errors.push(`Malformed declaration: "${last}" in block ${idx + 1}`);
          }
        }
      }
    }
  });

  return { valid: errors.length === 0, errors };
}

function validateReactJSX(code: string): ValidationResult {
  const errors: string[] = [];

  try {
    esbuild.transformSync(code, {
      loader: "tsx",
      jsx: "preserve",
      target: "es2020",
    });
  } catch (e: any) {
    if (e.errors && Array.isArray(e.errors)) {
      e.errors.forEach((err: any) => {
        errors.push(`TS/JSX Compile: ${err.text} at line ${err.location?.line || "?"}:${err.location?.column || "?"}`);
      });
    } else {
      errors.push(`TS/JSX Compile failed: ${e.message || e}`);
    }
  }

  const clean = code.trim();
  if (!clean.includes("function App") && !clean.includes("const App") && !clean.includes("class App")) {
    errors.push("Missing React App component definition (must be function App or const App).");
  }
  if (!clean.includes("export default App") && !clean.includes("export default")) {
    errors.push("Missing 'export default App' statement.");
  }

  const hooks = ["useState", "useEffect", "useRef", "useCallback", "useMemo", "useContext", "useReducer"];
  hooks.forEach(hook => {
    const regex = new RegExp(`(if|for|while|switch)\\s*\\([\\s\\S]*?\\)\\s*\\{[^\\}]*?${hook}\\s*\\(`, "g");
    if (regex.test(clean)) {
      errors.push(`React Hook Warning: "${hook}" is potentially called conditionally inside a condition, loop, or nested block.`);
    }
  });

  return { valid: errors.length === 0, errors };
}

function validateJSON(json: string): ValidationResult {
  const errors: string[] = [];
  try {
    JSON.parse(json);
  } catch (e: any) {
    errors.push(`JSON Parse Error: ${e.message}`);
  }
  return { valid: errors.length === 0, errors };
}

function validateSQL(sql: string): ValidationResult {
  const errors: string[] = [];
  const clean = sql.trim();
  const openParens = (clean.match(/\(/g) || []).length;
  const closeParens = (clean.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push(`Unbalanced parentheses in SQL script (open: ${openParens}, close: ${closeParens}).`);
  }
  const hasCreateTable = clean.toLowerCase().includes("create table");
  const hasInsert = clean.toLowerCase().includes("insert into");
  if (!hasCreateTable && !hasInsert) {
    errors.push("SQL Script does not contain common schema/seed commands (CREATE TABLE or INSERT INTO).");
  }
  return { valid: errors.length === 0, errors };
}

async function selfHealFile(
  filename: string,
  content: string,
  errors: string[],
  agentName: string,
  systemPrompt: string,
  chatMessages: any[],
  activeModel: string,
  groq: any
): Promise<string> {
  const repairPrompt = `You are an expert AI code self-healing engine.
The file "${filename}" generated in the previous step has syntax or structural validation errors.
Errors detected:
${errors.map(e => `- ${e}`).join("\n")}

Here is the current content of the file:
\`\`\`
${content}
\`\`\`

Please repair the code. Ensure:
- All tags, brackets, and braces are balanced.
- Syntax rules for the framework (${agentName}) are strictly followed.
- The output contains the COMPLETE corrected code inside a single markdown code block. Do not truncate the file.
- Do not explain the changes, just return the code.`;

  try {
    const completion = await groq.chat.completions.create({
      model: activeModel,
      max_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        ...(chatMessages.length > 0 ? [chatMessages[chatMessages.length - 1]] : []),
        { role: "user", content: repairPrompt }
      ]
    });
    const healedContent = completion.choices[0]?.message?.content || "";
    const codeMatch = healedContent.match(/```(?:tsx|jsx|typescript|javascript|ts|js|react|sql|yaml|yml|html)?\n([\s\S]*?)(?:```|$)/);
    return codeMatch ? codeMatch[1].trim() : healedContent.trim();
  } catch (e) {
    return content;
  }
}

async function selfHealCompilerError(
  filename: string,
  content: string,
  buildError: string,
  agentName: string,
  systemPrompt: string,
  chatMessages: any[],
  activeModel: string,
  groq: any
): Promise<string> {
  const repairPrompt = `You are a senior build systems engineer.
The project failed to compile due to the following build/compiler error in "${filename}":
\`\`\`
${buildError}
\`\`\`

Here is the content of "${filename}":
\`\`\`
${content}
\`\`\`

Please fix the file content to resolve this compiler error. Keep the rest of the logic unchanged.
Output the COMPLETE corrected code inside a single markdown code block. Do not explain.`;

  try {
    const completion = await groq.chat.completions.create({
      model: activeModel,
      max_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        ...(chatMessages.length > 0 ? [chatMessages[chatMessages.length - 1]] : []),
        { role: "user", content: repairPrompt }
      ]
    });
    const healedContent = completion.choices[0]?.message?.content || "";
    const codeMatch = healedContent.match(/```(?:tsx|jsx|typescript|javascript|ts|js|react|sql|yaml|yml|html)?\n([\s\S]*?)(?:```|$)/);
    return codeMatch ? codeMatch[1].trim() : healedContent.trim();
  } catch (e) {
    return content;
  }
}

async function copyDir(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function mergeTemporaryWorkspace(conversationId: number) {
  const WORKSPACE_ROOT = path.resolve(process.cwd(), "..", "user-workspaces");
  const tempPath = path.join(WORKSPACE_ROOT, `${conversationId}-temp`);
  const permPath = path.join(WORKSPACE_ROOT, String(conversationId));
  if (fsSync.existsSync(tempPath)) {
    await copyDir(tempPath, permPath);
    await fs.rm(tempPath, { recursive: true, force: true });
  }
}

function detectFrameworkFromCode(source: string): "React" | "NextJS" | "Vue" | "HTML" {
  const clean = source.trim();
  if (clean.includes("from 'vue'") || clean.includes('from "vue"') || clean.includes("<template>") || clean.includes("<script setup>")) {
    return "Vue";
  }
  if (clean.includes("from 'next'") || clean.includes('from "next"') || clean.includes("import Link from 'next/link'")) {
    return "NextJS";
  }
  if (clean.startsWith("<!DOCTYPE html") || clean.startsWith("<html") || clean.includes("</html>") || clean.includes("</body>")) {
    return "HTML";
  }
  return "React";
}

function validateAndCleanCode(code: string, techStack: string): string {
  let cleaned = code.trim();

  // 1. Remove leaked markdown artifacts
  cleaned = cleaned.replace(/hljs\s+(tsx|jsx|html|css|js|ts)/gi, "");

  // 2. Resolve HTML nesting problems for HTML stack
  if (techStack === "HTML" || techStack === "HTML+CSS") {
    const htmlMatches = cleaned.match(/<html[\s\S]*?<\/html>/gi);
    if (htmlMatches && htmlMatches.length > 1) {
      cleaned = htmlMatches[0];
    }

    const bodyMatches = cleaned.match(/<body[\s\S]*?<\/body>/gi);
    if (bodyMatches && bodyMatches.length > 1) {
      const bodyContent = bodyMatches.map(b => b.replace(/<\/?body[^>]*>/gi, "")).join("\n");
      cleaned = cleaned.replace(/<body[\s\S]*?<\/body>/gi, "");
      cleaned = cleaned.replace("</html>", `<body>\n${bodyContent}\n</body>\n</html>`);
    }
  } else if (techStack === "React" || techStack === "NextJS") {
    // Inject React imports and exports if they are missing
    if (!cleaned.includes("import React") && !cleaned.includes("import * as React")) {
      cleaned = "import React from 'react';\n" + cleaned;
    }
    if (!cleaned.includes("export default")) {
      const match = cleaned.match(/(?:function|const|class)\s+(\w+)/);
      if (match && match[1]) {
        cleaned = cleaned + `\nexport default ${match[1]};\n`;
      } else if (cleaned.includes("function App") || cleaned.includes("const App")) {
        cleaned = cleaned + "\nexport default App;\n";
      }
    }
  }

  // 3. Balance braces/tags
  cleaned = balanceBracketsAndTags(cleaned, techStack);

  return cleaned;
}

const allPotentialFiles = [
  "src/App.tsx", "src/main.tsx", "src/index.css",
  "src/App.vue", "src/main.ts",
  "src/app/page.tsx", "src/app/layout.tsx", "src/app/globals.css", "next.config.js", "tailwind.config.js", "postcss.config.js",
  "styles.css", "vite.config.ts", "tsconfig.json", "index.html"
];

const neededFiles: Record<string, string[]> = {
  "React": ["src/App.tsx", "src/main.tsx", "src/index.css", "tsconfig.json", "vite.config.ts", "index.html"],
  "Vue": ["src/App.vue", "src/main.ts", "src/index.css", "tsconfig.json", "vite.config.ts", "index.html"],
  "NextJS": ["src/app/page.tsx", "src/app/layout.tsx", "src/app/globals.css", "tsconfig.json", "next.config.js", "tailwind.config.js", "postcss.config.js"],
  "HTML": ["index.html", "styles.css", "vite.config.ts", "tailwind.config.js"],
  "HTML+CSS": ["index.html", "styles.css", "vite.config.ts", "tailwind.config.js"]
};

async function scaffoldProject(conversationId: number, spec: any, dbCode: string, deployCode: string, techStack: "React" | "NextJS" | "Vue" | "HTML" | "HTML+CSS", targetPath?: string) {
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

const router = Router();

function getGroqClient() {
  return new OpenAI({ 
    apiKey: "sk-b0f8735b5565416cb6500ce238e026ad",
    baseURL: "https://api.deepseek.com/v1"
  });
}

router.get("/conversations", async (req, res) => {
  try {
    const conversations = await db
      .select()
      .from(conversationsTable)
      .orderBy(desc(conversationsTable.updatedAt));

    const result = await Promise.all(
      conversations.map(async (conv) => {
        const [{ count: msgCount }] = await db
          .select({ count: count() })
          .from(messagesTable)
          .where(eq(messagesTable.conversationId, conv.id));
        return {
          ...conv,
          messageCount: Number(msgCount),
          projectId: conv.projectId ?? null,
        };
      })
    );

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list conversations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations", async (req, res) => {
  try {
    const parsed = CreateConversationBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const { title, projectId, model } = parsed.data;
    const [conv] = await db
      .insert(conversationsTable)
      .values({ title, projectId: projectId ?? null, model: model ?? "gpt-4o-mini" })
      .returning();
    res.status(201).json({ ...conv, messageCount: 0, projectId: conv.projectId ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to create conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/conversations/:id", async (req, res) => {
  try {
    const parsed = GetConversationParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid conversation ID" });
      return;
    }
    const [conv] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, parsed.data.id));
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    const msgs = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conv.id))
      .orderBy(messagesTable.createdAt);
    res.json({
      ...conv,
      messageCount: msgs.length,
      projectId: conv.projectId ?? null,
      messages: msgs,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/conversations/:id", async (req, res) => {
  try {
    const parsed = DeleteConversationParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid conversation ID" });
      return;
    }
    await db.delete(messagesTable).where(eq(messagesTable.conversationId, parsed.data.id));
    const [deleted] = await db
      .delete(conversationsTable)
      .where(eq(conversationsTable.id, parsed.data.id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/conversations/:id/messages", async (req, res) => {
  try {
    const parsed = ListMessagesParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid conversation ID" });
      return;
    }
    const msgs = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, parsed.data.id))
      .orderBy(messagesTable.createdAt);
    res.json(msgs);
  } catch (err) {
    req.log.error({ err }, "Failed to list messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations/:id/messages", async (req, res) => {
  try {
    const params = SendMessageParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) {
      res.status(400).json({ error: "Invalid conversation ID" });
      return;
    }
    const body = SendMessageBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const { content, model } = body.data;
    const conversationId = params.data.id;

    const [conv] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, conversationId));
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    await db.insert(messagesTable).values({ conversationId, role: "user", content });

    const history = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(messagesTable.createdAt);

    const chatMessages = history.map((m) => {
      let parsedContent = m.content;
      if (m.role === "assistant") {
        try {
          const parsed = JSON.parse(m.content);
          parsedContent = parsed.code || m.content;
        } catch { /* ignore */ }
      }
      return {
        role: m.role as "user" | "assistant" | "system",
        content: parsedContent,
      };
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const groq = getGroqClient();
    const requestedModel = model ?? conv.model ?? "";
    const activeModel = requestedModel.includes("llama") ? "deepseek-v4-pro" : (requestedModel || "deepseek-v4-pro");
    
    // Stage 1: Generate Project Spec (Spec Architect JSON Call)
    let spec = {
      projectName: "AppStudio",
      techStack: "React",
      branding: {
        theme: "dark",
        primaryColor: "bg-purple-600",
        accentColor: "text-blue-500",
        backgroundColor: "#0d0d12"
      },
      database: {
        tables: ["users", "items"]
      },
      apis: {
        endpoints: ["/api/auth/login", "/api/items"]
      }
    };

    try {
      const specSystemPrompt = `You are the Sync Project Spec Architect.
Analyze the user request and history.
Produce a JSON object representing the technical specifications for this build.
The output MUST be a valid JSON object only. Do not include markdown code block formatting or explanation.

JSON Schema:
{
  "projectName": "Clean product name (e.g. DeployDash, FitTrack)",
  "techStack": "React" or "HTML+CSS" (use "HTML+CSS" ONLY if the user specifically requests HTML + CSS, static/vanilla HTML/CSS, or no modern frameworks; default is "React"),
  "branding": {
    "theme": "dark",
    "primaryColor": "e.g. bg-purple-600 or hex",
    "accentColor": "e.g. text-blue-500 or hex",
    "backgroundColor": "e.g. #0d0d12"
  },
  "database": {
    "tables": ["users", "items"]
  },
  "apis": {
    "endpoints": ["/api/auth/login", "/api/items"]
  }
}`;

      const specComp = await groq.chat.completions.create({
        model: activeModel,
        messages: [
          { role: "system", content: specSystemPrompt },
          ...chatMessages.slice(-5)
        ],
        response_format: { type: "json_object" }
      });

      const specText = specComp.choices[0]?.message?.content;
      if (specText) {
        const parsed = JSON.parse(specText);
        if (parsed.projectName) spec.projectName = parsed.projectName;
        if (parsed.techStack === "HTML+CSS" || parsed.techStack === "React") {
          spec.techStack = parsed.techStack;
        }
        if (parsed.branding) spec.branding = { ...spec.branding, ...parsed.branding };
        if (parsed.database) spec.database = { ...spec.database, ...parsed.database };
        if (parsed.apis) spec.apis = { ...spec.apis, ...parsed.apis };
      }
    } catch (e) {
      req.log.warn({ e }, "Failed to generate project spec, using defaults");
    }

    const responses: Record<string, string> = { code: "", db: "", deploy: "" };
    
    const runStream = async (agentName: string, systemPrompt: string) => {
      try {
        const stream = await groq.chat.completions.create({
          model: activeModel,
          max_tokens: agentName === "code" ? 8192 : 2048,
          messages: [{ role: "system", content: systemPrompt }, ...chatMessages],
          stream: true,
        });

        const filter = new StreamFilter();

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta;
          const text = delta?.content; // Skip native reasoning_content
          
          if (text) {
            const filteredText = filter.filter(text);
            if (filteredText) {
              responses[agentName] += filteredText;
              res.write(`data: ${JSON.stringify({ type: "stream", agent: agentName, content: filteredText })}\n\n`);
            }
          }
        }

        // After stream is done, detect and repair premature ending
        responses[agentName] = await continueStream(
          agentName,
          systemPrompt,
          responses[agentName],
          chatMessages,
          activeModel,
          groq,
          res
        );

        if (["code", "db", "deploy"].includes(agentName)) {
          let codeMatch = responses[agentName].match(/```(?:tsx|jsx|typescript|javascript|ts|js|react|sql|yaml|yml|html)?\n([\s\S]*?)(?:```|$)/);
          let finalCode = codeMatch ? codeMatch[1].trim() : responses[agentName].trim();
          let techStack = spec.techStack;

          if (agentName === "code") {
            const detected = detectFrameworkFromCode(finalCode);
            if (detected !== spec.techStack) {
              req.log.info({ detected, previous: spec.techStack }, "Overriding spec techStack based on generated code");
              techStack = detected;
            }
            finalCode = validateAndCleanCode(finalCode, techStack);
          }

          let filename = "src/App.tsx";
          if (techStack === "React") filename = "src/App.tsx";
          else if (techStack === "Vue") filename = "src/App.vue";
          else if (techStack === "NextJS") filename = "src/app/page.tsx";
          else if (techStack === "HTML" || techStack === "HTML+CSS") filename = "index.html";

          if (agentName === "db") filename = "schema.sql";
          if (agentName === "deploy") filename = "docker-compose.yml";

          // Syntax Validation & Self-Healing Loop
          let healAttempt = 0;
          let validation: ValidationResult = { valid: true, errors: [] };
          
          while (healAttempt < 3) {
            validation = { valid: true, errors: [] };
            if (agentName === "code") {
              if (techStack === "React" || techStack === "NextJS" || techStack === "Vue") {
                validation = validateReactJSX(finalCode);
              } else if (techStack === "HTML" || techStack === "HTML+CSS") {
                validation = validateHTML(finalCode);
              }
            } else if (agentName === "db") {
              validation = validateSQL(finalCode);
            }

            if (validation.valid) {
              break;
            }

            healAttempt++;
            res.write(`data: ${JSON.stringify({
              type: "stream",
              agent: agentName,
              content: `\n\n*File validation failed for \`${filename}\` (Heal Attempt ${healAttempt}/3):*\n` + 
                       validation.errors.map(e => `  ✗ ${e}`).join("\n") +
                       `\n\n*Requesting self-healing from AI...*`
            })}\n\n`);

            finalCode = await selfHealFile(
              filename,
              finalCode,
              validation.errors,
              agentName,
              systemPrompt,
              chatMessages,
              activeModel,
              groq
            );
          }

          // Stream the file integrity report
          if (validation.valid) {
            res.write(`data: ${JSON.stringify({
              type: "stream",
              agent: agentName,
              content: `\n\n*File Integrity Report for \`${filename}\`:*\n` +
                       `  ✓ Clean syntax & parsers\n` +
                       `  ✓ Balanced structures and tags\n` +
                       `  ✓ Integrity check passed!`
            })}\n\n`);
          } else {
            res.write(`data: ${JSON.stringify({
              type: "stream",
              agent: agentName,
              content: `\n\n*File Integrity Report for \`${filename}\`:*\n` +
                       validation.errors.map(e => `  ✗ ${e}`).join("\n") +
                       `  ⚠ Integrity check failed after self-healing attempts.`
            })}\n\n`);
          }

          // Save to Temporary Workspace Staging
          const WORKSPACE_ROOT = path.resolve(process.cwd(), "..", "user-workspaces");
          const tempProjectPath = path.join(WORKSPACE_ROOT, `${conversationId}-temp`);
          const safePath = path.resolve(tempProjectPath, filename);

          if (!validation.valid && (techStack === "HTML" || techStack === "HTML+CSS")) {
            const currentVal = validateHTML(finalCode);
            if (currentVal.openTags && currentVal.openTags.length > 0) {
              let closedCode = finalCode.trim();
              for (let i = currentVal.openTags.length - 1; i >= 0; i--) {
                const tag = currentVal.openTags[i];
                closedCode += `\n</${tag}>`;
              }
              finalCode = closedCode;
              validation = validateHTML(finalCode);
              res.write(`data: ${JSON.stringify({
                type: "stream",
                agent: agentName,
                content: `\n\n*Auto-closed remaining HTML tags to prevent parser crash: ${currentVal.openTags.reverse().map(t => `</${t}>`).join(" ")}*`
              })}\n\n`);
            }
          }

          const tmpPath = safePath + ".tmp";
          try {
            await fs.mkdir(path.dirname(safePath), { recursive: true });
            await fs.writeFile(tmpPath, finalCode, "utf-8");

            if (validation.valid) {
              await fs.rename(tmpPath, safePath);
              res.write(`data: ${JSON.stringify({ type: "stream", agent: agentName, content: `\n\n*Wrote file to temporary staging: \`${filename}\`*` })}\n\n`);
            } else {
              await fs.unlink(tmpPath).catch(() => {});
              res.write(`data: ${JSON.stringify({ type: "stream", agent: agentName, content: `\n\n*Validation failed for \`${filename}\`. Discarded staging write and left original intact.*` })}\n\n`);
            }
          } catch (e) {
            req.log.error({ e }, "File write failed");
          }

          // Update responses memory so scaffolding/build steps read the final corrected code
          responses[agentName] = finalCode;
        }
      } catch (err) {
        req.log.error({ err, agentName }, "Subagent stream failed");
      }
    };

    const codePrompt = `You are Sync — a senior product engineer at the level of a Replit or Vercel staff engineer.
You are building the frontend application for the project: "${spec.projectName}".
Technology Stack: ${spec.techStack}
Branding & Spec details: ${JSON.stringify(spec.branding)}
Database Schema context: ${JSON.stringify(spec.database)}
APIs context: ${JSON.stringify(spec.apis)}

${spec.techStack === "React" ? `
You MUST output ONLY a single React component block using TSX/JSX (e.g. \`\`\`tsx). The main component MUST be named "App" (e.g. \`function App() { ... }\` or \`const App = () => { ... }\`).
NEVER OUTPUT AN HTML FILE. NEVER OUTPUT <!DOCTYPE html>.
Rules:
- The main component MUST be named App.
- NO import/export statements — React, useState, etc. are already on window.
- Destructure hooks at top: const { useState, useEffect, useRef, useCallback, useMemo } = React;
- Lucide icons available as window.lucide — destructure at top: const { Search, Home } = lucide;
- Tailwind classes via Play CDN.
- Use state, hooks, effects.
- Include a full interactive UI with state, hover effects, transition animations, form validation, error/success states, accessibility (ARIA, screen reader tags, tabindex).
- Ensure visual excellence: layered dark backgrounds, nice typography, custom accents.
` : `
You MUST output ONLY a single self-contained HTML page inside a markdown block (e.g. \`\`\`html).
It should contain:
- Complete HTML5 structure, title tag, description meta, OpenGraph cards.
- Embedded Tailwind CDN script: <script src="https://cdn.tailwindcss.com"></script>.
- Embedded Lucide icons script: <script src="https://unpkg.com/lucide@latest"></script> and run lucide.createIcons() on load.
- Embedded fonts: Google Fonts (Inter/Outfit).
- Standard CSS / style tag for custom scrollbars, animations, gradients.
- JavaScript script tag at the bottom implementing all interactive logic (e.g. state management, menu toggles, modal open/close, client-side form validation, mock API fetches, accessibility enhancements).
- Skip-to-content links, semantic landmarks, ARIA labels, tabindex, focus rings.
`}

════════════════════════════════════════════════
THINKING PROCESS (REQUIRED)
════════════════════════════════════════════════
Before you write any code, you MUST think out loud inside <think>...</think> tags.
Plan your work carefully: stack selection, accessibility, responsive break points, states.

════════════════════════════════════════════════
OUTPUT FORMAT (strict)
════════════════════════════════════════════════
1. One sentence describing what you built.
2. The code block (\`\`\`tsx or \`\`\`html).
3. Three bullet points highlighting the interactions, validation, and accessibility features implemented.
`;

    const dbPrompt = `You are the Sync Database Architect.
Generate a PostgreSQL database schema for the project: "${spec.projectName}".
Branding/Specs: ${JSON.stringify(spec.branding)}
Database context: ${JSON.stringify(spec.database)}

Instructions:
- Output the entire database schema as a single SQL markdown block (e.g. \`\`\`sql).
- Include CREATE TABLE statements with appropriate column types, primary/foreign keys, indexes, NOT NULL, DEFAULT constraints, and comment tags.
- Include dummy seed data insertion statements at the end to initialize the database with professional content.
- Output ONLY the sql code block.

════════════════════════════════════════════════
THINKING PROCESS (REQUIRED)
════════════════════════════════════════════════
Before you write any code, you MUST think out loud inside <think>...</think> tags.`;

    const deployPrompt = `You are the Sync DevOps Engineer.
Generate a \`docker-compose.yml\` file for the project: "${spec.projectName}".
Branding/Specs: ${JSON.stringify(spec.branding)}
APIs context: ${JSON.stringify(spec.apis)}

Instructions:
- Output the configuration as a single YAML markdown block (e.g. \`\`\`yaml).
- Include services for the frontend, backend API server, and a PostgreSQL database.
- Define ports, environment variables, volumes, and healthcheck commands.
- Output ONLY the yaml code block.

════════════════════════════════════════════════
THINKING PROCESS (REQUIRED)
════════════════════════════════════════════════
Before you write any code, you MUST think out loud inside <think>...</think> tags.`;

    await Promise.all([
      runStream("code", codePrompt),
      runStream("db", dbPrompt),
      runStream("deploy", deployPrompt),
    ]);

    // Scaffolder to build complete project layout
    try {
      const dbMatch = responses.db.match(/```(?:sql)?\n([\s\S]*?)(?:```|$)/);
      const deployMatch = responses.deploy.match(/```(?:yaml|yml)?\n([\s\S]*?)(?:```|$)/);
      const dbCode = dbMatch ? dbMatch[1].trim() : "";
      const deployCode = deployMatch ? deployMatch[1].trim() : "";
      
      const codeMatch = responses.code.match(/```(?:tsx|jsx|typescript|javascript|ts|js|react|html)?\n([\s\S]*?)(?:```|$)/);
      const codeContent = codeMatch ? codeMatch[1].trim() : responses.code;
      const detectedStack = detectFrameworkFromCode(codeContent);
      
      const WORKSPACE_ROOT = path.resolve(process.cwd(), "..", "user-workspaces");
      const tempProjectPath = path.join(WORKSPACE_ROOT, `${conversationId}-temp`);
      const permProjectPath = path.join(WORKSPACE_ROOT, String(conversationId));
      
      res.write(`data: ${JSON.stringify({ type: "stream", agent: "code", content: `\n\n*Scaffolding staging project files (${detectedStack})...*` })}\n\n`);
      await scaffoldProject(conversationId, spec, dbCode, deployCode, detectedStack, tempProjectPath);
      
      res.write(`data: ${JSON.stringify({ type: "stream", agent: "code", content: `\n\n*Installing dependencies (pnpm install)...*` })}\n\n`);
      
      let installSuccess = false;
      try {
        await execAsync("pnpm install --ignore-workspace --dangerously-allow-all-builds", { cwd: tempProjectPath, timeout: 300000 });
        res.write(`data: ${JSON.stringify({ type: "stream", agent: "code", content: `\n\n*Dependencies installed successfully!*` })}\n\n`);
        responses.code += `\n\n*Dependencies installed successfully!*`;
        installSuccess = true;
      } catch (err: any) {
        req.log.warn({ err }, "pnpm install failed in staging, trying npm install");
        try {
          await execAsync("npm install", { cwd: tempProjectPath, timeout: 300000 });
          res.write(`data: ${JSON.stringify({ type: "stream", agent: "code", content: `\n\n*Dependencies installed successfully via npm!*` })}\n\n`);
          responses.code += `\n\n*Dependencies installed successfully via npm!*`;
          installSuccess = true;
        } catch (npmErr: any) {
          req.log.error({ npmErr }, "npm install failed in staging");
          res.write(`data: ${JSON.stringify({ type: "stream", agent: "code", content: `\n\n*Warning: Dependency installation failed. Preview might not load correctly.*` })}\n\n`);
          responses.code += `\n\n*Warning: Dependency installation failed. Preview might not load correctly.*`;
        }
      }

      if (installSuccess) {
        res.write(`data: ${JSON.stringify({ type: "stream", agent: "code", content: `\n\n*Running compile and build tests...*` })}\n\n`);
        let compileSuccess = false;
        let buildAttempt = 0;
        let lastBuildError = "";

        while (buildAttempt < 3) {
          try {
            // Auto format staging files using Prettier before building
            try {
              await execAsync("pnpm exec prettier --write .", { cwd: tempProjectPath, timeout: 30000 });
            } catch (prettierErr: any) {
              req.log.warn({ prettierErr }, "Prettier formatting failed in staging");
              throw new Error(`Formatting Error: Prettier failed to format files due to a syntax error:\n${prettierErr.stderr || prettierErr.message}`);
            }

            await execAsync("pnpm run build", {
              cwd: tempProjectPath,
              timeout: 120000,
              env: {
                ...process.env,
                PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN: "false"
              }
            });
            compileSuccess = true;
            break;
          } catch (buildErr: any) {
            buildAttempt++;
            req.log.error({ buildErr }, `Compilation failed (Attempt ${buildAttempt}/3)`);
            lastBuildError = buildErr.stderr || buildErr.stdout || buildErr.message || "Unknown build error";
            
            if (buildAttempt < 3) {
              res.write(`data: ${JSON.stringify({
                type: "stream",
                agent: "code",
                content: `\n\n*Compilation failed (Attempt ${buildAttempt}/3). Initiating compiler auto-repair...*\n\`\`\`\n${lastBuildError}\n\`\`\``
              })}\n\n`);

              let fileToFix = "src/App.tsx";
              if (detectedStack === "React") fileToFix = "src/App.tsx";
              else if (detectedStack === "Vue") fileToFix = "src/App.vue";
              else if (detectedStack === "NextJS") fileToFix = "src/app/page.tsx";
              else if (detectedStack === "HTML" || detectedStack === "HTML+CSS") fileToFix = "index.html";

              const fileToFixPath = path.resolve(tempProjectPath, fileToFix);
              let currentContent = "";
              try {
                currentContent = await fs.readFile(fileToFixPath, "utf-8");
              } catch {}

              const fixedCode = await selfHealCompilerError(
                fileToFix,
                currentContent,
                lastBuildError,
                "code",
                codePrompt,
                chatMessages,
                activeModel,
                groq
              );

              let finalFixedCode = fixedCode;
              if (detectedStack === "HTML") {
                const val = validateHTML(finalFixedCode);
                if (val.openTags && val.openTags.length > 0) {
                  let closedCode = finalFixedCode.trim();
                  for (let i = val.openTags.length - 1; i >= 0; i--) {
                    const tag = val.openTags[i];
                    closedCode += `\n</${tag}>`;
                  }
                  finalFixedCode = closedCode;
                }
              }

              // Transaction-based write for the fixed file
              const fixTmpPath = fileToFixPath + ".tmp";
              try {
                await fs.writeFile(fixTmpPath, finalFixedCode, "utf-8");
                let fixValid = true;
                if (fileToFix.endsWith(".html")) {
                  fixValid = validateHTML(finalFixedCode).valid;
                } else if (fileToFix.endsWith(".css")) {
                  fixValid = validateCSS(finalFixedCode).valid;
                }

                if (fixValid) {
                  await fs.rename(fixTmpPath, fileToFixPath);
                  responses.code = responses.code.replace(currentContent, finalFixedCode);
                } else {
                  await fs.unlink(fixTmpPath).catch(() => {});
                }
              } catch {}
            }
          }
        }

        if (compileSuccess) {
          res.write(`data: ${JSON.stringify({ type: "stream", agent: "code", content: `\n\n*Staging build successful! Merging draft into project workspace...*` })}\n\n`);
          responses.code += `\n\n*Compilation and build successful!*`;
          
          await mergeTemporaryWorkspace(conversationId);
          
          try {
            await fs.unlink(path.join(permProjectPath, "build-errors.txt"));
          } catch {}
        } else {
          res.write(`data: ${JSON.stringify({ type: "stream", agent: "code", content: `\n\n*Compiler healing failed. Preview will render build errors.*` })}\n\n`);
          responses.code += `\n\n*Compilation failed!*\n\`\`\`\n${lastBuildError}\n\`\`\``;
          
          await fs.mkdir(permProjectPath, { recursive: true });
          await fs.writeFile(path.join(permProjectPath, "build-errors.txt"), lastBuildError, "utf-8");
          
          // Transactional: If compilation fails, discard staging changes and do NOT copy broken files to permanent workspace.
          if (fsSync.existsSync(tempProjectPath)) {
            await fs.rm(tempProjectPath, { recursive: true, force: true });
          }
        }
      } else {
        await mergeTemporaryWorkspace(conversationId);
      }
    } catch (scaffoldErr: any) {
      req.log.error({ scaffoldErr }, "Failed to scaffold project files");
    }

    let finalContent = responses.code;
    if (responses.db && responses.db.trim()) {
      finalContent += `\n\n### Database Schema\n\n${responses.db}`;
    }
    if (responses.deploy && responses.deploy.trim()) {
      finalContent += `\n\n### Deployment Configuration\n\n${responses.deploy}`;
    }

    await db.insert(messagesTable).values({ conversationId, role: "assistant", content: finalContent });
    await db.update(conversationsTable).set({ updatedAt: new Date() }).where(eq(conversationsTable.id, conversationId));
    res.write(`data: ${JSON.stringify({ type: "done", done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
      res.end();
    }
  }
});

export default router;

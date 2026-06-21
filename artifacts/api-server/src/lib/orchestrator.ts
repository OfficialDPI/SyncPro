import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { createWorkspaceSnapshot, restoreWorkspaceSnapshot, discardWorkspaceSnapshot } from "./rollback";
import { installDependencies, compileBuild } from "./compiler";
import { scaffoldProject } from "./builder";
import {
  validateReactJSX,
  validateHTML,
  validateSQL,
  validateYAML,
  validateCSS,
  autoRepairHTML,
  autoRepairCSS,
  ValidationResult
} from "./validation";

const execAsync = promisify(exec);

function safeWrite(res: any, data: string) {
  if (res && res.writable && !res.writableEnded && !res.destroyed) {
    try {
      res.write(data);
    } catch (e) {
      // ignore
    }
  }
}

export class StreamFilter {
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

export function balanceBracketsAndTags(code: string, techStack: string): string {
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

export function isStreamIncomplete(content: string, agentName: string): boolean {
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

export function detectFrameworkFromCode(source: string): "React" | "NextJS" | "Vue" | "HTML" {
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

export function validateAndCleanCode(code: string, techStack: string): string {
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

export function detectFileToFixFromError(errorMsg: string, defaultFile: string): string {
  const fileRegex = /(?:[a-zA-Z]:[\\\/]|\b)[\w\-\.\/\\@]+\.(tsx|jsx|ts|js|vue|html|css|sql|yml|yaml)\b/i;
  const match = errorMsg.match(fileRegex);
  if (match) {
    const filePath = match[0];
    const normalized = filePath.replace(/\\/g, "/");
    const wsMatch = normalized.match(/user-workspaces\/[^/]+\/(.+)$/);
    if (wsMatch) {
      return wsMatch[1];
    }
    const baseName = normalized.split("/").pop();
    if (baseName) {
      const knownNames = ["docker-compose.yml", "schema.sql", "index.html", "package.json", "vite.config.ts", "tsconfig.json", "styles.css"];
      if (knownNames.includes(baseName)) {
        return baseName;
      }
      const srcIndex = normalized.split("/").indexOf("src");
      if (srcIndex !== -1) {
        return normalized.split("/").slice(srcIndex).join("/");
      }
      return baseName;
    }
  }
  return defaultFile;
}

export async function continueStream(
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
    safeWrite(res, `data: ${JSON.stringify({ type: "stream", agent: agentName, content: `\n\n*Detecting premature truncation. Continuing generation (Attempt ${attempts}/3)...*` })}\n\n`);
    
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
          safeWrite(res, `data: ${JSON.stringify({ type: "stream", agent: agentName, content: text })}\n\n`);
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

export async function selfHealFile(
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

export async function selfHealCompilerError(
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
    if (entry.name === "node_modules" || entry.name === ".git") {
      continue;
    }
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

export async function mergeTemporaryWorkspace(conversationId: number) {
  const WORKSPACE_ROOT = path.resolve(process.cwd(), "..", "user-workspaces");
  const permPath = path.join(WORKSPACE_ROOT, String(conversationId));
  const tempPath = path.join(permPath, "generation");
  const transitionPath = path.join(WORKSPACE_ROOT, `${conversationId}-temp-generation`);
  
  if (fsSync.existsSync(tempPath)) {
    try {
      if (fsSync.existsSync(transitionPath)) {
        await fs.rm(transitionPath, { recursive: true, force: true });
      }
      await fs.rename(tempPath, transitionPath);

      if (fsSync.existsSync(permPath)) {
        await fs.rm(permPath, { recursive: true, force: true });
      }

      await fs.rename(transitionPath, permPath);
    } catch (renameErr) {
      if (fsSync.existsSync(transitionPath)) {
        await copyDir(transitionPath, permPath);
        await fs.rm(transitionPath, { recursive: true, force: true });
      } else {
        await copyDir(tempPath, permPath);
        await fs.rm(tempPath, { recursive: true, force: true });
      }
      
      try {
        await execAsync("pnpm install --ignore-workspace --dangerously-allow-all-builds", { cwd: permPath, timeout: 300000 });
      } catch {
        try {
          await execAsync("npm install", { cwd: permPath, timeout: 300000 });
        } catch {}
      }
    }
  }
}

export interface BuildOrchestratorParams {
  conversationId: number;
  spec: any;
  responses: Record<string, string>;
  chatMessages: any[];
  activeModel: string;
  groq: any;
  res: any;
  log: any;
}

export async function runBuildOrchestrator(params: BuildOrchestratorParams): Promise<boolean> {
  const { conversationId, spec, responses, chatMessages, activeModel, groq, res, log } = params;
  
  // Create snapshot rollback recovery point of the active permanent workspace
  await createWorkspaceSnapshot(conversationId);
  
  try {
    const dbMatch = responses.db.match(/```(?:sql)?\n([\s\S]*?)(?:```|$)/);
    const deployMatch = responses.deploy.match(/```(?:yaml|yml)?\n([\s\S]*?)(?:```|$)/);
    const dbCode = dbMatch ? dbMatch[1].trim() : "";
    const deployCode = deployMatch ? deployMatch[1].trim() : "";
    
    const codeMatch = responses.code.match(/```(?:tsx|jsx|typescript|javascript|ts|js|react|html)?\n([\s\S]*?)(?:```|$)/);
    const codeContent = codeMatch ? codeMatch[1].trim() : responses.code;
    const detectedStack = detectFrameworkFromCode(codeContent);
    
    const WORKSPACE_ROOT = path.resolve(process.cwd(), "..", "user-workspaces");
    const permProjectPath = path.join(WORKSPACE_ROOT, String(conversationId));
    const tempProjectPath = path.join(permProjectPath, "generation");
    
    safeWrite(res, `data: ${JSON.stringify({ type: "stream", agent: "code", content: `\n\n*Scaffolding staging project files (${detectedStack})...*` })}\n\n`);
    await scaffoldProject(conversationId, spec, dbCode, deployCode, detectedStack, tempProjectPath);
    
    const installSuccess = await installDependencies(tempProjectPath, (msg) => {
      safeWrite(res, `data: ${JSON.stringify({ type: "stream", agent: "code", content: `\n\n*${msg}*` })}\n\n`);
    });

    if (installSuccess) {
      let compileSuccess = false;
      let buildAttempt = 0;
      let lastBuildError = "";

      while (buildAttempt < 3) {
        const buildRes = await compileBuild(tempProjectPath, (msg) => {
          safeWrite(res, `data: ${JSON.stringify({ type: "stream", agent: "code", content: `\n\n*${msg}*` })}\n\n`);
        });

        if (buildRes.success) {
          compileSuccess = true;
          break;
        }

        buildAttempt++;
        lastBuildError = buildRes.error;
        log.error({ buildAttempt }, `Compilation failed (Attempt ${buildAttempt}/3)`);
        
        if (buildAttempt < 3) {
          safeWrite(res, `data: ${JSON.stringify({
            type: "stream",
            agent: "code",
            content: `\n\n*Compilation failed (Attempt ${buildAttempt}/3). Initiating compiler auto-repair...*\n\`\`\`\n${lastBuildError}\n\`\`\``
          })}\n\n`);

          let fileToFix = "src/App.tsx";
          if (detectedStack === "React") fileToFix = "src/App.tsx";
          else if (detectedStack === "Vue") fileToFix = "src/App.vue";
          else if (detectedStack === "NextJS") fileToFix = "src/app/page.tsx";
          else if (detectedStack === "HTML" || detectedStack === "HTML+CSS") fileToFix = "index.html";

          fileToFix = detectFileToFixFromError(lastBuildError, fileToFix);

          let targetAgent = "code";
          let targetPrompt = ""; // Prompt context is managed in caller
          if (fileToFix === "docker-compose.yml" || fileToFix.endsWith(".yml") || fileToFix.endsWith(".yaml")) {
            targetAgent = "deploy";
          } else if (fileToFix === "schema.sql" || fileToFix.endsWith(".sql")) {
            targetAgent = "db";
          }

          const fileToFixPath = path.resolve(tempProjectPath, fileToFix);
          let currentContent = "";
          try {
            currentContent = await fs.readFile(fileToFixPath, "utf-8");
          } catch {}

          const fixedCode = await selfHealCompilerError(
            fileToFix,
            currentContent,
            lastBuildError,
            targetAgent,
            responses[targetAgent], // Pass responses[targetAgent] as system prompt reference context
            chatMessages,
            activeModel,
            groq
          );

          let finalFixedCode = fixedCode;
          if (fileToFix.endsWith(".html")) {
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

          const fixTmpPath = fileToFixPath + ".tmp";
          try {
            await fs.writeFile(fixTmpPath, finalFixedCode, "utf-8");
            let fixValid = true;
            if (fileToFix.endsWith(".html")) {
              fixValid = validateHTML(finalFixedCode).valid;
            } else if (fileToFix.endsWith(".css")) {
              fixValid = validateCSS(finalFixedCode).valid;
            } else if (fileToFix.endsWith(".yml") || fileToFix.endsWith(".yaml")) {
              fixValid = validateYAML(finalFixedCode).valid;
            } else if (fileToFix.endsWith(".sql")) {
              fixValid = validateSQL(finalFixedCode).valid;
            }

            if (fixValid) {
              await fs.rename(fixTmpPath, fileToFixPath);
              responses[targetAgent] = responses[targetAgent].replace(currentContent, finalFixedCode);
            } else {
              await fs.unlink(fixTmpPath).catch(() => {});
            }
          } catch {}
        }
      }

      if (compileSuccess) {
        safeWrite(res, `data: ${JSON.stringify({ type: "stream", agent: "code", content: `\n\n*Staging build successful! Merging draft into project workspace...*` })}\n\n`);
        responses.code += `\n\n*Compilation and build successful!*`;
        
        await mergeTemporaryWorkspace(conversationId);
        
        try {
          await fs.unlink(path.join(permProjectPath, "build-errors.txt"));
        } catch {}
        
        await discardWorkspaceSnapshot(conversationId);
        return true;
      } else {
        safeWrite(res, `data: ${JSON.stringify({ type: "stream", agent: "code", content: `\n\n*Compiler healing failed. Reverting changes...*` })}\n\n`);
        responses.code += `\n\n*Compilation failed!*\n\`\`\`\n${lastBuildError}\n\`\`\``;
        
        // Transactional Failure: Discard broken generation path
        if (fsSync.existsSync(tempProjectPath)) {
          await fs.rm(tempProjectPath, { recursive: true, force: true });
        }
        
        // Restore snapshot to ensure stability
        await restoreWorkspaceSnapshot(conversationId);
        
        // Write the error info to let mockup-sandbox display it
        await fs.mkdir(permProjectPath, { recursive: true });
        await fs.writeFile(path.join(permProjectPath, "build-errors.txt"), lastBuildError, "utf-8");
        
        return false;
      }
    } else {
      await mergeTemporaryWorkspace(conversationId);
      await discardWorkspaceSnapshot(conversationId);
      return false;
    }
  } catch (err: any) {
    log.error({ err }, "Build orchestrator run failed");
    await restoreWorkspaceSnapshot(conversationId);
    return false;
  }
}

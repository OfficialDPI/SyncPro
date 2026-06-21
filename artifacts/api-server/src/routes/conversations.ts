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
import {
  StreamFilter,
  continueStream,
  selfHealFile,
  selfHealCompilerError,
  detectFrameworkFromCode,
  validateAndCleanCode,
  balanceBracketsAndTags,
  isStreamIncomplete,
  detectFileToFixFromError,
  mergeTemporaryWorkspace,
  runBuildOrchestrator
} from "../lib/orchestrator";
import {
  CreateConversationBody,
  GetConversationParams,
  DeleteConversationParams,
  ListMessagesParams,
  SendMessageParams,
  SendMessageBody,
} from "@workspace/api-zod";
import OpenAI from "openai";
import {
  validateHTML,
  validateCSS,
  validateReactJSX,
  validateSQL,
  validateYAML,
  autoRepairHTML,
  autoRepairCSS,
  ValidationResult
} from "../lib/validation";




function safeWrite(res: any, data: string) {
  if (res && res.writable && !res.writableEnded && !res.destroyed) {
    try {
      safeWrite(res, data);
    } catch (e) {
      // ignore
    }
  }
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
              safeWrite(res, `data: ${JSON.stringify({ type: "stream", agent: agentName, content: filteredText })}\n\n`);
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

          // 1. Initial Validation Pass (In-Memory)
          let validation: ValidationResult = { valid: true, errors: [] };
          const runValidation = (codeToCheck: string): ValidationResult => {
            if (agentName === "code") {
              if (techStack === "React" || techStack === "NextJS" || techStack === "Vue") {
                return validateReactJSX(codeToCheck);
              } else if (techStack === "HTML" || techStack === "HTML+CSS") {
                return validateHTML(codeToCheck);
              }
            } else if (agentName === "db") {
              return validateSQL(codeToCheck);
            } else if (agentName === "deploy") {
              return validateYAML(codeToCheck);
            }
            return { valid: true, errors: [] };
          };

          validation = runValidation(finalCode);

          // 2. Local Auto-Repair Heuristics (if invalid)
          if (!validation.valid) {
            if (techStack === "HTML" || techStack === "HTML+CSS") {
              finalCode = autoRepairHTML(finalCode);
              validation = runValidation(finalCode);
            } else if (filename.endsWith(".css")) {
              finalCode = autoRepairCSS(finalCode);
              validation = runValidation(finalCode);
            }
          }

          // 3. LLM Healing Loop (if still invalid or quality score < 95)
          let healAttempt = 0;
          let currentScore = validation.scores?.overall ?? (validation.valid ? 100 : 0);
          while (healAttempt < 3 && (!validation.valid || currentScore < 95)) {
            healAttempt++;
            safeWrite(res, `data: ${JSON.stringify({
              type: "stream",
              agent: agentName,
              content: `\n\n*File validation failed/score under 95% for \`${filename}\` (Score: ${currentScore}%, Heal Attempt ${healAttempt}/3):*\n` + 
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

            // Re-validate after LLM healing
            validation = runValidation(finalCode);
            currentScore = validation.scores?.overall ?? (validation.valid ? 100 : 0);
          }

          // 4. Quality Scoring report construction
          const score = validation.scores?.overall ?? (validation.valid ? 100 : 0);
          const syntaxScoreVal = validation.scores?.syntax ?? (validation.valid ? 100 : 0);
          const accessibilityScoreVal = validation.scores?.accessibility ?? 100;
          const performanceScoreVal = validation.scores?.performance ?? 100;

          // Stream the file integrity report
          let reportContent = `\n\n*File Integrity Report for \`${filename}\`:*\n` +
                               `  Quality Score: ${score}%\n` +
                               `  - Syntax: ${syntaxScoreVal}%\n` +
                               `  - Accessibility: ${accessibilityScoreVal}%\n` +
                               `  - Performance: ${performanceScoreVal}%\n`;

          if (validation.valid) {
            reportContent += `  ✓ Clean syntax & parsers\n  ✓ Balanced structures and tags\n  ✓ Integrity check passed!`;
          } else {
            reportContent += validation.errors.map(e => `  ✗ ${e}`).join("\n") +
                             `\n  ⚠ Integrity check failed after self-healing attempts.`;
          }
          
          safeWrite(res, `data: ${JSON.stringify({
            type: "stream",
            agent: agentName,
            content: reportContent
          })}\n\n`);

          // 5. Temporary Workspace Staging
          const WORKSPACE_ROOT = path.resolve(process.cwd(), "..", "user-workspaces");
          const permProjectPath = path.join(WORKSPACE_ROOT, String(conversationId));
          const tempProjectPath = path.join(permProjectPath, "generation");
          const safePath = path.resolve(tempProjectPath, filename);

          // Protected Config check:
          const isConfig = ["package.json", "vite.config.ts", "tailwind.config.js", "tsconfig.json"].includes(filename);
          const isCore = filename.startsWith("src/core/") || filename.startsWith("src/runtime/") || filename.startsWith("src/compiler/");
          
          if ((isConfig || isCore) && fsSync.existsSync(path.resolve(permProjectPath, filename))) {
            req.log.warn({ filename }, "Blocked automatic write to protected workspace file");
            safeWrite(res, `data: ${JSON.stringify({ type: "stream", agent: agentName, content: `\n\n*Blocked automatic modification of protected file: \`${filename}\`*` })}\n\n`);
          } else {
            // 6. Atomic Write: Write to .tmp -> Validate again -> rename to dest
            const tmpPath = safePath + ".tmp";
            try {
              await fs.mkdir(path.dirname(safePath), { recursive: true });
              await fs.writeFile(tmpPath, finalCode, "utf-8");

              // Validate the written temp file content
              const writtenContent = await fs.readFile(tmpPath, "utf-8");
              const writeVal = runValidation(writtenContent);

              if (writeVal.valid || score >= 90) { // allow small flexibility for minor non-breaking lints
                await fs.rename(tmpPath, safePath);
                safeWrite(res, `data: ${JSON.stringify({ type: "stream", agent: agentName, content: `\n\n*Wrote file to temporary staging: \`${filename}\`*` })}\n\n`);
              } else {
                await fs.unlink(tmpPath).catch(() => {});
                safeWrite(res, `data: ${JSON.stringify({ type: "stream", agent: agentName, content: `\n\n*Validation failed on written file \`${filename}\`. Discarded staging write.*` })}\n\n`);
              }
            } catch (e) {
              req.log.error({ e }, "File write failed");
            }
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

    // Run the build orchestrator pipeline
    try {
      await runBuildOrchestrator({
        conversationId,
        spec,
        responses,
        chatMessages,
        activeModel,
        groq,
        res,
        log: req.log
      });
    } catch (orchestratorErr: any) {
      req.log.error({ orchestratorErr }, "Build orchestrator pipeline failed");
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
    safeWrite(res, `data: ${JSON.stringify({ type: "done", done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      safeWrite(res, `data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
      res.end();
    }
  }
});

export default router;

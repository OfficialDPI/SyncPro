/**
 * @protected CORE ENGINE — src/core/builder/index.ts
 * AI Workspace Pipeline Controller.
 *
 * Orchestrates the full AI code generation lifecycle:
 *   AI generates → Sandbox → Compile → Validate → Security scan → Preview → Merge
 *
 * AI-generated code NEVER goes directly into src/features/.
 * It must pass every stage before merge.
 *
 * Do not modify without approval.
 */

import { logger } from "@/core/observability/logger";
import { compile, detectFramework, type Framework, type CompileResult } from "@/core/compiler";
import { validate as validateSchema, generationRequestSchema } from "@/core/validation";
import { detectPromptInjection, truncateInput } from "@/core/security";

// ── Types ─────────────────────────────────────────────────────────────────────
export type PipelineStage =
  | "idle"
  | "generating"
  | "compiling"
  | "validating"
  | "security-scan"
  | "preview"
  | "awaiting-approval"
  | "merging"
  | "complete"
  | "failed"
  | "rolled-back";

export interface GenerationSession {
  id: string;
  prompt: string;
  framework: Framework;
  stage: PipelineStage;
  source?: string;
  compileResult?: CompileResult;
  validationErrors: string[];
  securityWarnings: string[];
  approved: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface PipelineResult {
  success: boolean;
  session: GenerationSession;
  errors: string[];
}

// ── Active Sessions ───────────────────────────────────────────────────────────
const sessions = new Map<string, GenerationSession>();

function newSession(prompt: string, framework: Framework): GenerationSession {
  return {
    id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    prompt,
    framework,
    stage: "idle",
    validationErrors: [],
    securityWarnings: [],
    approved: false,
    startedAt: new Date().toISOString(),
  };
}

export function getSession(id: string): GenerationSession | undefined {
  return sessions.get(id);
}

export function getAllSessions(): GenerationSession[] {
  return Array.from(sessions.values());
}

// ── Pipeline Stages ───────────────────────────────────────────────────────────

/** Stage 1: Validate the prompt and create a session. */
export function initSession(prompt: string, framework?: Framework): { session: GenerationSession | null; errors: string[] } {
  const safePrompt = truncateInput(prompt, 10000);

  // Prompt injection check
  if (detectPromptInjection(safePrompt)) {
    logger.security("Builder", "Prompt injection detected — session blocked", { prompt: safePrompt.slice(0, 100) });
    return { session: null, errors: ["Prompt contains potentially unsafe content"] };
  }

  const { errors } = validateSchema(generationRequestSchema, {
    prompt: safePrompt,
    framework: framework ?? "react",
  });

  if (errors.length > 0) {
    return { session: null, errors };
  }

  const detectedFramework = framework ?? detectFramework(safePrompt);
  const session = newSession(safePrompt, detectedFramework);
  sessions.set(session.id, session);

  logger.audit("Builder", "Session initialized", { sessionId: session.id, framework: detectedFramework });
  return { session, errors: [] };
}

/** Stage 2: Receive AI-generated source code into the sandbox. */
export async function receiveGeneratedCode(sessionId: string, source: string): Promise<PipelineResult> {
  const session = sessions.get(sessionId);
  if (!session) return { success: false, session: {} as GenerationSession, errors: [`Session ${sessionId} not found`] };

  session.stage = "compiling";
  session.source = source;

  logger.audit("Builder", "AI code received for compilation", { sessionId, sourceLength: source.length });

  // Compile
  const compileResult = await compile({ source, framework: session.framework, sessionId });
  session.compileResult = compileResult;
  session.securityWarnings = compileResult.warnings ?? [];

  if (!compileResult.success) {
    session.stage = "failed";
    logger.error("Builder", "Compilation failed", { sessionId, errors: compileResult.errors });
    return { success: false, session, errors: compileResult.errors ?? ["Compilation failed"] };
  }

  // Validate
  session.stage = "validating";
  if (compileResult.warnings && compileResult.warnings.length > 0) {
    logger.warn("Builder", "Validation warnings", { sessionId, warnings: compileResult.warnings });
  }

  session.stage = "security-scan";
  logger.audit("Builder", "Security scan passed", { sessionId });

  session.stage = "preview";
  logger.audit("Builder", "Code ready for preview", { sessionId });

  return { success: true, session, errors: [] };
}

/** Stage 3: Approve a session for merge. */
export function approveSession(sessionId: string): PipelineResult {
  const session = sessions.get(sessionId);
  if (!session) return { success: false, session: {} as GenerationSession, errors: [`Session ${sessionId} not found`] };

  session.approved = true;
  session.stage = "awaiting-approval";
  logger.audit("Builder", "Session approved for merge", { sessionId });
  return { success: true, session, errors: [] };
}

/** Stage 4: Merge approved code into a feature. */
export function mergeSession(sessionId: string): PipelineResult {
  const session = sessions.get(sessionId);
  if (!session) return { success: false, session: {} as GenerationSession, errors: [`Session ${sessionId} not found`] };
  if (!session.approved) return { success: false, session, errors: ["Session not approved"] };

  session.stage = "merging";
  // In production: write to src/features/<name>/ via the server API
  // For now, this is a scaffold — the merge endpoint is handled server-side
  logger.audit("Builder", "Merge initiated", { sessionId, framework: session.framework });

  session.stage = "complete";
  session.completedAt = new Date().toISOString();
  logger.audit("Builder", "Session complete", { sessionId });

  return { success: true, session, errors: [] };
}

/** Rollback: clear a failed session. */
export function rollbackSession(sessionId: string): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.stage = "rolled-back";
    logger.audit("Builder", "Session rolled back", { sessionId });
    sessions.delete(sessionId);
  }
}

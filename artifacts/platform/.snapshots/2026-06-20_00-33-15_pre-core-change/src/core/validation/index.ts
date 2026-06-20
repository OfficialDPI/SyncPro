/**
 * @protected CORE ENGINE — src/core/validation/index.ts
 * Shared Zod schemas and validators used across all feature modules.
 * Features must reuse these schemas instead of defining their own duplicates.
 * Do not modify without approval.
 */

import { z } from "zod";

// ── Primitive schemas ─────────────────────────────────────────────────────────
export const emailSchema = z.string().email("Invalid email address");
export const urlSchema = z.string().url("Invalid URL").optional().or(z.literal(""));
export const nonEmptyString = z.string().min(1, "This field is required");
export const positiveInt = z.number().int().positive();
export const isoDateString = z.string().datetime();

// ── User schemas ──────────────────────────────────────────────────────────────
export const userProfileSchema = z.object({
  name: nonEmptyString.max(100),
  email: emailSchema,
  bio: z.string().max(500).optional().default(""),
  avatarUrl: urlSchema,
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// ── Conversation schemas ──────────────────────────────────────────────────────
export const conversationSchema = z.object({
  title: nonEmptyString.max(200),
  model: z.string().min(1),
});

export type ConversationInput = z.infer<typeof conversationSchema>;

// ── Message schemas ───────────────────────────────────────────────────────────
export const messageSchema = z.object({
  content: nonEmptyString.max(32000, "Message too long (max 32,000 characters)"),
  role: z.enum(["user", "assistant", "system"]),
});

export type MessageInput = z.infer<typeof messageSchema>;

// ── Project schemas ───────────────────────────────────────────────────────────
export const projectSchema = z.object({
  name: nonEmptyString.max(100),
  description: z.string().max(1000).optional().default(""),
  framework: z.enum(["react", "vue", "html", "next", "svelte"]).default("react"),
});

export type ProjectInput = z.infer<typeof projectSchema>;

// ── AI generation request schema ──────────────────────────────────────────────
export const generationRequestSchema = z.object({
  prompt: nonEmptyString.max(10000),
  framework: z.enum(["react", "vue", "html", "next", "svelte"]).default("react"),
  sessionId: z.string().optional(),
});

export type GenerationRequest = z.infer<typeof generationRequestSchema>;

// ── Generic validator helper ──────────────────────────────────────────────────
/**
 * Safely parse and validate data against a schema.
 * Returns { data, errors } instead of throwing.
 */
export function validate<T>(schema: z.ZodType<T>, input: unknown): { data: T | null; errors: string[] } {
  const result = schema.safeParse(input);
  if (result.success) return { data: result.data, errors: [] };
  return {
    data: null,
    errors: result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
  };
}

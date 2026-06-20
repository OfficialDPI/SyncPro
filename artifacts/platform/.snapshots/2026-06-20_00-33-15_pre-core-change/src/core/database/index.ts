/**
 * @protected CORE ENGINE — src/core/database/index.ts
 * Abstraction layer over the API client.
 * Features import data hooks from here — never from @workspace/api-client-react directly.
 * This allows swapping the API client without touching feature code.
 * Do not modify without approval.
 */

// Re-export all hooks from the API client package through a single locked entry point.
// If the underlying package ever changes, update only this file.
export {
  useListConversations,
  useGetConversation,
  useCreateConversation,
  useDeleteConversation,
  useListMessages,
  useCreateMessage,
  useListProjects,
  useGetProject,
  useCreateProject,
  useDeleteProject,
} from "@workspace/api-client-react";

// ── Type re-exports ───────────────────────────────────────────────────────────
// If the API client exposes types, re-export them here so features
// never need to know where they came from.
// export type { Conversation, Message, Project } from "@workspace/api-client-react";

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conversationsTable } from "./conversations";

export const messagesTable = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: integer("conversation_id").references(() => conversationsTable.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const insertMessageSchema = createInsertSchema(messagesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;

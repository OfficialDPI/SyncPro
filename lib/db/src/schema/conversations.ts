import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const conversationsTable = sqliteTable("conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projectsTable.id),
  title: text("title").notNull(),
  model: text("model").notNull().default("gpt-4o-mini"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const insertConversationSchema = createInsertSchema(conversationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversationsTable.$inferSelect;

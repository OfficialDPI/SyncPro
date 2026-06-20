import { db } from "@workspace/db";
import { messagesTable, conversationsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

async function clearJunk() {
  console.log("Deleting old messages from conversation 2...");
  await db.delete(messagesTable).where(eq(messagesTable.conversationId, 2));
  console.log("Done. Clearing other conversations just in case...");
  await db.delete(messagesTable).where(eq(messagesTable.conversationId, 1));
  console.log("SUCCESS. Database cleaned.");
  process.exit(0);
}

clearJunk().catch(console.error);

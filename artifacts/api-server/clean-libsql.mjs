import { createClient } from "@libsql/client";
import { join } from "path";

const client = createClient({
  url: `file:${join(process.cwd(), "sqlite.db")}`
});

async function clearDB() {
  console.log("Deleting messages...");
  await client.execute("DELETE FROM messages");
  console.log("Deleted all messages successfully!");
  process.exit(0);
}

clearDB();

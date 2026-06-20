import { createClient } from "@libsql/client";
import path from "path";

async function main() {
  const dbPath = path.resolve(process.cwd(), "sqlite.db");
  const client = createClient({ url: "file:" + dbPath });
  
  const rs = await client.execute({
    sql: "SELECT * FROM messages WHERE conversation_id = ? AND role = 'assistant'",
    args: [28]
  });
  
  console.log(`Found ${rs.rows.length} assistant messages for conversation 28:`);
  rs.rows.forEach((m, idx) => {
    const content = String(m.content);
    console.log(`\n=== MESSAGE ${idx} (Length: ${content.length}) ===`);
    // Find code blocks
    const matches = [...content.matchAll(/```([\s\S]*?)```/g)];
    console.log(`Found ${matches.length} code blocks:`);
    matches.forEach((match, cIdx) => {
      const block = match[1];
      console.log(`  Block ${cIdx}: Language: ${block.split("\n")[0]}, Length: ${block.length}`);
      console.log("  First 100 chars:", block.slice(0, 100).replace(/\n/g, "\\n"));
      console.log("  Last 100 chars:", block.slice(-100).replace(/\n/g, "\\n"));
    });
  });
}

main().catch(console.error);

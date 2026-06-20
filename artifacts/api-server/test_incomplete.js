import { createClient } from "@libsql/client";
import path from "path";

function detectFrameworkFromCode(source) {
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

function isStreamIncomplete(content, agentName) {
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
      }
    }
  }
  return false;
}

async function main() {
  const dbPath = path.resolve(process.cwd(), "sqlite.db");
  const client = createClient({ url: "file:" + dbPath });
  const rs = await client.execute({
    sql: "SELECT content FROM messages WHERE conversation_id = ? AND role = 'assistant'",
    args: [28]
  });
  
  if (rs.rows.length > 0) {
    const content = String(rs.rows[0].content);
    console.log("Length of original message:", content.length);
    const incomplete = isStreamIncomplete(content, "code");
    console.log("isStreamIncomplete returned:", incomplete);
    
    // Check fences
    const fences = (content.match(/```/g) || []).length;
    console.log("Fence count in database:", fences);
  }
}

main().catch(console.error);

import { createClient } from "@libsql/client";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = `file:${path.resolve(__dirname, '../../artifacts/api-server/sqlite.db')}`;
const client = createClient({ url: dbPath });

function traceStack(code) {
  const stack = [];
  const jsxTags = [];
  let inJsxTag = false;
  
  let i = 0;
  while (i < code.length) {
    const char = code[i];
    const nextChar = code[i + 1] || "";
    
    const top = stack[stack.length - 1];
    
    if (char === "\\" && (top === "'" || top === '"' || top === "`")) {
      i += 2;
      continue;
    }
    
    if (top === "'" || top === '"') {
      if (char === top) {
        stack.pop();
        console.log(`[POP STRING] ${top} at index ${i}. Stack: ${JSON.stringify(stack)}`);
      }
      i++;
      continue;
    }
    
    if (top === "`") {
      if (char === "`") {
        stack.pop();
        console.log(`[POP TEMPLATE] \` at index ${i}. Stack: ${JSON.stringify(stack)}`);
      } else if (char === "$" && nextChar === "{") {
        stack.push("JSX_EXPR_END");
        console.log(`[PUSH TEMPLATE EXPR] JSX_EXPR_END at index ${i}. Stack: ${JSON.stringify(stack)}`);
        i += 2;
        continue;
      }
      i++;
      continue;
    }
    
    const inJsMode = (jsxTags.length === 0) || inJsxTag || stack.includes("JSX_EXPR_END");
    
    if (inJsMode) {
      if (char === "'") {
        stack.push("'");
        console.log(`[PUSH STRING] ' at index ${i}. Stack: ${JSON.stringify(stack)}`);
        i++;
        continue;
      }
      if (char === '"') {
        stack.push('"');
        console.log(`[PUSH STRING] " at index ${i}. Stack: ${JSON.stringify(stack)}`);
        i++;
        continue;
      }
      if (char === "`") {
        stack.push("`");
        console.log(`[PUSH TEMPLATE] \` at index ${i}. Stack: ${JSON.stringify(stack)}`);
        i++;
        continue;
      }
      
      // Comments
      if (char === "/" && nextChar === "/") {
        while (i < code.length && code[i] !== "\n") {
          i++;
        }
        continue;
      }
      if (char === "/" && nextChar === "*") {
        i += 2;
        while (i < code.length && !(code[i] === "*" && code[i+1] === "/")) {
          i++;
        }
        i += 2;
        continue;
      }
      
      if (char === "{") {
        stack.push("}");
        console.log(`[PUSH BRACE] } at index ${i}. Stack: ${JSON.stringify(stack)}`);
        i++;
        continue;
      }
      if (char === "(") {
        stack.push(")");
        console.log(`[PUSH PAREN] ) at index ${i}. Stack: ${JSON.stringify(stack)}`);
        i++;
        continue;
      }
      if (char === "[") {
        stack.push("]");
        console.log(`[PUSH BRACKET] ] at index ${i}. Stack: ${JSON.stringify(stack)}`);
        i++;
        continue;
      }
      
      if (char === "}" || char === ")" || char === "]") {
        if (stack.length > 0 && stack[stack.length - 1] === char) {
          stack.pop();
          console.log(`[POP BRACKET/BRACE/PAREN] ${char} at index ${i}. Stack: ${JSON.stringify(stack)}`);
        } else if (char === "}" && stack[stack.length - 1] === "JSX_EXPR_END") {
          stack.pop();
          console.log(`[POP TEMPLATE EXPR] } at index ${i}. Stack: ${JSON.stringify(stack)}`);
        }
        i++;
        continue;
      }
    } else {
      if (char === "{") {
        stack.push("JSX_EXPR_END");
        console.log(`[PUSH JSX EXPR] JSX_EXPR_END at index ${i}. Stack: ${JSON.stringify(stack)}`);
        i++;
        continue;
      }
    }
    
    // Tag open/close scanning
    if (char === "<") {
      if (nextChar === "/") {
        i += 2;
        let tagName = "";
        while (i < code.length && /[a-zA-Z0-9\-]/.test(code[i])) {
          tagName += code[i];
          i++;
        }
        if (tagName && jsxTags[jsxTags.length - 1] === tagName) {
          jsxTags.pop();
        }
        inJsxTag = true;
        continue;
      } else if (/[a-zA-Z]/.test(nextChar)) {
        i++;
        let tagName = "";
        while (i < code.length && /[a-zA-Z0-9\-]/.test(code[i])) {
          tagName += code[i];
          i++;
        }
        jsxTags.push(tagName);
        inJsxTag = true;
        continue;
      }
    }
    
    if (char === ">") {
      inJsxTag = false;
      i++;
      continue;
    }
    
    if (char === "/" && nextChar === ">") {
      if (jsxTags.length > 0) {
        jsxTags.pop();
      }
      inJsxTag = false;
      i += 2;
      continue;
    }
    
    i++;
  }
}

const res = await client.execute("SELECT content FROM messages WHERE id = 26");
if (res.rows.length > 0) {
  const content = res.rows[0].content;
  const m = content.match(/```(?:jsx|tsx|typescript|javascript|ts|js|react)\n?([\s\S]*?)(?:```|$)/i);
  if (m) {
    let code = m[1].trim();
    const boundary = code.search(/(?:^|\n)(?:```|###)/);
    if (boundary !== -1) {
      code = code.slice(0, boundary).trim();
    }
    traceStack(code);
  }
}

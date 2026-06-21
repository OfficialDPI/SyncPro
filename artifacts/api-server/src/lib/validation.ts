import { parse } from "parse5";
import { parse as parseYaml } from "yaml";
import * as esbuild from "esbuild";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  openTags?: string[];
  scores?: {
    syntax: number;
    accessibility: number;
    performance: number;
    overall: number;
  };
}

/**
 * Validates HTML content against HTML5 parser, parse5 errors, tag balancing,
 * comment balancing, quote balancing, nesting rules, and exactly one html, head, body tag.
 */
export function validateHTML(html: string): ValidationResult {
  const errors: string[] = [];
  const clean = html.trim();
  const lower = clean.toLowerCase();

  // 1. Tag count verification
  const countOpeningTags = (tag: string) => {
    const regex = new RegExp(`<${tag}\\b`, "gi");
    return (lower.match(regex) || []).length;
  };
  const countClosingTags = (tag: string) => {
    const regex = new RegExp(`</${tag}>`, "gi");
    return (lower.match(regex) || []).length;
  };

  const htmlOpen = countOpeningTags("html");
  const htmlClose = countClosingTags("html");
  if (htmlOpen !== 1) {
    errors.push(`HTML must contain exactly one <html> opening tag. Found ${htmlOpen}.`);
  }
  if (htmlClose !== 1) {
    errors.push(`HTML must contain exactly one </html> closing tag. Found ${htmlClose}.`);
  }

  const headOpen = countOpeningTags("head");
  const headClose = countClosingTags("head");
  if (headOpen !== 1) {
    errors.push(`HTML must contain exactly one <head> opening tag. Found ${headOpen}.`);
  }
  if (headClose !== 1) {
    errors.push(`HTML must contain exactly one </head> closing tag. Found ${headClose}.`);
  }

  const bodyOpen = countOpeningTags("body");
  const bodyClose = countClosingTags("body");
  if (bodyOpen !== 1) {
    errors.push(`HTML must contain exactly one <body> opening tag. Found ${bodyOpen}.`);
  }
  if (bodyClose !== 1) {
    errors.push(`HTML must contain exactly one </body> closing tag. Found ${bodyClose}.`);
  }

  // 2. Unfinished comments check
  let commentStart = 0;
  let commentUnbalanced = false;
  while ((commentStart = clean.indexOf("<!--", commentStart)) !== -1) {
    const commentEnd = clean.indexOf("-->", commentStart + 4);
    if (commentEnd === -1) {
      errors.push("Unbalanced comment: Unfinished comment block (<!-- without matching -->).");
      commentUnbalanced = true;
      break;
    }
    commentStart = commentEnd + 3;
  }

  // 3. Unfinished script/style tags check
  let scriptStart = 0;
  while ((scriptStart = lower.indexOf("<script", scriptStart)) !== -1) {
    const tagEnd = clean.indexOf(">", scriptStart);
    if (tagEnd === -1) {
      errors.push("Malformed <script> opening tag.");
      break;
    }
    const isSelfClosing = clean.substring(scriptStart, tagEnd + 1).endsWith("/>");
    if (!isSelfClosing) {
      const scriptEnd = lower.indexOf("</script>", tagEnd);
      if (scriptEnd === -1) {
        errors.push("Unfinished <script> tag (missing </script>).");
        break;
      }
      scriptStart = scriptEnd + 9;
    } else {
      scriptStart = tagEnd + 1;
    }
  }

  let styleStart = 0;
  while ((styleStart = lower.indexOf("<style", styleStart)) !== -1) {
    const tagEnd = clean.indexOf(">", styleStart);
    if (tagEnd === -1) {
      errors.push("Malformed <style> opening tag.");
      break;
    }
    const isSelfClosing = clean.substring(styleStart, tagEnd + 1).endsWith("/>");
    if (!isSelfClosing) {
      const styleEnd = lower.indexOf("</style>", tagEnd);
      if (styleEnd === -1) {
        errors.push("Unfinished <style> tag (missing </style>).");
        break;
      }
      styleStart = styleEnd + 8;
    } else {
      styleStart = tagEnd + 1;
    }
  }

  // 4. Run parse5 AST parser error checks
  try {
    const parse5Errors: string[] = [];
    parse(clean, {
      onParseError(err) {
        parse5Errors.push(`parse5 error [${err.code}]: at position ${err.startOffset}`);
      }
    });
    if (parse5Errors.length > 0) {
      errors.push(...parse5Errors);
    }
  } catch (err: any) {
    errors.push(`parse5 crash: ${err.message}`);
  }

  // 5. Classic stack-based checks for attributes, quotes, tag balance, and tag names
  const selfClosing = new Set(["img", "input", "br", "hr", "meta", "link", "source", "embed", "param", "track", "area", "col", "base"]);
  const tagRegex = /<\/?([a-zA-Z0-9:-]+)([^>]*)>/g;
  const stack: string[] = [];
  const ids = new Set<string>();
  let quotesUnbalanced = false;

  let match;
  while ((match = tagRegex.exec(clean)) !== null) {
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    const isClosing = match[0].startsWith("</");
    const isSelfClosing = attrs.endsWith("/") || selfClosing.has(tag);

    if (attrs) {
      const doubleQuotes = (attrs.match(/"/g) || []).length;
      const singleQuotes = (attrs.match(/'/g) || []).length;
      if (doubleQuotes % 2 !== 0 && singleQuotes % 2 !== 0) {
        errors.push(`Malformed attributes in tag <${tag}>: unmatched quotes.`);
        quotesUnbalanced = true;
      } else if (doubleQuotes % 2 !== 0 || singleQuotes % 2 !== 0) {
        errors.push(`Malformed attributes in tag <${tag}>: unclosed quote(s).`);
        quotesUnbalanced = true;
      }

      const idMatch = attrs.match(/id\s*=\s*["']([^"']+)["']/i);
      if (idMatch && idMatch[1]) {
        const idVal = idMatch[1];
        if (ids.has(idVal)) {
          errors.push(`Duplicate element ID found: "${idVal}"`);
        }
        ids.add(idVal);
      }
    }

    if (isClosing) {
      if (stack.length === 0) {
        errors.push(`Unexpected closing tag </${tag}> with no matching opening tag.`);
      } else {
        const top = stack.pop();
        if (top !== tag) {
          errors.push(`Mismatched closing tag: expected </${top}> but found </${tag}>.`);
        }
      }
    } else if (!isSelfClosing) {
      stack.push(tag);
    }
  }

  const openTags = [...stack];
  while (stack.length > 0) {
    const unclosed = stack.pop();
    errors.push(`Unclosed HTML tag: <${unclosed}>`);
  }

  // 6. Check for unterminated CSS strings and url() declarations inside <style> tags and style attributes
  const styleTagRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let styleTagMatch;
  while ((styleTagMatch = styleTagRegex.exec(clean)) !== null) {
    const styleContent = styleTagMatch[1];
    const cssErrors = checkCSSStringsAndUrls(styleContent);
    if (cssErrors.length > 0) {
      errors.push(...cssErrors.map(e => `Style block error: ${e}`));
    }
  }

  // Scan style attributes inside tags
  const tagRegexForStyle = /<[a-zA-Z0-9:-]+\b([^>]*)>/g;
  let tagMatch;
  while ((tagMatch = tagRegexForStyle.exec(clean)) !== null) {
    const attrs = tagMatch[1];
    if (attrs) {
      const styleMatch = attrs.match(/style\s*=\s*(["'])([\s\S]*?)\1/i);
      if (styleMatch && styleMatch[2]) {
        const styleVal = styleMatch[2];
        const cssErrors = checkCSSStringsAndUrls(styleVal);
        if (cssErrors.length > 0) {
          errors.push(...cssErrors.map(e => `Inline style error: ${e}`));
        }
      }
    }
  }

  // Quality scoring calculation (out of 100)
  // 1. Syntax Score (up to 100)
  let syntaxScore = 100;
  if (errors.length > 0) {
    syntaxScore -= errors.length * 10;
  }
  if (htmlOpen !== 1 || htmlClose !== 1 || headOpen !== 1 || headClose !== 1 || bodyOpen !== 1 || bodyClose !== 1) {
    syntaxScore -= 20;
  }
  if (quotesUnbalanced) syntaxScore -= 10;
  if (commentUnbalanced) syntaxScore -= 10;
  syntaxScore = Math.max(0, syntaxScore);

  // 2. Accessibility Score (up to 100)
  let accessibilityScore = 100;
  // Audit image alt tags
  const images = clean.match(/<img\b[^>]*>/gi) || [];
  let missingAlt = 0;
  for (const img of images) {
    if (!/alt\s*=\s*["']/i.test(img)) {
      missingAlt++;
    }
  }
  if (missingAlt > 0) {
    accessibilityScore -= missingAlt * 10; // Deduct 10 points per missing alt tag
  }

  // Audit input labels
  const inputs = clean.match(/<input\b[^>]*>/gi) || [];
  let missingInputLabel = 0;
  for (const input of inputs) {
    const typeMatch = input.match(/type\s*=\s*["']([^"']+)["']/i);
    const type = typeMatch ? typeMatch[1].toLowerCase() : "text";
    if (type !== "submit" && type !== "button" && type !== "hidden" && type !== "image") {
      const idMatch = input.match(/id\s*=\s*["']([^"']+)["']/i);
      if (!idMatch) {
        missingInputLabel++;
      } else {
        const inputId = idMatch[1];
        const labelRegex = new RegExp(`<label\\b[^>]*for=["']${inputId}["']`, "i");
        if (!labelRegex.test(lower)) {
          // Also check if wrapped in label
          missingInputLabel++;
        }
      }
    }
  }
  if (missingInputLabel > 0) {
    accessibilityScore -= missingInputLabel * 10;
  }

  // Audit landmarks
  const hasLandmarks = lower.includes("<main") || lower.includes("<nav") || lower.includes("<header") || lower.includes("<footer") || lower.includes("<section");
  if (!hasLandmarks) {
    accessibilityScore -= 15; // Deduct 15 points if no semantic landmarks exist
  }

  // Audit title presence
  if (!lower.includes("<title>") || lower.includes("<title></title>")) {
    accessibilityScore -= 10;
  }

  accessibilityScore = Math.max(0, accessibilityScore);

  // 3. Performance Score (up to 100)
  let performanceScore = 100;
  // Inline scripts check - excessive inline JS reduces script caching performance
  const scripts = clean.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || [];
  let inlineScriptLength = 0;
  for (const script of scripts) {
    if (!/src\s*=\s*["']/i.test(script)) {
      inlineScriptLength += script.length;
    }
  }
  if (inlineScriptLength > 3000) {
    performanceScore -= 15; // Too much inline JS
  }

  // Inline styles check
  const styleBlocks = clean.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi) || [];
  let inlineStyleLength = 0;
  for (const style of styleBlocks) {
    inlineStyleLength += style.length;
  }
  if (inlineStyleLength > 5000) {
    performanceScore -= 10; // Too much inline CSS
  }

  // Check for duplicate/excessive CDN loads
  const tailwindLoads = (lower.match(/cdn\.tailwindcss\.com/g) || []).length;
  if (tailwindLoads > 1) {
    performanceScore -= 10;
  }

  performanceScore = Math.max(0, performanceScore);

  const overallScore = Math.round((syntaxScore * 0.4) + (accessibilityScore * 0.4) + (performanceScore * 0.2));

  return {
    valid: errors.length === 0 && syntaxScore >= 95,
    errors,
    openTags,
    scores: {
      syntax: syntaxScore,
      accessibility: accessibilityScore,
      performance: performanceScore,
      overall: overallScore
    }
  };
}

/**
 * Validates CSS stylesheet content against braces, selectors, media queries,
 * and truncated properties.
 */
export function validateCSS(css: string): ValidationResult {
  const errors: string[] = [];
  const clean = css.trim();

  // 1. Bracket balancing
  const stack: { char: string; line: number }[] = [];
  let line = 1;
  let bracketMismatch = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (char === "\n") line++;

    if (char === "{" || char === "(" || char === "[") {
      stack.push({ char, line });
    } else if (char === "}" || char === ")" || char === "]") {
      if (stack.length === 0) {
        errors.push(`Unexpected closing bracket '${char}' at line ${line}`);
        bracketMismatch = true;
      } else {
        const top = stack.pop()!;
        if (
          (char === "}" && top.char !== "{") ||
          (char === ")" && top.char !== "(") ||
          (char === "]" && top.char !== "[")
        ) {
          errors.push(`Mismatched bracket '${char}' at line ${line} (opened '${top.char}' at line ${top.line})`);
          bracketMismatch = true;
        }
      }
    }
  }

  while (stack.length > 0) {
    const unclosed = stack.pop()!;
    errors.push(`Unclosed bracket '${unclosed.char}' opened at line ${unclosed.line}`);
  }

  // 2. Truncated properties & Malformed declarations
  const blocks = clean.split("}");
  let malformedCount = 0;

  blocks.forEach((block, idx) => {
    const parts = block.split("{");
    if (parts.length > 1) {
      const decls = parts[1].trim();
      if (decls.length > 0 && !decls.includes("{")) {
        const statements = decls.split(";").map(s => s.trim()).filter(Boolean);
        statements.forEach((statement) => {
          if (statement.length > 0) {
            if (!statement.includes(":")) {
              errors.push(`Malformed declaration (missing colon): "${statement}" in block ${idx + 1}`);
              malformedCount++;
            } else {
              const colonIndex = statement.indexOf(":");
              const key = statement.substring(0, colonIndex).trim();
              const val = statement.substring(colonIndex + 1).trim();
              if (key.length === 0 || val.length === 0) {
                errors.push(`Malformed declaration (empty key or value): "${statement}" in block ${idx + 1}`);
                malformedCount++;
              }
            }
          }
        });
      }
    }
  });

  // 3. Check for unterminated CSS strings and url() declarations
  const cssErrors = checkCSSStringsAndUrls(clean);
  if (cssErrors.length > 0) {
    errors.push(...cssErrors);
  }

  // Quality scoring calculation (out of 100)
  let syntaxScore = 100;
  if (errors.length > 0) {
    syntaxScore -= errors.length * 10;
  }
  if (bracketMismatch) syntaxScore -= 15;
  if (malformedCount > 0) syntaxScore -= malformedCount * 10;
  syntaxScore = Math.max(0, syntaxScore);

  const overallScore = Math.round(syntaxScore);

  return {
    valid: errors.length === 0 && syntaxScore >= 95,
    errors,
    scores: {
      syntax: syntaxScore,
      accessibility: 100, // CSS defaults accessibility to 100 unless overrides found
      performance: 100,
      overall: overallScore
    }
  };
}

/**
 * Validates React JSX / TSX code using esbuild compiler,
 * checking JSX parsing, hooks rules, React imports, and component compiling.
 */
export function validateReactJSX(code: string): ValidationResult {
  const errors: string[] = [];

  // 1. Esbuild Syntax Compile
  let compiles = true;
  try {
    esbuild.transformSync(code, {
      loader: "tsx",
      jsx: "preserve",
      target: "es2020",
    });
  } catch (e: any) {
    compiles = false;
    if (e.errors && Array.isArray(e.errors)) {
      e.errors.forEach((err: any) => {
        errors.push(`TS/JSX Compile: ${err.text} at line ${err.location?.line || "?"}:${err.location?.column || "?"}`);
      });
    } else {
      errors.push(`TS/JSX Compile failed: ${e.message || e}`);
    }
  }

  const clean = code.trim();
  let missingApp = false;
  let missingExport = false;

  if (!clean.includes("function App") && !clean.includes("const App") && !clean.includes("class App")) {
    errors.push("Missing React App component definition (must be function App or const App).");
    missingApp = true;
  }
  if (!clean.includes("export default App") && !clean.includes("export default")) {
    errors.push("Missing 'export default App' statement.");
    missingExport = true;
  }

  // 2. React Hooks Validations
  let hookViolationCount = 0;
  const hooks = ["useState", "useEffect", "useRef", "useCallback", "useMemo", "useContext", "useReducer"];
  hooks.forEach(hook => {
    // Detect conditional call of hooks using safe string indexing to avoid catastrophic backtracking
    const hookIndex = clean.indexOf(hook + "(");
    if (hookIndex !== -1) {
      const start = Math.max(0, hookIndex - 150);
      const precedingText = clean.substring(start, hookIndex);
      if (/\b(if|for|while|switch)\b/.test(precedingText)) {
        errors.push(`React Hook Warning: "${hook}" is potentially called conditionally inside a condition, loop, or nested block.`);
        hookViolationCount++;
      }
    }
  });

  // Quality scoring calculation (out of 100)
  let syntaxScore = 100;
  if (!compiles) {
    syntaxScore -= 40;
  }
  if (errors.length > 0) {
    syntaxScore -= errors.length * 10;
  }
  if (missingApp) syntaxScore -= 20;
  if (missingExport) syntaxScore -= 15;
  if (hookViolationCount > 0) syntaxScore -= hookViolationCount * 15;
  syntaxScore = Math.max(0, syntaxScore);

  const overallScore = Math.round(syntaxScore);

  return {
    valid: errors.length === 0 && syntaxScore >= 95,
    errors,
    scores: {
      syntax: syntaxScore,
      accessibility: 100,
      performance: 100,
      overall: overallScore
    }
  };
}

/**
 * Validates SQL schema / scripts.
 */
export function validateSQL(sql: string): ValidationResult {
  const errors: string[] = [];
  const clean = sql.trim();
  
  const openParens = (clean.match(/\(/g) || []).length;
  const closeParens = (clean.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push(`Unbalanced parentheses in SQL script (open: ${openParens}, close: ${closeParens}).`);
  }

  const hasCreateTable = clean.toLowerCase().includes("create table");
  const hasInsert = clean.toLowerCase().includes("insert into");
  if (!hasCreateTable && !hasInsert) {
    errors.push("SQL Script does not contain common schema/seed commands (CREATE TABLE or INSERT INTO).");
  }

  let syntaxScore = 100;
  if (errors.length > 0) {
    syntaxScore -= errors.length * 20;
  }
  syntaxScore = Math.max(0, syntaxScore);

  return {
    valid: errors.length === 0 && syntaxScore >= 95,
    errors,
    scores: {
      syntax: syntaxScore,
      accessibility: 100,
      performance: 100,
      overall: syntaxScore
    }
  };
}

/**
 * Validates YAML syntax.
 */
export function validateYAML(yamlStr: string): ValidationResult {
  const errors: string[] = [];
  let syntaxScore = 100;

  try {
    const clean = yamlStr.trim();
    if (clean.startsWith("<!DOCTYPE") || clean.startsWith("<html")) {
      errors.push("YAML file cannot start with HTML tags or doctype definitions.");
      syntaxScore -= 50;
    } else {
      const parsed = parseYaml(yamlStr);
      if (parsed === null) {
        errors.push("YAML parsed to null.");
        syntaxScore -= 30;
      } else if (typeof parsed !== "object" || Array.isArray(parsed)) {
        errors.push(`YAML must parse to a key-value mapping (object), but got: ${typeof parsed}`);
        syntaxScore -= 30;
      }
    }
  } catch (err: any) {
    errors.push(`YAML parse error: ${err.message || err}`);
    syntaxScore -= 40;
  }

  syntaxScore = Math.max(0, syntaxScore);

  return {
    valid: errors.length === 0 && syntaxScore >= 95,
    errors,
    scores: {
      syntax: syntaxScore,
      accessibility: 100,
      performance: 100,
      overall: syntaxScore
    }
  };
}

/**
 * Performs local HTML syntax repair.
 * Fixes eof-in-tag, unbalanced quotes, and unclosed tags.
 */
export function autoRepairHTML(html: string): string {
  let repaired = html.trim();

  // 1. Repair eof-in-tag or incomplete tags at the end of the string
  // Matches < followed by letters, options, but no closing > at the end
  if (repaired.lastIndexOf("<") > repaired.lastIndexOf(">")) {
    const lastOpenIdx = repaired.lastIndexOf("<");
    const tagSnippet = repaired.substring(lastOpenIdx);
    // If it's a tag snippet e.g. <div class="bg-red-500", try closing it
    if (/^<[a-zA-Z0-9:-]+/i.test(tagSnippet)) {
      if (tagSnippet.includes('"') && (tagSnippet.match(/"/g) || []).length % 2 !== 0) {
        repaired += '"'; // close quotes
      }
      repaired += ">";
    } else {
      // Just strip the broken tag snippet
      repaired = repaired.substring(0, lastOpenIdx).trim();
    }
  }

  // 2. Resolve unbalanced quotes inside attributes
  // Replace tags with unclosed quotes by matching the tag and closing the quote
  const tagRegex = /(<[a-zA-Z0-9:-]+)([^>]*)(>?)/g;
  repaired = repaired.replace(tagRegex, (fullTag, start, attrs, end) => {
    if (!attrs) return fullTag;
    let cleanAttrs = attrs;
    const doubleCount = (attrs.match(/"/g) || []).length;
    const singleCount = (attrs.match(/'/g) || []).length;
    if (doubleCount % 2 !== 0) {
      cleanAttrs += '"';
    }
    if (singleCount % 2 !== 0) {
      cleanAttrs += "'";
    }
    return start + cleanAttrs + (end || ">");
  });

  // Repair style tags and style attributes
  const styleTagRepairRegex = /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi;
  repaired = repaired.replace(styleTagRepairRegex, (match, openTag, styleContent, closeTag) => {
    return openTag + autoRepairCSSStringsAndUrls(styleContent) + closeTag;
  });

  const styleAttrRepairRegex = /(\bstyle\s*=\s*)(["'])([\s\S]*?)\2/gi;
  repaired = repaired.replace(styleAttrRepairRegex, (match, prefix, quote, styleVal) => {
    return prefix + quote + autoRepairCSSStringsAndUrls(styleVal) + quote;
  });

  // 3. Balance unclosed tags
  const val = validateHTML(repaired);
  if (val.openTags && val.openTags.length > 0) {
    for (let i = val.openTags.length - 1; i >= 0; i--) {
      const tag = val.openTags[i];
      repaired += `\n</${tag}>`;
    }
  }

  // 4. Duplicate ID repair
  // If duplicate IDs exist, suffix the duplicates
  const idsFound = new Set<string>();
  const idAttrRegex = /(\bid\s*=\s*["'])([^"']*)(["'])/gi;
  repaired = repaired.replace(idAttrRegex, (match, prefix, idVal, suffix) => {
    if (idsFound.has(idVal)) {
      const newId = `${idVal}-${Math.floor(Math.random() * 1000)}`;
      idsFound.add(newId);
      return prefix + newId + suffix;
    }
    idsFound.add(idVal);
    return match;
  });

  // 5. Wrap body/head/html if completely missing
  const lower = repaired.toLowerCase();
  if (!lower.includes("<html")) {
    const hasHead = lower.includes("<head");
    const hasBody = lower.includes("<body");
    
    let headPart = hasHead ? "" : "<head><title>AppStudio</title></head>";
    let bodyPart = hasBody ? repaired : `<body>${repaired}</body>`;
    repaired = `<!DOCTYPE html>\n<html lang="en">\n${headPart}\n${bodyPart}\n</html>`;
  }

  return repaired;
}

/**
 * Performs local CSS syntax repair.
 * Fixes missing braces and semicolons.
 */
export function autoRepairCSS(css: string): string {
  let repaired = css.trim();
  repaired = autoRepairCSSStringsAndUrls(repaired);

  // Balance open/close curly braces
  const openBraces = (repaired.match(/\{/g) || []).length;
  const closeBraces = (repaired.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    repaired += "\n" + "}".repeat(openBraces - closeBraces);
  }

  // Simple auto-repair: add missing colons or semicolons
  const blocks = repaired.split("}");
  const repairedBlocks = blocks.map((block, idx) => {
    if (idx === blocks.length - 1 && block.trim() === "") return block;
    const parts = block.split("{");
    if (parts.length > 1) {
      const selector = parts[0];
      const decls = parts[1].trim();
      if (decls.length > 0 && !decls.includes("{")) {
        const statements = decls.split(";").map(s => s.trim()).filter(Boolean);
        const fixedStatements = statements.map((stmt) => {
          if (stmt.length > 0 && !stmt.includes(":")) {
            // Unrecoverable malformed statement, comment it out
            return `/* malformed: ${stmt} */`;
          }
          return stmt;
        });
        return selector + "{\n  " + fixedStatements.join(";\n  ") + (fixedStatements.length > 0 ? ";" : "") + "\n";
      }
    }
    return block;
  });

  return repairedBlocks.join("}");
}

/**
 * Scans CSS/style text for unterminated double/single quotes and unclosed url() functions.
 */
export function checkCSSStringsAndUrls(css: string): string[] {
  const errors: string[] = [];
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");

  // 1. Check for unterminated quotes
  let inDouble = false;
  let inSingle = false;
  let doubleStart = -1;
  let singleStart = -1;

  for (let i = 0; i < noComments.length; i++) {
    const char = noComments[i];
    const prev = noComments[i - 1];

    if (inDouble) {
      if (char === '"' && prev !== '\\') {
        inDouble = false;
      }
    } else if (inSingle) {
      if (char === "'" && prev !== '\\') {
        inSingle = false;
      }
    } else {
      if (char === '"') {
        inDouble = true;
        doubleStart = i;
      } else if (char === "'") {
        inSingle = true;
        singleStart = i;
      }
    }
  }

  if (inDouble) {
    errors.push(`Unterminated double-quoted string in style declaration.`);
  }
  if (inSingle) {
    errors.push(`Unterminated single-quoted string in style declaration.`);
  }

  // 2. Check for unterminated url()
  let pos = 0;
  while ((pos = noComments.indexOf("url(", pos)) !== -1) {
    const start = pos;
    pos += 4; // skip "url("

    let quote = "";
    if (noComments[pos] === "'" || noComments[pos] === '"') {
      quote = noComments[pos];
      pos++;
    }

    let foundEnd = false;
    let scanPos = pos;
    while (scanPos < noComments.length) {
      if (quote) {
        if (noComments[scanPos] === quote && noComments[scanPos - 1] !== "\\") {
          let nextCharPos = scanPos + 1;
          while (nextCharPos < noComments.length && /\s/.test(noComments[nextCharPos])) {
            nextCharPos++;
          }
          if (noComments[nextCharPos] === ")") {
            foundEnd = true;
            pos = nextCharPos + 1;
            break;
          }
        }
      } else {
        if (noComments[scanPos] === ")") {
          foundEnd = true;
          pos = scanPos + 1;
          break;
        }
      }
      scanPos++;
    }

    if (!foundEnd) {
      errors.push(`Unterminated url() in style declaration starting with: "${noComments.substring(start, Math.min(start + 50, noComments.length))}"`);
      break;
    }
  }

  return errors;
}

/**
 * Repairs unterminated CSS strings and url() declarations.
 */
export function autoRepairCSSStringsAndUrls(css: string): string {
  let repaired = css;
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");

  // Check for unterminated quotes
  let inDouble = false;
  let inSingle = false;
  let doubleStart = -1;
  let singleStart = -1;

  for (let i = 0; i < noComments.length; i++) {
    const char = noComments[i];
    const prev = noComments[i - 1];

    if (inDouble) {
      if (char === '"' && prev !== '\\') {
        inDouble = false;
      }
    } else if (inSingle) {
      if (char === "'" && prev !== '\\') {
        inSingle = false;
      }
    } else {
      if (char === '"') {
        inDouble = true;
        doubleStart = i;
      } else if (char === "'") {
        inSingle = true;
        singleStart = i;
      }
    }
  }

  // Check for unterminated url()
  let pos = 0;
  let unterminatedUrlStart = -1;
  let urlQuote = "";

  while ((pos = noComments.indexOf("url(", pos)) !== -1) {
    const start = pos;
    pos += 4;

    let quote = "";
    if (noComments[pos] === "'" || noComments[pos] === '"') {
      quote = noComments[pos];
      pos++;
    }

    let foundEnd = false;
    let scanPos = pos;
    while (scanPos < noComments.length) {
      if (quote) {
        if (noComments[scanPos] === quote && noComments[scanPos - 1] !== "\\") {
          let nextCharPos = scanPos + 1;
          while (nextCharPos < noComments.length && /\s/.test(noComments[nextCharPos])) {
            nextCharPos++;
          }
          if (noComments[nextCharPos] === ")") {
            foundEnd = true;
            pos = nextCharPos + 1;
            break;
          }
        }
      } else {
        if (noComments[scanPos] === ")") {
          foundEnd = true;
          pos = scanPos + 1;
          break;
        }
      }
      scanPos++;
    }

    if (!foundEnd) {
      unterminatedUrlStart = start;
      urlQuote = quote;
      break;
    }
  }

  // If there's an unterminated url(), we close it at the end of the string
  if (unterminatedUrlStart !== -1) {
    if (urlQuote) {
      repaired = repaired.trim();
      if (!repaired.endsWith(urlQuote)) {
        repaired += urlQuote;
      }
    }
    repaired = repaired.trim();
    if (!repaired.endsWith(")")) {
      repaired += ")";
    }
    // Reset inSingle/inDouble state if they were set by this url's opening quote
    if (urlQuote === "'") inSingle = false;
    if (urlQuote === '"') inDouble = false;
  }

  // If quotes are still unbalanced, append the closing quote
  if (inDouble) {
    repaired = repaired.trim() + '"';
  }
  if (inSingle) {
    repaired = repaired.trim() + "'";
  }

  return repaired;
}

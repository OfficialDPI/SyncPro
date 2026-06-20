/**
 * @protected CORE ENGINE — src/core/security/index.ts
 * Security utilities: HTML sanitization, CSP helpers, input guards.
 * All user-generated or AI-generated content must pass through these
 * before being rendered or stored.
 * Do not modify without approval.
 */

import { logger } from "@/core/observability/logger";

// ── HTML Sanitization ─────────────────────────────────────────────────────────
/** Tags allowed when rendering user/AI content as HTML */
const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "em", "b", "i", "u", "s", "code", "pre",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "hr",
  "a", "img", "span", "div", "section", "article",
  "table", "thead", "tbody", "tr", "th", "td",
]);

const ALLOWED_ATTRS = new Set(["href", "src", "alt", "title", "class", "id", "target", "rel"]);
const DANGEROUS_PROTOCOLS = /^(javascript:|data:|vbscript:)/i;

/**
 * Escape HTML special characters for safe text rendering.
 * Use this for any user input displayed as plain text.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Strip all HTML tags from a string (plain text only).
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Basic sanitizer for user-provided HTML content.
 * Removes script tags, on* handlers, and dangerous protocols.
 * For production use, prefer DOMPurify.
 */
export function sanitizeHtml(input: string): string {
  // Remove script and style tags entirely
  let clean = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/on\w+\s*=/gi, "data-removed="); // strip event handlers

  // Strip dangerous protocol references
  clean = clean.replace(/href\s*=\s*["']([^"']*)["']/gi, (_match, url) => {
    if (DANGEROUS_PROTOCOLS.test(url.trim())) {
      logger.security("Security", "Dangerous URL stripped", { url });
      return 'href="#"';
    }
    return _match;
  });

  return clean;
}

// ── Content Security Policy ───────────────────────────────────────────────────
/**
 * Generate a nonce for inline scripts (for CSP headers).
 * In production, set Content-Security-Policy header with this nonce.
 */
export function generateCspNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// ── Input Guards ──────────────────────────────────────────────────────────────
/**
 * Validate that a URL is safe (http/https only, no javascript:).
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Truncate user input to a maximum length to prevent oversized payloads.
 */
export function truncateInput(input: string, maxLength = 32000): string {
  if (input.length <= maxLength) return input;
  logger.warn("Security", "Input truncated", { originalLength: input.length, maxLength });
  return input.slice(0, maxLength);
}

/**
 * Check if a string contains potential prompt injection patterns.
 * Returns true if suspicious content is detected.
 */
export function detectPromptInjection(input: string): boolean {
  const patterns = [
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /system\s*:\s*you\s+are/i,
    /\[INST\]/i,
    /<\|im_start\|>/i,
  ];
  return patterns.some((p) => p.test(input));
}

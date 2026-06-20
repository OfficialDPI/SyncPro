/**
 * @protected CORE ENGINE — src/core/preview/index.ts
 * Sandbox iframe manager for previewing AI-generated web applications.
 * Controls the lifecycle of preview sandboxes — creation, messaging, teardown.
 * Do not modify without approval.
 */

import { logger } from "@/core/observability/logger";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PreviewSandbox {
  id: string;
  iframe: HTMLIFrameElement | null;
  status: "idle" | "loading" | "ready" | "error";
  errorMessage?: string;
}

export interface PreviewMessage {
  type: "READY" | "ERROR" | "NAVIGATION" | "LOG" | "HEIGHT_CHANGE";
  payload?: unknown;
}

// ── Sandbox Management ────────────────────────────────────────────────────────
const activeSandboxes = new Map<string, PreviewSandbox>();

/**
 * Create a new preview sandbox descriptor.
 * Actual iframe mounting is handled by the React component in core/preview/Sandbox.tsx
 */
export function createSandbox(id: string): PreviewSandbox {
  const sandbox: PreviewSandbox = { id, iframe: null, status: "idle" };
  activeSandboxes.set(id, sandbox);
  logger.info("Preview", `Sandbox created`, { id });
  return sandbox;
}

export function destroySandbox(id: string): void {
  const sandbox = activeSandboxes.get(id);
  if (sandbox?.iframe) {
    sandbox.iframe.src = "about:blank";
  }
  activeSandboxes.delete(id);
  logger.info("Preview", `Sandbox destroyed`, { id });
}

export function getSandbox(id: string): PreviewSandbox | undefined {
  return activeSandboxes.get(id);
}

// ── Sandbox HTML Builder ──────────────────────────────────────────────────────
/**
 * Generate the complete sandboxed HTML document for a preview.
 * Injects the generated source code and all required scripts.
 */
export interface SandboxConfig {
  html?: string;
  css?: string;
  js?: string;
  title?: string;
  injectTailwind?: boolean;
  injectReact?: boolean;
}

export function buildSandboxDocument(config: SandboxConfig): string {
  const {
    html = "<div id='root'></div>",
    css = "",
    js = "",
    title = "Preview",
    injectTailwind = false,
    injectReact = false,
  } = config;

  const tailwindScript = injectTailwind
    ? `<script src="https://cdn.tailwindcss.com"></script>`
    : "";

  const reactScripts = injectReact
    ? `
      <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${tailwindScript}
  ${reactScripts}
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    // Notify parent when ready
    window.addEventListener('load', () => {
      window.parent.postMessage({ type: 'READY' }, '*');
    });
    window.addEventListener('error', (e) => {
      window.parent.postMessage({ type: 'ERROR', payload: e.message }, '*');
    });
    ${js}
  </script>
</body>
</html>`;
}

// ── Sandbox attributes ────────────────────────────────────────────────────────
/** Standard sandbox attribute for AI-generated preview iframes. */
export const IFRAME_SANDBOX_ATTRS =
  "allow-scripts allow-same-origin allow-forms allow-popups allow-modals";

/** Standard CSP for preview frames (set via HTTP headers on the server). */
export const PREVIEW_CSP =
  "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:";

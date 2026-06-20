/**
 * @protected CORE ENGINE — src/core/observability/logger.ts
 * Structured audit logger for the Sync platform.
 *
 * Logs: AI-generated changes, protected file modification attempts,
 * build failures, validation failures, dependency changes, security warnings.
 *
 * In development: logs to console + localStorage (capped at 500 events).
 * In production: logs to console; API endpoint configurable.
 *
 * Do not modify without approval.
 */

import { IS_DEV, IS_PROD } from "@/core/runtime";

export type LogLevel = "info" | "warn" | "error" | "audit" | "security";

export interface LogEvent {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, unknown>;
}

const MAX_STORED_EVENTS = 500;
const STORAGE_KEY = "sync_audit_log";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadStoredEvents(): LogEvent[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function storeEvent(event: LogEvent): void {
  try {
    const events = loadStoredEvents();
    events.unshift(event);
    if (events.length > MAX_STORED_EVENTS) events.length = MAX_STORED_EVENTS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch { /* storage full or unavailable */ }
}

function formatConsoleMessage(event: LogEvent): string {
  return `[Sync:${event.category}] ${event.message}`;
}

class PlatformLogger {
  private emit(level: LogLevel, category: string, message: string, data?: Record<string, unknown>): void {
    const event: LogEvent = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
    };

    // Console output
    const msg = formatConsoleMessage(event);
    switch (level) {
      case "error":
      case "security":
        console.error(`🔴 ${msg}`, data ?? "");
        break;
      case "warn":
        console.warn(`🟡 ${msg}`, data ?? "");
        break;
      case "audit":
        console.info(`📋 ${msg}`, data ?? "");
        break;
      default:
        if (IS_DEV) console.log(`🔵 ${msg}`, data ?? "");
    }

    // Persist in localStorage (dev + prod)
    storeEvent(event);

    // In production, you can POST to an API endpoint here:
    // if (IS_PROD) { fetch("/api/logs", { method: "POST", body: JSON.stringify(event) }); }
  }

  info(category: string, message: string, data?: Record<string, unknown>): void {
    this.emit("info", category, message, data);
  }

  warn(category: string, message: string, data?: Record<string, unknown>): void {
    this.emit("warn", category, message, data);
  }

  error(category: string, message: string, data?: Record<string, unknown>): void {
    this.emit("error", category, message, data);
  }

  /** Audit log: AI-generated changes, file writes, merges. */
  audit(category: string, message: string, data?: Record<string, unknown>): void {
    this.emit("audit", category, message, data);
  }

  /** Security log: protected file access attempts, CSP violations. */
  security(category: string, message: string, data?: Record<string, unknown>): void {
    this.emit("security", category, message, data);
  }

  /** Retrieve stored events (last N, newest first). */
  getEvents(limit = 100): LogEvent[] {
    return loadStoredEvents().slice(0, limit);
  }

  /** Clear all stored events. */
  clearEvents(): void {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }
}

export const logger = new PlatformLogger();

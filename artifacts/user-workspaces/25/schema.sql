-- ============================================
-- ErrorHandlingTest Database Schema
-- Project: ErrorHandlingTest
-- Branding: dark theme, #ff4444 primary, #00ff00 accent, #111111 background
-- Tables: logs, errors
-- ============================================

-- Enable UUID generation if needed (optional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- Table: errors
-- Stores detailed information about application errors.
-- This is the primary table for error tracking and analysis.
-- ----------------------------------------------------------------
CREATE TABLE errors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_code      VARCHAR(50) NOT NULL,
    error_message   TEXT NOT NULL,
    stack_trace     TEXT,
    severity        VARCHAR(20) NOT NULL DEFAULT 'error'
                    CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    source          VARCHAR(100),
    user_id         UUID,
    session_id      UUID,
    request_id      UUID,
    metadata        JSONB DEFAULT '{}'::jsonb,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved        BOOLEAN NOT NULL DEFAULT false,
    resolved_at     TIMESTAMPTZ
);

COMMENT ON TABLE errors IS 'Stores application errors with full context for debugging.';
COMMENT ON COLUMN errors.id IS 'Unique error identifier (UUID v4).';
COMMENT ON COLUMN errors.error_code IS 'Machine-readable error code (e.g., AUTH_FAILURE, DB_TIMEOUT).';
COMMENT ON COLUMN errors.error_message IS 'Human-readable error description.';
COMMENT ON COLUMN errors.stack_trace IS 'Full stack trace when available.';
COMMENT ON COLUMN errors.severity IS 'Error severity level: debug, info, warning, error, or critical.';
COMMENT ON COLUMN errors.source IS 'Module, component, or service where the error originated.';
COMMENT ON COLUMN errors.user_id IS 'ID of the authenticated user experiencing the error (if applicable).';
COMMENT ON COLUMN errors.session_id IS 'Session ID to correlate multiple errors from the same user session.';
COMMENT ON COLUMN errors.request_id IS 'Unique request identifier for tracing across services.';
COMMENT ON COLUMN errors.metadata IS 'Flexible JSON payload for additional context (e.g., query params, form data).';
COMMENT ON COLUMN errors.occurred_at IS 'Timestamp when the error actually occurred.';
COMMENT ON COLUMN errors.created_at IS 'Timestamp when the error record was inserted into the database.';
COMMENT ON COLUMN errors.resolved IS 'Flag indicating whether the error has been handled or resolved.';
COMMENT ON COLUMN errors.resolved_at IS 'Timestamp when the error was marked as resolved.';

-- Index for fast lookup by error_code and occurred_at
CREATE INDEX idx_errors_code_occurred ON errors (error_code, occurred_at DESC);

-- Index for filtering unresolved critical errors
CREATE INDEX idx_errors_unresolved_critical ON errors (resolved, severity, occurred_at DESC)
    WHERE resolved = false AND severity = 'critical';

-- Index for searching by user or session
CREATE INDEX idx_errors_user_id ON errors (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_errors_session_id ON errors (session_id) WHERE session_id IS NOT NULL;

-- ----------------------------------------------------------------
-- Table: logs
-- General-purpose log table for application events, warnings,
-- and debugging information that is not necessarily an error.
-- ----------------------------------------------------------------
CREATE TABLE logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level       VARCHAR(20) NOT NULL DEFAULT 'info'
                CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
    message     TEXT NOT NULL,
    context     JSONB DEFAULT '{}'::jsonb,
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE logs IS 'Application log entries for debugging and monitoring.';
COMMENT ON COLUMN logs.id IS 'Unique log entry identifier.';
COMMENT ON COLUMN logs.level IS 'Log level: debug, info, warn, error, fatal.';
COMMENT ON COLUMN logs.message IS 'Log message text.';
COMMENT ON COLUMN logs.context IS 'Additional structured data (e.g., request params, user agent).';
COMMENT ON COLUMN logs.timestamp IS 'When the log event occurred.';

-- Index for time-based queries
CREATE INDEX idx_logs_timestamp ON logs (timestamp DESC);

-- Index for severity-level filtering
CREATE INDEX idx_logs_level ON logs (level, timestamp DESC);

-- ----------------------------------------------------------------
-- Seed data: insert a few sample errors and logs
-- ----------------------------------------------------------------

-- Seed errors
INSERT INTO errors (error_code, error_message, stack_trace, severity, source, metadata, occurred_at, resolved)
VALUES
(
    'REACT_RENDER_ERROR',
    'Invalid hook call. Hooks can only be called inside of the body of a function component.',
    'Error: Invalid hook call. Hooks can only be called inside of the body of a function component.
    at resolveDispatcher (react.development.js:1465)
    at useState (react.development.js:1496)
    at App (App.js:5:41)',
    'error',
    'App.js',
    '{"componentStack": "at App (App.js:5:41)"}'::jsonb,
    now() - interval '2 hours',
    false
),
(
    'IMPORT_ERROR',
    'Module not found: Can''t resolve ''./NonExistentComponent'' in ''/src''',
    NULL,
    'error',
    'webpack',
    '{"webpackVersion": "5.88.2"}'::jsonb,
    now() - interval '1 hour',
    false
),
(
    'API_TIMEOUT',
    'Request to /api/data timed out after 5000ms',
    'Error: timeout of 5000ms exceeded
    at createError (axios.js:452)
    at XMLHttpRequest.handleTimeout (axios.js:203)',
    'critical',
    'api.client',
    '{"url": "/api/data", "method": "GET", "timeout": 5000}'::jsonb,
    now() - interval '30 minutes',
    false
);

-- Seed logs
INSERT INTO logs (level, message, context, timestamp)
VALUES
(
    'info',
    'Application started',
    '{"version": "1.2.0", "environment": "development"}'::jsonb,
    now() - interval '2 hours 10 minutes'
),
(
    'warn',
-- Database schema for ReactErrorTester project
-- Purpose: Captures and analyzes React build/compilation errors for testing error handling

CREATE TABLE errors (
    id BIGSERIAL PRIMARY KEY,
    error_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    error_message TEXT NOT NULL,
    error_type VARCHAR(50) NOT NULL,  -- e.g., 'SyntaxError', 'TypeError', 'ImportError'
    file_path VARCHAR(500),            -- path to the file where the error occurred
    line_number INT,                  -- approximate line number
    column_number INT,                -- approximate column
    stack_trace TEXT,                 -- full stack trace if available
    severity VARCHAR(10) NOT NULL DEFAULT 'error' CHECK (severity IN ('error', 'warning', 'fatal')),
    build_phase VARCHAR(50),          -- e.g., 'compilation', 'bundling', 'linting'
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_errors_timestamp ON errors (error_timestamp DESC);
CREATE INDEX idx_errors_severity ON errors (severity);
CREATE INDEX idx_errors_type ON errors (error_type);
CREATE INDEX idx_errors_file ON errors (file_path);
CREATE INDEX idx_errors_resolved ON errors (is_resolved) WHERE is_resolved = false;

-- Comments for documentation
COMMENT ON TABLE errors IS 'Stores errors captured from React application builds to test and improve error handling mechanisms.';
COMMENT ON COLUMN errors.id IS 'Unique identifier for each error entry.';
COMMENT ON COLUMN errors.error_timestamp IS 'Timestamp when the error occurred.';
COMMENT ON COLUMN errors.error_message IS 'The full error message provided by the build tool or linter.';
COMMENT ON COLUMN errors.error_type IS 'Category of the error (SyntaxError, ImportError, etc.).';
COMMENT ON COLUMN errors.file_path IS 'Path to the source file where the error was detected.';
COMMENT ON COLUMN errors.line_number IS 'Line number of the error, if available.';
COMMENT ON COLUMN errors.column_number IS 'Column number, if parsed.';
COMMENT ON COLUMN errors.stack_trace IS 'Complete stack trace for debugging.';
COMMENT ON COLUMN errors.severity IS 'Severity level: error, warning, or fatal.';
COMMENT ON COLUMN errors.build_phase IS 'Build step during which the error was encountered.';
COMMENT ON COLUMN errors.is_resolved IS 'Whether the error has been fixed.';
COMMENT ON COLUMN errors.resolved_at IS 'When the error was marked as resolved.';
COMMENT ON COLUMN errors.resolution_notes IS 'Notes on how the error was resolved for future reference.';

-- Seed data: some typical React errors that might occur with invalid code
INSERT INTO errors (
    error_message,
    error_type,
    file_path,
    line_number,
    column_number,
    stack_trace,
    severity,
    build_phase
) VALUES
(
    'Unexpected token, expected ";"',
    'SyntaxError',
    'src/App.tsx',
    15,
    22,
    'SyntaxError: Unexpected token, expected ";" at Parser.raise (node_modules/@babel/parser/src/parser/error.js:60:17) ...',
    'error',
    'compilation'
),
(
    'Cannot find module ''react'' or its corresponding type declarations.',
    'ModuleNotFoundError',
    'src/index.tsx',
    1,
    17,
    'Error: Cannot find module ''react'' or its corresponding type declarations.\n    at resolveExports (node_modules/webpack/lib/ModuleNotFoundError.js...)',
    'fatal',
    'bundling'
),
(
    'Type ''string'' is not assignable to type ''number''.',
    'TypeError',
    'src/components/Counter.tsx',
    28,
    14,
    'TypeScript: Type ''string'' is not assignable to type ''number''. TS2322',
    'error',
    'compilation'
),
(
    'Unmatched closing tag </div>',
    'SyntaxError',
    'src/components/Header.tsx',
    42,
    5,
    'SyntaxError: Unmatched closing tag </div>',
    'error',
    'compilation'
),
(
    'ESLint: ''useState'' is not defined.',
    'ReferenceError',
    'src/hooks/useCustomHook.ts',
    8,
    15,
    'ReferenceError: useState is not defined (no-undef rule)',
    'warning',
    'linting'
);
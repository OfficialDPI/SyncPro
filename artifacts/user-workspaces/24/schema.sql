-- ============================================================================
-- GreetingErrorTest Database Schema
-- ============================================================================

-- Users table for storing user profiles and authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,                                  -- Unique user identifier
    username VARCHAR(50) NOT NULL UNIQUE,                   -- Username for login
    email VARCHAR(255) NOT NULL UNIQUE,                     -- Email address
    password_hash VARCHAR(255) NOT NULL,                    -- Hashed password
    display_name VARCHAR(100),                              -- Name shown in greetings
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),          -- Account creation timestamp
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()           -- Last update timestamp
);
COMMENT ON TABLE users IS 'Stores user accounts and their greeting preferences.';
COMMENT ON COLUMN users.id IS 'Auto-incremented primary key.';
COMMENT ON COLUMN users.username IS 'Unique username, used for login.';
COMMENT ON COLUMN users.email IS 'User email, must be unique.';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt-hashed password for secure authentication.';
COMMENT ON COLUMN users.display_name IS 'Optional name to be used in greetings (e.g. "John").';
COMMENT ON COLUMN users.created_at IS 'When the user registered.';
COMMENT ON COLUMN users.updated_at IS 'Last time user profile was updated.';

-- Greetings table for recording submitted greetings
CREATE TABLE greetings (
    id SERIAL PRIMARY KEY,                                  -- Unique greeting ID
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- Owner of the greeting
    greeting_text TEXT NOT NULL,                            -- The actual greeting message
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),          -- When the greeting was created
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),          -- Last modification timestamp
    is_active BOOLEAN NOT NULL DEFAULT TRUE                 -- Soft-delete flag
);
COMMENT ON TABLE greetings IS 'Stores user-generated greetings for the app.';
COMMENT ON COLUMN greetings.id IS 'Auto-incremented primary key.';
COMMENT ON COLUMN greetings.user_id IS 'Foreign key referencing users.id.';
COMMENT ON COLUMN greetings.greeting_text IS 'The full greeting text, e.g. "Hello, John!".';
COMMENT ON COLUMN greetings.created_at IS 'Timestamp of greeting creation.';
COMMENT ON COLUMN greetings.updated_at IS 'Timestamp of last update.';
COMMENT ON COLUMN greetings.is_active IS 'Indicates whether the greeting is currently visible.';

-- Error logs table for capturing and analyzing greeting failures
CREATE TABLE error_logs (
    id SERIAL PRIMARY KEY,                                  -- Unique log entry ID
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,  -- User who experienced the error (nullable)
    error_type VARCHAR(100) NOT NULL,                       -- Category of error (e.g., VALIDATION, DB_ERROR)
    error_message TEXT NOT NULL,                            -- Descriptive error message
    stack_trace TEXT,                                       -- Full stack trace (if available)
    context JSONB,                                          -- Additional metadata (e.g., input values)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()           -- When the error occurred
);
COMMENT ON TABLE error_logs IS 'Logs errors encountered during greeting creation or validation.';
COMMENT ON COLUMN error_logs.id IS 'Auto-incremented primary key.';
COMMENT ON COLUMN error_logs.user_id IS 'Foreign key to users, can be NULL if user not logged in.';
COMMENT ON COLUMN error_logs.error_type IS 'Error type code (e.g., VALIDATION_ERROR, INTERNAL_ERROR).';
COMMENT ON COLUMN error_logs.error_message IS 'Human-readable description of the error.';
COMMENT ON COLUMN error_logs.stack_trace IS 'Full stack trace for debugging purposes.';
COMMENT ON COLUMN error_logs.context IS 'JSON object storing request data or environment details.';
COMMENT ON COLUMN error_logs.created_at IS 'Exact timestamp of error occurrence.';

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_greetings_user_id ON greetings(user_id);
CREATE INDEX idx_greetings_created_at ON greetings(created_at);
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX idx_error_logs_error_type ON error_logs(error_type);

-- ============================================================================
-- Seed Data
-- ============================================================================

-- Insert some test users (passwords are bcrypt hashes of 'password123' for testing)
INSERT INTO users (username, email, password_hash, display_name) VALUES
('jdoe', 'jdoe@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'John'),
('asmith', 'asmith@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Alice');

-- Insert some sample greetings
INSERT INTO greetings (user_id, greeting_text) VALUES
(1, 'Hello, John! Welcome to GreetingErrorTest. 👋'),
(2, 'Bonjour, Alice! Ready to test some errors? 💥');

-- Insert a few error log entries to simulate typical errors
INSERT INTO error_logs (user_id, error_type, error_message, context) VALUES
(1, 'VALIDATION_ERROR', 'Name must not be empty.', '{"input_name": ""}'),
(NULL, 'INTERNAL_ERROR', 'Database connection timed out.', '{"endpoint": "/api/greetings"}'),
(2, 'SYNTAX_ERROR', 'Unexpected token in input.', '{"input_name": "Invalid{Name}"}');
-- SimpleCounterApp Database Schema
-- Branding: dark theme, primary: bg-indigo-600, accent: text-pink-500, background: #0f0f23

-- Users table: minimal user info for counter ownership
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL DEFAULT 'Anonymous',
    password_hash TEXT NOT NULL DEFAULT 'PLACEHOLDER_HASH',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE users IS 'Registered users who own counters.';
COMMENT ON COLUMN users.email IS 'Unique login email.';
COMMENT ON COLUMN users.display_name IS 'Public display name.';
COMMENT ON COLUMN users.password_hash IS 'Hashed password.';

-- Counters table: named counters owned by a user
CREATE TABLE counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Untitled Counter',
    value INTEGER NOT NULL DEFAULT 0 CHECK (value >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE counters IS 'Individual counters belonging to users.';
COMMENT ON COLUMN counters.user_id IS 'Owner of this counter.';
COMMENT ON COLUMN counters.name IS 'Display name of the counter.';
COMMENT ON COLUMN counters.value IS 'Current count, non-negative integer.';

-- Indexes for performance
CREATE INDEX idx_counters_user_id ON counters(user_id);
CREATE INDEX idx_users_email ON users(email);

-- Seed data: one demo user with two counters
INSERT INTO users (id, email, display_name, password_hash)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'demo@simplecounter.app',
    'Demo User',
    '$2a$10$dummyhashede5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e' -- placeholder
);

INSERT INTO counters (id, user_id, name, value)
VALUES
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Daily Visitors', 42),
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Tasks Completed', 7);
-- ============================================================
-- CounterApp Database Schema
-- PostgreSQL
-- ============================================================

-- ------------------------------------------------------------
-- Table: counters
-- Stores individual counter definitions and their current values.
-- ------------------------------------------------------------
CREATE TABLE counters (
    id              SERIAL          PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    value           INTEGER         NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE counters IS 'Core table storing user-facing counters with their current numeric value.';
COMMENT ON COLUMN counters.name IS 'Human-readable label for the counter (e.g., "Page Visits", "Items Sold").';
COMMENT ON COLUMN counters.value IS 'Current integer value of the counter, can be negative. Defaults to 0.';
COMMENT ON COLUMN counters.created_at IS 'Timestamp when the counter was first created.';
COMMENT ON COLUMN counters.updated_at IS 'Timestamp of the last mutation (increment/decrement/reset).';

-- Index for fast lookup by name
CREATE INDEX idx_counters_name ON counters (name);

-- Index for ordering by recent updates
CREATE INDEX idx_counters_updated_at ON counters (updated_at DESC);


-- ------------------------------------------------------------
-- Table: counter_logs
-- Immutable audit trail tracking every value change on a counter.
-- ------------------------------------------------------------
CREATE TABLE counter_logs (
    id              SERIAL          PRIMARY KEY,
    counter_id      INTEGER         NOT NULL REFERENCES counters(id) ON DELETE CASCADE,
    old_value       INTEGER         NOT NULL,
    new_value       INTEGER         NOT NULL,
    delta           INTEGER         GENERATED ALWAYS AS (new_value - old_value) STORED,
    changed_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE counter_logs IS 'Append-only log of all changes made to counters for audit and analytics.';
COMMENT ON COLUMN counter_logs.counter_id IS 'Foreign key referencing the parent counter.';
COMMENT ON COLUMN counter_logs.old_value IS 'Value of the counter before the change was applied.';
COMMENT ON COLUMN counter_logs.new_value IS 'Value of the counter after the change was applied.';
COMMENT ON COLUMN counter_logs.delta IS 'Computed difference (new - old), positive for increment, negative for decrement.';
COMMENT ON COLUMN counter_logs.changed_at IS 'Server-side timestamp when the change occurred.';

-- Index to quickly retrieve history for a specific counter
CREATE INDEX idx_logs_counter_id ON counter_logs (counter_id, changed_at DESC);

-- Prevent identical consecutive values (no-op change)
ALTER TABLE counter_logs ADD CONSTRAINT chk_no_self_update CHECK (old_value <> new_value);


-- ------------------------------------------------------------
-- Seed Data: initial counters for a fresh installation
-- ------------------------------------------------------------
INSERT INTO counters (name, value) VALUES
    ('Page Visits', 1420),
    ('Total Sales', 87),
    ('Active Users', 304),
    ('Api Calls Today', 12056);

-- Insert corresponding seed log entries (initial creation treated as from 0 to value)
INSERT INTO counter_logs (counter_id, old_value, new_value, changed_at)
SELECT 
    c.id,
    0,
    c.value,
    c.created_at
FROM counters c
WHERE c.value > 0;
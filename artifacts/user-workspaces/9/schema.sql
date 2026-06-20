-- SimpleCounter Database Schema

-- Create table for storing counter values
CREATE TABLE counter (
    id SERIAL PRIMARY KEY,                          -- Unique identifier for each counter record
    count INTEGER NOT NULL DEFAULT 0,                -- Current counter value, starts at 0
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- Timestamp of record creation
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()    -- Timestamp of last update
);

-- Index on updated_at for efficient ordering/queries
CREATE INDEX idx_counter_updated_at ON counter (updated_at DESC);

-- Function to automatically update the updated_at timestamp when the row is modified
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function before any update on the counter table
CREATE TRIGGER update_counter_modtime
    BEFORE UPDATE ON counter
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Seed data: initialize a single counter record (global counter)
INSERT INTO counter (count) VALUES (0);
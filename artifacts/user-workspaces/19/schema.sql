-- SportsLanding - Contacts Table Schema
-- Theme: dark, primary #ff4500, accent #00bfff, background #1a1a2e

-- =============================================
-- Table: contacts
-- Purpose: Store contact form submissions from the website
-- =============================================
CREATE TABLE contacts (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    message         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add comments for documentation
COMMENT ON TABLE contacts IS 'Stores contact form submissions from the SportsLanding website';
COMMENT ON COLUMN contacts.id IS 'Unique identifier for each contact submission';
COMMENT ON COLUMN contacts.name IS 'Full name of the person reaching out';
COMMENT ON COLUMN contacts.email IS 'Email address for follow-up communication';
COMMENT ON COLUMN contacts.phone IS 'Optional phone number';
COMMENT ON COLUMN contacts.message IS 'The message or inquiry from the visitor';
COMMENT ON COLUMN contacts.created_at IS 'Timestamp when the submission was received';

-- =============================================
-- Indexes
-- =============================================
-- Index for quick lookups by email
CREATE INDEX idx_contacts_email ON contacts(email);
-- Index for ordering/filtering by submission time
CREATE INDEX idx_contacts_created_at ON contacts(created_at);

-- =============================================
-- Seed Data: Dummy professional contacts (sports-themed)
-- =============================================
INSERT INTO contacts (name, email, phone, message) VALUES
('John Doe', 'john.doe@example.com', '+1-555-0101', 'I want to know more about your sports programs.'),
('Jane Smith', 'jane.smith@example.com', NULL, 'Interested in basketball training sessions.'),
('Mike Johnson', 'mike.johnson@example.com', '+1-555-9876', 'How can I join the soccer league?'),
('Emily Brown', 'emily.brown@example.com', NULL, 'Do you offer personal training for tennis?'),
('Chris Evans', 'chris.evans@example.com', '+1-555-1234', 'I have a question about membership plans.');
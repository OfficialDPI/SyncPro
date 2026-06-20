-- ================================================
-- DarkLanding Database Schema
-- PostgreSQL
-- ================================================

-- Table: pages
-- Stores landing page configurations.
CREATE TABLE pages (
    id              SERIAL PRIMARY KEY,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    title           VARCHAR(255) NOT NULL,
    meta_description TEXT,
    primary_color   VARCHAR(7) DEFAULT '#3b82f6' CHECK (primary_color ~ '^#[a-fA-F0-9]{6}$'),
    accent_color    VARCHAR(7) DEFAULT '#f59e0b' CHECK (accent_color ~ '^#[a-fA-F0-9]{6}$'),
    background_color VARCHAR(7) DEFAULT '#0f172a' CHECK (background_color ~ '^#[a-fA-F0-9]{6}$'),
    status          VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);
COMMENT ON TABLE pages IS 'Core landing page definitions.';
COMMENT ON COLUMN pages.primary_color IS 'Hex code for primary UI elements (default #3b82f6).';
COMMENT ON COLUMN pages.accent_color IS 'Hex code for accent actions (default #f59e0b).';
COMMENT ON COLUMN pages.background_color IS 'Background color of the page (default #0f172a).';

-- Index on slug for fast lookup.
CREATE INDEX idx_pages_slug ON pages (slug);

-- Table: sections
-- Individual content blocks that compose a landing page.
CREATE TABLE sections (
    id          SERIAL PRIMARY KEY,
    page_id     INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    type        VARCHAR(30) NOT NULL CHECK (type IN ('hero','features','testimonials','cta','footer','content')),
    sort_order  INTEGER NOT NULL DEFAULT 0,
    title       VARCHAR(255),
    subtitle    TEXT,
    content     JSONB DEFAULT '{}'::jsonb,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE sections IS 'All page sections like hero, features, etc.';
COMMENT ON COLUMN sections.content IS 'Flexible JSON for section-specific data (e.g., hero image, feature list).';

CREATE INDEX idx_sections_page_id ON sections (page_id);
CREATE INDEX idx_sections_sort ON sections (page_id, sort_order);

-- Table: leads
-- Captures form submissions from the landing page.
CREATE TABLE leads (
    id         SERIAL PRIMARY KEY,
    page_id    INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    email      VARCHAR(255) NOT NULL,
    name       VARCHAR(255),
    phone      VARCHAR(50),
    company    VARCHAR(255),
    message    TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE leads IS 'Leads captured from landing page forms.';
COMMENT ON COLUMN leads.ip_address IS 'IP address of the submitter.';

CREATE INDEX idx_leads_page_id ON leads (page_id);
CREATE INDEX idx_leads_email ON leads (email);
CREATE INDEX idx_leads_created_at ON leads (created_at);

-- ================================================
-- Seed Data: Professional dark-themed landing page
-- ================================================

-- Insert a sample landing page
INSERT INTO pages (slug, title, meta_description, primary_color, accent_color, background_color, status)
VALUES (
    'dark-product-launch',
    'DarkLanding – Elevate Your Brand',
    'A modern, dark-themed SaaS landing page that converts.',
    '#3b82f6',
    '#f59e0b',
    '#0f172a',
    'published'
);

-- Retrieve the page ID for subsequent inserts (use subquery or assume 1)
-- Since we control the seed, we'll hardcode page_id = 1.

-- Hero section
INSERT INTO sections (page_id, type, sort_order, title, subtitle, content)
VALUES (
    1,
    'hero',
    1,
    'Build Stunning Landing Pages, Fast',
    'DarkLanding is the ultimate toolkit for creating high-converting, dark-themed pages in minutes.',
    '{
        "background_image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
        "cta_button_text": "Get Started Free",
        "cta_button_url": "#signup",
        "secondary_button_text": "View Demo",
        "secondary_button_url": "#demo"
    }'::jsonb
);

-- Features section
INSERT INTO sections (page_id, type, sort_order, title, subtitle, content)
VALUES (
    1,
    'features',
    2,
    'Why Choose DarkLanding
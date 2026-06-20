-- =============================================================================
-- PostgreSQL Schema for DarkLanding Project
-- Branding: dark theme, primary #1a1a2e, accent #00d4ff, background #0d0d12
-- Manages landing page content: hero, features, call-to-action, and contact
-- =============================================================================

-- ----------------------------
-- Table: branding_settings
-- Stores global branding settings for the landing page
-- ----------------------------
CREATE TABLE branding_settings (
    id                  SERIAL PRIMARY KEY,
    theme               VARCHAR(20)  NOT NULL DEFAULT 'dark',
    primary_color       CHAR(7)      NOT NULL DEFAULT '#1a1a2e',
    accent_color        CHAR(7)      NOT NULL DEFAULT '#00d4ff',
    background_color    CHAR(7)      NOT NULL DEFAULT '#0d0d12',
    logo_url            VARCHAR(255),
    favicon_url         VARCHAR(255),
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE branding_settings IS 'Global branding and appearance settings for DarkLanding.';

-- ----------------------------
-- Table: sections
-- Defines major sections of the landing page (hero, features, CTA, etc.)
-- ----------------------------
CREATE TABLE sections (
    id          SERIAL PRIMARY KEY,
    slug        VARCHAR(50)  NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    order_index INT          NOT NULL DEFAULT 0,
    is_visible  BOOLEAN      NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE sections IS 'Landing page sections (hero, features, cta, etc.).';

-- ----------------------------
-- Table: section_contents
-- Stores content blocks within a section (e.g., hero title, feature items)
-- ----------------------------
CREATE TABLE section_contents (
    id            SERIAL PRIMARY KEY,
    section_id    INT          NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    content_type  VARCHAR(20)  NOT NULL CHECK (content_type IN ('heading','paragraph','button','list','image','video','icon','feature','cta_button')),
    position      INT          NOT NULL DEFAULT 0,
    title         VARCHAR(255),
    subtitle      VARCHAR(255),
    description   TEXT,
    tagline       VARCHAR(255),
    link_url      VARCHAR(500),
    icon_class    VARCHAR(100),
    image_url     VARCHAR(500),
    video_url     VARCHAR(500),
    extra_data    JSONB        DEFAULT '{}'
);

CREATE INDEX idx_section_contents_section_id ON section_contents(section_id);
CREATE INDEX idx_section_contents_content_type ON section_contents(content_type);

COMMENT ON TABLE section_contents IS 'Individual content elements (text, images, buttons) within a section.';

-- ----------------------------
-- Table: features
-- Detailed feature items (may belong to a 'features' section)
-- ----------------------------
CREATE TABLE features (
    id              SERIAL PRIMARY KEY,
    section_id      INT          NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    icon_class      VARCHAR(100),
    image_url       VARCHAR(500),
    order_index     INT          NOT NULL DEFAULT 0,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_features_section_id ON features(section_id);

COMMENT ON TABLE features IS 'Detailed feature bullet points for the landing page.';

-- ----------------------------
-- Table: call_to_actions
-- Stores multiple CTAs (e.g., primary, secondary)
-- ----------------------------
CREATE TABLE call_to_actions (
    id              SERIAL PRIMARY KEY,
    section_id      INT          REFERENCES sections(id) ON DELETE SET NULL,
    label           VARCHAR(100) NOT NULL,
    url             VARCHAR(500) NOT NULL,
    style           VARCHAR(20)  DEFAULT 'primary' CHECK (style IN ('primary','secondary','outline')),
    order_index     INT          NOT NULL DEFAULT 0,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_call_to_actions_section_id ON call_to_actions(section_id);

COMMENT ON TABLE call_to_actions IS 'Call-to-action buttons displayed across the landing page.';

-- ----------------------------
-- Table: contact_submissions
-- Stores form submissions from the contact section
-- ----------------------------
CREATE TABLE contact_submissions (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(30),
    message         TEXT,
    submitted_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    is_read         BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_submitted_at ON contact_submissions(submitted_at);

COMMENT ON TABLE contact_submissions IS 'Captures contact form inquiries from visitors.';

-- =============================================================================
-- Seed data: professional dummy content for a tech startup landing page
-- =============================================================================

-- 1. Branding settings (single row)
INSERT INTO branding_settings (theme, primary_color, accent_color, background_color, logo_url, favicon_url)
VALUES ('dark', '#1a1a2e', '#00d4ff', '#0d0d12', '/assets/logo-light.svg', '/favicon.ico');

-- 2. Sections: hero, features, cta, contact
INSERT INTO sections (slug, name, order_index, is_visible) VALUES
('hero', 'Hero Section', 1, TRUE),
('features', 'Features & Services', 2, TRUE),
('cta', 'Call to Action', 3, TRUE),
('contact', 'Contact Us', 4, TRUE);

-- 3. Hero section content
INSERT INTO section_contents (section_id, content_type, title, subtitle, description, tagline, link_url, icon_class, image_url, extra_data, position) VALUES
(1, 'heading', 'Power Your Business with Next‑Gen AI', NULL, NULL, 'Unlock intelligent automation', NULL, NULL, NULL, '{"size":"h1"}', 1),
(1, 'paragraph', NULL, NULL, 'Our platform leverages cutting-edge machine learning to transform your data into actionable insights. Increase efficiency, reduce costs, and stay ahead of the competition.', NULL, NULL, NULL, NULL, '{}', 2),
(1, 'button', NULL, NULL, NULL, 'Get Started Free', '#signup', NULL, NULL, '{"type":"primary"}', 3),
(1, 'image', NULL, NULL, NULL, NULL, NULL, NULL, '/assets/hero-dashboard.png', '{"alt":"Dark themed AI dashboard preview"}', 4);

-- 4. Features section content: heading and subheading
INSERT INTO section_contents (section_id, content_type, title, subtitle, description, tagline, link_url, icon_class, image_url, extra_data, position) VALUES
(2, 'heading', 'Why Choose DarkLanding?', NULL, NULL, 'Everything you need to scale', NULL, NULL, NULL, '{"size":"h2"}', 1),
(2, 'paragraph', NULL, NULL, 'From predictive analytics to automated workflows, DarkLanding equips your team with powerful tools that drive real results.', NULL, NULL, NULL, NULL, '{}', 2);

-- 5. Detailed features (belonging to features section with id = 2)
INSERT INTO features (section_id, title, description, icon_class, order_index) VALUES
(2, 'Intelligent Automation', 'Automate repetitive tasks and free up your team to focus on strategic initiatives.', 'bi bi-robot', 1),
(2, 'Real-Time Analytics', 'Monitor key metrics and get instant insights with interactive dashboards.', 'bi bi-graph-up', 2),
(2, 'Seamless Integrations', 'Connect with your existing tools and data sources with one-click integrations.', 'bi bi-plug', 3),
(2, 'Enterprise Security', 'Bank-grade encryption and compliance certifications keep your data safe.', 'bi bi-shield-lock', 4),
(2, 'Scalable Architecture', 'Grow from startup to enterprise without ever hitting a performance ceiling.', 'bi bi-cloud-arrow-up', 5),
(2, '24/7 Support', 'Our support team is always available to help you succeed.', 'bi bi-headset', 6);

-- 6. Call-to-action section (section id = 3) – primary CTA button and supporting text
INSERT INTO section_contents (section_id, content_type, title, description, tagline, link_url, icon_class, extra_data, position) VALUES
(3, 'heading', 'Ready to Transform Your Workflow?', NULL, 'Start your free trial today', NULL, NULL, '{"size":"h2"}', 1);

INSERT INTO call_to_actions (section_id, label, url, style, order_index) VALUES
(3, 'Start Free Trial', '/signup', 'primary', 1),
(3, 'Talk to Sales', '/contact', 'outline', 2);

-- 7. Contact section (section id = 4) – heading and intro text
INSERT INTO section_contents (section_id, content_type, title, subtitle, description, position) VALUES
(4, 'heading', 'Get in Touch', NULL, 'We would love to hear from you', 1),
(4, 'paragraph', NULL, NULL, 'Fill out the form below and our team will get back to you within 24 hours.', 2);

-- Sample contact submissions (optional)
INSERT INTO contact_submissions (name, email, message, is_read) VALUES
('Alex Johnson', 'alex@example.com', 'I am interested in a demo for my team of 20.', FALSE),
('Sarah Lee', 'sarah.lee@darklanding.io', 'When do you plan to release the mobile app?', TRUE);
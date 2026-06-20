-- LaunchPad Database Schema
-- PostgreSQL

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE users IS 'Registered users of LaunchPad.';
COMMENT ON COLUMN users.email IS 'Unique email address.';
COMMENT ON COLUMN users.password_hash IS 'BCrypt hash of user password.';

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'funded', 'completed', 'cancelled')),
    funding_goal DECIMAL(12,2),
    raised_amount DECIMAL(12,2) DEFAULT 0,
    launch_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE projects IS 'Startup projects submitted to LaunchPad.';
COMMENT ON COLUMN projects.status IS 'Current lifecycle status of the project.';

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_launch_date ON projects(launch_date);

-- Features table (project features/updates)
CREATE TABLE project_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE project_features IS 'Key features or milestones of a project.';
CREATE INDEX idx_features_project_id ON project_features(project_id);

-- Team members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);
COMMENT ON TABLE team_members IS 'Associates users as team members of projects.';
CREATE INDEX idx_team_project_id ON team_members(project_id);
CREATE INDEX idx_team_user_id ON team_members(user_id);

-- Auto-update function for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Seed Data
-- Insert sample users
INSERT INTO users (email, username, password_hash, full_name, avatar_url) VALUES
('alice@launchpad.io', 'alice_w', '$2b$12$LJ3m4ys3F4z0iDkKz5f5OOv6tGGN6Ql6NSt4Pm0Zq0kYkQkQkQkQ', 'Alice Williams', 'https://i.pravatar.cc/150?u=alice'),
('bob@launchpad.io', 'bob_m', '$2b$12$LJ3m4ys3F4z0iDkKz5f5OOv6tGGN6Ql6NSt4Pm0Zq0kYkQkQkQkQ', 'Bob Miller', 'https://i.pravatar.cc/150?u=bob'),
('carol@launchpad.io', 'carol_s', '$2b$12$LJ3m4ys3F4z0iDkKz5f5OOv6tGGN6Ql6NSt4Pm0Zq0kYkQkQkQkQ', 'Carol Smith', 'https://i.pravatar.cc/150?u=carol');

-- Insert sample projects
INSERT INTO projects (user_id, title, description, category, status, funding_goal, raised_amount, launch_date) VALUES
(
    (SELECT id FROM users WHERE username='alice_w'),
    'EcoCharge', 
    'Smart portable charger made from recycled ocean plastics. Charge your devices sustainably.',
    'Sustainability',
    'active',
    50000.00,
    12500.00,
    '2025-09-01'
),
(
    (SELECT id FROM users WHERE username='bob_m'),
    'DevSync', 
    'A platform to synchronize development environment configurations across teams.',
    'Developer Tools',
    'draft',
    75000.00,
    0,
    NULL
),
(
    (SELECT id FROM users WHERE username='carol_s'),
    'ArtisanFlow', 
    'An online marketplace connecting independent artisans with global buyers.',
    'Marketplace',
    'funded',
    200000.00,
    200500.00,
    '2025-06-15'
);

-- Sample features for EcoCharge
INSERT INTO project_features (project_id, title, description, priority, completed) VALUES
((SELECT id FROM projects WHERE title='EcoCharge'), '100% recycled casing', 'Outer shell made from certified ocean-bound plastics.', 1, TRUE),
((SELECT id FROM projects WHERE title='EcoCharge'), '10,000mAh capacity', 'Enough to charge a smartphone 3 times.', 2, TRUE),
((SELECT id FROM projects WHERE title='EcoCharge'), 'Solar charging panel', 'Integrated 5W solar panel for trickle charging.', 3, FALSE);

-- Team members
INSERT INTO team_members (project_id, user_id, role) VALUES
((SELECT id FROM projects WHERE title='EcoCharge'), (SELECT id FROM users WHERE username='alice_w'), 'Founder'),
((SELECT id FROM projects WHERE title='DevSync'), (SELECT id FROM users WHERE username='bob_m'), 'Lead Developer'),
((SELECT id FROM projects WHERE title='DevSync'), (SELECT id FROM users WHERE username='carol_s'), 'UI/UX Designer');
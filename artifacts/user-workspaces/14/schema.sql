-- PhotoHub Database Schema
-- PostgreSQL

-- 1. Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100),
    bio TEXT,
    profile_picture_url TEXT,
    website VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Registered users of PhotoHub';
COMMENT ON COLUMN users.id IS 'Primary key';
COMMENT ON COLUMN users.username IS 'Unique handle';
COMMENT ON COLUMN users.email IS 'Unique login email';
COMMENT ON COLUMN users.password_hash IS 'Hashed password (bcrypt)';
COMMENT ON COLUMN users.full_name IS 'Display name';
COMMENT ON COLUMN users.bio IS 'User bio';
COMMENT ON COLUMN users.profile_picture_url IS 'Avatar image URL';
COMMENT ON COLUMN users.website IS 'External link';
COMMENT ON COLUMN users.created_at IS 'Account creation timestamp';
COMMENT ON COLUMN users.updated_at IS 'Last update timestamp';

CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);

-- 2. Posts table
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    location VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE posts IS 'Photo posts shared by users';
COMMENT ON COLUMN posts.id IS 'Primary key';
COMMENT ON COLUMN posts.user_id IS 'Author of the post';
COMMENT ON COLUMN posts.image_url IS 'URL of the uploaded image';
COMMENT ON COLUMN posts.caption IS 'User-provided caption';
COMMENT ON COLUMN posts.location IS 'Geographic tag';
COMMENT ON COLUMN posts.created_at IS 'Post creation time';
COMMENT ON COLUMN posts.updated_at IS 'Last edit time';

CREATE INDEX idx_posts_user_id ON posts (user_id);
CREATE INDEX idx_posts_created_at ON posts (created_at DESC);

-- 3. Comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE comments IS 'User comments on posts';
COMMENT ON COLUMN comments.id IS 'Primary key';
COMMENT ON COLUMN comments.post_id IS 'Associated post';
COMMENT ON COLUMN comments.user_id IS 'Comment author';
COMMENT ON COLUMN comments.content IS 'Comment text';
COMMENT ON COLUMN comments.created_at IS 'Timestamp of comment';

CREATE INDEX idx_comments_post_id ON comments (post_id);
CREATE INDEX idx_comments_user_id ON comments (user_id);

-- 4. Likes table
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (post_id, user_id)   -- prevent duplicate likes
);

COMMENT ON TABLE likes IS 'Post likes (one per user per post)';
COMMENT ON COLUMN likes.id IS 'Primary key';
COMMENT ON COLUMN likes.post_id IS 'Liked post';
COMMENT ON COLUMN likes.user_id IS 'User who liked';
COMMENT ON COLUMN likes.created_at IS 'Like timestamp';

CREATE INDEX idx_likes_post_id ON likes (post_id);
CREATE INDEX idx_likes_user_id ON likes (user_id);

-- 5. Followers table
CREATE TABLE followers (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (follower_id, followed_id),
    CONSTRAINT prevent_self_follow CHECK (follower_id <> followed_id)
);

COMMENT ON TABLE followers IS 'Follower relationships between users';
COMMENT ON COLUMN followers.id IS 'Primary key';
COMMENT ON COLUMN followers.follower_id IS 'User who follows';
COMMENT ON COLUMN followers.followed_id IS 'User being followed';
COMMENT ON COLUMN followers.created_at IS 'Follow timestamp';

CREATE INDEX idx_followers_follower_id ON followers (follower_id);
CREATE INDEX idx_followers_followed_id ON followers (followed_id);

-- =================================================
-- SEED DATA
-- =================================================

-- Insert sample users (password: 'password123' hashed with bcrypt - dummy hash)
INSERT INTO users (username, email, password_hash, full_name, bio, profile_picture_url, website) VALUES
('john_doe', 'john@photohub.com', '$2a$10$t9f8QsLwvJ6k4zHvO3RGYeKq5PsOvPRAVYFgkpi3LwjRlSe.Oo4Oe', 'John Doe', 'Travel enthusiast 📸', 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', 'https://johndoe.blog'),
('jane_smith', 'jane@photohub.com', '$2a$10$t9f8QsLwvJ6k4zHvO3RGYeKq5PsOvPRAVYFgkpi3LwjRlSe.Oo4Oe', 'Jane Smith', 'Foodie & photographer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80', 'https://janesmith.com'),
('alex_wong', 'alex@photohub.com', '$2a$10$t9f8QsLwvJ6k4zHvO3
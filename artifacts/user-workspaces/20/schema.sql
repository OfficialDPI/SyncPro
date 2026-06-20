-- BrewBloomCoffeeBrokenTest Database Schema
-- Generated for error handling test environment

-- Core configuration table
CREATE TABLE app_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(255) NOT NULL UNIQUE,
    config_value JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE app_config IS 'Application configuration with JSON values for theme/branding';
COMMENT ON COLUMN app_config.config_key IS 'Unique configuration key (e.g., theme, branding)';
COMMENT ON COLUMN app_config.config_value IS 'JSON configuration blob';
COMMENT ON COLUMN app_config.is_active IS 'Soft delete flag for config entries';

-- Menu items table
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('coffee', 'tea', 'pastry', 'specialty')),
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    is_available BOOLEAN NOT NULL DEFAULT true,
    image_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE menu_items IS 'Coffee shop menu items catalog';
COMMENT ON COLUMN menu_items.category IS 'Restricted to coffee, tea, pastry, or specialty';

-- User error logs (for testing error handling)
CREATE TABLE error_logs (
    id BIGSERIAL PRIMARY KEY,
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    component_name VARCHAR(255),
    user_session_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE error_logs IS 'Captures React compilation and runtime errors for analysis';

-- Orders table (simplified for test context)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(200) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE orders IS 'Customer orders for testing transactional integrity';

-- Indexes
CREATE INDEX idx_menu_category ON menu_items (category);
CREATE INDEX idx_error_logs_created ON error_logs (created_at DESC);
CREATE INDEX idx_error_logs_type ON error_logs (error_type);
CREATE INDEX idx_orders_status ON orders (status);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_config_timestamp
    BEFORE UPDATE ON app_config
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Seed data
INSERT INTO app_config (config_key, config_value) VALUES
    ('theme', '{"name": "dark", "primaryColor": "#6F4E37", "accentColor": "#F5E6D3", "backgroundColor": "#2C1A14"}'),
    ('branding', '{"shopName": "Brew & Bloom", "tagline": "Where Every Cup Blooms"}');

INSERT INTO menu_items (item_name, description, category, price) VALUES
    ('Dark Roast Espresso', 'Rich and bold single-origin espresso', 'coffee', 3.50),
    ('Honey Lavender Latte', 'Smooth latte with honey and lavender notes', 'coffee', 5.25),
    ('Matcha Croissant', 'Flaky croissant with matcha-infused butter', 'pastry', 4.75),
    ('Bloom Tea Blend', 'House blend of chamomile and rose petals', 'tea', 4.00);

-- Sample error log entry (simulating a broken React import)
INSERT INTO error_logs (error_type, error_message, component_name) VALUES
    ('SyntaxError', 'Unexpected token, expected "from" (17:9)', 'App'),
    ('ReferenceError', 'CoffeeIcon is not defined', 'HeroSection');
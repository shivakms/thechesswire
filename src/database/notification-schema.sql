-- Notification System Database Schema
-- This schema supports in-app notifications, email notifications, and push notifications

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'achievement', 'game', 'news', 'system')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    is_push_sent BOOLEAN DEFAULT FALSE,
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Preferences Table
CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_preferences JSONB NOT NULL DEFAULT '{
        "achievements": true,
        "games": true,
        "news": true,
        "system": true,
        "marketing": false
    }',
    push_preferences JSONB NOT NULL DEFAULT '{
        "achievements": true,
        "games": true,
        "news": false,
        "system": true,
        "marketing": false
    }',
    in_app_preferences JSONB NOT NULL DEFAULT '{
        "achievements": true,
        "games": true,
        "news": true,
        "system": true,
        "marketing": false
    }',
    frequency VARCHAR(20) DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
    quiet_hours JSONB DEFAULT '{
        "enabled": false,
        "start": "22:00",
        "end": "08:00",
        "timezone": "UTC"
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Templates Table
CREATE TABLE IF NOT EXISTS notification_templates (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_template TEXT NOT NULL,
    text_template TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Push Tokens Table
CREATE TABLE IF NOT EXISTS user_push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    push_token TEXT NOT NULL,
    device_type VARCHAR(20) CHECK (device_type IN ('ios', 'android', 'web')),
    device_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, push_token)
);

-- Notification Delivery Log Table
CREATE TABLE IF NOT EXISTS notification_delivery_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    delivery_type VARCHAR(20) NOT NULL CHECK (delivery_type IN ('email', 'push', 'in_app')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Categories Table
CREATE TABLE IF NOT EXISTS notification_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color code
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Rules Table
CREATE TABLE IF NOT EXISTS notification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_condition JSONB NOT NULL,
    notification_template_id VARCHAR(100) REFERENCES notification_templates(id),
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON user_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_is_active ON user_push_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_device_type ON user_push_tokens(device_type);

CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_notification_id ON notification_delivery_log(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_status ON notification_delivery_log(status);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_sent_at ON notification_delivery_log(sent_at);

-- Functions for Notification Management

-- Function to create notification with automatic delivery
CREATE OR REPLACE FUNCTION create_notification_with_delivery(
    p_user_id UUID,
    p_type VARCHAR(20),
    p_title VARCHAR(255),
    p_message TEXT,
    p_data JSONB DEFAULT '{}',
    p_priority VARCHAR(10) DEFAULT 'normal',
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
    preferences JSONB;
BEGIN
    -- Create notification
    INSERT INTO notifications (user_id, type, title, message, data, priority, expires_at)
    VALUES (p_user_id, p_type, p_title, p_message, p_data, p_priority, p_expires_at)
    RETURNING id INTO notification_id;

    -- Get user preferences
    SELECT email_preferences, push_preferences, in_app_preferences
    INTO preferences
    FROM notification_preferences
    WHERE user_id = p_user_id;

    -- Log delivery attempt
    INSERT INTO notification_delivery_log (notification_id, delivery_type, status)
    VALUES (notification_id, 'in_app', 'delivered');

    -- Check if email should be sent
    IF preferences->>'achievements' = 'true' OR 
       preferences->>'games' = 'true' OR 
       preferences->>'news' = 'true' OR 
       preferences->>'system' = 'true' THEN
        INSERT INTO notification_delivery_log (notification_id, delivery_type, status)
        VALUES (notification_id, 'email', 'pending');
    END IF;

    -- Check if push should be sent
    IF preferences->>'achievements' = 'true' OR 
       preferences->>'games' = 'true' OR 
       preferences->>'news' = 'true' OR 
       preferences->>'system' = 'true' THEN
        INSERT INTO notification_delivery_log (notification_id, delivery_type, status)
        VALUES (notification_id, 'push', 'pending');
    END IF;

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE notifications 
    SET is_read = TRUE, read_at = NOW(), updated_at = NOW()
    WHERE id = p_notification_id AND user_id = p_user_id;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    count INTEGER;
BEGIN
    SELECT COUNT(*) INTO count
    FROM notifications
    WHERE user_id = p_user_id AND is_read = FALSE;
    
    RETURN count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update notification delivery status
CREATE OR REPLACE FUNCTION update_delivery_status(
    p_notification_id UUID,
    p_delivery_type VARCHAR(20),
    p_status VARCHAR(20),
    p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE notification_delivery_log
    SET status = p_status,
        error_message = p_error_message,
        delivered_at = CASE WHEN p_status = 'delivered' THEN NOW() ELSE delivered_at END,
        retry_count = CASE WHEN p_status = 'failed' THEN retry_count + 1 ELSE retry_count END
    WHERE notification_id = p_notification_id 
    AND delivery_type = p_delivery_type
    AND sent_at = (
        SELECT MAX(sent_at) 
        FROM notification_delivery_log 
        WHERE notification_id = p_notification_id 
        AND delivery_type = p_delivery_type
    );

    -- Update notification table
    IF p_delivery_type = 'email' AND p_status = 'delivered' THEN
        UPDATE notifications SET is_email_sent = TRUE WHERE id = p_notification_id;
    ELSIF p_delivery_type = 'push' AND p_status = 'delivered' THEN
        UPDATE notifications SET is_push_sent = TRUE WHERE id = p_notification_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic actions

-- Trigger to update notification updated_at
CREATE OR REPLACE FUNCTION update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_updated_at();

-- Trigger to update notification preferences updated_at
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Trigger to update push tokens updated_at
CREATE OR REPLACE FUNCTION update_push_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_push_tokens_updated_at
    BEFORE UPDATE ON user_push_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_push_tokens_updated_at();

-- Initial data

-- Insert default notification categories
INSERT INTO notification_categories (id, name, description, icon, color) VALUES
('achievements', 'Achievements', 'Unlock notifications and progress updates', '🏆', '#FFD700'),
('games', 'Games', 'Game invitations, results, and analysis', '♟️', '#4CAF50'),
('news', 'News', 'Latest chess news and updates', '📰', '#2196F3'),
('system', 'System', 'Important system notifications', '⚙️', '#FF5722'),
('marketing', 'Marketing', 'Promotional content and offers', '📢', '#9C27B0')
ON CONFLICT DO NOTHING;

-- Insert default notification templates
INSERT INTO notification_templates (id, name, subject, html_template, text_template, variables) VALUES
('achievement_notification', 'Achievement Unlocked', 
 'Congratulations! You''ve unlocked a new achievement on TheChessWire',
 '<h2>🎉 Achievement Unlocked!</h2><p>Congratulations {{username}}! You''ve earned the <strong>{{achievement_name}}</strong> achievement.</p><p>{{achievement_description}}</p>',
 'Achievement Unlocked! Congratulations {{username}}! You''ve earned the {{achievement_name}} achievement. {{achievement_description}}',
 ARRAY['username', 'achievement_name', 'achievement_description']),

('game_notification', 'New Game Challenge',
 'You have a new chess challenge on TheChessWire',
 '<h2>♟️ New Game Challenge</h2><p>{{challenger_name}} has challenged you to a game of chess!</p><p><a href="{{game_url}}">Accept Challenge</a></p>',
 'New Game Challenge! {{challenger_name}} has challenged you to a game of chess. Visit {{game_url}} to accept.',
 ARRAY['challenger_name', 'game_url']),

('news_notification', 'Breaking Chess News',
 'Latest chess news on TheChessWire',
 '<h2>📰 {{news_title}}</h2><p>{{news_excerpt}}</p><p><a href="{{news_url}}">Read More</a></p>',
 'Breaking News: {{news_title}} - {{news_excerpt}} Read more at {{news_url}}',
 ARRAY['news_title', 'news_excerpt', 'news_url']),

('system_notification', 'System Update',
 'Important system update from TheChessWire',
 '<h2>⚙️ System Update</h2><p>{{update_message}}</p>',
 'System Update: {{update_message}}',
 ARRAY['update_message'])
ON CONFLICT DO NOTHING;

-- Scheduled jobs (using pg_cron if available)
-- SELECT cron.schedule('cleanup-expired-notifications', '0 2 * * *', 'SELECT cleanup_expired_notifications();');

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO thechesswire_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO thechesswire_user; 
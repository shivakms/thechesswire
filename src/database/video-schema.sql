-- SoulCinema Video Generation Database Schema
-- This schema supports video generation, themes, and analytics

-- Video Themes Table
CREATE TABLE IF NOT EXISTS video_themes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    music_style VARCHAR(100) NOT NULL,
    visual_effects JSONB NOT NULL DEFAULT '[]',
    camera_movements JSONB NOT NULL DEFAULT '[]',
    color_palette JSONB NOT NULL DEFAULT '[]',
    duration_per_move INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SoulCinema Videos Table
CREATE TABLE IF NOT EXISTS soulcinema_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES chess_games(id) ON DELETE CASCADE,
    theme_id VARCHAR(50) NOT NULL REFERENCES video_themes(id),
    status VARCHAR(20) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'cancelled')),
    quality VARCHAR(10) NOT NULL DEFAULT '1080p' CHECK (quality IN ('720p', '1080p', '4k')),
    include_commentary BOOLEAN DEFAULT TRUE,
    include_effects BOOLEAN DEFAULT TRUE,
    custom_title VARCHAR(255),
    custom_description TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    duration INTEGER, -- seconds
    file_size BIGINT, -- bytes
    processing_time INTEGER, -- seconds
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Video Generation Queue Table
CREATE TABLE IF NOT EXISTS video_generation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES soulcinema_videos(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    next_attempt_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Analytics Table
CREATE TABLE IF NOT EXISTS video_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES soulcinema_videos(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    watch_time INTEGER DEFAULT 0, -- seconds
    completion_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    engagement_score DECIMAL(5,2) DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Comments Table
CREATE TABLE IF NOT EXISTS video_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES soulcinema_videos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES video_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    likes INTEGER DEFAULT 0,
    is_flagged BOOLEAN DEFAULT FALSE,
    flagged_reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Shares Table
CREATE TABLE IF NOT EXISTS video_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES soulcinema_videos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('twitter', 'facebook', 'instagram', 'youtube', 'tiktok', 'linkedin', 'email', 'link')),
    share_url TEXT,
    is_successful BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Templates Table
CREATE TABLE IF NOT EXISTS video_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    theme_id VARCHAR(50) NOT NULL REFERENCES video_themes(id),
    custom_settings JSONB NOT NULL DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Rendering Jobs Table
CREATE TABLE IF NOT EXISTS video_rendering_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES soulcinema_videos(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('video_generation', 'thumbnail_generation', 'preview_generation')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    progress INTEGER DEFAULT 0, -- percentage
    estimated_completion TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    output_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_soulcinema_videos_user_id ON soulcinema_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_soulcinema_videos_status ON soulcinema_videos(status);
CREATE INDEX IF NOT EXISTS idx_soulcinema_videos_theme_id ON soulcinema_videos(theme_id);
CREATE INDEX IF NOT EXISTS idx_soulcinema_videos_created_at ON soulcinema_videos(created_at);

CREATE INDEX IF NOT EXISTS idx_video_generation_queue_status ON video_generation_queue(status);
CREATE INDEX IF NOT EXISTS idx_video_generation_queue_priority ON video_generation_queue(priority);
CREATE INDEX IF NOT EXISTS idx_video_generation_queue_next_attempt ON video_generation_queue(next_attempt_at);

CREATE INDEX IF NOT EXISTS idx_video_analytics_video_id ON video_analytics(video_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_views ON video_analytics(views);

CREATE INDEX IF NOT EXISTS idx_video_comments_video_id ON video_comments(video_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_user_id ON video_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_created_at ON video_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_video_shares_video_id ON video_shares(video_id);
CREATE INDEX IF NOT EXISTS idx_video_shares_platform ON video_shares(platform);

CREATE INDEX IF NOT EXISTS idx_video_rendering_jobs_video_id ON video_rendering_jobs(video_id);
CREATE INDEX IF NOT EXISTS idx_video_rendering_jobs_status ON video_rendering_jobs(status);

-- Functions for Video Management

-- Function to create video generation request
CREATE OR REPLACE FUNCTION create_video_generation(
    p_user_id UUID,
    p_game_id UUID,
    p_theme_id VARCHAR(50),
    p_quality VARCHAR(10) DEFAULT '1080p',
    p_include_commentary BOOLEAN DEFAULT TRUE,
    p_include_effects BOOLEAN DEFAULT TRUE,
    p_custom_title VARCHAR(255) DEFAULT NULL,
    p_custom_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    video_id UUID;
    queue_id UUID;
BEGIN
    -- Create video record
    INSERT INTO soulcinema_videos (
        user_id, game_id, theme_id, quality, include_commentary, 
        include_effects, custom_title, custom_description
    )
    VALUES (
        p_user_id, p_game_id, p_theme_id, p_quality, p_include_commentary,
        p_include_effects, p_custom_title, p_custom_description
    )
    RETURNING id INTO video_id;

    -- Add to generation queue
    INSERT INTO video_generation_queue (video_id, priority)
    VALUES (video_id, 0)
    RETURNING id INTO queue_id;

    RETURN video_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update video status
CREATE OR REPLACE FUNCTION update_video_status(
    p_video_id UUID,
    p_status VARCHAR(20),
    p_video_url TEXT DEFAULT NULL,
    p_thumbnail_url TEXT DEFAULT NULL,
    p_duration INTEGER DEFAULT NULL,
    p_file_size BIGINT DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE soulcinema_videos 
    SET status = p_status,
        video_url = COALESCE(p_video_url, video_url),
        thumbnail_url = COALESCE(p_thumbnail_url, thumbnail_url),
        duration = COALESCE(p_duration, duration),
        file_size = COALESCE(p_file_size, file_size),
        error_message = COALESCE(p_error_message, error_message),
        completed_at = CASE WHEN p_status = 'completed' THEN NOW() ELSE completed_at END,
        updated_at = NOW()
    WHERE id = p_video_id;
END;
$$ LANGUAGE plpgsql;

-- Function to record video view
CREATE OR REPLACE FUNCTION record_video_view(
    p_video_id UUID,
    p_watch_time INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO video_analytics (video_id, views, watch_time, last_viewed_at)
    VALUES (p_video_id, 1, p_watch_time, NOW())
    ON CONFLICT (video_id) 
    DO UPDATE SET 
        views = video_analytics.views + 1,
        watch_time = video_analytics.watch_time + EXCLUDED.watch_time,
        last_viewed_at = EXCLUDED.last_viewed_at,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get user video statistics
CREATE OR REPLACE FUNCTION get_user_video_stats(p_user_id UUID)
RETURNS TABLE (
    total_videos BIGINT,
    completed_videos BIGINT,
    processing_videos BIGINT,
    failed_videos BIGINT,
    total_duration INTEGER,
    total_file_size BIGINT,
    total_views BIGINT,
    total_likes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(sv.id) as total_videos,
        COUNT(CASE WHEN sv.status = 'completed' THEN 1 END) as completed_videos,
        COUNT(CASE WHEN sv.status = 'processing' THEN 1 END) as processing_videos,
        COUNT(CASE WHEN sv.status = 'failed' THEN 1 END) as failed_videos,
        COALESCE(SUM(CASE WHEN sv.status = 'completed' THEN sv.duration ELSE 0 END), 0) as total_duration,
        COALESCE(SUM(CASE WHEN sv.status = 'completed' THEN sv.file_size ELSE 0 END), 0) as total_file_size,
        COALESCE(SUM(va.views), 0) as total_views,
        COALESCE(SUM(va.likes), 0) as total_likes
    FROM soulcinema_videos sv
    LEFT JOIN video_analytics va ON sv.id = va.video_id
    WHERE sv.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending videos
CREATE OR REPLACE FUNCTION get_trending_videos(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    video_id UUID,
    title VARCHAR(255),
    theme_name VARCHAR(100),
    views INTEGER,
    likes INTEGER,
    completion_rate DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sv.id as video_id,
        COALESCE(sv.custom_title, 'Chess Game') as title,
        vt.name as theme_name,
        va.views,
        va.likes,
        va.completion_rate,
        sv.created_at
    FROM soulcinema_videos sv
    JOIN video_themes vt ON sv.theme_id = vt.id
    LEFT JOIN video_analytics va ON sv.id = va.video_id
    WHERE sv.status = 'completed'
    ORDER BY va.views DESC, va.likes DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old failed videos
CREATE OR REPLACE FUNCTION cleanup_failed_videos(p_days_old INTEGER DEFAULT 7)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM soulcinema_videos 
    WHERE status = 'failed' 
    AND created_at < NOW() - INTERVAL '1 day' * p_days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic actions

-- Trigger to update video updated_at
CREATE OR REPLACE FUNCTION update_video_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_video_updated_at
    BEFORE UPDATE ON soulcinema_videos
    FOR EACH ROW
    EXECUTE FUNCTION update_video_updated_at();

-- Trigger to update video analytics updated_at
CREATE OR REPLACE FUNCTION update_video_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_video_analytics_updated_at
    BEFORE UPDATE ON video_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_video_analytics_updated_at();

-- Trigger to auto-calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.engagement_score = (
        COALESCE(NEW.views, 0) * 0.3 +
        COALESCE(NEW.likes, 0) * 0.4 +
        COALESCE(NEW.shares, 0) * 0.2 +
        COALESCE(NEW.comments, 0) * 0.1
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_engagement_score
    BEFORE INSERT OR UPDATE ON video_analytics
    FOR EACH ROW
    EXECUTE FUNCTION calculate_engagement_score();

-- Initial data

-- Insert default video themes
INSERT INTO video_themes (id, name, description, music_style, visual_effects, camera_movements, color_palette, duration_per_move, is_premium) VALUES
('epic-battle', 'Epic Battle', 'Dramatic cinematic experience with orchestral music', 'orchestral_epic',
 '["particle_effects", "slow_motion", "dramatic_lighting"]',
 '["dynamic_angles", "close_ups", "wide_shots"]',
 '["gold", "red", "dark_blue"]', 3, FALSE),

('zen-garden', 'Zen Garden', 'Peaceful and meditative experience', 'ambient_zen',
 '["soft_transitions", "gentle_lighting", "nature_elements"]',
 '["smooth_pans", "gentle_zooms"]',
 '["sage_green", "soft_blue", "warm_white"]', 4, FALSE),

('cyber-warfare', 'Cyber Warfare', 'Futuristic sci-fi aesthetic', 'electronic_cyber',
 '["holographic_overlays", "digital_glitches", "neon_effects"]',
 '["matrix_style", "rapid_cuts", "tech_angles"]',
 '["neon_blue", "electric_purple", "cyber_green"]', 2, TRUE),

('classical-concert', 'Classical Concert', 'Elegant classical music experience', 'classical_elegant',
 '["elegant_transitions", "sophisticated_lighting"]',
 '["graceful_movements", "theatrical_angles"]',
 '["rich_gold", "deep_red", "ivory"]', 3, TRUE),

('street-chess', 'Street Chess', 'Urban and energetic vibe', 'hip_hop_urban',
 '["urban_elements", "dynamic_lighting", "street_style"]',
 '["handheld_style", "street_angles"]',
 '["urban_gray", "vibrant_orange", "street_blue"]', 2, FALSE)
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO thechesswire_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO thechesswire_user; 
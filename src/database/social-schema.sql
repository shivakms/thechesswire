-- Social Media Automation Database Schema
-- This schema supports automated posting, analytics, and content management

-- Social Platforms Table
CREATE TABLE IF NOT EXISTS social_platforms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('twitter', 'facebook', 'instagram', 'youtube', 'tiktok', 'linkedin')),
    api_key VARCHAR(255),
    api_secret VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    post_frequency INTEGER DEFAULT 3, -- posts per day
    last_posted TIMESTAMP WITH TIME ZONE,
    followers INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0, -- average engagement rate
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Posts Table
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id VARCHAR(50) NOT NULL REFERENCES social_platforms(id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('article', 'video', 'analysis', 'puzzle', 'news')),
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    hashtags JSONB DEFAULT '[]',
    mentions JSONB DEFAULT '[]',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posted', 'failed', 'cancelled')),
    engagement JSONB DEFAULT '{"likes": 0, "shares": 0, "comments": 0, "views": 0}',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Templates Table
CREATE TABLE IF NOT EXISTS content_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    platform_type VARCHAR(20) NOT NULL CHECK (platform_type IN ('twitter', 'facebook', 'instagram', 'youtube', 'tiktok', 'linkedin')),
    template TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Analytics Table
CREATE TABLE IF NOT EXISTS social_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id VARCHAR(50) NOT NULL REFERENCES social_platforms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    posts_count INTEGER DEFAULT 0,
    total_engagement INTEGER DEFAULT 0,
    total_reach INTEGER DEFAULT 0,
    total_impressions INTEGER DEFAULT 0,
    avg_engagement_rate DECIMAL(5,4) DEFAULT 0,
    top_performing_post_id UUID REFERENCES social_posts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trending Hashtags Table
CREATE TABLE IF NOT EXISTS trending_hashtags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_type VARCHAR(20) NOT NULL CHECK (platform_type IN ('twitter', 'facebook', 'instagram', 'youtube', 'tiktok', 'linkedin')),
    hashtag VARCHAR(100) NOT NULL,
    trend_score INTEGER DEFAULT 0,
    volume INTEGER DEFAULT 0,
    is_rising BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Campaigns Table
CREATE TABLE IF NOT EXISTS social_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    platforms JSONB NOT NULL DEFAULT '[]',
    content_strategy JSONB DEFAULT '{}',
    hashtags JSONB DEFAULT '[]',
    target_audience JSONB DEFAULT '{}',
    budget DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign Posts Table
CREATE TABLE IF NOT EXISTS campaign_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES social_campaigns(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Mentions Table
CREATE TABLE IF NOT EXISTS social_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_type VARCHAR(20) NOT NULL CHECK (platform_type IN ('twitter', 'facebook', 'instagram', 'youtube', 'tiktok', 'linkedin')),
    mention_id VARCHAR(255) NOT NULL, -- platform's post ID
    author_username VARCHAR(100),
    author_followers INTEGER DEFAULT 0,
    content TEXT NOT NULL,
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    is_relevant BOOLEAN DEFAULT FALSE,
    is_responded_to BOOLEAN DEFAULT FALSE,
    response_post_id UUID REFERENCES social_posts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Competitors Table
CREATE TABLE IF NOT EXISTS social_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    platform_type VARCHAR(20) NOT NULL CHECK (platform_type IN ('twitter', 'facebook', 'instagram', 'youtube', 'tiktok', 'linkedin')),
    platform_username VARCHAR(100) NOT NULL,
    followers INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0,
    post_frequency DECIMAL(5,2) DEFAULT 0, -- posts per day
    last_analyzed TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitor Posts Table
CREATE TABLE IF NOT EXISTS competitor_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES social_competitors(id) ON DELETE CASCADE,
    platform_post_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    engagement JSONB DEFAULT '{"likes": 0, "shares": 0, "comments": 0, "views": 0}',
    hashtags JSONB DEFAULT '[]',
    content_type VARCHAR(20) CHECK (content_type IN ('article', 'video', 'analysis', 'puzzle', 'news')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_social_posts_platform_id ON social_posts(platform_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_at ON social_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_content_type ON social_posts(content_type);

CREATE INDEX IF NOT EXISTS idx_content_templates_platform_type ON content_templates(platform_type);
CREATE INDEX IF NOT EXISTS idx_content_templates_is_active ON content_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_social_analytics_platform_date ON social_analytics(platform_id, date);

CREATE INDEX IF NOT EXISTS idx_trending_hashtags_platform_type ON trending_hashtags(platform_type);
CREATE INDEX IF NOT EXISTS idx_trending_hashtags_trend_score ON trending_hashtags(trend_score);

CREATE INDEX IF NOT EXISTS idx_social_campaigns_status ON social_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_social_campaigns_dates ON social_campaigns(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_campaign_posts_campaign_id ON campaign_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_posts_scheduled_time ON campaign_posts(scheduled_time);

CREATE INDEX IF NOT EXISTS idx_social_mentions_platform_type ON social_mentions(platform_type);
CREATE INDEX IF NOT EXISTS idx_social_mentions_sentiment ON social_mentions(sentiment);
CREATE INDEX IF NOT EXISTS idx_social_mentions_created_at ON social_mentions(created_at);

CREATE INDEX IF NOT EXISTS idx_social_competitors_platform_type ON social_competitors(platform_type);
CREATE INDEX IF NOT EXISTS idx_social_competitors_is_active ON social_competitors(is_active);

CREATE INDEX IF NOT EXISTS idx_competitor_posts_competitor_id ON competitor_posts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_posted_at ON competitor_posts(posted_at);

-- Functions for Social Media Management

-- Function to create social post
CREATE OR REPLACE FUNCTION create_social_post(
    p_platform_id VARCHAR(50),
    p_content_id UUID,
    p_content_type VARCHAR(20),
    p_content TEXT,
    p_media_urls JSONB DEFAULT '[]',
    p_hashtags JSONB DEFAULT '[]',
    p_mentions JSONB DEFAULT '[]',
    p_scheduled_at TIMESTAMP WITH TIME ZONE
)
RETURNS UUID AS $$
DECLARE
    post_id UUID;
BEGIN
    INSERT INTO social_posts (
        platform_id, content_id, content_type, content, 
        media_urls, hashtags, mentions, scheduled_at
    )
    VALUES (
        p_platform_id, p_content_id, p_content_type, p_content,
        p_media_urls, p_hashtags, p_mentions, p_scheduled_at
    )
    RETURNING id INTO post_id;

    RETURN post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update post status
CREATE OR REPLACE FUNCTION update_post_status(
    p_post_id UUID,
    p_status VARCHAR(20),
    p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE social_posts 
    SET status = p_status,
        posted_at = CASE WHEN p_status = 'posted' THEN NOW() ELSE posted_at END,
        error_message = p_error_message,
        updated_at = NOW()
    WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update engagement metrics
CREATE OR REPLACE FUNCTION update_post_engagement(
    p_post_id UUID,
    p_likes INTEGER DEFAULT 0,
    p_shares INTEGER DEFAULT 0,
    p_comments INTEGER DEFAULT 0,
    p_views INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    UPDATE social_posts 
    SET engagement = jsonb_build_object(
        'likes', p_likes,
        'shares', p_shares,
        'comments', p_comments,
        'views', p_views
    ),
    updated_at = NOW()
    WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get platform analytics
CREATE OR REPLACE FUNCTION get_platform_analytics(
    p_platform_id VARCHAR(50),
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_posts BIGINT,
    successful_posts BIGINT,
    failed_posts BIGINT,
    avg_likes DECIMAL,
    avg_shares DECIMAL,
    avg_comments DECIMAL,
    avg_views DECIMAL,
    total_engagement BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_posts,
        COUNT(CASE WHEN status = 'posted' THEN 1 END) as successful_posts,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_posts,
        AVG((engagement->>'likes')::int) as avg_likes,
        AVG((engagement->>'shares')::int) as avg_shares,
        AVG((engagement->>'comments')::int) as avg_comments,
        AVG((engagement->>'views')::int) as avg_views,
        SUM((engagement->>'likes')::int + (engagement->>'shares')::int + (engagement->>'comments')::int) as total_engagement
    FROM social_posts 
    WHERE platform_id = p_platform_id
    AND created_at >= NOW() - INTERVAL '1 day' * p_days;
END;
$$ LANGUAGE plpgsql;

-- Function to get best posting times
CREATE OR REPLACE FUNCTION get_best_posting_times(
    p_platform_id VARCHAR(50),
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    hour_of_day INTEGER,
    avg_engagement DECIMAL,
    post_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(hour FROM posted_at)::int as hour_of_day,
        AVG((engagement->>'likes')::int + (engagement->>'shares')::int + (engagement->>'comments')::int) as avg_engagement,
        COUNT(*) as post_count
    FROM social_posts 
    WHERE platform_id = p_platform_id
    AND status = 'posted'
    AND posted_at >= NOW() - INTERVAL '1 day' * p_days
    GROUP BY EXTRACT(hour FROM posted_at)
    ORDER BY avg_engagement DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending hashtags
CREATE OR REPLACE FUNCTION get_trending_hashtags(
    p_platform_type VARCHAR(20),
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    hashtag VARCHAR(100),
    trend_score INTEGER,
    volume INTEGER,
    is_rising BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        th.hashtag,
        th.trend_score,
        th.volume,
        th.is_rising
    FROM trending_hashtags th
    WHERE th.platform_type = p_platform_type
    ORDER BY th.trend_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to track competitor activity
CREATE OR REPLACE FUNCTION track_competitor_activity(
    p_competitor_id UUID,
    p_platform_post_id VARCHAR(255),
    p_content TEXT,
    p_posted_at TIMESTAMP WITH TIME ZONE,
    p_engagement JSONB DEFAULT '{}',
    p_hashtags JSONB DEFAULT '[]',
    p_content_type VARCHAR(20) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    post_id UUID;
BEGIN
    INSERT INTO competitor_posts (
        competitor_id, platform_post_id, content, posted_at, 
        engagement, hashtags, content_type
    )
    VALUES (
        p_competitor_id, p_platform_post_id, p_content, p_posted_at,
        p_engagement, p_hashtags, p_content_type
    )
    RETURNING id INTO post_id;

    -- Update competitor last analyzed
    UPDATE social_competitors 
    SET last_analyzed = NOW(),
        updated_at = NOW()
    WHERE id = p_competitor_id;

    RETURN post_id;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic actions

-- Trigger to update social posts updated_at
CREATE OR REPLACE FUNCTION update_social_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_social_posts_updated_at
    BEFORE UPDATE ON social_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_social_posts_updated_at();

-- Trigger to update content templates updated_at
CREATE OR REPLACE FUNCTION update_content_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_content_templates_updated_at
    BEFORE UPDATE ON content_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_content_templates_updated_at();

-- Trigger to update social platforms updated_at
CREATE OR REPLACE FUNCTION update_social_platforms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_social_platforms_updated_at
    BEFORE UPDATE ON social_platforms
    FOR EACH ROW
    EXECUTE FUNCTION update_social_platforms_updated_at();

-- Initial data

-- Insert default social platforms
INSERT INTO social_platforms (id, name, type, is_active, post_frequency) VALUES
('twitter-main', 'TheChessWire Twitter', 'twitter', TRUE, 8),
('instagram-main', 'TheChessWire Instagram', 'instagram', TRUE, 3),
('facebook-main', 'TheChessWire Facebook', 'facebook', TRUE, 4),
('youtube-main', 'TheChessWire YouTube', 'youtube', TRUE, 2),
('tiktok-main', 'TheChessWire TikTok', 'tiktok', TRUE, 5)
ON CONFLICT DO NOTHING;

-- Insert default content templates
INSERT INTO content_templates (id, name, platform_type, template, variables, is_active) VALUES
(gen_random_uuid(), 'Article Twitter Post', 'twitter', 
 '🎯 {title}\n\n{summary}\n\n{hashtags}\n\nRead more: {url}', 
 '["title", "summary", "hashtags", "url"]', TRUE),

(gen_random_uuid(), 'Video Instagram Post', 'instagram',
 '🎬 {title}\n\n{description}\n\n{hashtags}',
 '["title", "description", "hashtags"]', TRUE),

(gen_random_uuid(), 'Puzzle Twitter Post', 'twitter',
 '🧩 Chess Puzzle\n\n{position}\n\n{question}\n\n{hashtags}',
 '["position", "question", "hashtags"]', TRUE),

(gen_random_uuid(), 'News Facebook Post', 'facebook',
 '📰 {title}\n\n{summary}\n\n{hashtags}\n\nRead the full story: {url}',
 '["title", "summary", "hashtags", "url"]', TRUE)
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO thechesswire_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO thechesswire_user; 
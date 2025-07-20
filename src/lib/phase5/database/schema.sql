-- Phase 5: Autonomous AI Publishing Pipeline Database Schema
-- TheChessWire.news - Bambai AI Content Pipeline

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Content Logs Table (Main tracking table)
CREATE TABLE IF NOT EXISTS content_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL,
    narrative_id UUID,
    voice_id UUID,
    video_id UUID,
    thumbnail_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    error TEXT,
    processing_time INTEGER, -- Total processing time in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chess Stories Table
CREATE TABLE IF NOT EXISTS chess_stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    source_name VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_url TEXT NOT NULL,
    source_reliability INTEGER CHECK (source_reliability >= 0 AND source_reliability <= 100),
    pgn TEXT,
    white_player VARCHAR(200),
    black_player VARCHAR(200),
    result VARCHAR(20),
    event VARCHAR(300),
    story_date DATE,
    hash VARCHAR(64) UNIQUE NOT NULL, -- For deduplication
    relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
    category VARCHAR(50) CHECK (category IN ('tournament', 'game', 'news', 'analysis', 'educational')),
    tags TEXT[], -- Array of tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Narrative Scripts Table
CREATE TABLE IF NOT EXISTS narrative_scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES chess_stories(id) ON DELETE CASCADE,
    intro TEXT NOT NULL,
    story TEXT NOT NULL,
    game_highlight TEXT,
    outro TEXT NOT NULL,
    full_script TEXT NOT NULL,
    duration INTEGER, -- Estimated duration in seconds
    tone VARCHAR(20) CHECK (tone IN ('calm', 'expressive', 'dramatic', 'poetic')),
    keywords TEXT[], -- Array of keywords
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice Synthesis Table
CREATE TABLE IF NOT EXISTS voice_synthesis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    narrative_id UUID NOT NULL REFERENCES narrative_scripts(id) ON DELETE CASCADE,
    audio_url TEXT,
    duration INTEGER, -- Duration in seconds
    file_size INTEGER, -- File size in bytes
    quality VARCHAR(10) CHECK (quality IN ('high', 'medium', 'low')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Renders Table
CREATE TABLE IF NOT EXISTS video_renders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voice_id UUID NOT NULL REFERENCES voice_synthesis(id) ON DELETE CASCADE,
    video_url TEXT,
    thumbnail_url TEXT,
    duration INTEGER, -- Duration in seconds
    resolution VARCHAR(10) CHECK (resolution IN ('720p', '1080p', '4k')),
    file_size INTEGER, -- File size in bytes
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thumbnail Metadata Table
CREATE TABLE IF NOT EXISTS thumbnail_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES video_renders(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    tags TEXT[], -- Array of tags
    hashtags TEXT[], -- Array of hashtags
    seo_keywords TEXT[], -- Array of SEO keywords
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Posts Table
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES video_renders(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('youtube', 'instagram', 'twitter', 'reddit')),
    post_id VARCHAR(100), -- External platform post ID
    url TEXT, -- External platform URL
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed')),
    error TEXT,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing Queue Table
CREATE TABLE IF NOT EXISTS processing_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES chess_stories(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry TIMESTAMP WITH TIME ZONE,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Rate Limits Table
CREATE TABLE IF NOT EXISTS api_rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_name VARCHAR(50) NOT NULL,
    endpoint VARCHAR(200) NOT NULL,
    requests_count INTEGER DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    window_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 hour',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation VARCHAR(100) NOT NULL,
    duration_ms INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_logs_story_id ON content_logs(story_id);
CREATE INDEX IF NOT EXISTS idx_content_logs_status ON content_logs(status);
CREATE INDEX IF NOT EXISTS idx_content_logs_created_at ON content_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_chess_stories_hash ON chess_stories(hash);
CREATE INDEX IF NOT EXISTS idx_chess_stories_relevance ON chess_stories(relevance_score);
CREATE INDEX IF NOT EXISTS idx_chess_stories_category ON chess_stories(category);
CREATE INDEX IF NOT EXISTS idx_chess_stories_created_at ON chess_stories(created_at);

CREATE INDEX IF NOT EXISTS idx_narrative_scripts_story_id ON narrative_scripts(story_id);
CREATE INDEX IF NOT EXISTS idx_narrative_scripts_tone ON narrative_scripts(tone);

CREATE INDEX IF NOT EXISTS idx_voice_synthesis_narrative_id ON voice_synthesis(narrative_id);
CREATE INDEX IF NOT EXISTS idx_voice_synthesis_status ON voice_synthesis(status);

CREATE INDEX IF NOT EXISTS idx_video_renders_voice_id ON video_renders(voice_id);
CREATE INDEX IF NOT EXISTS idx_video_renders_status ON video_renders(status);

CREATE INDEX IF NOT EXISTS idx_social_posts_video_id ON social_posts(video_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);

CREATE INDEX IF NOT EXISTS idx_processing_queue_story_id ON processing_queue(story_id);
CREATE INDEX IF NOT EXISTS idx_processing_queue_status ON processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_processing_queue_priority ON processing_queue(priority);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_api_name ON api_rate_limits(api_name);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window_end ON api_rate_limits(window_end);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_operation ON performance_metrics(operation);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_content_logs_updated_at BEFORE UPDATE ON content_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voice_synthesis_updated_at BEFORE UPDATE ON voice_synthesis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_video_renders_updated_at BEFORE UPDATE ON video_renders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processing_queue_updated_at BEFORE UPDATE ON processing_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for content pipeline status
CREATE OR REPLACE VIEW content_pipeline_status AS
SELECT 
    cl.id as content_log_id,
    cs.title as story_title,
    cs.source_name,
    cl.status as pipeline_status,
    cl.processing_time,
    vs.status as voice_status,
    vr.status as video_status,
    COUNT(sp.id) as social_posts_count,
    COUNT(CASE WHEN sp.status = 'published' THEN 1 END) as published_posts_count,
    cl.created_at,
    cl.updated_at
FROM content_logs cl
LEFT JOIN chess_stories cs ON cl.story_id = cs.id
LEFT JOIN narrative_scripts ns ON cl.narrative_id = ns.id
LEFT JOIN voice_synthesis vs ON cl.voice_id = vs.id
LEFT JOIN video_renders vr ON cl.video_id = vr.id
LEFT JOIN social_posts sp ON vr.id = sp.video_id
GROUP BY cl.id, cs.title, cs.source_name, cl.status, cl.processing_time, vs.status, vr.status, cl.created_at, cl.updated_at;

-- Create function to clean old data
CREATE OR REPLACE FUNCTION clean_old_data()
RETURNS void AS $$
BEGIN
    -- Delete old performance metrics (keep last 30 days)
    DELETE FROM performance_metrics WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Delete old API rate limits (keep last 7 days)
    DELETE FROM api_rate_limits WHERE window_end < NOW() - INTERVAL '7 days';
    
    -- Delete failed content logs older than 7 days
    DELETE FROM content_logs WHERE status = 'failed' AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job to clean old data (run daily)
SELECT cron.schedule('clean-old-data', '0 2 * * *', 'SELECT clean_old_data();'); 
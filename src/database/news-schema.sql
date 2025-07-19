-- News Articles Table
CREATE TABLE IF NOT EXISTS news_articles (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    author VARCHAR(200),
    source VARCHAR(500),
    url VARCHAR(1000) UNIQUE,
    published_at TIMESTAMP WITH TIME ZONE,
    category VARCHAR(100),
    tags JSONB,
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    importance INTEGER CHECK (importance >= 1 AND importance <= 10),
    ai_generated BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tournament Results Table
CREATE TABLE IF NOT EXISTS tournament_results (
    id VARCHAR(50) PRIMARY KEY,
    tournament_name VARCHAR(300) NOT NULL,
    location VARCHAR(200),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    winner VARCHAR(200),
    runner_up VARCHAR(200),
    participants JSONB,
    prize_pool VARCHAR(100),
    time_control VARCHAR(100),
    category VARCHAR(100),
    fide_rating BOOLEAN DEFAULT FALSE,
    results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player Updates Table
CREATE TABLE IF NOT EXISTS player_updates (
    id VARCHAR(50) PRIMARY KEY,
    player_name VARCHAR(200) NOT NULL,
    current_rating INTEGER,
    previous_rating INTEGER,
    rating_change INTEGER,
    federation VARCHAR(10),
    title VARCHAR(10),
    games_played INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trending Topics Table
CREATE TABLE IF NOT EXISTS trending_topics (
    id VARCHAR(50) PRIMARY KEY,
    topic VARCHAR(200) NOT NULL,
    mentions INTEGER DEFAULT 0,
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    related_articles JSONB,
    trending_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Sources Table
CREATE TABLE IF NOT EXISTS content_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    url VARCHAR(500) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('news', 'tournament', 'player', 'blog')),
    active BOOLEAN DEFAULT TRUE,
    last_scraped TIMESTAMP WITH TIME ZONE,
    scrape_frequency INTEGER DEFAULT 3600, -- seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Generation Log Table
CREATE TABLE IF NOT EXISTS content_generation_log (
    id SERIAL PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    prompt TEXT,
    generated_content TEXT,
    tokens_used INTEGER,
    processing_time INTEGER, -- milliseconds
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Verification Table
CREATE TABLE IF NOT EXISTS content_verification (
    id SERIAL PRIMARY KEY,
    article_id VARCHAR(50) REFERENCES news_articles(id) ON DELETE CASCADE,
    verified_by VARCHAR(100),
    verification_method VARCHAR(50),
    verification_score DECIMAL(3,2) CHECK (verification_score >= 0 AND verification_score <= 1),
    sources_checked JSONB,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News Categories Table
CREATE TABLE IF NOT EXISTS news_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- hex color
    icon VARCHAR(50),
    priority INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News Tags Table
CREATE TABLE IF NOT EXISTS news_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Article Analytics Table
CREATE TABLE IF NOT EXISTS article_analytics (
    id SERIAL PRIMARY KEY,
    article_id VARCHAR(50) REFERENCES news_articles(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    time_on_page INTEGER, -- seconds
    bounce_rate DECIMAL(5,2),
    social_shares JSONB,
    engagement_score DECIMAL(5,2),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_articles_created_at ON news_articles(created_at);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_sentiment ON news_articles(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_articles_importance ON news_articles(importance);
CREATE INDEX IF NOT EXISTS idx_news_articles_verified ON news_articles(verified);
CREATE INDEX IF NOT EXISTS idx_news_articles_ai_generated ON news_articles(ai_generated);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at);

CREATE INDEX IF NOT EXISTS idx_tournament_results_end_date ON tournament_results(end_date);
CREATE INDEX IF NOT EXISTS idx_tournament_results_category ON tournament_results(category);
CREATE INDEX IF NOT EXISTS idx_tournament_results_winner ON tournament_results(winner);

CREATE INDEX IF NOT EXISTS idx_player_updates_last_updated ON player_updates(last_updated);
CREATE INDEX IF NOT EXISTS idx_player_updates_player_name ON player_updates(player_name);
CREATE INDEX IF NOT EXISTS idx_player_updates_rating_change ON player_updates(rating_change);

CREATE INDEX IF NOT EXISTS idx_trending_topics_mentions ON trending_topics(mentions);
CREATE INDEX IF NOT EXISTS idx_trending_topics_trending_since ON trending_topics(trending_since);
CREATE INDEX IF NOT EXISTS idx_trending_topics_category ON trending_topics(category);

CREATE INDEX IF NOT EXISTS idx_content_sources_active ON content_sources(active);
CREATE INDEX IF NOT EXISTS idx_content_sources_last_scraped ON content_sources(last_scraped);

CREATE INDEX IF NOT EXISTS idx_article_analytics_date ON article_analytics(date);
CREATE INDEX IF NOT EXISTS idx_article_analytics_article_id ON article_analytics(article_id);

-- Full-text search index for news articles
CREATE INDEX IF NOT EXISTS idx_news_articles_search ON news_articles USING gin(to_tsvector('english', title || ' ' || content));

-- Functions for content management
CREATE OR REPLACE FUNCTION update_article_views(article_id_param VARCHAR(50))
RETURNS void AS $$
BEGIN
    UPDATE news_articles 
    SET views = views + 1, updated_at = NOW()
    WHERE id = article_id_param;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_popular_articles(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
    id VARCHAR(50),
    title VARCHAR(500),
    views INTEGER,
    importance INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        na.id,
        na.title,
        na.views,
        na.importance,
        na.created_at
    FROM news_articles na
    WHERE na.created_at > NOW() - (days_back || ' days')::INTERVAL
    ORDER BY na.views DESC, na.importance DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_trending_articles(hours_back INTEGER DEFAULT 24)
RETURNS TABLE(
    id VARCHAR(50),
    title VARCHAR(500),
    views_per_hour DECIMAL(10,2),
    importance INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        na.id,
        na.title,
        (na.views::DECIMAL / EXTRACT(EPOCH FROM (NOW() - na.created_at)) * 3600) as views_per_hour,
        na.importance,
        na.created_at
    FROM news_articles na
    WHERE na.created_at > NOW() - (hours_back || ' hours')::INTERVAL
    ORDER BY views_per_hour DESC, na.importance DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION search_articles(search_query TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    id VARCHAR(50),
    title VARCHAR(500),
    summary TEXT,
    relevance DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        na.id,
        na.title,
        na.summary,
        ts_rank(to_tsvector('english', na.title || ' ' || na.content), plainto_tsquery('english', search_query)) as relevance,
        na.created_at
    FROM news_articles na
    WHERE to_tsvector('english', na.title || ' ' || na.content) @@ plainto_tsquery('english', search_query)
    ORDER BY relevance DESC, na.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_related_articles(article_id_param VARCHAR(50), limit_count INTEGER DEFAULT 5)
RETURNS TABLE(
    id VARCHAR(50),
    title VARCHAR(500),
    similarity DECIMAL(5,2)
) AS $$
DECLARE
    article_tags JSONB;
BEGIN
    -- Get tags of the source article
    SELECT tags INTO article_tags FROM news_articles WHERE id = article_id_param;
    
    RETURN QUERY
    SELECT 
        na.id,
        na.title,
        (SELECT COUNT(*) FROM jsonb_array_elements_text(na.tags) tag1
         CROSS JOIN jsonb_array_elements_text(article_tags) tag2
         WHERE tag1 = tag2)::DECIMAL as similarity
    FROM news_articles na
    WHERE na.id != article_id_param
    AND na.tags && article_tags
    ORDER BY similarity DESC, na.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_old_content()
RETURNS void AS $$
BEGIN
    -- Keep articles for 1 year
    DELETE FROM news_articles WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Keep tournament results for 2 years
    DELETE FROM tournament_results WHERE created_at < NOW() - INTERVAL '2 years';
    
    -- Keep player updates for 1 year
    DELETE FROM player_updates WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Keep trending topics for 30 days
    DELETE FROM trending_topics WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Keep analytics for 1 year
    DELETE FROM article_analytics WHERE date < CURRENT_DATE - INTERVAL '1 year';
    
    -- Keep content generation logs for 30 days
    DELETE FROM content_generation_log WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION update_article_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_news_articles_updated_at
    BEFORE UPDATE ON news_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_article_updated_at();

CREATE TRIGGER update_tournament_results_updated_at
    BEFORE UPDATE ON tournament_results
    FOR EACH ROW
    EXECUTE FUNCTION update_article_updated_at();

CREATE TRIGGER update_trending_topics_updated_at
    BEFORE UPDATE ON trending_topics
    FOR EACH ROW
    EXECUTE FUNCTION update_article_updated_at();

-- Insert default categories
INSERT INTO news_categories (name, description, color, icon, priority) VALUES
('tournament', 'Tournament news and results', '#3B82F6', 'trophy', 1),
('player', 'Player updates and profiles', '#10B981', 'user', 2),
('analysis', 'Game analysis and commentary', '#8B5CF6', 'brain', 3),
('controversy', 'Controversial topics and debates', '#EF4444', 'alert-triangle', 4),
('technology', 'Chess technology and AI', '#06B6D4', 'cpu', 5),
('history', 'Chess history and culture', '#F59E0B', 'book-open', 6),
('digest', 'Daily and weekly summaries', '#6B7280', 'calendar', 7)
ON CONFLICT (name) DO NOTHING;

-- Insert default content sources
INSERT INTO content_sources (name, url, type, scrape_frequency) VALUES
('Chess.com News', 'https://chess.com/news', 'news', 1800),
('Lichess Blog', 'https://lichess.org/blog', 'news', 3600),
('FIDE News', 'https://fide.com/news', 'news', 7200),
('Chess24 News', 'https://chess24.com/en/news', 'news', 3600),
('ChessBase News', 'https://chessbase.com/news', 'news', 3600)
ON CONFLICT DO NOTHING; 
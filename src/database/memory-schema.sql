-- Memory & Archive Features Database Schema
-- This schema supports personal game archive, pattern recognition, and improvement tracking

-- Game Archive Table
CREATE TABLE IF NOT EXISTS game_archive (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pgn TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    tags JSONB DEFAULT '[]',
    result VARCHAR(10) NOT NULL CHECK (result IN ('win', 'loss', 'draw')),
    opponent VARCHAR(100),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    time_control VARCHAR(50),
    rating INTEGER,
    opponent_rating INTEGER,
    analysis JSONB NOT NULL DEFAULT '{}',
    patterns JSONB DEFAULT '[]',
    weaknesses JSONB DEFAULT '[]',
    improvements JSONB DEFAULT '[]',
    is_favorite BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pattern Recognition Table
CREATE TABLE IF NOT EXISTS pattern_recognition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN ('opening', 'middlegame', 'endgame', 'tactic', 'strategy')),
    pattern_name VARCHAR(100) NOT NULL,
    description TEXT,
    frequency INTEGER DEFAULT 1,
    success_rate DECIMAL(5,4) DEFAULT 0,
    moves JSONB DEFAULT '[]',
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weakness Analysis Table
CREATE TABLE IF NOT EXISTS weakness_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('opening', 'middlegame', 'endgame', 'time', 'psychology', 'tactics', 'strategy')),
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    frequency INTEGER DEFAULT 1,
    examples JSONB DEFAULT '[]',
    suggested_improvements JSONB DEFAULT '[]',
    first_identified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_occurrence TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_resolved BOOLEAN DEFAULT FALSE,
    resolution_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Improvement Plans Table
CREATE TABLE IF NOT EXISTS improvement_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    area VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    target_date TIMESTAMP WITH TIME ZONE,
    completed BOOLEAN DEFAULT FALSE,
    exercises JSONB DEFAULT '[]',
    milestones JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game Collections Table
CREATE TABLE IF NOT EXISTS game_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    tags JSONB DEFAULT '[]',
    game_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection Games Table
CREATE TABLE IF NOT EXISTS collection_games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES game_collections(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES game_archive(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    UNIQUE(collection_id, game_id)
);

-- Memory Palace Table
CREATE TABLE IF NOT EXISTS memory_palace (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_name VARCHAR(100) NOT NULL,
    room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('opening', 'middlegame', 'endgame', 'tactic', 'strategy')),
    description TEXT,
    visual_elements JSONB DEFAULT '[]',
    associated_games JSONB DEFAULT '[]',
    memory_strength INTEGER DEFAULT 0 CHECK (memory_strength >= 0 AND memory_strength <= 100),
    last_reviewed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Sessions Table
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('opening', 'middlegame', 'endgame', 'tactic', 'strategy', 'game_analysis')),
    duration INTEGER NOT NULL, -- minutes
    games_analyzed INTEGER DEFAULT 0,
    patterns_identified INTEGER DEFAULT 0,
    weaknesses_addressed INTEGER DEFAULT 0,
    improvement_progress INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Tracking Table
CREATE TABLE IF NOT EXISTS performance_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_lost INTEGER DEFAULT 0,
    games_drawn INTEGER DEFAULT 0,
    average_accuracy DECIMAL(5,2) DEFAULT 0,
    average_centipawn_loss DECIMAL(10,2) DEFAULT 0,
    blunders_count INTEGER DEFAULT 0,
    mistakes_count INTEGER DEFAULT 0,
    inaccuracies_count INTEGER DEFAULT 0,
    patterns_used INTEGER DEFAULT 0,
    weaknesses_exposed INTEGER DEFAULT 0,
    improvement_progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_game_archive_user_id ON game_archive(user_id);
CREATE INDEX IF NOT EXISTS idx_game_archive_date ON game_archive(date);
CREATE INDEX IF NOT EXISTS idx_game_archive_result ON game_archive(result);
CREATE INDEX IF NOT EXISTS idx_game_archive_tags ON game_archive USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_pattern_recognition_user_id ON pattern_recognition(user_id);
CREATE INDEX IF NOT EXISTS idx_pattern_recognition_type ON pattern_recognition(pattern_type);
CREATE INDEX IF NOT EXISTS idx_pattern_recognition_frequency ON pattern_recognition(frequency);

CREATE INDEX IF NOT EXISTS idx_weakness_analysis_user_id ON weakness_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_weakness_analysis_category ON weakness_analysis(category);
CREATE INDEX IF NOT EXISTS idx_weakness_analysis_severity ON weakness_analysis(severity);

CREATE INDEX IF NOT EXISTS idx_improvement_plans_user_id ON improvement_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_improvement_plans_completed ON improvement_plans(completed);
CREATE INDEX IF NOT EXISTS idx_improvement_plans_target_date ON improvement_plans(target_date);

CREATE INDEX IF NOT EXISTS idx_game_collections_user_id ON game_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_game_collections_is_public ON game_collections(is_public);

CREATE INDEX IF NOT EXISTS idx_collection_games_collection_id ON collection_games(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_games_game_id ON collection_games(game_id);

CREATE INDEX IF NOT EXISTS idx_memory_palace_user_id ON memory_palace(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_palace_room_type ON memory_palace(room_type);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_type ON study_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_study_sessions_created_at ON study_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_performance_tracking_user_id ON performance_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_tracking_date ON performance_tracking(date);

-- Functions for Memory & Archive Management

-- Function to add game to archive
CREATE OR REPLACE FUNCTION add_game_to_archive(
    p_user_id UUID,
    p_pgn TEXT,
    p_title VARCHAR(255),
    p_tags JSONB DEFAULT '[]',
    p_result VARCHAR(10),
    p_opponent VARCHAR(100),
    p_date TIMESTAMP WITH TIME ZONE,
    p_time_control VARCHAR(50),
    p_rating INTEGER,
    p_opponent_rating INTEGER
)
RETURNS UUID AS $$
DECLARE
    game_id UUID;
BEGIN
    INSERT INTO game_archive (
        user_id, pgn, title, tags, result, opponent, date, 
        time_control, rating, opponent_rating
    )
    VALUES (
        p_user_id, p_pgn, p_title, p_tags, p_result, p_opponent, p_date,
        p_time_control, p_rating, p_opponent_rating
    )
    RETURNING id INTO game_id;

    -- Update collection game count
    UPDATE game_collections 
    SET game_count = game_count + 1
    WHERE user_id = p_user_id;

    RETURN game_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update pattern recognition
CREATE OR REPLACE FUNCTION update_pattern_recognition(
    p_user_id UUID,
    p_pattern_type VARCHAR(50),
    p_pattern_name VARCHAR(100),
    p_success_rate DECIMAL(5,4)
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO pattern_recognition (
        user_id, pattern_type, pattern_name, success_rate
    )
    VALUES (
        p_user_id, p_pattern_type, p_pattern_name, p_success_rate
    )
    ON CONFLICT (user_id, pattern_type, pattern_name)
    DO UPDATE SET 
        frequency = pattern_recognition.frequency + 1,
        success_rate = (pattern_recognition.success_rate + EXCLUDED.success_rate) / 2,
        last_seen = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update weakness analysis
CREATE OR REPLACE FUNCTION update_weakness_analysis(
    p_user_id UUID,
    p_category VARCHAR(50),
    p_description TEXT,
    p_severity VARCHAR(20)
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO weakness_analysis (
        user_id, category, description, severity
    )
    VALUES (
        p_user_id, p_category, p_description, p_severity
    )
    ON CONFLICT (user_id, category, description)
    DO UPDATE SET 
        frequency = weakness_analysis.frequency + 1,
        last_occurrence = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to create improvement plan
CREATE OR REPLACE FUNCTION create_improvement_plan(
    p_user_id UUID,
    p_area VARCHAR(100),
    p_description TEXT,
    p_target_date TIMESTAMP WITH TIME ZONE
)
RETURNS UUID AS $$
DECLARE
    plan_id UUID;
BEGIN
    INSERT INTO improvement_plans (
        user_id, area, description, target_date
    )
    VALUES (
        p_user_id, p_area, p_description, p_target_date
    )
    RETURNING id INTO plan_id;

    RETURN plan_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update improvement progress
CREATE OR REPLACE FUNCTION update_improvement_progress(
    p_plan_id UUID,
    p_progress INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE improvement_plans 
    SET progress = p_progress,
        completed = CASE WHEN p_progress >= 100 THEN TRUE ELSE FALSE END,
        updated_at = NOW()
    WHERE id = p_plan_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user performance summary
CREATE OR REPLACE FUNCTION get_user_performance_summary(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_games BIGINT,
    win_rate DECIMAL(5,2),
    average_accuracy DECIMAL(5,2),
    total_patterns BIGINT,
    active_weaknesses BIGINT,
    improvement_progress INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_games,
        ROUND((COUNT(CASE WHEN result = 'win' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2) as win_rate,
        ROUND(AVG((analysis->>'accuracy')::DECIMAL), 2) as average_accuracy,
        (SELECT COUNT(*) FROM pattern_recognition WHERE user_id = p_user_id AND is_active = TRUE) as total_patterns,
        (SELECT COUNT(*) FROM weakness_analysis WHERE user_id = p_user_id AND is_resolved = FALSE) as active_weaknesses,
        COALESCE((SELECT AVG(progress)::INTEGER FROM improvement_plans WHERE user_id = p_user_id AND completed = FALSE), 0) as improvement_progress
    FROM game_archive 
    WHERE user_id = p_user_id
    AND date >= NOW() - INTERVAL '1 day' * p_days;
END;
$$ LANGUAGE plpgsql;

-- Function to get memory palace summary
CREATE OR REPLACE FUNCTION get_memory_palace_summary(
    p_user_id UUID
)
RETURNS TABLE (
    room_type VARCHAR(50),
    room_count BIGINT,
    average_memory_strength DECIMAL(5,2),
    total_games BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mp.room_type,
        COUNT(mp.id) as room_count,
        ROUND(AVG(mp.memory_strength), 2) as average_memory_strength,
        COUNT(DISTINCT ga.id) as total_games
    FROM memory_palace mp
    LEFT JOIN game_archive ga ON mp.user_id = ga.user_id 
        AND mp.room_type = CASE 
            WHEN ga.date < NOW() - INTERVAL '10 moves' THEN 'opening'
            WHEN ga.date < NOW() - INTERVAL '30 moves' THEN 'middlegame'
            ELSE 'endgame'
        END
    WHERE mp.user_id = p_user_id
    GROUP BY mp.room_type;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic actions

-- Trigger to update game archive updated_at
CREATE OR REPLACE FUNCTION update_game_archive_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_game_archive_updated_at
    BEFORE UPDATE ON game_archive
    FOR EACH ROW
    EXECUTE FUNCTION update_game_archive_updated_at();

-- Trigger to update pattern recognition updated_at
CREATE OR REPLACE FUNCTION update_pattern_recognition_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pattern_recognition_updated_at
    BEFORE UPDATE ON pattern_recognition
    FOR EACH ROW
    EXECUTE FUNCTION update_pattern_recognition_updated_at();

-- Trigger to update weakness analysis updated_at
CREATE OR REPLACE FUNCTION update_weakness_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_weakness_analysis_updated_at
    BEFORE UPDATE ON weakness_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_weakness_analysis_updated_at();

-- Trigger to update improvement plans updated_at
CREATE OR REPLACE FUNCTION update_improvement_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_improvement_plans_updated_at
    BEFORE UPDATE ON improvement_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_improvement_plans_updated_at();

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO thechesswire_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO thechesswire_user; 
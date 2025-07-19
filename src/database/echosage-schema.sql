-- Advanced EchoSage Coaching Database Schema
-- This schema supports AI coaches, training sessions, and psychological profiling

-- AI Coaches Table
CREATE TABLE IF NOT EXISTS ai_coaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    personality JSONB NOT NULL,
    expertise JSONB DEFAULT '[]',
    communication_style TEXT,
    teaching_method TEXT,
    motivational_style TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Sessions Table
CREATE TABLE IF NOT EXISTS training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES ai_coaches(id) ON DELETE CASCADE,
    session_type JSONB NOT NULL,
    duration INTEGER DEFAULT 0, -- minutes
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'master')),
    focus JSONB DEFAULT '[]',
    exercises JSONB DEFAULT '[]',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    feedback JSONB DEFAULT '[]',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Psychological Profiles Table
CREATE TABLE IF NOT EXISTS psychological_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    playing_style VARCHAR(100),
    decision_making VARCHAR(100),
    time_management VARCHAR(100),
    stress_response VARCHAR(100),
    confidence INTEGER DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
    focus INTEGER DEFAULT 50 CHECK (focus >= 0 AND focus <= 100),
    patience INTEGER DEFAULT 50 CHECK (patience >= 0 AND patience <= 100),
    aggression INTEGER DEFAULT 50 CHECK (aggression >= 0 AND aggression <= 100),
    adaptability INTEGER DEFAULT 50 CHECK (adaptability >= 0 AND adaptability <= 100),
    analysis TEXT,
    recommendations JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Exercises Table
CREATE TABLE IF NOT EXISTS training_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('puzzle', 'analysis', 'simulation', 'drill', 'game', 'review')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    position TEXT, -- FEN
    moves JSONB DEFAULT '[]',
    solution JSONB DEFAULT '[]',
    hints JSONB DEFAULT '[]',
    difficulty INTEGER DEFAULT 5 CHECK (difficulty >= 1 AND difficulty <= 10),
    time_limit INTEGER DEFAULT 300, -- seconds
    points INTEGER DEFAULT 100,
    completed BOOLEAN DEFAULT FALSE,
    user_answer TEXT,
    correct BOOLEAN,
    time_spent INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coach Interactions Table
CREATE TABLE IF NOT EXISTS coach_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES ai_coaches(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('feedback', 'motivation', 'instruction', 'analysis', 'encouragement')),
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    effectiveness INTEGER DEFAULT 0 CHECK (effectiveness >= 0 AND effectiveness <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Paths Table
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'master')),
    focus_areas JSONB DEFAULT '[]',
    total_sessions INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Path Sessions Table
CREATE TABLE IF NOT EXISTS learning_path_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    session_order INTEGER NOT NULL,
    session_type JSONB NOT NULL,
    prerequisites JSONB DEFAULT '[]',
    estimated_duration INTEGER DEFAULT 30, -- minutes
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'master')),
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Analytics Table
CREATE TABLE IF NOT EXISTS performance_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES training_exercises(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('accuracy', 'speed', 'difficulty', 'progress', 'engagement')),
    metric_value DECIMAL(10,2) NOT NULL,
    context JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coach Personalities Table
CREATE TABLE IF NOT EXISTS coach_personalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('analytical', 'intuitive', 'aggressive', 'defensive', 'creative', 'systematic')),
    traits JSONB DEFAULT '[]',
    strengths JSONB DEFAULT '[]',
    weaknesses JSONB DEFAULT '[]',
    motivational_quotes JSONB DEFAULT '[]',
    teaching_methods JSONB DEFAULT '[]',
    communication_styles JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Templates Table
CREATE TABLE IF NOT EXISTS training_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    session_type JSONB NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'master')),
    focus_areas JSONB DEFAULT '[]',
    exercise_count INTEGER DEFAULT 5,
    estimated_duration INTEGER DEFAULT 30, -- minutes
    is_public BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_ai_coaches_user_id ON ai_coaches(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coaches_is_active ON ai_coaches(is_active);

CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id ON training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_coach_id ON training_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_completed ON training_sessions(completed);
CREATE INDEX IF NOT EXISTS idx_training_sessions_difficulty ON training_sessions(difficulty);

CREATE INDEX IF NOT EXISTS idx_psychological_profiles_user_id ON psychological_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_psychological_profiles_created_at ON psychological_profiles(created_at);

CREATE INDEX IF NOT EXISTS idx_training_exercises_session_id ON training_exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_training_exercises_type ON training_exercises(type);
CREATE INDEX IF NOT EXISTS idx_training_exercises_completed ON training_exercises(completed);

CREATE INDEX IF NOT EXISTS idx_coach_interactions_user_id ON coach_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_interactions_coach_id ON coach_interactions(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_interactions_type ON coach_interactions(interaction_type);

CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_is_active ON learning_paths(is_active);

CREATE INDEX IF NOT EXISTS idx_learning_path_sessions_path_id ON learning_path_sessions(path_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_sessions_order ON learning_path_sessions(session_order);

CREATE INDEX IF NOT EXISTS idx_performance_analytics_user_id ON performance_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_analytics_metric_type ON performance_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_analytics_recorded_at ON performance_analytics(recorded_at);

CREATE INDEX IF NOT EXISTS idx_coach_personalities_type ON coach_personalities(type);
CREATE INDEX IF NOT EXISTS idx_coach_personalities_is_active ON coach_personalities(is_active);

CREATE INDEX IF NOT EXISTS idx_training_templates_difficulty ON training_templates(difficulty);
CREATE INDEX IF NOT EXISTS idx_training_templates_is_public ON training_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_training_templates_rating ON training_templates(rating);

-- Functions for EchoSage Management

-- Function to create AI coach
CREATE OR REPLACE FUNCTION create_ai_coach(
    p_user_id UUID,
    p_personality JSONB,
    p_expertise JSONB DEFAULT '[]',
    p_communication_style TEXT DEFAULT NULL,
    p_teaching_method TEXT DEFAULT NULL,
    p_motivational_style TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    coach_id UUID;
BEGIN
    INSERT INTO ai_coaches (
        user_id, personality, expertise, communication_style, 
        teaching_method, motivational_style
    )
    VALUES (
        p_user_id, p_personality, p_expertise, p_communication_style,
        p_teaching_method, p_motivational_style
    )
    RETURNING id INTO coach_id;

    RETURN coach_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create training session
CREATE OR REPLACE FUNCTION create_training_session(
    p_user_id UUID,
    p_coach_id UUID,
    p_session_type JSONB,
    p_difficulty VARCHAR(20),
    p_focus JSONB DEFAULT '[]',
    p_exercises JSONB DEFAULT '[]'
)
RETURNS UUID AS $$
DECLARE
    session_id UUID;
BEGIN
    INSERT INTO training_sessions (
        user_id, coach_id, session_type, difficulty, focus, exercises
    )
    VALUES (
        p_user_id, p_coach_id, p_session_type, p_difficulty, p_focus, p_exercises
    )
    RETURNING id INTO session_id;

    RETURN session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update session progress
CREATE OR REPLACE FUNCTION update_session_progress(
    p_session_id UUID,
    p_progress INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE training_sessions 
    SET progress = p_progress,
        completed = CASE WHEN p_progress >= 100 THEN TRUE ELSE FALSE END,
        completed_at = CASE WHEN p_progress >= 100 THEN NOW() ELSE completed_at END,
        updated_at = NOW()
    WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to record performance analytics
CREATE OR REPLACE FUNCTION record_performance_analytics(
    p_user_id UUID,
    p_session_id UUID,
    p_exercise_id UUID,
    p_metric_type VARCHAR(50),
    p_metric_value DECIMAL(10,2),
    p_context JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    analytics_id UUID;
BEGIN
    INSERT INTO performance_analytics (
        user_id, session_id, exercise_id, metric_type, metric_value, context
    )
    VALUES (
        p_user_id, p_session_id, p_exercise_id, p_metric_type, p_metric_value, p_context
    )
    RETURNING id INTO analytics_id;

    RETURN analytics_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user coaching summary
CREATE OR REPLACE FUNCTION get_user_coaching_summary(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_sessions BIGINT,
    completed_sessions BIGINT,
    average_progress DECIMAL(5,2),
    total_exercises BIGINT,
    correct_exercises BIGINT,
    average_accuracy DECIMAL(5,2),
    coach_personality VARCHAR(50),
    psychological_confidence INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(ts.id) as total_sessions,
        COUNT(CASE WHEN ts.completed THEN 1 END) as completed_sessions,
        ROUND(AVG(ts.progress), 2) as average_progress,
        COUNT(te.id) as total_exercises,
        COUNT(CASE WHEN te.correct THEN 1 END) as correct_exercises,
        ROUND((COUNT(CASE WHEN te.correct THEN 1 END)::DECIMAL / COUNT(te.id)) * 100, 2) as average_accuracy,
        ac.personality->>'type' as coach_personality,
        pp.confidence as psychological_confidence
    FROM training_sessions ts
    LEFT JOIN ai_coaches ac ON ts.coach_id = ac.id
    LEFT JOIN training_exercises te ON ts.id = te.session_id
    LEFT JOIN psychological_profiles pp ON ts.user_id = pp.user_id
    WHERE ts.user_id = p_user_id
    AND ts.created_at >= NOW() - INTERVAL '1 day' * p_days
    GROUP BY ac.personality->>'type', pp.confidence;
END;
$$ LANGUAGE plpgsql;

-- Function to get learning path progress
CREATE OR REPLACE FUNCTION get_learning_path_progress(
    p_user_id UUID
)
RETURNS TABLE (
    path_name VARCHAR(100),
    total_sessions INTEGER,
    completed_sessions INTEGER,
    progress INTEGER,
    next_session JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lp.name as path_name,
        lp.total_sessions,
        lp.completed_sessions,
        lp.progress,
        (SELECT jsonb_build_object(
            'session_order', lps.session_order,
            'session_type', lps.session_type,
            'estimated_duration', lps.estimated_duration
        )
        FROM learning_path_sessions lps
        WHERE lps.path_id = lp.id
        AND lps.session_order > lp.completed_sessions
        ORDER BY lps.session_order
        LIMIT 1) as next_session
    FROM learning_paths lp
    WHERE lp.user_id = p_user_id
    AND lp.is_active = TRUE
    ORDER BY lp.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic actions

-- Trigger to update AI coaches updated_at
CREATE OR REPLACE FUNCTION update_ai_coaches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_coaches_updated_at
    BEFORE UPDATE ON ai_coaches
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_coaches_updated_at();

-- Trigger to update training sessions updated_at
CREATE OR REPLACE FUNCTION update_training_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_training_sessions_updated_at
    BEFORE UPDATE ON training_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_training_sessions_updated_at();

-- Trigger to update psychological profiles updated_at
CREATE OR REPLACE FUNCTION update_psychological_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_psychological_profiles_updated_at
    BEFORE UPDATE ON psychological_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_psychological_profiles_updated_at();

-- Trigger to update learning paths updated_at
CREATE OR REPLACE FUNCTION update_learning_paths_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_learning_paths_updated_at
    BEFORE UPDATE ON learning_paths
    FOR EACH ROW
    EXECUTE FUNCTION update_learning_paths_updated_at();

-- Trigger to update training templates updated_at
CREATE OR REPLACE FUNCTION update_training_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_training_templates_updated_at
    BEFORE UPDATE ON training_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_training_templates_updated_at();

-- Initial data

-- Insert default coach personalities
INSERT INTO coach_personalities (name, type, traits, strengths, weaknesses, motivational_quotes, teaching_methods, communication_styles) VALUES
('Analytical Master', 'analytical', 
 '["logical", "systematic", "detail-oriented", "patient"]',
 '["deep analysis", "positional understanding", "endgame technique"]',
 '["over-analysis", "time trouble", "lack of intuition"]',
 '["Every position has a logical solution.", "Analysis is the key to improvement.", "Understanding precedes mastery."]',
 '["Step-by-step analysis", "Detailed explanations", "Systematic approach"]',
 '["Precise and technical", "Logical reasoning", "Thorough explanations"]'),

('Intuitive Genius', 'intuitive',
 '["creative", "instinctive", "dynamic", "imaginative"]',
 '["tactical vision", "creative play", "dynamic positions"]',
 '["inconsistent", "lack of patience", "positional weaknesses"]',
 '["Trust your instincts, but verify with calculation.", "Creativity is your greatest weapon.", "Let your imagination guide you."]',
 '["Pattern recognition", "Creative exercises", "Intuitive learning"]',
 '["Inspirational", "Creative language", "Imaginative descriptions"]'),

('Aggressive Warrior', 'aggressive',
 '["bold", "confident", "direct", "energetic"]',
 '["attacking play", "initiative", "psychological pressure"]',
 '["over-extension", "tactical oversights", "defensive weaknesses"]',
 '["Attack is the best form of defense.", "Seize the initiative and never let go.", "Your opponent should fear your moves."]',
 '["Active learning", "Challenging positions", "Attack training"]',
 '["Direct and confident", "Bold statements", "Energetic communication"]'),

('Defensive Guardian', 'defensive',
 '["cautious", "solid", "patient", "resilient"]',
 '["defensive technique", "endgame skill", "positional solidity"]',
 '["lack of initiative", "passive play", "missed opportunities"]',
 '["Solid defense wins championships.", "Patience is a virtue in chess.", "A strong defense creates counter-attacking chances."]',
 '["Patient guidance", "Solid foundations", "Defensive training"]',
 '["Cautious and thorough", "Careful analysis", "Patient explanations"]'),

('Creative Artist', 'creative',
 '["innovative", "artistic", "unconventional", "expressive"]',
 '["original ideas", "beautiful combinations", "artistic play"]',
 '["practicality", "consistency", "theoretical knowledge"]',
 '["Chess is art, and you are the artist.", "Create beauty on the board.", "Innovation is the path to greatness."]',
 '["Artistic examples", "Creative inspiration", "Innovative approaches"]',
 '["Artistic and expressive", "Colorful language", "Inspirational messages"]'),

('Systematic Scholar', 'systematic',
 '["organized", "methodical", "thorough", "reliable"]',
 '["opening preparation", "systematic approach", "reliable technique"]',
 '["lack of creativity", "rigidity", "predictability"]',
 '["Systematic improvement leads to mastery.", "Method is the key to success.", "Consistency is the foundation of excellence."]',
 '["Structured learning", "Progressive difficulty", "Methodical approach"]',
 '["Organized and methodical", "Clear structure", "Systematic explanations"]')
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO thechesswire_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO thechesswire_user; 
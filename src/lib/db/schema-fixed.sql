-- src/lib/db/schema-fixed.sql
-- Module 287: Full encryption for sensitive data

-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS user_analytics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  event_type VARCHAR(100),
  event_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_analytics (
  id SERIAL PRIMARY KEY,
  content_id VARCHAR(255) UNIQUE,
  content_type VARCHAR(50),
  views INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  avg_watch_time INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS voice_analytics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  voice_mode VARCHAR(50),
  duration INTEGER,
  emotional_tone VARCHAR(50),
  interaction_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS premium_usage_analytics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  feature VARCHAR(100),
  usage_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  plan_type VARCHAR(50),
  status VARCHAR(50),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feature_usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  feature VARCHAR(100),
  usage_amount INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, feature, DATE(created_at))
);

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(20),
  permissions JSONB,
  session_token VARCHAR(255),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_action_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admin_users(id),
  action VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emotion_annotations (
  id SERIAL PRIMARY KEY,
  position_fen TEXT,
  emotions JSONB,
  narrative TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ghost_opponents (
  id SERIAL PRIMARY KEY,
  ghost_id VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  playing_style VARCHAR(100),
  strengths JSONB,
  weaknesses JSONB,
  emotional_profile JSONB,
  game_history JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coaching_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) UNIQUE,
  skill_level VARCHAR(50),
  focus_areas JSONB,
  exercises JSONB,
  progress_tracking JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS soul_scans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  chess_personality VARCHAR(100),
  playing_style VARCHAR(100),
  emotional_patterns JSONB,
  recommendations JSONB,
  strengths JSONB,
  improvement_areas JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS training_exercises (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  exercise_id VARCHAR(255),
  completed BOOLEAN DEFAULT FALSE,
  accuracy DECIMAL(5,2),
  completed_at TIMESTAMP,
  UNIQUE(user_id, exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON user_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_content_analytics_content_id ON content_analytics(content_id);
CREATE INDEX IF NOT EXISTS idx_voice_analytics_user_id ON voice_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_coaching_plans_user_id ON coaching_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_soul_scans_user_id ON soul_scans(user_id);

-- FIRST: Create the users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    echo_origin VARCHAR(50),
    voice_mode VARCHAR(50),
    voice_enabled BOOLEAN DEFAULT TRUE,
    
    -- Titled player fields
    titled_player BOOLEAN DEFAULT FALSE,
    titled_player_verified BOOLEAN DEFAULT FALSE,
    titled_player_title VARCHAR(10),
    titled_player_verification_method VARCHAR(20),
    titled_player_verified_at TIMESTAMP,
    fide_id VARCHAR(20),
    chess_com_username VARCHAR(50),
    chess_rating INTEGER,
    verification_attempts INTEGER DEFAULT 0,
    last_verification_attempt TIMESTAMP,
    
    -- Account fields
    account_type VARCHAR(50) DEFAULT 'free',
    premium_features BOOLEAN DEFAULT FALSE,
    echo_rank INTEGER DEFAULT 0,
    soul_cinema_credits INTEGER DEFAULT 3,
    
    -- Security fields
    behavior_fingerprint TEXT,
    ip_address TEXT,
    user_agent TEXT,
    
    -- Consent fields
    accepted_terms BOOLEAN DEFAULT FALSE,
    accepted_privacy BOOLEAN DEFAULT FALSE,
    accepted_at TIMESTAMP,
    gdpr_consent BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_users_fide_id ON users(fide_id) WHERE fide_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_chess_com_username ON users(LOWER(chess_com_username)) WHERE chess_com_username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_titled_verified ON users(titled_player_verified) WHERE titled_player_verified = TRUE;

-- Titled player verification logs (Module 287: Encrypted)
CREATE TABLE IF NOT EXISTS titled_player_verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    ip_address BYTEA, -- Encrypted with pgcrypto
    fide_id_encrypted BYTEA, -- Encrypted
    username_encrypted BYTEA, -- Encrypted
    verification_method VARCHAR(20),
    verification_status VARCHAR(20), -- 'pending', 'verified', 'failed', 'manual_review'
    title VARCHAR(10),
    rating INTEGER,
    attempt_metadata JSONB, -- Stores behavior fingerprint, user agent, etc.
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manual review queue for suspicious verifications
CREATE TABLE IF NOT EXISTS titled_player_review_queue (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    reason VARCHAR(255), -- Why it needs manual review
    verification_data JSONB,
    reviewed BOOLEAN DEFAULT FALSE,
    reviewed_by INTEGER REFERENCES users(id),
    review_decision VARCHAR(50), -- 'approved', 'rejected', 'needs_more_info'
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

-- Abuse tracking for verification attempts (Module 73-75)
CREATE TABLE IF NOT EXISTS verification_abuse_logs (
    id SERIAL PRIMARY KEY,
    ip_address BYTEA, -- Encrypted
    fingerprint_hash VARCHAR(64), -- SHA256 of behavior fingerprint
    user_agent TEXT,
    abuse_type VARCHAR(50), -- 'rate_limit', 'fake_credentials', 'vpn_detected', etc.
    abuse_score INTEGER DEFAULT 0,
    blocked BOOLEAN DEFAULT FALSE,
    blocked_until TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security logs table
CREATE TABLE IF NOT EXISTS security_logs (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    ip_address BYTEA,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT)
RETURNS BYTEA AS $$
BEGIN
    -- Note: In production, set the encryption key as a configuration parameter
    -- For now, using a placeholder
    RETURN pgp_sym_encrypt(data, 'your-encryption-key-here');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive data
CREATE OR REPLACE FUNCTION decrypt_sensitive_data(data BYTEA)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(data, 'your-encryption-key-here');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_titled_player_verifications_updated_at
    BEFORE UPDATE ON titled_player_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

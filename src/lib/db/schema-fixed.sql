-- src/lib/db/schema-fixed.sql
-- Module 287: Full encryption for sensitive data

-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

CREATE TABLE IF NOT EXISTS content_analysis_cache (
  id SERIAL PRIMARY KEY,
  analysis_id VARCHAR(64) UNIQUE NOT NULL,
  content_type VARCHAR(20) NOT NULL,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_pipeline_results (
  id SERIAL PRIMARY KEY,
  analysis_id VARCHAR(64) NOT NULL,
  content_type VARCHAR(20) NOT NULL,
  original_content TEXT NOT NULL,
  emotional_profile JSONB,
  narrative_adaptations JSONB,
  key_moments JSONB,
  content_tags TEXT[],
  difficulty_level VARCHAR(20),
  engagement_score INTEGER,
  social_snippets JSONB,
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (analysis_id) REFERENCES content_analysis_cache(analysis_id)
);

CREATE TABLE IF NOT EXISTS pgn_emotion_analysis (
  id SERIAL PRIMARY KEY,
  pgn_hash VARCHAR(64) UNIQUE NOT NULL,
  emotion_heatmap JSONB NOT NULL,
  overall_arc TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pgn_emotion_hash ON pgn_emotion_analysis(pgn_hash);
CREATE INDEX IF NOT EXISTS idx_pgn_emotion_created ON pgn_emotion_analysis(created_at);
CREATE INDEX IF NOT EXISTS idx_content_analysis_cache_id ON content_analysis_cache(analysis_id);
CREATE INDEX IF NOT EXISTS idx_content_pipeline_results_id ON content_pipeline_results(analysis_id);

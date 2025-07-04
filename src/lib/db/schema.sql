-- src/lib/db/schema.sql
-- Module 287: Full encryption for sensitive data

-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update users table for titled player verification
ALTER TABLE users ADD COLUMN IF NOT EXISTS titled_player BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS titled_player_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS titled_player_title VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS titled_player_verification_method VARCHAR(20); -- 'fide', 'chess_com', 'lichess'
ALTER TABLE users ADD COLUMN IF NOT EXISTS titled_player_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS fide_id VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS chess_com_username VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS chess_rating INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_verification_attempt TIMESTAMP;

-- Create indexes for efficient lookups
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

-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive data
CREATE OR REPLACE FUNCTION decrypt_sensitive_data(data BYTEA)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(data, current_setting('app.encryption_key'));
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

CREATE TRIGGER update_titled_player_verifications_updated_at
    BEFORE UPDATE ON titled_player_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample queries for verification

-- Insert verification attempt (encrypted)
-- INSERT INTO titled_player_verifications (
--     user_id, 
--     ip_address, 
--     fide_id_encrypted, 
--     verification_method, 
--     verification_status
-- ) VALUES (
--     1,
--     encrypt_sensitive_data('192.168.1.1'),
--     encrypt_sensitive_data('12345678'),
--     'fide',
--     'pending'
-- );

-- Query verified titled players
-- SELECT 
--     u.username,
--     u.titled_player_title,
--     u.chess_rating,
--     u.titled_player_verification_method,
--     u.titled_player_verified_at
-- FROM users u
-- WHERE u.titled_player_verified = TRUE
-- ORDER BY u.chess_rating DESC;

-- Check for duplicate registrations
-- SELECT COUNT(*) 
-- FROM users 
-- WHERE (fide_id = '12345678' OR LOWER(chess_com_username) = 'magnuscarlsen')
-- AND titled_player_verified = TRUE;
-- MFA Methods Table
CREATE TABLE IF NOT EXISTS mfa_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('totp', 'sms', 'email')),
    secret TEXT, -- For TOTP
    phone_number VARCHAR(20), -- For SMS
    email VARCHAR(255), -- For email verification
    is_enabled BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, type)
);

-- MFA Sessions Table (for temporary verification codes)
CREATE TABLE IF NOT EXISTS mfa_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    method_id VARCHAR(50) NOT NULL, -- 'sms', 'email', etc.
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MFA Backup Codes Table
CREATE TABLE IF NOT EXISTS mfa_backup_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mfa_methods_user_id ON mfa_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_methods_type ON mfa_methods(type);
CREATE INDEX IF NOT EXISTS idx_mfa_sessions_user_id ON mfa_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_sessions_token ON mfa_sessions(token);
CREATE INDEX IF NOT EXISTS idx_mfa_sessions_expires_at ON mfa_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_mfa_backup_codes_user_id ON mfa_backup_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_backup_codes_code_hash ON mfa_backup_codes(code_hash);

-- Clean up expired sessions (run this periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_mfa_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM mfa_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get user's MFA status
CREATE OR REPLACE FUNCTION get_user_mfa_status(user_uuid UUID)
RETURNS TABLE(
    has_mfa BOOLEAN,
    totp_enabled BOOLEAN,
    sms_enabled BOOLEAN,
    email_enabled BOOLEAN,
    backup_codes_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) > 0 as has_mfa,
        MAX(CASE WHEN type = 'totp' THEN is_enabled ELSE FALSE END) as totp_enabled,
        MAX(CASE WHEN type = 'sms' THEN is_enabled ELSE FALSE END) as sms_enabled,
        MAX(CASE WHEN type = 'email' THEN is_enabled ELSE FALSE END) as email_enabled,
        COUNT(CASE WHEN bc.is_used = FALSE THEN 1 END) as backup_codes_remaining
    FROM mfa_methods mm
    LEFT JOIN mfa_backup_codes bc ON mm.user_id = bc.user_id
    WHERE mm.user_id = user_uuid
    GROUP BY mm.user_id;
END;
$$ LANGUAGE plpgsql; 
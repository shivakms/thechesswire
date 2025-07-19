-- Advanced Security System Database Schema
-- This schema supports TOR detection, VPN blocking, bot detection, and threat intelligence

-- Security Events Table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip VARCHAR(45) NOT NULL,
    user_agent TEXT,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('blocked', 'suspicious', 'attack', 'rate_limited')),
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    country VARCHAR(2),
    is_tor BOOLEAN DEFAULT FALSE,
    is_vpn BOOLEAN DEFAULT FALSE,
    risk_score INTEGER DEFAULT 0,
    path VARCHAR(255),
    method VARCHAR(10),
    response_code INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Threat Intelligence Table
CREATE TABLE IF NOT EXISTS threat_intelligence (
    ip_address VARCHAR(45) PRIMARY KEY,
    risk_score INTEGER DEFAULT 0,
    threat_level VARCHAR(20) DEFAULT 'low' CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attack_types TEXT[],
    country VARCHAR(2),
    isp VARCHAR(255),
    organization VARCHAR(255),
    tags TEXT[]
);

-- TOR Exit Nodes Cache
CREATE TABLE IF NOT EXISTS tor_exit_nodes (
    ip_address VARCHAR(45) PRIMARY KEY,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- VPN/Proxy Detection Cache
CREATE TABLE IF NOT EXISTS vpn_proxy_cache (
    ip_address VARCHAR(45) PRIMARY KEY,
    is_vpn BOOLEAN DEFAULT FALSE,
    is_proxy BOOLEAN DEFAULT FALSE,
    is_tor BOOLEAN DEFAULT FALSE,
    country VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    isp VARCHAR(255),
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Bot Detection Patterns
CREATE TABLE IF NOT EXISTS bot_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_name VARCHAR(100) NOT NULL,
    pattern_regex TEXT NOT NULL,
    risk_score INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Rules
CREATE TABLE IF NOT EXISTS security_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Metrics
CREATE TABLE IF NOT EXISTS security_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC,
    metric_unit VARCHAR(20),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags JSONB
);

-- Automated Bans
CREATE TABLE IF NOT EXISTS automated_bans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address VARCHAR(45) NOT NULL,
    ban_reason VARCHAR(255) NOT NULL,
    risk_score INTEGER NOT NULL,
    ban_type VARCHAR(20) DEFAULT 'temporary' CHECK (ban_type IN ('temporary', 'permanent')),
    ban_duration INTERVAL,
    banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    appeal_status VARCHAR(20) DEFAULT 'none' CHECK (appeal_status IN ('none', 'pending', 'approved', 'rejected')),
    appeal_reason TEXT,
    appeal_processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Alerts
CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    details JSONB,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_risk_score ON security_events(risk_score);
CREATE INDEX IF NOT EXISTS idx_security_events_country ON security_events(country);

CREATE INDEX IF NOT EXISTS idx_threat_intelligence_risk_score ON threat_intelligence(risk_score);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_threat_level ON threat_intelligence(threat_level);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_updated_at ON threat_intelligence(updated_at);

CREATE INDEX IF NOT EXISTS idx_automated_bans_ip ON automated_bans(ip_address);
CREATE INDEX IF NOT EXISTS idx_automated_bans_is_active ON automated_bans(is_active);
CREATE INDEX IF NOT EXISTS idx_automated_bans_expires_at ON automated_bans(expires_at);

CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_is_resolved ON security_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON security_alerts(created_at);

-- Partitioning for large tables (optional for high-traffic sites)
-- CREATE TABLE security_events_2024_01 PARTITION OF security_events
-- FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Functions for Security Management

-- Function to clean old security events
CREATE OR REPLACE FUNCTION clean_old_security_events()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM security_events 
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update threat intelligence
CREATE OR REPLACE FUNCTION update_threat_intelligence(
    p_ip_address VARCHAR(45),
    p_risk_score INTEGER,
    p_event_type VARCHAR(20)
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO threat_intelligence (ip_address, risk_score, threat_level, last_seen, updated_at)
    VALUES (
        p_ip_address,
        p_risk_score,
        CASE 
            WHEN p_risk_score >= 80 THEN 'critical'
            WHEN p_risk_score >= 60 THEN 'high'
            WHEN p_risk_score >= 40 THEN 'medium'
            ELSE 'low'
        END,
        NOW(),
        NOW()
    )
    ON CONFLICT (ip_address) 
    DO UPDATE SET 
        risk_score = GREATEST(threat_intelligence.risk_score, p_risk_score),
        threat_level = CASE 
            WHEN GREATEST(threat_intelligence.risk_score, p_risk_score) >= 80 THEN 'critical'
            WHEN GREATEST(threat_intelligence.risk_score, p_risk_score) >= 60 THEN 'high'
            WHEN GREATEST(threat_intelligence.risk_score, p_risk_score) >= 40 THEN 'medium'
            ELSE 'low'
        END,
        last_seen = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check if IP is banned
CREATE OR REPLACE FUNCTION is_ip_banned(p_ip_address VARCHAR(45))
RETURNS BOOLEAN AS $$
DECLARE
    ban_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM automated_bans 
        WHERE ip_address = p_ip_address 
        AND is_active = TRUE 
        AND (expires_at IS NULL OR expires_at > NOW())
    ) INTO ban_exists;
    
    RETURN ban_exists;
END;
$$ LANGUAGE plpgsql;

-- Function to create security alert
CREATE OR REPLACE FUNCTION create_security_alert(
    p_alert_type VARCHAR(50),
    p_severity VARCHAR(20),
    p_title VARCHAR(255),
    p_description TEXT,
    p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    alert_id UUID;
BEGIN
    INSERT INTO security_alerts (alert_type, severity, title, description, details)
    VALUES (p_alert_type, p_severity, p_title, p_description, p_details)
    RETURNING id INTO alert_id;
    
    RETURN alert_id;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic actions

-- Trigger to automatically ban IPs with high risk scores
CREATE OR REPLACE FUNCTION auto_ban_high_risk_ips()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.risk_score >= 90 AND NEW.event_type = 'attack' THEN
        INSERT INTO automated_bans (ip_address, ban_reason, risk_score, ban_type, ban_duration)
        VALUES (
            NEW.ip,
            'Automatic ban: High risk attack detected',
            NEW.risk_score,
            'temporary',
            INTERVAL '24 hours'
        )
        ON CONFLICT (ip_address) DO NOTHING;
        
        -- Create security alert
        PERFORM create_security_alert(
            'auto_ban',
            'high',
            'High-risk IP automatically banned',
            'IP ' || NEW.ip || ' was automatically banned due to high risk score: ' || NEW.risk_score,
            jsonb_build_object('ip', NEW.ip, 'risk_score', NEW.risk_score, 'event_type', NEW.event_type)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_ban_high_risk_ips
    AFTER INSERT ON security_events
    FOR EACH ROW
    EXECUTE FUNCTION auto_ban_high_risk_ips();

-- Trigger to update threat intelligence on security events
CREATE OR REPLACE FUNCTION update_threat_intelligence_on_event()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_threat_intelligence(NEW.ip, NEW.risk_score, NEW.event_type);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_threat_intelligence
    AFTER INSERT ON security_events
    FOR EACH ROW
    EXECUTE FUNCTION update_threat_intelligence_on_event();

-- Scheduled jobs (using pg_cron if available)
-- SELECT cron.schedule('clean-security-events', '0 2 * * *', 'SELECT clean_old_security_events();');

-- Initial data

-- Insert default bot patterns
INSERT INTO bot_patterns (pattern_name, pattern_regex, risk_score) VALUES
('SQL Injection', 'union\s+select|drop\s+table|insert\s+into|delete\s+from', 50),
('XSS Attack', '<script|javascript:|onload=|onerror=|onclick=', 40),
('Path Traversal', '\.\.\/|\.\.\\|%2e%2e', 30),
('Command Injection', 'exec\s*\(|eval\s*\(|system\s*\(', 60),
('File Upload Attack', '\.php|\.asp|\.jsp|\.exe|\.bat', 35)
ON CONFLICT DO NOTHING;

-- Insert default security rules
INSERT INTO security_rules (rule_name, rule_type, conditions, actions, priority) VALUES
('Block High Risk IPs', 'risk_based', 
 '{"risk_score": {"gte": 80}}', 
 '{"action": "block", "duration": "24h"}', 100),
('Rate Limit Exceeded', 'rate_limit', 
 '{"requests_per_hour": {"gte": 100}}', 
 '{"action": "rate_limit", "duration": "1h"}', 90),
('Geographic Block', 'geographic', 
 '{"country": {"in": ["KP", "IR", "CU", "SY", "VE"]}}', 
 '{"action": "block", "reason": "Geographic restriction"}', 80),
('TOR Exit Node', 'network', 
 '{"is_tor": true}', 
 '{"action": "flag", "risk_score": 30}', 70)
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO thechesswire_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO thechesswire_user; 
-- Module 286: SoulGate Onboarding Database Schema
-- TheChessWire.news Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (encrypted PII)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL, -- Will be encrypted
    password_hash VARCHAR(255) NOT NULL,
    mfa_secret VARCHAR(255), -- Encrypted TOTP secret
    verification_token VARCHAR(255),
    verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    risk_score INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    rating INTEGER DEFAULT 1200,
    country VARCHAR(2),
    chess_style VARCHAR(50), -- 'tactical', 'positional', 'aggressive', 'defensive'
    voice_preference VARCHAR(20) DEFAULT 'calm', -- 'calm', 'expressive', 'dramatic', 'poetic'
    subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'premium', 'titled'
    fide_id VARCHAR(20), -- For titled players
    title VARCHAR(10), -- 'GM', 'IM', 'FM', 'CM', 'WGM', 'WIM', 'WFM', 'WCM'
    date_of_birth DATE, -- Age verification (18+ required)
    age_verified BOOLEAN DEFAULT FALSE, -- Age verification status
    age_verification_date TIMESTAMP, -- When age was verified
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Onboarding progress table
CREATE TABLE onboarding_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    step VARCHAR(50) NOT NULL, -- 'welcome', 'skill_level', 'interests', 'voice_setup', 'tutorial'
    completed BOOLEAN DEFAULT FALSE,
    data JSONB, -- Store step-specific data
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User interests table
CREATE TABLE user_interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    interest_type VARCHAR(50) NOT NULL, -- 'tactics', 'endgames', 'openings', 'middlegame'
    interest_level INTEGER DEFAULT 1, -- 1-5 scale
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voice usage tracking
CREATE TABLE voice_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    voice_mode VARCHAR(20) NOT NULL,
    text_length INTEGER NOT NULL,
    duration_seconds INTEGER,
    api_cost DECIMAL(10,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security events logging
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- 'login_attempt', 'rate_limit', 'suspicious_activity', 'ban'
    ip_address INET,
    user_agent TEXT,
    country_code VARCHAR(2),
    risk_score INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rate limiting table
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL, -- IP address or user ID
    endpoint VARCHAR(100) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP NOT NULL,
    window_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content generation tracking
CREATE TABLE content_generation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content_type VARCHAR(50) NOT NULL, -- 'article', 'analysis', 'video', 'voice'
    title VARCHAR(255),
    content_hash VARCHAR(64), -- SHA-256 hash of content
    generation_time_ms INTEGER,
    ai_model VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News articles table (Module 391)
CREATE TABLE news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(100) NOT NULL,
    source_url TEXT,
    event_type VARCHAR(50), -- 'tournament', 'player_news', 'game_analysis', 'controversy', 'technology'
    verification_score DECIMAL(3,2), -- 0.00 to 1.00
    fact_check_score DECIMAL(3,2), -- 0.00 to 1.00
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trending topics table (Module 391)
CREATE TABLE trending_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topics JSONB NOT NULL, -- Array of [topic, count] pairs
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI generated content table (Module 395)
CREATE TABLE ai_generated_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'breaking_news', 'long_form', 'statistical', 'opinion', 'controversy', 'interview'
    personality VARCHAR(100) NOT NULL, -- AI personality used
    word_count INTEGER NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Self-healing infrastructure logs (Module 392)
CREATE TABLE infrastructure_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_type VARCHAR(50) NOT NULL, -- 'scaling', 'backup', 'security', 'performance', 'downtime'
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'error', 'critical'
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI customer service tickets (Module 393)
CREATE TABLE ai_support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ticket_type VARCHAR(50) NOT NULL, -- 'account', 'payment', 'technical', 'content', 'general'
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    ai_resolution TEXT,
    resolution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Legal compliance requests (Module 394)
CREATE TABLE legal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    request_type VARCHAR(50) NOT NULL, -- 'gdpr_export', 'gdpr_deletion', 'copyright_claim', 'terms_update'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
    details JSONB NOT NULL,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Revenue events (Module 396)
CREATE TABLE revenue_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL, -- 'offer_sent', 'conversion', 'pricing_change', 'revenue_analysis'
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Revenue optimization config
CREATE TABLE pricing_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    premium_price DECIMAL(10,2) NOT NULL,
    titled_price DECIMAL(10,2) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security threats (Module 397)
CREATE TABLE security_threats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    threat_type VARCHAR(50) NOT NULL, -- 'account_takeover', 'payment_fraud', 'content_abuse', 'bot_activity'
    threat_level DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
    activity_data JSONB NOT NULL,
    response_actions JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Threat intelligence
CREATE TABLE threat_intelligence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    threat_type VARCHAR(50) NOT NULL,
    pattern_data JSONB NOT NULL,
    risk_score DECIMAL(3,2) NOT NULL,
    response_actions JSONB NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content quality metrics (Module 398)
CREATE TABLE content_quality_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES ai_generated_content(id) ON DELETE CASCADE,
    readability DECIMAL(3,2) NOT NULL,
    accuracy DECIMAL(3,2) NOT NULL,
    engagement DECIMAL(3,2) NOT NULL,
    originality DECIMAL(3,2) NOT NULL,
    relevance DECIMAL(3,2) NOT NULL,
    overall_score DECIMAL(3,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content improvements
CREATE TABLE content_improvements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES ai_generated_content(id) ON DELETE CASCADE,
    improvement_type VARCHAR(50) NOT NULL, -- 'language_simplified', 'fact_checked', 'storytelling_enhanced', 'creativity_enhanced'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content quality benchmarks
CREATE TABLE content_quality_benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(50) NOT NULL,
    target_score DECIMAL(3,2) NOT NULL,
    weight DECIMAL(3,2) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crisis events (Module 399)
CREATE TABLE crisis_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL, -- 'crisis_declared', 'crisis_escalated', 'crisis_resolved', 'investigation_started'
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crisis reports
CREATE TABLE crisis_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crisis_id VARCHAR(50) NOT NULL,
    report_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health interventions
CREATE TABLE overseer_interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intervention_type VARCHAR(50) NOT NULL, -- 'health_intervention', 'module_intervention'
    details JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform health logs
CREATE TABLE platform_health_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    overall_health DECIMAL(3,2) NOT NULL,
    security_health DECIMAL(3,2) NOT NULL,
    performance_health DECIMAL(3,2) NOT NULL,
    ux_health DECIMAL(3,2) NOT NULL,
    revenue_health DECIMAL(3,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Strategic decisions (Module 400)
CREATE TABLE strategic_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_type VARCHAR(50) NOT NULL, -- 'user_growth', 'revenue_optimization', 'performance_improvement', 'security_enhancement'
    action VARCHAR(100) NOT NULL,
    score DECIMAL(3,2),
    risk VARCHAR(20),
    cost DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'planned', -- 'planned', 'executing', 'completed', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feature roadmap
CREATE TABLE feature_roadmap (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    priority DECIMAL(3,2),
    estimated_impact DECIMAL(3,2),
    status VARCHAR(20) DEFAULT 'planned', -- 'planned', 'in_development', 'testing', 'released'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance metrics
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint VARCHAR(100),
    response_time INTEGER NOT NULL, -- milliseconds
    status_code INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System errors
CREATE TABLE system_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_type VARCHAR(50) NOT NULL,
    error_message TEXT,
    stack_trace TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API requests
CREATE TABLE api_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint VARCHAR(100) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_time INTEGER NOT NULL, -- milliseconds
    status_code INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Database queries
CREATE TABLE database_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text TEXT,
    query_time INTEGER NOT NULL, -- milliseconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User feedback
CREATE TABLE user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    feedback_category VARCHAR(50) NOT NULL,
    feedback_text TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    priority_score INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feature usage
CREATE TABLE feature_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    usage_duration INTEGER, -- seconds
    satisfaction_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Login attempts
CREATE TABLE login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment attempts
CREATE TABLE payment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'on_hold'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User activities
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blocked IPs
CREATE TABLE blocked_ips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address INET NOT NULL,
    reason VARCHAR(100) NOT NULL,
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rate limits
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    endpoint VARCHAR(100) NOT NULL,
    limit_count INTEGER NOT NULL,
    window_seconds INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced monitoring
CREATE TABLE enhanced_monitoring (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Infrastructure changes
CREATE TABLE infrastructure_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    change_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance fixes
CREATE TABLE performance_fixes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint VARCHAR(100) NOT NULL,
    issue VARCHAR(100) NOT NULL,
    fix_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Caching improvements
CREATE TABLE caching_improvements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CDN optimizations
CREATE TABLE cdn_optimizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    optimization_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pricing changes
CREATE TABLE pricing_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier VARCHAR(20) NOT NULL,
    change_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monetization plans
CREATE TABLE monetization_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_name VARCHAR(100) NOT NULL,
    strategy VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Revenue partnerships
CREATE TABLE revenue_partnerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partnership_type VARCHAR(100) NOT NULL,
    potential_revenue DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'proposed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ad optimizations
CREATE TABLE ad_optimizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    optimization_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partnerships
CREATE TABLE partnerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_type VARCHAR(100) NOT NULL,
    benefits JSONB NOT NULL,
    terms VARCHAR(100) NOT NULL,
    duration INTEGER NOT NULL, -- months
    status VARCHAR(20) DEFAULT 'proposed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketing content
CREATE TABLE marketing_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type VARCHAR(50) NOT NULL,
    content_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referral config
CREATE TABLE referral_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reward_amount DECIMAL(10,2) NOT NULL,
    requirements JSONB NOT NULL,
    expiration_days INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resource reallocations
CREATE TABLE resource_reallocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type VARCHAR(50) NOT NULL,
    usage_level INTEGER NOT NULL,
    priority VARCHAR(20) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conflict resolutions
CREATE TABLE conflict_resolutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conflict_type VARCHAR(100) NOT NULL,
    resolution_details JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health interventions
CREATE TABLE health_interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type VARCHAR(100) NOT NULL,
    health_level DECIMAL(3,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crisis protocols
CREATE TABLE crisis_protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crisis_type VARCHAR(50) NOT NULL,
    protocol_data JSONB NOT NULL,
    severity VARCHAR(20) NOT NULL,
    response_time INTEGER NOT NULL, -- seconds
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System config
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    active_backup BOOLEAN DEFAULT FALSE,
    backup_activated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Server config
CREATE TABLE server_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    failover_active BOOLEAN DEFAULT FALSE,
    failover_activated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data processing config
CREATE TABLE data_processing_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paused BOOLEAN DEFAULT FALSE,
    paused_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Backup status
CREATE TABLE backup_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restoration_in_progress BOOLEAN DEFAULT FALSE,
    restoration_started_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User notifications
CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_verification_token ON users(verification_token);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_fide_id ON user_profiles(fide_id);
CREATE INDEX idx_onboarding_progress_user_step ON onboarding_progress(user_id, step);
CREATE INDEX idx_voice_usage_user_created ON voice_usage(user_id, created_at);
CREATE INDEX idx_security_events_user_created ON security_events(user_id, created_at);
CREATE INDEX idx_rate_limits_identifier_endpoint ON rate_limits(identifier, endpoint);
CREATE INDEX idx_content_generation_user_type ON content_generation(user_id, content_type);
CREATE INDEX idx_news_articles_event_type ON news_articles(event_type);
CREATE INDEX idx_news_articles_published_at ON news_articles(published_at);
CREATE INDEX idx_ai_content_type_personality ON ai_generated_content(content_type, personality);
CREATE INDEX idx_ai_content_generated_at ON ai_generated_content(generated_at);
CREATE INDEX idx_infrastructure_logs_type_severity ON infrastructure_logs(log_type, severity);
CREATE INDEX idx_support_tickets_status_priority ON ai_support_tickets(status, priority);
CREATE INDEX idx_legal_requests_type_status ON legal_requests(request_type, status);
CREATE INDEX idx_revenue_events_type_created ON revenue_events(event_type, created_at);
CREATE INDEX idx_security_threats_type_level ON security_threats(threat_type, threat_level);
CREATE INDEX idx_content_quality_content_score ON content_quality_metrics(content_id, overall_score);
CREATE INDEX idx_crisis_events_type_created ON crisis_events(event_type, created_at);
CREATE INDEX idx_strategic_decisions_type_status ON strategic_decisions(decision_type, status);
CREATE INDEX idx_feature_roadmap_priority_status ON feature_roadmap(priority, status);
CREATE INDEX idx_performance_metrics_endpoint_time ON performance_metrics(endpoint, created_at);
CREATE INDEX idx_user_feedback_category_rating ON user_feedback(feedback_category, rating);
CREATE INDEX idx_feature_usage_feature_user ON feature_usage(feature_name, user_id);
CREATE INDEX idx_login_attempts_user_success ON login_attempts(user_id, success);
CREATE INDEX idx_payment_attempts_user_status ON payment_attempts(user_id, status);
CREATE INDEX idx_user_activities_user_type ON user_activities(user_id, action_type);
CREATE INDEX idx_blocked_ips_address ON blocked_ips(ip_address);
CREATE INDEX idx_rate_limits_user_endpoint ON rate_limits(user_id, endpoint);
CREATE INDEX idx_enhanced_monitoring_user ON enhanced_monitoring(user_id);
CREATE INDEX idx_infrastructure_changes_type_status ON infrastructure_changes(change_type, status);
CREATE INDEX idx_performance_fixes_endpoint_status ON performance_fixes(endpoint, status);
CREATE INDEX idx_caching_improvements_strategy_status ON caching_improvements(strategy, status);
CREATE INDEX idx_cdn_optimizations_type_status ON cdn_optimizations(optimization_type, status);
CREATE INDEX idx_pricing_changes_tier_status ON pricing_changes(tier, status);
CREATE INDEX idx_monetization_plans_feature_strategy ON monetization_plans(feature_name, strategy);
CREATE INDEX idx_revenue_partnerships_type_status ON revenue_partnerships(partnership_type, status);
CREATE INDEX idx_ad_optimizations_type_status ON ad_optimizations(optimization_type, status);
CREATE INDEX idx_partnerships_type_status ON partnerships(partner_type, status);
CREATE INDEX idx_marketing_content_type_status ON marketing_content(content_type, status);
CREATE INDEX idx_resource_reallocations_type_action ON resource_reallocations(resource_type, action);
CREATE INDEX idx_conflict_resolutions_type_created ON conflict_resolutions(conflict_type, created_at);
CREATE INDEX idx_health_interventions_action_created ON health_interventions(action_type, created_at);
CREATE INDEX idx_crisis_protocols_type_active ON crisis_protocols(crisis_type, active);
CREATE INDEX idx_user_notifications_user_type ON user_notifications(user_id, type); 
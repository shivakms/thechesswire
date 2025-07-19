-- AI Support System Database Schema
-- This schema supports ticket management, AI chatbot, knowledge base, and analytics

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES users(id),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    resolution_time_hours DECIMAL,
    auto_resolved BOOLEAN DEFAULT FALSE
);

-- Support Messages Table
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'ai', 'agent')),
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_internal BOOLEAN DEFAULT FALSE,
    attachments TEXT[] DEFAULT '{}',
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    ai_confidence DECIMAL DEFAULT 0,
    ai_suggestions JSONB
);

-- Support Knowledge Base Table
CREATE TABLE IF NOT EXISTS support_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    review_frequency_days INTEGER DEFAULT 90
);

-- Support Response Templates Table
CREATE TABLE IF NOT EXISTS support_response_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- AI Support Logs Table
CREATE TABLE IF NOT EXISTS ai_support_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    ai_response JSONB NOT NULL,
    analysis JSONB,
    confidence DECIMAL DEFAULT 0,
    response_time_ms INTEGER,
    session_id VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support Categories Table
CREATE TABLE IF NOT EXISTS support_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color code
    sla_hours INTEGER DEFAULT 24,
    auto_assign_to UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support Agents Table
CREATE TABLE IF NOT EXISTS support_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialization TEXT[] DEFAULT '{}',
    max_tickets INTEGER DEFAULT 10,
    is_available BOOLEAN DEFAULT TRUE,
    current_ticket_count INTEGER DEFAULT 0,
    total_tickets_resolved INTEGER DEFAULT 0,
    avg_resolution_time_hours DECIMAL DEFAULT 0,
    satisfaction_score DECIMAL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support Ticket Escalations Table
CREATE TABLE IF NOT EXISTS support_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    escalated_from UUID REFERENCES users(id),
    escalated_to UUID REFERENCES users(id),
    reason TEXT NOT NULL,
    escalation_level INTEGER DEFAULT 1,
    escalated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Support Satisfaction Surveys Table
CREATE TABLE IF NOT EXISTS support_satisfaction_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    response_time_rating INTEGER CHECK (response_time_rating >= 1 AND response_time_rating <= 5),
    resolution_rating INTEGER CHECK (resolution_rating >= 1 AND resolution_rating <= 5),
    agent_rating INTEGER CHECK (agent_rating >= 1 AND agent_rating <= 5),
    would_recommend BOOLEAN,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);

CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_sender_type ON support_messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_support_messages_timestamp ON support_messages(timestamp);

CREATE INDEX IF NOT EXISTS idx_support_knowledge_base_category ON support_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_support_knowledge_base_is_active ON support_knowledge_base(is_active);
CREATE INDEX IF NOT EXISTS idx_support_knowledge_base_keywords ON support_knowledge_base USING GIN(keywords);

CREATE INDEX IF NOT EXISTS idx_ai_support_logs_user_id ON ai_support_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_support_logs_created_at ON ai_support_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_support_logs_confidence ON ai_support_logs(confidence);

CREATE INDEX IF NOT EXISTS idx_support_agents_user_id ON support_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_support_agents_is_available ON support_agents(is_available);

-- Functions for Support Management

-- Function to create support ticket
CREATE OR REPLACE FUNCTION create_support_ticket(
    p_user_id UUID,
    p_subject VARCHAR(255),
    p_description TEXT,
    p_category VARCHAR(50),
    p_priority VARCHAR(20)
)
RETURNS UUID AS $$
DECLARE
    ticket_id UUID;
BEGIN
    INSERT INTO support_tickets (user_id, subject, description, category, priority)
    VALUES (p_user_id, p_subject, p_description, p_category, p_priority)
    RETURNING id INTO ticket_id;

    -- Auto-assign if category has default agent
    UPDATE support_tickets 
    SET assigned_to = (
        SELECT auto_assign_to 
        FROM support_categories 
        WHERE id = p_category
    )
    WHERE id = ticket_id;

    RETURN ticket_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add message to ticket
CREATE OR REPLACE FUNCTION add_ticket_message(
    p_ticket_id UUID,
    p_sender_type VARCHAR(20),
    p_content TEXT,
    p_sender_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    message_id UUID;
BEGIN
    INSERT INTO support_messages (ticket_id, sender_type, sender_id, content)
    VALUES (p_ticket_id, p_sender_type, p_sender_id, p_content)
    RETURNING id INTO message_id;

    -- Update ticket timestamp
    UPDATE support_tickets 
    SET updated_at = NOW()
    WHERE id = p_ticket_id;

    RETURN message_id;
END;
$$ LANGUAGE plpgsql;

-- Function to resolve ticket
CREATE OR REPLACE FUNCTION resolve_support_ticket(
    p_ticket_id UUID,
    p_resolution TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE support_tickets 
    SET status = 'resolved',
        resolved_at = NOW(),
        updated_at = NOW(),
        resolution_time_hours = EXTRACT(EPOCH FROM (NOW() - created_at))/3600
    WHERE id = p_ticket_id;

    -- Add resolution message
    IF p_resolution IS NOT NULL THEN
        PERFORM add_ticket_message(p_ticket_id, 'agent', p_resolution);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to escalate ticket
CREATE OR REPLACE FUNCTION escalate_ticket(
    p_ticket_id UUID,
    p_escalated_from UUID,
    p_escalated_to UUID,
    p_reason TEXT
)
RETURNS UUID AS $$
DECLARE
    escalation_id UUID;
    current_level INTEGER;
BEGIN
    -- Get current escalation level
    SELECT COALESCE(MAX(escalation_level), 0) + 1
    INTO current_level
    FROM support_escalations
    WHERE ticket_id = p_ticket_id;

    INSERT INTO support_escalations (ticket_id, escalated_from, escalated_to, reason, escalation_level)
    VALUES (p_ticket_id, p_escalated_from, p_escalated_to, p_reason, current_level)
    RETURNING id INTO escalation_id;

    -- Update ticket assignment
    UPDATE support_tickets 
    SET assigned_to = p_escalated_to,
        updated_at = NOW()
    WHERE id = p_ticket_id;

    RETURN escalation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get ticket statistics
CREATE OR REPLACE FUNCTION get_ticket_statistics(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_tickets BIGINT,
    open_tickets BIGINT,
    resolved_tickets BIGINT,
    avg_resolution_hours DECIMAL,
    urgent_tickets BIGINT,
    satisfaction_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_tickets,
        AVG(CASE WHEN resolved_at IS NOT NULL THEN resolution_time_hours END) as avg_resolution_hours,
        COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_tickets,
        AVG(satisfaction_rating) as satisfaction_score
    FROM support_tickets
    WHERE created_at > NOW() - INTERVAL '1 day' * p_days;
END;
$$ LANGUAGE plpgsql;

-- Function to update agent statistics
CREATE OR REPLACE FUNCTION update_agent_statistics(p_agent_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE support_agents 
    SET 
        current_ticket_count = (
            SELECT COUNT(*) 
            FROM support_tickets 
            WHERE assigned_to = p_agent_id AND status IN ('open', 'in_progress')
        ),
        total_tickets_resolved = (
            SELECT COUNT(*) 
            FROM support_tickets 
            WHERE assigned_to = p_agent_id AND status = 'resolved'
        ),
        avg_resolution_time_hours = (
            SELECT AVG(resolution_time_hours)
            FROM support_tickets 
            WHERE assigned_to = p_agent_id AND status = 'resolved'
        ),
        satisfaction_score = (
            SELECT AVG(satisfaction_rating)
            FROM support_tickets 
            WHERE assigned_to = p_agent_id AND satisfaction_rating IS NOT NULL
        ),
        updated_at = NOW()
    WHERE user_id = p_agent_id;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic actions

-- Trigger to update ticket updated_at
CREATE OR REPLACE FUNCTION update_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ticket_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_updated_at();

-- Trigger to update knowledge base updated_at
CREATE OR REPLACE FUNCTION update_knowledge_base_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_knowledge_base_updated_at
    BEFORE UPDATE ON support_knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION update_knowledge_base_updated_at();

-- Trigger to auto-assign tickets
CREATE OR REPLACE FUNCTION auto_assign_ticket()
RETURNS TRIGGER AS $$
DECLARE
    available_agent UUID;
BEGIN
    -- Only auto-assign if not already assigned
    IF NEW.assigned_to IS NULL THEN
        -- Find available agent with lowest current ticket count
        SELECT user_id INTO available_agent
        FROM support_agents
        WHERE is_available = TRUE 
        AND current_ticket_count < max_tickets
        ORDER BY current_ticket_count ASC
        LIMIT 1;

        IF available_agent IS NOT NULL THEN
            NEW.assigned_to = available_agent;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_assign_ticket
    BEFORE INSERT ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_ticket();

-- Initial data

-- Insert default support categories
INSERT INTO support_categories (id, name, description, icon, color, sla_hours) VALUES
('authentication', 'Authentication & Account', 'Login, password, and account issues', '🔐', '#FF5722', 4),
('gameplay', 'Gameplay & Features', 'Chess game, analysis, and training features', '♟️', '#4CAF50', 8),
('billing', 'Billing & Payments', 'Subscription, payment, and billing issues', '💳', '#2196F3', 24),
('technical', 'Technical Issues', 'Bugs, errors, and technical problems', '🐛', '#FF9800', 12),
('feature_request', 'Feature Requests', 'Suggestions and feature requests', '💡', '#9C27B0', 48),
('general', 'General Support', 'General questions and support', '❓', '#607D8B', 24)
ON CONFLICT DO NOTHING;

-- Insert default knowledge base entries
INSERT INTO support_knowledge_base (category, question, answer, keywords, tags) VALUES
('authentication', 'How do I reset my password?', 
 'To reset your password, click on "Forgot Password" on the login page. Enter your email address and follow the instructions sent to your email.',
 ARRAY['password', 'reset', 'forgot', 'login'], ARRAY['authentication', 'password']),

('gameplay', 'How do I analyze my games?', 
 'You can analyze your games by uploading a PGN file or using the built-in analysis tools. Go to the PGN Analysis section to get started.',
 ARRAY['analysis', 'game', 'pgn', 'review'], ARRAY['gameplay', 'analysis']),

('technical', 'The game is not loading properly', 
 'Try refreshing your browser or clearing your cache. If the problem persists, check your internet connection and try using a different browser.',
 ARRAY['loading', 'slow', 'error', 'browser'], ARRAY['technical', 'performance']),

('billing', 'How do I cancel my subscription?', 
 'You can cancel your subscription in your account settings under the Billing section. Your access will continue until the end of your current billing period.',
 ARRAY['cancel', 'subscription', 'billing', 'payment'], ARRAY['billing', 'subscription'])
ON CONFLICT DO NOTHING;

-- Insert default response templates
INSERT INTO support_response_templates (template_id, name, content, variables, category) VALUES
('password_reset_help', 'Password Reset Help', 
 'I can help you reset your password. Please visit the "Forgot Password" page and enter your email address. You''ll receive a reset link within a few minutes.',
 ARRAY['username'], 'authentication'),

('game_analysis_help', 'Game Analysis Help', 
 'To analyze your games, you can upload a PGN file or use our built-in analysis tools. The analysis will show you move evaluations, opening identification, and improvement suggestions.',
 ARRAY['game_type'], 'gameplay'),

('technical_issue_help', 'Technical Issue Help', 
 'I''m sorry you''re experiencing technical issues. To help you better, could you please describe what you were doing when the problem occurred and any error messages you see?',
 ARRAY['issue_type'], 'technical'),

('billing_help', 'Billing Help', 
 'I can help you with billing questions. You can manage your subscription and payment methods in your account settings under the Billing section.',
 ARRAY['billing_type'], 'billing')
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO thechesswire_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO thechesswire_user; 
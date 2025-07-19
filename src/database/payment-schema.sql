-- Payment Management Database Schema
-- This schema supports Stripe integration, subscriptions, and revenue sharing

-- Subscription Tiers Table
CREATE TABLE IF NOT EXISTS subscription_tiers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    interval VARCHAR(20) NOT NULL CHECK (interval IN ('month', 'year')),
    features JSONB NOT NULL DEFAULT '[]',
    stripe_price_id VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_users INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    tier_id VARCHAR(50) NOT NULL REFERENCES subscription_tiers(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    reactivated_at TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_method_id VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('card', 'bank_account', 'sepa_debit')),
    brand VARCHAR(20),
    last4 VARCHAR(4),
    exp_month INTEGER,
    exp_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
    subscription_id UUID REFERENCES subscriptions(id),
    amount_paid DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'usd',
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
    invoice_pdf_url TEXT,
    hosted_invoice_url TEXT,
    invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refunds Table
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_refund_id VARCHAR(255) UNIQUE NOT NULL,
    invoice_id UUID REFERENCES invoices(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'usd',
    reason VARCHAR(50),
    status VARCHAR(20) NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Titled Player Tiers Table
CREATE TABLE IF NOT EXISTS titled_player_tiers (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    revenue_share DECIMAL(5,4) NOT NULL CHECK (revenue_share >= 0 AND revenue_share <= 1),
    verification_required JSONB NOT NULL DEFAULT '[]',
    monthly_payout_minimum DECIMAL(10,2) DEFAULT 50.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Titled Players Table
CREATE TABLE IF NOT EXISTS titled_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier_id VARCHAR(50) NOT NULL REFERENCES titled_player_tiers(id),
    fide_id VARCHAR(20) UNIQUE,
    title_proof_url TEXT,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
    verification_date TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    monthly_earnings DECIMAL(10,2) DEFAULT 0.00,
    last_payout_date TIMESTAMP WITH TIME ZONE,
    payout_method VARCHAR(20) DEFAULT 'stripe' CHECK (payout_method IN ('stripe', 'bank_transfer', 'paypal')),
    stripe_connect_account_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Titled Player Revenue Table
CREATE TABLE IF NOT EXISTS titled_player_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    revenue_amount DECIMAL(10,2) NOT NULL,
    revenue_share DECIMAL(10,2) NOT NULL,
    tier_id VARCHAR(50) NOT NULL REFERENCES titled_player_tiers(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enterprise Packages Table
CREATE TABLE IF NOT EXISTS enterprise_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    package_type VARCHAR(50) NOT NULL CHECK (package_type IN ('corporate', 'healthcare', 'education', 'custom')),
    subscription_id UUID REFERENCES subscriptions(id),
    max_users INTEGER DEFAULT 1,
    custom_features JSONB DEFAULT '{}',
    contract_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    contract_end_date TIMESTAMP WITH TIME ZONE,
    monthly_fee DECIMAL(10,2) NOT NULL,
    setup_fee DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'expired')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue Analytics Table
CREATE TABLE IF NOT EXISTS revenue_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    subscription_revenue DECIMAL(10,2) DEFAULT 0.00,
    enterprise_revenue DECIMAL(10,2) DEFAULT 0.00,
    titled_player_payouts DECIMAL(10,2) DEFAULT 0.00,
    refunds DECIMAL(10,2) DEFAULT 0.00,
    net_revenue DECIMAL(10,2) DEFAULT 0.00,
    active_subscriptions INTEGER DEFAULT 0,
    new_subscriptions INTEGER DEFAULT 0,
    churned_subscriptions INTEGER DEFAULT 0,
    mrr DECIMAL(10,2) DEFAULT 0.00,
    arr DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Webhooks Table
CREATE TABLE IF NOT EXISTS payment_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(is_default);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);

CREATE INDEX IF NOT EXISTS idx_titled_players_user_id ON titled_players(user_id);
CREATE INDEX IF NOT EXISTS idx_titled_players_verification_status ON titled_players(verification_status);
CREATE INDEX IF NOT EXISTS idx_titled_players_fide_id ON titled_players(fide_id);

CREATE INDEX IF NOT EXISTS idx_titled_player_revenue_user_id ON titled_player_revenue(user_id);
CREATE INDEX IF NOT EXISTS idx_titled_player_revenue_status ON titled_player_revenue(status);
CREATE INDEX IF NOT EXISTS idx_titled_player_revenue_created_at ON titled_player_revenue(created_at);

CREATE INDEX IF NOT EXISTS idx_enterprise_packages_status ON enterprise_packages(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_packages_type ON enterprise_packages(package_type);

CREATE INDEX IF NOT EXISTS idx_revenue_analytics_date ON revenue_analytics(date);

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_processed ON payment_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_event_type ON payment_webhooks(event_type);

-- Functions for Payment Management

-- Function to create subscription
CREATE OR REPLACE FUNCTION create_subscription(
    p_user_id UUID,
    p_stripe_subscription_id VARCHAR(255),
    p_tier_id VARCHAR(50),
    p_status VARCHAR(20),
    p_period_start TIMESTAMP WITH TIME ZONE,
    p_period_end TIMESTAMP WITH TIME ZONE
)
RETURNS UUID AS $$
DECLARE
    subscription_id UUID;
BEGIN
    INSERT INTO subscriptions (
        user_id, stripe_subscription_id, tier_id, status, 
        current_period_start, current_period_end
    )
    VALUES (
        p_user_id, p_stripe_subscription_id, p_tier_id, p_status,
        p_period_start, p_period_end
    )
    RETURNING id INTO subscription_id;

    -- Update user subscription status
    UPDATE users 
    SET subscription_tier = p_tier_id, 
        subscription_status = p_status,
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN subscription_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update subscription status
CREATE OR REPLACE FUNCTION update_subscription_status(
    p_stripe_subscription_id VARCHAR(255),
    p_status VARCHAR(20),
    p_period_start TIMESTAMP WITH TIME ZONE,
    p_period_end TIMESTAMP WITH TIME ZONE
)
RETURNS VOID AS $$
DECLARE
    user_id UUID;
    tier_id VARCHAR(50);
BEGIN
    UPDATE subscriptions 
    SET status = p_status,
        current_period_start = p_period_start,
        current_period_end = p_period_end,
        updated_at = NOW()
    WHERE stripe_subscription_id = p_stripe_subscription_id
    RETURNING user_id, tier_id INTO user_id, tier_id;

    -- Update user subscription status
    IF user_id IS NOT NULL THEN
        UPDATE users 
        SET subscription_status = p_status,
            updated_at = NOW()
        WHERE id = user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate titled player earnings
CREATE OR REPLACE FUNCTION calculate_titled_player_earnings(
    p_user_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS DECIMAL AS $$
DECLARE
    total_earnings DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(revenue_share), 0)
    INTO total_earnings
    FROM titled_player_revenue
    WHERE user_id = p_user_id
    AND status = 'pending'
    AND (p_start_date IS NULL OR DATE(created_at) >= p_start_date)
    AND (p_end_date IS NULL OR DATE(created_at) <= p_end_date);

    RETURN total_earnings;
END;
$$ LANGUAGE plpgsql;

-- Function to process titled player payout
CREATE OR REPLACE FUNCTION process_titled_player_payout(
    p_user_id UUID,
    p_amount DECIMAL(10,2)
)
RETURNS BOOLEAN AS $$
DECLARE
    player_record RECORD;
    minimum_payout DECIMAL(10,2);
BEGIN
    -- Get titled player record
    SELECT tp.*, tpt.monthly_payout_minimum
    INTO player_record
    FROM titled_players tp
    JOIN titled_player_tiers tpt ON tp.tier_id = tpt.id
    WHERE tp.user_id = p_user_id AND tp.is_active = TRUE;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    minimum_payout := player_record.monthly_payout_minimum;

    -- Check if payout meets minimum
    IF p_amount < minimum_payout THEN
        RETURN FALSE;
    END IF;

    -- Update revenue records to paid
    UPDATE titled_player_revenue
    SET status = 'paid',
        paid_at = NOW()
    WHERE user_id = p_user_id 
    AND status = 'pending'
    AND revenue_share <= p_amount;

    -- Update titled player record
    UPDATE titled_players
    SET total_earnings = total_earnings + p_amount,
        monthly_earnings = 0.00,
        last_payout_date = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to update revenue analytics
CREATE OR REPLACE FUNCTION update_revenue_analytics(p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO revenue_analytics (
        date,
        subscription_revenue,
        enterprise_revenue,
        titled_player_payouts,
        refunds,
        net_revenue,
        active_subscriptions,
        new_subscriptions,
        churned_subscriptions,
        mrr,
        arr
    )
    SELECT 
        p_date,
        COALESCE(SUM(i.amount_paid), 0) as subscription_revenue,
        COALESCE(SUM(ep.monthly_fee), 0) as enterprise_revenue,
        COALESCE(SUM(tpr.revenue_share), 0) as titled_player_payouts,
        COALESCE(SUM(r.amount), 0) as refunds,
        COALESCE(SUM(i.amount_paid), 0) + COALESCE(SUM(ep.monthly_fee), 0) - COALESCE(SUM(tpr.revenue_share), 0) - COALESCE(SUM(r.amount), 0) as net_revenue,
        COUNT(DISTINCT s.user_id) as active_subscriptions,
        COUNT(DISTINCT CASE WHEN DATE(s.created_at) = p_date THEN s.user_id END) as new_subscriptions,
        COUNT(DISTINCT CASE WHEN DATE(s.canceled_at) = p_date THEN s.user_id END) as churned_subscriptions,
        COALESCE(SUM(st.price), 0) as mrr,
        COALESCE(SUM(st.price * 12), 0) as arr
    FROM subscriptions s
    JOIN subscription_tiers st ON s.tier_id = st.id
    LEFT JOIN invoices i ON s.user_id = i.user_id AND DATE(i.invoice_date) = p_date
    LEFT JOIN enterprise_packages ep ON DATE(ep.created_at) = p_date
    LEFT JOIN titled_player_revenue tpr ON DATE(tpr.created_at) = p_date AND tpr.status = 'paid'
    LEFT JOIN refunds r ON DATE(r.created_at) = p_date
    WHERE s.status = 'active'
    ON CONFLICT (date) DO UPDATE SET
        subscription_revenue = EXCLUDED.subscription_revenue,
        enterprise_revenue = EXCLUDED.enterprise_revenue,
        titled_player_payouts = EXCLUDED.titled_player_payouts,
        refunds = EXCLUDED.refunds,
        net_revenue = EXCLUDED.net_revenue,
        active_subscriptions = EXCLUDED.active_subscriptions,
        new_subscriptions = EXCLUDED.new_subscriptions,
        churned_subscriptions = EXCLUDED.churned_subscriptions,
        mrr = EXCLUDED.mrr,
        arr = EXCLUDED.arr;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic actions

-- Trigger to update subscription updated_at
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscription_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_updated_at();

-- Trigger to update titled players updated_at
CREATE OR REPLACE FUNCTION update_titled_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_titled_players_updated_at
    BEFORE UPDATE ON titled_players
    FOR EACH ROW
    EXECUTE FUNCTION update_titled_players_updated_at();

-- Initial data

-- Insert default subscription tiers
INSERT INTO subscription_tiers (id, name, description, price, interval, features, stripe_price_id) VALUES
('premium-monthly', 'Premium Monthly', 'Full access to all premium features', 25.00, 'month', 
 '["Unlimited SoulCinema renders", "All Bambai AI voice modes", "Advanced EchoSage features", "Priority support", "Export capabilities", "Custom voice styles", "Offline mode", "Advanced analytics"]',
 'price_premium_monthly'),

('premium-yearly', 'Premium Yearly', 'Full access with 2 months free', 250.00, 'year',
 '["All monthly features", "2 months free", "Early access to new features", "Exclusive content"]',
 'price_premium_yearly'),

('enterprise-corporate', 'Enterprise Corporate', 'Custom branded experiences for teams', 999.00, 'month',
 '["Custom branded experiences", "Team building modules", "Bambai AI corporate trainer", "Analytics dashboard for HR", "White-label AI journalist", "API access", "Custom AI training", "Bulk content generation", "Dedicated AI reporter"]',
 'price_enterprise_corporate'),

('enterprise-healthcare', 'Enterprise Healthcare', 'Medical-grade chess therapy platform', 499.00, 'month',
 '["Medical-grade interventions", "Clinical trial support", "Patient progress tracking", "HIPAA-compliant infrastructure", "Therapist dashboard", "Research collaboration tools"]',
 'price_enterprise_healthcare')
ON CONFLICT DO NOTHING;

-- Insert titled player tiers
INSERT INTO titled_player_tiers (id, title, description, revenue_share, verification_required, monthly_payout_minimum) VALUES
('retired-gm', 'Retired GM/WGM/IM/WIM', 'Retired grandmasters and international masters', 0.15, 
 '["fide_id", "retirement_proof", "video_call"]', 50.00),

('active-gm', 'Active GM/WGM/IM/WIM', 'Active grandmasters and international masters', 0.10,
 '["fide_id", "active_status", "video_call"]', 50.00),

('other-titled', 'Other Titled Players', 'FM/WFM/CM/WCM/NM and other titled players', 0.06,
 '["fide_id", "title_proof", "video_call"]', 50.00)
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO thechesswire_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO thechesswire_user; 
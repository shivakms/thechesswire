-- Health Checks Table
CREATE TABLE IF NOT EXISTS health_checks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
    response_time INTEGER NOT NULL, -- in milliseconds
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Error Logs Table
CREATE TABLE IF NOT EXISTS error_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    level VARCHAR(10) NOT NULL CHECK (level IN ('error', 'warn', 'info', 'debug')),
    message TEXT NOT NULL,
    stack TEXT,
    context JSONB,
    user_id VARCHAR(50),
    session_id VARCHAR(100),
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    metric VARCHAR(100) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    tags JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Alerts Table
CREATE TABLE IF NOT EXISTS system_alerts (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    assigned_to VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Uptime Monitoring Table
CREATE TABLE IF NOT EXISTS uptime_monitoring (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    check_time TIMESTAMP WITH TIME ZONE NOT NULL,
    response_time INTEGER, -- in milliseconds
    status_code INTEGER,
    is_up BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Events Table (for monitoring)
CREATE TABLE IF NOT EXISTS security_events (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    severity VARCHAR(20) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_checks_name_created ON health_checks(name, created_at);
CREATE INDEX IF NOT EXISTS idx_health_checks_status ON health_checks(status);
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_level ON error_logs(level);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric ON performance_metrics(metric);
CREATE INDEX IF NOT EXISTS idx_system_alerts_timestamp ON system_alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON system_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_uptime_monitoring_service_time ON uptime_monitoring(service_name, check_time);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);

-- Cleanup functions
CREATE OR REPLACE FUNCTION cleanup_old_monitoring_data()
RETURNS void AS $$
BEGIN
    -- Keep health checks for 7 days
    DELETE FROM health_checks WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Keep error logs for 30 days
    DELETE FROM error_logs WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Keep performance metrics for 90 days
    DELETE FROM performance_metrics WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Keep resolved alerts for 30 days
    DELETE FROM system_alerts WHERE resolved = TRUE AND created_at < NOW() - INTERVAL '30 days';
    
    -- Keep uptime monitoring for 30 days
    DELETE FROM uptime_monitoring WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Keep security events for 1 year
    DELETE FROM security_events WHERE timestamp < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Function to get system health summary
CREATE OR REPLACE FUNCTION get_system_health_summary()
RETURNS TABLE(
    total_checks INTEGER,
    healthy_checks INTEGER,
    degraded_checks INTEGER,
    unhealthy_checks INTEGER,
    avg_response_time DECIMAL(10,2),
    last_check_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_checks,
        COUNT(CASE WHEN status = 'healthy' THEN 1 END) as healthy_checks,
        COUNT(CASE WHEN status = 'degraded' THEN 1 END) as degraded_checks,
        COUNT(CASE WHEN status = 'unhealthy' THEN 1 END) as unhealthy_checks,
        AVG(response_time) as avg_response_time,
        MAX(created_at) as last_check_time
    FROM health_checks
    WHERE created_at > NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Function to get error rate
CREATE OR REPLACE FUNCTION get_error_rate(hours_back INTEGER DEFAULT 1)
RETURNS TABLE(
    error_count INTEGER,
    total_requests INTEGER,
    error_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(CASE WHEN level = 'error' THEN 1 END) as error_count,
        COUNT(*) as total_requests,
        ROUND(
            (COUNT(CASE WHEN level = 'error' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 
            2
        ) as error_rate
    FROM error_logs
    WHERE timestamp > NOW() - (hours_back || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Function to get performance metrics summary
CREATE OR REPLACE FUNCTION get_performance_summary(metric_name VARCHAR, hours_back INTEGER DEFAULT 1)
RETURNS TABLE(
    avg_value DECIMAL(10,2),
    max_value DECIMAL(10,2),
    min_value DECIMAL(10,2),
    count_measurements INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        AVG(value) as avg_value,
        MAX(value) as max_value,
        MIN(value) as min_value,
        COUNT(*) as count_measurements
    FROM performance_metrics
    WHERE metric = metric_name 
    AND timestamp > NOW() - (hours_back || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Function to get active alerts
CREATE OR REPLACE FUNCTION get_active_alerts()
RETURNS TABLE(
    id VARCHAR(50),
    severity VARCHAR(20),
    title VARCHAR(200),
    message TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE,
    age_minutes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sa.id,
        sa.severity,
        sa.title,
        sa.message,
        sa.category,
        sa.created_at,
        EXTRACT(EPOCH FROM (NOW() - sa.created_at)) / 60 as age_minutes
    FROM system_alerts sa
    WHERE sa.resolved = FALSE
    ORDER BY sa.severity DESC, sa.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get uptime statistics
CREATE OR REPLACE FUNCTION get_uptime_stats(service_name VARCHAR, days_back INTEGER DEFAULT 7)
RETURNS TABLE(
    total_checks INTEGER,
    successful_checks INTEGER,
    failed_checks INTEGER,
    uptime_percentage DECIMAL(5,2),
    avg_response_time DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_checks,
        COUNT(CASE WHEN is_up = TRUE THEN 1 END) as successful_checks,
        COUNT(CASE WHEN is_up = FALSE THEN 1 END) as failed_checks,
        ROUND(
            (COUNT(CASE WHEN is_up = TRUE THEN 1 END)::DECIMAL / COUNT(*)) * 100, 
            2
        ) as uptime_percentage,
        AVG(response_time) as avg_response_time
    FROM uptime_monitoring
    WHERE service_name = $1 
    AND check_time > NOW() - (days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create alerts for critical errors
CREATE OR REPLACE FUNCTION trigger_critical_error_alert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.level = 'error' THEN
        INSERT INTO system_alerts (id, timestamp, severity, title, message, category)
        VALUES (
            'alert_' || NEW.id,
            NEW.timestamp,
            'high',
            'Critical Error Detected',
            NEW.message,
            'error_log'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER critical_error_alert_trigger
    AFTER INSERT ON error_logs
    FOR EACH ROW
    EXECUTE FUNCTION trigger_critical_error_alert();

-- Scheduled cleanup job (run daily)
-- This would be set up with a cron job or similar scheduler
-- SELECT cleanup_old_monitoring_data();

-- Insert initial monitoring configuration
INSERT INTO system_alerts (id, timestamp, severity, title, message, category, resolved)
VALUES (
    'monitoring_started',
    NOW(),
    'low',
    'Monitoring System Started',
    'Infrastructure monitoring has been initialized',
    'system',
    TRUE
) ON CONFLICT DO NOTHING; 
const Redis = require('ioredis');
const { logSecurityEvent } = require('./database');

let redisClient;

const initializeSecurityService = async () => {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });

    console.log('✅ Security service initialized');
  } catch (error) {
    console.error('❌ Security service initialization failed:', error);
    throw error;
  }
};

// Rate limiting
const checkRateLimit = async (identifier, endpoint) => {
  const key = `rate_limit:${identifier}:${endpoint}`;
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

  try {
    const current = await redisClient.get(key);
    const requests = current ? parseInt(current) : 0;

    if (requests >= maxRequests) {
      return {
        allowed: false,
        limit: maxRequests,
        remaining: 0,
        retryAfter: windowMs
      };
    }

    // Increment request count
    await redisClient.multi()
      .incr(key)
      .expire(key, Math.ceil(windowMs / 1000))
      .exec();

    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - requests - 1
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Allow request if rate limiting fails
    return { allowed: true, limit: maxRequests, remaining: maxRequests };
  }
};

// IP blocking
const isBlockedIP = async (ip) => {
  try {
    const blocked = await redisClient.get(`blocked_ip:${ip}`);
    return !!blocked;
  } catch (error) {
    console.error('IP block check failed:', error);
    return false;
  }
};

const blockIP = async (ip, reason, duration = 3600) => {
  try {
    await redisClient.setex(`blocked_ip:${ip}`, duration, JSON.stringify({
      reason,
      blockedAt: new Date().toISOString()
    }));

    await logSecurityEvent({
      eventType: 'ip_blocked',
      ipAddress: ip,
      details: { reason, duration }
    });
  } catch (error) {
    console.error('IP blocking failed:', error);
  }
};

// Security event logging
const logSecurityEvent = async (eventData) => {
  try {
    const {
      userId = null,
      eventType,
      ipAddress,
      userAgent,
      countryCode,
      details = {}
    } = eventData;

    const event = {
      id: require('uuid').v4(),
      userId,
      eventType,
      ipAddress,
      userAgent,
      countryCode,
      details,
      timestamp: new Date().toISOString()
    };

    // Store in Redis for real-time monitoring
    await redisClient.lpush('security_events', JSON.stringify(event));
    await redisClient.ltrim('security_events', 0, 9999); // Keep last 10k events

    // Store in database for long-term analysis
    const client = await require('./database').pool.connect();
    try {
      await client.query(`
        INSERT INTO security_events (user_id, event_type, ip_address, user_agent, country_code, details)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [userId, eventType, ipAddress, userAgent, countryCode, JSON.stringify(details)]);
    } finally {
      client.release();
    }

    // Check for suspicious patterns
    await checkSuspiciousPatterns(event);

  } catch (error) {
    console.error('Security event logging failed:', error);
  }
};

// Suspicious pattern detection
const checkSuspiciousPatterns = async (event) => {
  try {
    const { ipAddress, eventType, userId } = event;

    // Check for rapid failed logins
    if (eventType === 'failed_login') {
      const failedLogins = await redisClient.get(`failed_logins:${ipAddress}`);
      const count = failedLogins ? parseInt(failedLogins) : 0;
      
      if (count >= 10) {
        await blockIP(ipAddress, 'Multiple failed login attempts', 1800); // 30 minutes
      } else {
        await redisClient.incr(`failed_logins:${ipAddress}`);
        await redisClient.expire(`failed_logins:${ipAddress}`, 900); // 15 minutes
      }
    }

    // Check for rapid requests
    const requestCount = await redisClient.get(`requests:${ipAddress}`);
    const count = requestCount ? parseInt(requestCount) : 0;
    
    if (count > 1000) { // More than 1000 requests in 15 minutes
      await blockIP(ipAddress, 'Excessive request rate', 3600); // 1 hour
    } else {
      await redisClient.incr(`requests:${ipAddress}`);
      await redisClient.expire(`requests:${ipAddress}`, 900); // 15 minutes
    }

  } catch (error) {
    console.error('Suspicious pattern check failed:', error);
  }
};

// Threat intelligence
const getThreatIntelligence = async () => {
  try {
    const events = await redisClient.lrange('security_events', 0, 99);
    const parsedEvents = events.map(event => JSON.parse(event));

    const threats = {
      totalEvents: parsedEvents.length,
      blockedIPs: 0,
      failedLogins: 0,
      suspiciousActivity: 0,
      recentThreats: []
    };

    parsedEvents.forEach(event => {
      if (event.eventType === 'ip_blocked') threats.blockedIPs++;
      if (event.eventType === 'failed_login') threats.failedLogins++;
      if (event.eventType.includes('suspicious')) threats.suspiciousActivity++;
      
      if (new Date(event.timestamp) > new Date(Date.now() - 3600000)) { // Last hour
        threats.recentThreats.push(event);
      }
    });

    return threats;
  } catch (error) {
    console.error('Threat intelligence failed:', error);
    return null;
  }
};

// DDoS protection
const checkDDoS = async (ip) => {
  try {
    const requestRate = await redisClient.get(`ddos:${ip}`);
    const rate = requestRate ? parseInt(requestRate) : 0;
    
    if (rate > 500) { // More than 500 requests per minute
      await blockIP(ip, 'DDoS attack detected', 7200); // 2 hours
      return true;
    }
    
    await redisClient.incr(`ddos:${ip}`);
    await redisClient.expire(`ddos:${ip}`, 60); // 1 minute
    
    return false;
  } catch (error) {
    console.error('DDoS check failed:', error);
    return false;
  }
};

// WAF rules
const checkWAFRules = async (req) => {
  const { url, method, headers, body } = req;
  
  // SQL Injection detection
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
    /(\b(or|and)\b\s+\d+\s*=\s*\d+)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter)\b.*\b(union|select|insert|update|delete|drop|create|alter)\b)/i
  ];

  const requestString = JSON.stringify({ url, method, headers, body });
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(requestString)) {
      await logSecurityEvent({
        eventType: 'waf_sql_injection',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { pattern: pattern.source, request: requestString }
      });
      return false;
    }
  }

  // XSS detection
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(requestString)) {
      await logSecurityEvent({
        eventType: 'waf_xss',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { pattern: pattern.source, request: requestString }
      });
      return false;
    }
  }

  return true;
};

// Security monitoring
const getSecurityMetrics = async () => {
  try {
    const metrics = {
      activeBlocks: 0,
      totalEvents: 0,
      threatLevel: 'low',
      recentIncidents: []
    };

    // Get active IP blocks
    const blockedKeys = await redisClient.keys('blocked_ip:*');
    metrics.activeBlocks = blockedKeys.length;

    // Get total security events
    const eventCount = await redisClient.llen('security_events');
    metrics.totalEvents = eventCount;

    // Calculate threat level
    if (metrics.activeBlocks > 100 || eventCount > 10000) {
      metrics.threatLevel = 'high';
    } else if (metrics.activeBlocks > 50 || eventCount > 5000) {
      metrics.threatLevel = 'medium';
    }

    // Get recent incidents
    const recentEvents = await redisClient.lrange('security_events', 0, 9);
    metrics.recentIncidents = recentEvents.map(event => JSON.parse(event));

    return metrics;
  } catch (error) {
    console.error('Security metrics failed:', error);
    return null;
  }
};

module.exports = {
  initializeSecurityService,
  checkRateLimit,
  isBlockedIP,
  blockIP,
  logSecurityEvent,
  checkSuspiciousPatterns,
  getThreatIntelligence,
  checkDDoS,
  checkWAFRules,
  getSecurityMetrics
}; 
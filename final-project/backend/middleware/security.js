const geoip = require('geoip-lite');
const UserAgent = require('user-agents');
const { logSecurityEvent, checkRateLimit, isBlockedIP } = require('../services/security');

const securityCheck = async (req, res, next) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const country = geoip.lookup(clientIP)?.country;

    // Check if IP is blocked
    if (await isBlockedIP(clientIP)) {
      await logSecurityEvent({
        eventType: 'blocked_request',
        ipAddress: clientIP,
        userAgent,
        countryCode: country,
        details: { endpoint: req.originalUrl, reason: 'IP blocked' }
      });

      return res.status(403).json({
        error: 'Access Denied',
        message: 'Your IP address has been blocked due to suspicious activity'
      });
    }

    // Check for suspicious user agents
    const ua = new UserAgent(userAgent);
    if (ua.isBot || ua.isHeadless) {
      await logSecurityEvent({
        eventType: 'bot_detected',
        ipAddress: clientIP,
        userAgent,
        countryCode: country,
        details: { 
          endpoint: req.originalUrl,
          isBot: ua.isBot,
          isHeadless: ua.isHeadless
        }
      });

      return res.status(403).json({
        error: 'Access Denied',
        message: 'Bot access is not allowed'
      });
    }

    // Check for TOR/VPN
    const isTOR = await checkTORExitNode(clientIP);
    if (isTOR) {
      await logSecurityEvent({
        eventType: 'tor_detected',
        ipAddress: clientIP,
        userAgent,
        countryCode: country,
        details: { endpoint: req.originalUrl }
      });

      return res.status(403).json({
        error: 'Access Denied',
        message: 'TOR exit nodes are not allowed for security reasons'
      });
    }

    // Check for sanctioned countries
    const sanctionedCountries = ['IR', 'KP', 'CU', 'SY', 'VE'];
    if (sanctionedCountries.includes(country)) {
      await logSecurityEvent({
        eventType: 'sanctioned_country',
        ipAddress: clientIP,
        userAgent,
        countryCode: country,
        details: { endpoint: req.originalUrl }
      });

      return res.status(403).json({
        error: 'Access Denied',
        message: 'Access from your region is not available'
      });
    }

    // Rate limiting check
    const rateLimitResult = await checkRateLimit(clientIP, req.originalUrl);
    if (!rateLimitResult.allowed) {
      await logSecurityEvent({
        eventType: 'rate_limit_exceeded',
        ipAddress: clientIP,
        userAgent,
        countryCode: country,
        details: { 
          endpoint: req.originalUrl,
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining
        }
      });

      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: 'Too many requests from this IP',
        retryAfter: rateLimitResult.retryAfter
      });
    }

    // Add security headers
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    });

    // Add request metadata for logging
    req.securityMetadata = {
      ip: clientIP,
      country,
      userAgent,
      timestamp: new Date().toISOString()
    };

    next();
  } catch (error) {
    console.error('Security check failed:', error);
    // Continue with request even if security check fails
    next();
  }
};

const checkTORExitNode = async (ip) => {
  try {
    // In production, use a TOR exit node list or API
    // For now, return false (no TOR detection)
    return false;
  } catch (error) {
    console.error('TOR check failed:', error);
    return false;
  }
};

const validateInput = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          message: error.details[0].message
        });
      }
      next();
    } catch (error) {
      console.error('Input validation failed:', error);
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data'
      });
    }
  };
};

const sanitizeInput = (req, res, next) => {
  // Basic input sanitization
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove potential XSS vectors
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });
  }

  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });
  }

  next();
};

module.exports = {
  securityCheck,
  validateInput,
  sanitizeInput
}; 
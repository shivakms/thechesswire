import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { createClient } from 'redis';
import { Pool } from 'pg';

// Security configuration
const SECURITY_CONFIG = {
  TOR_EXIT_NODES_URL: 'https://check.torproject.org/exit-addresses',
  IPQUALITYSCORE_API_KEY: process.env.IPQUALITYSCORE_API_KEY,
  CLOUDFLARE_API_KEY: process.env.CLOUDFLARE_API_KEY,
  MAX_REQUESTS_PER_HOUR: 100,
  SUSPICIOUS_PATTERNS: [
    'sql_injection',
    'xss_attack',
    'path_traversal',
    'command_injection',
    'file_upload_attack'
  ],
  BLOCKED_COUNTRIES: [
    'KP', // North Korea
    'IR', // Iran
    'CU', // Cuba
    'SY', // Syria
    'VE'  // Venezuela
  ]
};

// Rate limiters
const loginLimiter = new RateLimiterMemory({
  points: 5, // 5 attempts
  duration: 15 * 60, // 15 minutes
});

const registerLimiter = new RateLimiterMemory({
  points: 3, // 3 attempts
  duration: 60 * 60, // 1 hour
});

const apiLimiter = new RateLimiterMemory({
  points: 100, // 100 requests
  duration: 60, // 1 minute
});

// Get client IP from request
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to connection remote address
  return 'unknown';
}

// Redis client for caching
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface SecurityEvent {
  id: string;
  ip: string;
  userAgent: string;
  eventType: 'blocked' | 'suspicious' | 'attack' | 'rate_limited';
  details: any;
  timestamp: Date;
  country?: string;
  isTor?: boolean;
  isVpn?: boolean;
  riskScore: number;
}

class AdvancedSecuritySystem {
  private torExitNodes: Set<string> = new Set();
  private threatIntelligence: Map<string, number> = new Map();

  constructor() {
    this.initializeSecurity();
  }

  private async initializeSecurity() {
    await this.loadTorExitNodes();
    await this.loadThreatIntelligence();
    this.startPeriodicUpdates();
  }

  private async loadTorExitNodes() {
    try {
      const response = await fetch(SECURITY_CONFIG.TOR_EXIT_NODES_URL);
      const text = await response.text();
      const lines = text.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('ExitAddress')) {
          const ip = line.split(' ')[1];
          this.torExitNodes.add(ip);
        }
      }
      
      console.log(`Loaded ${this.torExitNodes.size} TOR exit nodes`);
    } catch (error) {
      console.error('Failed to load TOR exit nodes:', error);
    }
  }

  private async loadThreatIntelligence() {
    try {
      // Load from database
      const result = await pool.query(
        'SELECT ip_address, risk_score FROM threat_intelligence WHERE updated_at > NOW() - INTERVAL \'24 hours\''
      );
      
      for (const row of result.rows) {
        this.threatIntelligence.set(row.ip_address, row.risk_score);
      }
    } catch (error) {
      console.error('Failed to load threat intelligence:', error);
    }
  }

  private startPeriodicUpdates() {
    // Update TOR exit nodes every 6 hours
    setInterval(() => this.loadTorExitNodes(), 6 * 60 * 60 * 1000);
    
    // Update threat intelligence every hour
    setInterval(() => this.loadThreatIntelligence(), 60 * 60 * 1000);
  }

  async checkRequest(req: NextRequest): Promise<{ allowed: boolean; reason?: string; riskScore: number }> {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || '';
    const country = req.headers.get('cf-ipcountry') || req.headers.get('x-country') || 'unknown';

    let riskScore = 0;
    const securityEvent: Partial<SecurityEvent> = {
      ip,
      userAgent,
      timestamp: new Date(),
      country,
      riskScore: 0
    };

    // 1. Check rate limiting
    try {
      await rateLimiters.ip.consume(ip);
    } catch (error) {
      await this.logSecurityEvent({
        ...securityEvent,
        eventType: 'rate_limited',
        details: { error: 'Rate limit exceeded' },
        riskScore: 50
      } as SecurityEvent);
      return { allowed: false, reason: 'Rate limit exceeded', riskScore: 50 };
    }

    // 2. Check geographic blocking
    if (SECURITY_CONFIG.BLOCKED_COUNTRIES.includes(country)) {
      await this.logSecurityEvent({
        ...securityEvent,
        eventType: 'blocked',
        details: { country, reason: 'Geographic restriction' },
        riskScore: 100
      } as SecurityEvent);
      return { allowed: false, reason: 'Geographic restriction', riskScore: 100 };
    }

    // 3. Check TOR exit nodes
    if (this.torExitNodes.has(ip)) {
      riskScore += 30;
      securityEvent.isTor = true;
    }

    // 4. Check VPN/Proxy using IPQualityScore
    const vpnCheck = await this.checkVpnProxy(ip);
    if (vpnCheck.isVpn || vpnCheck.isProxy) {
      riskScore += 20;
      securityEvent.isVpn = true;
    }

    // 5. Bot detection
    const botScore = this.detectBot(userAgent, req);
    riskScore += botScore;

    // 6. Suspicious pattern detection
    const patternScore = this.detectSuspiciousPatterns(req);
    riskScore += patternScore;

    // 7. Check threat intelligence
    const threatScore = this.threatIntelligence.get(ip) || 0;
    riskScore += threatScore;

    // 8. Behavioral analysis
    const behaviorScore = await this.analyzeBehavior(ip, req);
    riskScore += behaviorScore;

    securityEvent.riskScore = riskScore;

    // Block if risk score is too high
    if (riskScore >= 80) {
      securityEvent.eventType = 'blocked';
      securityEvent.details = { riskScore, reason: 'High risk score' };
      await this.logSecurityEvent(securityEvent as SecurityEvent);
      return { allowed: false, reason: 'High security risk', riskScore };
    }

    // Log suspicious activity
    if (riskScore >= 30) {
      securityEvent.eventType = 'suspicious';
      securityEvent.details = { riskScore };
      await this.logSecurityEvent(securityEvent as SecurityEvent);
    }

    return { allowed: true, riskScore };
  }

  private async checkVpnProxy(ip: string): Promise<{ isVpn: boolean; isProxy: boolean }> {
    if (!SECURITY_CONFIG.IPQUALITYSCORE_API_KEY) {
      return { isVpn: false, isProxy: false };
    }

    try {
      const response = await fetch(
        `https://ipqualityscore.com/api/json/ip/${SECURITY_CONFIG.IPQUALITYSCORE_API_KEY}/${ip}`
      );
      const data = await response.json();

      return {
        isVpn: data.vpn || false,
        isProxy: data.proxy || false
      };
    } catch (error) {
      console.error('VPN/Proxy check failed:', error);
      return { isVpn: false, isProxy: false };
    }
  }

  private detectBot(userAgent: string, req: NextRequest): number {
    let score = 0;

    // Check for common bot user agents
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i,
      /python/i, /java/i, /perl/i, /ruby/i, /php/i
    ];

    for (const pattern of botPatterns) {
      if (pattern.test(userAgent)) {
        score += 15;
      }
    }

    // Check for missing or suspicious headers
    const requiredHeaders = ['accept', 'accept-language', 'accept-encoding'];
    for (const header of requiredHeaders) {
      if (!req.headers.get(header)) {
        score += 10;
      }
    }

    // Check for suspicious request patterns
    const url = req.url;
    if (url.includes('admin') || url.includes('wp-admin') || url.includes('phpmyadmin')) {
      score += 20;
    }

    return score;
  }

  private detectSuspiciousPatterns(req: NextRequest): number {
    let score = 0;
    const url = req.url.toLowerCase();
    const body = req.body ? JSON.stringify(req.body) : '';

    // SQL Injection patterns
    const sqlPatterns = [
      /union\s+select/i, /drop\s+table/i, /insert\s+into/i, /delete\s+from/i,
      /update\s+set/i, /alter\s+table/i, /exec\s*\(/i, /eval\s*\(/i
    ];

    // XSS patterns
    const xssPatterns = [
      /<script/i, /javascript:/i, /onload=/i, /onerror=/i, /onclick=/i,
      /alert\s*\(/i, /confirm\s*\(/i, /prompt\s*\(/i
    ];

    // Path traversal patterns
    const pathPatterns = [
      /\.\.\//, /\.\.\\/, /%2e%2e/, /%2e%2e%2f/, /%2e%2e%5c/
    ];

    const allPatterns = [...sqlPatterns, ...xssPatterns, ...pathPatterns];
    
    for (const pattern of allPatterns) {
      if (pattern.test(url) || pattern.test(body)) {
        score += 50;
      }
    }

    return score;
  }

  private async analyzeBehavior(ip: string, req: NextRequest): Promise<number> {
    let score = 0;

    try {
      // Check recent activity patterns
      const result = await pool.query(
        `SELECT COUNT(*) as request_count, 
                COUNT(DISTINCT user_agent) as unique_agents,
                COUNT(DISTINCT path) as unique_paths
         FROM security_events 
         WHERE ip = $1 AND timestamp > NOW() - INTERVAL '1 hour'`,
        [ip]
      );

      const { request_count, unique_agents, unique_paths } = result.rows[0];

      // High request count with same user agent
      if (request_count > 200 && unique_agents <= 2) {
        score += 30;
      }

      // Many different paths in short time (potential scanning)
      if (unique_paths > 50) {
        score += 25;
      }

      // Multiple user agents from same IP (potential bot)
      if (unique_agents > 10) {
        score += 20;
      }

    } catch (error) {
      console.error('Behavior analysis failed:', error);
    }

    return score;
  }

  private async logSecurityEvent(event: SecurityEvent) {
    try {
      await pool.query(
        `INSERT INTO security_events 
         (id, ip, user_agent, event_type, details, timestamp, country, is_tor, is_vpn, risk_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          event.id,
          event.ip,
          event.userAgent,
          event.eventType,
          JSON.stringify(event.details),
          event.timestamp,
          event.country,
          event.isTor,
          event.isVpn,
          event.riskScore
        ]
      );

      // Update threat intelligence
      if (event.riskScore > 30) {
        await pool.query(
          `INSERT INTO threat_intelligence (ip_address, risk_score, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (ip_address) 
           DO UPDATE SET risk_score = GREATEST(threat_intelligence.risk_score, $2), updated_at = NOW()`,
          [event.ip, event.riskScore]
        );
      }

    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  async getSecurityMetrics(): Promise<any> {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_events,
          COUNT(CASE WHEN event_type = 'blocked' THEN 1 END) as blocked_requests,
          COUNT(CASE WHEN event_type = 'suspicious' THEN 1 END) as suspicious_events,
          COUNT(CASE WHEN event_type = 'attack' THEN 1 END) as attack_attempts,
          AVG(risk_score) as avg_risk_score,
          COUNT(CASE WHEN is_tor = true THEN 1 END) as tor_requests,
          COUNT(CASE WHEN is_vpn = true THEN 1 END) as vpn_requests
        FROM security_events 
        WHERE timestamp > NOW() - INTERVAL '24 hours'
      `);

      return result.rows[0];
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      return {};
    }
  }
}

// Singleton instance
const securitySystem = new AdvancedSecuritySystem();

export { securitySystem, AdvancedSecuritySystem };
export type { SecurityEvent }; 
// src/lib/security/abuse-detection.ts
// Modules 73-75: OWASP Platform-Wide Enforcement, Adaptive Threat Intelligence, Real-Time Behavior Fingerprinting

import axios from 'axios';
// import crypto from 'crypto';
// import { getDb } from '@/lib/db';
// import { encrypt } from '@/lib/security/encryption';

interface AbuseCheckParams {
  ip: string;
  userAgent: string;
  fingerprint: string;
  action: string;
  behaviorData?: Record<string, unknown>;
}

interface AbuseCheckResult {
  blocked: boolean;
  reason?: string;
  score?: number;
  patterns?: string[];
}

interface SecurityEventParams {
  type: string;
  ip?: string;
  userId?: number;
  data?: Record<string, unknown>;
  error?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

// Module 74: Threat intelligence sources
const THREAT_SOURCES = {
  abuseIpDb: process.env.ABUSEIPDB_API_KEY,
  ipQuality: process.env.IPQUALITY_API_KEY,
  proxyCheck: process.env.PROXYCHECK_API_KEY
};

// Module 75: Behavior patterns that indicate abuse
const SUSPICIOUS_PATTERNS = {
  rapidClicking: { threshold: 10, window: 1000 }, // 10 clicks in 1 second
  inhuman_typing: { minDelay: 10, maxDelay: 1000 }, // Too fast or too consistent
  mouse_teleportation: { distance: 1000 }, // Instant large movements
  form_flooding: { threshold: 5, window: 60000 }, // 5 forms in 1 minute
  vpn_tor_detection: true,
  datacenter_ips: true,
  known_abuse_ips: true
};

/**
 * Module 73: Core abuse detection function
 */
export async function detectAbuse(params: AbuseCheckParams): Promise<AbuseCheckResult> {
  const { ip, userAgent, fingerprint, action, behaviorData } = params;
  
  let abuseScore = 0;
  const detectedPatterns: string[] = [];
  
  try {
    // 1. Check IP reputation (Module 74)
    const ipCheck = await checkIpReputation(ip);
    if (ipCheck.suspicious) {
      abuseScore += ipCheck.score;
      detectedPatterns.push(...ipCheck.patterns);
    }

    // 2. Check for TOR/VPN/Proxy (Module 74)
    const proxyCheck = await checkProxyVpn(ip);
    if (proxyCheck.isProxy) {
      abuseScore += 30;
      detectedPatterns.push('proxy_detected');
    }
    if (proxyCheck.isTor) {
      abuseScore += 50;
      detectedPatterns.push('tor_detected');
    }
    if (proxyCheck.isVpn) {
      abuseScore += 20;
      detectedPatterns.push('vpn_detected');
    }

    // 3. Check behavior fingerprint (Module 75)
    if (behaviorData) {
      const behaviorCheck = analyzeBehaviorPattern(behaviorData);
      if (behaviorCheck.suspicious) {
        abuseScore += behaviorCheck.score;
        detectedPatterns.push(...behaviorCheck.patterns);
      }
    }

    // 4. Check rate limiting
    const rateLimitCheck = await checkRateLimit(ip, fingerprint, action);
    if (rateLimitCheck.exceeded) {
      abuseScore += 40;
      detectedPatterns.push('rate_limit_exceeded');
    }

    // 5. Check for known abuse patterns in database
    const dbCheck = await checkAbuseHistory(ip, fingerprint);
    if (dbCheck.previousAbuse) {
      abuseScore += dbCheck.score;
      detectedPatterns.push('previous_abuse_detected');
    }

    // 6. User agent analysis
    const uaCheck = analyzeUserAgent(userAgent);
    if (uaCheck.suspicious) {
      abuseScore += uaCheck.score;
      detectedPatterns.push(...uaCheck.patterns);
    }

    // Decision logic
    const blocked = abuseScore >= 50; // Threshold for blocking
    
    // Log the check
    await logAbuseCheck({
      ip,
      fingerprint,
      action,
      abuseScore,
      blocked,
      patterns: detectedPatterns
    });

    return {
      blocked,
      score: abuseScore,
      patterns: detectedPatterns,
      reason: blocked ? `Abuse score ${abuseScore}: ${detectedPatterns.join(', ')}` : undefined
    };

  } catch (error) {
    console.error('Abuse detection error:', error);
    // Fail open (don't block on error)
    return { blocked: false };
  }
}

/**
 * Module 74: Check IP reputation using external services
 */
async function checkIpReputation(ip: string): Promise<{suspicious: boolean; score: number; patterns: string[]}> {
  const patterns: string[] = [];
  let score = 0;

  // Check AbuseIPDB
  if (THREAT_SOURCES.abuseIpDb) {
    try {
      const response = await axios.get(`https://api.abuseipdb.com/api/v2/check`, {
        headers: {
          'Key': THREAT_SOURCES.abuseIpDb,
          'Accept': 'application/json'
        },
        params: {
          ipAddress: ip,
          maxAgeInDays: 90
        },
        timeout: 2000
      });

      const data = response.data.data;
      if (data.abuseConfidenceScore > 25) {
        score += Math.round(data.abuseConfidenceScore / 2);
        patterns.push('abuseipdb_flagged');
      }
    } catch (error) {
      console.error('AbuseIPDB check failed:', error);
    }
  }

  // Check if it's a datacenter IP
  if (isDatacenterIp(ip)) {
    score += 15;
    patterns.push('datacenter_ip');
  }

  return {
    suspicious: score > 0,
    score,
    patterns
  };
}

/**
 * Module 74: Check for proxy/VPN/TOR
 */
async function checkProxyVpn(ip: string): Promise<{isProxy: boolean; isVpn: boolean; isTor: boolean}> {
  // Simple TOR exit node check
  const torExitNodes = await getTorExitNodes();
  const isTor = torExitNodes.includes(ip);

  // VPN/Proxy detection would use external service
  let isProxy = false;
  let isVpn = false;

  if (THREAT_SOURCES.proxyCheck) {
    try {
      const response = await axios.get(`https://proxycheck.io/v2/${ip}`, {
        params: {
          key: THREAT_SOURCES.proxyCheck,
          vpn: 1,
          asn: 1
        },
        timeout: 2000
      });

      const data = response.data[ip];
      isProxy = data.proxy === 'yes';
      isVpn = data.type === 'VPN';
    } catch (error) {
      console.error('ProxyCheck failed:', error);
    }
  }

  return { isProxy, isVpn, isTor };
}

/**
 * Module 75: Analyze behavior patterns
 */
function analyzeBehaviorPattern(behaviorData: any): {suspicious: boolean; score: number; patterns: string[]} {
  const patterns: string[] = [];
  let score = 0;

  // Check typing rhythm
  if (behaviorData.typingRhythm && behaviorData.typingRhythm.length > 10) {
    const avgDelay = behaviorData.typingRhythm.reduce((a: number, b: number) => a + b, 0) / behaviorData.typingRhythm.length;
    const variance = calculateVariance(behaviorData.typingRhythm);
    
    // Too consistent (bot-like)
    if (variance < 5) {
      score += 20;
      patterns.push('robotic_typing');
    }
    
    // Too fast
    if (avgDelay < SUSPICIOUS_PATTERNS.inhuman_typing.minDelay) {
      score += 15;
      patterns.push('superhuman_typing_speed');
    }
  }

  // Check mouse movements
  if (behaviorData.mouseMovements && behaviorData.mouseMovements.length > 0) {
    // Look for teleportation
    for (let i = 1; i < behaviorData.mouseMovements.length; i++) {
      const prev = behaviorData.mouseMovements[i - 1];
      const curr = behaviorData.mouseMovements[i];
      const distance = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
      const timeDiff = curr.time - prev.time;
      
      if (distance > SUSPICIOUS_PATTERNS.mouse_teleportation.distance && timeDiff < 100) {
        score += 10;
        patterns.push('mouse_teleportation');
        break;
      }
    }
  }

  // Check form interaction count
  if (behaviorData.formInteractions < 3) {
    score += 10;
    patterns.push('minimal_interaction');
  }

  return {
    suspicious: score > 0,
    score,
    patterns
  };
}

/**
 * Rate limiting check
 */
async function checkRateLimit(ip: string, fingerprint: string, action: string): Promise<{exceeded: boolean}> {
  const maxAttempts = getMaxAttemptsForAction(action);
  
  // In production, this would check database for rate limiting
  // For now, return false to allow requests
  console.log(`Rate limit check for ${ip}, ${fingerprint}, ${action} - max attempts: ${maxAttempts}`);
  return { exceeded: false };
}

/**
 * Check abuse history in database
 */
async function checkAbuseHistory(ip: string, fingerprint: string): Promise<{previousAbuse: boolean; score: number}> {
  console.log(`Abuse history check for ${ip}, ${fingerprint}`);
  return { previousAbuse: false, score: 0 };
}

/**
 * Analyze user agent for suspicious patterns
 */
function analyzeUserAgent(userAgent: string): {suspicious: boolean; score: number; patterns: string[]} {
  const patterns: string[] = [];
  let score = 0;

  // Check for missing user agent
  if (!userAgent || userAgent.length < 10) {
    score += 20;
    patterns.push('missing_user_agent');
  }

  // Check for common bot patterns
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /headless/i, /phantom/i, /selenium/i, /puppeteer/i
  ];

  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) {
      score += 30;
      patterns.push('bot_user_agent');
      break;
    }
  }

  // Check for curl/wget
  if (/curl|wget/i.test(userAgent)) {
    score += 25;
    patterns.push('command_line_tool');
  }

  return {
    suspicious: score > 0,
    score,
    patterns
  };
}

/**
 * Log security event to database
 */
export async function logSecurityEvent(params: SecurityEventParams): Promise<void> {
  // In production, this would log to database
  console.log('Security event logged:', {
    type: params.type,
    userId: params.userId,
    ip: params.ip ? '[REDACTED]' : null,
    timestamp: params.timestamp,
    data: params.data,
    error: params.error,
    reason: params.reason
  });
}

// Helper functions
function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
}

function isDatacenterIp(ip: string): boolean {
  // This would check against known datacenter IP ranges
  // For now, simple check for common cloud providers
  const datacenterRanges = [
    '104.16.', '104.17.', '104.18.', '104.19.', // Cloudflare
    '172.64.', '172.65.', '172.66.', '172.67.', // Cloudflare
    '35.', '34.', '104.196.', '104.199.', // Google Cloud
    '52.', '54.', '18.', '13.', // AWS
  ];
  
  return datacenterRanges.some(range => ip.startsWith(range));
}

async function getTorExitNodes(): Promise<string[]> {
  // This would fetch current TOR exit nodes
  // For production, implement caching
  try {
    const response = await axios.get('https://check.torproject.org/exit-addresses', {
      timeout: 5000
    });
    
    const lines = response.data.split('\n');
    const exitNodes: string[] = [];
    
    for (const line of lines) {
      if (line.startsWith('ExitAddress')) {
        const ip = line.split(' ')[1];
        exitNodes.push(ip);
      }
    }
    
    return exitNodes;
  } catch (error) {
    console.error('Failed to fetch TOR exit nodes:', error);
    return [];
  }
}

function getMaxAttemptsForAction(action: string): number {
  const limits: Record<string, number> = {
    signup: 3,
    login: 5,
    titled_player_verification: 5,
    password_reset: 3,
    article_submit: 10,
    video_upload: 5
  };
  
  return limits[action] || 10;
}

async function logAbuseCheck(data: Record<string, unknown>): Promise<void> {
  // In production, this would log to database
  console.log('Abuse check logged:', {
    ip: '[REDACTED]',
    action: data.action,
    abuseScore: data.abuseScore,
    blocked: data.blocked,
    patterns: data.patterns
  });
}

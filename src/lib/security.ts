import { NextRequest } from 'next/server';
import { pool } from './database';

interface SecurityResult {
  allowed: boolean;
  reason?: string;
}

// Security utilities for TheChessWire.news

// Sanctioned countries list (example)
const SANCTIONED_COUNTRIES = ['XX', 'YY', 'ZZ'];

// Rate limiting configuration
export const RATE_LIMITS = {
  login: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
  register: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 attempts per hour
  api: { windowMs: 60 * 1000, max: 100 }, // 100 requests per minute
  voice: { windowMs: 60 * 1000, max: 10 }, // 10 voice requests per minute
};

// Security event logging
export function logSecurityEvent(event: string, details: any, ip?: string) {
  const timestamp = new Date().toISOString();
  const referer = typeof window !== 'undefined' ? window.location.href : 'server-side';
  
  const logEntry = {
    timestamp,
    event,
    details,
    ip: ip || 'unknown',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server-side',
    referer
  };

  // In production, send to security monitoring service
  console.log('🔒 Security Event:', logEntry);
  
  // TODO: Send to security monitoring service (e.g., Sentry, LogRocket)
  return logEntry;
}

// IP validation
export function validateIP(ip: string): boolean {
  // Basic IP validation
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
}

// User agent validation
export function isValidUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return userAgent.length > 0 && userAgent.length < 1000;
}

// Content security policy
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https: blob:",
    "connect-src 'self' https://api.stripe.com https://api.openai.com",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
};

// Security headers
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  ...CSP_HEADERS
};

// Sanctioned countries (example list)
const TOR_EXIT_NODES: string[] = [
  // This would be populated with actual TOR exit node IPs
  // For now, we'll use a placeholder
];

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-client-ip') ||
    'unknown'
  );
}

export async function validateRequest(request: NextRequest): Promise<SecurityResult> {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  
  // Check for missing or suspicious User-Agent
  if (!isValidUserAgent(userAgent)) {
    return {
      allowed: false,
      reason: 'Invalid User-Agent',
    };
  }
  
  // Check for common bot User-Agents
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
  ];
  
  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) {
      return {
        allowed: false,
        reason: 'Bot detected',
      };
    }
  }
  
  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip',
  ];
  
  for (const header of suspiciousHeaders) {
    const value = request.headers.get(header);
    if (value && value.includes(',')) {
      // Multiple IPs in header might indicate proxy
      return {
        allowed: false,
        reason: 'Proxy detected',
      };
    }
  }
  
  // Check for TOR exit nodes (simplified check)
  if (TOR_EXIT_NODES.includes(ip)) {
    return {
      allowed: false,
      reason: 'TOR exit node detected',
    };
  }
  
  // Geographic blocking (simplified - would use GeoIP service in production)
  // For now, we'll allow all requests but log for monitoring
  
  // Check for suspicious patterns in request
  const url = request.url;
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // XSS attempts
    /union\s+select/i, // SQL injection
    /eval\s*\(/i, // Code injection
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      return {
        allowed: false,
        reason: 'Suspicious request pattern',
      };
    }
  }
  
  // All checks passed
  return {
    allowed: true,
  };
}

// Additional security utilities
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  // Minimum 12 characters, at least one uppercase, one lowercase, one number, one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
  return passwordRegex.test(password);
} 
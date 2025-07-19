import { NextRequest } from 'next/server';

interface SecurityResult {
  allowed: boolean;
  reason?: string;
}

// Sanctioned countries (example list)
const SANCTIONED_COUNTRIES = [
  'IR', // Iran
  'KP', // North Korea
  'CU', // Cuba
  'SY', // Syria
  'VE', // Venezuela
];

// Known TOR exit node IPs (example)
const TOR_EXIT_NODES = [
  // This would be populated with actual TOR exit node IPs
  // For now, we'll use a placeholder
];

export async function validateRequest(request: NextRequest): Promise<SecurityResult> {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  
  // Check for missing or suspicious User-Agent
  if (!userAgent || userAgent.length < 10) {
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
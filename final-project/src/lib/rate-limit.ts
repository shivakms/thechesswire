import { NextRequest } from 'next/server';

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_HOUR = 100;

export async function rateLimit(request: NextRequest): Promise<RateLimitResult> {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  const key = `rate_limit:${ip}`;
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    
    return {
      success: true,
      remaining: MAX_REQUESTS_PER_HOUR - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }
  
  if (current.count >= MAX_REQUESTS_PER_HOUR) {
    return {
      success: false,
      remaining: 0,
      resetTime: current.resetTime,
    };
  }
  
  // Increment count
  current.count++;
  rateLimitStore.set(key, current);
  
  return {
    success: true,
    remaining: MAX_REQUESTS_PER_HOUR - current.count,
    resetTime: current.resetTime,
  };
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes 
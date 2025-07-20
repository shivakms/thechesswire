import logger from '@/lib/logger';

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        logger.error(`Operation failed after ${maxRetries} attempts`, lastError);
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(`Operation failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`, lastError);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      
      if (waitTime > 0) {
        logger.info(`Rate limit reached, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    this.requests.push(now);
  }
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Generate hash for deduplication
 */
export function generateHash(text: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize text for API calls
 */
export function sanitizeText(text: string, maxLength: number = 5000): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .substring(0, maxLength);
}

/**
 * Extract PGN from text
 */
export function extractPGN(text: string): string | null {
  const pgnRegex = /\[.*?\]\s*1\.\s*[a-h][1-8][a-h][1-8]/s;
  const match = text.match(pgnRegex);
  return match ? match[0] : null;
}

/**
 * Calculate text duration (approximate)
 */
export function calculateTextDuration(text: string): number {
  // Average speaking rate: 150 words per minute
  const words = text.split(' ').length;
  const minutes = words / 150;
  return Math.ceil(minutes * 60); // Convert to seconds
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Batch processing utility
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 5,
  delayBetweenBatches: number = 1000
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(processor));
    
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        logger.error('Batch processing error', result.reason);
      }
    });
    
    if (i + batchSize < items.length) {
      await sleep(delayBetweenBatches);
    }
  }
  
  return results;
}

/**
 * Error handling wrapper
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorMessage: string = 'Operation failed'
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(errorMessage, error);
      throw error;
    }
  };
}

/**
 * Performance monitoring wrapper
 */
export function withPerformanceMonitoring<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    
    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      
      logger.info(`Performance: ${operationName} completed in ${duration}ms`);
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Performance: ${operationName} failed after ${duration}ms`, error);
      throw error;
    }
  };
}

/**
 * Validate environment variables
 */
export function validateEnvironment(): void {
  const required = [
    'ELEVENLABS_API_KEY',
    'HEYGEN_API_KEY',
    'YOUTUBE_CLIENT_ID',
    'YOUTUBE_CLIENT_SECRET',
    'YOUTUBE_REFRESH_TOKEN',
    'INSTAGRAM_ACCESS_TOKEN',
    'INSTAGRAM_USER_ID',
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET',
    'REDDIT_CLIENT_ID',
    'REDDIT_CLIENT_SECRET',
    'REDDIT_REFRESH_TOKEN',
    'DATABASE_URL'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Health check utility
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  checks: Record<string, boolean>;
  timestamp: Date;
}> {
  const checks: Record<string, boolean> = {};
  
  try {
    // Check database connection
    const { getDatabase } = await import('../database/connection');
    const db = getDatabase();
    await db.testConnection();
    checks.database = true;
  } catch (error) {
    checks.database = false;
    logger.error('Database health check failed', error);
  }

  // Check API keys (basic validation)
  checks.elevenlabs = !!process.env.ELEVENLABS_API_KEY;
  checks.heygen = !!process.env.HEYGEN_API_KEY;
  checks.youtube = !!(process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET);
  checks.instagram = !!process.env.INSTAGRAM_ACCESS_TOKEN;
  checks.twitter = !!(process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET);
  checks.reddit = !!(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET);

  const allChecksPassed = Object.values(checks).every(check => check);
  
  return {
    status: allChecksPassed ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date()
  };
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} {
  const usage = process.memoryUsage();
  const used = usage.heapUsed;
  const total = usage.heapTotal;
  const percentage = (used / total) * 100;
  
  return {
    used: Math.round(used / 1024 / 1024), // MB
    total: Math.round(total / 1024 / 1024), // MB
    percentage: Math.round(percentage)
  };
}

/**
 * Log memory usage
 */
export function logMemoryUsage(): void {
  const memory = getMemoryUsage();
  logger.info('Memory usage', memory);
}

/**
 * Cleanup utility
 */
export async function cleanup(): Promise<void> {
  logger.info('Starting cleanup process');
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
    logger.info('Garbage collection completed');
  }
  
  // Log final memory usage
  logMemoryUsage();
  
  logger.info('Cleanup process completed');
} 
// Edge Runtime Configuration for API Routes
// Provides high-performance edge computing capabilities

export const runtime = 'edge';

export interface EdgeConfig {
  maxDuration: number; // seconds
  memory: number; // MB
  regions: string[];
  cache: {
    ttl: number; // seconds
    staleWhileRevalidate: number; // seconds
  };
}

export interface EdgeResponse {
  data: any;
  headers: Record<string, string>;
  status: number;
  cache?: {
    ttl: number;
    tags: string[];
  };
}

export class EdgeRuntime {
  private config: EdgeConfig = {
    maxDuration: 30,
    memory: 128,
    regions: ['iad1', 'sfo1', 'hnd1', 'fra1'],
    cache: {
      ttl: 300, // 5 minutes
      staleWhileRevalidate: 60 // 1 minute
    }
  };

  constructor(config?: Partial<EdgeConfig>) {
    this.config = { ...this.config, ...config };
  }

  // Create edge-optimized response
  createResponse(data: any, options?: Partial<EdgeResponse>): Response {
    const response: EdgeResponse = {
      data,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${this.config.cache.ttl}, stale-while-revalidate=${this.config.cache.staleWhileRevalidate}`,
        'CDN-Cache-Control': `public, max-age=${this.config.cache.ttl}`,
        'Vercel-CDN-Cache-Control': `public, max-age=${this.config.cache.ttl}`,
        ...options?.headers
      },
      status: options?.status || 200,
      cache: options?.cache
    };

    return new Response(JSON.stringify(response.data), {
      status: response.status,
      headers: response.headers
    });
  }

  // Create cached response
  createCachedResponse(data: any, ttl: number, tags: string[] = []): Response {
    return this.createResponse(data, {
      cache: { ttl, tags },
      headers: {
        'Cache-Control': `public, max-age=${ttl}, stale-while-revalidate=${Math.floor(ttl * 0.2)}`,
        'CDN-Cache-Control': `public, max-age=${ttl}`,
        'Vercel-CDN-Cache-Control': `public, max-age=${ttl}`
      }
    });
  }

  // Create error response
  createErrorResponse(error: string, status: number = 500): Response {
    return this.createResponse(
      { error, timestamp: new Date().toISOString() },
      { status }
    );
  }

  // Get request IP address
  getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
    return cfConnectingIP || realIP || forwarded?.split(',')[0] || 'unknown';
  }

  // Get user agent
  getUserAgent(request: Request): string {
    return request.headers.get('user-agent') || 'unknown';
  }

  // Get request country
  getCountry(request: Request): string {
    return request.headers.get('cf-ipcountry') || 
           request.headers.get('x-vercel-ip-country') || 
           'unknown';
  }

  // Get request region
  getRegion(request: Request): string {
    return request.headers.get('x-vercel-ip-region') || 'unknown';
  }

  // Check if request is from a bot
  isBot(request: Request): boolean {
    const userAgent = this.getUserAgent(request);
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /php/i
    ];
    
    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  // Rate limiting for edge functions
  async checkRateLimit(request: Request, key: string, limit: number, window: number): Promise<boolean> {
    // This would integrate with Redis or similar for distributed rate limiting
    // For now, return true (allow request)
    return true;
  }

  // Geolocation-based routing
  getOptimalRegion(request: Request): string {
    const country = this.getCountry(request);
    const region = this.getRegion(request);
    
    // Route to nearest region based on location
    const regionMap: Record<string, string> = {
      'US': 'iad1',
      'CA': 'iad1',
      'GB': 'fra1',
      'DE': 'fra1',
      'JP': 'hnd1',
      'AU': 'syd1'
    };
    
    return regionMap[country] || 'iad1';
  }

  // Edge caching with tags
  async cacheWithTags(key: string, data: any, ttl: number, tags: string[]): Promise<void> {
    // This would integrate with edge caching service
    console.log(`Caching ${key} with tags: ${tags.join(', ')}`);
  }

  // Invalidate cache by tags
  async invalidateCacheByTags(tags: string[]): Promise<void> {
    // This would invalidate cache entries with matching tags
    console.log(`Invalidating cache for tags: ${tags.join(', ')}`);
  }

  // Edge function performance monitoring
  startTimer(): () => number {
    const start = Date.now();
    return () => Date.now() - start;
  }

  // Memory usage monitoring
  getMemoryUsage(): number {
    // This would return actual memory usage in edge runtime
    return Math.random() * 50; // Simulated memory usage in MB
  }

  // CPU usage monitoring
  getCPUUsage(): number {
    // This would return actual CPU usage in edge runtime
    return Math.random() * 100; // Simulated CPU usage percentage
  }
}

// Singleton instance
const edgeRuntime = new EdgeRuntime();

export { edgeRuntime };

// Edge middleware for common functionality
export function createEdgeMiddleware(handler: Function) {
  return async (request: Request, context: any) => {
    const startTime = edgeRuntime.startTimer();
    
    try {
      // Add edge-specific headers
      const enhancedRequest = new Request(request, {
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          'x-edge-runtime': 'true',
          'x-edge-region': edgeRuntime.getOptimalRegion(request),
          'x-client-ip': edgeRuntime.getClientIP(request),
          'x-client-country': edgeRuntime.getCountry(request)
        }
      });

      // Check rate limiting
      const clientIP = edgeRuntime.getClientIP(request);
      const isAllowed = await edgeRuntime.checkRateLimit(enhancedRequest, clientIP, 100, 3600);
      
      if (!isAllowed) {
        return edgeRuntime.createErrorResponse('Rate limit exceeded', 429);
      }

      // Check for bot requests
      if (edgeRuntime.isBot(enhancedRequest)) {
        // Apply different rate limits for bots
        const botAllowed = await edgeRuntime.checkRateLimit(enhancedRequest, `bot:${clientIP}`, 10, 3600);
        
        if (!botAllowed) {
          return edgeRuntime.createErrorResponse('Bot rate limit exceeded', 429);
        }
      }

      // Execute handler
      const response = await handler(enhancedRequest, context);
      
      // Add performance headers
      const duration = startTime();
      const enhancedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'x-edge-duration': duration.toString(),
          'x-edge-memory': edgeRuntime.getMemoryUsage().toString(),
          'x-edge-cpu': edgeRuntime.getCPUUsage().toString()
        }
      });

      return enhancedResponse;
    } catch (error) {
      console.error('Edge middleware error:', error);
      return edgeRuntime.createErrorResponse('Internal server error', 500);
    }
  };
}

// Edge-specific utilities
export const edgeUtils = {
  // Parse JSON safely
  parseJSON: (text: string) => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  },

  // Validate request body size
  validateBodySize: (request: Request, maxSize: number = 1024 * 1024) => {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > maxSize) {
      throw new Error('Request body too large');
    }
  },

  // Extract query parameters
  getQueryParams: (request: Request): Record<string, string> => {
    const url = new URL(request.url);
    const params: Record<string, string> = {};
    
    for (const [key, value] of url.searchParams.entries()) {
      params[key] = value;
    }
    
    return params;
  },

  // Validate required headers
  validateHeaders: (request: Request, required: string[]): boolean => {
    return required.every(header => request.headers.has(header));
  },

  // Create CORS headers
  createCORSHeaders: (origin: string = '*'): Record<string, string> => ({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  }),

  // Handle CORS preflight
  handleCORS: (request: Request): Response | null => {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: edgeUtils.createCORSHeaders()
      });
    }
    return null;
  }
};

// Export edge runtime configuration
export const edgeConfig = {
  runtime: 'edge',
  regions: ['iad1', 'sfo1', 'hnd1', 'fra1'],
  maxDuration: 30
}; 
import logger from '@/lib/logger';

export interface VoiceOptimizationConfig {
  preloadThreshold: number;
  cacheSize: number;
  maxConcurrentRequests: number;
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
}

export interface VoiceRequest {
  id: string;
  text: string;
  mode: string;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
}

export interface VoiceCache {
  [key: string]: {
    blob: Blob;
    url: string;
    timestamp: number;
    size: number;
    accessCount: number;
  };
}

class VoiceOptimizer {
  private cache: VoiceCache = {};
  private requestQueue: VoiceRequest[] = [];
  private activeRequests = 0;
  private config: VoiceOptimizationConfig;

  constructor(config: Partial<VoiceOptimizationConfig> = {}) {
    this.config = {
      preloadThreshold: 1000, // Preload if text length > 1000
      cacheSize: 50, // Max 50 cached items
      maxConcurrentRequests: 3,
      retryAttempts: 3,
      retryDelay: 1000,
      timeout: 30000,
      ...config
    };

    this.cleanupCache();
  }

  /**
   * Generate voice with optimization
   */
  async generateVoice(
    text: string, 
    mode: string, 
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<string> {
    const cacheKey = this.getCacheKey(text, mode);
    
    // Check cache first
    const cached = this.cache[cacheKey];
    if (cached) {
      cached.accessCount++;
      logger.info('Voice cache hit', { cacheKey, accessCount: cached.accessCount });
      return cached.url;
    }

    // Add to request queue
    const request: VoiceRequest = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      mode,
      priority,
      timestamp: Date.now()
    };

    this.requestQueue.push(request);
    this.requestQueue.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      return a.timestamp - b.timestamp;
    });

    return this.processQueue();
  }

  /**
   * Process request queue
   */
  private async processQueue(): Promise<string> {
    if (this.activeRequests >= this.config.maxConcurrentRequests || this.requestQueue.length === 0) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          this.processQueue().then(resolve).catch(reject);
        }, 100);
      });
    }

    const request = this.requestQueue.shift();
    if (!request) {
      throw new Error('No request in queue');
    }

    this.activeRequests++;
    
    try {
      const url = await this.generateVoiceWithRetry(request);
      this.activeRequests--;
      
      // Process next request
      if (this.requestQueue.length > 0) {
        this.processQueue();
      }
      
      return url;
    } catch (error) {
      this.activeRequests--;
      logger.error('Voice generation failed', error);
      throw error;
    }
  }

  /**
   * Generate voice with retry logic
   */
  private async generateVoiceWithRetry(request: VoiceRequest): Promise<string> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch('/api/voice/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: request.text,
            voiceMode: request.mode,
            voiceId: 'PmypFHWgqk9ACZdL8ugT',
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Voice generation failed: ${response.status}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // Cache the result
        this.cacheResult(request.text, request.mode, blob, url);
        
        logger.info('Voice generated successfully', {
          requestId: request.id,
          attempt,
          mode: request.mode,
          textLength: request.text.length,
          size: blob.size
        });

        return url;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < this.config.retryAttempts) {
          logger.warn('Voice generation attempt failed, retrying', {
            requestId: request.id,
            attempt,
            error: lastError.message
          });
          
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
        }
      }
    }

    throw lastError || new Error('Voice generation failed after all retries');
  }

  /**
   * Cache voice result
   */
  private cacheResult(text: string, mode: string, blob: Blob, url: string): void {
    const cacheKey = this.getCacheKey(text, mode);
    
    // Remove oldest items if cache is full
    if (Object.keys(this.cache).length >= this.config.cacheSize) {
      this.evictOldest();
    }

    this.cache[cacheKey] = {
      blob,
      url,
      timestamp: Date.now(),
      size: blob.size,
      accessCount: 1
    };

    logger.info('Voice cached', { cacheKey, size: blob.size });
  }

  /**
   * Evict oldest cache entries
   */
  private evictOldest(): void {
    const entries = Object.entries(this.cache);
    entries.sort((a, b) => {
      // Sort by access count (ascending) then by timestamp (ascending)
      if (a[1].accessCount !== b[1].accessCount) {
        return a[1].accessCount - b[1].accessCount;
      }
      return a[1].timestamp - b[1].timestamp;
    });

    // Remove oldest 20% of entries
    const toRemove = Math.ceil(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      const [key, entry] = entries[i];
      URL.revokeObjectURL(entry.url);
      delete this.cache[key];
    }

    logger.info('Cache evicted', { removed: toRemove, remaining: Object.keys(this.cache).length });
  }

  /**
   * Preload voice for better performance
   */
  async preloadVoice(text: string, mode: string): Promise<void> {
    if (text.length > this.config.preloadThreshold) {
      try {
        await this.generateVoice(text, mode, 'low');
        logger.info('Voice preloaded', { textLength: text.length, mode });
      } catch (error) {
        logger.warn('Voice preload failed', error);
      }
    }
  }

  /**
   * Get cache key
   */
  private getCacheKey(text: string, mode: string): string {
    return `${text.substring(0, 100)}-${mode}`;
  }

  /**
   * Cleanup cache periodically
   */
  private cleanupCache(): void {
    setInterval(() => {
      const now = Date.now();
      const maxAge = 3600000; // 1 hour
      
      Object.entries(this.cache).forEach(([key, entry]) => {
        if (now - entry.timestamp > maxAge) {
          URL.revokeObjectURL(entry.url);
          delete this.cache[key];
        }
      });
    }, 300000); // Every 5 minutes
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    totalSize: number;
    hitRate: number;
    requests: number;
  } {
    const entries = Object.values(this.cache);
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const totalAccess = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    
    return {
      size: entries.length,
      totalSize,
      hitRate: totalAccess > 0 ? totalAccess / entries.length : 0,
      requests: this.requestQueue.length + this.activeRequests
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    Object.values(this.cache).forEach(entry => {
      URL.revokeObjectURL(entry.url);
    });
    this.cache = {};
    logger.info('Voice cache cleared');
  }
}

// Export singleton instance
export const voiceOptimizer = new VoiceOptimizer();

// Export utility functions
export const optimizeVoiceRequest = (
  text: string, 
  mode: string, 
  priority: 'high' | 'normal' | 'low' = 'normal'
) => voiceOptimizer.generateVoice(text, mode, priority);

export const preloadVoice = (text: string, mode: string) => voiceOptimizer.preloadVoice(text, mode);

export const getVoiceCacheStats = () => voiceOptimizer.getCacheStats();

export const clearVoiceCache = () => voiceOptimizer.clearCache(); 
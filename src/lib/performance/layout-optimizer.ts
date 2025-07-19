import { useEffect, useRef, useState } from 'react';
import logger from '@/lib/logger';

export interface LayoutOptimizationConfig {
  enablePreloading: boolean;
  enableIntersectionObserver: boolean;
  enableResizeObserver: boolean;
  enablePerformanceMonitoring: boolean;
  layoutShiftThreshold: number;
  maxLayoutShiftScore: number;
}

export interface LayoutMetrics {
  layoutShiftScore: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  layoutShiftCount: number;
}

class LayoutOptimizer {
  private config: LayoutOptimizationConfig;
  private layoutShiftEntries: PerformanceEntry[] = [];
  private observers: Map<string, IntersectionObserver | ResizeObserver> = new Map();

  constructor(config: Partial<LayoutOptimizationConfig> = {}) {
    this.config = {
      enablePreloading: true,
      enableIntersectionObserver: true,
      enableResizeObserver: true,
      enablePerformanceMonitoring: true,
      layoutShiftThreshold: 0.1,
      maxLayoutShiftScore: 0.25,
      ...config
    };

    if (this.config.enablePerformanceMonitoring) {
      this.initializePerformanceMonitoring();
    }
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor layout shifts
    if ('PerformanceObserver' in window) {
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.layoutShiftEntries.push(entry);
            this.handleLayoutShift(entry as any);
          }
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('layoutShift', layoutShiftObserver);
      } catch (error) {
        logger.warn('Failed to initialize layout shift observer', error);
      }
    }

    // Monitor paint timing
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.handlePaintTiming(entry);
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('paint', paintObserver);
      } catch (error) {
        logger.warn('Failed to initialize paint observer', error);
      }
    }
  }

  /**
   * Handle layout shift events
   */
  private handleLayoutShift(entry: any): void {
    if (entry.value > this.config.layoutShiftThreshold) {
      logger.warn('Layout shift detected', {
        value: entry.value,
        sources: entry.sources?.map((s: any) => s.node?.tagName || 'unknown'),
        timestamp: entry.startTime
      });
    }
  }

  /**
   * Handle paint timing events
   */
  private handlePaintTiming(entry: PerformanceEntry): void {
    logger.info('Paint timing', {
      name: entry.name,
      startTime: entry.startTime,
      duration: entry.duration
    });
  }

  /**
   * Get layout metrics
   */
  getLayoutMetrics(): LayoutMetrics {
    const layoutShiftScore = this.layoutShiftEntries.reduce(
      (score, entry) => score + (entry as any).value, 
      0
    );

    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    const largestContentfulPaint = paintEntries.find(entry => entry.name === 'largest-contentful-paint')?.startTime || 0;

    return {
      layoutShiftScore,
      firstContentfulPaint,
      largestContentfulPaint,
      cumulativeLayoutShift: layoutShiftScore,
      layoutShiftCount: this.layoutShiftEntries.length
    };
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources(): void {
    if (!this.config.enablePreloading || typeof window === 'undefined') return;

    const criticalResources = [
      '/api/voice/generate',
      '/api/health',
      '/api/news'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });

    logger.info('Critical resources preloaded');
  }

  /**
   * Optimize images to prevent layout shift
   */
  optimizeImages(): void {
    if (typeof window === 'undefined') return;

    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Set aspect ratio to prevent layout shift
      if (img.naturalWidth && img.naturalHeight) {
        const aspectRatio = (img.naturalHeight / img.naturalWidth) * 100;
        img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
      }

      // Add loading="lazy" for non-critical images
      if (!img.classList.contains('critical')) {
        img.loading = 'lazy';
      }
    });

    logger.info('Images optimized for layout stability');
  }

  /**
   * Reserve space for dynamic content
   */
  reserveSpace(selector: string, width: number, height: number): void {
    if (typeof window === 'undefined') return;

    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      (element as HTMLElement).style.minWidth = `${width}px`;
      (element as HTMLElement).style.minHeight = `${height}px`;
    });
  }

  /**
   * Cleanup observers
   */
  cleanup(): void {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    this.layoutShiftEntries = [];
  }
}

// Export singleton instance
export const layoutOptimizer = new LayoutOptimizer();

// React hooks for layout optimization
export function useLayoutOptimization(selector?: string, dimensions?: { width: number; height: number }) {
  const [metrics, setMetrics] = useState<LayoutMetrics | null>(null);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Reserve space if dimensions provided
    if (dimensions && elementRef.current) {
      elementRef.current.style.minWidth = `${dimensions.width}px`;
      elementRef.current.style.minHeight = `${dimensions.height}px`;
    }

    // Update metrics periodically
    const interval = setInterval(() => {
      setMetrics(layoutOptimizer.getLayoutMetrics());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [dimensions]);

  return { metrics, elementRef };
}

export function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !elementRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      setIsIntersecting(entry.isIntersecting);
      callback(entries, observer);
    }, options);

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [callback, options]);

  return { elementRef, isIntersecting };
}

export function useResizeObserver(callback: ResizeObserverCallback) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !elementRef.current) return;

    const observer = new ResizeObserver(callback);
    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [callback]);

  return { elementRef };
}

// Utility functions
export const preloadCriticalResources = () => layoutOptimizer.preloadCriticalResources();
export const optimizeImages = () => layoutOptimizer.optimizeImages();
export const reserveSpace = (selector: string, width: number, height: number) => 
  layoutOptimizer.reserveSpace(selector, width, height);
export const getLayoutMetrics = () => layoutOptimizer.getLayoutMetrics();
export const cleanupLayoutOptimizer = () => layoutOptimizer.cleanup(); 
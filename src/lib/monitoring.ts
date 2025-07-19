import { pool } from './database';
import { logSecurityEvent } from './security';

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastChecked: Date;
  details?: any;
}

export interface PerformanceMetric {
  timestamp: Date;
  metric: string;
  value: number;
  tags: Record<string, string>;
}

export interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
}

export interface SystemAlert {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  category: string;
  resolved: boolean;
  resolvedAt?: Date;
  assignedTo?: string;
}

class MonitoringSystem {
  private static instance: MonitoringSystem;
  private healthChecks: Map<string, HealthCheck> = new Map();
  private performanceMetrics: PerformanceMetric[] = [];
  private errorLogs: ErrorLog[] = [];
  private systemAlerts: SystemAlert[] = [];
  private isMonitoring: boolean = false;

  private constructor() {}

  static getInstance(): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      MonitoringSystem.instance = new MonitoringSystem();
    }
    return MonitoringSystem.instance;
  }

  // Start monitoring
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('🚀 Starting infrastructure monitoring...');

    // Start health check loop
    this.startHealthCheckLoop();
    
    // Start performance monitoring
    this.startPerformanceMonitoring();
    
    // Start error tracking
    this.startErrorTracking();
  }

  // Stop monitoring
  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('🛑 Stopping infrastructure monitoring...');
  }

  // Health Check System
  private async startHealthCheckLoop(): Promise<void> {
    const runHealthChecks = async () => {
      if (!this.isMonitoring) return;

      try {
        await this.checkDatabaseHealth();
        await this.checkAPIServices();
        await this.checkExternalDependencies();
        await this.checkSystemResources();
        
        // Store health check results
        await this.storeHealthCheckResults();
        
        // Check for alerts
        await this.checkForAlerts();
        
      } catch (error) {
        console.error('Health check error:', error);
        await this.logError('Health check failed', error as Error);
      }

      // Schedule next health check
      setTimeout(runHealthChecks, 30000); // Every 30 seconds
    };

    runHealthChecks();
  }

  private async checkDatabaseHealth(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const result = await pool.query('SELECT 1 as health_check');
      const responseTime = Date.now() - startTime;
      
      this.healthChecks.set('database', {
        name: 'Database Connection',
        status: 'healthy',
        responseTime,
        lastChecked: new Date(),
        details: {
          queryTime: responseTime,
          result: result.rows[0]
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.healthChecks.set('database', {
        name: 'Database Connection',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        details: { error: errorMessage }
      });
      
      await this.createAlert('critical', 'Database Connection Failed', 'Database is not responding');
    }
  }

  private async checkAPIServices(): Promise<void> {
    const services = [
      { name: 'voice-api', url: '/api/voice/generate' },
      { name: 'auth-api', url: '/api/auth/login' },
      { name: 'mfa-api', url: '/api/auth/mfa/setup-totp' }
    ];

    for (const service of services) {
      const startTime = Date.now();
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}${service.url}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        const responseTime = Date.now() - startTime;
        const status = response.ok ? 'healthy' : 'degraded';
        
        this.healthChecks.set(service.name, {
          name: `${service.name} API`,
          status,
          responseTime,
          lastChecked: new Date(),
          details: {
            statusCode: response.status,
            responseTime
          }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        this.healthChecks.set(service.name, {
          name: `${service.name} API`,
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          lastChecked: new Date(),
          details: { error: errorMessage }
        });
        
        await this.createAlert('high', `${service.name} API Down`, `Service is not responding`);
      }
    }
  }

  private async checkExternalDependencies(): Promise<void> {
    const dependencies = [
      { name: 'elevenlabs', url: 'https://api.elevenlabs.io/v1/voices' },
      { name: 'stripe', url: 'https://api.stripe.com/v1/account' }
    ];

    for (const dep of dependencies) {
      const startTime = Date.now();
      
      try {
        const response = await fetch(dep.url, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${process.env[`${dep.name.toUpperCase()}_API_KEY`]}` },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        const responseTime = Date.now() - startTime;
        const status = response.ok ? 'healthy' : 'degraded';
        
        this.healthChecks.set(dep.name, {
          name: `${dep.name} API`,
          status,
          responseTime,
          lastChecked: new Date(),
          details: {
            statusCode: response.status,
            responseTime
          }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        this.healthChecks.set(dep.name, {
          name: `${dep.name} API`,
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          lastChecked: new Date(),
          details: { error: errorMessage }
        });
        
        await this.createAlert('medium', `${dep.name} API Unavailable`, `External dependency is down`);
      }
    }
  }

  private async checkSystemResources(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Check memory usage
      const memUsage = process.memoryUsage();
      const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      
      // Check CPU usage (simplified)
      const cpuUsage = process.cpuUsage();
      
      const status = memoryUsagePercent > 90 ? 'degraded' : 'healthy';
      
      this.healthChecks.set('system-resources', {
        name: 'System Resources',
        status,
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        details: {
          memoryUsage: memoryUsagePercent,
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          cpuUsage: cpuUsage
        }
      });
      
      if (memoryUsagePercent > 90) {
        await this.createAlert('medium', 'High Memory Usage', `Memory usage is at ${memoryUsagePercent.toFixed(1)}%`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.healthChecks.set('system-resources', {
        name: 'System Resources',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        details: { error: errorMessage }
      });
    }
  }

  // Performance Monitoring
  private startPerformanceMonitoring(): void {
    // Monitor request response times
    const originalFetch = global.fetch;
    global.fetch = async (...args) => {
      const startTime = Date.now();
      try {
        const response = await originalFetch(...args);
        const responseTime = Date.now() - startTime;
        
        this.recordPerformanceMetric('api_response_time', responseTime, {
          url: typeof args[0] === 'string' ? args[0] : 'unknown',
          method: args[1]?.method || 'GET',
          status: response.status.toString()
        });
        
        return response;
      } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        this.recordPerformanceMetric('api_error_time', responseTime, {
          url: typeof args[0] === 'string' ? args[0] : 'unknown',
          method: args[1]?.method || 'GET',
          error: errorMessage
        });
        throw error;
      }
    };

    // Monitor database query performance
    // const originalQuery = pool.query;
    // pool.query = async (...args: any[]) => {
    //   const startTime = Date.now();
    //   try {
    //     const result = await originalQuery.apply(pool, args);
    //     const queryTime = Date.now() - startTime;
        
    //     this.recordPerformanceMetric('database_query_time', queryTime, {
    //       query: typeof args[0] === 'string' ? args[0].substring(0, 50) : 'unknown'
    //     });
        
    //     return result;
    //   } catch (error) {
    //     const queryTime = Date.now() - startTime;
    //     const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    //     this.recordPerformanceMetric('database_error_time', queryTime, {
    //       query: typeof args[0] === 'string' ? args[0].substring(0, 50) : 'unknown',
    //       error: errorMessage
    //     });
    //     throw error;
    //   }
    // };
  }

  // Error Tracking
  private startErrorTracking(): void {
    // Capture unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.logError('Unhandled Promise Rejection', new Error(String(reason)), {
        promise: promise.toString()
      });
    });

    // Capture uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.logError('Uncaught Exception', error);
      // In production, you might want to exit gracefully
      // process.exit(1);
    });
  }

  // Public methods for logging
  async logError(message: string, error: Error, context?: Record<string, any>): Promise<void> {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'error',
      message,
      stack: error.stack,
      context,
      userAgent: context?.userAgent,
      ip: context?.ip,
      userId: context?.userId,
      sessionId: context?.sessionId
    };

    this.errorLogs.push(errorLog);
    
    // Keep only last 1000 errors
    if (this.errorLogs.length > 1000) {
      this.errorLogs = this.errorLogs.slice(-1000);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error:', errorLog);
    }

    // Store in database
    await this.storeErrorLog(errorLog);
  }

  async logWarning(message: string, context?: Record<string, any>): Promise<void> {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'warn',
      message,
      context
    };

    this.errorLogs.push(errorLog);
    await this.storeErrorLog(errorLog);
  }

  async logInfo(message: string, context?: Record<string, any>): Promise<void> {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'info',
      message,
      context
    };

    this.errorLogs.push(errorLog);
    await this.storeErrorLog(errorLog);
  }

  // Performance metrics
  recordPerformanceMetric(metric: string, value: number, tags: Record<string, string> = {}): void {
    const performanceMetric: PerformanceMetric = {
      timestamp: new Date(),
      metric,
      value,
      tags
    };

    this.performanceMetrics.push(performanceMetric);
    
    // Keep only last 10000 metrics
    if (this.performanceMetrics.length > 10000) {
      this.performanceMetrics = this.performanceMetrics.slice(-10000);
    }
  }

  // Alert system
  async createAlert(severity: SystemAlert['severity'], title: string, message: string, category: string = 'system'): Promise<void> {
    const alert: SystemAlert = {
      id: this.generateId(),
      timestamp: new Date(),
      severity,
      title,
      message,
      category,
      resolved: false
    };

    this.systemAlerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.systemAlerts.length > 100) {
      this.systemAlerts = this.systemAlerts.slice(-100);
    }

    // Log security event for critical alerts
    if (severity === 'critical') {
      await logSecurityEvent('system', 'critical_alert', JSON.stringify(alert));
    }

    // Store in database
    await this.storeAlert(alert);
  }

  async resolveAlert(alertId: string, resolvedBy: string): Promise<void> {
    const alert = this.systemAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      alert.assignedTo = resolvedBy;
      
      await this.updateAlert(alert);
    }
  }

  // Data storage methods
  private async storeHealthCheckResults(): Promise<void> {
    try {
      for (const [key, check] of this.healthChecks) {
        await pool.query(
          'INSERT INTO health_checks (name, status, response_time, details, created_at) VALUES ($1, $2, $3, $4, $5)',
          [check.name, check.status, check.responseTime, JSON.stringify(check.details), check.lastChecked]
        );
      }
    } catch (error) {
      console.error('Failed to store health check results:', error);
    }
  }

  private async storeErrorLog(errorLog: ErrorLog): Promise<void> {
    try {
      await pool.query(
        'INSERT INTO error_logs (id, timestamp, level, message, stack, context) VALUES ($1, $2, $3, $4, $5, $6)',
        [errorLog.id, errorLog.timestamp, errorLog.level, errorLog.message, errorLog.stack, JSON.stringify(errorLog.context)]
      );
    } catch (error) {
      console.error('Failed to store error log:', error);
    }
  }

  private async storeAlert(alert: SystemAlert): Promise<void> {
    try {
      await pool.query(
        'INSERT INTO system_alerts (id, timestamp, severity, title, message, category, resolved) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [alert.id, alert.timestamp, alert.severity, alert.title, alert.message, alert.category, alert.resolved]
      );
    } catch (error) {
      console.error('Failed to store alert:', error);
    }
  }

  private async updateAlert(alert: SystemAlert): Promise<void> {
    try {
      await pool.query(
        'UPDATE system_alerts SET resolved = $1, resolved_at = $2, assigned_to = $3 WHERE id = $4',
        [alert.resolved, alert.resolvedAt, alert.assignedTo, alert.id]
      );
    } catch (error) {
      console.error('Failed to update alert:', error);
    }
  }

  // Alert checking
  private async checkForAlerts(): Promise<void> {
    // Check for consecutive failures
    const unhealthyChecks = Array.from(this.healthChecks.values()).filter(check => check.status === 'unhealthy');
    
    if (unhealthyChecks.length > 2) {
      await this.createAlert('high', 'Multiple Services Down', `${unhealthyChecks.length} services are unhealthy`);
    }

    // Check for high error rates
    const recentErrors = this.errorLogs.filter(log => 
      log.timestamp > new Date(Date.now() - 5 * 60 * 1000) && log.level === 'error'
    );
    
    if (recentErrors.length > 10) {
      await this.createAlert('medium', 'High Error Rate', `${recentErrors.length} errors in the last 5 minutes`);
    }

    // Check for performance degradation
    const recentSlowQueries = this.performanceMetrics.filter(metric =>
      metric.timestamp > new Date(Date.now() - 5 * 60 * 1000) &&
      metric.metric === 'database_query_time' &&
      metric.value > 1000
    );
    
    if (recentSlowQueries.length > 5) {
      await this.createAlert('medium', 'Database Performance Issues', 'Multiple slow queries detected');
    }
  }

  // Public getters
  getHealthChecks(): HealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  getPerformanceMetrics(): PerformanceMetric[] {
    return this.performanceMetrics;
  }

  getErrorLogs(): ErrorLog[] {
    return this.errorLogs;
  }

  getSystemAlerts(): SystemAlert[] {
    return this.systemAlerts;
  }

  getSystemStatus(): 'healthy' | 'degraded' | 'unhealthy' {
    const checks = this.getHealthChecks();
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
    const degradedCount = checks.filter(c => c.status === 'degraded').length;

    if (unhealthyCount > 0) return 'unhealthy';
    if (degradedCount > 2) return 'degraded';
    return 'healthy';
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const monitoringSystem = MonitoringSystem.getInstance();

// Auto-start monitoring in production
if (process.env.NODE_ENV === 'production') {
  monitoringSystem.startMonitoring();
} 
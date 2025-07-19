const os = require('os');
const { logger } = require('../middleware/logging');

let monitoringData = {
  startTime: Date.now(),
  requests: 0,
  errors: 0,
  averageResponseTime: 0,
  memoryUsage: [],
  cpuUsage: [],
  activeConnections: 0
};

const initializeMonitoring = async () => {
  try {
    // Start monitoring intervals
    setInterval(collectSystemMetrics, 60000); // Every minute
    setInterval(logSystemHealth, 300000); // Every 5 minutes
    
    console.log('✅ Monitoring service initialized');
  } catch (error) {
    console.error('❌ Monitoring service initialization failed:', error);
    throw error;
  }
};

// Collect system metrics
const collectSystemMetrics = () => {
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    monitoringData.memoryUsage.push({
      timestamp: Date.now(),
      rss: memUsage.rss,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external
    });
    
    monitoringData.cpuUsage.push({
      timestamp: Date.now(),
      user: cpuUsage.user,
      system: cpuUsage.system
    });
    
    // Keep only last 60 data points (1 hour)
    if (monitoringData.memoryUsage.length > 60) {
      monitoringData.memoryUsage.shift();
    }
    if (monitoringData.cpuUsage.length > 60) {
      monitoringData.cpuUsage.shift();
    }
  } catch (error) {
    logger.error('Failed to collect system metrics:', error);
  }
};

// Log system health
const logSystemHealth = () => {
  try {
    const uptime = Date.now() - monitoringData.startTime;
    const avgMemory = calculateAverageMemory();
    const avgCpu = calculateAverageCpu();
    
    const healthReport = {
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 1000 / 60)} minutes`,
      requests: monitoringData.requests,
      errors: monitoringData.errors,
      errorRate: monitoringData.requests > 0 ? (monitoringData.errors / monitoringData.requests * 100).toFixed(2) + '%' : '0%',
      averageResponseTime: `${monitoringData.averageResponseTime.toFixed(2)}ms`,
      memoryUsage: {
        rss: `${(avgMemory.rss / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(avgMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(avgMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`
      },
      cpuUsage: {
        user: `${(avgCpu.user / 1000000).toFixed(2)}s`,
        system: `${(avgCpu.system / 1000000).toFixed(2)}s`
      },
      activeConnections: monitoringData.activeConnections,
      systemLoad: os.loadavg(),
      freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`
    };
    
    logger.info('System health report', healthReport);
    
    // Check for potential issues
    checkSystemHealth(healthReport);
  } catch (error) {
    logger.error('Failed to log system health:', error);
  }
};

// Calculate average memory usage
const calculateAverageMemory = () => {
  if (monitoringData.memoryUsage.length === 0) {
    return { rss: 0, heapUsed: 0, heapTotal: 0, external: 0 };
  }
  
  const sum = monitoringData.memoryUsage.reduce((acc, curr) => ({
    rss: acc.rss + curr.rss,
    heapUsed: acc.heapUsed + curr.heapUsed,
    heapTotal: acc.heapTotal + curr.heapTotal,
    external: acc.external + curr.external
  }), { rss: 0, heapUsed: 0, heapTotal: 0, external: 0 });
  
  const count = monitoringData.memoryUsage.length;
  return {
    rss: sum.rss / count,
    heapUsed: sum.heapUsed / count,
    heapTotal: sum.heapTotal / count,
    external: sum.external / count
  };
};

// Calculate average CPU usage
const calculateAverageCpu = () => {
  if (monitoringData.cpuUsage.length === 0) {
    return { user: 0, system: 0 };
  }
  
  const sum = monitoringData.cpuUsage.reduce((acc, curr) => ({
    user: acc.user + curr.user,
    system: acc.system + curr.system
  }), { user: 0, system: 0 });
  
  const count = monitoringData.cpuUsage.length;
  return {
    user: sum.user / count,
    system: sum.system / count
  };
};

// Check system health for potential issues
const checkSystemHealth = (healthReport) => {
  const warnings = [];
  
  // Check memory usage
  const memoryUsagePercent = (healthReport.memoryUsage.heapUsed / healthReport.memoryUsage.heapTotal) * 100;
  if (memoryUsagePercent > 80) {
    warnings.push(`High memory usage: ${memoryUsagePercent.toFixed(2)}%`);
  }
  
  // Check error rate
  const errorRate = parseFloat(healthReport.errorRate);
  if (errorRate > 5) {
    warnings.push(`High error rate: ${errorRate}%`);
  }
  
  // Check response time
  if (healthReport.averageResponseTime > 1000) {
    warnings.push(`Slow response time: ${healthReport.averageResponseTime}`);
  }
  
  // Check system load
  const loadAvg = healthReport.systemLoad[0];
  const cpuCores = os.cpus().length;
  if (loadAvg > cpuCores * 0.8) {
    warnings.push(`High system load: ${loadAvg.toFixed(2)} (${cpuCores} cores)`);
  }
  
  if (warnings.length > 0) {
    logger.warn('System health warnings detected', { warnings, healthReport });
  }
};

// Track request metrics
const trackRequest = (duration, success = true) => {
  monitoringData.requests++;
  if (!success) {
    monitoringData.errors++;
  }
  
  // Update average response time
  const currentAvg = monitoringData.averageResponseTime;
  const requestCount = monitoringData.requests;
  monitoringData.averageResponseTime = (currentAvg * (requestCount - 1) + duration) / requestCount;
};

// Track active connections
const setActiveConnections = (count) => {
  monitoringData.activeConnections = count;
};

// Get current system status
const getSystemStatus = () => {
  const uptime = Date.now() - monitoringData.startTime;
  const avgMemory = calculateAverageMemory();
  const avgCpu = calculateAverageCpu();
  
  return {
    status: 'healthy',
    uptime: Math.floor(uptime / 1000),
    requests: monitoringData.requests,
    errors: monitoringData.errors,
    errorRate: monitoringData.requests > 0 ? (monitoringData.errors / monitoringData.requests * 100).toFixed(2) : '0',
    averageResponseTime: monitoringData.averageResponseTime.toFixed(2),
    memoryUsage: {
      rss: (avgMemory.rss / 1024 / 1024).toFixed(2),
      heapUsed: (avgMemory.heapUsed / 1024 / 1024).toFixed(2),
      heapTotal: (avgMemory.heapTotal / 1024 / 1024).toFixed(2)
    },
    cpuUsage: {
      user: (avgCpu.user / 1000000).toFixed(2),
      system: (avgCpu.system / 1000000).toFixed(2)
    },
    activeConnections: monitoringData.activeConnections,
    systemLoad: os.loadavg(),
    freeMemory: (os.freemem() / 1024 / 1024 / 1024).toFixed(2),
    totalMemory: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2),
    timestamp: new Date().toISOString()
  };
};

// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.end to track response time
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    const success = res.statusCode < 400;
    
    trackRequest(duration, success);
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Alert system for critical issues
const sendAlert = (level, message, data = {}) => {
  const alert = {
    level,
    message,
    data,
    timestamp: new Date().toISOString()
  };
  
  logger.error('System alert', alert);
  
  // In production, this would send alerts via email, Slack, etc.
  if (level === 'critical') {
    console.error('🚨 CRITICAL ALERT:', message, data);
  } else if (level === 'warning') {
    console.warn('⚠️ WARNING:', message, data);
  }
};

module.exports = {
  initializeMonitoring,
  trackRequest,
  setActiveConnections,
  getSystemStatus,
  performanceMiddleware,
  sendAlert
}; 
import { NextRequest, NextResponse } from 'next/server';
import { monitoringSystem } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    const healthChecks = monitoringSystem.getHealthChecks();
    const systemStatus = monitoringSystem.getSystemStatus();
    const activeAlerts = monitoringSystem.getSystemAlerts().filter(alert => !alert.resolved);
    
    // Calculate uptime percentage
    const healthyChecks = healthChecks.filter(check => check.status === 'healthy').length;
    const totalChecks = healthChecks.length;
    const uptimePercentage = totalChecks > 0 ? (healthyChecks / totalChecks) * 100 : 0;

    const healthResponse = {
      status: systemStatus,
      uptime: uptimePercentage.toFixed(2) + '%',
      timestamp: new Date().toISOString(),
      checks: healthChecks,
      alerts: activeAlerts.length,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    // Return appropriate HTTP status based on system health
    const statusCode = systemStatus === 'healthy' ? 200 : 
                      systemStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(healthResponse, { status: statusCode });

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    switch (action) {
      case 'start':
        await monitoringSystem.startMonitoring();
        return NextResponse.json({ 
          message: 'Monitoring started',
          timestamp: new Date().toISOString()
        });
        
      case 'stop':
        monitoringSystem.stopMonitoring();
        return NextResponse.json({ 
          message: 'Monitoring stopped',
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json({ 
          error: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Health check action error:', error);
    return NextResponse.json({ 
      error: 'Action failed' 
    }, { status: 500 });
  }
} 
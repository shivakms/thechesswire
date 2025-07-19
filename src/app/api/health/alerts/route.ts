import { NextRequest, NextResponse } from 'next/server';
import { monitoringSystem } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resolved = searchParams.get('resolved');
    const severity = searchParams.get('severity');
    
    let alerts = monitoringSystem.getSystemAlerts();
    
    // Filter by resolved status
    if (resolved === 'true') {
      alerts = alerts.filter(alert => alert.resolved);
    } else if (resolved === 'false') {
      alerts = alerts.filter(alert => !alert.resolved);
    }
    
    // Filter by severity
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }
    
    // Sort by timestamp (newest first)
    alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Limit to last 100 alerts
    alerts = alerts.slice(0, 100);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      total: alerts.length,
      alerts: alerts
    });

  } catch (error) {
    console.error('Alerts error:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve alerts' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { severity, title, message, category } = await request.json();
    
    if (!severity || !title || !message) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    await monitoringSystem.createAlert(severity, title, message, category || 'manual');
    
    return NextResponse.json({ 
      message: 'Alert created',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Alert creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create alert' 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { alertId, resolvedBy } = await request.json();
    
    if (!alertId || !resolvedBy) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    await monitoringSystem.resolveAlert(alertId, resolvedBy);
    
    return NextResponse.json({ 
      message: 'Alert resolved',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Alert resolution error:', error);
    return NextResponse.json({ 
      error: 'Failed to resolve alert' 
    }, { status: 500 });
  }
} 
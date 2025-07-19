import { NextRequest, NextResponse } from 'next/server';
import { monitoringSystem } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    const hours = parseInt(searchParams.get('hours') || '1');
    
    const metrics = monitoringSystem.getPerformanceMetrics();
    
    // Filter by metric if specified
    let filteredMetrics = metrics;
    if (metric) {
      filteredMetrics = metrics.filter(m => m.metric === metric);
    }
    
    // Filter by time range
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    filteredMetrics = filteredMetrics.filter(m => m.timestamp > cutoffTime);
    
    // Group by metric and calculate statistics
    const metricStats = filteredMetrics.reduce((acc, m) => {
      if (!acc[m.metric]) {
        acc[m.metric] = {
          metric: m.metric,
          count: 0,
          sum: 0,
          min: Infinity,
          max: -Infinity,
          values: []
        };
      }
      
      acc[m.metric].count++;
      acc[m.metric].sum += m.value;
      acc[m.metric].min = Math.min(acc[m.metric].min, m.value);
      acc[m.metric].max = Math.max(acc[m.metric].max, m.value);
      acc[m.metric].values.push(m.value);
      
      return acc;
    }, {} as Record<string, any>);
    
    // Calculate averages and percentiles
    const results = Object.values(metricStats).map((stat: any) => {
      const avg = stat.sum / stat.count;
      const sortedValues = stat.values.sort((a: number, b: number) => a - b);
      const p95Index = Math.floor(sortedValues.length * 0.95);
      const p99Index = Math.floor(sortedValues.length * 0.99);
      
      return {
        metric: stat.metric,
        count: stat.count,
        average: Math.round(avg * 100) / 100,
        min: stat.min,
        max: stat.max,
        p95: sortedValues[p95Index] || 0,
        p99: sortedValues[p99Index] || 0,
        lastValue: stat.values[stat.values.length - 1]
      };
    });
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      timeRange: `${hours} hours`,
      metrics: results
    });

  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve metrics' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { metric, value, tags } = await request.json();
    
    if (!metric || typeof value !== 'number') {
      return NextResponse.json({ 
        error: 'Invalid metric data' 
      }, { status: 400 });
    }
    
    monitoringSystem.recordPerformanceMetric(metric, value, tags || {});
    
    return NextResponse.json({ 
      message: 'Metric recorded',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Metric recording error:', error);
    return NextResponse.json({ 
      error: 'Failed to record metric' 
    }, { status: 500 });
  }
} 
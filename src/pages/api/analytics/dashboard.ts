import type { NextApiRequest, NextApiResponse } from 'next';
import { AnalyticsEngine } from '@/lib/analytics/AnalyticsEngine';
import { verifyAdminAuth } from '@/lib/auth/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const admin = await verifyAdminAuth(req);
    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const metrics = await AnalyticsEngine.getRealtimeMetrics();
    if (!metrics) {
      return res.status(500).json({ error: 'Failed to fetch metrics' });
    }

    return res.status(200).json(metrics);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

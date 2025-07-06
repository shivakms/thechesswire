import type { NextApiRequest, NextApiResponse } from 'next';
import { SubscriptionManager } from '@/lib/subscription/SubscriptionManager';
import { verifyAdminAuth } from '@/lib/auth/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { userId, plan, customerEmail } = req.body;

      if (!userId || !plan || !customerEmail) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const subscription = await SubscriptionManager.createSubscription(userId, plan, customerEmail);
      return res.status(201).json(subscription);
    }

    if (req.method === 'GET') {
      const admin = await verifyAdminAuth(req);
      if (!admin) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { userId } = req.query;
      
      if (userId) {
        const subscription = await SubscriptionManager.getUserSubscription(parseInt(userId as string));
        return res.status(200).json(subscription);
      }

      return res.status(400).json({ error: 'User ID required' });
    }

    if (req.method === 'PUT') {
      const admin = await verifyAdminAuth(req);
      if (!admin) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { userId, feature, amount } = req.body;
      
      if (!userId || !feature || amount === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await SubscriptionManager.trackUsage(userId, feature, amount);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Subscription management error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

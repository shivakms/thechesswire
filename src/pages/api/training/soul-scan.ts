import type { NextApiRequest, NextApiResponse } from 'next';
import { TrainingPipeline } from '@/lib/training/TrainingPipeline';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, gameHistory } = req.body;

    if (!userId || !gameHistory) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const soulScanResult = await TrainingPipeline.performSoulScan(userId, gameHistory);
    return res.status(201).json(soulScanResult);
  } catch (error) {
    console.error('Soul scan API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

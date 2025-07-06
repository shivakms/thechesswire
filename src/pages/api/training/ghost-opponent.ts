import type { NextApiRequest, NextApiResponse } from 'next';
import { TrainingPipeline } from '@/lib/training/TrainingPipeline';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { playerData } = req.body;

    if (!playerData) {
      return res.status(400).json({ error: 'Player data required' });
    }

    const ghostOpponent = await TrainingPipeline.createGhostOpponent(playerData);
    return res.status(201).json(ghostOpponent);
  } catch (error) {
    console.error('Ghost opponent creation API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

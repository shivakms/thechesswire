import type { NextApiRequest, NextApiResponse } from 'next';
import { TrainingPipeline } from '@/lib/training/TrainingPipeline';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { userId, skillLevel } = req.body;

      if (!userId || !skillLevel) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const coachingPlan = await TrainingPipeline.generateCoachingPlan(userId, skillLevel);
      return res.status(201).json(coachingPlan);
    }

    if (req.method === 'GET') {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const progress = await TrainingPipeline.getTrainingProgress(parseInt(userId as string));
      return res.status(200).json(progress);
    }

    if (req.method === 'PUT') {
      const { userId, exerciseId, completed, accuracy } = req.body;

      if (!userId || !exerciseId || completed === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await TrainingPipeline.updateExerciseProgress(userId, exerciseId, completed, accuracy);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Training coaching API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

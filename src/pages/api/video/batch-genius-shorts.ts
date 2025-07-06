import { NextApiRequest, NextApiResponse } from 'next';
import { SixtySecondsGenius } from '@/lib/video/SixtySecondsGenius';

const geniusGenerator = new SixtySecondsGenius();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pgnList, count = 5 } = req.body;

    if (!Array.isArray(pgnList) || pgnList.length === 0) {
      return res.status(400).json({ error: 'Valid PGN list is required' });
    }

    if (count > 10) {
      return res.status(400).json({ error: 'Maximum 10 shorts per batch' });
    }

    const shorts = await geniusGenerator.generateBatchShorts(pgnList, count);

    res.status(200).json({
      success: true,
      shorts,
      count: shorts.length,
      message: `Generated ${shorts.length} genius shorts successfully`
    });

  } catch (error) {
    console.error('Batch genius shorts generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate batch genius shorts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

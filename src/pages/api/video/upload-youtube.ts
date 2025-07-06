import { NextApiRequest, NextApiResponse } from 'next';
import { YouTubeUploader, YouTubeCredentials } from '@/lib/video/YouTubeUploader';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { documentaryId, uploadConfig } = req.body;

    if (!documentaryId || typeof documentaryId !== 'string') {
      return res.status(400).json({ error: 'Documentary ID is required' });
    }

    const credentials: YouTubeCredentials = {
      clientId: process.env.YOUTUBE_CLIENT_ID || '',
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET || '',
      refreshToken: process.env.YOUTUBE_REFRESH_TOKEN || '',
      accessToken: process.env.YOUTUBE_ACCESS_TOKEN || ''
    };

    const apiKey = process.env.YOUTUBE_API_KEY || '';

    if (!credentials.clientId || !credentials.clientSecret || !credentials.refreshToken || !apiKey) {
      return res.status(500).json({ 
        error: 'YouTube credentials not configured. Please set YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN, and YOUTUBE_API_KEY environment variables.' 
      });
    }

    const isValid = await YouTubeUploader.validateCredentials(credentials);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid YouTube credentials' });
    }

    const mockDocumentary = {
      id: documentaryId,
      title: uploadConfig?.title || 'Chess Documentary',
      description: uploadConfig?.description || 'An exciting chess game brought to life by Bambai AI',
      tags: uploadConfig?.tags || ['chess', 'bambai ai', 'documentary'],
      status: 'ready' as const,
      youtubeId: undefined
    };

    const uploader = new YouTubeUploader(credentials, apiKey);
    
    const videoFilePath = `/tmp/documentary_${documentaryId}.mp4`;
    
    const result = await uploader.uploadDocumentary(
      mockDocumentary,
      videoFilePath,
      {
        privacy: uploadConfig?.privacy || 'public',
        categoryId: uploadConfig?.categoryId || '22', // People & Blogs
        thumbnailPath: uploadConfig?.thumbnailPath
      }
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        result: {
          videoId: result.videoId,
          url: result.url,
          uploadTime: result.uploadTime
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Upload failed'
      });
    }

  } catch (error) {
    console.error('YouTube upload error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}

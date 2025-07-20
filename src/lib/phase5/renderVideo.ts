import axios from 'axios';
import logger from '@/lib/logger';
import { getDatabase } from './database/connection';
import { VoiceSynthesis, VideoRender, VideoRenderResult } from './types';
import { apiConfig, videoSettings } from './config';

class VideoRenderer {
  private db: any;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Render video using HeyGen API
   */
  async renderVideo(voice: VoiceSynthesis): Promise<VideoRenderResult> {
    const startTime = Date.now();

    try {
      logger.info(`🎬 Rendering video for voice: ${voice.id}`);

      // Create video render record
      const video: VideoRender = {
        id: this.generateId(),
        voiceId: voice.id,
        videoUrl: '',
        thumbnailUrl: '',
        duration: voice.duration,
        resolution: videoSettings.resolution,
        fileSize: 0,
        status: 'processing',
        timestamp: new Date()
      };

      // Save initial record
      await this.saveVideoRender(video);

      // Generate video using HeyGen
      const videoData = await this.generateVideoWithHeyGen(voice);

      // Update video record with results
      video.videoUrl = videoData.videoUrl;
      video.thumbnailUrl = videoData.thumbnailUrl;
      video.fileSize = videoData.fileSize;
      video.status = 'completed';

      // Update database
      await this.updateVideoRender(video);

      const processingTime = Date.now() - startTime;

      logger.info(`✅ Video rendering completed`, {
        videoId: video.id,
        duration: `${video.duration}s`,
        resolution: video.resolution,
        fileSize: `${(video.fileSize / 1024 / 1024).toFixed(2)}MB`,
        processingTime: `${processingTime}ms`
      });

      return {
        video,
        processingTime
      };

    } catch (error) {
      logger.error(`❌ Video rendering failed for voice ${voice.id}`, error);
      
      // Create failed video record
      const video: VideoRender = {
        id: this.generateId(),
        voiceId: voice.id,
        videoUrl: '',
        thumbnailUrl: '',
        duration: voice.duration,
        resolution: videoSettings.resolution,
        fileSize: 0,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      await this.saveVideoRender(video);
      throw error;
    }
  }

  /**
   * Generate video using HeyGen API
   */
  private async generateVideoWithHeyGen(voice: VoiceSynthesis): Promise<{
    videoUrl: string;
    thumbnailUrl: string;
    fileSize: number;
  }> {
    try {
      logger.info('Calling HeyGen API for video generation');

      // Step 1: Create video generation request
      const createResponse = await axios.post(
        'https://api.heygen.com/v1/video.create',
        {
          video_inputs: [
            {
              character: {
                type: 'avatar',
                avatar_id: apiConfig.heygen.avatarId,
                input_text: 'Bambai AI presenting chess analysis'
              },
              voice: {
                type: 'audio',
                audio_url: voice.audioUrl || 'placeholder', // Will be updated with actual audio
                voice_id: apiConfig.elevenlabs.voiceId
              },
              background: {
                type: 'image',
                image_url: this.getChessBackground()
              }
            }
          ],
          dimension: {
            width: 1920,
            height: 1080
          },
          aspect_ratio: '16:9',
          test: false
        },
        {
          headers: {
            'X-Api-Key': apiConfig.heygen.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 120000 // 2 minutes timeout
        }
      );

      if (createResponse.status !== 200) {
        throw new Error(`HeyGen API error: ${createResponse.status} ${createResponse.statusText}`);
      }

      const videoId = createResponse.data.data.video_id;
      logger.info(`HeyGen video creation initiated: ${videoId}`);

      // Step 2: Poll for video completion
      const videoData = await this.pollVideoCompletion(videoId);

      return {
        videoUrl: videoData.video_url,
        thumbnailUrl: videoData.thumbnail_url,
        fileSize: videoData.file_size || 0
      };

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('HeyGen API key is invalid');
        } else if (error.response?.status === 429) {
          throw new Error('HeyGen API rate limit exceeded');
        } else if (error.response?.status === 400) {
          throw new Error('Invalid request to HeyGen API');
        } else {
          throw new Error(`HeyGen API error: ${error.response?.status} ${error.response?.statusText}`);
        }
      }
      throw error;
    }
  }

  /**
   * Poll for video completion
   */
  private async pollVideoCompletion(videoId: string): Promise<any> {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(
          `https://api.heygen.com/v1/video.get?video_id=${videoId}`,
          {
            headers: {
              'X-Api-Key': apiConfig.heygen.apiKey
            },
            timeout: 10000
          }
        );

        const videoData = response.data.data;
        const status = videoData.status;

        logger.info(`Video status: ${status} (attempt ${attempts + 1}/${maxAttempts})`);

        if (status === 'completed') {
          return videoData;
        } else if (status === 'failed') {
          throw new Error(`Video generation failed: ${videoData.error_message || 'Unknown error'}`);
        }

        // Wait 5 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;

      } catch (error) {
        logger.error(`Error polling video status: ${error}`);
        attempts++;
        
        if (attempts >= maxAttempts) {
          throw new Error('Video generation timeout');
        }
      }
    }

    throw new Error('Video generation timeout');
  }

  /**
   * Get chess-themed background
   */
  private getChessBackground(): string {
    const backgrounds = [
      'https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=1920&h=1080&fit=crop',
      'https://images.unsplash.com/photo-1543092587-ded74c8cca7e?w=1920&h=1080&fit=crop',
      'https://images.unsplash.com/photo-1528819622764-d98b41dabb60?w=1920&h=1080&fit=crop'
    ];

    return backgrounds[Math.floor(Math.random() * backgrounds.length)];
  }

  /**
   * Save video render to database
   */
  private async saveVideoRender(video: VideoRender): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO video_renders (
          id, voice_id, video_url, thumbnail_url, duration, resolution, file_size, status, error, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        video.id, video.voiceId, video.videoUrl, video.thumbnailUrl,
        video.duration, video.resolution, video.fileSize, video.status,
        video.error, video.timestamp, video.timestamp
      ]);

      logger.info(`✅ Video render saved to database: ${video.id}`);

    } catch (error) {
      logger.error(`❌ Failed to save video render to database`, error);
      throw error;
    }
  }

  /**
   * Update video render
   */
  private async updateVideoRender(video: VideoRender): Promise<void> {
    try {
      await this.db.query(`
        UPDATE video_renders 
        SET video_url = $2, thumbnail_url = $3, file_size = $4, status = $5, error = $6, updated_at = $7
        WHERE id = $1
      `, [
        video.id, video.videoUrl, video.thumbnailUrl, video.fileSize,
        video.status, video.error, new Date()
      ]);

      logger.info(`✅ Video render updated: ${video.id}`);

    } catch (error) {
      logger.error(`❌ Failed to update video render`, error);
      throw error;
    }
  }

  /**
   * Get video render by ID
   */
  async getVideoRender(videoId: string): Promise<VideoRender | null> {
    try {
      const result = await this.db.query(`
        SELECT * FROM video_renders WHERE id = $1
      `, [videoId]);

      return result.rows[0] || null;

    } catch (error) {
      logger.error(`❌ Failed to get video render`, error);
      throw error;
    }
  }

  /**
   * Get video render by voice ID
   */
  async getVideoRenderByVoice(voiceId: string): Promise<VideoRender | null> {
    try {
      const result = await this.db.query(`
        SELECT * FROM video_renders WHERE voice_id = $1 ORDER BY created_at DESC LIMIT 1
      `, [voiceId]);

      return result.rows[0] || null;

    } catch (error) {
      logger.error(`❌ Failed to get video render by voice`, error);
      throw error;
    }
  }

  /**
   * Retry failed video render
   */
  async retryVideoRender(videoId: string): Promise<VideoRenderResult> {
    try {
      const video = await this.getVideoRender(videoId);
      if (!video) {
        throw new Error('Video render not found');
      }

      if (video.status !== 'failed') {
        throw new Error('Video render is not in failed status');
      }

      // Get voice
      const voiceResult = await this.db.query(`
        SELECT * FROM voice_synthesis WHERE id = $1
      `, [video.voiceId]);

      const voice = voiceResult.rows[0];
      if (!voice) {
        throw new Error('Voice synthesis not found');
      }

      // Update status to processing
      await this.updateVideoRender({
        ...video,
        status: 'processing'
      });

      // Retry rendering
      return await this.renderVideo(voice);

    } catch (error) {
      logger.error(`❌ Failed to retry video render`, error);
      throw error;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Export singleton instance
export const videoRenderer = new VideoRenderer();

// Export main function
export const renderVideo = (voice: VoiceSynthesis) => videoRenderer.renderVideo(voice); 
import logger from '@/lib/logger';
import { getDatabase } from './database/connection';
import { VideoRender, SocialPost, SocialPlatform } from './types';
import { pipelineConfig } from './config';

interface ScheduledPost {
  id: string;
  videoId: string;
  platform: SocialPlatform;
  scheduledTime: Date;
  status: 'scheduled' | 'published' | 'failed';
  videoUrl: string;
  metadata: any;
  createdAt: Date;
}

interface PlatformGuidelines {
  duration: {
    min: number;
    max: number;
  };
  format: string;
  aspectRatio: string;
  requirements: string[];
}

class SocialMediaScheduler {
  private db: any;
  private isRunning = false;
  private scheduleInterval: NodeJS.Timeout | null = null;

  // Platform-specific guidelines
  private platformGuidelines: Record<SocialPlatform, PlatformGuidelines> = {
    youtube: {
      duration: { min: 120, max: 180 }, // 2-3 minutes
      format: 'landscape',
      aspectRatio: '16:9',
      requirements: ['game overlay', 'full story', 'branding']
    },
    instagram: {
      duration: { min: 60, max: 90 }, // 60-90 seconds
      format: 'portrait',
      aspectRatio: '9:16',
      requirements: ['headline thumbnail', 'reels format', 'vertical crop']
    },
    twitter: {
      duration: { min: 30, max: 45 }, // 30-45 seconds
      format: 'landscape',
      aspectRatio: '16:9',
      requirements: ['bite-size', 'highlight cut', 'auto-trim']
    },
    reddit: {
      duration: { min: 0, max: 0 }, // No video for Reddit
      format: 'text',
      aspectRatio: 'N/A',
      requirements: ['text summary', 'thumbnail', 'PGN link']
    }
  };

  // Daily schedule (UTC times)
  private dailySchedule = [
    { time: '09:00', name: 'Morning Drop' },
    { time: '14:00', name: 'Midday Insight' },
    { time: '19:00', name: 'Evening Wrap-up' }
  ];

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Initialize the scheduler
   */
  async initialize(): Promise<void> {
    try {
      logger.info('⏰ Initializing Social Media Scheduler');

      // Create scheduler table if it doesn't exist
      await this.createSchedulerTable();

      // Start the scheduler
      await this.startScheduler();

      logger.info('✅ Social Media Scheduler initialized successfully');

    } catch (error) {
      logger.error('❌ Failed to initialize scheduler', error);
      throw error;
    }
  }

  /**
   * Start the scheduler
   */
  private async startScheduler(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Scheduler is already running');
      return;
    }

    this.isRunning = true;

    // Check every minute for scheduled posts
    this.scheduleInterval = setInterval(async () => {
      await this.processScheduledPosts();
    }, 60000); // 1 minute

    logger.info('✅ Scheduler started - checking every minute');
  }

  /**
   * Stop the scheduler
   */
  async stopScheduler(): Promise<void> {
    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
    }
    this.isRunning = false;
    logger.info('🛑 Scheduler stopped');
  }

  /**
   * Schedule a video for posting
   */
  async scheduleVideo(video: VideoRender, metadata: any): Promise<ScheduledPost[]> {
    try {
      logger.info(`📅 Scheduling video for posting: ${video.id}`);

      const scheduledPosts: ScheduledPost[] = [];

      // Get next available time slots
      const timeSlots = this.getNextTimeSlots();

      for (let i = 0; i < Math.min(timeSlots.length, 3); i++) {
        const timeSlot = timeSlots[i];
        
        // Create platform-specific versions
        const platforms: SocialPlatform[] = ['youtube', 'instagram', 'twitter'];
        
        for (const platform of platforms) {
          const guidelines = this.platformGuidelines[platform];
          
          // Create platform-specific video version
          const platformVideo = await this.createPlatformVersion(video, platform, guidelines);
          
          const scheduledPost: ScheduledPost = {
            id: this.generateId(),
            videoId: video.id,
            platform,
            scheduledTime: timeSlot.time,
            status: 'scheduled',
            videoUrl: platformVideo.url,
            metadata: {
              ...metadata,
              platform,
              guidelines,
              originalDuration: video.duration,
              platformDuration: platformVideo.duration
            },
            createdAt: new Date()
          };

          // Save to database
          await this.saveScheduledPost(scheduledPost);
          scheduledPosts.push(scheduledPost);

          logger.info(`📅 Scheduled ${platform} post for ${timeSlot.name} (${timeSlot.time.toISOString()})`);
        }
      }

      return scheduledPosts;

    } catch (error) {
      logger.error(`❌ Failed to schedule video ${video.id}`, error);
      throw error;
    }
  }

  /**
   * Process scheduled posts
   */
  private async processScheduledPosts(): Promise<void> {
    try {
      const now = new Date();
      const scheduledPosts = await this.getScheduledPosts(now);

      for (const post of scheduledPosts) {
        try {
          await this.publishScheduledPost(post);
        } catch (error) {
          logger.error(`❌ Failed to publish scheduled post ${post.id}`, error);
          
          // Mark as failed
          await this.updateScheduledPost(post.id, {
            status: 'failed'
          });
        }
      }

    } catch (error) {
      logger.error('❌ Failed to process scheduled posts', error);
    }
  }

  /**
   * Publish a scheduled post
   */
  private async publishScheduledPost(post: ScheduledPost): Promise<void> {
    try {
      logger.info(`📤 Publishing scheduled post: ${post.id} to ${post.platform}`);

      // Import publishing module
      const { publishToSocial } = await import('./publishToSocial');
      
      // Create video object for publishing
      const videoForPublishing: VideoRender = {
        id: post.videoId,
        voiceId: '', // Not needed for publishing
        videoUrl: post.videoUrl,
        thumbnailUrl: '',
        duration: post.metadata.platformDuration,
        resolution: '1080p',
        fileSize: 0,
        status: 'completed',
        timestamp: new Date()
      };

      // Publish to specific platform
      const result = await publishToSocial(videoForPublishing, post.metadata);

      // Find the published post
      const publishedPost = result.posts.find(p => p.platform === post.platform);
      
      if (publishedPost && publishedPost.status === 'published') {
        await this.updateScheduledPost(post.id, {
          status: 'published',
          metadata: {
            ...post.metadata,
            publishedAt: new Date(),
            postId: publishedPost.postId,
            url: publishedPost.url
          }
        });

        logger.info(`✅ Successfully published scheduled post ${post.id} to ${post.platform}`);
      } else {
        throw new Error(`Failed to publish to ${post.platform}`);
      }

    } catch (error) {
      logger.error(`❌ Failed to publish scheduled post ${post.id}`, error);
      throw error;
    }
  }

  /**
   * Create platform-specific video version
   */
  private async createPlatformVersion(
    video: VideoRender, 
    platform: SocialPlatform, 
    guidelines: PlatformGuidelines
  ): Promise<{ url: string; duration: number }> {
    try {
      // For now, return the original video
      // In production, this would call video processing APIs
      let duration = video.duration;

      // Adjust duration based on platform guidelines
      if (duration < guidelines.duration.min) {
        duration = guidelines.duration.min;
      } else if (duration > guidelines.duration.max) {
        duration = guidelines.duration.max;
      }

      return {
        url: video.videoUrl,
        duration
      };

    } catch (error) {
      logger.error(`❌ Failed to create platform version for ${platform}`, error);
      throw error;
    }
  }

  /**
   * Get next available time slots
   */
  private getNextTimeSlots(): Array<{ time: Date; name: string }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const slots: Array<{ time: Date; name: string }> = [];

    for (const schedule of this.dailySchedule) {
      const [hours, minutes] = schedule.time.split(':').map(Number);
      const slotTime = new Date(today);
      slotTime.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (slotTime <= now) {
        slotTime.setDate(slotTime.getDate() + 1);
      }

      slots.push({
        time: slotTime,
        name: schedule.name
      });
    }

    return slots.sort((a, b) => a.time.getTime() - b.time.getTime());
  }

  /**
   * Get scheduled posts for a specific time
   */
  private async getScheduledPosts(targetTime: Date): Promise<ScheduledPost[]> {
    try {
      const result = await this.db.query(`
        SELECT * FROM scheduled_posts 
        WHERE status = 'scheduled' 
        AND scheduled_time <= $1
        ORDER BY scheduled_time ASC
      `, [targetTime]);

      return result.rows;

    } catch (error) {
      logger.error('❌ Failed to get scheduled posts', error);
      return [];
    }
  }

  /**
   * Save scheduled post to database
   */
  private async saveScheduledPost(post: ScheduledPost): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO scheduled_posts (
          id, video_id, platform, scheduled_time, status, video_url, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        post.id, post.videoId, post.platform, post.scheduledTime,
        post.status, post.videoUrl, JSON.stringify(post.metadata), post.createdAt
      ]);

      logger.info(`✅ Scheduled post saved: ${post.id}`);

    } catch (error) {
      logger.error(`❌ Failed to save scheduled post`, error);
      throw error;
    }
  }

  /**
   * Update scheduled post
   */
  private async updateScheduledPost(postId: string, updates: Partial<ScheduledPost>): Promise<void> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [postId];

      if (updates.status !== undefined) {
        updateFields.push('status = $2');
        params.push(updates.status);
      }

      if (updates.metadata !== undefined) {
        updateFields.push('metadata = $3');
        params.push(JSON.stringify(updates.metadata));
      }

      if (updateFields.length > 0) {
        await this.db.query(`
          UPDATE scheduled_posts 
          SET ${updateFields.join(', ')}
          WHERE id = $1
        `, params);

        logger.info(`✅ Scheduled post updated: ${postId}`);
      }

    } catch (error) {
      logger.error(`❌ Failed to update scheduled post`, error);
      throw error;
    }
  }

  /**
   * Create scheduler table
   */
  private async createSchedulerTable(): Promise<void> {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS scheduled_posts (
          id VARCHAR(50) PRIMARY KEY,
          video_id VARCHAR(50) NOT NULL,
          platform VARCHAR(20) NOT NULL,
          scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
          video_url TEXT,
          metadata JSONB,
          error TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create indexes
      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_scheduled_posts_time 
        ON scheduled_posts(scheduled_time)
      `);

      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status 
        ON scheduled_posts(status)
      `);

      logger.info('✅ Scheduler table created successfully');

    } catch (error) {
      logger.error('❌ Failed to create scheduler table', error);
      throw error;
    }
  }

  /**
   * Get scheduler status
   */
  async getStatus(): Promise<{
    isRunning: boolean;
    nextScheduledPosts: ScheduledPost[];
    dailySchedule: Array<{ time: string; name: string }>;
  }> {
    try {
      const nextSlots = this.getNextTimeSlots();
      const nextPosts = await this.getScheduledPosts(nextSlots[0]?.time || new Date());

      return {
        isRunning: this.isRunning,
        nextScheduledPosts: nextPosts,
        dailySchedule: this.dailySchedule
      };

    } catch (error) {
      logger.error('❌ Failed to get scheduler status', error);
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
export const socialMediaScheduler = new SocialMediaScheduler();

// Export main functions
export const initializeScheduler = () => socialMediaScheduler.initialize();
export const scheduleVideo = (video: VideoRender, metadata: any) => 
  socialMediaScheduler.scheduleVideo(video, metadata);
export const getSchedulerStatus = () => socialMediaScheduler.getStatus();
export const stopScheduler = () => socialMediaScheduler.stopScheduler(); 
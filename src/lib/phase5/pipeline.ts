import logger from '@/lib/logger';
import { initializeConfig, pipelineConfig, apiConfig } from './config';
import { initializeDatabase } from './database/connection';
import { fetchStories } from './fetchStories';
import { generateNarrative } from './generateNarrative';
import { synthesizeVoice } from './synthesizeVoice';
import { renderVideo } from './renderVideo';
import { generateThumbnail } from './generateThumbnail';
import { publishToSocial } from './publishToSocial';
import { logActivity, logProcessingResult } from './logActivity';
import { retryWithBackoff, withPerformanceMonitoring, validateEnvironment } from './utils';
import { ChessStory, NarrativeScript, VoiceSynthesis, VideoRender, ContentLog } from './types';

class BambaiAIPipeline {
  private isRunning = false;
  private db: any;
  private scheduler: any;
  private interactionBot: any;

  constructor() {
    this.db = null;
    this.scheduler = null;
    this.interactionBot = null;
  }

  /**
   * Initialize the pipeline
   */
  async initialize(): Promise<void> {
    try {
      logger.info('🚀 Initializing Bambai AI Publishing Pipeline');

      // Validate environment
      validateEnvironment();

      // Initialize configuration
      initializeConfig();

      // Initialize database
      this.db = await initializeDatabase(apiConfig.database);

      // Test database connection
      const dbConnected = await this.db.testConnection();
      if (!dbConnected) {
        throw new Error('Database connection failed');
      }

      // Initialize scheduler
      const { initializeScheduler } = await import('./scheduler');
      this.scheduler = await initializeScheduler();

      // Initialize interaction bot
      const { initializeInteractionBot } = await import('./interactionBot');
      this.interactionBot = await initializeInteractionBot();

      logger.info('✅ Pipeline initialized successfully');

    } catch (error) {
      logger.error('❌ Pipeline initialization failed', error);
      throw error;
    }
  }

  /**
   * Run the complete pipeline
   */
  async runPipeline(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Pipeline is already running');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('🎯 Starting Bambai AI Publishing Pipeline');

      // Step 1: Fetch Stories
      const storyFetchResult = await withPerformanceMonitoring(
        () => fetchStories(),
        'Story Fetching'
      )();

      if (storyFetchResult.stories.length === 0) {
        logger.info('No new stories found, pipeline complete');
        return;
      }

      logger.info(`📰 Found ${storyFetchResult.stories.length} stories to process`);

      // Process each story through the pipeline
      for (const story of storyFetchResult.stories.slice(0, pipelineConfig.maxStoriesPerRun)) {
        try {
          await this.processStory(story);
        } catch (error) {
          logger.error(`❌ Failed to process story ${story.id}`, error);
          continue; // Continue with next story
        }
      }

      const totalTime = Date.now() - startTime;
      logger.info(`✅ Pipeline completed successfully in ${totalTime}ms`);

    } catch (error) {
      logger.error('❌ Pipeline execution failed', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Process a single story through the complete pipeline
   */
  private async processStory(story: ChessStory): Promise<void> {
    const startTime = Date.now();
    let contentLog: ContentLog | null = null;

    try {
      logger.info(`📖 Processing story: ${story.title}`);

      // Create initial content log
      contentLog = await logActivity({
        storyId: story.id,
        status: 'processing'
      });

      // Step 1: Generate Narrative
      const narrativeResult = await withPerformanceMonitoring(
        () => generateNarrative(story),
        'Narrative Generation'
      )();

      await logProcessingResult('narrative_generation', {
        success: true,
        duration: narrativeResult.processingTime,
        retries: 0
      });

      // Update content log with narrative ID
      await this.updateContentLog(contentLog.id, {
        narrativeId: narrativeResult.narrative.id
      });

      // Step 2: Synthesize Voice
      const voiceResult = await withPerformanceMonitoring(
        () => synthesizeVoice(narrativeResult.narrative),
        'Voice Synthesis'
      )();

      await logProcessingResult('voice_synthesis', {
        success: true,
        duration: voiceResult.processingTime,
        retries: 0
      });

      // Update content log with voice ID
      await this.updateContentLog(contentLog.id, {
        voiceId: voiceResult.voice.id
      });

      // Step 3: Render Video
      const videoResult = await withPerformanceMonitoring(
        () => renderVideo(voiceResult.voice),
        'Video Rendering'
      )();

      await logProcessingResult('video_rendering', {
        success: true,
        duration: videoResult.processingTime,
        retries: 0
      });

      // Update content log with video ID
      await this.updateContentLog(contentLog.id, {
        videoId: videoResult.video.id
      });

      // Step 4: Generate Thumbnail and Metadata
      const thumbnailResult = await withPerformanceMonitoring(
        () => generateThumbnail(videoResult.video, story, narrativeResult.narrative),
        'Thumbnail Generation'
      )();

      // Update content log with thumbnail ID
      await this.updateContentLog(contentLog.id, {
        thumbnailId: thumbnailResult.id
      });

      // Step 5: Schedule for Social Media (instead of immediate publishing)
      if (pipelineConfig.enableAutoPublish) {
        const { scheduleVideo } = await import('./scheduler');
        const scheduledPosts = await withPerformanceMonitoring(
          () => scheduleVideo(videoResult.video, thumbnailResult),
          'Video Scheduling'
        )();

        await logProcessingResult('video_scheduling', {
          success: scheduledPosts.length > 0,
          duration: 0,
          retries: 0,
          data: {
            scheduled: scheduledPosts.length,
            platforms: scheduledPosts.map(p => p.platform)
          }
        });

        logger.info(`📅 Scheduled ${scheduledPosts.length} posts for social media`);
      }

      // Mark as completed
      const processingTime = Date.now() - startTime;
      await this.updateContentLog(contentLog.id, {
        status: 'completed',
        processingTime
      });

      logger.info(`✅ Story processed successfully: ${story.title} (${processingTime}ms)`);

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      await logProcessingResult('story_processing', {
        success: false,
        duration: processingTime,
        retries: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (contentLog) {
        await this.updateContentLog(contentLog.id, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime
        });
      }

      throw error;
    }
  }

  /**
   * Update content log
   */
  private async updateContentLog(contentLogId: string, updates: Partial<ContentLog>): Promise<void> {
    const { updateContentLog } = await import('./logActivity');
    await updateContentLog(contentLogId, updates);
  }

  /**
   * Get pipeline status
   */
  async getStatus(): Promise<{
    isRunning: boolean;
    stats: any;
    health: any;
    scheduler: any;
    interactionBot: any;
  }> {
    try {
      const { getPipelineStats } = await import('./logActivity');
      const { healthCheck } = await import('./utils');
      const { getSchedulerStatus } = await import('./scheduler');
      const { getInteractionBotStatus } = await import('./interactionBot');
      
      const stats = await getPipelineStats();
      const health = await healthCheck();
      const schedulerStatus = await getSchedulerStatus();
      const interactionBotStatus = await getInteractionBotStatus();

      return {
        isRunning: this.isRunning,
        stats,
        health,
        scheduler: schedulerStatus,
        interactionBot: interactionBotStatus
      };

    } catch (error) {
      logger.error('Failed to get pipeline status', error);
      throw error;
    }
  }

  /**
   * Stop the pipeline
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    
    // Stop scheduler
    if (this.scheduler) {
      const { stopScheduler } = await import('./scheduler');
      await stopScheduler();
    }

    // Stop interaction bot
    if (this.interactionBot) {
      const { stopInteractionBot } = await import('./interactionBot');
      await stopInteractionBot();
    }

    logger.info('🛑 Pipeline stop requested');
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.db) {
        await this.db.close();
      }
      
      const { cleanup } = await import('./utils');
      await cleanup();
      
      logger.info('✅ Pipeline cleanup completed');
    } catch (error) {
      logger.error('❌ Pipeline cleanup failed', error);
    }
  }

  /**
   * Get scheduler status
   */
  async getSchedulerStatus(): Promise<any> {
    try {
      const { getSchedulerStatus } = await import('./scheduler');
      return await getSchedulerStatus();
    } catch (error) {
      logger.error('Failed to get scheduler status', error);
      return null;
    }
  }

  /**
   * Get interaction bot status
   */
  async getInteractionBotStatus(): Promise<any> {
    try {
      const { getInteractionBotStatus } = await import('./interactionBot');
      return await getInteractionBotStatus();
    } catch (error) {
      logger.error('Failed to get interaction bot status', error);
      return null;
    }
  }
}

// Export singleton instance
export const bambaiAIPipeline = new BambaiAIPipeline();

// Export main function
export const runPipeline = () => bambaiAIPipeline.runPipeline();

// Export initialization function
export const initializePipeline = () => bambaiAIPipeline.initialize();

// Export status function
export const getPipelineStatus = () => bambaiAIPipeline.getStatus();

// Export stop function
export const stopPipeline = () => bambaiAIPipeline.stop();

// Export cleanup function
export const cleanupPipeline = () => bambaiAIPipeline.cleanup(); 
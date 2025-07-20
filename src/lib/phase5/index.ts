/**
 * Phase 5: Bambai AI Autonomous Publishing Pipeline
 * TheChessWire.news - Main Entry Point
 * 
 * This module provides the complete autonomous AI publishing pipeline
 * that enables Bambai AI to generate, narrate, render, and publish
 * chess content across YouTube, Instagram, X, and Reddit with zero
 * human intervention.
 * 
 * NEW FEATURES:
 * - Social Media Scheduling (3 videos per day at 09:00, 14:00, 19:00 UTC)
 * - Platform-specific video formatting (YouTube, Instagram, Twitter)
 * - Social Media Interaction Bot (monitors and responds to comments)
 */

import logger from '@/lib/logger';

// Import pipeline functions
import {
  runPipeline,
  initializePipeline,
  getPipelineStatus,
  stopPipeline,
  cleanupPipeline,
  bambaiAIPipeline
} from './pipeline';

// Export all main pipeline functions
export {
  // Pipeline orchestration
  runPipeline,
  initializePipeline,
  getPipelineStatus,
  stopPipeline,
  cleanupPipeline,
  bambaiAIPipeline
} from './pipeline';

// Export individual modules
export {
  fetchStories,
  storyFetcher
} from './fetchStories';

export {
  generateNarrative,
  narrativeGenerator
} from './generateNarrative';

export {
  synthesizeVoice,
  voiceSynthesizer
} from './synthesizeVoice';

export {
  renderVideo,
  videoRenderer
} from './renderVideo';

export {
  generateThumbnail,
  thumbnailGenerator
} from './generateThumbnail';

export {
  publishToSocial,
  socialPublisher
} from './publishToSocial';

export {
  logActivity,
  logProcessingResult,
  activityLogger
} from './logActivity';

// Export NEW scheduler module
export {
  initializeScheduler,
  scheduleVideo,
  getSchedulerStatus,
  stopScheduler,
  socialMediaScheduler
} from './scheduler';

// Export NEW interaction bot module
export {
  initializeInteractionBot,
  getInteractionBotStatus,
  stopInteractionBot,
  socialMediaInteractionBot
} from './interactionBot';

// Export utilities
export {
  retryWithBackoff,
  RateLimiter,
  generateId,
  generateHash,
  isValidUrl,
  sanitizeText,
  extractPGN,
  calculateTextDuration,
  formatDuration,
  formatFileSize,
  sleep,
  processBatch,
  withErrorHandling,
  withPerformanceMonitoring,
  validateEnvironment,
  healthCheck,
  getMemoryUsage,
  logMemoryUsage,
  cleanup
} from './utils';

// Export types
export type {
  ChessStory,
  StorySource,
  NarrativeScript,
  VoiceSynthesis,
  VideoRender,
  ThumbnailMetadata,
  SocialPost,
  SocialPlatform,
  ContentLog,
  APIConfig,
  PipelineConfig,
  ProcessingResult,
  StoryFetchResult,
  NarrativeGenerationResult,
  VoiceSynthesisResult,
  VideoRenderResult,
  PublishingResult
} from './types';

// Export configuration
export {
  apiConfig,
  pipelineConfig,
  storySources,
  voiceSettings,
  videoSettings,
  socialTemplates,
  initializeConfig
} from './config';

// Export database utilities
export {
  getDatabase,
  initializeDatabase,
  testDatabaseConnection,
  getDatabaseStats
} from './database/connection';

/**
 * Main pipeline execution function
 * This is the primary entry point for running the complete pipeline
 */
export async function executePipeline(): Promise<void> {
  try {
    logger.info('🚀 Starting Bambai AI Autonomous Publishing Pipeline');

    // Initialize the pipeline
    await initializePipeline();

    // Run the pipeline
    await runPipeline();

    logger.info('✅ Pipeline execution completed successfully');

  } catch (error) {
    logger.error('❌ Pipeline execution failed', error);
    throw error;
  }
}

/**
 * Scheduled pipeline execution
 * Runs the pipeline on a schedule (e.g., every 6 hours)
 */
export function startScheduledPipeline(intervalHours: number = 6): void {
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  logger.info(`⏰ Starting scheduled pipeline execution every ${intervalHours} hours`);

  // Run immediately
  executePipeline().catch(error => {
    logger.error('Initial pipeline execution failed', error);
  });

  // Schedule recurring execution
  setInterval(() => {
    executePipeline().catch(error => {
      logger.error('Scheduled pipeline execution failed', error);
    });
  }, intervalMs);
}

/**
 * Health check endpoint
 * Returns the current health status of the pipeline
 */
export async function getHealthStatus(): Promise<{
  status: 'healthy' | 'unhealthy';
  pipeline: {
    isRunning: boolean;
    stats: any;
  };
  scheduler: any;
  interactionBot: any;
  system: {
    memory: any;
    health: any;
  };
  timestamp: Date;
}> {
  try {
    const { getPipelineStatus } = await import('./pipeline');
    const { healthCheck, getMemoryUsage } = await import('./utils');

    const pipelineStatus = await getPipelineStatus();
    const systemHealth = await healthCheck();
    const memoryUsage = getMemoryUsage();

    return {
      status: systemHealth.status,
      pipeline: {
        isRunning: pipelineStatus.isRunning,
        stats: pipelineStatus.stats
      },
      scheduler: pipelineStatus.scheduler,
      interactionBot: pipelineStatus.interactionBot,
      system: {
        memory: memoryUsage,
        health: systemHealth
      },
      timestamp: new Date()
    };

  } catch (error) {
    logger.error('Health check failed', error);
    return {
      status: 'unhealthy',
      pipeline: {
        isRunning: false,
        stats: {}
      },
      scheduler: null,
      interactionBot: null,
      system: {
        memory: {},
        health: { status: 'unhealthy', checks: {} }
      },
      timestamp: new Date()
    };
  }
}

/**
 * Graceful shutdown handler
 * Ensures proper cleanup when the application is shutting down
 */
export async function gracefulShutdown(): Promise<void> {
  logger.info('🛑 Initiating graceful shutdown');

  try {
    // Stop the pipeline if running
    await stopPipeline();

    // Cleanup resources
    await cleanupPipeline();

    logger.info('✅ Graceful shutdown completed');

  } catch (error) {
    logger.error('❌ Graceful shutdown failed', error);
  }
}

/**
 * NEW: Get comprehensive system status
 * Returns status of pipeline, scheduler, and interaction bot
 */
export async function getSystemStatus(): Promise<{
  pipeline: any;
  scheduler: any;
  interactionBot: any;
  timestamp: Date;
}> {
  try {
    const pipelineStatus = await getPipelineStatus();
    
    return {
      pipeline: {
        isRunning: pipelineStatus.isRunning,
        stats: pipelineStatus.stats,
        health: pipelineStatus.health
      },
      scheduler: pipelineStatus.scheduler,
      interactionBot: pipelineStatus.interactionBot,
      timestamp: new Date()
    };

  } catch (error) {
    logger.error('Failed to get system status', error);
    throw error;
  }
}

// Set up graceful shutdown handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Export default function for easy import
export default {
  executePipeline,
  startScheduledPipeline,
  getHealthStatus,
  getSystemStatus,
  gracefulShutdown,
  runPipeline,
  initializePipeline,
  getPipelineStatus,
  stopPipeline,
  cleanupPipeline,
  // NEW: Scheduler functions
  initializeScheduler: () => import('./scheduler').then(m => m.initializeScheduler()),
  scheduleVideo: (video: any, metadata: any) => import('./scheduler').then(m => m.scheduleVideo(video, metadata)),
  getSchedulerStatus: () => import('./scheduler').then(m => m.getSchedulerStatus()),
  stopScheduler: () => import('./scheduler').then(m => m.stopScheduler()),
  // NEW: Interaction bot functions
  initializeInteractionBot: () => import('./interactionBot').then(m => m.initializeInteractionBot()),
  getInteractionBotStatus: () => import('./interactionBot').then(m => m.getInteractionBotStatus()),
  stopInteractionBot: () => import('./interactionBot').then(m => m.stopInteractionBot())
};

// Log module initialization
logger.info('✅ Phase 5: Bambai AI Autonomous Publishing Pipeline module loaded with NEW scheduler and interaction bot features'); 
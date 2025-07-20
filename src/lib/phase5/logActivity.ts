import logger from '@/lib/logger';
import { getDatabase } from './database/connection';
import { ContentLog, ProcessingResult } from './types';

class ActivityLogger {
  private db: any;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Log content processing activity
   */
  async logActivity(contentLog: Partial<ContentLog>): Promise<ContentLog> {
    try {
      const fullContentLog: ContentLog = {
        id: this.generateId(),
        storyId: contentLog.storyId!,
        narrativeId: contentLog.narrativeId,
        voiceId: contentLog.voiceId,
        videoId: contentLog.videoId,
        thumbnailId: contentLog.thumbnailId,
        socialPosts: contentLog.socialPosts || [],
        status: contentLog.status || 'processing',
        error: contentLog.error,
        processingTime: contentLog.processingTime || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.saveContentLog(fullContentLog);

      logger.info(`✅ Activity logged`, {
        contentLogId: fullContentLog.id,
        storyId: fullContentLog.storyId,
        status: fullContentLog.status,
        processingTime: fullContentLog.processingTime
      });

      return fullContentLog;

    } catch (error) {
      logger.error(`❌ Failed to log activity`, error);
      throw error;
    }
  }

  /**
   * Update content log
   */
  async updateContentLog(contentLogId: string, updates: Partial<ContentLog>): Promise<void> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [contentLogId];

      if (updates.narrativeId !== undefined) {
        updateFields.push('narrative_id = $' + (params.length + 1));
        params.push(updates.narrativeId);
      }

      if (updates.voiceId !== undefined) {
        updateFields.push('voice_id = $' + (params.length + 1));
        params.push(updates.voiceId);
      }

      if (updates.videoId !== undefined) {
        updateFields.push('video_id = $' + (params.length + 1));
        params.push(updates.videoId);
      }

      if (updates.thumbnailId !== undefined) {
        updateFields.push('thumbnail_id = $' + (params.length + 1));
        params.push(updates.thumbnailId);
      }

      if (updates.status !== undefined) {
        updateFields.push('status = $' + (params.length + 1));
        params.push(updates.status);
      }

      if (updates.error !== undefined) {
        updateFields.push('error = $' + (params.length + 1));
        params.push(updates.error);
      }

      if (updates.processingTime !== undefined) {
        updateFields.push('processing_time = $' + (params.length + 1));
        params.push(updates.processingTime);
      }

      updateFields.push('updated_at = $' + (params.length + 1));
      params.push(new Date());

      if (updateFields.length > 1) { // More than just updated_at
        await this.db.query(`
          UPDATE content_logs 
          SET ${updateFields.join(', ')}
          WHERE id = $1
        `, params);

        logger.info(`✅ Content log updated: ${contentLogId}`);
      }

    } catch (error) {
      logger.error(`❌ Failed to update content log`, error);
      throw error;
    }
  }

  /**
   * Log processing result
   */
  async logProcessingResult(operation: string, result: ProcessingResult): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO performance_metrics (
          operation, duration_ms, success, error_message, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        operation,
        result.duration,
        result.success,
        result.error,
        JSON.stringify(result.data || {}),
        new Date()
      ]);

      logger.info(`✅ Processing result logged`, {
        operation,
        duration: result.duration,
        success: result.success,
        retries: result.retries
      });

    } catch (error) {
      logger.error(`❌ Failed to log processing result`, error);
      throw error;
    }
  }

  /**
   * Get content log by ID
   */
  async getContentLog(contentLogId: string): Promise<ContentLog | null> {
    try {
      const result = await this.db.query(`
        SELECT * FROM content_logs WHERE id = $1
      `, [contentLogId]);

      return result.rows[0] || null;

    } catch (error) {
      logger.error(`❌ Failed to get content log`, error);
      throw error;
    }
  }

  /**
   * Get content logs by status
   */
  async getContentLogsByStatus(status: string, limit: number = 10): Promise<ContentLog[]> {
    try {
      const result = await this.db.query(`
        SELECT * FROM content_logs 
        WHERE status = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `, [status, limit]);

      return result.rows;

    } catch (error) {
      logger.error(`❌ Failed to get content logs by status`, error);
      throw error;
    }
  }

  /**
   * Get recent content logs
   */
  async getRecentContentLogs(limit: number = 20): Promise<ContentLog[]> {
    try {
      const result = await this.db.query(`
        SELECT * FROM content_logs 
        ORDER BY created_at DESC 
        LIMIT $1
      `, [limit]);

      return result.rows;

    } catch (error) {
      logger.error(`❌ Failed to get recent content logs`, error);
      throw error;
    }
  }

  /**
   * Get content pipeline statistics
   */
  async getPipelineStats(): Promise<{
    total: number;
    processing: number;
    completed: number;
    failed: number;
    averageProcessingTime: number;
    successRate: number;
  }> {
    try {
      const result = await this.db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          AVG(processing_time) as avg_processing_time
        FROM content_logs
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `);

      const stats = result.rows[0];
      const total = parseInt(stats.total);
      const completed = parseInt(stats.completed);
      const successRate = total > 0 ? (completed / total) * 100 : 0;

      return {
        total,
        processing: parseInt(stats.processing),
        completed,
        failed: parseInt(stats.failed),
        averageProcessingTime: Math.round(parseFloat(stats.avg_processing_time) || 0),
        successRate: Math.round(successRate)
      };

    } catch (error) {
      logger.error(`❌ Failed to get pipeline statistics`, error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(operation?: string, hours: number = 24): Promise<any[]> {
    try {
      let query = `
        SELECT operation, AVG(duration_ms) as avg_duration, 
               COUNT(*) as total_operations, 
               COUNT(CASE WHEN success = true THEN 1 END) as successful_operations
        FROM performance_metrics 
        WHERE created_at > NOW() - INTERVAL '${hours} hours'
      `;

      const params: any[] = [];

      if (operation) {
        query += ' AND operation = $1';
        params.push(operation);
      }

      query += ' GROUP BY operation ORDER BY avg_duration DESC';

      const result = await this.db.query(query, params);
      return result.rows;

    } catch (error) {
      logger.error(`❌ Failed to get performance metrics`, error);
      throw error;
    }
  }

  /**
   * Clean old logs
   */
  async cleanOldLogs(days: number = 30): Promise<void> {
    try {
      const result = await this.db.query(`
        DELETE FROM content_logs 
        WHERE created_at < NOW() - INTERVAL '${days} days'
        AND status IN ('completed', 'failed')
      `);

      logger.info(`✅ Cleaned ${result.rowCount} old content logs`);

    } catch (error) {
      logger.error(`❌ Failed to clean old logs`, error);
      throw error;
    }
  }

  /**
   * Save content log to database
   */
  private async saveContentLog(contentLog: ContentLog): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO content_logs (
          id, story_id, narrative_id, voice_id, video_id, thumbnail_id,
          social_posts, status, error, processing_time, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        contentLog.id, contentLog.storyId, contentLog.narrativeId,
        contentLog.voiceId, contentLog.videoId, contentLog.thumbnailId,
        contentLog.socialPosts, contentLog.status, contentLog.error,
        contentLog.processingTime, contentLog.createdAt, contentLog.updatedAt
      ]);

      logger.info(`✅ Content log saved to database: ${contentLog.id}`);

    } catch (error) {
      logger.error(`❌ Failed to save content log to database`, error);
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
export const activityLogger = new ActivityLogger();

// Export main functions
export const logActivity = (contentLog: Partial<ContentLog>) => activityLogger.logActivity(contentLog);
export const logProcessingResult = (operation: string, result: ProcessingResult) => 
  activityLogger.logProcessingResult(operation, result);
export const updateContentLog = (contentLogId: string, updates: Partial<ContentLog>) => 
  activityLogger.updateContentLog(contentLogId, updates);
export const getPipelineStats = () => activityLogger.getPipelineStats(); 
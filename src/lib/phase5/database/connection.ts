import { Pool, PoolClient } from 'pg';
import logger from '@/lib/logger';
import { APIConfig } from '../types';

class DatabaseManager {
  private pool: Pool;
  private static instance: DatabaseManager;

  private constructor(config: APIConfig['database']) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl ? {
        rejectUnauthorized: false
      } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      statement_timeout: 30000,
      query_timeout: 30000
    });

    this.setupEventHandlers();
  }

  public static getInstance(config?: APIConfig['database']): DatabaseManager {
    if (!DatabaseManager.instance && config) {
      DatabaseManager.instance = new DatabaseManager(config);
    }
    if (!DatabaseManager.instance) {
      throw new Error('DatabaseManager not initialized. Call with config first.');
    }
    return DatabaseManager.instance;
  }

  private setupEventHandlers(): void {
    this.pool.on('connect', () => {
      logger.info('✅ Database connection established for Phase 5 pipeline');
    });

    this.pool.on('error', (err) => {
      logger.error('❌ Database connection error in Phase 5 pipeline', err);
    });

    this.pool.on('acquire', () => {
      logger.debug('Database client acquired for Phase 5 pipeline');
    });

    this.pool.on('release', () => {
      logger.debug('Database client released from Phase 5 pipeline');
    });
  }

  /**
   * Execute a query with error handling and logging
   */
  async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(text, params);
      const duration = Date.now() - start;
      
      logger.debug(`Database query executed in ${duration}ms`, {
        query: text.substring(0, 100) + '...',
        duration,
        rowCount: result.rowCount
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`Database query failed after ${duration}ms`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction failed, rolled back', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Initialize database schema
   */
  async initializeSchema(): Promise<void> {
    try {
      // For now, we'll create the schema programmatically
      // In production, you would read from a SQL file
      const schema = `
        -- Phase 5 Pipeline Database Schema
        -- This is a simplified schema for the autonomous publishing pipeline
        
        CREATE TABLE IF NOT EXISTS chess_stories (
          id VARCHAR(255) PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          source JSONB NOT NULL,
          url TEXT NOT NULL,
          pgn TEXT,
          players JSONB,
          result VARCHAR(10),
          event VARCHAR(255),
          date DATE NOT NULL,
          hash VARCHAR(255) UNIQUE NOT NULL,
          relevance INTEGER DEFAULT 0,
          category VARCHAR(50) DEFAULT 'news',
          tags TEXT[],
          timestamp TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS narrative_scripts (
          id VARCHAR(255) PRIMARY KEY,
          story_id VARCHAR(255) REFERENCES chess_stories(id),
          intro TEXT NOT NULL,
          story TEXT NOT NULL,
          game_highlight TEXT,
          outro TEXT NOT NULL,
          full_script TEXT NOT NULL,
          duration INTEGER NOT NULL,
          tone VARCHAR(50) NOT NULL,
          keywords TEXT[],
          timestamp TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS voice_synthesis (
          id VARCHAR(255) PRIMARY KEY,
          narrative_id VARCHAR(255) REFERENCES narrative_scripts(id),
          audio_url TEXT NOT NULL,
          duration INTEGER NOT NULL,
          file_size INTEGER NOT NULL,
          quality VARCHAR(20) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          error TEXT,
          timestamp TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS video_renders (
          id VARCHAR(255) PRIMARY KEY,
          voice_id VARCHAR(255) REFERENCES voice_synthesis(id),
          video_url TEXT NOT NULL,
          thumbnail_url TEXT NOT NULL,
          duration INTEGER NOT NULL,
          resolution VARCHAR(20) NOT NULL,
          file_size INTEGER NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          error TEXT,
          timestamp TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS social_posts (
          id VARCHAR(255) PRIMARY KEY,
          video_id VARCHAR(255) REFERENCES video_renders(id),
          platform VARCHAR(50) NOT NULL,
          post_id VARCHAR(255),
          url TEXT,
          status VARCHAR(20) DEFAULT 'pending',
          error TEXT,
          engagement JSONB,
          timestamp TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS content_logs (
          id VARCHAR(255) PRIMARY KEY,
          story_id VARCHAR(255) REFERENCES chess_stories(id),
          narrative_id VARCHAR(255) REFERENCES narrative_scripts(id),
          voice_id VARCHAR(255) REFERENCES voice_synthesis(id),
          video_id VARCHAR(255) REFERENCES video_renders(id),
          thumbnail_id VARCHAR(255),
          social_posts JSONB,
          status VARCHAR(20) DEFAULT 'processing',
          error TEXT,
          processing_time INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS scheduled_posts (
          id VARCHAR(255) PRIMARY KEY,
          video_id VARCHAR(255) NOT NULL,
          platform VARCHAR(50) NOT NULL,
          scheduled_time TIMESTAMP NOT NULL,
          status VARCHAR(20) DEFAULT 'scheduled',
          video_url TEXT NOT NULL,
          metadata JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS interaction_logs (
          id VARCHAR(255) PRIMARY KEY,
          platform VARCHAR(50) NOT NULL,
          post_id VARCHAR(255) NOT NULL,
          comment_id VARCHAR(255) NOT NULL,
          response_id VARCHAR(255),
          sentiment VARCHAR(20) NOT NULL,
          response TEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS processing_queue (
          id VARCHAR(255) PRIMARY KEY,
          story_id VARCHAR(255) REFERENCES chess_stories(id),
          status VARCHAR(20) DEFAULT 'queued',
          priority INTEGER DEFAULT 0,
          attempts INTEGER DEFAULT 0,
          max_attempts INTEGER DEFAULT 3,
          error TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `;
      
      await this.query(schema);
      logger.info('✅ Phase 5 database schema initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Phase 5 database schema', error);
      throw error;
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW() as current_time');
      logger.info('✅ Phase 5 database connection test successful', {
        currentTime: result.rows[0].current_time
      });
      return true;
    } catch (error) {
      logger.error('❌ Phase 5 database connection test failed', error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    totalStories: number;
    totalNarratives: number;
    totalVideos: number;
    totalPosts: number;
    processingQueue: number;
    recentErrors: number;
  }> {
    try {
      const stats = await this.query(`
        SELECT 
          (SELECT COUNT(*) FROM chess_stories) as total_stories,
          (SELECT COUNT(*) FROM narrative_scripts) as total_narratives,
          (SELECT COUNT(*) FROM video_renders) as total_videos,
          (SELECT COUNT(*) FROM social_posts) as total_posts,
          (SELECT COUNT(*) FROM processing_queue WHERE status = 'queued') as processing_queue,
          (SELECT COUNT(*) FROM content_logs WHERE status = 'failed' AND created_at > NOW() - INTERVAL '24 hours') as recent_errors
      `);

      return {
        totalStories: parseInt(stats.rows[0].total_stories),
        totalNarratives: parseInt(stats.rows[0].total_narratives),
        totalVideos: parseInt(stats.rows[0].total_videos),
        totalPosts: parseInt(stats.rows[0].total_posts),
        processingQueue: parseInt(stats.rows[0].processing_queue),
        recentErrors: parseInt(stats.rows[0].recent_errors)
      };
    } catch (error) {
      logger.error('Failed to get database statistics', error);
      throw error;
    }
  }

  /**
   * Clean up old data
   */
  async cleanupOldData(): Promise<void> {
    try {
      await this.query('SELECT clean_old_data()');
      logger.info('✅ Old data cleanup completed');
    } catch (error) {
      logger.error('❌ Failed to cleanup old data', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.pool.end();
    logger.info('✅ Phase 5 database connection closed');
  }
}

// Export singleton instance
export const getDatabase = (config?: APIConfig['database']) => DatabaseManager.getInstance(config);

// Export utility functions
export const initializeDatabase = async (config: APIConfig['database']) => {
  const db = DatabaseManager.getInstance(config);
  await db.initializeSchema();
  return db;
};

export const testDatabaseConnection = async (config: APIConfig['database']) => {
  const db = DatabaseManager.getInstance(config);
  return await db.testConnection();
};

export const getDatabaseStats = async (config: APIConfig['database']) => {
  const db = DatabaseManager.getInstance(config);
  return await db.getStats();
}; 
import { getDb } from '@/lib/db';

export interface UserEngagementEvent {
  userId: number;
  action: string;
  metadata?: Record<string, unknown>;
  timestamp?: Date;
}

export interface ContentPerformanceMetrics {
  contentId: string;
  type: 'article' | 'video' | 'replay';
  views: number;
  engagement: number;
  shares: number;
  avgWatchTime?: number;
}

export interface VoiceInteractionData {
  userId: number;
  voiceMode: string;
  duration: number;
  emotionalTone: string;
  interactionType: 'onboarding' | 'narration' | 'coaching';
}

export interface PremiumUsageData {
  userId: number;
  feature: string;
  usage: Record<string, unknown>;
  timestamp: Date;
}

export class AnalyticsEngine {
  static async trackUserEngagement(userId: number, action: string, metadata?: Record<string, unknown>) {
    try {
      const db = await getDb();
      await db.query(
        'INSERT INTO user_analytics (user_id, event_type, event_data, created_at) VALUES ($1, $2, $3, NOW())',
        [userId, action, JSON.stringify(metadata)]
      );
    } catch (error) {
      console.error('Failed to track user engagement:', error);
    }
  }

  static async trackContentPerformance(contentId: string, type: 'article' | 'video' | 'replay', metrics: Partial<ContentPerformanceMetrics>) {
    try {
      const db = await getDb();
      await db.query(
        'INSERT INTO content_analytics (content_id, content_type, views, engagement, shares, avg_watch_time, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) ON CONFLICT (content_id) DO UPDATE SET views = EXCLUDED.views, engagement = EXCLUDED.engagement, shares = EXCLUDED.shares, avg_watch_time = EXCLUDED.avg_watch_time',
        [contentId, type, metrics.views || 0, metrics.engagement || 0, metrics.shares || 0, metrics.avgWatchTime || 0]
      );
    } catch (error) {
      console.error('Failed to track content performance:', error);
    }
  }

  static async trackVoiceInteraction(data: VoiceInteractionData) {
    try {
      const db = await getDb();
      await db.query(
        'INSERT INTO voice_analytics (user_id, voice_mode, duration, emotional_tone, interaction_type, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [data.userId, data.voiceMode, data.duration, data.emotionalTone, data.interactionType]
      );
    } catch (error) {
      console.error('Failed to track voice interaction:', error);
    }
  }

  static async trackPremiumUsage(data: PremiumUsageData) {
    try {
      const db = await getDb();
      await db.query(
        'INSERT INTO premium_usage_analytics (user_id, feature, usage_data, created_at) VALUES ($1, $2, $3, NOW())',
        [data.userId, data.feature, JSON.stringify(data.usage)]
      );
    } catch (error) {
      console.error('Failed to track premium usage:', error);
    }
  }

  static async getRealtimeMetrics() {
    try {
      const db = await getDb();
      
      const [userStats, contentStats, voiceStats, premiumStats] = await Promise.all([
        db.query(`
          SELECT 
            COUNT(*) as total_users,
            COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as new_users_24h,
            COUNT(CASE WHEN last_login > NOW() - INTERVAL '24 hours' THEN 1 END) as active_users_24h
          FROM users
        `),
        db.query(`
          SELECT 
            content_type,
            COUNT(*) as total_content,
            SUM(views) as total_views,
            AVG(engagement) as avg_engagement
          FROM content_analytics 
          GROUP BY content_type
        `),
        db.query(`
          SELECT 
            voice_mode,
            COUNT(*) as interactions,
            AVG(duration) as avg_duration
          FROM voice_analytics 
          WHERE created_at > NOW() - INTERVAL '24 hours'
          GROUP BY voice_mode
        `),
        db.query(`
          SELECT 
            COUNT(DISTINCT user_id) as premium_users,
            COUNT(*) as premium_interactions
          FROM premium_usage_analytics 
          WHERE created_at > NOW() - INTERVAL '24 hours'
        `)
      ]);

      return {
        users: userStats.rows[0],
        content: contentStats.rows,
        voice: voiceStats.rows,
        premium: premiumStats.rows[0],
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Failed to get realtime metrics:', error);
      return null;
    }
  }

  static async getUserEngagementHistory(userId: number, limit = 100) {
    try {
      const db = await getDb();
      const result = await db.query(
        'SELECT event_type, event_data, created_at FROM user_analytics WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
        [userId, limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Failed to get user engagement history:', error);
      return [];
    }
  }

  static async getContentAnalytics(contentId: string) {
    try {
      const db = await getDb();
      const result = await db.query(
        'SELECT * FROM content_analytics WHERE content_id = $1',
        [contentId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get content analytics:', error);
      return null;
    }
  }
}

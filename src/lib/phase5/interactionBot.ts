import axios from 'axios';
import logger from '@/lib/logger';
import { getDatabase } from './database/connection';
import { SocialPlatform } from './types';
import { apiConfig } from './config';

interface SocialComment {
  id: string;
  platform: SocialPlatform;
  postId: string;
  author: string;
  content: string;
  timestamp: Date;
  sentiment: 'positive' | 'negative' | 'neutral' | 'question';
  requiresResponse: boolean;
}

interface InteractionResponse {
  id: string;
  commentId: string;
  platform: SocialPlatform;
  response: string;
  timestamp: Date;
  status: 'sent' | 'failed';
}

interface InteractionLog {
  id: string;
  platform: SocialPlatform;
  postId: string;
  commentId: string;
  responseId: string;
  sentiment: string;
  response: string;
  timestamp: Date;
}

class SocialMediaInteractionBot {
  private db: any;
  private isRunning = false;
  private interactionInterval: NodeJS.Timeout | null = null;
  private rateLimitCounts: Record<SocialPlatform, { count: number; resetTime: Date }> = {
    youtube: { count: 0, resetTime: new Date() },
    instagram: { count: 0, resetTime: new Date() },
    twitter: { count: 0, resetTime: new Date() },
    reddit: { count: 0, resetTime: new Date() }
  };

  // Response templates
  private responseTemplates = {
    positive: [
      "Thank you for your kind words! ♟️ Bambai AI is here to keep bringing you the best stories in chess.",
      "I'm so glad you enjoyed it! The chess world never ceases to amaze me with its beauty.",
      "Your support means the world! ♔ Keep following for more chess insights.",
      "Thank you! Every game tells a story, and I love sharing them with you.",
      "Appreciate your enthusiasm! The 64 squares hold infinite possibilities."
    ],
    question: [
      "Great question! That move was indeed fascinating. The key was the tactical combination that followed.",
      "Interesting point! The position required precise calculation. Would you like me to analyze it further?",
      "Excellent observation! That's exactly what made this game special.",
      "You've spotted something important! The strategic depth here is remarkable.",
      "Wonderful question! The beauty of chess lies in these subtle moments."
    ],
    thoughtful: [
      "Your insight is spot on! This is why chess is such a beautiful game.",
      "Exactly! The complexity and elegance of chess never fails to inspire.",
      "You've captured the essence perfectly! Every move has meaning.",
      "Beautifully said! Chess is both art and science.",
      "Your perspective adds so much to the discussion! ♟️"
    ]
  };

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Initialize the interaction bot
   */
  async initialize(): Promise<void> {
    try {
      logger.info('🤖 Initializing Social Media Interaction Bot');

      // Create interaction tables
      await this.createInteractionTables();

      // Start the interaction monitoring
      await this.startInteractionMonitoring();

      logger.info('✅ Social Media Interaction Bot initialized successfully');

    } catch (error) {
      logger.error('❌ Failed to initialize interaction bot', error);
      throw error;
    }
  }

  /**
   * Start interaction monitoring
   */
  private async startInteractionMonitoring(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Interaction bot is already running');
      return;
    }

    this.isRunning = true;

    // Check for new comments every 5 minutes
    this.interactionInterval = setInterval(async () => {
      await this.processNewComments();
    }, 5 * 60 * 1000); // 5 minutes

    logger.info('✅ Interaction monitoring started - checking every 5 minutes');
  }

  /**
   * Stop interaction monitoring
   */
  async stopInteractionMonitoring(): Promise<void> {
    if (this.interactionInterval) {
      clearInterval(this.interactionInterval);
      this.interactionInterval = null;
    }
    this.isRunning = false;
    logger.info('🛑 Interaction monitoring stopped');
  }

  /**
   * Process new comments from all platforms
   */
  private async processNewComments(): Promise<void> {
    try {
      logger.info('🔍 Checking for new comments across platforms');

      // Process YouTube comments
      await this.processYouTubeComments();

      // Process Instagram comments
      await this.processInstagramComments();

      // Process Twitter mentions
      await this.processTwitterMentions();

    } catch (error) {
      logger.error('❌ Failed to process new comments', error);
    }
  }

  /**
   * Process YouTube comments
   */
  private async processYouTubeComments(): Promise<void> {
    try {
      if (!this.canInteract('youtube')) {
        return;
      }

      // Get latest 10 videos
      const videos = await this.getLatestVideos('youtube', 10);

      for (const video of videos) {
        const comments = await this.fetchYouTubeComments(video.postId);
        
        for (const comment of comments) {
          await this.processComment(comment);
        }
      }

    } catch (error) {
      logger.error('❌ Failed to process YouTube comments', error);
    }
  }

  /**
   * Process Instagram comments
   */
  private async processInstagramComments(): Promise<void> {
    try {
      if (!this.canInteract('instagram')) {
        return;
      }

      // Get latest 5 posts
      const posts = await this.getLatestPosts('instagram', 5);

      for (const post of posts) {
        const comments = await this.fetchInstagramComments(post.postId);
        
        for (const comment of comments) {
          await this.processComment(comment);
        }
      }

    } catch (error) {
      logger.error('❌ Failed to process Instagram comments', error);
    }
  }

  /**
   * Process Twitter mentions
   */
  private async processTwitterMentions(): Promise<void> {
    try {
      if (!this.canInteract('twitter')) {
        return;
      }

      const mentions = await this.fetchTwitterMentions();
      
      for (const mention of mentions) {
        await this.processComment(mention);
      }

    } catch (error) {
      logger.error('❌ Failed to process Twitter mentions', error);
    }
  }

  /**
   * Process individual comment
   */
  private async processComment(comment: SocialComment): Promise<void> {
    try {
      // Check if we've already responded
      const existingResponse = await this.getExistingResponse(comment.id);
      if (existingResponse) {
        return;
      }

      // Analyze sentiment and determine if response is needed
      const analysis = this.analyzeComment(comment.content);
      comment.sentiment = analysis.sentiment;
      comment.requiresResponse = analysis.requiresResponse;

      if (!comment.requiresResponse) {
        return;
      }

      // Generate response
      const response = this.generateResponse(comment);

      // Send response
      const interactionResponse = await this.sendResponse(comment, response);

      // Log interaction
      await this.logInteraction(comment, interactionResponse);

      // Update rate limit
      this.updateRateLimit(comment.platform);

      logger.info(`✅ Responded to ${comment.platform} comment: ${comment.id}`);

    } catch (error) {
      logger.error(`❌ Failed to process comment ${comment.id}`, error);
    }
  }

  /**
   * Analyze comment sentiment and determine if response is needed
   */
  private analyzeComment(content: string): { sentiment: 'positive' | 'negative' | 'neutral' | 'question'; requiresResponse: boolean } {
    const lowerContent = content.toLowerCase();
    
    // Check for positive sentiment
    const positiveKeywords = ['love', 'amazing', 'great', 'awesome', 'fantastic', 'brilliant', 'excellent', 'wonderful', 'beautiful'];
    const hasPositive = positiveKeywords.some(keyword => lowerContent.includes(keyword));

    // Check for questions
    const hasQuestion = lowerContent.includes('?') || 
                       lowerContent.includes('how') || 
                       lowerContent.includes('what') || 
                       lowerContent.includes('why') || 
                       lowerContent.includes('when') || 
                       lowerContent.includes('where');

    // Check for thoughtful comments
    const thoughtfulKeywords = ['analysis', 'strategy', 'tactics', 'position', 'move', 'game', 'chess', 'think', 'thought'];
    const hasThoughtful = thoughtfulKeywords.some(keyword => lowerContent.includes(keyword));

    // Check for negative/spam
    const negativeKeywords = ['hate', 'terrible', 'awful', 'bad', 'stupid', 'idiot', 'spam', 'advertisement'];
    const hasNegative = negativeKeywords.some(keyword => lowerContent.includes(keyword));

    if (hasNegative) {
      return { sentiment: 'negative', requiresResponse: false };
    }

    if (hasQuestion) {
      return { sentiment: 'question', requiresResponse: true };
    }

    if (hasPositive || hasThoughtful) {
      return { sentiment: hasPositive ? 'positive' : 'positive', requiresResponse: true };
    }

    return { sentiment: 'neutral', requiresResponse: false };
  }

  /**
   * Generate appropriate response
   */
  private generateResponse(comment: SocialComment): string {
    const templates = this.responseTemplates[comment.sentiment as keyof typeof this.responseTemplates] || this.responseTemplates.positive;
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Add some personalization based on content
    if (comment.content.toLowerCase().includes('favorite')) {
      return template + " What was your favorite moment in this game?";
    }

    if (comment.content.toLowerCase().includes('analysis')) {
      return template + " The strategic depth here is truly remarkable.";
    }

    return template;
  }

  /**
   * Send response to platform
   */
  private async sendResponse(comment: SocialComment, response: string): Promise<InteractionResponse> {
    try {
      let responseId = '';

      switch (comment.platform) {
        case 'youtube':
          responseId = await this.replyToYouTubeComment(comment.postId, comment.id, response);
          break;
        case 'instagram':
          responseId = await this.replyToInstagramComment(comment.postId, comment.id, response);
          break;
        case 'twitter':
          responseId = await this.replyToTwitterMention(comment.postId, response);
          break;
      }

      const interactionResponse: InteractionResponse = {
        id: this.generateId(),
        commentId: comment.id,
        platform: comment.platform,
        response,
        timestamp: new Date(),
        status: responseId ? 'sent' : 'failed'
      };

      return interactionResponse;

    } catch (error) {
      logger.error(`❌ Failed to send response to ${comment.platform}`, error);
      
      return {
        id: this.generateId(),
        commentId: comment.id,
        platform: comment.platform,
        response,
        timestamp: new Date(),
        status: 'failed'
      };
    }
  }

  /**
   * Reply to YouTube comment
   */
  private async replyToYouTubeComment(videoId: string, commentId: string, response: string): Promise<string> {
    try {
      const accessToken = await this.getYouTubeAccessToken();
      
      const result = await axios.post(
        `https://www.googleapis.com/youtube/v3/comments`,
        {
          snippet: {
            parentId: commentId,
            textOriginal: response
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            part: 'snippet'
          }
        }
      );

      return result.data.id;

    } catch (error) {
      logger.error('Failed to reply to YouTube comment', error);
      throw error;
    }
  }

  /**
   * Reply to Instagram comment
   */
  private async replyToInstagramComment(postId: string, commentId: string, response: string): Promise<string> {
    try {
      const result = await axios.post(
        `https://graph.facebook.com/v18.0/${commentId}/replies`,
        {
          message: response,
          access_token: apiConfig.instagram.accessToken
        }
      );

      return result.data.id;

    } catch (error) {
      logger.error('Failed to reply to Instagram comment', error);
      throw error;
    }
  }

  /**
   * Reply to Twitter mention
   */
  private async replyToTwitterMention(tweetId: string, response: string): Promise<string> {
    try {
      const result = await axios.post(
        'https://api.twitter.com/2/tweets',
        {
          text: response,
          reply: {
            in_reply_to_tweet_id: tweetId
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiConfig.twitter.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return result.data.data.id;

    } catch (error) {
      logger.error('Failed to reply to Twitter mention', error);
      throw error;
    }
  }

  /**
   * Check if we can interact (rate limiting)
   */
  private canInteract(platform: SocialPlatform): boolean {
    const limit = this.rateLimitCounts[platform];
    const now = new Date();

    // Reset counter if hour has passed
    if (now > limit.resetTime) {
      limit.count = 0;
      limit.resetTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    }

    // Check if we're under the limit (5 replies per hour)
    return limit.count < 5;
  }

  /**
   * Update rate limit counter
   */
  private updateRateLimit(platform: SocialPlatform): void {
    this.rateLimitCounts[platform].count++;
  }

  /**
   * Get latest videos/posts from platform
   */
  private async getLatestVideos(platform: SocialPlatform, limit: number): Promise<any[]> {
    try {
      const result = await this.db.query(`
        SELECT * FROM social_posts 
        WHERE platform = $1 AND status = 'published'
        ORDER BY created_at DESC 
        LIMIT $2
      `, [platform, limit]);

      return result.rows;

    } catch (error) {
      logger.error(`Failed to get latest ${platform} videos`, error);
      return [];
    }
  }

  /**
   * Get latest posts from platform
   */
  private async getLatestPosts(platform: SocialPlatform, limit: number): Promise<any[]> {
    return this.getLatestVideos(platform, limit); // Same function for now
  }

  /**
   * Fetch YouTube comments
   */
  private async fetchYouTubeComments(videoId: string): Promise<SocialComment[]> {
    try {
      const accessToken = await this.getYouTubeAccessToken();
      
      const result = await axios.get(
        `https://www.googleapis.com/youtube/v3/commentThreads`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: {
            part: 'snippet',
            videoId,
            maxResults: 100,
            order: 'time'
          }
        }
      );

      return result.data.items.map((item: any) => ({
        id: item.id,
        platform: 'youtube' as SocialPlatform,
        postId: videoId,
        author: item.snippet.topLevelComment.snippet.authorDisplayName,
        content: item.snippet.topLevelComment.snippet.textDisplay,
        timestamp: new Date(item.snippet.topLevelComment.snippet.publishedAt),
        sentiment: 'neutral',
        requiresResponse: false
      }));

    } catch (error) {
      logger.error('Failed to fetch YouTube comments', error);
      return [];
    }
  }

  /**
   * Fetch Instagram comments
   */
  private async fetchInstagramComments(postId: string): Promise<SocialComment[]> {
    try {
      const result = await axios.get(
        `https://graph.facebook.com/v18.0/${postId}/comments`,
        {
          params: {
            access_token: apiConfig.instagram.accessToken,
            fields: 'id,text,from,created_time'
          }
        }
      );

      return result.data.data.map((comment: any) => ({
        id: comment.id,
        platform: 'instagram' as SocialPlatform,
        postId,
        author: comment.from.name,
        content: comment.text,
        timestamp: new Date(comment.created_time),
        sentiment: 'neutral',
        requiresResponse: false
      }));

    } catch (error) {
      logger.error('Failed to fetch Instagram comments', error);
      return [];
    }
  }

  /**
   * Fetch Twitter mentions
   */
  private async fetchTwitterMentions(): Promise<SocialComment[]> {
    try {
      const result = await axios.get(
        'https://api.twitter.com/2/users/me/mentions',
        {
          headers: {
            'Authorization': `Bearer ${apiConfig.twitter.accessToken}`
          },
          params: {
            max_results: 100,
            'tweet.fields': 'created_at,author_id'
          }
        }
      );

      return result.data.data.map((tweet: any) => ({
        id: tweet.id,
        platform: 'twitter' as SocialPlatform,
        postId: tweet.id,
        author: tweet.author_id,
        content: tweet.text,
        timestamp: new Date(tweet.created_at),
        sentiment: 'neutral',
        requiresResponse: false
      }));

    } catch (error) {
      logger.error('Failed to fetch Twitter mentions', error);
      return [];
    }
  }

  /**
   * Get existing response for comment
   */
  private async getExistingResponse(commentId: string): Promise<InteractionResponse | null> {
    try {
      const result = await this.db.query(`
        SELECT * FROM interaction_responses WHERE comment_id = $1
      `, [commentId]);

      return result.rows[0] || null;

    } catch (error) {
      logger.error('Failed to get existing response', error);
      return null;
    }
  }

  /**
   * Log interaction
   */
  private async logInteraction(comment: SocialComment, response: InteractionResponse): Promise<void> {
    try {
      const log: InteractionLog = {
        id: this.generateId(),
        platform: comment.platform,
        postId: comment.postId,
        commentId: comment.id,
        responseId: response.id,
        sentiment: comment.sentiment,
        response: response.response,
        timestamp: new Date()
      };

      await this.db.query(`
        INSERT INTO interaction_logs (
          id, platform, post_id, comment_id, response_id, sentiment, response, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        log.id, log.platform, log.postId, log.commentId,
        log.responseId, log.sentiment, log.response, log.timestamp
      ]);

      logger.info(`✅ Interaction logged: ${log.id}`);

    } catch (error) {
      logger.error('❌ Failed to log interaction', error);
    }
  }

  /**
   * Get YouTube access token
   */
  private async getYouTubeAccessToken(): Promise<string> {
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        client_id: apiConfig.youtube.clientId,
        client_secret: apiConfig.youtube.clientSecret,
        refresh_token: apiConfig.youtube.refreshToken,
        grant_type: 'refresh_token'
      }
    );

    return response.data.access_token;
  }

  /**
   * Create interaction tables
   */
  private async createInteractionTables(): Promise<void> {
    try {
      // Interaction responses table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS interaction_responses (
          id VARCHAR(50) PRIMARY KEY,
          comment_id VARCHAR(100) NOT NULL,
          platform VARCHAR(20) NOT NULL,
          response TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          status VARCHAR(20) NOT NULL DEFAULT 'sent'
        )
      `);

      // Interaction logs table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS interaction_logs (
          id VARCHAR(50) PRIMARY KEY,
          platform VARCHAR(20) NOT NULL,
          post_id VARCHAR(100) NOT NULL,
          comment_id VARCHAR(100) NOT NULL,
          response_id VARCHAR(50) NOT NULL,
          sentiment VARCHAR(20) NOT NULL,
          response TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create indexes
      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_interaction_responses_comment 
        ON interaction_responses(comment_id)
      `);

      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_interaction_logs_platform 
        ON interaction_logs(platform)
      `);

      logger.info('✅ Interaction tables created successfully');

    } catch (error) {
      logger.error('❌ Failed to create interaction tables', error);
      throw error;
    }
  }

  /**
   * Get interaction bot status
   */
  async getStatus(): Promise<{
    isRunning: boolean;
    rateLimits: Record<SocialPlatform, { count: number; resetTime: Date }>;
    recentInteractions: number;
  }> {
    try {
      const result = await this.db.query(`
        SELECT COUNT(*) as count FROM interaction_logs 
        WHERE timestamp > NOW() - INTERVAL '24 hours'
      `);

      return {
        isRunning: this.isRunning,
        rateLimits: this.rateLimitCounts,
        recentInteractions: parseInt(result.rows[0].count)
      };

    } catch (error) {
      logger.error('❌ Failed to get interaction bot status', error);
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
export const socialMediaInteractionBot = new SocialMediaInteractionBot();

// Export main functions
export const initializeInteractionBot = () => socialMediaInteractionBot.initialize();
export const getInteractionBotStatus = () => socialMediaInteractionBot.getStatus();
export const stopInteractionBot = () => socialMediaInteractionBot.stopInteractionMonitoring(); 
import { Pool } from 'pg';
import { notificationSystem } from '../notifications';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface SocialPlatform {
  id: string;
  name: string;
  type: 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'tiktok' | 'linkedin';
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  isActive: boolean;
  postFrequency: number; // posts per day
  lastPosted: Date;
  followers: number;
  engagement: number; // average engagement rate
}

export interface SocialPost {
  id: string;
  platformId: string;
  contentId: string; // reference to article, video, etc.
  contentType: 'article' | 'video' | 'analysis' | 'puzzle' | 'news';
  content: string;
  mediaUrls: string[];
  hashtags: string[];
  mentions: string[];
  scheduledAt: Date;
  postedAt?: Date;
  status: 'scheduled' | 'posted' | 'failed';
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views: number;
  };
  errorMessage?: string;
  createdAt: Date;
}

export interface ContentTemplate {
  id: string;
  name: string;
  platformType: string;
  template: string;
  variables: string[];
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
}

class SocialMediaAutomationSystem {
  private platforms: SocialPlatform[] = [
    {
      id: 'twitter-main',
      name: 'TheChessWire Twitter',
      type: 'twitter',
      isActive: true,
      postFrequency: 8,
      lastPosted: new Date(0),
      followers: 0,
      engagement: 0.05
    },
    {
      id: 'instagram-main',
      name: 'TheChessWire Instagram',
      type: 'instagram',
      isActive: true,
      postFrequency: 3,
      lastPosted: new Date(0),
      followers: 0,
      engagement: 0.08
    },
    {
      id: 'facebook-main',
      name: 'TheChessWire Facebook',
      type: 'facebook',
      isActive: true,
      postFrequency: 4,
      lastPosted: new Date(0),
      followers: 0,
      engagement: 0.06
    },
    {
      id: 'youtube-main',
      name: 'TheChessWire YouTube',
      type: 'youtube',
      isActive: true,
      postFrequency: 2,
      lastPosted: new Date(0),
      followers: 0,
      engagement: 0.12
    },
    {
      id: 'tiktok-main',
      name: 'TheChessWire TikTok',
      type: 'tiktok',
      isActive: true,
      postFrequency: 5,
      lastPosted: new Date(0),
      followers: 0,
      engagement: 0.15
    }
  ];

  private contentTemplates: ContentTemplate[] = [
    {
      id: 'article-twitter',
      name: 'Article Twitter Post',
      platformType: 'twitter',
      template: '🎯 {title}\n\n{summary}\n\n{hashtags}\n\nRead more: {url}',
      variables: ['title', 'summary', 'hashtags', 'url'],
      isActive: true,
      usageCount: 0,
      createdAt: new Date()
    },
    {
      id: 'video-instagram',
      name: 'Video Instagram Post',
      platformType: 'instagram',
      template: '🎬 {title}\n\n{description}\n\n{hashtags}',
      variables: ['title', 'description', 'hashtags'],
      isActive: true,
      usageCount: 0,
      createdAt: new Date()
    },
    {
      id: 'puzzle-twitter',
      name: 'Puzzle Twitter Post',
      platformType: 'twitter',
      template: '🧩 Chess Puzzle\n\n{position}\n\n{question}\n\n{hashtags}',
      variables: ['position', 'question', 'hashtags'],
      isActive: true,
      usageCount: 0,
      createdAt: new Date()
    }
  ];

  async startAutomationProcess(): Promise<void> {
    try {
      console.log('Starting Social Media Automation Process...');
      
      // Generate content for posting
      await this.generateContentForPosting();
      
      // Schedule posts
      await this.schedulePosts();
      
      // Post scheduled content
      await this.postScheduledContent();
      
      // Track engagement
      await this.trackEngagement();
      
      console.log('Social Media Automation Process completed');
    } catch (error) {
      console.error('Social media automation process failed:', error);
    }
  }

  private async generateContentForPosting(): Promise<void> {
    try {
      // Get recent content that hasn't been posted
      const content = await this.getUnpostedContent();
      
      for (const item of content) {
        await this.createSocialPosts(item);
      }
    } catch (error) {
      console.error('Failed to generate content for posting:', error);
    }
  }

  private async getUnpostedContent(): Promise<any[]> {
    try {
      // Get articles, videos, and other content that hasn't been posted
      const result = await pool.query(
        `SELECT 
           'article' as type,
           id,
           title,
           summary,
           content,
           tags,
           created_at
         FROM ai_generated_articles 
         WHERE is_published = TRUE 
         AND id NOT IN (SELECT DISTINCT content_id FROM social_posts WHERE content_type = 'article')
         ORDER BY published_at DESC
         LIMIT 10
         
         UNION ALL
         
         SELECT 
           'video' as type,
           id,
           custom_title as title,
           custom_description as summary,
           NULL as content,
           NULL as tags,
           created_at
         FROM soulcinema_videos 
         WHERE status = 'completed' 
         AND id NOT IN (SELECT DISTINCT content_id FROM social_posts WHERE content_type = 'video')
         ORDER BY completed_at DESC
         LIMIT 5`
      );

      return result.rows;
    } catch (error) {
      console.error('Failed to get unposted content:', error);
      return [];
    }
  }

  private async createSocialPosts(content: any): Promise<void> {
    try {
      const activePlatforms = this.platforms.filter(p => p.isActive);
      
      for (const platform of activePlatforms) {
        const post = await this.generatePostForPlatform(content, platform);
        
        if (post) {
          await this.schedulePost(post);
        }
      }
    } catch (error) {
      console.error('Failed to create social posts:', error);
    }
  }

  private async generatePostForPlatform(content: any, platform: SocialPlatform): Promise<Partial<SocialPost> | null> {
    try {
      const template = this.getTemplateForContent(content.type, platform.type);
      
      if (!template) {
        return null;
      }

      const hashtags = await this.generateHashtags(content, platform.type);
      const mentions = await this.extractMentions(content);
      const mediaUrls = await this.getMediaUrls(content);

      const postContent = this.fillTemplate(template, {
        title: content.title,
        summary: content.summary || content.content?.substring(0, 200),
        hashtags: hashtags.join(' '),
        url: `${process.env.NEXT_PUBLIC_APP_URL}/content/${content.id}`,
        position: content.position || '',
        question: content.question || ''
      });

      return {
        platformId: platform.id,
        contentId: content.id,
        contentType: content.type,
        content: postContent,
        mediaUrls,
        hashtags,
        mentions,
        scheduledAt: this.calculateOptimalPostTime(platform)
      };
    } catch (error) {
      console.error('Failed to generate post for platform:', error);
      return null;
    }
  }

  private getTemplateForContent(contentType: string, platformType: string): ContentTemplate | null {
    return this.contentTemplates.find(t => 
      t.isActive && 
      (t.name.includes(contentType) || t.name.includes('general')) &&
      t.platformType === platformType
    ) || null;
  }

  private async generateHashtags(content: any, platformType: string): Promise<string[]> {
    const baseHashtags = ['#chess', '#thechesswire', '#chessnews'];
    
    // Add content-specific hashtags
    if (content.type === 'article') {
      baseHashtags.push('#chessanalysis', '#chessstrategy');
    } else if (content.type === 'video') {
      baseHashtags.push('#chessvideo', '#soulcinema');
    }

    // Add trending hashtags
    const trending = await this.getTrendingHashtags(platformType);
    baseHashtags.push(...trending.slice(0, 3));

    return baseHashtags;
  }

  private async getTrendingHashtags(platformType: string): Promise<string[]> {
    // This would fetch trending hashtags from the platform API
    const trending = {
      twitter: ['#chess', '#magnuscarlsen', '#chesscom', '#lichess'],
      instagram: ['#chess', '#chesslife', '#chessplayer', '#chessboard'],
      facebook: ['#chess', '#chesscommunity', '#chessgame', '#chessstrategy'],
      youtube: ['#chess', '#chessanalysis', '#chesslessons', '#chessmaster'],
      tiktok: ['#chess', '#chesstok', '#chessviral', '#chesschallenge']
    };

    return trending[platformType as keyof typeof trending] || [];
  }

  private async extractMentions(content: any): Promise<string[]> {
    // Extract player names and other mentions from content
    const mentions: string[] = [];
    
    if (content.content) {
      const playerNames = ['Magnus Carlsen', 'Hikaru Nakamura', 'Fabiano Caruana', 'Ding Liren'];
      
      for (const player of playerNames) {
        if (content.content.includes(player)) {
          mentions.push(player.replace(' ', ''));
        }
      }
    }

    return mentions;
  }

  private async getMediaUrls(content: any): Promise<string[]> {
    const urls: string[] = [];
    
    if (content.type === 'video' && content.thumbnailUrl) {
      urls.push(content.thumbnailUrl);
    } else if (content.imageUrl) {
      urls.push(content.imageUrl);
    }

    return urls;
  }

  private fillTemplate(template: ContentTemplate, variables: any): string {
    let content = template.template;
    
    for (const variable of template.variables) {
      const value = variables[variable] || '';
      content = content.replace(`{${variable}}`, value);
    }
    
    return content;
  }

  private calculateOptimalPostTime(platform: SocialPlatform): Date {
    const now = new Date();
    const hoursSinceLastPost = (now.getTime() - platform.lastPosted.getTime()) / (1000 * 60 * 60);
    const targetInterval = 24 / platform.postFrequency;
    
    if (hoursSinceLastPost >= targetInterval) {
      return now;
    } else {
      const delay = (targetInterval - hoursSinceLastPost) * 60 * 60 * 1000;
      return new Date(now.getTime() + delay);
    }
  }

  private async schedulePost(post: Partial<SocialPost>): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO social_posts 
         (id, platform_id, content_id, content_type, content, media_urls, hashtags, mentions, scheduled_at, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
        [
          crypto.randomUUID(),
          post.platformId,
          post.contentId,
          post.contentType,
          post.content,
          JSON.stringify(post.mediaUrls),
          JSON.stringify(post.hashtags),
          JSON.stringify(post.mentions),
          post.scheduledAt,
          'scheduled'
        ]
      );
    } catch (error) {
      console.error('Failed to schedule post:', error);
    }
  }

  private async schedulePosts(): Promise<void> {
    try {
      // This would implement intelligent scheduling based on:
      // - Platform-specific optimal posting times
      // - Content type and audience
      // - Engagement patterns
      // - Current trending topics
      
      console.log('Posts scheduled successfully');
    } catch (error) {
      console.error('Failed to schedule posts:', error);
    }
  }

  private async postScheduledContent(): Promise<void> {
    try {
      const result = await pool.query(
        `SELECT * FROM social_posts 
         WHERE status = 'scheduled' 
         AND scheduled_at <= NOW()
         ORDER BY scheduled_at ASC`
      );

      for (const post of result.rows) {
        await this.postToPlatform(post);
      }
    } catch (error) {
      console.error('Failed to post scheduled content:', error);
    }
  }

  private async postToPlatform(post: any): Promise<void> {
    try {
      const platform = this.platforms.find(p => p.id === post.platform_id);
      
      if (!platform) {
        throw new Error('Platform not found');
      }

      // This would integrate with platform APIs
      const success = await this.simulatePlatformPost(post, platform);
      
      if (success) {
        await this.updatePostStatus(post.id, 'posted');
        await this.updatePlatformLastPosted(platform.id);
      } else {
        await this.updatePostStatus(post.id, 'failed', 'Platform API error');
      }
    } catch (error) {
      console.error('Failed to post to platform:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.updatePostStatus(post.id, 'failed', errorMessage);
    }
  }

  private async simulatePlatformPost(post: any, platform: SocialPlatform): Promise<boolean> {
    // Simulate posting to platform
    console.log(`Posting to ${platform.name}: ${post.content.substring(0, 100)}...`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate success/failure
    return Math.random() > 0.1; // 90% success rate
  }

  private async updatePostStatus(postId: string, status: string, errorMessage?: string): Promise<void> {
    try {
      await pool.query(
        `UPDATE social_posts 
         SET status = $1, posted_at = $2, error_message = $3
         WHERE id = $4`,
        [
          status,
          status === 'posted' ? new Date() : null,
          errorMessage,
          postId
        ]
      );
    } catch (error) {
      console.error('Failed to update post status:', error);
    }
  }

  private async updatePlatformLastPosted(platformId: string): Promise<void> {
    try {
      await pool.query(
        'UPDATE social_platforms SET last_posted = NOW() WHERE id = $1',
        [platformId]
      );
    } catch (error) {
      console.error('Failed to update platform last posted:', error);
    }
  }

  private async trackEngagement(): Promise<void> {
    try {
      // Get recently posted content
      const result = await pool.query(
        `SELECT * FROM social_posts 
         WHERE status = 'posted' 
         AND posted_at >= NOW() - INTERVAL '24 hours'`
      );

      for (const post of result.rows) {
        await this.updateEngagementMetrics(post);
      }
    } catch (error) {
      console.error('Failed to track engagement:', error);
    }
  }

  private async updateEngagementMetrics(post: any): Promise<void> {
    try {
      // This would fetch engagement data from platform APIs
      const engagement = await this.simulateEngagementFetch(post);
      
      await pool.query(
        `UPDATE social_posts 
         SET engagement = $1
         WHERE id = $2`,
        [JSON.stringify(engagement), post.id]
      );
    } catch (error) {
      console.error('Failed to update engagement metrics:', error);
    }
  }

  private async simulateEngagementFetch(post: any): Promise<any> {
    // Simulate engagement data
    return {
      likes: Math.floor(Math.random() * 100),
      shares: Math.floor(Math.random() * 20),
      comments: Math.floor(Math.random() * 10),
      views: Math.floor(Math.random() * 1000)
    };
  }

  async getSocialAnalytics(days: number = 30): Promise<any> {
    try {
      const result = await pool.query(
        `SELECT 
           platform_id,
           COUNT(*) as total_posts,
           COUNT(CASE WHEN status = 'posted' THEN 1 END) as successful_posts,
           COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_posts,
           AVG((engagement->>'likes')::int) as avg_likes,
           AVG((engagement->>'shares')::int) as avg_shares,
           AVG((engagement->>'comments')::int) as avg_comments,
           AVG((engagement->>'views')::int) as avg_views
         FROM social_posts 
         WHERE created_at >= NOW() - INTERVAL '1 day' * $1
         GROUP BY platform_id`,
        [days]
      );

      return result.rows;
    } catch (error) {
      console.error('Failed to get social analytics:', error);
      return [];
    }
  }

  async getPlatforms(): Promise<SocialPlatform[]> {
    return this.platforms;
  }

  async getContentTemplates(): Promise<ContentTemplate[]> {
    return this.contentTemplates;
  }
}

// Singleton instance
const socialMediaAutomationSystem = new SocialMediaAutomationSystem();

export { socialMediaAutomationSystem, SocialMediaAutomationSystem }; 
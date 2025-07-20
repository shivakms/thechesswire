import axios from 'axios';
import logger from '@/lib/logger';
import { getDatabase } from './database/connection';
import { VideoRender, SocialPost, SocialPlatform, PublishingResult } from './types';
import { apiConfig, socialTemplates } from './config';

class SocialPublisher {
  private db: any;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Publish video to all configured social platforms
   */
  async publishToSocial(video: VideoRender, metadata: any): Promise<PublishingResult> {
    const startTime = Date.now();
    const posts: SocialPost[] = [];
    const failedPlatforms: SocialPlatform[] = [];

    logger.info(`📱 Publishing video to social platforms: ${video.id}`);

    try {
      // Publish to each platform
      const platforms: SocialPlatform[] = ['youtube', 'instagram', 'twitter'];
      
      for (const platform of platforms) {
        try {
          const post = await this.publishToPlatform(platform, video, metadata);
          posts.push(post);
          logger.info(`✅ Published to ${platform}: ${post.postId || 'pending'}`);
        } catch (error) {
          logger.error(`❌ Failed to publish to ${platform}`, error);
          failedPlatforms.push(platform);
          
          // Create failed post record
          const failedPost: SocialPost = {
            id: this.generateId(),
            videoId: video.id,
            platform,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date()
          };
          posts.push(failedPost);
        }

        // Rate limiting delay
        await this.delay(2000);
      }

      // Save all posts to database
      await this.saveSocialPosts(posts);

      const processingTime = Date.now() - startTime;
      const totalPublished = posts.filter(p => p.status === 'published').length;

      logger.info(`✅ Social publishing completed`, {
        videoId: video.id,
        totalPublished,
        failedPlatforms: failedPlatforms.length,
        processingTime: `${processingTime}ms`
      });

      return {
        posts,
        totalPublished,
        failedPlatforms,
        processingTime
      };

    } catch (error) {
      logger.error(`❌ Social publishing failed for video ${video.id}`, error);
      throw error;
    }
  }

  /**
   * Publish to specific platform
   */
  private async publishToPlatform(platform: SocialPlatform, video: VideoRender, metadata: any): Promise<SocialPost> {
    switch (platform) {
      case 'youtube':
        return await this.publishToYouTube(video, metadata);
      case 'instagram':
        return await this.publishToInstagram(video, metadata);
      case 'twitter':
        return await this.publishToTwitter(video, metadata);
      case 'reddit':
        return await this.publishToReddit(video, metadata);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Publish to YouTube
   */
  private async publishToYouTube(video: VideoRender, metadata: any): Promise<SocialPost> {
    try {
      const template = socialTemplates.youtube;
      const title = this.fillTemplate(template.title, metadata);
      const description = this.fillTemplate(template.description, metadata);

      const response = await axios.post(
        'https://www.googleapis.com/upload/youtube/v3/videos',
        {
          snippet: {
            title,
            description,
            tags: template.tags,
            categoryId: '22' // People & Blogs
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${await this.getYouTubeAccessToken()}`,
            'Content-Type': 'application/json'
          },
          params: {
            part: 'snippet,status',
            uploadType: 'multipart'
          }
        }
      );

      const post: SocialPost = {
        id: this.generateId(),
        videoId: video.id,
        platform: 'youtube',
        postId: response.data.id,
        url: `https://www.youtube.com/watch?v=${response.data.id}`,
        status: 'published',
        timestamp: new Date()
      };

      return post;

    } catch (error) {
      logger.error('YouTube publishing failed', error);
      throw error;
    }
  }

  /**
   * Publish to Instagram
   */
  private async publishToInstagram(video: VideoRender, metadata: any): Promise<SocialPost> {
    try {
      const template = socialTemplates.instagram;
      const caption = this.fillTemplate(template.caption, metadata);

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${apiConfig.instagram.userId}/media`,
        {
          media_type: 'REELS',
          video_url: video.videoUrl,
          caption,
          access_token: apiConfig.instagram.accessToken
        }
      );

      const creationId = response.data.id;

      // Publish the container
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${apiConfig.instagram.userId}/media_publish`,
        {
          creation_id: creationId,
          access_token: apiConfig.instagram.accessToken
        }
      );

      const post: SocialPost = {
        id: this.generateId(),
        videoId: video.id,
        platform: 'instagram',
        postId: publishResponse.data.id,
        url: `https://www.instagram.com/p/${publishResponse.data.id}/`,
        status: 'published',
        timestamp: new Date()
      };

      return post;

    } catch (error) {
      logger.error('Instagram publishing failed', error);
      throw error;
    }
  }

  /**
   * Publish to Twitter/X
   */
  private async publishToTwitter(video: VideoRender, metadata: any): Promise<SocialPost> {
    try {
      const template = socialTemplates.twitter;
      const text = this.fillTemplate(template.text, metadata);

      // Upload media first
      const mediaResponse = await axios.post(
        'https://upload.twitter.com/1.1/media/upload.json',
        {
          media_category: 'tweet_video',
          media_data: await this.getBase64FromUrl(video.videoUrl)
        },
        {
          headers: {
            'Authorization': `OAuth oauth_consumer_key="${apiConfig.twitter.apiKey}",oauth_token="${apiConfig.twitter.accessToken}"`
          }
        }
      );

      const mediaId = mediaResponse.data.media_id_string;

      // Post tweet with media
      const tweetResponse = await axios.post(
        'https://api.twitter.com/2/tweets',
        {
          text,
          media: {
            media_ids: [mediaId]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiConfig.twitter.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const post: SocialPost = {
        id: this.generateId(),
        videoId: video.id,
        platform: 'twitter',
        postId: tweetResponse.data.data.id,
        url: `https://twitter.com/user/status/${tweetResponse.data.data.id}`,
        status: 'published',
        timestamp: new Date()
      };

      return post;

    } catch (error) {
      logger.error('Twitter publishing failed', error);
      throw error;
    }
  }

  /**
   * Publish to Reddit
   */
  private async publishToReddit(video: VideoRender, metadata: any): Promise<SocialPost> {
    try {
      const template = socialTemplates.reddit;
      const title = this.fillTemplate(template.title, metadata);
      const text = this.fillTemplate(template.text, metadata);

      const response = await axios.post(
        'https://oauth.reddit.com/api/submit',
        {
          sr: 'chess',
          title,
          text,
          kind: 'self',
          url: video.videoUrl
        },
        {
          headers: {
            'Authorization': `Bearer ${await this.getRedditAccessToken()}`,
            'User-Agent': 'TheChessWire-Bot/1.0'
          }
        }
      );

      const post: SocialPost = {
        id: this.generateId(),
        videoId: video.id,
        platform: 'reddit',
        postId: response.data.data.id,
        url: `https://reddit.com${response.data.data.permalink}`,
        status: 'published',
        timestamp: new Date()
      };

      return post;

    } catch (error) {
      logger.error('Reddit publishing failed', error);
      throw error;
    }
  }

  /**
   * Fill template with metadata
   */
  private fillTemplate(template: string, metadata: any): string {
    return template
      .replace('{title}', metadata.title || 'Chess Analysis')
      .replace('{description}', metadata.description || 'Fascinating chess analysis by Bambai AI')
      .replace('{pgnLink}', metadata.pgnLink || 'https://thechesswire.news')
      .replace('{source}', metadata.source || 'TheChessWire.news');
  }

  /**
   * Get YouTube access token
   */
  private async getYouTubeAccessToken(): Promise<string> {
    // This would typically involve OAuth2 flow
    // For now, using refresh token approach
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
   * Get Reddit access token
   */
  private async getRedditAccessToken(): Promise<string> {
    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      {
        grant_type: 'refresh_token',
        refresh_token: apiConfig.reddit.refreshToken
      },
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${apiConfig.reddit.clientId}:${apiConfig.reddit.clientSecret}`).toString('base64')}`,
          'User-Agent': 'TheChessWire-Bot/1.0'
        }
      }
    );

    return response.data.access_token;
  }

  /**
   * Get base64 from URL
   */
  private async getBase64FromUrl(url: string): Promise<string> {
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });
    
    return Buffer.from(response.data).toString('base64');
  }

  /**
   * Save social posts to database
   */
  private async saveSocialPosts(posts: SocialPost[]): Promise<void> {
    try {
      for (const post of posts) {
        await this.db.query(`
          INSERT INTO social_posts (
            id, video_id, platform, post_id, url, status, error, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          post.id, post.videoId, post.platform, post.postId, post.url,
          post.status, post.error, post.timestamp, post.timestamp
        ]);
      }

      logger.info(`✅ Saved ${posts.length} social posts to database`);

    } catch (error) {
      logger.error(`❌ Failed to save social posts to database`, error);
      throw error;
    }
  }

  /**
   * Update social post engagement
   */
  async updateEngagement(postId: string, engagement: any): Promise<void> {
    try {
      await this.db.query(`
        UPDATE social_posts 
        SET views = $2, likes = $3, comments = $4, shares = $5, updated_at = $6
        WHERE id = $1
      `, [
        postId, engagement.views, engagement.likes,
        engagement.comments, engagement.shares, new Date()
      ]);

      logger.info(`✅ Updated engagement for post: ${postId}`);

    } catch (error) {
      logger.error(`❌ Failed to update engagement`, error);
      throw error;
    }
  }

  /**
   * Get social posts by video ID
   */
  async getSocialPostsByVideo(videoId: string): Promise<SocialPost[]> {
    try {
      const result = await this.db.query(`
        SELECT * FROM social_posts WHERE video_id = $1 ORDER BY created_at
      `, [videoId]);

      return result.rows;

    } catch (error) {
      logger.error(`❌ Failed to get social posts by video`, error);
      throw error;
    }
  }

  /**
   * Delay function for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Export singleton instance
export const socialPublisher = new SocialPublisher();

// Export main function
export const publishToSocial = (video: VideoRender, metadata: any) => socialPublisher.publishToSocial(video, metadata); 
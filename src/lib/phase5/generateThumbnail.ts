import logger from '@/lib/logger';
import { getDatabase } from './database/connection';
import { VideoRender, ThumbnailMetadata } from './types';

class ThumbnailGenerator {
  private db: any;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Generate thumbnail and metadata for video
   */
  async generateThumbnail(video: VideoRender, story: any, narrative: any): Promise<ThumbnailMetadata> {
    try {
      logger.info(`🖼️ Generating thumbnail for video: ${video.id}`);

      // Generate title
      const title = this.generateTitle(story, narrative);

      // Generate description
      const description = this.generateDescription(story, narrative);

      // Generate tags and hashtags
      const tags = this.generateTags(story, narrative);
      const hashtags = this.generateHashtags(story, narrative);

      // Generate SEO keywords
      const seoKeywords = this.generateSEOKeywords(story, narrative);

      // Generate thumbnail URL (placeholder for now)
      const thumbnailUrl = this.generateThumbnailUrl(video, title);

      const metadata: ThumbnailMetadata = {
        id: this.generateId(),
        videoId: video.id,
        title,
        description,
        tags,
        hashtags,
        seoKeywords,
        thumbnailUrl,
        timestamp: new Date()
      };

      // Save to database
      await this.saveThumbnailMetadata(metadata);

      logger.info(`✅ Thumbnail metadata generated`, {
        thumbnailId: metadata.id,
        title: metadata.title.substring(0, 50) + '...',
        tagsCount: metadata.tags.length,
        hashtagsCount: metadata.hashtags.length
      });

      return metadata;

    } catch (error) {
      logger.error(`❌ Thumbnail generation failed for video ${video.id}`, error);
      throw error;
    }
  }

  /**
   * Generate engaging title
   */
  private generateTitle(story: any, narrative: any): string {
    const templates = [
      `🎯 ${story.title} - Chess Analysis by Bambai AI`,
      `♟️ ${story.title} | TheChessWire Analysis`,
      `🧠 ${story.title} - AI Chess Insights`,
      `⚡ ${story.title} | Bambai AI Breakdown`,
      `🎪 ${story.title} - Chess Drama Uncovered`
    ];

    // Add category-specific templates
    if (story.category === 'tournament') {
      templates.push(`🏆 ${story.title} - Tournament Highlights`);
      templates.push(`🎖️ ${story.title} - Championship Analysis`);
    } else if (story.category === 'game') {
      templates.push(`♔ ${story.title} - Game Analysis`);
      templates.push(`🎭 ${story.title} - Chess Drama`);
    } else if (story.category === 'analysis') {
      templates.push(`🔍 ${story.title} - Deep Analysis`);
      templates.push(`📊 ${story.title} - Strategic Breakdown`);
    }

    // Select template based on content
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Ensure title is not too long (YouTube limit: 100 characters)
    return template.length > 100 ? template.substring(0, 97) + '...' : template;
  }

  /**
   * Generate compelling description
   */
  private generateDescription(story: any, narrative: any): string {
    let description = '';

    // Add main description
    if (narrative.story) {
      description += narrative.story.substring(0, 200);
      if (narrative.story.length > 200) {
        description += '...';
      }
    } else {
      description += story.content.substring(0, 200);
      if (story.content.length > 200) {
        description += '...';
      }
    }

    // Add key highlights
    if (story.players) {
      description += `\n\n🎯 ${story.players.white} vs ${story.players.black}`;
    }

    if (story.event) {
      description += `\n🏆 ${story.event}`;
    }

    if (story.result) {
      description += `\n📊 Result: ${story.result}`;
    }

    // Add call to action
    description += '\n\n🎯 Follow TheChessWire.news for daily chess insights';
    description += '\n🔗 PGN Analysis: https://thechesswire.news';
    description += '\n📱 Source: ' + story.source.name;

    // Add disclaimer
    description += '\n\nThis story is AI-generated and references publicly available chess activity. TheChessWire is an independent journalism platform not affiliated with any third-party organization.';

    return description;
  }

  /**
   * Generate relevant tags
   */
  private generateTags(story: any, narrative: any): string[] {
    const tags = new Set<string>();

    // Add story tags
    if (story.tags) {
      story.tags.forEach((tag: string) => tags.add(tag));
    }

    // Add category tag
    tags.add(story.category);

    // Add source tag
    tags.add(story.source.name.toLowerCase());

    // Add narrative keywords
    if (narrative.keywords) {
      narrative.keywords.forEach((keyword: string) => tags.add(keyword));
    }

    // Add common chess tags
    const commonTags = [
      'chess', 'chessanalysis', 'bambaiai', 'thechesswire',
      'chessnews', 'chessstrategy', 'chesstactics'
    ];

    commonTags.forEach(tag => tags.add(tag));

    // Add player tags if present
    if (story.players) {
      tags.add(story.players.white.toLowerCase().replace(/\s+/g, ''));
      tags.add(story.players.black.toLowerCase().replace(/\s+/g, ''));
    }

    return Array.from(tags).slice(0, 15); // Limit to 15 tags
  }

  /**
   * Generate hashtags for social media
   */
  private generateHashtags(story: any, narrative: any): string[] {
    const hashtags = new Set<string>();

    // Core hashtags
    hashtags.add('#chess');
    hashtags.add('#chessanalysis');
    hashtags.add('#bambaiai');
    hashtags.add('#thechesswire');

    // Category-specific hashtags
    switch (story.category) {
      case 'tournament':
        hashtags.add('#chesstournament');
        hashtags.add('#chesschampionship');
        break;
      case 'game':
        hashtags.add('#chessgame');
        hashtags.add('#chessmatch');
        break;
      case 'analysis':
        hashtags.add('#chessstrategy');
        hashtags.add('#chesstactics');
        break;
      case 'news':
        hashtags.add('#chessnews');
        break;
      case 'educational':
        hashtags.add('#chesslearning');
        hashtags.add('#chesstutorial');
        break;
    }

    // Add player hashtags if present
    if (story.players) {
      const whitePlayer = story.players.white.toLowerCase().replace(/\s+/g, '');
      const blackPlayer = story.players.black.toLowerCase().replace(/\s+/g, '');
      hashtags.add(`#${whitePlayer}`);
      hashtags.add(`#${blackPlayer}`);
    }

    // Add event hashtags if present
    if (story.event) {
      const eventTag = story.event.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (eventTag.length > 3) {
        hashtags.add(`#${eventTag}`);
      }
    }

    return Array.from(hashtags).slice(0, 10); // Limit to 10 hashtags
  }

  /**
   * Generate SEO keywords
   */
  private generateSEOKeywords(story: any, narrative: any): string[] {
    const keywords = new Set<string>();

    // Add story keywords
    keywords.add('chess');
    keywords.add('chess analysis');
    keywords.add('bambai ai');
    keywords.add('thechesswire');
    keywords.add(story.category);

    // Add player names if present
    if (story.players) {
      keywords.add(story.players.white);
      keywords.add(story.players.black);
    }

    // Add event name if present
    if (story.event) {
      keywords.add(story.event);
    }

    // Add narrative keywords
    if (narrative.keywords) {
      narrative.keywords.forEach((keyword: string) => keywords.add(keyword));
    }

    // Add common chess terms
    const chessTerms = [
      'chess strategy', 'chess tactics', 'chess opening', 'chess endgame',
      'chess tournament', 'chess championship', 'chess news', 'chess learning'
    ];

    chessTerms.forEach(term => keywords.add(term));

    return Array.from(keywords).slice(0, 20); // Limit to 20 keywords
  }

  /**
   * Generate thumbnail URL
   */
  private generateThumbnailUrl(video: VideoRender, title: string): string {
    // For now, return a placeholder URL
    // In production, this would generate an actual thumbnail image
    const baseUrl = 'https://thechesswire.news/thumbnails';
    const thumbnailId = video.id;
    
    return `${baseUrl}/${thumbnailId}.jpg`;
  }

  /**
   * Save thumbnail metadata to database
   */
  private async saveThumbnailMetadata(metadata: ThumbnailMetadata): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO thumbnail_metadata (
          id, video_id, title, description, tags, hashtags, seo_keywords, thumbnail_url, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        metadata.id, metadata.videoId, metadata.title, metadata.description,
        metadata.tags, metadata.hashtags, metadata.seoKeywords,
        metadata.thumbnailUrl, metadata.timestamp
      ]);

      logger.info(`✅ Thumbnail metadata saved to database: ${metadata.id}`);

    } catch (error) {
      logger.error(`❌ Failed to save thumbnail metadata to database`, error);
      throw error;
    }
  }

  /**
   * Get thumbnail metadata by video ID
   */
  async getThumbnailMetadata(videoId: string): Promise<ThumbnailMetadata | null> {
    try {
      const result = await this.db.query(`
        SELECT * FROM thumbnail_metadata WHERE video_id = $1
      `, [videoId]);

      return result.rows[0] || null;

    } catch (error) {
      logger.error(`❌ Failed to get thumbnail metadata`, error);
      throw error;
    }
  }

  /**
   * Update thumbnail metadata
   */
  async updateThumbnailMetadata(metadata: ThumbnailMetadata): Promise<void> {
    try {
      await this.db.query(`
        UPDATE thumbnail_metadata 
        SET title = $2, description = $3, tags = $4, hashtags = $5, seo_keywords = $6, thumbnail_url = $7
        WHERE id = $1
      `, [
        metadata.id, metadata.title, metadata.description, metadata.tags,
        metadata.hashtags, metadata.seoKeywords, metadata.thumbnailUrl
      ]);

      logger.info(`✅ Thumbnail metadata updated: ${metadata.id}`);

    } catch (error) {
      logger.error(`❌ Failed to update thumbnail metadata`, error);
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
export const thumbnailGenerator = new ThumbnailGenerator();

// Export main function
export const generateThumbnail = (video: VideoRender, story: any, narrative: any) => 
  thumbnailGenerator.generateThumbnail(video, story, narrative); 
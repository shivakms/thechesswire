import axios from 'axios';
import * as cheerio from 'cheerio';
import { createHash } from 'crypto';
import logger from '@/lib/logger';
import { getDatabase } from './database/connection';
import { ChessStory, StorySource, StoryFetchResult } from './types';
import { storySources } from './config';

class StoryFetcher {
  private db: any;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Fetch stories from all sources
   */
  async fetchStories(): Promise<StoryFetchResult> {
    const startTime = Date.now();
    const allStories: ChessStory[] = [];

    logger.info('🚀 Starting story fetching process');

    try {
      // Fetch from each source concurrently
      const fetchPromises = storySources.map(source => this.fetchFromSource(source));
      const results = await Promise.allSettled(fetchPromises);

      // Process results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allStories.push(...result.value);
          logger.info(`✅ Fetched ${result.value.length} stories from ${storySources[index].name}`);
        } else {
          logger.error(`❌ Failed to fetch from ${storySources[index].name}`, result.reason);
        }
      });

      // Filter and deduplicate stories
      const uniqueStories = await this.filterAndDeduplicate(allStories);
      
      // Calculate relevance scores
      const scoredStories = await this.calculateRelevanceScores(uniqueStories);

      // Save to database
      await this.saveStories(scoredStories);

      const processingTime = Date.now() - startTime;

      logger.info('✅ Story fetching completed', {
        totalFetched: allStories.length,
        uniqueStories: scoredStories.length,
        processingTime: `${processingTime}ms`
      });

      return {
        stories: scoredStories,
        totalFetched: allStories.length,
        uniqueStories: scoredStories.length,
        processingTime
      };

    } catch (error) {
      logger.error('❌ Story fetching failed', error);
      throw error;
    }
  }

  /**
   * Fetch stories from a specific source
   */
  private async fetchFromSource(source: any): Promise<ChessStory[]> {
    const stories: ChessStory[] = [];

    try {
      if (source.type === 'social' && source.name === 'Reddit r/chess') {
        return await this.fetchFromReddit();
      }

      // Fetch HTML content
      const response = await axios.get(source.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const articles = $(source.selectors.articles);

      articles.each((index, element) => {
        try {
          const story = this.parseArticle($, element, source);
          if (story) {
            stories.push(story);
          }
        } catch (error) {
          logger.warn(`Failed to parse article ${index} from ${source.name}`, error);
        }
      });

      return stories;

    } catch (error) {
      logger.error(`Failed to fetch from ${source.name}`, error);
      return [];
    }
  }

  /**
   * Fetch stories from Reddit
   */
  private async fetchFromReddit(): Promise<ChessStory[]> {
    const stories: ChessStory[] = [];

    try {
      const response = await axios.get('https://www.reddit.com/r/chess/hot.json', {
        timeout: 10000,
        headers: {
          'User-Agent': 'TheChessWire-Bot/1.0'
        }
      });

      const posts = response.data.data.children;
      
      posts.forEach((post: any) => {
        const data = post.data;
        
        // Filter for relevant posts
        if (this.isRelevantRedditPost(data)) {
          const story: ChessStory = {
            id: data.id,
            title: data.title,
            content: data.selftext || data.title,
            source: {
              name: 'Reddit r/chess',
              type: 'social',
              url: `https://reddit.com${data.permalink}`,
              reliability: 75
            },
            url: `https://reddit.com${data.permalink}`,
            pgn: this.extractPGN(data.selftext || ''),
            date: new Date(data.created_utc * 1000).toISOString(),
            hash: this.generateHash(data.title + data.selftext),
            relevance: 0, // Will be calculated later
            category: this.categorizeContent(data.title + data.selftext),
            tags: this.extractTags(data.title + data.selftext),
            timestamp: new Date()
          };

          stories.push(story);
        }
      });

      return stories;

    } catch (error) {
      logger.error('Failed to fetch from Reddit', error);
      return [];
    }
  }

  /**
   * Parse article from HTML
   */
  private parseArticle($: cheerio.CheerioAPI, element: any, source: any): ChessStory | null {
    try {
      const title = $(element).find(source.selectors.title).first().text().trim();
      const content = $(element).find(source.selectors.content).first().text().trim();
      const dateText = $(element).find(source.selectors.date).first().text().trim();
      
      if (!title || !content) {
        return null;
      }

      // Extract PGN if present
      const pgn = this.extractPGN(content);
      
      // Extract players if present
      const players = this.extractPlayers(content);
      
      // Extract result if present
      const result = this.extractResult(content);
      
      // Extract event if present
      const event = this.extractEvent(content);

      const story: ChessStory = {
        id: this.generateId(),
        title,
        content,
        source: {
          name: source.name,
          type: source.type,
          url: source.url,
          reliability: source.reliability
        },
        url: source.url,
        pgn,
        players,
        result,
        event,
        date: this.parseDate(dateText),
        hash: this.generateHash(title + content),
        relevance: 0, // Will be calculated later
        category: this.categorizeContent(title + content),
        tags: this.extractTags(title + content),
        timestamp: new Date()
      };

      return story;

    } catch (error) {
      logger.warn('Failed to parse article', error);
      return null;
    }
  }

  /**
   * Filter and deduplicate stories
   */
  private async filterAndDeduplicate(stories: ChessStory[]): Promise<ChessStory[]> {
    const uniqueStories: ChessStory[] = [];
    const seenHashes = new Set<string>();

    // Check database for existing stories
    const existingHashes = await this.getExistingStoryHashes();

    stories.forEach(story => {
      if (!seenHashes.has(story.hash) && !existingHashes.has(story.hash)) {
        seenHashes.add(story.hash);
        uniqueStories.push(story);
      }
    });

    logger.info(`Filtered ${stories.length} stories to ${uniqueStories.length} unique stories`);
    return uniqueStories;
  }

  /**
   * Calculate relevance scores for stories
   */
  private async calculateRelevanceScores(stories: ChessStory[]): Promise<ChessStory[]> {
    return stories.map(story => ({
      ...story,
      relevance: this.calculateRelevanceScore(story)
    }));
  }

  /**
   * Calculate relevance score for a story
   */
  private calculateRelevanceScore(story: ChessStory): number {
    let score = 0;

    // Source reliability
    score += story.source.reliability * 0.3;

    // Content length (prefer substantial content)
    const contentLength = story.content.length;
    if (contentLength > 500) score += 20;
    else if (contentLength > 200) score += 10;

    // PGN presence (highly valuable)
    if (story.pgn) score += 30;

    // Players information
    if (story.players) score += 15;

    // Event information
    if (story.event) score += 10;

    // Category weighting
    switch (story.category) {
      case 'tournament': score += 25; break;
      case 'game': score += 20; break;
      case 'analysis': score += 15; break;
      case 'news': score += 10; break;
      case 'educational': score += 5; break;
    }

    // Keyword matching
    const keywords = ['magnus', 'carlsen', 'fide', 'world championship', 'tournament', 'analysis', 'opening', 'endgame'];
    const text = (story.title + story.content).toLowerCase();
    keywords.forEach(keyword => {
      if (text.includes(keyword)) score += 5;
    });

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Save stories to database
   */
  private async saveStories(stories: ChessStory[]): Promise<void> {
    if (stories.length === 0) return;

    try {
      await this.db.transaction(async (client: any) => {
        for (const story of stories) {
          await client.query(`
            INSERT INTO chess_stories (
              id, title, content, source_name, source_type, source_url, source_reliability,
              pgn, white_player, black_player, result, event, story_date, hash,
              relevance_score, category, tags, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            ON CONFLICT (hash) DO NOTHING
          `, [
            story.id, story.title, story.content, story.source.name, story.source.type,
            story.source.url, story.source.reliability, story.pgn, story.players?.white,
            story.players?.black, story.result, story.event, story.date, story.hash,
            story.relevance, story.category, story.tags, story.timestamp
          ]);
        }
      });

      logger.info(`✅ Saved ${stories.length} stories to database`);

    } catch (error) {
      logger.error('❌ Failed to save stories to database', error);
      throw error;
    }
  }

  /**
   * Get existing story hashes from database
   */
  private async getExistingStoryHashes(): Promise<Set<string>> {
    try {
      const result = await this.db.query('SELECT hash FROM chess_stories');
      return new Set(result.rows.map((row: any) => row.hash));
    } catch (error) {
      logger.error('Failed to get existing story hashes', error);
      return new Set();
    }
  }

  /**
   * Extract PGN from text
   */
  private extractPGN(text: string): string | undefined {
    const pgnRegex = /\[.*?\]\s*1\.\s*[a-h][1-8][a-h][1-8]/s;
    const match = text.match(pgnRegex);
    return match ? match[0] : undefined;
  }

  /**
   * Extract players from text
   */
  private extractPlayers(text: string): { white: string; black: string } | undefined {
    const playerRegex = /([A-Z][a-z]+)\s+vs\.?\s+([A-Z][a-z]+)/i;
    const match = text.match(playerRegex);
    if (match) {
      return { white: match[1], black: match[2] };
    }
    return undefined;
  }

  /**
   * Extract result from text
   */
  private extractResult(text: string): string | undefined {
    const resultRegex = /(1-0|0-1|1\/2-1\/2|\*)/;
    const match = text.match(resultRegex);
    return match ? match[1] : undefined;
  }

  /**
   * Extract event from text
   */
  private extractEvent(text: string): string | undefined {
    const eventKeywords = ['tournament', 'championship', 'open', 'match', 'league'];
    const lines = text.split('\n');
    for (const line of lines) {
      for (const keyword of eventKeywords) {
        if (line.toLowerCase().includes(keyword)) {
          return line.trim();
        }
      }
    }
    return undefined;
  }

  /**
   * Categorize content
   */
  private categorizeContent(text: string): ChessStory['category'] {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('tournament') || lowerText.includes('championship')) return 'tournament';
    if (lowerText.includes('game') || lowerText.includes('match')) return 'game';
    if (lowerText.includes('analysis') || lowerText.includes('opening') || lowerText.includes('endgame')) return 'analysis';
    if (lowerText.includes('learn') || lowerText.includes('tutorial') || lowerText.includes('lesson')) return 'educational';
    return 'news';
  }

  /**
   * Extract tags from text
   */
  private extractTags(text: string): string[] {
    const tags: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Chess-related tags
    if (lowerText.includes('magnus') || lowerText.includes('carlsen')) tags.push('magnus-carlsen');
    if (lowerText.includes('fide')) tags.push('fide');
    if (lowerText.includes('tournament')) tags.push('tournament');
    if (lowerText.includes('championship')) tags.push('championship');
    if (lowerText.includes('opening')) tags.push('opening');
    if (lowerText.includes('endgame')) tags.push('endgame');
    if (lowerText.includes('analysis')) tags.push('analysis');
    if (lowerText.includes('tactics')) tags.push('tactics');
    if (lowerText.includes('strategy')) tags.push('strategy');
    
    return tags;
  }

  /**
   * Check if Reddit post is relevant
   */
  private isRelevantRedditPost(data: any): boolean {
    const text = (data.title + data.selftext).toLowerCase();
    const relevantKeywords = ['chess', 'game', 'tournament', 'analysis', 'opening', 'endgame', 'magnus', 'carlsen'];
    
    return relevantKeywords.some(keyword => text.includes(keyword)) && 
           data.score > 10 && // Minimum upvotes
           !data.is_self || data.selftext?.length > 100; // Substantial content
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate hash for deduplication
   */
  private generateHash(text: string): string {
    return createHash('sha256').update(text).digest('hex');
  }

  /**
   * Parse date from various formats
   */
  private parseDate(dateText: string): string {
    try {
      const date = new Date(dateText);
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
}

// Export singleton instance
export const storyFetcher = new StoryFetcher();

// Export main function
export const fetchStories = () => storyFetcher.fetchStories(); 
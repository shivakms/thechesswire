import { Pool } from 'pg';
import { notificationSystem } from '../notifications';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  type: 'tournament' | 'player' | 'news' | 'analysis' | 'social';
  priority: number;
  isActive: boolean;
  lastCrawled: Date;
  crawlInterval: number; // minutes
  selectors: {
    title: string;
    content: string;
    author?: string;
    date?: string;
    image?: string;
  };
}

export interface DiscoveredNews {
  id: string;
  sourceId: string;
  title: string;
  content: string;
  url: string;
  author?: string;
  publishedAt?: Date;
  imageUrl?: string;
  category: string;
  confidence: number;
  isVerified: boolean;
  isPublished: boolean;
  createdAt: Date;
}

export interface NewsEvent {
  id: string;
  type: 'tournament_result' | 'player_achievement' | 'game_analysis' | 'breaking_news';
  title: string;
  description: string;
  players?: string[];
  tournament?: string;
  gameId?: string;
  importance: number; // 1-10
  isVerified: boolean;
  createdAt: Date;
}

class AINewsDiscoverySystem {
  private sources: NewsSource[] = [
    {
      id: 'lichess-blog',
      name: 'Lichess Blog',
      url: 'https://lichess.org/blog',
      type: 'news',
      priority: 9,
      isActive: true,
      lastCrawled: new Date(0),
      crawlInterval: 30,
      selectors: {
        title: 'h1, h2',
        content: '.blog-post-content',
        author: '.author',
        date: '.date',
        image: 'img'
      }
    },
    {
      id: 'chess-com-news',
      name: 'Chess.com News',
      url: 'https://www.chess.com/news',
      type: 'news',
      priority: 9,
      isActive: true,
      lastCrawled: new Date(0),
      crawlInterval: 30,
      selectors: {
        title: 'h1, h2',
        content: '.article-content',
        author: '.author-name',
        date: '.publish-date',
        image: '.article-image img'
      }
    },
    {
      id: 'fide-news',
      name: 'FIDE News',
      url: 'https://www.fide.com/news',
      type: 'tournament',
      priority: 10,
      isActive: true,
      lastCrawled: new Date(0),
      crawlInterval: 60,
      selectors: {
        title: 'h1, h2',
        content: '.news-content',
        author: '.author',
        date: '.news-date',
        image: '.news-image img'
      }
    },
    {
      id: 'chess24-news',
      name: 'Chess24 News',
      url: 'https://chess24.com/en/news',
      type: 'news',
      priority: 8,
      isActive: true,
      lastCrawled: new Date(0),
      crawlInterval: 45,
      selectors: {
        title: 'h1, h2',
        content: '.article-body',
        author: '.byline',
        date: '.publish-date',
        image: '.article-image img'
      }
    },
    {
      id: 'twitter-chess',
      name: 'Chess Twitter',
      url: 'https://twitter.com/search?q=chess&f=live',
      type: 'social',
      priority: 7,
      isActive: true,
      lastCrawled: new Date(0),
      crawlInterval: 15,
      selectors: {
        title: '.tweet-text',
        content: '.tweet-text',
        author: '.username',
        date: '.timestamp',
        image: '.tweet-image img'
      }
    }
  ];

  async startDiscoveryProcess(): Promise<void> {
    try {
      console.log('Starting AI News Discovery Process...');
      
      // Crawl all active sources
      await this.crawlAllSources();
      
      // Process discovered news
      await this.processDiscoveredNews();
      
      // Generate AI content
      await this.generateAIContent();
      
      // Verify and publish
      await this.verifyAndPublish();
      
      console.log('AI News Discovery Process completed');
    } catch (error) {
      console.error('News discovery process failed:', error);
    }
  }

  private async crawlAllSources(): Promise<void> {
    const activeSources = this.sources.filter(source => source.isActive);
    
    for (const source of activeSources) {
      try {
        await this.crawlSource(source);
        await this.updateSourceLastCrawled(source.id);
      } catch (error) {
        console.error(`Failed to crawl source ${source.name}:`, error);
      }
    }
  }

  private async crawlSource(source: NewsSource): Promise<void> {
    try {
      // This would use a web scraping library like Puppeteer or Cheerio
      // For now, we'll simulate the crawling process
      
      const discoveredNews = await this.simulateCrawling(source);
      
      // Store discovered news
      for (const news of discoveredNews) {
        await this.storeDiscoveredNews(news);
      }
      
      console.log(`Crawled ${discoveredNews.length} articles from ${source.name}`);
    } catch (error) {
      console.error(`Failed to crawl source ${source.name}:`, error);
    }
  }

  private async simulateCrawling(source: NewsSource): Promise<Partial<DiscoveredNews>[]> {
    // Simulate discovering news articles
    const mockNews = [
      {
        title: `Breaking: ${source.name} reports major tournament result`,
        content: 'A significant chess tournament has concluded with surprising results...',
        url: `${source.url}/article-1`,
        author: 'Chess Reporter',
        publishedAt: new Date(),
        imageUrl: 'https://example.com/image1.jpg',
        category: 'tournament',
        confidence: 0.85
      },
      {
        title: `Analysis: ${source.name} provides deep game analysis`,
        content: 'Expert analysis of a recent high-level game reveals strategic insights...',
        url: `${source.url}/article-2`,
        author: 'Chess Analyst',
        publishedAt: new Date(),
        imageUrl: 'https://example.com/image2.jpg',
        category: 'analysis',
        confidence: 0.90
      }
    ];

    return mockNews.map(news => ({
      ...news,
      sourceId: source.id
    }));
  }

  private async storeDiscoveredNews(news: Partial<DiscoveredNews>): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO discovered_news 
         (id, source_id, title, content, url, author, published_at, image_url, category, confidence, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
        [
          crypto.randomUUID(),
          news.sourceId,
          news.title,
          news.content,
          news.url,
          news.author,
          news.publishedAt,
          news.imageUrl,
          news.category,
          news.confidence
        ]
      );
    } catch (error) {
      console.error('Failed to store discovered news:', error);
    }
  }

  private async updateSourceLastCrawled(sourceId: string): Promise<void> {
    try {
      await pool.query(
        'UPDATE news_sources SET last_crawled = NOW() WHERE id = $1',
        [sourceId]
      );
    } catch (error) {
      console.error('Failed to update source last crawled:', error);
    }
  }

  private async processDiscoveredNews(): Promise<void> {
    try {
      // Get unprocessed news
      const result = await pool.query(
        'SELECT * FROM discovered_news WHERE is_processed = FALSE ORDER BY created_at DESC'
      );

      for (const news of result.rows) {
        await this.processNewsItem(news);
      }
    } catch (error) {
      console.error('Failed to process discovered news:', error);
    }
  }

  private async processNewsItem(news: any): Promise<void> {
    try {
      // Analyze content for key information
      const analysis = await this.analyzeNewsContent(news.content);
      
      // Extract entities (players, tournaments, etc.)
      const entities = await this.extractEntities(news.content);
      
      // Determine importance
      const importance = await this.calculateImportance(news, analysis, entities);
      
      // Update news with analysis results
      await pool.query(
        `UPDATE discovered_news 
         SET analysis_data = $1, entities = $2, importance_score = $3, is_processed = TRUE
         WHERE id = $4`,
        [JSON.stringify(analysis), JSON.stringify(entities), importance, news.id]
      );

      // Create news event if significant
      if (importance >= 7) {
        await this.createNewsEvent(news, analysis, entities, importance);
      }
    } catch (error) {
      console.error('Failed to process news item:', error);
    }
  }

  private async analyzeNewsContent(content: string): Promise<any> {
    // This would use AI to analyze content
    return {
      sentiment: 'positive',
      topics: ['tournament', 'chess', 'competition'],
      keyPhrases: ['championship', 'victory', 'strategy'],
      language: 'en',
      readability: 'high'
    };
  }

  private async extractEntities(content: string): Promise<any> {
    // This would use AI to extract named entities
    return {
      players: ['Magnus Carlsen', 'Hikaru Nakamura'],
      tournaments: ['World Chess Championship'],
      locations: ['Norway', 'Oslo'],
      dates: ['2024-01-15']
    };
  }

  private async calculateImportance(news: any, analysis: any, entities: any): Promise<number> {
    let score = 0;
    
    // Base score from confidence
    score += news.confidence * 3;
    
    // Entity importance
    if (entities.players?.length > 0) score += 2;
    if (entities.tournaments?.length > 0) score += 2;
    
    // Content analysis
    if (analysis.sentiment === 'positive') score += 1;
    if (analysis.topics?.includes('tournament')) score += 2;
    
    // Source priority
    const source = this.sources.find(s => s.id === news.source_id);
    if (source) score += source.priority * 0.1;
    
    return Math.min(10, Math.max(1, score));
  }

  private async createNewsEvent(news: any, analysis: any, entities: any, importance: number): Promise<void> {
    try {
      const eventType = this.determineEventType(news.category, entities);
      
      await pool.query(
        `INSERT INTO news_events 
         (id, type, title, description, players, tournament, importance, is_verified, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          crypto.randomUUID(),
          eventType,
          news.title,
          news.content.substring(0, 500),
          entities.players ? JSON.stringify(entities.players) : null,
          entities.tournaments ? entities.tournaments[0] : null,
          importance,
          false
        ]
      );
    } catch (error) {
      console.error('Failed to create news event:', error);
    }
  }

  private determineEventType(category: string, entities: any): string {
    if (entities.tournaments?.length > 0) return 'tournament_result';
    if (entities.players?.length > 0) return 'player_achievement';
    if (category === 'analysis') return 'game_analysis';
    return 'breaking_news';
  }

  private async generateAIContent(): Promise<void> {
    try {
      // Get high-importance news events
      const result = await pool.query(
        'SELECT * FROM news_events WHERE importance >= 7 AND is_verified = FALSE ORDER BY created_at DESC'
      );

      for (const event of result.rows) {
        await this.generateArticleFromEvent(event);
      }
    } catch (error) {
      console.error('Failed to generate AI content:', error);
    }
  }

  private async generateArticleFromEvent(event: any): Promise<void> {
    try {
      // Generate article using AI
      const article = await this.generateArticleContent(event);
      
      // Store generated article
      await pool.query(
        `INSERT INTO ai_generated_articles 
         (id, event_id, title, content, summary, tags, is_published, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          crypto.randomUUID(),
          event.id,
          article.title,
          article.content,
          article.summary,
          JSON.stringify(article.tags),
          false
        ]
      );
    } catch (error) {
      console.error('Failed to generate article from event:', error);
    }
  }

  private async generateArticleContent(event: any): Promise<any> {
    // This would use AI to generate article content
    return {
      title: `AI Analysis: ${event.title}`,
      content: `In a remarkable development in the chess world, ${event.description}...`,
      summary: `AI-powered analysis of recent chess developments reveals significant insights.`,
      tags: ['AI Analysis', 'Chess News', 'Tournament']
    };
  }

  private async verifyAndPublish(): Promise<void> {
    try {
      // Get unverified articles
      const result = await pool.query(
        'SELECT * FROM ai_generated_articles WHERE is_published = FALSE ORDER BY created_at DESC'
      );

      for (const article of result.rows) {
        const isVerified = await this.verifyArticle(article);
        
        if (isVerified) {
          await this.publishArticle(article);
        }
      }
    } catch (error) {
      console.error('Failed to verify and publish articles:', error);
    }
  }

  private async verifyArticle(article: any): Promise<boolean> {
    // This would use AI to verify article accuracy
    // For now, return true for demonstration
    return true;
  }

  private async publishArticle(article: any): Promise<void> {
    try {
      // Update article as published
      await pool.query(
        'UPDATE ai_generated_articles SET is_published = TRUE, published_at = NOW() WHERE id = $1',
        [article.id]
      );

      // Create notification for users
      await this.notifyUsersOfNewArticle(article);
      
      console.log(`Published article: ${article.title}`);
    } catch (error) {
      console.error('Failed to publish article:', error);
    }
  }

  private async notifyUsersOfNewArticle(article: any): Promise<void> {
    try {
      // Get users who want news notifications
      const result = await pool.query(
        'SELECT id FROM users WHERE notification_preferences->>\'news\' = \'true\''
      );

      for (const user of result.rows) {
        await notificationSystem.createNotification(
          user.id,
          'info',
          'New Chess Article',
          article.title,
          { articleId: article.id, type: 'news' }
        );
      }
    } catch (error) {
      console.error('Failed to notify users of new article:', error);
    }
  }

  async getLatestNews(limit: number = 10): Promise<any[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM ai_generated_articles 
         WHERE is_published = TRUE 
         ORDER BY published_at DESC 
         LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Failed to get latest news:', error);
      return [];
    }
  }

  async getNewsEvents(limit: number = 20): Promise<NewsEvent[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM news_events 
         ORDER BY created_at DESC 
         LIMIT $1`,
        [limit]
      );

      return result.rows.map(row => ({
        id: row.id,
        type: row.type,
        title: row.title,
        description: row.description,
        players: row.players ? JSON.parse(row.players) : [],
        tournament: row.tournament,
        gameId: row.game_id,
        importance: row.importance,
        isVerified: row.is_verified,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Failed to get news events:', error);
      return [];
    }
  }

  async searchNews(query: string, limit: number = 10): Promise<any[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM ai_generated_articles 
         WHERE is_published = TRUE 
         AND (title ILIKE $1 OR content ILIKE $1 OR tags::text ILIKE $1)
         ORDER BY published_at DESC 
         LIMIT $2`,
        [`%${query}%`, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Failed to search news:', error);
      return [];
    }
  }
}

// Singleton instance
const aiNewsDiscoverySystem = new AINewsDiscoverySystem();

export { aiNewsDiscoverySystem, AINewsDiscoverySystem }; 
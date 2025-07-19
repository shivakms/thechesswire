import { pool } from './database';
import { logSecurityEvent } from './security';

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  source: string;
  url: string;
  publishedAt: Date;
  category: string;
  tags: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  importance: number; // 1-10 scale
  aiGenerated: boolean;
  verified: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TournamentResult {
  id: string;
  tournamentName: string;
  location: string;
  startDate: Date;
  endDate: Date;
  winner: string;
  runnerUp: string;
  participants: string[];
  prizePool: string;
  timeControl: string;
  category: string;
  fideRating: boolean;
  results: GameResult[];
}

export interface GameResult {
  white: string;
  black: string;
  result: '1-0' | '0-1' | '1/2-1/2';
  moves: string;
  opening: string;
  timeControl: string;
  date: Date;
}

export interface PlayerUpdate {
  id: string;
  playerName: string;
  currentRating: number;
  previousRating: number;
  ratingChange: number;
  federation: string;
  title: string;
  gamesPlayed: number;
  lastUpdated: Date;
}

export interface TrendingTopic {
  id: string;
  topic: string;
  mentions: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  relatedArticles: string[];
  trendingSince: Date;
  category: string;
}

class NewsDiscoverySystem {
  private static instance: NewsDiscoverySystem;
  private isRunning: boolean = false;
  private sources: string[] = [
    'https://chess.com/news',
    'https://lichess.org/blog',
    'https://fide.com/news',
    'https://chess24.com/en/news',
    'https://chessbase.com/news'
  ];

  private constructor() {}

  static getInstance(): NewsDiscoverySystem {
    if (!NewsDiscoverySystem.instance) {
      NewsDiscoverySystem.instance = new NewsDiscoverySystem();
    }
    return NewsDiscoverySystem.instance;
  }

  // Start the news discovery system
  async startDiscovery(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('📰 Starting news discovery system...');

    // Start periodic discovery
    this.startPeriodicDiscovery();
    
    // Start content generation
    this.startContentGeneration();
    
    // Start trending topic analysis
    this.startTrendingAnalysis();
  }

  // Stop the news discovery system
  stopDiscovery(): void {
    this.isRunning = false;
    console.log('🛑 Stopping news discovery system...');
  }

  // Periodic discovery loop
  private async startPeriodicDiscovery(): Promise<void> {
    const runDiscovery = async () => {
      if (!this.isRunning) return;

      try {
        await this.discoverNews();
        await this.discoverTournamentResults();
        await this.discoverPlayerUpdates();
        await this.verifyContent();
        
      } catch (error) {
        console.error('News discovery error:', error);
        await this.logError('News discovery failed', error as Error);
      }

      // Schedule next discovery (every 30 minutes)
      setTimeout(runDiscovery, 30 * 60 * 1000);
    };

    runDiscovery();
  }

  // Discover news from various sources
  private async discoverNews(): Promise<void> {
    console.log('🔍 Discovering news from sources...');

    for (const source of this.sources) {
      try {
        const articles = await this.scrapeSource(source);
        
        for (const article of articles) {
          await this.processArticle(article);
        }
        
      } catch (error) {
        console.error(`Failed to scrape ${source}:`, error);
      }
    }
  }

  // Scrape a news source
  private async scrapeSource(url: string): Promise<Partial<NewsArticle>[]> {
    // This is a simplified version - in production, you'd use a proper web scraper
    // like Puppeteer or Cheerio with proper rate limiting and respect for robots.txt
    
    const mockArticles: Partial<NewsArticle>[] = [
      {
        title: 'Magnus Carlsen Wins Another Tournament',
        content: 'In a stunning display of chess mastery, Magnus Carlsen secured yet another tournament victory...',
        summary: 'Magnus Carlsen continues his dominance in competitive chess',
        author: 'Chess.com Staff',
        source: url,
        url: `${url}/article-1`,
        publishedAt: new Date(),
        category: 'tournament',
        tags: ['magnus carlsen', 'tournament', 'victory'],
        sentiment: 'positive',
        importance: 8,
        aiGenerated: false,
        verified: false
      }
    ];

    return mockArticles;
  }

  // Process and store an article
  private async processArticle(article: Partial<NewsArticle>): Promise<void> {
    try {
      // Check if article already exists
      const existing = await this.checkArticleExists(article.url!);
      if (existing) return;

      // Generate AI content if needed
      if (article.aiGenerated) {
        article.content = await this.generateAIContent(article.title!, article.summary!);
      }

      // Analyze sentiment and importance
      const analysis = await this.analyzeContent(article.content!);
      article.sentiment = analysis.sentiment;
      article.importance = analysis.importance;

      // Store in database
      await this.storeArticle(article as NewsArticle);

    } catch (error) {
      console.error('Failed to process article:', error);
    }
  }

  // Discover tournament results
  private async discoverTournamentResults(): Promise<void> {
    console.log('🏆 Discovering tournament results...');

    // This would scrape tournament result pages
    const mockTournaments: Partial<TournamentResult>[] = [
      {
        tournamentName: 'Chess.com Global Championship 2024',
        location: 'Online',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-15'),
        winner: 'Magnus Carlsen',
        runnerUp: 'Hikaru Nakamura',
        participants: ['Magnus Carlsen', 'Hikaru Nakamura', 'Fabiano Caruana', 'Ding Liren'],
        prizePool: '$100,000',
        timeControl: '15+10',
        category: 'Online Championship',
        fideRating: true,
        results: []
      }
    ];

    for (const tournament of mockTournaments) {
      await this.processTournamentResult(tournament as TournamentResult);
    }
  }

  // Process tournament result
  private async processTournamentResult(tournament: TournamentResult): Promise<void> {
    try {
      // Check if tournament already exists
      const existing = await this.checkTournamentExists(tournament.tournamentName);
      if (existing) return;

      // Generate tournament report
      const report = await this.generateTournamentReport(tournament);

      // Store tournament result
      await this.storeTournamentResult(tournament);

      // Create news article about the tournament
      await this.createTournamentArticle(tournament, report);

    } catch (error) {
      console.error('Failed to process tournament result:', error);
    }
  }

  // Discover player updates
  private async discoverPlayerUpdates(): Promise<void> {
    console.log('👤 Discovering player updates...');

    // This would scrape rating lists and player profiles
    const mockUpdates: Partial<PlayerUpdate>[] = [
      {
        playerName: 'Magnus Carlsen',
        currentRating: 2830,
        previousRating: 2828,
        ratingChange: 2,
        federation: 'NOR',
        title: 'GM',
        gamesPlayed: 45,
        lastUpdated: new Date()
      }
    ];

    for (const update of mockUpdates) {
      await this.processPlayerUpdate(update as PlayerUpdate);
    }
  }

  // Process player update
  private async processPlayerUpdate(update: PlayerUpdate): Promise<void> {
    try {
      // Check if update is significant
      if (Math.abs(update.ratingChange) >= 5) {
        // Generate rating change article
        await this.createRatingChangeArticle(update);
      }

      // Store player update
      await this.storePlayerUpdate(update);

    } catch (error) {
      console.error('Failed to process player update:', error);
    }
  }

  // Content generation system
  private async startContentGeneration(): Promise<void> {
    const generateContent = async () => {
      if (!this.isRunning) return;

      try {
        await this.generateDailyDigest();
        await this.generateWeeklyReport();
        await this.generateControversyArticle();
        
      } catch (error) {
        console.error('Content generation error:', error);
      }

      // Schedule next generation (every 6 hours)
      setTimeout(generateContent, 6 * 60 * 60 * 1000);
    };

    generateContent();
  }

  // Generate daily digest
  private async generateDailyDigest(): Promise<void> {
    console.log('📅 Generating daily digest...');

    const todayArticles = await this.getRecentArticles(1); // Last 24 hours
    const todayTournaments = await this.getRecentTournaments(1);
    const todayUpdates = await this.getRecentPlayerUpdates(1);

    const digest = await this.createDailyDigest(todayArticles, todayTournaments, todayUpdates);
    await this.storeArticle(digest);
  }

  // Generate weekly report
  private async generateWeeklyReport(): Promise<void> {
    console.log('📊 Generating weekly report...');

    const weekArticles = await this.getRecentArticles(7); // Last 7 days
    const weekTournaments = await this.getRecentTournaments(7);
    const weekUpdates = await this.getRecentPlayerUpdates(7);

    const report = await this.createWeeklyReport(weekArticles, weekTournaments, weekUpdates);
    await this.storeArticle(report);
  }

  // Generate controversy article
  private async generateControversyArticle(): Promise<void> {
    console.log('🔥 Generating controversy article...');

    const controversialTopics = await this.getControversialTopics();
    
    if (controversialTopics.length > 0) {
      const article = await this.createControversyArticle(controversialTopics[0]);
      await this.storeArticle(article);
    }
  }

  // Trending topic analysis
  private async startTrendingAnalysis(): Promise<void> {
    const analyzeTrends = async () => {
      if (!this.isRunning) return;

      try {
        await this.analyzeTrendingTopics();
        await this.updateTrendingScores();
        
      } catch (error) {
        console.error('Trending analysis error:', error);
      }

      // Schedule next analysis (every hour)
      setTimeout(analyzeTrends, 60 * 60 * 1000);
    };

    analyzeTrends();
  }

  // Analyze trending topics
  private async analyzeTrendingTopics(): Promise<void> {
    console.log('📈 Analyzing trending topics...');

    const recentArticles = await this.getRecentArticles(24); // Last 24 hours
    
    // Extract topics and count mentions
    const topicMentions = new Map<string, number>();
    
    for (const article of recentArticles) {
      for (const tag of article.tags) {
        const count = topicMentions.get(tag) || 0;
        topicMentions.set(tag, count + 1);
      }
    }

    // Find trending topics (mentioned more than 3 times)
    const trendingTopics = Array.from(topicMentions.entries())
      .filter(([_, count]) => count >= 3)
      .map(([topic, mentions]) => ({
        topic,
        mentions,
        sentiment: this.analyzeTopicSentiment(topic, recentArticles),
        relatedArticles: this.findRelatedArticles(topic, recentArticles),
        category: this.categorizeTopic(topic)
      }));

    // Store trending topics
    for (const topic of trendingTopics) {
      await this.storeTrendingTopic(topic);
    }
  }

  // AI Content Generation
  private async generateAIContent(title: string, summary: string): Promise<string> {
    // This would integrate with OpenAI, Claude, or other AI services
    // For now, returning a mock generated article
    
    const prompt = `Write a comprehensive chess article about: ${title}
    
    Summary: ${summary}
    
    Requirements:
    - 1000+ words
    - Engaging and informative
    - Include chess analysis where relevant
    - Professional tone
    - Include relevant chess terminology`;

    // Mock AI response
    return `In the ever-evolving world of competitive chess, ${title} represents a significant milestone in the sport's rich history. This comprehensive analysis delves deep into the strategic nuances and tactical brilliance that defined this remarkable event.

    The opening phase of the tournament showcased the players' deep preparation and understanding of modern chess theory. Each move was carefully calculated, with both players demonstrating exceptional positional awareness and tactical acumen.

    As the middlegame unfolded, the complexity of the positions increased dramatically. The players navigated through intricate tactical sequences with remarkable precision, showcasing their ability to calculate deeply and accurately under pressure.

    The endgame phase proved to be equally fascinating, with both players demonstrating exceptional technique and endgame knowledge. The conversion of advantages required precise calculation and flawless execution.

    This tournament serves as a testament to the incredible skill and dedication of modern chess players. The level of play consistently reached new heights, pushing the boundaries of what was previously thought possible in competitive chess.

    The implications of this event extend far beyond the immediate results. It represents a new standard in competitive chess, setting the bar even higher for future tournaments and players aspiring to reach the pinnacle of the sport.

    As we reflect on this remarkable achievement, it becomes clear that chess continues to evolve and improve. The combination of human creativity and analytical precision creates a beautiful synergy that makes chess one of the most intellectually demanding and rewarding games ever created.

    The future of chess looks brighter than ever, with players continuing to push the boundaries of what's possible. This tournament serves as both a celebration of current achievements and a preview of the exciting developments yet to come in the world of competitive chess.`;
  }

  // Content analysis
  private async analyzeContent(content: string): Promise<{ sentiment: 'positive' | 'negative' | 'neutral'; importance: number }> {
    // This would use NLP or AI services for sentiment analysis
    // For now, using simple keyword analysis
    
    const positiveWords = ['win', 'victory', 'success', 'brilliant', 'amazing', 'excellent'];
    const negativeWords = ['loss', 'defeat', 'failure', 'disappointing', 'poor', 'terrible'];
    
    const words = content.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    for (const word of words) {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    }
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';
    
    // Calculate importance based on content length and keyword density
    const importance = Math.min(10, Math.max(1, Math.floor(content.length / 100) + positiveCount + negativeCount));
    
    return { sentiment, importance };
  }

  // Content verification
  private async verifyContent(): Promise<void> {
    console.log('✅ Verifying content...');

    const unverifiedArticles = await this.getUnverifiedArticles();
    
    for (const article of unverifiedArticles) {
      const isVerified = await this.verifyArticle(article);
      
      if (isVerified) {
        await this.markArticleVerified(article.id);
      }
    }
  }

  // Database operations
  private async checkArticleExists(url: string): Promise<boolean> {
    const result = await pool.query('SELECT id FROM news_articles WHERE url = $1', [url]);
    return result.rows.length > 0;
  }

  private async storeArticle(article: NewsArticle): Promise<void> {
    await pool.query(`
      INSERT INTO news_articles (
        id, title, content, summary, author, source, url, published_at, 
        category, tags, sentiment, importance, ai_generated, verified, 
        views, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `, [
      article.id, article.title, article.content, article.summary, article.author,
      article.source, article.url, article.publishedAt, article.category,
      JSON.stringify(article.tags), article.sentiment, article.importance,
      article.aiGenerated, article.verified, article.views, article.createdAt, article.updatedAt
    ]);
  }

  private async getRecentArticles(days: number): Promise<NewsArticle[]> {
    const result = await pool.query(
      'SELECT * FROM news_articles WHERE created_at > NOW() - INTERVAL $1 days ORDER BY created_at DESC',
      [days]
    );
    return result.rows;
  }

  private async getUnverifiedArticles(): Promise<NewsArticle[]> {
    const result = await pool.query(
      'SELECT * FROM news_articles WHERE verified = FALSE ORDER BY created_at DESC'
    );
    return result.rows;
  }

  private async markArticleVerified(articleId: string): Promise<void> {
    await pool.query(
      'UPDATE news_articles SET verified = TRUE, updated_at = NOW() WHERE id = $1',
      [articleId]
    );
  }

  // Tournament operations
  private async checkTournamentExists(name: string): Promise<boolean> {
    const result = await pool.query('SELECT id FROM tournament_results WHERE tournament_name = $1', [name]);
    return result.rows.length > 0;
  }

  private async storeTournamentResult(tournament: TournamentResult): Promise<void> {
    await pool.query(`
      INSERT INTO tournament_results (
        id, tournament_name, location, start_date, end_date, winner, runner_up,
        participants, prize_pool, time_control, category, fide_rating, results
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      tournament.id, tournament.tournamentName, tournament.location,
      tournament.startDate, tournament.endDate, tournament.winner, tournament.runnerUp,
      JSON.stringify(tournament.participants), tournament.prizePool,
      tournament.timeControl, tournament.category, tournament.fideRating,
      JSON.stringify(tournament.results)
    ]);
  }

  private async getRecentTournaments(days: number): Promise<TournamentResult[]> {
    const result = await pool.query(
      'SELECT * FROM tournament_results WHERE end_date > NOW() - INTERVAL $1 days ORDER BY end_date DESC',
      [days]
    );
    return result.rows;
  }

  // Player update operations
  private async storePlayerUpdate(update: PlayerUpdate): Promise<void> {
    await pool.query(`
      INSERT INTO player_updates (
        id, player_name, current_rating, previous_rating, rating_change,
        federation, title, games_played, last_updated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      update.id, update.playerName, update.currentRating, update.previousRating,
      update.ratingChange, update.federation, update.title, update.gamesPlayed, update.lastUpdated
    ]);
  }

  private async getRecentPlayerUpdates(days: number): Promise<PlayerUpdate[]> {
    const result = await pool.query(
      'SELECT * FROM player_updates WHERE last_updated > NOW() - INTERVAL $1 days ORDER BY last_updated DESC',
      [days]
    );
    return result.rows;
  }

  // Trending topic operations
  private async storeTrendingTopic(topic: Partial<TrendingTopic>): Promise<void> {
    await pool.query(`
      INSERT INTO trending_topics (
        id, topic, mentions, sentiment, related_articles, trending_since, category
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      topic.id, topic.topic, topic.mentions, topic.sentiment,
      JSON.stringify(topic.relatedArticles), topic.trendingSince, topic.category
    ]);
  }

  // Utility methods
  private analyzeTopicSentiment(topic: string, articles: NewsArticle[]): 'positive' | 'negative' | 'neutral' {
    // Simple sentiment analysis based on article sentiments
    const relevantArticles = articles.filter(article => 
      article.tags.includes(topic) || article.title.toLowerCase().includes(topic.toLowerCase())
    );
    
    if (relevantArticles.length === 0) return 'neutral';
    
    const positiveCount = relevantArticles.filter(a => a.sentiment === 'positive').length;
    const negativeCount = relevantArticles.filter(a => a.sentiment === 'negative').length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private findRelatedArticles(topic: string, articles: NewsArticle[]): string[] {
    return articles
      .filter(article => 
        article.tags.includes(topic) || article.title.toLowerCase().includes(topic.toLowerCase())
      )
      .map(article => article.id);
  }

  private categorizeTopic(topic: string): string {
    const categories = {
      players: ['magnus carlsen', 'hikaru nakamura', 'fabiano caruana', 'ding liren'],
      tournaments: ['championship', 'tournament', 'cup', 'open'],
      openings: ['sicilian', 'ruy lopez', 'queen\'s gambit', 'king\'s indian'],
      events: ['olympiad', 'world championship', 'candidates']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => topic.toLowerCase().includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }

  private async logError(message: string, error: Error): Promise<void> {
    console.error(message, error);
    // This would integrate with your error logging system
  }

  // Mock methods for content generation
  private async createDailyDigest(articles: NewsArticle[], tournaments: TournamentResult[], updates: PlayerUpdate[]): Promise<NewsArticle> {
    return {
      id: `digest-${Date.now()}`,
      title: 'Daily Chess Digest',
      content: 'Today in chess...',
      summary: 'A summary of today\'s chess news',
      author: 'TheChessWire AI',
      source: 'TheChessWire.news',
      url: '/digest/daily',
      publishedAt: new Date(),
      category: 'digest',
      tags: ['daily', 'digest', 'news'],
      sentiment: 'neutral',
      importance: 5,
      aiGenerated: true,
      verified: true,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async createWeeklyReport(articles: NewsArticle[], tournaments: TournamentResult[], updates: PlayerUpdate[]): Promise<NewsArticle> {
    return {
      id: `report-${Date.now()}`,
      title: 'Weekly Chess Report',
      content: 'This week in chess...',
      summary: 'A comprehensive weekly report',
      author: 'TheChessWire AI',
      source: 'TheChessWire.news',
      url: '/report/weekly',
      publishedAt: new Date(),
      category: 'report',
      tags: ['weekly', 'report', 'analysis'],
      sentiment: 'neutral',
      importance: 7,
      aiGenerated: true,
      verified: true,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async createControversyArticle(topic: any): Promise<NewsArticle> {
    return {
      id: `controversy-${Date.now()}`,
      title: 'Chess Controversy: ' + topic.topic,
      content: 'A controversial topic in chess...',
      summary: 'Analysis of a controversial chess topic',
      author: 'TheChessWire AI',
      source: 'TheChessWire.news',
      url: '/controversy/' + topic.topic,
      publishedAt: new Date(),
      category: 'controversy',
      tags: ['controversy', topic.topic],
      sentiment: 'neutral',
      importance: 8,
      aiGenerated: true,
      verified: true,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async generateTournamentReport(tournament: TournamentResult): Promise<string> {
    return `Tournament report for ${tournament.tournamentName}...`;
  }

  private async createTournamentArticle(tournament: TournamentResult, report: string): Promise<void> {
    // Create article about tournament
  }

  private async createRatingChangeArticle(update: PlayerUpdate): Promise<void> {
    // Create article about rating change
  }

  private async getControversialTopics(): Promise<any[]> {
    return []; // Mock implementation
  }

  private async verifyArticle(article: NewsArticle): Promise<boolean> {
    // Mock verification - in production, this would check multiple sources
    return Math.random() > 0.3; // 70% verification rate
  }

  private async updateTrendingScores(): Promise<void> {
    // Update trending topic scores
  }

  // Public methods
  async getLatestNews(limit: number = 10): Promise<NewsArticle[]> {
    const result = await pool.query(
      'SELECT * FROM news_articles ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  async getNewsByCategory(category: string, limit: number = 10): Promise<NewsArticle[]> {
    const result = await pool.query(
      'SELECT * FROM news_articles WHERE category = $1 ORDER BY created_at DESC LIMIT $2',
      [category, limit]
    );
    return result.rows;
  }

  async searchNews(query: string, limit: number = 10): Promise<NewsArticle[]> {
    const result = await pool.query(
      'SELECT * FROM news_articles WHERE title ILIKE $1 OR content ILIKE $1 ORDER BY created_at DESC LIMIT $2',
      [`%${query}%`, limit]
    );
    return result.rows;
  }

  async getTrendingTopics(): Promise<TrendingTopic[]> {
    const result = await pool.query(
      'SELECT * FROM trending_topics ORDER BY mentions DESC LIMIT 10'
    );
    return result.rows;
  }
}

export const newsDiscoverySystem = NewsDiscoverySystem.getInstance();

// Auto-start in production
if (process.env.NODE_ENV === 'production') {
  newsDiscoverySystem.startDiscovery();
} 
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const { pool } = require('../database');
const { logSecurityEvent } = require('./monitoring');
const { generateVoiceScript } = require('./ai');

// Chess news sources to crawl
const CHESS_SOURCES = [
  { name: 'FIDE', url: 'https://www.fide.com/news', type: 'official' },
  { name: 'Chess.com', url: 'https://www.chess.com/news', type: 'commercial' },
  { name: 'Lichess', url: 'https://lichess.org/blog', type: 'community' },
  { name: 'Chess24', url: 'https://chess24.com/en/news', type: 'commercial' },
  { name: 'The Week in Chess', url: 'http://theweekinchess.com', type: 'news' },
  { name: 'ChessBase', url: 'https://en.chessbase.com', type: 'news' },
  { name: 'US Chess', url: 'https://new.uschess.org/news', type: 'official' },
  { name: 'European Chess Union', url: 'https://www.europechess.org/news', type: 'official' }
];

// Event detection patterns
const EVENT_PATTERNS = {
  tournament: [
    /tournament/i, /championship/i, /open/i, /invitational/i,
    /world cup/i, /olympiad/i, /candidates/i, /match/i
  ],
  player_news: [
    /grandmaster/i, /gm/i, /international master/i, /im/i,
    /retires/i, /announces/i, /joins/i, /leaves/i
  ],
  game_analysis: [
    /brilliancy/i, /masterpiece/i, /analysis/i, /review/i,
    /opening/i, /endgame/i, /tactics/i, /strategy/i
  ],
  controversy: [
    /cheat/i, /scandal/i, /controversy/i, /allegation/i,
    /investigation/i, /banned/i, /suspended/i
  ],
  technology: [
    /ai/i, /computer/i, /engine/i, /software/i,
    /online/i, /platform/i, /app/i, /digital/i
  ]
};

class NewsDiscoverySystem {
  constructor() {
    this.discoveredNews = new Map();
    this.verificationQueue = [];
    this.publishingQueue = [];
    this.trendingTopics = new Set();
    this.factCheckResults = new Map();
  }

  // Start the 24/7 news discovery system
  async start() {
    console.log('🚀 Starting Autonomous News Discovery System...');
    
    // Schedule news crawling every 15 minutes
    cron.schedule('*/15 * * * *', () => {
      this.crawlAllSources();
    });

    // Schedule event detection every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.detectEvents();
    });

    // Schedule fact-checking every 10 minutes
    cron.schedule('*/10 * * * *', () => {
      this.factCheckQueue();
    });

    // Schedule self-publishing every 30 minutes
    cron.schedule('*/30 * * * *', () => {
      this.publishVerifiedNews();
    });

    // Schedule trending topic analysis every hour
    cron.schedule('0 * * * *', () => {
      this.analyzeTrendingTopics();
    });

    // Initial crawl
    await this.crawlAllSources();
  }

  // Crawl all chess news sources
  async crawlAllSources() {
    console.log('🔍 Crawling chess news sources...');
    
    for (const source of CHESS_SOURCES) {
      try {
        await this.crawlSource(source);
        await this.delay(1000); // Respect rate limits
      } catch (error) {
        console.error(`Error crawling ${source.name}:`, error);
        await logSecurityEvent({
          eventType: 'news_crawl_error',
          details: { source: source.name, error: error.message }
        });
      }
    }
  }

  // Crawl individual source
  async crawlSource(source) {
    const response = await axios.get(source.url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'TheChessWire-NewsBot/1.0'
      }
    });

    const $ = cheerio.load(response.data);
    const articles = [];

    // Extract articles based on source type
    if (source.type === 'official') {
      $('article, .news-item, .post').each((i, element) => {
        const title = $(element).find('h1, h2, h3, .title').first().text().trim();
        const content = $(element).find('p, .content, .excerpt').text().trim();
        const link = $(element).find('a').attr('href');
        const date = $(element).find('.date, time').attr('datetime') || 
                    $(element).find('.date, time').text().trim();

        if (title && content) {
          articles.push({
            title,
            content: content.substring(0, 500),
            link: link ? new URL(link, source.url).href : null,
            date,
            source: source.name,
            sourceType: source.type
          });
        }
      });
    } else {
      // Generic extraction for other sources
      $('h1, h2, h3').each((i, element) => {
        const title = $(element).text().trim();
        const content = $(element).next('p').text().trim();
        const link = $(element).find('a').attr('href');

        if (title && content) {
          articles.push({
            title,
            content: content.substring(0, 500),
            link: link ? new URL(link, source.url).href : null,
            date: new Date().toISOString(),
            source: source.name,
            sourceType: source.type
          });
        }
      });
    }

    // Store discovered articles
    for (const article of articles) {
      const hash = this.generateContentHash(article.title + article.content);
      if (!this.discoveredNews.has(hash)) {
        this.discoveredNews.set(hash, {
          ...article,
          hash,
          discoveredAt: new Date(),
          verified: false,
          factChecked: false,
          published: false
        });
        this.verificationQueue.push(hash);
      }
    }

    console.log(`📰 Discovered ${articles.length} articles from ${source.name}`);
  }

  // Detect events in discovered news
  async detectEvents() {
    console.log('🎯 Detecting events in discovered news...');
    
    for (const [hash, news] of this.discoveredNews) {
      if (!news.eventType) {
        const eventType = this.classifyEvent(news.title + ' ' + news.content);
        if (eventType) {
          news.eventType = eventType;
          news.eventDetectedAt = new Date();
          
          // Update trending topics
          this.trendingTopics.add(eventType);
          
          console.log(`🎯 Event detected: ${eventType} - ${news.title}`);
        }
      }
    }
  }

  // Classify event type based on content
  classifyEvent(content) {
    const lowerContent = content.toLowerCase();
    
    for (const [eventType, patterns] of Object.entries(EVENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(lowerContent)) {
          return eventType;
        }
      }
    }
    
    return null;
  }

  // Multi-source verification
  async verifyNews(hash) {
    const news = this.discoveredNews.get(hash);
    if (!news || news.verified) return;

    console.log(`🔍 Verifying: ${news.title}`);
    
    // Check if similar news exists from other sources
    const similarNews = [];
    for (const [otherHash, otherNews] of this.discoveredNews) {
      if (otherHash !== hash && this.isSimilarNews(news, otherNews)) {
        similarNews.push(otherNews);
      }
    }

    // Calculate verification score
    const verificationScore = this.calculateVerificationScore(news, similarNews);
    
    if (verificationScore >= 0.7) {
      news.verified = true;
      news.verificationScore = verificationScore;
      news.verifiedAt = new Date();
      news.similarSources = similarNews.map(n => n.source);
      
      // Add to publishing queue
      this.publishingQueue.push(hash);
      
      console.log(`✅ Verified: ${news.title} (Score: ${verificationScore})`);
    } else {
      console.log(`❌ Failed verification: ${news.title} (Score: ${verificationScore})`);
    }
  }

  // Check if two news items are similar
  isSimilarNews(news1, news2) {
    const title1 = news1.title.toLowerCase();
    const title2 = news2.title.toLowerCase();
    
    // Simple similarity check (in production, use more sophisticated NLP)
    const commonWords = title1.split(' ').filter(word => 
      title2.includes(word) && word.length > 3
    );
    
    return commonWords.length >= 2;
  }

  // Calculate verification score
  calculateVerificationScore(news, similarNews) {
    let score = 0;
    
    // Source credibility
    const sourceCredibility = {
      'FIDE': 1.0,
      'US Chess': 0.9,
      'European Chess Union': 0.9,
      'Chess.com': 0.8,
      'Chess24': 0.8,
      'ChessBase': 0.8,
      'The Week in Chess': 0.7,
      'Lichess': 0.6
    };
    
    score += sourceCredibility[news.source] || 0.5;
    
    // Multiple source confirmation
    if (similarNews.length > 0) {
      score += Math.min(similarNews.length * 0.2, 0.4);
    }
    
    // Content quality
    if (news.content.length > 100) score += 0.1;
    if (news.link) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  // Fact-checking system
  async factCheckQueue() {
    console.log('🔬 Running fact-checking on verification queue...');
    
    for (const hash of this.verificationQueue) {
      const news = this.discoveredNews.get(hash);
      if (news && news.verified && !news.factChecked) {
        await this.factCheckNews(hash);
      }
    }
  }

  // Fact-check individual news item
  async factCheckNews(hash) {
    const news = this.discoveredNews.get(hash);
    if (!news) return;

    console.log(`🔬 Fact-checking: ${news.title}`);
    
    try {
      // Use AI to fact-check the content
      const factCheckPrompt = `
        Fact-check this chess news article:
        
        Title: ${news.title}
        Content: ${news.content}
        Source: ${news.source}
        
        Verify:
        1. Are the facts accurate?
        2. Are the player names and titles correct?
        3. Are the tournament names and dates accurate?
        4. Are there any contradictions with known chess facts?
        
        Respond with a confidence score (0-1) and any corrections needed.
      `;

      const factCheckResult = await generateVoiceScript(factCheckPrompt, 'calm');
      
      // Parse AI response for confidence score
      const confidenceMatch = factCheckResult.match(/confidence score[:\s]*([0-9.]+)/i);
      const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5;
      
      news.factChecked = true;
      news.factCheckScore = confidence;
      news.factCheckedAt = new Date();
      news.factCheckResult = factCheckResult;
      
      if (confidence >= 0.8) {
        console.log(`✅ Fact-check passed: ${news.title} (Score: ${confidence})`);
      } else {
        console.log(`⚠️ Fact-check warning: ${news.title} (Score: ${confidence})`);
      }
      
    } catch (error) {
      console.error(`Fact-check error for ${news.title}:`, error);
      news.factChecked = true;
      news.factCheckScore = 0.5; // Default score on error
    }
  }

  // Self-publishing system
  async publishVerifiedNews() {
    console.log('📝 Publishing verified news...');
    
    for (const hash of this.publishingQueue) {
      const news = this.discoveredNews.get(hash);
      if (news && news.verified && news.factChecked && !news.published) {
        await this.publishNews(hash);
      }
    }
  }

  // Publish individual news item
  async publishNews(hash) {
    const news = this.discoveredNews.get(hash);
    if (!news) return;

    console.log(`📝 Publishing: ${news.title}`);
    
    try {
      // Generate AI-enhanced content
      const enhancedContent = await this.generateEnhancedContent(news);
      
      // Save to database
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO news_articles (
            title, content, source, source_url, event_type, 
            verification_score, fact_check_score, published_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            news.title,
            enhancedContent,
            news.source,
            news.link,
            news.eventType,
            news.verificationScore,
            news.factCheckScore,
            new Date()
          ]
        );
        
        news.published = true;
        news.publishedAt = new Date();
        
        console.log(`✅ Published: ${news.title}`);
        
      } finally {
        client.release();
      }
      
    } catch (error) {
      console.error(`Publishing error for ${news.title}:`, error);
    }
  }

  // Generate AI-enhanced content
  async generateEnhancedContent(news) {
    const prompt = `
      Enhance this chess news article with additional context and analysis:
      
      Original Title: ${news.title}
      Original Content: ${news.content}
      Event Type: ${news.eventType}
      Source: ${news.source}
      
      Create an enhanced version that includes:
      1. Historical context if relevant
      2. Player background information
      3. Tournament significance
      4. Potential impact on the chess world
      5. Engaging narrative style
      
      Make it informative, engaging, and suitable for TheChessWire.news audience.
    `;

    try {
      const enhancedContent = await generateVoiceScript(prompt, 'expressive');
      return enhancedContent;
    } catch (error) {
      console.error('Content enhancement failed:', error);
      return news.content; // Fallback to original content
    }
  }

  // Analyze trending topics
  async analyzeTrendingTopics() {
    console.log('📊 Analyzing trending topics...');
    
    const topicCounts = {};
    for (const topic of this.trendingTopics) {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }
    
    // Sort by frequency
    const sortedTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    console.log('🔥 Trending topics:', sortedTopics);
    
    // Store trending topics in database
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO trending_topics (topics, analyzed_at) VALUES ($1, $2)`,
        [JSON.stringify(sortedTopics), new Date()]
      );
    } finally {
      client.release();
    }
  }

  // Generate content hash
  generateContentHash(content) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get system status
  getStatus() {
    return {
      discoveredNews: this.discoveredNews.size,
      verificationQueue: this.verificationQueue.length,
      publishingQueue: this.publishingQueue.length,
      trendingTopics: Array.from(this.trendingTopics),
      lastCrawl: new Date(),
      systemStatus: 'active'
    };
  }
}

// Create singleton instance
const newsDiscoverySystem = new NewsDiscoverySystem();

module.exports = {
  newsDiscoverySystem,
  NewsDiscoverySystem
}; 
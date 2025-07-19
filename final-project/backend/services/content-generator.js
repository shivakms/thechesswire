const { generateVoiceScript } = require('./ai');
const { pool } = require('../database');
const { logSecurityEvent } = require('./monitoring');

// AI Personality Profiles for Content Generation
const AI_PERSONALITIES = {
  analyst: {
    name: 'Chess Analyst',
    style: 'analytical and data-driven',
    tone: 'objective and precise',
    expertise: 'statistical analysis and pattern recognition',
    voiceMode: 'calm'
  },
  storyteller: {
    name: 'Chess Storyteller',
    style: 'narrative and engaging',
    tone: 'dramatic and emotional',
    expertise: 'human interest and dramatic moments',
    voiceMode: 'dramatic'
  },
  critic: {
    name: 'Chess Critic',
    style: 'opinionated and bold',
    tone: 'provocative and challenging',
    expertise: 'controversial takes and bold predictions',
    voiceMode: 'expressive'
  },
  historian: {
    name: 'Chess Historian',
    style: 'scholarly and comprehensive',
    tone: 'reverent and educational',
    expertise: 'historical context and legacy',
    voiceMode: 'poetic'
  },
  journalist: {
    name: 'Chess Journalist',
    style: 'factual and balanced',
    tone: 'professional and informative',
    expertise: 'breaking news and current events',
    voiceMode: 'calm'
  },
  interviewer: {
    name: 'Chess Interviewer',
    style: 'conversational and probing',
    tone: 'curious and engaging',
    expertise: 'player insights and personal stories',
    voiceMode: 'expressive'
  }
};

class ContentGeneratorNetwork {
  constructor() {
    this.generationQueue = [];
    this.publishedContent = new Map();
    this.personalityStats = new Map();
    this.contentQualityScores = new Map();
  }

  // Initialize the content generation network
  async initialize() {
    console.log('🧠 Initializing Multi-Personality Content Generator Network...');
    
    // Start content generation cycles
    this.startContentGenerationCycles();
    
    // Initialize personality statistics
    for (const [key, personality] of Object.entries(AI_PERSONALITIES)) {
      this.personalityStats.set(key, {
        articlesGenerated: 0,
        averageQuality: 0,
        lastUsed: null
      });
    }
  }

  // Start automated content generation cycles
  startContentGenerationCycles() {
    const cron = require('node-cron');
    
    // Generate breaking news every 2 hours
    cron.schedule('0 */2 * * *', () => {
      this.generateBreakingNews();
    });

    // Generate long-form articles daily
    cron.schedule('0 6 * * *', () => {
      this.generateLongFormArticles();
    });

    // Generate statistical analysis weekly
    cron.schedule('0 8 * * 1', () => {
      this.generateStatisticalAnalysis();
    });

    // Generate opinion pieces every 3 days
    cron.schedule('0 10 */3 * *', () => {
      this.generateOpinionPieces();
    });

    // Generate controversy content weekly
    cron.schedule('0 12 * * 5', () => {
      this.generateControversyContent();
    });

    // Generate interview simulations daily
    cron.schedule('0 14 * * *', () => {
      this.generateInterviewSimulations();
    });
  }

  // Generate breaking news content
  async generateBreakingNews() {
    console.log('📰 Generating breaking news content...');
    
    try {
      // Get recent news from database
      const client = await pool.connect();
      let recentNews;
      
      try {
        const result = await client.query(
          `SELECT * FROM news_articles 
           WHERE published_at >= NOW() - INTERVAL '24 hours'
           AND event_type IN ('tournament', 'player_news', 'controversy')
           ORDER BY published_at DESC LIMIT 5`
        );
        recentNews = result.rows;
      } finally {
        client.release();
      }

      if (recentNews.length === 0) {
        console.log('No recent news found for breaking news generation');
        return;
      }

      // Generate breaking news for each recent event
      for (const news of recentNews) {
        const breakingNews = await this.createBreakingNewsArticle(news);
        await this.publishContent(breakingNews, 'breaking_news');
      }

    } catch (error) {
      console.error('Breaking news generation failed:', error);
      await logSecurityEvent({
        eventType: 'content_generation_error',
        details: { type: 'breaking_news', error: error.message }
      });
    }
  }

  // Create breaking news article
  async createBreakingNewsArticle(news) {
    const personality = AI_PERSONALITIES.journalist;
    
    const prompt = `
      Create a breaking news article about this chess event:
      
      Title: ${news.title}
      Content: ${news.content}
      Event Type: ${news.event_type}
      Source: ${news.source}
      
      Style: ${personality.style}
      Tone: ${personality.tone}
      Expertise: ${personality.expertise}
      
      Requirements:
      1. Lead with the most important information
      2. Include key facts and context
      3. Quote relevant players or officials if mentioned
      4. Explain the significance of the event
      5. Keep it concise but informative (300-500 words)
      6. Use journalistic style with clear, factual reporting
      
      Make it engaging and newsworthy for chess enthusiasts.
    `;

    const content = await generateVoiceScript(prompt, personality.voiceMode);
    
    return {
      title: `BREAKING: ${news.title}`,
      content,
      contentType: 'breaking_news',
      personality: personality.name,
      sourceNewsId: news.id,
      generatedAt: new Date(),
      wordCount: content.split(' ').length
    };
  }

  // Generate long-form articles (5000+ words)
  async generateLongFormArticles() {
    console.log('📚 Generating long-form articles...');
    
    try {
      // Get trending topics for analysis
      const client = await pool.connect();
      let trendingTopics;
      
      try {
        const result = await client.query(
          `SELECT topics FROM trending_topics 
           WHERE analyzed_at >= NOW() - INTERVAL '7 days'
           ORDER BY analyzed_at DESC LIMIT 1`
        );
        trendingTopics = result.rows[0]?.topics || [];
      } finally {
        client.release();
      }

      // Generate long-form article on trending topic
      if (trendingTopics.length > 0) {
        const topic = trendingTopics[0][0]; // Most trending topic
        const longFormArticle = await this.createLongFormArticle(topic);
        await this.publishContent(longFormArticle, 'long_form');
      }

    } catch (error) {
      console.error('Long-form article generation failed:', error);
    }
  }

  // Create long-form article
  async createLongFormArticle(topic) {
    const personality = AI_PERSONALITIES.historian;
    
    const prompt = `
      Create a comprehensive long-form article (5000+ words) about this chess topic:
      
      Topic: ${topic}
      
      Style: ${personality.style}
      Tone: ${personality.tone}
      Expertise: ${personality.expertise}
      
      Structure:
      1. Introduction and context (500 words)
      2. Historical background and evolution (1000 words)
      3. Current state and recent developments (1500 words)
      4. Analysis of key players and events (1000 words)
      5. Future implications and predictions (500 words)
      6. Conclusion and significance (500 words)
      
      Include:
      - Detailed analysis and insights
      - Historical context and comparisons
      - Expert opinions and perspectives
      - Statistical data and trends
      - Personal stories and anecdotes
      - Future outlook and predictions
      
      Make it comprehensive, engaging, and worthy of deep reading.
    `;

    const content = await generateVoiceScript(prompt, personality.voiceMode);
    
    return {
      title: `The Complete Guide to ${topic.charAt(0).toUpperCase() + topic.slice(1)} in Chess`,
      content,
      contentType: 'long_form',
      personality: personality.name,
      topic,
      generatedAt: new Date(),
      wordCount: content.split(' ').length
    };
  }

  // Generate statistical analysis
  async generateStatisticalAnalysis() {
    console.log('📊 Generating statistical analysis...');
    
    try {
      // Get recent tournament data
      const client = await pool.connect();
      let tournamentData;
      
      try {
        const result = await client.query(
          `SELECT * FROM news_articles 
           WHERE event_type = 'tournament' 
           AND published_at >= NOW() - INTERVAL '30 days'
           ORDER BY published_at DESC LIMIT 10`
        );
        tournamentData = result.rows;
      } finally {
        client.release();
      }

      if (tournamentData.length > 0) {
        const analysis = await this.createStatisticalAnalysis(tournamentData);
        await this.publishContent(analysis, 'statistical');
      }

    } catch (error) {
      console.error('Statistical analysis generation failed:', error);
    }
  }

  // Create statistical analysis
  async createStatisticalAnalysis(tournamentData) {
    const personality = AI_PERSONALITIES.analyst;
    
    const prompt = `
      Create a statistical analysis article based on this tournament data:
      
      Tournament Data: ${JSON.stringify(tournamentData, null, 2)}
      
      Style: ${personality.style}
      Tone: ${personality.tone}
      Expertise: ${personality.expertise}
      
      Analyze:
      1. Performance trends and patterns
      2. Player statistics and rankings
      3. Tournament format effectiveness
      4. Rating changes and implications
      5. Historical comparisons
      6. Predictive insights
      
      Include:
      - Data visualization descriptions
      - Statistical significance
      - Trend analysis
      - Comparative metrics
      - Predictive modeling
      - Actionable insights
      
      Make it data-driven, insightful, and valuable for chess analysis.
    `;

    const content = await generateVoiceScript(prompt, personality.voiceMode);
    
    return {
      title: 'Statistical Analysis: Recent Tournament Performance Trends',
      content,
      contentType: 'statistical',
      personality: personality.name,
      dataPoints: tournamentData.length,
      generatedAt: new Date(),
      wordCount: content.split(' ').length
    };
  }

  // Generate opinion pieces
  async generateOpinionPieces() {
    console.log('💭 Generating opinion pieces...');
    
    try {
      // Get recent controversial topics
      const client = await pool.connect();
      let controversialNews;
      
      try {
        const result = await client.query(
          `SELECT * FROM news_articles 
           WHERE event_type = 'controversy' 
           AND published_at >= NOW() - INTERVAL '7 days'
           ORDER BY published_at DESC LIMIT 3`
        );
        controversialNews = result.rows;
      } finally {
        client.release();
      }

      // Generate opinion piece for each controversial topic
      for (const news of controversialNews) {
        const opinionPiece = await this.createOpinionPiece(news);
        await this.publishContent(opinionPiece, 'opinion');
      }

    } catch (error) {
      console.error('Opinion piece generation failed:', error);
    }
  }

  // Create opinion piece
  async createOpinionPiece(news) {
    const personality = AI_PERSONALITIES.critic;
    
    const prompt = `
      Create a provocative opinion piece about this chess controversy:
      
      Title: ${news.title}
      Content: ${news.content}
      Event Type: ${news.event_type}
      
      Style: ${personality.style}
      Tone: ${personality.tone}
      Expertise: ${personality.expertise}
      
      Requirements:
      1. Take a bold, controversial stance
      2. Challenge conventional wisdom
      3. Provide unique perspective
      4. Support arguments with logic
      5. Be provocative but respectful
      6. Include counter-arguments
      7. End with strong conclusion
      
      Make it thought-provoking, controversial, and engaging.
    `;

    const content = await generateVoiceScript(prompt, personality.voiceMode);
    
    return {
      title: `OPINION: ${news.title}`,
      content,
      contentType: 'opinion',
      personality: personality.name,
      sourceNewsId: news.id,
      generatedAt: new Date(),
      wordCount: content.split(' ').length
    };
  }

  // Generate controversy content
  async generateControversyContent() {
    console.log('🔥 Generating controversy content...');
    
    try {
      // Generate AI debate on controversial topics
      const controversyTopics = [
        'Cheating in online chess',
        'AI assistance in chess',
        'Prize money distribution',
        'Chess in schools',
        'Professional vs amateur chess'
      ];

      const randomTopic = controversyTopics[Math.floor(Math.random() * controversyTopics.length)];
      const controversyContent = await this.createControversyDebate(randomTopic);
      await this.publishContent(controversyContent, 'controversy');

    } catch (error) {
      console.error('Controversy content generation failed:', error);
    }
  }

  // Create controversy debate
  async createControversyDebate(topic) {
    const personality = AI_PERSONALITIES.critic;
    
    const prompt = `
      Create a controversial debate article about this chess topic:
      
      Topic: ${topic}
      
      Style: ${personality.style}
      Tone: ${personality.tone}
      Expertise: ${personality.expertise}
      
      Structure:
      1. Introduction to the controversy
      2. Arguments FOR the controversial position
      3. Arguments AGAINST the controversial position
      4. Analysis of both sides
      5. Provocative conclusion
      
      Make it:
      - Highly controversial and provocative
      - Balanced but challenging
      - Thought-provoking and engaging
      - Respectful but bold
      - Designed to generate discussion
      
      Create a debate that will spark conversation in the chess community.
    `;

    const content = await generateVoiceScript(prompt, personality.voiceMode);
    
    return {
      title: `The Great Debate: ${topic}`,
      content,
      contentType: 'controversy',
      personality: personality.name,
      topic,
      generatedAt: new Date(),
      wordCount: content.split(' ').length
    };
  }

  // Generate interview simulations
  async generateInterviewSimulations() {
    console.log('🎤 Generating interview simulations...');
    
    try {
      // Get recent player news
      const client = await pool.connect();
      let playerNews;
      
      try {
        const result = await client.query(
          `SELECT * FROM news_articles 
           WHERE event_type = 'player_news' 
           AND published_at >= NOW() - INTERVAL '7 days'
           ORDER BY published_at DESC LIMIT 3`
        );
        playerNews = result.rows;
      } finally {
        client.release();
      }

      // Generate interview for each player news
      for (const news of playerNews) {
        const interview = await this.createInterviewSimulation(news);
        await this.publishContent(interview, 'interview');
      }

    } catch (error) {
      console.error('Interview simulation generation failed:', error);
    }
  }

  // Create interview simulation
  async createInterviewSimulation(news) {
    const personality = AI_PERSONALITIES.interviewer;
    
    const prompt = `
      Create an exclusive interview simulation about this chess news:
      
      Title: ${news.title}
      Content: ${news.content}
      Event Type: ${news.event_type}
      
      Style: ${personality.style}
      Tone: ${personality.tone}
      Expertise: ${personality.expertise}
      
      Create an interview that includes:
      1. Introduction and context
      2. Q&A format with 8-10 questions
      3. Player's perspective and insights
      4. Personal stories and anecdotes
      5. Future plans and aspirations
      6. Closing thoughts
      
      Make it:
      - Conversational and engaging
      - Insightful and personal
      - Professional but warm
      - Exclusive and revealing
      - Authentic to the player's style
      
      Create an interview that feels real and engaging.
    `;

    const content = await generateVoiceScript(prompt, personality.voiceMode);
    
    return {
      title: `EXCLUSIVE INTERVIEW: ${news.title}`,
      content,
      contentType: 'interview',
      personality: personality.name,
      sourceNewsId: news.id,
      generatedAt: new Date(),
      wordCount: content.split(' ').length
    };
  }

  // Publish generated content
  async publishContent(content, contentType) {
    try {
      console.log(`📝 Publishing ${contentType}: ${content.title}`);
      
      // Save to database
      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO ai_generated_content (
            title, content, content_type, personality, word_count, generated_at
          ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [
            content.title,
            content.content,
            contentType,
            content.personality,
            content.wordCount,
            content.generatedAt
          ]
        );
        
        const contentId = result.rows[0].id;
        
        // Update personality statistics
        this.updatePersonalityStats(content.personality, content.wordCount);
        
        // Store in memory
        this.publishedContent.set(contentId, content);
        
        console.log(`✅ Published ${contentType}: ${content.title} (ID: ${contentId})`);
        
        // Log content generation
        await logSecurityEvent({
          eventType: 'content_generated',
          details: {
            contentType,
            personality: content.personality,
            wordCount: content.wordCount,
            contentId
          }
        });
        
      } finally {
        client.release();
      }
      
    } catch (error) {
      console.error(`Content publishing failed:`, error);
    }
  }

  // Update personality statistics
  updatePersonalityStats(personalityName, wordCount) {
    for (const [key, personality] of Object.entries(AI_PERSONALITIES)) {
      if (personality.name === personalityName) {
        const stats = this.personalityStats.get(key);
        stats.articlesGenerated += 1;
        stats.lastUsed = new Date();
        
        // Update average quality (simplified)
        const totalQuality = stats.averageQuality * (stats.articlesGenerated - 1) + wordCount;
        stats.averageQuality = totalQuality / stats.articlesGenerated;
        
        this.personalityStats.set(key, stats);
        break;
      }
    }
  }

  // Get content generation statistics
  getStats() {
    return {
      totalContent: this.publishedContent.size,
      personalityStats: Object.fromEntries(this.personalityStats),
      queueLength: this.generationQueue.length,
      lastGenerated: new Date()
    };
  }

  // Get recent content
  async getRecentContent(limit = 10) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM ai_generated_content 
         ORDER BY generated_at DESC 
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }
}

// Create singleton instance
const contentGeneratorNetwork = new ContentGeneratorNetwork();

module.exports = {
  contentGeneratorNetwork,
  ContentGeneratorNetwork,
  AI_PERSONALITIES
}; 
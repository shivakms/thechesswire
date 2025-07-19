const { pool } = require('./database');
const crypto = require('crypto');

class MemoryArchiveService {
  constructor() {
    this.patternCache = new Map();
    this.weaknessCache = new Map();
    this.recommendationCache = new Map();
  }

  // Module 90-96: Memory & Archive Features
  async initializeMemorySystem() {
    try {
      console.log('🧠 Initializing Memory & Archive System...');
      
      // Create memory tables if they don't exist
      await this.createMemoryTables();
      
      // Initialize pattern recognition engine
      await this.initializePatternRecognition();
      
      console.log('✅ Memory & Archive System initialized');
    } catch (error) {
      console.error('❌ Memory system initialization failed:', error);
      throw error;
    }
  }

  async createMemoryTables() {
    const client = await pool.connect();
    try {
      // Personal game archive
      await client.query(`
        CREATE TABLE IF NOT EXISTS game_archive (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          game_id VARCHAR(255) UNIQUE NOT NULL,
          pgn TEXT NOT NULL,
          white_player VARCHAR(100),
          black_player VARCHAR(100),
          result VARCHAR(10), -- '1-0', '0-1', '1/2-1/2'
          user_color VARCHAR(5), -- 'white', 'black'
          game_date TIMESTAMP,
          time_control VARCHAR(20),
          rating_white INTEGER,
          rating_black INTEGER,
          tags TEXT[], -- Array of tags
          notes TEXT,
          analysis_data JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Pattern recognition
      await client.query(`
        CREATE TABLE IF NOT EXISTS chess_patterns (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          pattern_type VARCHAR(50) NOT NULL, -- 'opening', 'middlegame', 'endgame', 'tactic'
          pattern_name VARCHAR(100) NOT NULL,
          pattern_data JSONB NOT NULL,
          frequency INTEGER DEFAULT 1,
          success_rate DECIMAL(3,2),
          last_occurrence TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Weakness identification
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_weaknesses (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          weakness_type VARCHAR(50) NOT NULL, -- 'opening', 'middlegame', 'endgame', 'time_management'
          weakness_description TEXT NOT NULL,
          severity DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
          frequency INTEGER DEFAULT 1,
          last_occurrence TIMESTAMP,
          improvement_suggestions TEXT[],
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Improvement tracking
      await client.query(`
        CREATE TABLE IF NOT EXISTS improvement_tracking (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          metric_name VARCHAR(50) NOT NULL, -- 'rating', 'accuracy', 'time_management'
          metric_value DECIMAL(10,2) NOT NULL,
          measurement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          trend_direction VARCHAR(10), -- 'improving', 'declining', 'stable'
          notes TEXT
        )
      `);

      // Training recommendations
      await client.query(`
        CREATE TABLE IF NOT EXISTS training_recommendations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          recommendation_type VARCHAR(50) NOT NULL, -- 'opening', 'tactic', 'endgame', 'strategy'
          priority INTEGER DEFAULT 1, -- 1-5 scale
          title VARCHAR(200) NOT NULL,
          description TEXT NOT NULL,
          estimated_time INTEGER, -- minutes
          difficulty_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
          resources JSONB, -- Links, exercises, etc.
          completed BOOLEAN DEFAULT FALSE,
          completed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Game collection organization
      await client.query(`
        CREATE TABLE IF NOT EXISTS game_collections (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          collection_name VARCHAR(100) NOT NULL,
          description TEXT,
          is_public BOOLEAN DEFAULT FALSE,
          tags TEXT[],
          game_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS collection_games (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          collection_id UUID REFERENCES game_collections(id) ON DELETE CASCADE,
          game_id UUID REFERENCES game_archive(id) ON DELETE CASCADE,
          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Memory palace visualization data
      await client.query(`
        CREATE TABLE IF NOT EXISTS memory_palace (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          palace_type VARCHAR(50) NOT NULL, -- 'openings', 'tactics', 'endgames'
          palace_data JSONB NOT NULL, -- 3D coordinates, connections, etc.
          visualization_settings JSONB,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Memory tables created successfully');
    } finally {
      client.release();
    }
  }

  // Add game to archive
  async addGameToArchive(userId, gameData) {
    const client = await pool.connect();
    try {
      const {
        gameId, pgn, whitePlayer, blackPlayer, result, userColor,
        gameDate, timeControl, ratingWhite, ratingBlack, tags, notes
      } = gameData;

      const result = await client.query(`
        INSERT INTO game_archive (
          user_id, game_id, pgn, white_player, black_player, result,
          user_color, game_date, time_control, rating_white, rating_black,
          tags, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `, [
        userId, gameId, pgn, whitePlayer, blackPlayer, result,
        userColor, gameDate, timeControl, ratingWhite, ratingBlack,
        tags || [], notes
      ]);

      const gameArchiveId = result.rows[0].id;

      // Analyze game for patterns and weaknesses
      await this.analyzeGameForPatterns(userId, gameArchiveId, pgn, userColor);
      await this.identifyWeaknesses(userId, gameArchiveId, pgn, userColor);
      await this.updateImprovementTracking(userId, gameArchiveId);

      return gameArchiveId;
    } finally {
      client.release();
    }
  }

  // Pattern recognition across user's games
  async analyzeGameForPatterns(userId, gameId, pgn, userColor) {
    try {
      const patterns = await this.extractPatternsFromPGN(pgn, userColor);
      
      for (const pattern of patterns) {
        await this.storePattern(userId, pattern);
      }

      // Update pattern cache
      this.patternCache.set(`${userId}-${pattern.type}`, patterns);
    } catch (error) {
      console.error('Pattern analysis failed:', error);
    }
  }

  async extractPatternsFromPGN(pgn, userColor) {
    const patterns = [];
    
    // Parse PGN and extract patterns
    const moves = this.parsePGNToMoves(pgn);
    
    // Opening patterns (first 10 moves)
    if (moves.length >= 10) {
      const openingMoves = moves.slice(0, 10);
      patterns.push({
        type: 'opening',
        name: this.identifyOpening(openingMoves),
        data: { moves: openingMoves, userColor },
        frequency: 1,
        success_rate: this.calculateSuccessRate(moves, userColor)
      });
    }

    // Middlegame patterns (moves 10-30)
    if (moves.length >= 30) {
      const middlegameMoves = moves.slice(10, 30);
      patterns.push({
        type: 'middlegame',
        name: this.identifyMiddlegamePattern(middlegameMoves),
        data: { moves: middlegameMoves, userColor },
        frequency: 1,
        success_rate: this.calculateSuccessRate(moves, userColor)
      });
    }

    // Endgame patterns (last 20 moves)
    if (moves.length >= 20) {
      const endgameMoves = moves.slice(-20);
      patterns.push({
        type: 'endgame',
        name: this.identifyEndgamePattern(endgameMoves),
        data: { moves: endgameMoves, userColor },
        frequency: 1,
        success_rate: this.calculateSuccessRate(moves, userColor)
      });
    }

    return patterns;
  }

  // Weakness identification system
  async identifyWeaknesses(userId, gameId, pgn, userColor) {
    try {
      const weaknesses = await this.analyzeWeaknesses(pgn, userColor);
      
      for (const weakness of weaknesses) {
        await this.storeWeakness(userId, weakness);
      }

      // Update weakness cache
      this.weaknessCache.set(userId, weaknesses);
    } catch (error) {
      console.error('Weakness identification failed:', error);
    }
  }

  async analyzeWeaknesses(pgn, userColor) {
    const weaknesses = [];
    const moves = this.parsePGNToMoves(pgn);
    
    // Analyze for common weaknesses
    const analysis = {
      blunders: this.countBlunders(moves, userColor),
      timePressure: this.analyzeTimePressure(moves),
      openingMistakes: this.analyzeOpeningMistakes(moves, userColor),
      endgameErrors: this.analyzeEndgameErrors(moves, userColor)
    };

    // Identify specific weaknesses
    if (analysis.blunders > 2) {
      weaknesses.push({
        type: 'tactical',
        description: 'High number of tactical blunders',
        severity: Math.min(analysis.blunders / 5, 1.0),
        frequency: 1,
        improvement_suggestions: [
          'Practice tactical puzzles daily',
          'Slow down and calculate variations',
          'Review games with engine analysis'
        ]
      });
    }

    if (analysis.timePressure) {
      weaknesses.push({
        type: 'time_management',
        description: 'Poor time management leading to time pressure',
        severity: 0.8,
        frequency: 1,
        improvement_suggestions: [
          'Practice with increment time controls',
          'Learn to make quick but accurate moves',
          'Study time management techniques'
        ]
      });
    }

    return weaknesses;
  }

  // Improvement tracking over time
  async updateImprovementTracking(userId, gameId) {
    try {
      const metrics = await this.calculateMetrics(userId);
      
      for (const [metricName, metricValue] of Object.entries(metrics)) {
        await this.storeMetric(userId, metricName, metricValue);
      }
    } catch (error) {
      console.error('Improvement tracking failed:', error);
    }
  }

  async calculateMetrics(userId) {
    const client = await pool.connect();
    try {
      // Get recent games
      const result = await client.query(`
        SELECT result, user_color, rating_white, rating_black, analysis_data
        FROM game_archive 
        WHERE user_id = $1 
        ORDER BY game_date DESC 
        LIMIT 50
      `, [userId]);

      const games = result.rows;
      
      // Calculate various metrics
      const metrics = {
        win_rate: this.calculateWinRate(games),
        average_accuracy: this.calculateAverageAccuracy(games),
        rating_progress: this.calculateRatingProgress(games),
        tactical_awareness: this.calculateTacticalAwareness(games)
      };

      return metrics;
    } finally {
      client.release();
    }
  }

  // Personalized training recommendations
  async generateTrainingRecommendations(userId) {
    try {
      const weaknesses = await this.getUserWeaknesses(userId);
      const patterns = await this.getUserPatterns(userId);
      const metrics = await this.getUserMetrics(userId);

      const recommendations = [];

      // Generate recommendations based on weaknesses
      for (const weakness of weaknesses) {
        const recommendation = await this.createRecommendationFromWeakness(weakness);
        recommendations.push(recommendation);
      }

      // Generate recommendations based on patterns
      for (const pattern of patterns) {
        if (pattern.success_rate < 0.6) {
          const recommendation = await this.createRecommendationFromPattern(pattern);
          recommendations.push(recommendation);
        }
      }

      // Store recommendations
      for (const recommendation of recommendations) {
        await this.storeRecommendation(userId, recommendation);
      }

      // Update recommendation cache
      this.recommendationCache.set(userId, recommendations);

      return recommendations;
    } catch (error) {
      console.error('Training recommendations failed:', error);
      return [];
    }
  }

  // Game collection organization
  async createGameCollection(userId, collectionData) {
    const client = await pool.connect();
    try {
      const { name, description, isPublic, tags } = collectionData;

      const result = await client.query(`
        INSERT INTO game_collections (
          user_id, collection_name, description, is_public, tags
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [userId, name, description, isPublic, tags || []]);

      return result.rows[0].id;
    } finally {
      client.release();
    }
  }

  async addGameToCollection(collectionId, gameId) {
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO collection_games (collection_id, game_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [collectionId, gameId]);

      // Update game count
      await client.query(`
        UPDATE game_collections 
        SET game_count = (
          SELECT COUNT(*) FROM collection_games WHERE collection_id = $1
        )
        WHERE id = $1
      `, [collectionId]);
    } finally {
      client.release();
    }
  }

  // Advanced search within archive
  async searchGames(userId, searchCriteria) {
    const client = await pool.connect();
    try {
      const {
        query, tags, dateFrom, dateTo, result, timeControl,
        ratingRange, playerName, opening, limit = 50
      } = searchCriteria;

      let sql = `
        SELECT * FROM game_archive 
        WHERE user_id = $1
      `;
      const params = [userId];
      let paramIndex = 2;

      // Build dynamic query
      if (query) {
        sql += ` AND (white_player ILIKE $${paramIndex} OR black_player ILIKE $${paramIndex} OR notes ILIKE $${paramIndex})`;
        params.push(`%${query}%`);
        paramIndex++;
      }

      if (tags && tags.length > 0) {
        sql += ` AND tags && $${paramIndex}`;
        params.push(tags);
        paramIndex++;
      }

      if (dateFrom) {
        sql += ` AND game_date >= $${paramIndex}`;
        params.push(dateFrom);
        paramIndex++;
      }

      if (dateTo) {
        sql += ` AND game_date <= $${paramIndex}`;
        params.push(dateTo);
        paramIndex++;
      }

      if (result) {
        sql += ` AND result = $${paramIndex}`;
        params.push(result);
        paramIndex++;
      }

      sql += ` ORDER BY game_date DESC LIMIT $${paramIndex}`;
      params.push(limit);

      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Memory palace visualization
  async generateMemoryPalace(userId, palaceType) {
    try {
      const data = await this.getPalaceData(userId, palaceType);
      const visualization = await this.createPalaceVisualization(data);
      
      await this.storeMemoryPalace(userId, palaceType, visualization);
      
      return visualization;
    } catch (error) {
      console.error('Memory palace generation failed:', error);
      return null;
    }
  }

  // Helper methods
  parsePGNToMoves(pgn) {
    // Simplified PGN parsing - in production, use a proper chess library
    const moves = [];
    const moveRegex = /\d+\.\s*([^\s]+)\s+([^\s]+)/g;
    let match;
    
    while ((match = moveRegex.exec(pgn)) !== null) {
      moves.push(match[1], match[2]);
    }
    
    return moves;
  }

  identifyOpening(moves) {
    // Simplified opening identification
    const openingMoves = moves.slice(0, 6).join(' ');
    
    const openings = {
      'e4 e5 Nf3 Nc6': 'Ruy Lopez',
      'e4 e5 Nf3 d6': 'Philidor Defense',
      'e4 c5': 'Sicilian Defense',
      'd4 d5': 'Queen\'s Gambit',
      'd4 Nf6': 'Indian Defense'
    };

    return openings[openingMoves] || 'Unknown Opening';
  }

  calculateSuccessRate(moves, userColor) {
    // Simplified success rate calculation
    // In production, this would use engine analysis
    return 0.7 + Math.random() * 0.2; // Placeholder
  }

  countBlunders(moves, userColor) {
    // Simplified blunder detection
    return Math.floor(Math.random() * 3); // Placeholder
  }

  async storePattern(userId, pattern) {
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO chess_patterns (
          user_id, pattern_type, pattern_name, pattern_data, frequency, success_rate
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, pattern_type, pattern_name)
        DO UPDATE SET 
          frequency = chess_patterns.frequency + 1,
          success_rate = (chess_patterns.success_rate + $6) / 2,
          last_occurrence = NOW()
      `, [
        userId, pattern.type, pattern.name, 
        JSON.stringify(pattern.data), pattern.frequency, pattern.success_rate
      ]);
    } finally {
      client.release();
    }
  }

  async storeWeakness(userId, weakness) {
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO user_weaknesses (
          user_id, weakness_type, weakness_description, severity, frequency, improvement_suggestions
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, weakness_type, weakness_description)
        DO UPDATE SET 
          frequency = user_weaknesses.frequency + 1,
          severity = GREATEST(user_weaknesses.severity, $4),
          last_occurrence = NOW()
      `, [
        userId, weakness.type, weakness.description,
        weakness.severity, weakness.frequency, weakness.improvement_suggestions
      ]);
    } finally {
      client.release();
    }
  }

  async storeMetric(userId, metricName, metricValue) {
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO improvement_tracking (
          user_id, metric_name, metric_value, trend_direction
        ) VALUES ($1, $2, $3, $4)
      `, [userId, metricName, metricValue, 'stable']);
    } finally {
      client.release();
    }
  }

  async storeRecommendation(userId, recommendation) {
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO training_recommendations (
          user_id, recommendation_type, priority, title, description, 
          estimated_time, difficulty_level, resources
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        userId, recommendation.type, recommendation.priority,
        recommendation.title, recommendation.description,
        recommendation.estimatedTime, recommendation.difficultyLevel,
        JSON.stringify(recommendation.resources)
      ]);
    } finally {
      client.release();
    }
  }

  async storeMemoryPalace(userId, palaceType, palaceData) {
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO memory_palace (user_id, palace_type, palace_data)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, palace_type)
        DO UPDATE SET 
          palace_data = $3,
          last_updated = NOW()
      `, [userId, palaceType, JSON.stringify(palaceData)]);
    } finally {
      client.release();
    }
  }

  // Getter methods for cached data
  async getUserWeaknesses(userId) {
    if (this.weaknessCache.has(userId)) {
      return this.weaknessCache.get(userId);
    }

    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM user_weaknesses 
        WHERE user_id = $1 
        ORDER BY severity DESC, frequency DESC
      `, [userId]);
      
      const weaknesses = result.rows;
      this.weaknessCache.set(userId, weaknesses);
      return weaknesses;
    } finally {
      client.release();
    }
  }

  async getUserPatterns(userId) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM chess_patterns 
        WHERE user_id = $1 
        ORDER BY frequency DESC
      `, [userId]);
      
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getUserMetrics(userId) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT metric_name, metric_value, measurement_date
        FROM improvement_tracking 
        WHERE user_id = $1 
        ORDER BY measurement_date DESC
      `, [userId]);
      
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Recommendation creation helpers
  async createRecommendationFromWeakness(weakness) {
    const recommendations = {
      tactical: {
        title: 'Improve Tactical Awareness',
        description: 'Focus on tactical puzzles and calculation training',
        estimatedTime: 30,
        difficultyLevel: 'intermediate',
        resources: {
          puzzles: '/puzzles/tactical',
          exercises: '/exercises/calculation',
          videos: '/videos/tactics'
        }
      },
      time_management: {
        title: 'Master Time Management',
        description: 'Learn to manage your clock effectively',
        estimatedTime: 45,
        difficultyLevel: 'intermediate',
        resources: {
          exercises: '/exercises/time-management',
          videos: '/videos/time-management',
          practice: '/practice/blitz'
        }
      }
    };

    return {
      type: weakness.type,
      priority: Math.ceil(weakness.severity * 5),
      ...recommendations[weakness.type] || recommendations.tactical
    };
  }

  async createRecommendationFromPattern(pattern) {
    return {
      type: pattern.type,
      priority: 3,
      title: `Improve ${pattern.type} Play`,
      description: `Focus on ${pattern.type} positions and strategies`,
      estimatedTime: 40,
      difficultyLevel: 'intermediate',
      resources: {
        exercises: `/exercises/${pattern.type}`,
        videos: `/videos/${pattern.type}`,
        practice: `/practice/${pattern.type}`
      }
    };
  }

  // Initialize pattern recognition engine
  async initializePatternRecognition() {
    console.log('🧠 Initializing pattern recognition engine...');
    // Load common patterns and openings
    // In production, this would load from a comprehensive database
  }

  // Placeholder methods for complex analysis
  analyzeTimePressure(moves) {
    return Math.random() > 0.7; // Placeholder
  }

  analyzeOpeningMistakes(moves, userColor) {
    return Math.floor(Math.random() * 2); // Placeholder
  }

  analyzeEndgameErrors(moves, userColor) {
    return Math.floor(Math.random() * 2); // Placeholder
  }

  calculateWinRate(games) {
    if (games.length === 0) return 0;
    const wins = games.filter(g => 
      (g.user_color === 'white' && g.result === '1-0') ||
      (g.user_color === 'black' && g.result === '0-1')
    ).length;
    return wins / games.length;
  }

  calculateAverageAccuracy(games) {
    if (games.length === 0) return 0;
    const totalAccuracy = games.reduce((sum, game) => {
      return sum + (game.analysis_data?.accuracy || 0.8);
    }, 0);
    return totalAccuracy / games.length;
  }

  calculateRatingProgress(games) {
    if (games.length < 2) return 0;
    const recent = games[0];
    const older = games[games.length - 1];
    return (recent.rating_white + recent.rating_black) / 2 - 
           (older.rating_white + older.rating_black) / 2;
  }

  calculateTacticalAwareness(games) {
    if (games.length === 0) return 0;
    const totalTacticalScore = games.reduce((sum, game) => {
      return sum + (game.analysis_data?.tactical_score || 0.7);
    }, 0);
    return totalTacticalScore / games.length;
  }

  async getPalaceData(userId, palaceType) {
    // Get data for memory palace visualization
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM game_archive 
        WHERE user_id = $1 
        ORDER BY game_date DESC 
        LIMIT 100
      `, [userId]);
      
      return result.rows;
    } finally {
      client.release();
    }
  }

  async createPalaceVisualization(data) {
    // Create 3D visualization data for memory palace
    return {
      nodes: data.map((game, index) => ({
        id: game.id,
        position: {
          x: Math.cos(index * 0.1) * 100,
          y: Math.sin(index * 0.1) * 100,
          z: index * 10
        },
        data: {
          opening: this.identifyOpening(this.parsePGNToMoves(game.pgn)),
          result: game.result,
          date: game.game_date
        }
      })),
      connections: data.slice(1).map((game, index) => ({
        from: data[index].id,
        to: game.id,
        strength: 0.5
      }))
    };
  }
}

module.exports = new MemoryArchiveService(); 
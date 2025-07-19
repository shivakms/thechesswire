import { Pool } from 'pg';
import { Chess } from 'chess.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface GameArchive {
  id: string;
  userId: string;
  pgn: string;
  title: string;
  tags: string[];
  result: 'win' | 'loss' | 'draw';
  opponent: string;
  date: Date;
  timeControl: string;
  rating: number;
  opponentRating: number;
  analysis: GameAnalysis;
  patterns: Pattern[];
  weaknesses: Weakness[];
  improvements: Improvement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GameAnalysis {
  accuracy: number;
  blunders: number;
  mistakes: number;
  inaccuracies: number;
  averageCentipawnLoss: number;
  opening: string;
  middlegame: string;
  endgame: string;
  criticalMoments: CriticalMoment[];
}

export interface Pattern {
  id: string;
  type: 'opening' | 'middlegame' | 'endgame' | 'tactic' | 'strategy';
  name: string;
  description: string;
  frequency: number;
  successRate: number;
  moves: string[];
}

export interface Weakness {
  id: string;
  category: 'opening' | 'middlegame' | 'endgame' | 'time' | 'psychology';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency: number;
  examples: string[];
  suggestedImprovements: string[];
}

export interface Improvement {
  id: string;
  area: string;
  description: string;
  progress: number; // 0-100
  targetDate: Date;
  completed: boolean;
  exercises: string[];
}

export interface CriticalMoment {
  moveNumber: number;
  position: string;
  evaluation: number;
  bestMove: string;
  playedMove: string;
  mistake: string;
  explanation: string;
}

class GameArchiveSystem {
  async addGame(userId: string, gameData: Partial<GameArchive>): Promise<string> {
    try {
      const gameId = crypto.randomUUID();
      const chess = new Chess(gameData.pgn || '');
      
      // Analyze the game
      const analysis = await this.analyzeGame(chess);
      const patterns = await this.identifyPatterns(chess, userId);
      const weaknesses = await this.identifyWeaknesses(analysis, userId);
      
      await pool.query(
        `INSERT INTO game_archive 
         (id, user_id, pgn, title, tags, result, opponent, date, time_control, rating, opponent_rating, analysis, patterns, weaknesses, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())`,
        [
          gameId,
          userId,
          gameData.pgn,
          gameData.title || 'Untitled Game',
          JSON.stringify(gameData.tags || []),
          gameData.result,
          gameData.opponent,
          gameData.date,
          gameData.timeControl,
          gameData.rating,
          gameData.opponentRating,
          JSON.stringify(analysis),
          JSON.stringify(patterns),
          JSON.stringify(weaknesses)
        ]
      );

      // Update user patterns and weaknesses
      await this.updateUserPatterns(userId);
      await this.updateUserWeaknesses(userId);

      return gameId;
    } catch (error) {
      console.error('Failed to add game to archive:', error);
      throw error;
    }
  }

  private async analyzeGame(chess: Chess): Promise<GameAnalysis> {
    const moves = chess.history({ verbose: true });
    const criticalMoments: CriticalMoment[] = [];
    let blunders = 0;
    let mistakes = 0;
    let inaccuracies = 0;
    let totalCentipawnLoss = 0;

    // Analyze each move
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const evaluation = await this.getPositionEvaluation(move.after);
      const bestMove = await this.getBestMove(move.after);
      
      if (bestMove && move.san !== bestMove) {
        const mistake = this.categorizeMistake(evaluation, move.san, bestMove);
        if (mistake === 'blunder') blunders++;
        else if (mistake === 'mistake') mistakes++;
        else if (mistake === 'inaccuracy') inaccuracies++;

        if (Math.abs(evaluation) > 200) {
          criticalMoments.push({
            moveNumber: Math.floor(i / 2) + 1,
            position: move.after,
            evaluation,
            bestMove,
            playedMove: move.san,
            mistake,
            explanation: this.getMistakeExplanation(move.san, bestMove, evaluation)
          });
        }
      }

      totalCentipawnLoss += Math.abs(evaluation);
    }

    const accuracy = Math.max(0, 100 - (blunders * 10 + mistakes * 5 + inaccuracies * 2));
    const averageCentipawnLoss = totalCentipawnLoss / moves.length;

    return {
      accuracy,
      blunders,
      mistakes,
      inaccuracies,
      averageCentipawnLoss,
      opening: this.identifyOpening(moves),
      middlegame: this.analyzeMiddlegame(moves),
      endgame: this.analyzeEndgame(moves),
      criticalMoments
    };
  }

  private async getPositionEvaluation(fen: string): Promise<number> {
    // This would integrate with a chess engine
    // For now, return a mock evaluation
    return Math.random() * 400 - 200;
  }

  private async getBestMove(fen: string): Promise<string | null> {
    // This would integrate with a chess engine
    // For now, return a mock best move
    const moves = ['e4', 'd4', 'Nf3', 'c4', 'e5'];
    return moves[Math.floor(Math.random() * moves.length)];
  }

  private categorizeMistake(evaluation: number, played: string, best: string): string {
    const evalDiff = Math.abs(evaluation);
    if (evalDiff > 300) return 'blunder';
    if (evalDiff > 100) return 'mistake';
    return 'inaccuracy';
  }

  private getMistakeExplanation(played: string, best: string, evaluation: number): string {
    return `Playing ${played} instead of ${best} gives the opponent an advantage of ${Math.abs(evaluation)} centipawns.`;
  }

  private identifyOpening(moves: any[]): string {
    if (moves.length < 4) return 'Opening phase';
    
    const firstMoves = moves.slice(0, 4).map(m => m.san).join(' ');
    
    const openings: { [key: string]: string } = {
      'e4 e5 Nf3 Nc6': 'Ruy Lopez',
      'e4 e5 Nf3 d6': 'Philidor Defense',
      'e4 c5': 'Sicilian Defense',
      'd4 d5': 'Queen\'s Gambit',
      'd4 Nf6': 'Indian Defense'
    };

    return openings[firstMoves] || 'Custom Opening';
  }

  private analyzeMiddlegame(moves: any[]): string {
    if (moves.length < 10 || moves.length > 30) return 'Middlegame phase';
    
    const middlegameMoves = moves.slice(10, 30);
    const pawnMoves = middlegameMoves.filter(m => m.san.includes('P')).length;
    const pieceMoves = middlegameMoves.length - pawnMoves;
    
    if (pieceMoves > pawnMoves * 2) return 'Piece activity focused';
    if (pawnMoves > pieceMoves) return 'Pawn structure focused';
    return 'Balanced middlegame';
  }

  private analyzeEndgame(moves: any[]): string {
    if (moves.length < 30) return 'Endgame phase';
    
    const endgameMoves = moves.slice(30);
    const queens = endgameMoves.filter(m => m.san.includes('Q')).length;
    
    if (queens === 0) return 'Queenless endgame';
    if (queens === 1) return 'Single queen endgame';
    return 'Queen endgame';
  }

  private async identifyPatterns(chess: Chess, userId: string): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    const moves = chess.history();
    
    // Analyze opening patterns
    const openingPattern = this.findOpeningPattern(moves);
    if (openingPattern) patterns.push(openingPattern);
    
    // Analyze tactical patterns
    const tacticalPatterns = this.findTacticalPatterns(moves);
    patterns.push(...tacticalPatterns);
    
    // Analyze strategic patterns
    const strategicPatterns = this.findStrategicPatterns(moves);
    patterns.push(...strategicPatterns);

    return patterns;
  }

  private findOpeningPattern(moves: string[]): Pattern | null {
    if (moves.length < 4) return null;
    
    const openingMoves = moves.slice(0, 4).join(' ');
    
    const commonOpenings: { [key: string]: Pattern } = {
      'e4 e5 Nf3 Nc6 Bb5': {
        id: crypto.randomUUID(),
        type: 'opening',
        name: 'Ruy Lopez',
        description: 'Classical opening with bishop pin',
        frequency: 1,
        successRate: 0.6,
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5']
      }
    };

    return commonOpenings[openingMoves] || null;
  }

  private findTacticalPatterns(moves: string[]): Pattern[] {
    const patterns: Pattern[] = [];
    
    // Look for common tactical motifs
    for (let i = 0; i < moves.length - 2; i++) {
      const sequence = moves.slice(i, i + 3);
      
      if (this.isFork(sequence)) {
        patterns.push({
          id: crypto.randomUUID(),
          type: 'tactic',
          name: 'Fork',
          description: 'Piece attacks multiple targets',
          frequency: 1,
          successRate: 0.7,
          moves: sequence
        });
      }
      
      if (this.isPin(sequence)) {
        patterns.push({
          id: crypto.randomUUID(),
          type: 'tactic',
          name: 'Pin',
          description: 'Piece is pinned to king or valuable piece',
          frequency: 1,
          successRate: 0.6,
          moves: sequence
        });
      }
    }

    return patterns;
  }

  private isFork(moves: string[]): boolean {
    // Simplified fork detection
    return moves.some(move => move.includes('x') && move.includes('+'));
  }

  private isPin(moves: string[]): boolean {
    // Simplified pin detection
    return moves.some(move => move.includes('B') && move.includes('x'));
  }

  private findStrategicPatterns(moves: string[]): Pattern[] {
    const patterns: Pattern[] = [];
    
    // Look for strategic themes
    const pawnMoves = moves.filter(m => m.includes('P'));
    if (pawnMoves.length > moves.length * 0.3) {
      patterns.push({
        id: crypto.randomUUID(),
        type: 'strategy',
        name: 'Pawn Structure',
        description: 'Heavy pawn play and structure building',
        frequency: 1,
        successRate: 0.5,
        moves: pawnMoves.slice(0, 5)
      });
    }

    return patterns;
  }

  private async identifyWeaknesses(analysis: GameAnalysis, userId: string): Promise<Weakness[]> {
    const weaknesses: Weakness[] = [];
    
    // Analyze accuracy
    if (analysis.accuracy < 70) {
      weaknesses.push({
        id: crypto.randomUUID(),
        category: 'middlegame',
        description: 'Low accuracy in middlegame positions',
        severity: analysis.accuracy < 50 ? 'critical' : 'high',
        frequency: 1,
        examples: analysis.criticalMoments.map(cm => cm.explanation),
        suggestedImprovements: [
          'Practice tactical puzzles',
          'Study middlegame principles',
          'Use calculation techniques'
        ]
      });
    }
    
    // Analyze blunders
    if (analysis.blunders > 2) {
      weaknesses.push({
        id: crypto.randomUUID(),
        category: 'middlegame',
        description: 'Too many blunders in games',
        severity: analysis.blunders > 5 ? 'critical' : 'high',
        frequency: 1,
        examples: analysis.criticalMoments.filter(cm => cm.mistake === 'blunder').map(cm => cm.explanation),
        suggestedImprovements: [
          'Practice blunder check routine',
          'Study tactical patterns',
          'Improve calculation depth'
        ]
      });
    }
    
    // Analyze time management
    if (analysis.criticalMoments.length > 5) {
      weaknesses.push({
        id: crypto.randomUUID(),
        category: 'time',
        description: 'Poor time management leading to mistakes',
        severity: 'medium',
        frequency: 1,
        examples: ['Multiple critical moments in single game'],
        suggestedImprovements: [
          'Practice time management',
          'Use clock more effectively',
          'Plan moves in opponent\'s time'
        ]
      });
    }

    return weaknesses;
  }

  private async updateUserPatterns(userId: string): Promise<void> {
    try {
      const result = await pool.query(
        'SELECT patterns FROM game_archive WHERE user_id = $1',
        [userId]
      );

      const allPatterns: Pattern[] = [];
      result.rows.forEach(row => {
        allPatterns.push(...JSON.parse(row.patterns));
      });

      // Aggregate patterns by type and name
      const patternStats: { [key: string]: Pattern } = {};
      allPatterns.forEach(pattern => {
        const key = `${pattern.type}-${pattern.name}`;
        if (patternStats[key]) {
          patternStats[key].frequency++;
          patternStats[key].successRate = (patternStats[key].successRate + pattern.successRate) / 2;
        } else {
          patternStats[key] = { ...pattern };
        }
      });

      // Update user patterns
      await pool.query(
        'UPDATE users SET pattern_analysis = $1 WHERE id = $2',
        [JSON.stringify(Object.values(patternStats)), userId]
      );
    } catch (error) {
      console.error('Failed to update user patterns:', error);
    }
  }

  private async updateUserWeaknesses(userId: string): Promise<void> {
    try {
      const result = await pool.query(
        'SELECT weaknesses FROM game_archive WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
        [userId]
      );

      const allWeaknesses: Weakness[] = [];
      result.rows.forEach(row => {
        allWeaknesses.push(...JSON.parse(row.weaknesses));
      });

      // Aggregate weaknesses by category
      const weaknessStats: { [key: string]: Weakness } = {};
      allWeaknesses.forEach(weakness => {
        if (weaknessStats[weakness.category]) {
          weaknessStats[weakness.category].frequency++;
          if (weakness.severity === 'critical') {
            weaknessStats[weakness.category].severity = 'critical';
          }
        } else {
          weaknessStats[weakness.category] = { ...weakness };
        }
      });

      // Update user weaknesses
      await pool.query(
        'UPDATE users SET weakness_analysis = $1 WHERE id = $2',
        [JSON.stringify(Object.values(weaknessStats)), userId]
      );
    } catch (error) {
      console.error('Failed to update user weaknesses:', error);
    }
  }

  async getUserArchive(userId: string, filters?: any): Promise<GameArchive[]> {
    try {
      let query = 'SELECT * FROM game_archive WHERE user_id = $1';
      const params = [userId];

      if (filters?.tags?.length > 0) {
        query += ' AND tags @> $2';
        params.push(JSON.stringify(filters.tags));
      }

      if (filters?.result) {
        query += ' AND result = $' + (params.length + 1);
        params.push(filters.result);
      }

      if (filters?.dateFrom) {
        query += ' AND date >= $' + (params.length + 1);
        params.push(filters.dateFrom);
      }

      query += ' ORDER BY date DESC';

      const result = await pool.query(query, params);
      return result.rows.map(row => ({
        ...row,
        tags: JSON.parse(row.tags),
        analysis: JSON.parse(row.analysis),
        patterns: JSON.parse(row.patterns),
        weaknesses: JSON.parse(row.weaknesses)
      }));
    } catch (error) {
      console.error('Failed to get user archive:', error);
      return [];
    }
  }

  async searchArchive(userId: string, searchTerm: string): Promise<GameArchive[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM game_archive 
         WHERE user_id = $1 
         AND (title ILIKE $2 OR opponent ILIKE $2 OR tags::text ILIKE $2)
         ORDER BY date DESC`,
        [userId, `%${searchTerm}%`]
      );

      return result.rows.map(row => ({
        ...row,
        tags: JSON.parse(row.tags),
        analysis: JSON.parse(row.analysis),
        patterns: JSON.parse(row.patterns),
        weaknesses: JSON.parse(row.weaknesses)
      }));
    } catch (error) {
      console.error('Failed to search archive:', error);
      return [];
    }
  }

  async getPatternAnalysis(userId: string): Promise<Pattern[]> {
    try {
      const result = await pool.query(
        'SELECT pattern_analysis FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) return [];
      return JSON.parse(result.rows[0].pattern_analysis || '[]');
    } catch (error) {
      console.error('Failed to get pattern analysis:', error);
      return [];
    }
  }

  async getWeaknessAnalysis(userId: string): Promise<Weakness[]> {
    try {
      const result = await pool.query(
        'SELECT weakness_analysis FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) return [];
      return JSON.parse(result.rows[0].weakness_analysis || '[]');
    } catch (error) {
      console.error('Failed to get weakness analysis:', error);
      return [];
    }
  }

  async createImprovementPlan(userId: string): Promise<Improvement[]> {
    try {
      const weaknesses = await this.getWeaknessAnalysis(userId);
      const improvements: Improvement[] = [];

      weaknesses.forEach(weakness => {
        improvements.push({
          id: crypto.randomUUID(),
          area: weakness.category,
          description: `Improve ${weakness.description}`,
          progress: 0,
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          completed: false,
          exercises: weakness.suggestedImprovements
        });
      });

      // Store improvement plan
      await pool.query(
        'UPDATE users SET improvement_plan = $1 WHERE id = $2',
        [JSON.stringify(improvements), userId]
      );

      return improvements;
    } catch (error) {
      console.error('Failed to create improvement plan:', error);
      return [];
    }
  }

  async updateImprovementProgress(userId: string, improvementId: string, progress: number): Promise<void> {
    try {
      const result = await pool.query(
        'SELECT improvement_plan FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) return;

      const improvements: Improvement[] = JSON.parse(result.rows[0].improvement_plan || '[]');
      const updatedImprovements = improvements.map(imp => 
        imp.id === improvementId ? { ...imp, progress, completed: progress >= 100 } : imp
      );

      await pool.query(
        'UPDATE users SET improvement_plan = $1 WHERE id = $2',
        [JSON.stringify(updatedImprovements), userId]
      );
    } catch (error) {
      console.error('Failed to update improvement progress:', error);
    }
  }
}

// Singleton instance
const gameArchiveSystem = new GameArchiveSystem();

export { gameArchiveSystem, GameArchiveSystem }; 
import { getDb } from '@/lib/db';

export interface EmotionalMove {
  moveNumber: number;
  move: string;
  fen: string;
  emotions: {
    tension: number;      // 0-100: Tactical complexity, threats
    hope: number;         // 0-100: Winning chances, breakthrough potential  
    aggression: number;   // 0-100: Attacking moves, sacrifices
    collapse: number;     // 0-100: Blunders, position deterioration
  };
  narrative: string;
  intensity: 'low' | 'medium' | 'high' | 'critical';
}

export interface EmotionHeatmap {
  moves: EmotionalMove[];
  peaks: {
    tension: EmotionalMove[];
    hope: EmotionalMove[];
    aggression: EmotionalMove[];
    collapse: EmotionalMove[];
  };
  overallArc: string;
}

export class PGNEmotionClassifier {
  static async classifyPGN(pgn: string): Promise<EmotionHeatmap> {
    try {
      const pgnHash = this.generatePGNHash(pgn);
      
      const db = await getDb();
      const cached = await db.query(
        'SELECT emotion_heatmap, overall_arc FROM pgn_emotion_analysis WHERE pgn_hash = $1',
        [pgnHash]
      );

      if (cached.rows.length > 0) {
        return {
          ...cached.rows[0].emotion_heatmap,
          overallArc: cached.rows[0].overall_arc
        };
      }

      const moves = this.parsePGNMoves(pgn);
      const emotionalMoves: EmotionalMove[] = [];
      
      for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        const emotions = await this.analyzeMove(move, i);
        const narrative = await this.adaptNarration(emotions, move.move);
        const intensity = this.calculateIntensity(emotions);

        emotionalMoves.push({
          moveNumber: move.moveNumber,
          move: move.move,
          fen: move.fen,
          emotions,
          narrative,
          intensity
        });
      }

      const peaks = this.identifyEmotionalPeaks(emotionalMoves);
      const overallArc = this.generateOverallArc(emotionalMoves);

      const heatmap: EmotionHeatmap = {
        moves: emotionalMoves,
        peaks,
        overallArc
      };

      await db.query(
        'INSERT INTO pgn_emotion_analysis (pgn_hash, emotion_heatmap, overall_arc, created_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (pgn_hash) DO UPDATE SET emotion_heatmap = EXCLUDED.emotion_heatmap, overall_arc = EXCLUDED.overall_arc, updated_at = NOW()',
        [pgnHash, JSON.stringify(heatmap), overallArc]
      );

      return heatmap;
    } catch (error) {
      console.error('Failed to classify PGN emotions:', error);
      throw error;
    }
  }

  static async adaptNarration(emotions: EmotionalMove['emotions'], move: string): Promise<string> {
    try {
      const { tension, hope, aggression, collapse } = emotions;
      
      if (collapse > 80) {
        return `${move} — this wasn't just a mistake, this was the moment everything unraveled.`;
      }
      
      if (aggression > 85 && tension > 70) {
        return `${move}! This wasn't just calculation — this was pure defiance.`;
      }
      
      if (hope > 90) {
        return `${move} — suddenly, the impossible became inevitable.`;
      }
      
      if (tension > 85) {
        return `${move}... the position crackles with electric tension.`;
      }
      
      if (aggression > 70) {
        return `${move} — bold, fearless, uncompromising.`;
      }
      
      if (hope > 70) {
        return `${move} — a glimmer of light in the darkness.`;
      }
      
      const dominantEmotion = Math.max(tension, hope, aggression, collapse);
      
      if (dominantEmotion === tension) {
        return `${move} — the pieces dance on a knife's edge.`;
      } else if (dominantEmotion === hope) {
        return `${move} — hope springs eternal on the 64 squares.`;
      } else if (dominantEmotion === aggression) {
        return `${move} — striking with purpose and precision.`;
      } else {
        return `${move} — sometimes the board tells a story of struggle.`;
      }
    } catch (error) {
      console.error('Failed to adapt narration:', error);
      return `${move} — a moment in the eternal dance of chess.`;
    }
  }

  private static generatePGNHash(pgn: string): string {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(pgn.trim()).digest('hex');
  }

  private static parsePGNMoves(pgn: string): Array<{moveNumber: number; move: string; fen: string}> {
    const moves: Array<{moveNumber: number; move: string; fen: string}> = [];
    
    const movePattern = /(\d+)\.?\s*([NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQ])?[+#]?)/g;
    let match;
    let moveNumber = 1;
    
    while ((match = movePattern.exec(pgn)) !== null) {
      moves.push({
        moveNumber: parseInt(match[1]) || moveNumber,
        move: match[2],
        fen: `fen_placeholder_${moveNumber}`
      });
      moveNumber++;
    }
    
    return moves;
  }

  private static async analyzeMove(
    move: {moveNumber: number; move: string; fen: string}, 
    index: number
  ): Promise<EmotionalMove['emotions']> {
    const moveStr = move.move;
    
    let tension = 30;
    let hope = 40;
    let aggression = 20;
    const collapse = 10;

    if (moveStr.includes('x')) {
      aggression += 25;
      tension += 20;
    }

    if (moveStr.includes('+')) {
      aggression += 15;
      tension += 25;
      hope += 20;
    }

    if (moveStr.includes('#')) {
      hope += 50;
      aggression += 30;
      tension = 100;
    }

    if (moveStr.includes('=')) {
      hope += 40;
      tension += 30;
    }

    if (/^[NBRQ]/.test(moveStr)) {
      aggression += 10;
      tension += 10;
    }

    if (moveStr.includes('O-O')) {
      tension -= 10;
      hope += 15;
    }

    const isEarlyGame = index < 10;
    const isMidGame = index >= 10 && index < 30;
    const isEndGame = index >= 30;

    if (isEarlyGame) {
      tension *= 0.8;
      hope += 10;
    } else if (isMidGame) {
      tension += 15;
      aggression += 10;
    } else if (isEndGame) {
      tension += 20;
      hope += 15;
    }

    const randomVariation = () => (Math.random() - 0.5) * 20;
    
    return {
      tension: Math.max(0, Math.min(100, tension + randomVariation())),
      hope: Math.max(0, Math.min(100, hope + randomVariation())),
      aggression: Math.max(0, Math.min(100, aggression + randomVariation())),
      collapse: Math.max(0, Math.min(100, collapse + randomVariation()))
    };
  }

  private static calculateIntensity(emotions: EmotionalMove['emotions']): 'low' | 'medium' | 'high' | 'critical' {
    const maxEmotion = Math.max(emotions.tension, emotions.hope, emotions.aggression, emotions.collapse);
    
    if (maxEmotion >= 90) return 'critical';
    if (maxEmotion >= 70) return 'high';
    if (maxEmotion >= 50) return 'medium';
    return 'low';
  }

  private static identifyEmotionalPeaks(moves: EmotionalMove[]): EmotionHeatmap['peaks'] {
    const peaks = {
      tension: [] as EmotionalMove[],
      hope: [] as EmotionalMove[],
      aggression: [] as EmotionalMove[],
      collapse: [] as EmotionalMove[]
    };

    const threshold = 75;

    moves.forEach(move => {
      if (move.emotions.tension >= threshold) peaks.tension.push(move);
      if (move.emotions.hope >= threshold) peaks.hope.push(move);
      if (move.emotions.aggression >= threshold) peaks.aggression.push(move);
      if (move.emotions.collapse >= threshold) peaks.collapse.push(move);
    });

    Object.keys(peaks).forEach(emotion => {
      peaks[emotion as keyof typeof peaks] = peaks[emotion as keyof typeof peaks]
        .sort((a, b) => b.emotions[emotion as keyof EmotionalMove['emotions']] - a.emotions[emotion as keyof EmotionalMove['emotions']])
        .slice(0, 3);
    });

    return peaks;
  }

  private static generateOverallArc(moves: EmotionalMove[]): string {
    if (moves.length === 0) return 'A quiet game with subtle undercurrents.';

    const avgTension = moves.reduce((sum, m) => sum + m.emotions.tension, 0) / moves.length;
    const avgHope = moves.reduce((sum, m) => sum + m.emotions.hope, 0) / moves.length;
    const avgAggression = moves.reduce((sum, m) => sum + m.emotions.aggression, 0) / moves.length;
    const avgCollapse = moves.reduce((sum, m) => sum + m.emotions.collapse, 0) / moves.length;

    const criticalMoments = moves.filter(m => m.intensity === 'critical').length;
    const highIntensity = moves.filter(m => m.intensity === 'high').length;

    if (criticalMoments >= 3) {
      return 'A dramatic battle filled with critical moments and emotional swings.';
    }
    
    if (avgAggression > 60 && avgTension > 60) {
      return 'An aggressive, tactical slugfest where both sides fought with fierce determination.';
    }
    
    if (avgHope > 70) {
      return 'A game of hope and redemption, where possibilities bloomed on every move.';
    }
    
    if (avgCollapse > 40) {
      return 'A tragic tale of missed opportunities and gradual decline.';
    }
    
    if (highIntensity >= 5) {
      return 'A tense strategic battle with moments of brilliance and pressure.';
    }
    
    return 'A thoughtful game with subtle emotional undercurrents and quiet intensity.';
  }

  static async generateEmotionalNarration(
    emotions: EmotionalMove['emotions'],
    move: string
  ): Promise<string> {
    try {
      const narrative = await this.adaptNarration(emotions, move);
      return narrative;
    } catch (error) {
      console.error('Failed to generate emotional narration:', error);
      return await this.adaptNarration(emotions, move);
    }
  }
}

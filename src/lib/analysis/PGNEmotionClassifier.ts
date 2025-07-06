export interface EmotionalTimeline {
  moveNumber: number;
  position: string;
  emotion: string;
  intensity: number;
  evaluation: number;
  move?: string;
  type?: string;
}

export interface PGNEmotionAnalysis {
  dominantEmotion: string;
  emotionalTimeline: EmotionalTimeline[];
  keyMoments: EmotionalTimeline[];
  overallIntensity: number;
  gamePhase: 'opening' | 'middlegame' | 'endgame';
}

export class PGNEmotionClassifier {
  private emotionPatterns = {
    sacrifice: /(?:sacrifice|sac|gives up|offers|exchange)/i,
    blunder: /(?:blunder|mistake|error|loses|drops)/i,
    brilliancy: /(?:brilliant|genius|masterful|beautiful|stunning)/i,
    tactical: /(?:fork|pin|skewer|discovery|deflection)/i,
    positional: /(?:structure|weakness|control|space|initiative)/i,
    endgame: /(?:endgame|pawn promotion|king and pawn|rook endgame)/i,
    tension: /(?:tension|pressure|critical|sharp|complex)/i,
    calm: /(?:quiet|solid|safe|stable|peaceful)/i
  };

  private evaluationThresholds = {
    blunder: -1.5,
    mistake: -0.8,
    inaccuracy: -0.3,
    good: 0.3,
    excellent: 0.8,
    brilliant: 1.5
  };

  async classifyPGN(pgn: string): Promise<PGNEmotionAnalysis> {
    if (!pgn || typeof pgn !== 'string' || pgn.length > 50000) {
      throw new Error('Invalid PGN input - must be string under 50KB');
    }
    
    const moves = this.parsePGN(pgn);
    const timeline = this.analyzeEmotionalTimeline(moves);
    const keyMoments = this.extractKeyMoments(timeline);
    const dominantEmotion = this.calculateDominantEmotion(timeline);
    const gamePhase = this.determineGamePhase(moves.length);
    const overallIntensity = this.calculateOverallIntensity(timeline);

    return {
      dominantEmotion,
      emotionalTimeline: timeline,
      keyMoments,
      overallIntensity,
      gamePhase
    };
  }

  private parsePGN(pgn: string): string[] {
    if (!pgn || typeof pgn !== 'string' || pgn.length > 50000) {
      throw new Error('Invalid PGN input - must be string under 50KB');
    }
    
    const sanitizedPgn = pgn.slice(0, 10000);
    return sanitizedPgn
      .replace(/\d{1,3}\./g, '')
      .split(/\s+/)
      .filter(move => move.trim() && !move.includes('[') && !move.includes('{'))
      .slice(0, 80);
  }

  private analyzeEmotionalTimeline(moves: string[]): EmotionalTimeline[] {
    const timeline: EmotionalTimeline[] = [];

    moves.forEach((move, index) => {
      const moveNumber = Math.floor(index / 2) + 1;
      const emotion = this.classifyMoveEmotion(move, index);
      const intensity = this.calculateMoveIntensity(move, index);
      const evaluation = this.estimateEvaluation(move);

      timeline.push({
        moveNumber,
        position: this.generatePositionFEN(),
        emotion,
        intensity,
        evaluation
      });
    });

    return timeline;
  }

  private classifyMoveEmotion(move: string, moveIndex: number): string {
    if (move.includes('x') && move.includes('Q')) return 'sacrifice';
    if (move.includes('x') && (move.includes('R') || move.includes('N'))) return 'tactical';
    if (move.includes('+') || move.includes('#')) return 'brilliancy';
    if (move.includes('O-O')) return 'positional';
    if (moveIndex > 60) return 'endgame';
    if (move.length <= 2) return 'calm';
    
    return 'positional';
  }

  private calculateMoveIntensity(move: string, moveIndex: number): number {
    let intensity = 0.3;

    if (move.includes('x')) intensity += 0.3;
    if (move.includes('+')) intensity += 0.2;
    if (move.includes('#')) intensity += 0.5;
    if (move.includes('Q')) intensity += 0.2;
    if (move.includes('=')) intensity += 0.4;
    if (moveIndex > 40) intensity += 0.1;

    return Math.min(intensity, 1.0);
  }

  private estimateEvaluation(move: string): number {
    let evaluation = 0;

    if (move.includes('#')) evaluation = 5.0;
    else if (move.includes('+')) evaluation = (Date.now() % 200) / 100 - 1;
    else if (move.includes('x') && move.includes('Q')) evaluation = (Date.now() % 300) / 100 - 1.5;
    else if (move.includes('x')) evaluation = (Date.now() % 150) / 100 - 0.5;
    else evaluation = (Date.now() % 60) / 100 - 0.3;

    return Math.round(evaluation * 100) / 100;
  }

  private generatePositionFEN(): string {
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }

  private extractKeyMoments(timeline: EmotionalTimeline[]): EmotionalTimeline[] {
    return timeline
      .filter(point => point.intensity > 0.6 || Math.abs(point.evaluation) > 1.0)
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 5);
  }

  private calculateDominantEmotion(timeline: EmotionalTimeline[]): string {
    const emotionCounts: Record<string, number> = {};
    
    timeline.forEach(point => {
      emotionCounts[point.emotion] = (emotionCounts[point.emotion] || 0) + point.intensity;
    });

    return Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'positional';
  }

  private determineGamePhase(moveCount: number): 'opening' | 'middlegame' | 'endgame' {
    if (moveCount < 20) return 'opening';
    if (moveCount < 60) return 'middlegame';
    return 'endgame';
  }

  private calculateOverallIntensity(timeline: EmotionalTimeline[]): number {
    const avgIntensity = timeline.reduce((sum, point) => sum + point.intensity, 0) / timeline.length;
    return Math.round(avgIntensity * 100) / 100;
  }

  async batchClassify(pgnList: string[]): Promise<PGNEmotionAnalysis[]> {
    const results: PGNEmotionAnalysis[] = [];
    
    for (const pgn of pgnList.slice(0, 10)) {
      try {
        const analysis = await this.classifyPGN(pgn);
        results.push(analysis);
      } catch (error) {
        console.error('PGN classification error:', error);
      }
    }

    return results;
  }

  generateEmotionReport(analysis: PGNEmotionAnalysis): string {
    return `Game Analysis Report:
- Dominant Emotion: ${analysis.dominantEmotion}
- Overall Intensity: ${analysis.overallIntensity}
- Game Phase: ${analysis.gamePhase}
- Key Moments: ${analysis.keyMoments.length}
- Emotional Timeline: ${analysis.emotionalTimeline.length} moves analyzed`;
  }
}

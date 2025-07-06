import { createHash } from 'crypto';

export interface EmotionalMove {
  move: string;
  moveNumber: number;
  emotions: {
    tension: number;
    hope: number;
    aggression: number;
    collapse: number;
  };
  intensity: 'low' | 'medium' | 'high' | 'critical';
  narrative: string;
}

export interface EmotionHeatmap {
  moves: EmotionalMove[];
  overallArc: string;
  peakMoments: number[];
  emotionalFlow: string;
}

export class PGNEmotionClassifier {
  private static readonly MOVE_PATTERN = /\b([NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQ])?[+#]?)\b/g;
  
  static async classifyPGN(pgn: string): Promise<EmotionHeatmap> {
    const moves = this.parsePGNMoves(pgn);
    const emotionalMoves: EmotionalMove[] = [];
    
    for (let i = 0; i < moves.length && i < 2; i++) {
      const move = moves[i];
      const emotions = this.analyzeMove(move, i, moves);
      const intensity = this.calculateIntensity(emotions);
      const narrative = this.generateMoveNarrative(move, emotions, intensity);
      
      emotionalMoves.push({
        move,
        moveNumber: Math.floor(i / 2) + 1,
        emotions,
        intensity,
        narrative
      });
    }
    
    const overallArc = this.generateOverallArc(emotionalMoves);
    const peakMoments = this.identifyPeakMoments(emotionalMoves);
    const emotionalFlow = this.generateEmotionalFlow(emotionalMoves);
    
    return {
      moves: emotionalMoves,
      overallArc,
      peakMoments,
      emotionalFlow
    };
  }
  
  private static parsePGNMoves(pgn: string): string[] {
    const moves: string[] = [];
    
    const limitedPgn = pgn.substring(0, 50);
    const cleanPgn = limitedPgn.replace(/\{[^}]*\}/g, '').replace(/\([^)]*\)/g, '');
    
    const movePattern = /\b([NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQ])?[+#]?)\b/g;
    let match;
    let iterations = 0;
    const maxIterations = 1;
    
    while ((match = movePattern.exec(cleanPgn)) !== null && iterations < maxIterations) {
      moves.push(match[1]);
      iterations++;
      
      if (movePattern.lastIndex === match.index) {
        movePattern.lastIndex++;
      }
    }
    
    return moves;
  }
  
  private static analyzeMove(move: string, index: number, allMoves: string[]): EmotionalMove['emotions'] {
    const emotions = {
      tension: 30,
      hope: 40,
      aggression: 20,
      collapse: 10
    };
    
    if (move.includes('x')) emotions.aggression += 25;
    if (move.includes('+')) emotions.tension += 20;
    if (move.includes('#')) {
      emotions.hope += 40;
      emotions.tension += 30;
    }
    if (move.includes('O-O')) emotions.tension -= 10;
    if (move.includes('=')) emotions.hope += 30;
    
    const gamePhase = index < 20 ? 'opening' : index < 60 ? 'middlegame' : 'endgame';
    if (gamePhase === 'middlegame') {
      emotions.tension += 15;
      emotions.aggression += 10;
    }
    
    if (allMoves.length > index + 1) {
      const nextMove = allMoves[index + 1];
      if (nextMove && nextMove.includes('x')) {
        emotions.tension += 5;
      }
    }
    
    Object.keys(emotions).forEach(key => {
      emotions[key as keyof typeof emotions] = Math.max(0, Math.min(100, emotions[key as keyof typeof emotions]));
    });
    
    return emotions;
  }
  
  private static calculateIntensity(emotions: EmotionalMove['emotions']): EmotionalMove['intensity'] {
    const maxEmotion = Math.max(...Object.values(emotions));
    
    if (maxEmotion >= 80) return 'critical';
    if (maxEmotion >= 60) return 'high';
    if (maxEmotion >= 40) return 'medium';
    return 'low';
  }
  
  private static generateMoveNarrative(move: string, emotions: EmotionalMove['emotions'], intensity: EmotionalMove['intensity']): string {
    const templates = {
      critical: [
        `${move} - A moment that will define the entire game!`,
        `The decisive ${move} changes everything on the board.`,
        `With ${move}, the position reaches a critical juncture.`
      ],
      high: [
        `${move} creates significant tension in the position.`,
        `An important ${move} that shifts the balance.`,
        `The powerful ${move} demands immediate attention.`
      ],
      medium: [
        `${move} develops the position thoughtfully.`,
        `A solid ${move} that maintains the initiative.`,
        `The move ${move} keeps the game interesting.`
      ],
      low: [
        `${move} follows natural development principles.`,
        `A quiet ${move} that prepares future plans.`,
        `The move ${move} maintains the position.`
      ]
    };
    
    const narratives = templates[intensity];
    return narratives[Math.floor(Math.random() * narratives.length)];
  }
  
  private static generateOverallArc(moves: EmotionalMove[]): string {
    if (moves.length === 0) return 'A quiet game with minimal emotional fluctuation.';
    
    const avgTension = moves.reduce((sum, m) => sum + m.emotions.tension, 0) / moves.length;
    const avgAggression = moves.reduce((sum, m) => sum + m.emotions.aggression, 0) / moves.length;
    
    if (avgTension > 60 && avgAggression > 50) {
      return 'A thrilling tactical battle with constant tension and aggressive play.';
    } else if (avgTension > 50) {
      return 'A tense strategic struggle with critical moments throughout.';
    } else {
      return 'A positional game with gradual maneuvering and strategic depth.';
    }
  }
  
  private static identifyPeakMoments(moves: EmotionalMove[]): number[] {
    return moves
      .map((move, index) => ({ index, intensity: Math.max(...Object.values(move.emotions)) }))
      .filter(item => item.intensity >= 70)
      .map(item => item.index)
      .slice(0, 5);
  }
  
  private static generateEmotionalFlow(moves: EmotionalMove[]): string {
    if (moves.length < 10) return 'Brief encounter with limited emotional development.';
    
    const early = moves.slice(0, Math.floor(moves.length / 3));
    const middle = moves.slice(Math.floor(moves.length / 3), Math.floor(2 * moves.length / 3));
    const late = moves.slice(Math.floor(2 * moves.length / 3));
    
    const earlyTension = early.reduce((sum, m) => sum + m.emotions.tension, 0) / early.length;
    const middleTension = middle.reduce((sum, m) => sum + m.emotions.tension, 0) / middle.length;
    const lateTension = late.reduce((sum, m) => sum + m.emotions.tension, 0) / late.length;
    
    if (middleTension > earlyTension && middleTension > lateTension) {
      return 'The game builds to a dramatic climax in the middlegame before resolving.';
    } else if (lateTension > earlyTension && lateTension > middleTension) {
      return 'Tension escalates throughout the game, reaching its peak in the endgame.';
    } else {
      return 'The emotional intensity remains relatively consistent throughout the game.';
    }
  }
  
  static generatePGNHash(pgn: string): string {
    return createHash('sha256').update(pgn.trim()).digest('hex');
  }
}

import { BambaiVoiceEngine } from '../voice/BambaiVoiceEngine';
import { Chess } from 'chess.js';

export interface StoryElement {
  moveIndex: number;
  type: 'capture' | 'check' | 'checkmate' | 'blunder' | 'brilliancy' | 'sacrifice' | 'promotion';
  description: string;
  drama: 'low' | 'medium' | 'high' | 'climactic';
  emotion: 'neutral' | 'tension' | 'triumph' | 'despair' | 'excitement' | 'suspense';
}

export interface AlternateLine {
  moveIndex: number;
  original: string;
  alternatives: string[];
  commentary: string;
  evaluation: number;
}

export interface StoryGeneration {
  textStory: string;
  voiceNarration?: ArrayBuffer;
  keyMoments: StoryElement[];
  alternateLines: AlternateLine[];
  historicalContext?: string;
  tacticalThemes: string[];
  quotes: string[];
}

export class StorytellingEngine {
  private bambai = new BambaiVoiceEngine();
  private chess = new Chess();

  async generateStory(
    pgn: string, 
    style: 'dramatic' | 'humorous' | 'historical' | 'analytical' = 'dramatic'
  ): Promise<StoryGeneration> {
    try {
      this.chess.loadPgn(pgn);
      const moves = this.chess.history({ verbose: true });
      
      const storyElements = this.analyzeGameForStory(moves);
      const alternateLines = this.generateAlternateLines(moves);
      const tacticalThemes = this.identifyTacticalThemes(moves);
      const quotes = this.selectRelevantQuotes(storyElements, style);
      
      const narrative = this.buildNarrative(storyElements, alternateLines, style, tacticalThemes, quotes);
      
      const voiceNarration = await this.generateVoiceNarration(narrative, style);
      
      const historicalContext = style === 'historical' ? this.generateHistoricalContext() : undefined;
      
      return {
        textStory: narrative,
        voiceNarration,
        keyMoments: storyElements.keyMoments,
        alternateLines,
        historicalContext,
        tacticalThemes,
        quotes
      };
    } catch (error) {
      console.error('Story generation failed:', error);
      throw new Error('Failed to generate story from PGN');
    }
  }

  private analyzeGameForStory(moves: Array<{ piece: string; captured?: string; san: string; promotion?: string }>): { keyMoments: StoryElement[] } {
    const keyMoments: StoryElement[] = [];
    
    moves.forEach((move, index) => {
      if (move.captured) {
        keyMoments.push({
          moveIndex: index,
          type: 'capture',
          description: `${move.piece.toUpperCase()} captures ${move.captured}`,
          drama: this.evaluateCaptureDrama({ piece: move.piece, captured: move.captured }),
          emotion: 'tension'
        });
      }
      
      if (move.san.includes('#')) {
        keyMoments.push({
          moveIndex: index,
          type: 'checkmate',
          description: `Checkmate! ${move.san} delivers the final blow`,
          drama: 'climactic',
          emotion: 'triumph'
        });
      } else if (move.san.includes('+')) {
        keyMoments.push({
          moveIndex: index,
          type: 'check',
          description: `Check! ${move.san} puts pressure on the king`,
          drama: 'medium',
          emotion: 'tension'
        });
      }
      
      if (move.promotion) {
        keyMoments.push({
          moveIndex: index,
          type: 'promotion',
          description: `Pawn promotes to ${move.promotion.toUpperCase()}!`,
          drama: 'high',
          emotion: 'excitement'
        });
      }
      
      if (move.san.includes('??')) {
        keyMoments.push({
          moveIndex: index,
          type: 'blunder',
          description: `A critical mistake with ${move.san}`,
          drama: 'high',
          emotion: 'despair'
        });
      }
      
      if (move.san.includes('!!')) {
        keyMoments.push({
          moveIndex: index,
          type: 'brilliancy',
          description: `Brilliant! ${move.san} is a masterpiece`,
          drama: 'high',
          emotion: 'triumph'
        });
      }
    });
    
    return { keyMoments };
  }

  private evaluateCaptureDrama(move: { piece: string; captured: string }): 'low' | 'medium' | 'high' | 'climactic' {
    const pieceValues: { [key: string]: number } = {
      'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
    };
    
    const capturedValue = pieceValues[move.captured.toLowerCase()] || 1;
    const capturingValue = pieceValues[move.piece.toLowerCase()] || 1;
    
    if (capturedValue >= 5) return 'high'; // Rook or Queen captured
    if (capturedValue >= 3) return 'medium'; // Minor piece captured
    if (capturingValue < capturedValue) return 'high'; // Favorable trade
    return 'low';
  }

  private generateAlternateLines(moves: Array<{ san: string; piece: string }>): AlternateLine[] {
    const alternateLines: AlternateLine[] = [];
    
    moves.forEach((move, index) => {
      if (index % 10 === 0 && index > 0) { // Every 10th move for demonstration
        alternateLines.push({
          moveIndex: index,
          original: move.san,
          alternatives: this.generateAlternativeMoves(move),
          commentary: "What if they had chosen a different path?",
          evaluation: Math.random() * 2 - 1 // Simplified evaluation
        });
      }
    });
    
    return alternateLines;
  }

  private generateAlternativeMoves(move: { piece: string; san: string }): string[] {
    const alternatives = [
      `${move.piece}d4`, `${move.piece}f4`, `${move.piece}e5`
    ].filter(alt => alt !== move.san);
    
    return alternatives.slice(0, 2);
  }

  private identifyTacticalThemes(moves: Array<{ san: string; captured?: string; promotion?: string }>): string[] {
    const themes: string[] = [];
    
    const moveStrings = moves.map(m => m.san).join(' ');
    
    if (moveStrings.includes('O-O-O') || moveStrings.includes('O-O')) {
      themes.push('King Safety');
    }
    
    if (moves.some(m => m.captured)) {
      themes.push('Material Exchange');
    }
    
    if (moves.some(m => m.san.includes('+'))) {
      themes.push('King Hunt');
    }
    
    if (moves.some(m => m.promotion)) {
      themes.push('Pawn Endgame');
    }
    
    themes.push('Positional Play', 'Strategic Maneuvering');
    
    return themes;
  }

  private selectRelevantQuotes(storyElements: { keyMoments: StoryElement[] }, style: string): string[] {
    const quotes: string[] = [];
    
    if (style === 'dramatic') {
      quotes.push(
        "Every chess master was once a beginner. - Irving Chernev",
        "Chess is mental torture. - Garry Kasparov",
        "In chess, you try to do your best, but there are instances where you make mistakes or you try and take risks and it doesn't work out. - Magnus Carlsen"
      );
    } else if (style === 'humorous') {
      quotes.push(
        "I prefer to lose a really good game than to win a bad one. - David Levy",
        "Chess is a fairy tale of 1001 blunders. - Savielly Tartakower",
        "The pawns are the soul of chess. - François-André Danican Philidor"
      );
    } else if (style === 'historical') {
      quotes.push(
        "Chess is the gymnasium of the mind. - Blaise Pascal",
        "Chess holds its master in its own bonds, shackling the mind and brain so that the inner freedom of the very strongest must suffer. - Albert Einstein",
        "Life is like a game of chess, changing with each move. - Chinese Proverb"
      );
    }
    
    return quotes.slice(0, 2); // Limit to 2 quotes per story
  }

  private buildNarrative(
    storyElements: { keyMoments: StoryElement[] },
    alternateLines: AlternateLine[],
    style: string,
    tacticalThemes: string[],
    quotes: string[]
  ): string {
    let narrative = this.getOpeningByStyle(style);
    
    if (tacticalThemes.length > 0) {
      narrative += `\n\nThis game showcases ${tacticalThemes.slice(0, 2).join(' and ')}, `;
      narrative += "weaving a tapestry of strategic brilliance across the 64 squares.\n";
    }
    
    storyElements.keyMoments.forEach((moment, index) => {
      if (index < 5) { // Limit to top 5 moments
        narrative += `\n${this.narrateMoment(moment, style)}`;
      }
    });
    
    if (alternateLines.length > 0) {
      narrative += `\n\nBut chess is a game of infinite possibilities. `;
      alternateLines.slice(0, 2).forEach(line => {
        narrative += `At move ${line.moveIndex + 1}, instead of ${line.original}, `;
        narrative += `${line.alternatives[0]} might have led the game down an entirely different path. `;
      });
    }
    
    if (quotes.length > 0) {
      narrative += `\n\nAs ${quotes[0].split(' - ')[1]} once said: "${quotes[0].split(' - ')[0]}"`;
    }
    
    narrative += this.getClosingByStyle(style);
    
    return narrative;
  }

  private getOpeningByStyle(style: string): string {
    switch (style) {
      case 'dramatic':
        return "In the theater of the mind, where 32 pieces dance their eternal ballet, a story unfolds that will echo through the corridors of chess history...";
      case 'humorous':
        return "Gather 'round, chess enthusiasts, for a tale of wooden warriors who sometimes forget which way they're supposed to move...";
      case 'historical':
        return "In the grand tradition of chess masters throughout the centuries, this game stands as a testament to the timeless beauty of our royal game...";
      case 'analytical':
        return "Through the lens of objective analysis, this game presents several instructive moments worthy of detailed examination...";
      default:
        return "This is a story written in moves, told through the language of chess...";
    }
  }

  private narrateMoment(moment: StoryElement, style: string): string {
    const baseDescription = moment.description;
    
    switch (style) {
      case 'dramatic':
        if (moment.emotion === 'triumph') {
          return `The board trembles as ${baseDescription}! Victory crystallizes in this moment of pure chess poetry.`;
        } else if (moment.emotion === 'tension') {
          return `Tension crackles across the board as ${baseDescription}, shifting the very foundations of the position.`;
        }
        return `${baseDescription} - a move that will be remembered long after the pieces are put away.`;
        
      case 'humorous':
        if (moment.type === 'blunder') {
          return `Oops! ${baseDescription} - even grandmasters have their "Did I really just do that?" moments.`;
        } else if (moment.type === 'brilliancy') {
          return `*Chef's kiss* ${baseDescription} - this move deserves its own standing ovation!`;
        }
        return `${baseDescription} - and the chess gods smiled (or frowned, depending on which side you're rooting for).`;
        
      case 'historical':
        return `In the style of the great masters, ${baseDescription}, demonstrating the timeless principles that have guided chess for centuries.`;
        
      default:
        return baseDescription;
    }
  }

  private getClosingByStyle(style: string): string {
    switch (style) {
      case 'dramatic':
        return "\n\nAnd so the final curtain falls on this chess drama, leaving us with memories of moves that danced between brilliance and folly, forever etched in the annals of the royal game.";
      case 'humorous':
        return "\n\nAnd they all lived happily ever after... until the next game, where they'll probably make completely different mistakes. Such is the beautiful chaos of chess!";
      case 'historical':
        return "\n\nThus concludes another chapter in the endless book of chess, adding its voice to the chorus of games that have shaped our understanding of this ancient art.";
      case 'analytical':
        return "\n\nThis concludes our analysis of the key instructional moments from this game.";
      default:
        return "\n\nThe story ends, but the game lives on.";
    }
  }

  private generateHistoricalContext(): string {
    return "This game echoes the classical principles established by masters like Capablanca and Petrosian, " +
           "demonstrating how timeless chess wisdom continues to guide modern play. The strategic themes " +
           "present here can be traced back to the great tournament games of the early 20th century.";
  }

  private async generateVoiceNarration(narrative: string, style: string): Promise<ArrayBuffer | undefined> {
    try {
      const voiceMode = this.getVoiceModeForStyle(style);
      const emotion = this.getEmotionForStyle(style);
      
      const voiceBuffer = await this.bambai.generateVoice(narrative, voiceMode, emotion);
      return voiceBuffer ? voiceBuffer.buffer : undefined;
    } catch (error) {
      console.error('Voice narration generation failed:', error);
      return undefined;
    }
  }

  private getVoiceModeForStyle(style: string): 'wiseMentor' | 'enthusiasticCommentator' | 'thoughtfulPhilosopher' | 'warmEncourager' | 'poeticStoryteller' | 'whisperMode' | 'dramaticNarrator' {
    switch (style) {
      case 'dramatic': return 'dramaticNarrator';
      case 'humorous': return 'enthusiasticCommentator';
      case 'historical': return 'thoughtfulPhilosopher';
      case 'analytical': return 'wiseMentor';
      default: return 'poeticStoryteller';
    }
  }

  private getEmotionForStyle(style: string): string {
    switch (style) {
      case 'dramatic': return 'intense';
      case 'humorous': return 'playful';
      case 'historical': return 'reverent';
      case 'analytical': return 'focused';
      default: return 'neutral';
    }
  }
}

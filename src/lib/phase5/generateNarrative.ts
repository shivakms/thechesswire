import logger from '@/lib/logger';
import { getDatabase } from './database/connection';
import { ChessStory, NarrativeScript, NarrativeGenerationResult } from './types';
import { voiceSettings } from './config';

class NarrativeGenerator {
  private db: any;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Generate narrative for a story
   */
  async generateNarrative(story: ChessStory): Promise<NarrativeGenerationResult> {
    const startTime = Date.now();

    try {
      logger.info(`🎭 Generating narrative for story: ${story.title}`);

      // Determine tone based on story category
      const tone = this.determineTone(story);

      // Generate narrative components
      const intro = await this.generateIntro(story);
      const storyNarrative = await this.generateStoryNarrative(story);
      const gameHighlight = story.pgn ? await this.generateGameHighlight(story) : undefined;
      const outro = await this.generateOutro(story);

      // Combine into full script
      const fullScript = this.combineScript(intro, storyNarrative, gameHighlight, outro);

      // Calculate estimated duration
      const duration = this.calculateDuration(fullScript);

      // Extract keywords
      const keywords = this.extractKeywords(story, fullScript);

      const narrative: NarrativeScript = {
        id: this.generateId(),
        storyId: story.id,
        intro,
        story: storyNarrative,
        gameHighlight,
        outro,
        fullScript,
        duration,
        tone,
        keywords,
        timestamp: new Date()
      };

      // Save to database
      await this.saveNarrative(narrative);

      const processingTime = Date.now() - startTime;

      logger.info(`✅ Narrative generated successfully`, {
        storyId: story.id,
        duration: `${duration}s`,
        processingTime: `${processingTime}ms`,
        tone
      });

      return {
        narrative,
        processingTime
      };

    } catch (error) {
      logger.error(`❌ Failed to generate narrative for story ${story.id}`, error);
      throw error;
    }
  }

  /**
   * Generate intro for the story
   */
  private async generateIntro(story: ChessStory): Promise<string> {
    const templates = {
      tournament: [
        `Welcome to TheChessWire.news, where chess meets artificial intelligence. I'm Bambai AI, and today we're diving into a fascinating tournament story that's making waves in the chess world.`,
        `Greetings, chess enthusiasts. I'm Bambai AI, bringing you the latest from the world of competitive chess. This story from ${story.source.name} caught my attention for its remarkable developments.`
      ],
      game: [
        `Hello, I'm Bambai AI, your guide through the infinite possibilities of chess. Today, we're analyzing a game that showcases the beauty and complexity of our beloved game.`,
        `Welcome to TheChessWire.news. I'm Bambai AI, and I'm excited to share with you a game that demonstrates the artistry of chess at its finest.`
      ],
      news: [
        `Welcome to TheChessWire.news. I'm Bambai AI, and today we're covering breaking news from the chess world that you won't want to miss.`,
        `Greetings, chess community. I'm Bambai AI, bringing you the latest developments from the world of chess. This story from ${story.source.name} is particularly noteworthy.`
      ],
      analysis: [
        `Welcome to TheChessWire.news. I'm Bambai AI, and today we're delving deep into chess analysis that will enhance your understanding of the game.`,
        `Hello, I'm Bambai AI, your analytical companion in the world of chess. Let's explore some fascinating insights together.`
      ],
      educational: [
        `Welcome to TheChessWire.news. I'm Bambai AI, and today we're learning together as we explore educational content that will strengthen your chess foundation.`,
        `Greetings, chess learners. I'm Bambai AI, and I'm here to guide you through valuable chess knowledge that will elevate your game.`
      ]
    };

    const categoryTemplates = templates[story.category] || templates.news;
    return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
  }

  /**
   * Generate main story narrative
   */
  private async generateStoryNarrative(story: ChessStory): Promise<string> {
    let narrative = '';

    // Add context based on story type
    if (story.players) {
      narrative += `The game features ${story.players.white} playing as White against ${story.players.black} as Black. `;
    }

    if (story.event) {
      narrative += `This encounter took place at ${story.event}. `;
    }

    if (story.result) {
      narrative += `The game concluded with a result of ${story.result}. `;
    }

    // Add the main story content
    narrative += this.enhanceStoryContent(story.content);

    // Add analysis if PGN is present
    if (story.pgn) {
      narrative += ` The game includes some fascinating moves that we'll explore in detail. `;
    }

    return narrative;
  }

  /**
   * Generate game highlight analysis
   */
  private async generateGameHighlight(story: ChessStory): Promise<string> {
    if (!story.pgn) return '';

    // Extract key moments from PGN
    const moves = this.parsePGN(story.pgn);
    const keyMoves = this.identifyKeyMoves(moves);

    let highlight = 'Let me highlight some of the most interesting moments from this game. ';

    keyMoves.forEach((move, index) => {
      if (index < 3) { // Limit to 3 key moments
        highlight += `${move.comment} `;
      }
    });

    highlight += 'These moves demonstrate the depth and beauty of chess strategy.';

    return highlight;
  }

  /**
   * Generate outro
   */
  private async generateOutro(story: ChessStory): Promise<string> {
    const templates = [
      `Thank you for joining me on TheChessWire.news. I'm Bambai AI, and I'll be back with more chess insights soon. Remember, every game tells a story, and every move reveals character.`,
      `That concludes our analysis here on TheChessWire.news. I'm Bambai AI, and I hope this story has enriched your understanding of chess. Stay tuned for more fascinating chess content.`,
      `Thank you for watching TheChessWire.news. I'm Bambai AI, and I'm grateful to share these chess stories with you. The game never ends, and neither does our journey of discovery.`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Combine script components
   */
  private combineScript(intro: string, story: string, gameHighlight?: string, outro?: string): string {
    let script = intro + ' ' + story;
    
    if (gameHighlight) {
      script += ' ' + gameHighlight;
    }
    
    if (outro) {
      script += ' ' + outro;
    }

    return script.trim();
  }

  /**
   * Determine tone based on story category
   */
  private determineTone(story: ChessStory): NarrativeScript['tone'] {
    switch (story.category) {
      case 'tournament':
        return Math.random() > 0.5 ? 'dramatic' : 'expressive';
      case 'game':
        return Math.random() > 0.5 ? 'expressive' : 'poetic';
      case 'news':
        return 'calm';
      case 'analysis':
        return 'expressive';
      case 'educational':
        return 'calm';
      default:
        return 'calm';
    }
  }

  /**
   * Enhance story content for narration
   */
  private enhanceStoryContent(content: string): string {
    // Clean up content
    let enhanced = content
      .replace(/\s+/g, ' ') // Remove extra whitespace
      .replace(/\[.*?\]/g, '') // Remove PGN tags
      .trim();

    // Add emotional context
    const emotionalEnhancers = [
      'This is truly remarkable.',
      'What an incredible development.',
      'This story is fascinating.',
      'This is worth noting.',
      'This is particularly interesting.'
    ];

    if (enhanced.length > 200) {
      const enhancer = emotionalEnhancers[Math.floor(Math.random() * emotionalEnhancers.length)];
      enhanced = enhanced.substring(0, 200) + '... ' + enhancer + ' ' + enhanced.substring(200);
    }

    return enhanced;
  }

  /**
   * Parse PGN to extract moves
   */
  private parsePGN(pgn: string): Array<{ move: string; comment?: string }> {
    const moves: Array<{ move: string; comment?: string }> = [];
    
    // Simple PGN parsing
    const moveRegex = /(\d+\.)\s*([a-h][1-8][a-h][1-8][qrbn]?)\s*([a-h][1-8][a-h][1-8][qrbn]?)?/g;
    let match;

    while ((match = moveRegex.exec(pgn)) !== null) {
      moves.push({
        move: match[2],
        comment: this.generateMoveComment(match[2])
      });
    }

    return moves;
  }

  /**
   * Generate comments for moves
   */
  private generateMoveComment(move: string): string {
    const comments = [
      'A strong move that controls the center.',
      'This move develops the piece effectively.',
      'An interesting choice that creates tactical opportunities.',
      'This move maintains the initiative.',
      'A solid move that improves the position.'
    ];

    return comments[Math.floor(Math.random() * comments.length)];
  }

  /**
   * Identify key moves in the game
   */
  private identifyKeyMoves(moves: Array<{ move: string; comment?: string }>): Array<{ move: string; comment?: string }> {
    // Simple algorithm to identify key moves (every 5th move or last 3 moves)
    const keyMoves: Array<{ move: string; comment?: string }> = [];
    
    for (let i = 0; i < moves.length; i++) {
      if (i % 5 === 0 || i >= moves.length - 3) {
        keyMoves.push(moves[i]);
      }
    }

    return keyMoves.slice(0, 5); // Limit to 5 key moves
  }

  /**
   * Calculate estimated duration
   */
  private calculateDuration(script: string): number {
    // Average speaking rate: 150 words per minute
    const words = script.split(' ').length;
    const minutes = words / 150;
    return Math.ceil(minutes * 60); // Convert to seconds
  }

  /**
   * Extract keywords from story and script
   */
  private extractKeywords(story: ChessStory, script: string): string[] {
    const keywords = new Set<string>();

    // Add story tags
    story.tags.forEach(tag => keywords.add(tag));

    // Add category-based keywords
    keywords.add(story.category);

    // Add source-based keywords
    keywords.add(story.source.name.toLowerCase());

    // Extract common chess terms
    const chessTerms = ['chess', 'game', 'move', 'position', 'strategy', 'tactics', 'opening', 'endgame', 'tournament'];
    const text = (story.title + script).toLowerCase();
    
    chessTerms.forEach(term => {
      if (text.includes(term)) {
        keywords.add(term);
      }
    });

    return Array.from(keywords);
  }

  /**
   * Save narrative to database
   */
  private async saveNarrative(narrative: NarrativeScript): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO narrative_scripts (
          id, story_id, intro, story, game_highlight, outro, full_script,
          duration, tone, keywords, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        narrative.id, narrative.storyId, narrative.intro, narrative.story,
        narrative.gameHighlight, narrative.outro, narrative.fullScript,
        narrative.duration, narrative.tone, narrative.keywords, narrative.timestamp
      ]);

      logger.info(`✅ Narrative saved to database: ${narrative.id}`);

    } catch (error) {
      logger.error(`❌ Failed to save narrative to database`, error);
      throw error;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Export singleton instance
export const narrativeGenerator = new NarrativeGenerator();

// Export main function
export const generateNarrative = (story: ChessStory) => narrativeGenerator.generateNarrative(story); 
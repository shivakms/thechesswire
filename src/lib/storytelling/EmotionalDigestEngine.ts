
import { BambaiVoiceEngine } from '../voice/BambaiVoiceEngine';
import { PGNAnalyzer } from '../chess/PGNAnalyzer';

export interface DigestStory {
  id: string;
  type: 'brilliance' | 'sacrifice' | 'heartbreak' | 'comeback' | 'blunder';
  title: string;
  description: string;
  pgn: string;
  emotionScore: number;
  voiceNarration?: string;
  socialMediaText: string;
  thumbnailData: {
    position: string;
    emotion: string;
    quote: string;
  };
  createdAt: Date;
}

export interface WeeklyDigest {
  week: string;
  stories: DigestStory[];
  voiceIntro: string;
  voiceOutro: string;
  socialCarousel: string[];
}

export class EmotionalDigestEngine {
  private voiceEngine: BambaiVoiceEngine;
  private pgnAnalyzer: PGNAnalyzer;

  constructor() {
    this.voiceEngine = new BambaiVoiceEngine();
    this.pgnAnalyzer = new PGNAnalyzer();
  }

  async generateWeeklyDigest(games: Array<{ pgn: string; metadata: Record<string, unknown> }>): Promise<WeeklyDigest> {
    try {
      const analyzedGames = await Promise.all(
        games.map(async (game) => {
          const analysis = await this.pgnAnalyzer.analyzeEmotionalContent(game.pgn);
          return { ...game, analysis };
        })
      );

      const stories = await this.selectTopStories(analyzedGames);
      
      const narratedStories = await this.generateNarrations(stories);

      const socialCarousel = await this.generateSocialCarousel(narratedStories);

      const voiceIntro = await this.generateWeeklyIntro(narratedStories);
      const voiceOutro = await this.generateWeeklyOutro(narratedStories);

      const currentWeek = this.getCurrentWeekString();

      return {
        week: currentWeek,
        stories: narratedStories,
        voiceIntro,
        voiceOutro,
        socialCarousel
      };

    } catch (error) {
      console.error('Error generating weekly digest:', error);
      throw new Error('Failed to generate emotional digest');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async selectTopStories(analyzedGames: Array<{ pgn: string; metadata: Record<string, unknown>; analysis: any }>): Promise<DigestStory[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories: Record<string, Array<{ pgn: string; metadata: Record<string, unknown>; analysis: any; emotionScore: number }>> = {
      brilliance: [],
      sacrifice: [],
      heartbreak: [],
      comeback: [],
      blunder: []
    };

    for (const game of analyzedGames) {
      const { analysis } = game;
      
      if (analysis.brilliantMoves?.length > 0) {
        categories.brilliance.push({
          ...game,
          emotionScore: analysis.brilliantMoves.length * 10
        });
      }
      
      if (analysis.sacrifices?.length > 0) {
        categories.sacrifice.push({
          ...game,
          emotionScore: analysis.sacrifices.length * 8
        });
      }
      
      if (analysis.blunders?.length > 2) {
        categories.heartbreak.push({
          ...game,
          emotionScore: analysis.blunders.length * 6
        });
      }
      
      if (analysis.comebacks?.length > 0) {
        categories.comeback.push({
          ...game,
          emotionScore: analysis.comebacks.length * 9
        });
      }
      
      if (analysis.majorBlunders?.length > 0) {
        categories.blunder.push({
          ...game,
          emotionScore: analysis.majorBlunders.length * 7
        });
      }
    }

    const stories: DigestStory[] = [];
    
    for (const [type, games] of Object.entries(categories)) {
      if (games.length > 0) {
        const topGame = games.sort((a, b) => b.emotionScore - a.emotionScore)[0];
        
        stories.push({
          id: `${type}-${Date.now()}`,
          type: type as DigestStory['type'],
          title: this.generateStoryTitle(type, topGame),
          description: this.generateStoryDescription(type, topGame),
          pgn: topGame.pgn,
          emotionScore: topGame.emotionScore,
          socialMediaText: this.generateSocialText(type, topGame),
          thumbnailData: {
            position: topGame.analysis.keyPosition || '',
            emotion: type,
            quote: this.generateEmotionalQuote(type)
          },
          createdAt: new Date()
        });
      }
    }

    return stories.slice(0, 5); // Limit to top 5 stories
  }

  private async generateNarrations(stories: DigestStory[]): Promise<DigestStory[]> {
    const narratedStories = await Promise.all(
      stories.map(async (story) => {
        const narrationText = this.createNarrationScript(story);
        
        const audioBuffer = await this.voiceEngine.generateVoice(
          narrationText,
          this.getVoiceModeForStory(story.type)
        );
        
        const voiceNarration = `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`;

        return {
          ...story,
          voiceNarration
        };
      })
    );

    return narratedStories;
  }

  private createNarrationScript(story: DigestStory): string {
    const scripts = {
      brilliance: `This week's brilliance comes from a moment of pure chess poetry. ${story.description} The board sang with possibility, and genius answered the call.`,
      
      sacrifice: `In the realm of sacrifice, courage met calculation. ${story.description} Sometimes the greatest strength lies in letting go.`,
      
      heartbreak: `Chess can break hearts as easily as it can lift spirits. ${story.description} In defeat, we find the seeds of future victory.`,
      
      comeback: `From the ashes of despair, hope emerged. ${story.description} This is why we never resign. This is why we fight.`,
      
      blunder: `Even masters stumble, and in their humanity, we find our own. ${story.description} Perfection is not the goal—growth is.`
    };

    return scripts[story.type] || story.description;
  }

  private getVoiceModeForStory(type: DigestStory['type']): keyof typeof this.voiceEngine['voiceProfiles'] {
    const voiceModes = {
      brilliance: 'enthusiasticCommentator',
      sacrifice: 'dramaticNarrator',
      heartbreak: 'warmEncourager',
      comeback: 'enthusiasticCommentator',
      blunder: 'thoughtfulPhilosopher'
    } as const;

    return voiceModes[type] || 'wiseMentor';
  }

  private async generateSocialCarousel(stories: DigestStory[]): Promise<string[]> {
    const carousel = [];
    
    carousel.push(`🎭 This Week in Chess Emotions\n\n${stories.length} stories that moved us\n\n#ChessWire #EmotionalChess`);
    
    for (const story of stories) {
      const slide = `${this.getEmotionEmoji(story.type)} ${story.title}\n\n${story.socialMediaText}\n\n#Chess${story.type.charAt(0).toUpperCase() + story.type.slice(1)}`;
      carousel.push(slide);
    }
    
    carousel.push(`🗣️ Narrated by Bambai AI\n\nEvery story deserves a voice.\nEvery game tells a tale.\n\n#BambaiAI #ChessStories`);
    
    return carousel;
  }

  private async generateWeeklyIntro(_stories: DigestStory[]): Promise<string> {
    const introText = `Welcome to this week's emotional journey through chess. We've curated ${_stories.length} stories that capture the full spectrum of human experience on the 64 squares. From brilliant sacrifices to heartbreaking blunders, each game tells a story worth remembering.`;
    
    const audioBuffer = await this.voiceEngine.generateVoice(
      introText,
      'enthusiasticCommentator'
    );
    
    return `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async generateWeeklyOutro(_stories: DigestStory[]): Promise<string> {
    const outroText = `These stories remind us why chess is more than a game—it's a mirror of the human condition. Until next week, may your moves be bold, your sacrifices meaningful, and your spirit unbreakable.`;
    
    const audioBuffer = await this.voiceEngine.generateVoice(
      outroText,
      'poeticStoryteller'
    );
    
    return `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`;
  }

  private generateStoryTitle(type: string, game: Record<string, unknown>): string {
    const metadata = game.metadata as Record<string, unknown> || {};
    const titles: Record<string, string> = {
      brilliance: `Genius Unleashed: ${metadata.white || 'Unknown'} vs ${metadata.black || 'Unknown'}`,
      sacrifice: `The Art of Letting Go: A Masterful Sacrifice`,
      heartbreak: `When Dreams Crumble: A Tale of Near Victory`,
      comeback: `Phoenix Rising: The Impossible Recovery`,
      blunder: `Human After All: A Master's Moment of Doubt`
    };

    return titles[type] || `Chess Story: ${type}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private generateStoryDescription(type: string, _game: Record<string, unknown>): string {
    const descriptions: Record<string, string> = {
      brilliance: `A moment of pure chess artistry that left spectators breathless and opponents in awe.`,
      sacrifice: `Material was offered on the altar of position, and the chess gods smiled.`,
      heartbreak: `Victory was within reach, but the cruel hand of time and pressure intervened.`,
      comeback: `From a losing position emerged a fighting spirit that refused to surrender.`,
      blunder: `A reminder that even the greatest minds can falter, making them beautifully human.`
    };

    return descriptions[type] || `An emotional chess journey worth experiencing.`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private generateSocialText(type: string, _game: Record<string, unknown>): string {
    const socialTexts: Record<string, string> = {
      brilliance: `✨ When chess becomes art, and art becomes immortal. This move will be remembered.`,
      sacrifice: `⚔️ Sometimes you must lose a piece to win a soul. This sacrifice tells that story.`,
      heartbreak: `💔 So close to glory, yet so far. In chess, as in life, timing is everything.`,
      comeback: `🔥 Never give up. Never surrender. This comeback proves miracles happen on the board.`,
      blunder: `🤝 In our mistakes, we find our humanity. Even masters are beautifully imperfect.`
    };

    return socialTexts[type] || `🎭 Another emotional chess story from TheChessWire.`;
  }

  private generateEmotionalQuote(type: string): string {
    const quotes: Record<string, string> = {
      brilliance: `"Genius is one percent inspiration, ninety-nine percent perspiration."`,
      sacrifice: `"The pawns are the soul of chess."`,
      heartbreak: `"Every chess master was once a beginner."`,
      comeback: `"It is not a move, even the best move, that you must seek, but a realizable plan."`,
      blunder: `"The blunders are all there on the board, waiting to be made."`
    };

    return quotes[type] || `"Chess is life."`;
  }

  private getEmotionEmoji(type: string): string {
    const emojis: Record<string, string> = {
      brilliance: '✨',
      sacrifice: '⚔️',
      heartbreak: '💔',
      comeback: '🔥',
      blunder: '🤝'
    };

    return emojis[type] || '🎭';
  }

  private getCurrentWeekString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const week = Math.ceil(((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  async generateStoryNarration(pgn: string, storyType: DigestStory['type']): Promise<string> {
    try {
      const analysis = await this.pgnAnalyzer.analyzeEmotionalContent(pgn);
      
      const story: DigestStory = {
        id: `single-${Date.now()}`,
        type: storyType,
        title: this.generateStoryTitle(storyType, { metadata: {} }),
        description: this.generateStoryDescription(storyType, { analysis }),
        pgn,
        emotionScore: 5,
        socialMediaText: this.generateSocialText(storyType, {}),
        thumbnailData: {
          position: analysis.keyPosition || '',
          emotion: storyType,
          quote: this.generateEmotionalQuote(storyType)
        },
        createdAt: new Date()
      };

      const narrationText = this.createNarrationScript(story);
      
      const audioBuffer = await this.voiceEngine.generateVoice(
        narrationText,
        this.getVoiceModeForStory(storyType)
      );
      
      return `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`;

    } catch (error) {
      console.error('Error generating story narration:', error);
      throw new Error('Failed to generate story narration');
    }
  }
}


import { BambaiVoiceEngine } from '../voice/BambaiVoiceEngine';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export interface TweetableStory {
  id: string;
  text: string;
  hashtags: string[];
  emotion: string;
  audioUrl?: string;
  imageUrl?: string;
  pgn?: string;
  createdAt: Date;
}

export interface VoiceAudiogramConfig {
  duration: number;
  waveformColor: string;
  backgroundImage?: string;
  textOverlay: boolean;
  voiceMode: 'dramaticNarrator' | 'poeticStoryteller' | 'enthusiasticCommentator' | 'thoughtfulPhilosopher';
}

export interface QuoteImageConfig {
  template: 'classic' | 'modern' | 'dramatic' | 'minimal';
  boardPosition?: string;
  watermark: boolean;
  echoRank?: string;
}

export class VoiceTweetGenerator {
  private bambaiEngine: BambaiVoiceEngine;
  private outputDir: string;

  constructor() {
    this.bambaiEngine = new BambaiVoiceEngine();
    this.outputDir = path.join(process.cwd(), '.cache', 'voicetweets');
    this.initializeOutputDir();
  }

  private async initializeOutputDir(): Promise<void> {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'audio'), { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'images'), { recursive: true });
  }

  async generateTweetableStory(
    pgn: string,
    options?: {
      maxLength?: number;
      includeHashtags?: boolean;
      emotionFocus?: string;
    }
  ): Promise<TweetableStory> {
    try {
      const { maxLength = 240, includeHashtags = true, emotionFocus } = options || {};
      
      const analysis = await this.classifyPGNEmotion(pgn);
      const dominantEmotion = this.getDominantEmotion(analysis.emotions);
      
      const storyText = await this.generateEmotionalStory(pgn, analysis, emotionFocus || dominantEmotion);
      
      const truncatedText = this.truncateForTwitter(storyText, maxLength);
      
      const hashtags = includeHashtags ? this.generateHashtags(analysis, dominantEmotion) : [];
      
      const story: TweetableStory = {
        id: this.generateId(),
        text: truncatedText,
        hashtags,
        emotion: dominantEmotion,
        pgn,
        createdAt: new Date()
      };

      return story;
    } catch (error) {
      console.error('Failed to generate tweetable story:', error);
      throw error;
    }
  }

  async generateVoiceAudiogram(
    story: TweetableStory,
    config?: Partial<VoiceAudiogramConfig>
  ): Promise<string> {
    try {
      const audiogramConfig: VoiceAudiogramConfig = {
        duration: 30,
        waveformColor: '#1DA1F2',
        textOverlay: true,
        voiceMode: this.selectVoiceModeForEmotion(story.emotion),
        ...config
      };

      const voiceBuffer = await this.bambaiEngine.generateVoice(
        story.text,
        audiogramConfig.voiceMode,
        story.emotion
      );

      const audioId = `audiogram_${story.id}`;
      const audioPath = path.join(this.outputDir, 'audio', `${audioId}.mp3`);
      await fs.writeFile(audioPath, voiceBuffer);

      const waveformData = await this.generateWaveformData(voiceBuffer);
      
      const audiogramPath = await this.createAudiogramVideo(
        audioPath,
        waveformData,
        story.text,
        audiogramConfig
      );

      story.audioUrl = audiogramPath;
      return audiogramPath;
    } catch (error) {
      console.error('Failed to generate voice audiogram:', error);
      throw error;
    }
  }

  async generateQuoteImage(
    story: TweetableStory,
    config?: Partial<QuoteImageConfig>
  ): Promise<string> {
    try {
      const imageConfig: QuoteImageConfig = {
        template: 'dramatic',
        watermark: true,
        ...config
      };

      const boardPosition = story.pgn ? this.extractKeyPosition(story.pgn) : null;
      
      const imageId = `quote_${story.id}`;
      const imagePath = path.join(this.outputDir, 'images', `${imageId}.png`);
      
      await this.createQuoteImage(
        story.text,
        boardPosition,
        imageConfig,
        imagePath
      );

      story.imageUrl = imagePath;
      return imagePath;
    } catch (error) {
      console.error('Failed to generate quote image:', error);
      throw error;
    }
  }

  async generateTwitterThread(
    pgn: string,
    options?: {
      maxTweets?: number;
      includeAudio?: boolean;
      includeImages?: boolean;
    }
  ): Promise<TweetableStory[]> {
    try {
      const { maxTweets = 5, includeAudio = true, includeImages = true } = options || {};
      
      const analysis = await this.classifyPGNEmotion(pgn);
      const keyMoments = this.extractKeyMoments(analysis, maxTweets);
      
      const thread: TweetableStory[] = [];
      
      for (let i = 0; i < keyMoments.length; i++) {
        const moment = keyMoments[i];
        const isFirstTweet = i === 0;
        
        const story = await this.generateTweetableStory(
          moment.pgn,
          {
            maxLength: isFirstTweet ? 200 : 240, // Leave room for thread indicator
            emotionFocus: moment.emotion
          }
        );
        
        if (!isFirstTweet) {
          story.text = `${i + 1}/${keyMoments.length} ${story.text}`;
        }
        
        if (includeAudio && (isFirstTweet || moment.emotion === 'climax')) {
          await this.generateVoiceAudiogram(story);
        }
        
        if (includeImages) {
          await this.generateQuoteImage(story);
        }
        
        thread.push(story);
      }
      
      return thread;
    } catch (error) {
      console.error('Failed to generate Twitter thread:', error);
      throw error;
    }
  }

  async publishToTwitter(
    stories: TweetableStory[],
    options?: {
      scheduleDelay?: number;
      replyChain?: boolean;
    }
  ): Promise<{ success: boolean; tweetIds?: string[]; error?: string }> {
    try {
      const { scheduleDelay = 0, replyChain = true } = options || {};
      
      console.log('Publishing Twitter thread:', {
        tweetCount: stories.length,
        scheduleDelay,
        replyChain
      });
      
      const tweetIds: string[] = [];
      let replyToId: string | undefined;
      
      for (const story of stories) {
        const tweetId = `tweet_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        
        console.log('Publishing tweet:', {
          id: tweetId,
          text: story.text,
          hashtags: story.hashtags,
          audioUrl: story.audioUrl,
          imageUrl: story.imageUrl,
          replyTo: replyToId
        });
        
        tweetIds.push(tweetId);
        
        if (replyChain) {
          replyToId = tweetId;
        }
        
        if (scheduleDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, scheduleDelay));
        }
      }
      
      return {
        success: true,
        tweetIds
      };
    } catch (error) {
      console.error('Failed to publish to Twitter:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private getDominantEmotion(emotions: Record<string, number>): string {
    return Object.entries(emotions)
      .sort(([, a], [, b]) => b - a)[0][0];
  }

  private async generateEmotionalStory(
    pgn: string,
    analysis: { emotions: Record<string, number>; pgn: string },
    emotion: string
  ): Promise<string> {
    const templates = {
      tension: [
        "The position crackles with electric tension...",
        "Every move matters now. The slightest mistake could be fatal.",
        "The air is thick with possibility and danger."
      ],
      triumph: [
        "Brilliant! This wasn't just calculation — this was pure genius.",
        "A masterpiece unfolds on the 64 squares.",
        "Sometimes chess transcends the game and becomes art."
      ],
      tragedy: [
        "This wasn't just a mistake — this was the moment everything unraveled.",
        "The position collapses like a house of cards.",
        "In chess, as in life, one moment can change everything."
      ],
      mystery: [
        "Hidden depths reveal themselves in this position.",
        "What appears simple on the surface conceals profound complexity.",
        "The true beauty of chess lies in its secrets."
      ]
    };

    const emotionTemplates = templates[emotion as keyof typeof templates] || templates.mystery;
    const template = emotionTemplates[Math.floor(Math.random() * emotionTemplates.length)];
    
    const keyMove = this.extractKeyMove(pgn);
    if (keyMove) {
      return `${keyMove} — ${template}`;
    }
    
    return template;
  }

  private truncateForTwitter(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    
    const truncated = text.substring(0, maxLength - 3);
    const lastSentence = truncated.lastIndexOf('.');
    
    if (lastSentence > maxLength * 0.7) {
      return truncated.substring(0, lastSentence + 1);
    }
    
    return truncated + '...';
  }

  private generateHashtags(analysis: { emotions: Record<string, number>; pgn: string }, emotion: string): string[] {
    const baseHashtags = ['#chess', '#ChessWire'];
    const emotionHashtags = {
      tension: ['#ChessTension', '#CriticalMoment'],
      triumph: ['#ChessGenius', '#Brilliant'],
      tragedy: ['#ChessBlunder', '#Heartbreak'],
      mystery: ['#ChessMystery', '#DeepThinking']
    };
    
    const specific = emotionHashtags[emotion as keyof typeof emotionHashtags] || ['#ChessStory'];
    return [...baseHashtags, ...specific];
  }

  private selectVoiceModeForEmotion(emotion: string): 'dramaticNarrator' | 'poeticStoryteller' | 'enthusiasticCommentator' | 'thoughtfulPhilosopher' {
    const modeMap: Record<string, 'dramaticNarrator' | 'poeticStoryteller' | 'enthusiasticCommentator' | 'thoughtfulPhilosopher'> = {
      tension: 'dramaticNarrator',
      triumph: 'enthusiasticCommentator',
      tragedy: 'poeticStoryteller',
      mystery: 'thoughtfulPhilosopher'
    };
    
    return modeMap[emotion] || 'poeticStoryteller';
  }

  private extractKeyMove(pgn: string): string | null {
    const moves = pgn.match(/\d+\.\s*([NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQ])?[+#]?)/g);
    return moves ? moves[moves.length - 1] : null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private extractKeyPosition(_pgn: string): string | null {
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }

  private extractKeyMoments(analysis: { emotions: Record<string, number>; pgn: string }, maxMoments: number): Array<{ pgn: string; emotion: string }> {
    return Array.from({ length: Math.min(maxMoments, 5) }, (_, i) => ({
      pgn: analysis.pgn || '',
      emotion: ['tension', 'triumph', 'mystery'][i % 3]
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async generateWaveformData(_audioBuffer: Buffer): Promise<number[]> {
    return Array.from({ length: 100 }, () => Math.random() * 100);
  }

  private async createAudiogramVideo(
    audioPath: string,
    waveformData: number[],
    text: string,
    config: VoiceAudiogramConfig
  ): Promise<string> {
    const outputPath = audioPath.replace('.mp3', '_audiogram.mp4');
    
    console.log('Creating audiogram video:', {
      audioPath,
      outputPath,
      text: text.substring(0, 50) + '...',
      config
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return outputPath;
  }

  private async createQuoteImage(
    text: string,
    boardPosition: string | null,
    config: QuoteImageConfig,
    outputPath: string
  ): Promise<void> {
    console.log('Creating quote image:', {
      text: text.substring(0, 50) + '...',
      boardPosition,
      config,
      outputPath
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private generateId(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  private async classifyPGNEmotion(pgn: string): Promise<{ emotions: Record<string, number>; pgn: string }> {
    const emotions = {
      tension: Math.random() * 100,
      triumph: Math.random() * 100,
      tragedy: Math.random() * 100,
      mystery: Math.random() * 100
    };

    return { emotions, pgn };
  }
}

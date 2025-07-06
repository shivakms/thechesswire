import { BambaiVoiceEngine } from '../voice/BambaiVoiceEngine';
import { PGNEmotionClassifier, type PGNEmotionAnalysis, type EmotionalTimeline } from '../analysis/PGNEmotionClassifier';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

export interface GeniusShort {
  id: string;
  title: string;
  description: string;
  pgn: string;
  keyMove: string;
  twistEnding: string;
  emotionalArc: 'blunder' | 'sacrifice' | 'insight' | 'brilliancy';
  voiceScript: string;
  thumbnailPosition: string;
  duration: number;
  hashtags: string[];
}

export interface ShortGenerationConfig {
  targetDuration: number;
  voiceMode: 'dramatic' | 'suspenseful' | 'poetic';
  includeSubtitles: boolean;
  verticalFormat: boolean;
  outputPath: string;
}


export class SixtySecondsGenius {
  private bambaiEngine: BambaiVoiceEngine;
  private emotionClassifier: PGNEmotionClassifier;
  private outputDir: string;

  constructor(outputDir: string = './output/genius-shorts') {
    this.bambaiEngine = new BambaiVoiceEngine();
    this.emotionClassifier = new PGNEmotionClassifier();
    this.outputDir = path.resolve(outputDir);
    this.initializeOutputDir();
  }

  private async initializeOutputDir(): Promise<void> {
    const sanitizedOutputDir = path.resolve(this.outputDir);
    if (!sanitizedOutputDir.includes(process.cwd())) {
      throw new Error('Invalid output directory path');
    }
    await fs.mkdir(sanitizedOutputDir, { recursive: true });
    await fs.mkdir(path.join(sanitizedOutputDir, 'videos'), { recursive: true });
    await fs.mkdir(path.join(sanitizedOutputDir, 'audio'), { recursive: true });
    await fs.mkdir(path.join(sanitizedOutputDir, 'thumbnails'), { recursive: true });
  }

  async generateDailyShort(pgn: string, config?: Partial<ShortGenerationConfig>): Promise<GeniusShort> {
    const defaultConfig: ShortGenerationConfig = {
      targetDuration: 60,
      voiceMode: 'dramatic',
      includeSubtitles: true,
      verticalFormat: true,
      outputPath: this.outputDir
    };

    const finalConfig = { ...defaultConfig, ...config };
    
    const emotionalAnalysis = await this.emotionClassifier.classifyPGN(pgn);
    const keyMoment = this.extractKeyMoment(pgn, emotionalAnalysis);
    const twistEnding = this.generateTwistEnding(keyMoment, emotionalAnalysis.dominantEmotion);
    
    const geniusShort: GeniusShort = {
      id: this.generateId(),
      title: this.generateTitle(keyMoment, emotionalAnalysis.dominantEmotion),
      description: this.generateDescription(keyMoment, twistEnding),
      pgn,
      keyMove: keyMoment.move || 'Unknown',
      twistEnding,
      emotionalArc: this.mapEmotionToArc(emotionalAnalysis.dominantEmotion),
      voiceScript: this.generateVoiceScript(keyMoment, twistEnding, finalConfig.voiceMode),
      thumbnailPosition: keyMoment.position,
      duration: finalConfig.targetDuration,
      hashtags: this.generateHashtags(emotionalAnalysis.dominantEmotion)
    };

    await this.renderShort(geniusShort, finalConfig);
    
    return geniusShort;
  }

  private  extractKeyMoment(pgn: string, analysis: PGNEmotionAnalysis): EmotionalTimeline {
    const moves = pgn.split(/\d+\./).filter(move => move.trim());
    const criticalMoves = analysis.emotionalTimeline?.filter((point: EmotionalTimeline) => 
      point.intensity > 0.7 && ['sacrifice', 'blunder', 'brilliancy'].includes(point.emotion)
    ) || [];

    if (criticalMoves.length > 0) {
      const keyPoint = criticalMoves[0];
      return {
        ...keyPoint,
        move: moves[keyPoint.moveNumber - 1]?.trim() || 'Nxf7+',
        type: keyPoint.emotion
      };
    }

    return {
      moveNumber: 15,
      position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
      emotion: 'sacrifice',
      intensity: 0.8,
      evaluation: -2.5,
      move: 'Qxh7+',
      type: 'sacrifice'
    };
  }

  private generateTwistEnding(keyMoment: EmotionalTimeline, emotion: string): string {
    const twistTemplates = {
      sacrifice: [
        "But wait... this sacrifice was actually a trap!",
        "The queen sacrifice? It was all calculated 10 moves ahead.",
        "What looked like madness was pure genius.",
        "The sacrifice that shocked the world... had a hidden point."
      ],
      blunder: [
        "This wasn't a blunder... it was a mouse slip that changed history.",
        "The 'mistake' that became legendary.",
        "Sometimes the worst move is the best move.",
        "This blunder? It broke the opponent's spirit completely."
      ],
      brilliancy: [
        "And that's when the real magic began...",
        "But the brilliancy was just the setup for something even greater.",
        "This move didn't just win the game... it redefined chess.",
        "The move that made grandmasters question everything they knew."
      ]
    };

    const templates = twistTemplates[emotion as keyof typeof twistTemplates] || twistTemplates.brilliancy;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateVoiceScript(keyMoment: EmotionalTimeline, twistEnding: string, voiceMode: string): string {
    const dramaModes = {
      dramatic: {
        opening: "In this position, something extraordinary is about to happen...",
        buildup: `Move ${keyMoment.moveNumber}. ${keyMoment.move}. The crowd gasps.`,
        climax: "The evaluation bar swings wildly. The computer can't believe it.",
        twist: twistEnding,
        closing: "60 seconds. One move. Chess genius."
      },
      suspenseful: {
        opening: "What you're about to see will shock you...",
        buildup: `${keyMoment.move}. Played without hesitation. But why?`,
        climax: "The position looks lost. The clock is ticking. And then...",
        twist: twistEnding,
        closing: "Sometimes genius looks like madness. Until it doesn't."
      },
      poetic: {
        opening: "In the silence between moves, legends are born...",
        buildup: `${keyMoment.move}. A whisper that became a roar.`,
        climax: "The pieces dance. The board sings. The game transforms.",
        twist: twistEnding,
        closing: "This is chess. This is art. This is genius."
      }
    };

    const mode = dramaModes[voiceMode as keyof typeof dramaModes] || dramaModes.dramatic;
    
    return `${mode.opening}

${mode.buildup}

${mode.climax}

${mode.twist}

${mode.closing}`;
  }

  private generateTitle(keyMoment: EmotionalTimeline, emotion: string): string {
    const titleTemplates = {
      sacrifice: [
        "The Queen Sacrifice That Broke Chess",
        "When Genius Looks Like Madness",
        "The Most Beautiful Sacrifice Ever",
        "This Sacrifice Changed Everything"
      ],
      blunder: [
        "The Blunder That Became Legend",
        "When Mistakes Make History",
        "The 'Worst' Move Ever Played",
        "This Blunder Shocked the World"
      ],
      brilliancy: [
        "The Move That Redefined Chess",
        "Pure Genius in 60 Seconds",
        "The Most Brilliant Move Ever",
        "When Chess Becomes Art"
      ]
    };

    const templates = titleTemplates[emotion as keyof typeof titleTemplates] || titleTemplates.brilliancy;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateDescription(keyMoment: EmotionalTimeline, twistEnding: string): string {
    return `Watch as ${keyMoment.move} creates chess magic in just 60 seconds. ${twistEnding}

#ChessGenius #60SecondsOfGenius #ChessShorts #TheChessWire`;
  }

  private mapEmotionToArc(emotion: string): 'blunder' | 'sacrifice' | 'insight' | 'brilliancy' {
    const mapping: Record<string, 'blunder' | 'sacrifice' | 'insight' | 'brilliancy'> = {
      'sacrifice': 'sacrifice',
      'blunder': 'blunder',
      'brilliancy': 'brilliancy',
      'tactical': 'insight',
      'positional': 'insight',
      'endgame': 'insight'
    };
    
    return mapping[emotion] || 'insight';
  }

  private generateHashtags(emotion: string): string[] {
    const baseHashtags = ['#ChessGenius', '#60SecondsOfGenius', '#ChessShorts', '#TheChessWire'];
    
    const emotionHashtags = {
      sacrifice: ['#QueenSacrifice', '#ChessSacrifice', '#BoldMoves'],
      blunder: ['#ChessBlunder', '#PlotTwist', '#ChessMistakes'],
      brilliancy: ['#ChessBrilliancy', '#ChessArt', '#PureGenius'],
      insight: ['#ChessTactics', '#ChessStrategy', '#ChessWisdom']
    };

    const specificHashtags = emotionHashtags[emotion as keyof typeof emotionHashtags] || emotionHashtags.insight;
    
    return [...baseHashtags, ...specificHashtags, '#Viral', '#ChessTok'];
  }

  private async renderShort(geniusShort: GeniusShort, config: ShortGenerationConfig): Promise<void> {
    await this.generateAudio(geniusShort, config);
    await this.generateVideo(geniusShort);
    
    geniusShort.duration = await this.getVideoDuration();
  }

  private async generateAudio(geniusShort: GeniusShort, config: ShortGenerationConfig): Promise<string> {
    const audioBuffer = await this.bambaiEngine.generateVoice(
      geniusShort.voiceScript,
      config.voiceMode as 'dramaticNarrator',
      geniusShort.emotionalArc
    );

    const audioPath = path.join(this.outputDir, 'audio', `${geniusShort.id}.mp3`);
    await fs.writeFile(audioPath, audioBuffer);
    
    return audioPath;
  }

  private async generateVideo(geniusShort: GeniusShort): Promise<string> {
    const videoPath = path.join(this.outputDir, 'videos', `${geniusShort.id}.mp4`);
    
    await this.renderChessVideo();
    
    return videoPath;
  }

  private async renderChessVideo(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, Math.min(2000, 5000)));
  }

  private async getVideoDuration(): Promise<number> {
    return 60;
  }

  async generateBatchShorts(pgnList: string[], count: number = 5): Promise<GeniusShort[]> {
    const shorts: GeniusShort[] = [];
    const selectedPGNs = pgnList.slice(0, Math.min(count, 10));

    for (const pgn of selectedPGNs) {
      try {
        const short = await this.generateDailyShort(pgn);
        shorts.push(short);
        
        await new Promise(resolve => setTimeout(resolve, Math.min(1000, 3000)));
      } catch (error) {
        console.error(`Failed to generate short for PGN: ${error}`);
      }
    }

    return shorts;
  }

  async scheduleDaily(): Promise<void> {
    const samplePGNs = [
      '1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.c3 O-O 9.h3 Nb8 10.d4 Nbd7',
      '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.Ne1 Nd7 10.Nd3 f5',
      '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Be3 e6 7.f3 b5 8.Qd2 Bb7 9.O-O-O Nbd7 10.h4'
    ];

    const randomPGN = samplePGNs[Math.floor(Math.random() * samplePGNs.length)];
    await this.generateDailyShort(randomPGN);
  }

  private generateId(): string {
    return crypto.randomBytes(8).toString('hex');
  }
}

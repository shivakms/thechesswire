import { Chess } from 'chess.js';
import { PGNAnalysis } from './PGNAnalyzer';
import { BambaiVoiceEngine } from '../voice/BambaiVoiceEngine';

export interface ReplayState {
  currentMoveIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  position: string;
  annotations: Array<{
    moveNumber: number;
    text: string;
    voiceUrl?: string;
    timestamp: number;
  }>;
}

export interface ReplayConfig {
  autoPlay: boolean;
  showAnnotations: boolean;
  voiceNarration: boolean;
  cinematicMode: boolean;
  accessLevel: 'freemium' | 'premium';
}

export class ReplayEngine {
  private chess: Chess;
  private moves: any[];
  private analysis: PGNAnalysis | null;
  private voiceEngine: BambaiVoiceEngine;
  private state: ReplayState;
  private config: ReplayConfig;
  private playbackTimer: NodeJS.Timeout | null = null;

  constructor(pgn: string, analysis: PGNAnalysis | null = null, config: ReplayConfig) {
    this.chess = new Chess();
    this.analysis = analysis;
    this.voiceEngine = new BambaiVoiceEngine();
    this.config = config;
    
    this.chess.loadPgn(pgn);
    this.moves = this.chess.history({ verbose: true });
    this.chess.reset();

    this.state = {
      currentMoveIndex: -1,
      isPlaying: false,
      playbackSpeed: 1.0,
      position: this.chess.fen(),
      annotations: []
    };
  }

  async startReplay(): Promise<void> {
    if (this.config.accessLevel === 'freemium' && this.config.cinematicMode) {
      throw new Error('Cinematic replay mode requires premium access');
    }

    this.state.isPlaying = true;
    await this.playNextMove();
  }

  private async playNextMove(): Promise<void> {
    if (!this.state.isPlaying || this.state.currentMoveIndex >= this.moves.length - 1) {
      this.state.isPlaying = false;
      return;
    }

    this.state.currentMoveIndex++;
    const move = this.moves[this.state.currentMoveIndex];
    
    this.chess.move(move);
    this.state.position = this.chess.fen();

    if (this.config.voiceNarration && this.config.accessLevel === 'premium') {
      await this.generateMoveNarration(move, this.state.currentMoveIndex);
    }

    if (this.config.showAnnotations && this.analysis) {
      this.addMoveAnnotation(this.state.currentMoveIndex);
    }

    const delay = this.config.cinematicMode ? 
      this.calculateCinematicDelay(move) : 
      1000 / this.state.playbackSpeed;

    this.playbackTimer = setTimeout(() => {
      this.playNextMove();
    }, delay);
  }

  private calculateCinematicDelay(move: any): number {
    const baseDelay = 1000 / this.state.playbackSpeed;
    
    if (move.captured) return baseDelay * 1.5;
    if (move.flags.includes('c')) return baseDelay * 2;
    if (move.promotion) return baseDelay * 2;
    if (this.chess.inCheck()) return baseDelay * 1.3;
    
    return baseDelay;
  }

  private async generateMoveNarration(move: any, moveIndex: number): Promise<void> {
    if (!this.analysis || !this.analysis.moves[moveIndex]) return;

    const analysisMove = this.analysis.moves[moveIndex];
    let narrationText = `Move ${Math.ceil((moveIndex + 1) / 2)}: ${move.san}`;

    if (analysisMove.annotation) {
      narrationText += `. ${analysisMove.annotation}`;
    }

    if (analysisMove.isBrilliant) {
      narrationText += ' What a brilliant move!';
    } else if (analysisMove.isBlunder) {
      narrationText += ' Unfortunately, this appears to be a blunder.';
    }

    try {
      const emotion = this.analysis.analysis.emotionTimeline[moveIndex]?.emotion || 'neutral';
      const voiceMode = this.selectVoiceModeForEmotion(emotion);
      
      const audioBuffer = await this.voiceEngine.generateVoice(
        narrationText,
        voiceMode,
        emotion === 'dramatic' ? 'dramatic' : 'neutral'
      );

      const voiceUrl = `/api/voice/replay-${Date.now()}-${moveIndex}.mp3`;
      
      this.state.annotations.push({
        moveNumber: moveIndex,
        text: narrationText,
        voiceUrl,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Voice narration failed for move:', error);
    }
  }

  private selectVoiceModeForEmotion(emotion: string): keyof typeof this.voiceEngine['voiceProfiles'] {
    const emotionModeMap = {
      tension: 'dramaticNarrator' as const,
      triumph: 'enthusiasticCommentator' as const,
      tragedy: 'warmEncourager' as const,
      mystery: 'poeticStoryteller' as const,
      neutral: 'wiseMentor' as const
    };
    
    return emotionModeMap[emotion as keyof typeof emotionModeMap] || 'wiseMentor';
  }

  private addMoveAnnotation(moveIndex: number): void {
    if (!this.analysis || !this.analysis.moves[moveIndex]) return;

    const analysisMove = this.analysis.moves[moveIndex];
    if (analysisMove.annotation) {
      this.state.annotations.push({
        moveNumber: moveIndex,
        text: analysisMove.annotation,
        timestamp: Date.now()
      });
    }
  }

  goToMove(moveIndex: number): void {
    this.chess.reset();
    
    for (let i = 0; i <= moveIndex && i < this.moves.length; i++) {
      this.chess.move(this.moves[i]);
    }
    
    this.state.currentMoveIndex = moveIndex;
    this.state.position = this.chess.fen();
  }

  pause(): void {
    this.state.isPlaying = false;
    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer);
      this.playbackTimer = null;
    }
  }

  resume(): void {
    if (!this.state.isPlaying) {
      this.startReplay();
    }
  }

  setPlaybackSpeed(speed: number): void {
    this.state.playbackSpeed = Math.max(0.25, Math.min(3.0, speed));
  }

  getState(): ReplayState {
    return { ...this.state };
  }

  addUserAnnotation(moveIndex: number, annotation: string): void {
    this.state.annotations.push({
      moveNumber: moveIndex,
      text: `User note: ${annotation}`,
      timestamp: Date.now()
    });
  }

  exportSession(): any {
    return {
      moves: this.moves,
      analysis: this.analysis,
      state: this.state,
      config: this.config,
      timestamp: new Date().toISOString()
    };
  }
}

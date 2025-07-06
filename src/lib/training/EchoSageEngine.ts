export interface TrainingSession {
  id: string;
  userId: string;
  type: 'coach' | 'ghost' | 'analysis' | 'emotion';
  startTime: Date;
  endTime?: Date;
  moves: TrainingMove[];
  emotionalState: EmotionalProfile;
  performance: PerformanceMetrics;
  insights: string[];
}

export interface TrainingMove {
  move: string;
  san: string;
  fen: string;
  timestamp: Date;
  timeSpent: number;
  confidence: number;
  emotionalIntensity: number;
  coachFeedback?: string;
  alternativeSuggestions?: string[];
}

export interface EmotionalProfile {
  confidence: number;
  frustration: number;
  excitement: number;
  focus: number;
  pressure: number;
  flow: number;
  timestamp: Date;
}

export interface PerformanceMetrics {
  accuracy: number;
  speed: number;
  consistency: number;
  improvement: number;
  weaknesses: string[];
  strengths: string[];
}

export interface GhostOpponent {
  id: string;
  name: string;
  personality: 'aggressive' | 'defensive' | 'tactical' | 'positional' | 'creative';
  strength: number;
  emotionalTriggers: string[];
  playingStyle: PlayingStyle;
  memoryFragments: MemoryFragment[];
}

export interface PlayingStyle {
  openingPreference: string[];
  middlegameStyle: 'tactical' | 'positional' | 'dynamic';
  endgameStrength: number;
  timeManagement: 'blitz' | 'rapid' | 'classical';
  riskTolerance: number;
}

export interface MemoryFragment {
  id: string;
  position: string;
  context: string;
  emotion: string;
  significance: number;
  timestamp: Date;
}

export class EchoSageEngine {
  private currentSession: TrainingSession | null = null;
  private ghostOpponents: Map<string, GhostOpponent> = new Map();
  private emotionalHistory: EmotionalProfile[] = [];
  private isServerSide: boolean;

  constructor() {
    this.isServerSide = typeof window === 'undefined';
    this.initializeGhostOpponents();
  }

  async startTrainingSession(
    userId: string, 
    type: TrainingSession['type'],
    options?: { ghostOpponentId?: string; difficulty?: number }
  ): Promise<TrainingSession> {
    console.log('🧠 Starting EchoSage training session:', type);

    const session: TrainingSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      startTime: new Date(),
      moves: [],
      emotionalState: this.getBaselineEmotionalState(),
      performance: this.getBaselinePerformance(),
      insights: []
    };

    this.currentSession = session;

    if (type === 'ghost' && options?.ghostOpponentId) {
      const ghost = this.ghostOpponents.get(options.ghostOpponentId);
      if (ghost) {
        session.insights.push(`🎭 Facing ghost opponent: ${ghost.name} (${ghost.personality})`);
        session.insights.push(`💪 Strength level: ${ghost.strength}/100`);
      }
    }

    console.log('✅ Training session started:', session.id);
    return session;
  }

  async recordMove(
    move: string,
    san: string,
    fen: string,
    timeSpent: number,
    confidence: number
  ): Promise<{ feedback: string; emotionalUpdate: EmotionalProfile; suggestions: string[] }> {
    if (!this.currentSession) {
      throw new Error('No active training session');
    }

    const emotionalIntensity = this.calculateEmotionalIntensity(timeSpent, confidence);
    
    const trainingMove: TrainingMove = {
      move,
      san,
      fen,
      timestamp: new Date(),
      timeSpent,
      confidence,
      emotionalIntensity,
      alternativeSuggestions: []
    };

    const feedback = await this.generateCoachFeedback(trainingMove);
    const suggestions = await this.generateAlternativeSuggestions(trainingMove);
    const emotionalUpdate = await this.updateEmotionalState(trainingMove);

    trainingMove.coachFeedback = feedback;
    trainingMove.alternativeSuggestions = suggestions;

    this.currentSession.moves.push(trainingMove);
    this.currentSession.emotionalState = emotionalUpdate;

    console.log('📝 Move recorded:', san, 'Confidence:', confidence);
    return { feedback, emotionalUpdate, suggestions };
  }

  private async generateCoachFeedback(move: TrainingMove): Promise<string> {
    const feedbackTemplates = {
      high_confidence: [
        "🎯 Excellent! Your confidence in that move shows deep understanding.",
        "💪 Strong choice! You're developing great intuition.",
        "✨ Beautiful move! Your pattern recognition is improving."
      ],
      medium_confidence: [
        "🤔 Interesting choice. Let's explore why you felt uncertain.",
        "📚 Good move, but I sense some hesitation. Trust your instincts more.",
        "⚖️ Solid play. Consider what made you pause before moving."
      ],
      low_confidence: [
        "🧭 I can feel your uncertainty. Let's break down the position together.",
        "💭 When in doubt, look for forcing moves first.",
        "🔍 Take your time. What patterns do you recognize here?"
      ],
      slow_move: [
        "⏰ Deep thinking is good, but trust your first instincts sometimes.",
        "🧘 Excellent calculation time. Your patience will pay off.",
        "📖 Thorough analysis! Now let's work on faster pattern recognition."
      ],
      fast_move: [
        "⚡ Quick decision! Make sure you're not missing tactics.",
        "🏃 Good tempo, but double-check for blunders.",
        "💨 Fast play can be powerful when backed by solid fundamentals."
      ]
    };

    let category = 'medium_confidence';
    
    if (move.confidence > 0.8) category = 'high_confidence';
    else if (move.confidence < 0.4) category = 'low_confidence';
    
    if (move.timeSpent > 30000) category = 'slow_move';
    else if (move.timeSpent < 5000) category = 'fast_move';

    const templates = feedbackTemplates[category as keyof typeof feedbackTemplates];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private async generateAlternativeSuggestions(move: TrainingMove): Promise<string[]> {
    console.log(`Generating alternatives for move: ${move.move}`);
    const suggestions = [
      `Consider ${this.generateAlternativeMove()} for a more aggressive approach`,
      `${this.generateAlternativeMove()} might offer better piece coordination`,
      `Have you looked at ${this.generateAlternativeMove()}? It could improve your position`,
      `Alternative: ${this.generateAlternativeMove()} maintains better pawn structure`
    ];

    return suggestions.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  private generateAlternativeMove(): string {
    const pieces = ['N', 'B', 'R', 'Q', 'K'];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
    
    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    const file = files[Math.floor(Math.random() * files.length)];
    const rank = ranks[Math.floor(Math.random() * ranks.length)];
    
    return `${piece}${file}${rank}`;
  }

  private calculateEmotionalIntensity(timeSpent: number, confidence: number): number {
    const timeIntensity = Math.min(timeSpent / 60000, 1);
    const confidenceIntensity = 1 - confidence;
    return (timeIntensity + confidenceIntensity) / 2;
  }

  private async updateEmotionalState(move: TrainingMove): Promise<EmotionalProfile> {
    if (!this.currentSession) {
      return this.getBaselineEmotionalState();
    }

    const current = this.currentSession.emotionalState;
    const intensity = move.emotionalIntensity;
    
    const updated: EmotionalProfile = {
      confidence: this.adjustEmotion(current.confidence, move.confidence, 0.1),
      frustration: this.adjustEmotion(current.frustration, intensity, 0.05),
      excitement: this.adjustEmotion(current.excitement, move.confidence * 0.8, 0.1),
      focus: this.adjustEmotion(current.focus, 1 - (move.timeSpent / 60000), 0.05),
      pressure: this.adjustEmotion(current.pressure, intensity, 0.08),
      flow: this.calculateFlowState(current, move),
      timestamp: new Date()
    };

    this.emotionalHistory.push(updated);
    return updated;
  }

  private adjustEmotion(current: number, target: number, rate: number): number {
    const change = (target - current) * rate;
    return Math.max(0, Math.min(1, current + change));
  }

  private calculateFlowState(current: EmotionalProfile, move: TrainingMove): number {
    const confidenceFlow = move.confidence > 0.7 ? 0.1 : -0.05;
    const timeFlow = move.timeSpent < 15000 && move.timeSpent > 3000 ? 0.1 : -0.05;
    const consistencyFlow = this.calculateConsistency() > 0.8 ? 0.1 : 0;
    
    const flowChange = confidenceFlow + timeFlow + consistencyFlow;
    return Math.max(0, Math.min(1, current.flow + flowChange));
  }

  private calculateConsistency(): number {
    if (!this.currentSession || this.currentSession.moves.length < 3) {
      return 0.5;
    }

    const recentMoves = this.currentSession.moves.slice(-5);
    const avgConfidence = recentMoves.reduce((sum, m) => sum + m.confidence, 0) / recentMoves.length;
    const avgTime = recentMoves.reduce((sum, m) => sum + m.timeSpent, 0) / recentMoves.length;
    
    const confidenceVariance = recentMoves.reduce((sum, m) => sum + Math.pow(m.confidence - avgConfidence, 2), 0) / recentMoves.length;
    const timeVariance = recentMoves.reduce((sum, m) => sum + Math.pow(m.timeSpent - avgTime, 2), 0) / recentMoves.length;
    
    return Math.max(0, 1 - (confidenceVariance + timeVariance / 100000));
  }

  async createGhostOpponent(
    name: string,
    personality: GhostOpponent['personality'],
    strength: number,
    memoryContext?: string
  ): Promise<GhostOpponent> {
    console.log('👻 Creating ghost opponent:', name);

    const ghost: GhostOpponent = {
      id: `ghost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      personality,
      strength: Math.max(0, Math.min(100, strength)),
      emotionalTriggers: this.generateEmotionalTriggers(personality),
      playingStyle: this.generatePlayingStyle(personality, strength),
      memoryFragments: memoryContext ? await this.generateMemoryFragments(memoryContext) : []
    };

    this.ghostOpponents.set(ghost.id, ghost);
    console.log('✅ Ghost opponent created:', ghost.name);
    return ghost;
  }

  private generateEmotionalTriggers(personality: GhostOpponent['personality']): string[] {
    const triggerMap = {
      aggressive: ['time_pressure', 'material_loss', 'passive_play'],
      defensive: ['open_positions', 'tactical_complications', 'time_scramble'],
      tactical: ['quiet_positions', 'endgames', 'slow_maneuvering'],
      positional: ['sharp_tactics', 'sacrifices', 'unclear_positions'],
      creative: ['forced_sequences', 'theoretical_positions', 'repetitive_play']
    };

    return triggerMap[personality] || ['uncertainty', 'pressure', 'complexity'];
  }

  private generatePlayingStyle(personality: GhostOpponent['personality'], strength: number): PlayingStyle {
    const styleMap = {
      aggressive: {
        openingPreference: ['King\'s Indian Attack', 'Sicilian Dragon', 'King\'s Gambit'],
        middlegameStyle: 'tactical' as const,
        endgameStrength: Math.max(0.6, strength / 100 - 0.2),
        timeManagement: 'blitz' as const,
        riskTolerance: 0.8
      },
      defensive: {
        openingPreference: ['French Defense', 'Caro-Kann', 'Petrov Defense'],
        middlegameStyle: 'positional' as const,
        endgameStrength: Math.min(0.9, strength / 100 + 0.1),
        timeManagement: 'classical' as const,
        riskTolerance: 0.3
      },
      tactical: {
        openingPreference: ['Sicilian Najdorf', 'Queen\'s Gambit Declined', 'Nimzo-Indian'],
        middlegameStyle: 'tactical' as const,
        endgameStrength: strength / 100,
        timeManagement: 'rapid' as const,
        riskTolerance: 0.6
      },
      positional: {
        openingPreference: ['English Opening', 'Reti Opening', 'Queen\'s Pawn Game'],
        middlegameStyle: 'positional' as const,
        endgameStrength: Math.min(0.95, strength / 100 + 0.15),
        timeManagement: 'classical' as const,
        riskTolerance: 0.4
      },
      creative: {
        openingPreference: ['Bird\'s Opening', 'Larsen\'s Opening', 'Polish Opening'],
        middlegameStyle: 'dynamic' as const,
        endgameStrength: strength / 100,
        timeManagement: 'rapid' as const,
        riskTolerance: 0.7
      }
    };

    return styleMap[personality];
  }

  private async generateMemoryFragments(context: string): Promise<MemoryFragment[]> {
    const fragments: MemoryFragment[] = [];
    const fragmentCount = Math.floor(Math.random() * 5) + 3;

    for (let i = 0; i < fragmentCount; i++) {
      fragments.push({
        id: `memory_${Date.now()}_${i}`,
        position: this.generateRandomFEN(),
        context: `${context} - Fragment ${i + 1}`,
        emotion: this.getRandomEmotion(),
        significance: Math.random(),
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 30)
      });
    }

    return fragments;
  }

  private generateRandomFEN(): string {
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }

  private getRandomEmotion(): string {
    const emotions = ['triumph', 'frustration', 'surprise', 'determination', 'fear', 'excitement', 'calm', 'pressure'];
    return emotions[Math.floor(Math.random() * emotions.length)];
  }

  async endTrainingSession(): Promise<{ 
    summary: string; 
    performance: PerformanceMetrics; 
    insights: string[];
    emotionalJourney: EmotionalProfile[];
  }> {
    if (!this.currentSession) {
      throw new Error('No active training session');
    }

    this.currentSession.endTime = new Date();
    const duration = this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime();
    
    const performance = this.calculateFinalPerformance();
    const insights = await this.generateSessionInsights();
    const summary = this.generateSessionSummary(duration, performance);

    console.log('🏁 Training session completed:', this.currentSession.id);
    console.log('📊 Performance:', performance);

    const result = {
      summary,
      performance,
      insights,
      emotionalJourney: this.emotionalHistory.slice()
    };

    this.currentSession = null;
    this.emotionalHistory = [];

    return result;
  }

  private calculateFinalPerformance(): PerformanceMetrics {
    if (!this.currentSession) {
      return this.getBaselinePerformance();
    }

    const moves = this.currentSession.moves;
    if (moves.length === 0) {
      return this.getBaselinePerformance();
    }

    const avgConfidence = moves.reduce((sum, m) => sum + m.confidence, 0) / moves.length;
    const avgTime = moves.reduce((sum, m) => sum + m.timeSpent, 0) / moves.length;
    const consistency = this.calculateConsistency();

    return {
      accuracy: avgConfidence,
      speed: Math.max(0, 1 - (avgTime / 30000)),
      consistency,
      improvement: this.calculateImprovement(),
      weaknesses: this.identifyWeaknesses(),
      strengths: this.identifyStrengths()
    };
  }

  private calculateImprovement(): number {
    if (!this.currentSession || this.currentSession.moves.length < 5) {
      return 0;
    }

    const firstHalf = this.currentSession.moves.slice(0, Math.floor(this.currentSession.moves.length / 2));
    const secondHalf = this.currentSession.moves.slice(Math.floor(this.currentSession.moves.length / 2));

    const firstAvg = firstHalf.reduce((sum, m) => sum + m.confidence, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + m.confidence, 0) / secondHalf.length;

    return Math.max(0, secondAvg - firstAvg);
  }

  private identifyWeaknesses(): string[] {
    if (!this.currentSession) return [];

    const weaknesses: string[] = [];
    const moves = this.currentSession.moves;

    const lowConfidenceMoves = moves.filter(m => m.confidence < 0.4).length;
    const slowMoves = moves.filter(m => m.timeSpent > 45000).length;
    const inconsistentMoves = this.calculateConsistency() < 0.6;

    if (lowConfidenceMoves > moves.length * 0.3) {
      weaknesses.push('Decision confidence');
    }
    if (slowMoves > moves.length * 0.2) {
      weaknesses.push('Time management');
    }
    if (inconsistentMoves) {
      weaknesses.push('Consistency');
    }

    return weaknesses;
  }

  private identifyStrengths(): string[] {
    if (!this.currentSession) return [];

    const strengths: string[] = [];
    const moves = this.currentSession.moves;

    const highConfidenceMoves = moves.filter(m => m.confidence > 0.8).length;
    const fastMoves = moves.filter(m => m.timeSpent < 10000 && m.confidence > 0.6).length;
    const consistentPlay = this.calculateConsistency() > 0.8;

    if (highConfidenceMoves > moves.length * 0.4) {
      strengths.push('Strong intuition');
    }
    if (fastMoves > moves.length * 0.3) {
      strengths.push('Quick pattern recognition');
    }
    if (consistentPlay) {
      strengths.push('Consistent performance');
    }

    return strengths;
  }

  private async generateSessionInsights(): Promise<string[]> {
    if (!this.currentSession) return [];

    const insights: string[] = [...this.currentSession.insights];
    const performance = this.calculateFinalPerformance();
    const emotionalState = this.currentSession.emotionalState;

    if (performance.accuracy > 0.8) {
      insights.push('🎯 Excellent decision-making throughout the session!');
    }
    if (performance.consistency > 0.8) {
      insights.push('⚖️ Your play showed remarkable consistency.');
    }
    if (emotionalState.flow > 0.7) {
      insights.push('🌊 You achieved a strong flow state during training.');
    }
    if (performance.improvement > 0.1) {
      insights.push('📈 Clear improvement visible during the session!');
    }

    return insights;
  }

  private generateSessionSummary(duration: number, performance: PerformanceMetrics): string {
    const minutes = Math.floor(duration / 60000);
    const type = this.currentSession?.type || 'unknown';
    
    return `🧠 EchoSage ${type} session completed in ${minutes} minutes. ` +
           `Accuracy: ${Math.round(performance.accuracy * 100)}%, ` +
           `Speed: ${Math.round(performance.speed * 100)}%, ` +
           `Consistency: ${Math.round(performance.consistency * 100)}%.`;
  }

  private getBaselineEmotionalState(): EmotionalProfile {
    return {
      confidence: 0.5,
      frustration: 0.2,
      excitement: 0.4,
      focus: 0.6,
      pressure: 0.3,
      flow: 0.3,
      timestamp: new Date()
    };
  }

  private getBaselinePerformance(): PerformanceMetrics {
    return {
      accuracy: 0.5,
      speed: 0.5,
      consistency: 0.5,
      improvement: 0,
      weaknesses: [],
      strengths: []
    };
  }

  private initializeGhostOpponents(): void {
    const defaultGhosts = [
      { name: 'The Tactician', personality: 'tactical' as const, strength: 75 },
      { name: 'The Wall', personality: 'defensive' as const, strength: 80 },
      { name: 'The Berserker', personality: 'aggressive' as const, strength: 70 },
      { name: 'The Architect', personality: 'positional' as const, strength: 85 },
      { name: 'The Maverick', personality: 'creative' as const, strength: 65 }
    ];

    defaultGhosts.forEach(async ghost => {
      await this.createGhostOpponent(ghost.name, ghost.personality, ghost.strength);
    });
  }

  getAvailableGhosts(): GhostOpponent[] {
    return Array.from(this.ghostOpponents.values());
  }

  getEmotionalHistory(): EmotionalProfile[] {
    return this.emotionalHistory.slice();
  }

  getCurrentSession(): TrainingSession | null {
    return this.currentSession;
  }
}

export const echoSageEngine = new EchoSageEngine();

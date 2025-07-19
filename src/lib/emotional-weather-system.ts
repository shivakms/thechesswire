/**
 * Module 322: Emotional Chess Weather System
 * Implements emotion-based features and mood detection from play style
 */

export interface EmotionalState {
  mood: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'calm' | 'energetic';
  intensity: number; // 0-10
  confidence: number; // 0-1
  stress: number; // 0-10
  focus: number; // 0-10
  aggression: number; // 0-10
  creativity: number; // 0-10
}

export interface WeatherPattern {
  pattern: string;
  description: string;
  recommendations: string[];
  therapeuticInterventions: string[];
  moodMatchedOpponents: string[];
}

export interface EmotionalJourney {
  timestamp: Date;
  emotionalState: EmotionalState;
  gameId?: string;
  moveNumber?: number;
  trigger?: string;
}

export class EmotionalWeatherSystem {
  private emotionalHistory: EmotionalJourney[] = [];
  private currentState: EmotionalState = {
    mood: 'calm',
    intensity: 5,
    confidence: 0.7,
    stress: 3,
    focus: 7,
    aggression: 4,
    creativity: 6
  };

  /**
   * Analyze player's emotional state from game moves
   */
  analyzeEmotionalState(moves: string[], timeSpent: number[], blunders: number): EmotionalState {
    const moveCount = moves.length;
    const avgTimePerMove = timeSpent.reduce((a, b) => a + b, 0) / moveCount;
    const blunderRate = blunders / moveCount;

    // Analyze move patterns for emotional indicators
    const aggressiveMoves = this.countAggressiveMoves(moves);
    const defensiveMoves = this.countDefensiveMoves(moves);
    const creativeMoves = this.countCreativeMoves(moves);

    // Calculate emotional metrics
    const aggression = Math.min(10, (aggressiveMoves / moveCount) * 10);
    const stress = Math.min(10, (blunderRate * 10) + (avgTimePerMove > 30 ? 3 : 0));
    const focus = Math.max(0, 10 - stress - (blunderRate * 5));
    const creativity = Math.min(10, (creativeMoves / moveCount) * 10);
    const confidence = Math.max(0, 1 - (blunderRate * 2));

    // Determine mood based on emotional metrics
    let mood: EmotionalState['mood'] = 'calm';
    if (stress > 7) mood = 'stormy';
    else if (aggression > 7) mood = 'energetic';
    else if (focus < 3) mood = 'cloudy';
    else if (creativity > 7) mood = 'sunny';
    else mood = 'calm';

    const intensity = (aggression + stress + creativity) / 3;

    const emotionalState: EmotionalState = {
      mood,
      intensity,
      confidence,
      stress,
      focus,
      aggression,
      creativity
    };

    this.currentState = emotionalState;
    this.recordEmotionalJourney(emotionalState);

    return emotionalState;
  }

  /**
   * Generate weather metaphor overlay
   */
  generateWeatherPattern(emotionalState: EmotionalState): WeatherPattern {
    const patterns = {
      sunny: {
        pattern: '☀️ Sunny with High Creativity',
        description: 'You\'re in a creative flow state with high confidence and positive energy.',
        recommendations: [
          'Explore complex tactical positions',
          'Try unconventional openings',
          'Experiment with new strategies',
          'Share your creative ideas with the community'
        ],
        therapeuticInterventions: [
          'Practice mindfulness to maintain focus',
          'Document your creative insights',
          'Engage in artistic chess visualization'
        ],
        moodMatchedOpponents: ['Creative players', 'Tactical masters', 'Unconventional thinkers']
      },
      cloudy: {
        pattern: '☁️ Cloudy with Low Focus',
        description: 'Your focus is scattered and you might be feeling overwhelmed.',
        recommendations: [
          'Take short breaks between games',
          'Practice simple tactical puzzles',
          'Focus on basic positional principles',
          'Avoid complex openings'
        ],
        therapeuticInterventions: [
          'Deep breathing exercises',
          'Progressive muscle relaxation',
          'Short meditation sessions'
        ],
        moodMatchedOpponents: ['Patient positional players', 'Solid defensive players']
      },
      rainy: {
        pattern: '🌧️ Rainy with High Stress',
        description: 'You\'re experiencing stress and pressure, affecting your decision-making.',
        recommendations: [
          'Practice stress management techniques',
          'Play shorter time controls',
          'Focus on simple, solid moves',
          'Take longer breaks between games'
        ],
        therapeuticInterventions: [
          'Box breathing technique',
          'Physical exercise before playing',
          'Positive self-talk and affirmations'
        ],
        moodMatchedOpponents: ['Calm, steady players', 'Patient opponents']
      },
      stormy: {
        pattern: '⛈️ Stormy with High Intensity',
        description: 'High emotional intensity with potential for both brilliance and mistakes.',
        recommendations: [
          'Channel your energy into aggressive play',
          'Use your intensity for tactical calculations',
          'Be aware of time management',
          'Stay focused on the board'
        ],
        therapeuticInterventions: [
          'Energy release through physical activity',
          'Emotional regulation techniques',
          'Mindful awareness of intensity'
        ],
        moodMatchedOpponents: ['Aggressive players', 'Tactical fighters']
      },
      calm: {
        pattern: '🌤️ Calm and Balanced',
        description: 'You\'re in a balanced emotional state with good focus and control.',
        recommendations: [
          'Play your natural style',
          'Focus on positional understanding',
          'Maintain consistent play',
          'Enjoy the learning process'
        ],
        therapeuticInterventions: [
          'Maintain this balanced state',
          'Regular chess practice',
          'Healthy lifestyle habits'
        ],
        moodMatchedOpponents: ['Balanced players', 'Positional masters']
      },
      energetic: {
        pattern: '⚡ Energetic and Dynamic',
        description: 'High energy and aggression, perfect for dynamic play.',
        recommendations: [
          'Play sharp, tactical positions',
          'Use your energy for quick calculations',
          'Choose dynamic openings',
          'Maintain momentum'
        ],
        therapeuticInterventions: [
          'Channel energy into focused play',
          'Regular physical exercise',
          'Energy management techniques'
        ],
        moodMatchedOpponents: ['Dynamic players', 'Sharp tacticians']
      }
    };

    return patterns[emotionalState.mood];
  }

  /**
   * Get mood-based recommendations
   */
  getMoodBasedRecommendations(emotionalState: EmotionalState): string[] {
    const weatherPattern = this.generateWeatherPattern(emotionalState);
    return weatherPattern.recommendations;
  }

  /**
   * Get therapeutic interventions
   */
  getTherapeuticInterventions(emotionalState: EmotionalState): string[] {
    const weatherPattern = this.generateWeatherPattern(emotionalState);
    return weatherPattern.therapeuticInterventions;
  }

  /**
   * Find mood-matched opponents
   */
  getMoodMatchedOpponents(emotionalState: EmotionalState): string[] {
    const weatherPattern = this.generateWeatherPattern(emotionalState);
    return weatherPattern.moodMatchedOpponents;
  }

  /**
   * Track emotional journey
   */
  recordEmotionalJourney(emotionalState: EmotionalState, gameId?: string, moveNumber?: number, trigger?: string) {
    const journey: EmotionalJourney = {
      timestamp: new Date(),
      emotionalState,
      gameId,
      moveNumber,
      trigger
    };

    this.emotionalHistory.push(journey);

    // Keep only last 100 entries
    if (this.emotionalHistory.length > 100) {
      this.emotionalHistory = this.emotionalHistory.slice(-100);
    }
  }

  /**
   * Get emotional journey history
   */
  getEmotionalJourney(): EmotionalJourney[] {
    return this.emotionalHistory;
  }

  /**
   * Analyze emotional trends over time
   */
  analyzeEmotionalTrends(): {
    averageMood: string;
    moodStability: number;
    stressTrend: 'increasing' | 'decreasing' | 'stable';
    confidenceTrend: 'increasing' | 'decreasing' | 'stable';
  } {
    if (this.emotionalHistory.length < 2) {
      return {
        averageMood: this.currentState.mood,
        moodStability: 1,
        stressTrend: 'stable',
        confidenceTrend: 'stable'
      };
    }

    const recentStates = this.emotionalHistory.slice(-10);
    const moods = recentStates.map(j => j.emotionalState.mood);
    const stresses = recentStates.map(j => j.emotionalState.stress);
    const confidences = recentStates.map(j => j.emotionalState.confidence);

    // Calculate average mood
    const moodCounts = moods.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageMood = Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0]] > moodCounts[b[0]] ? a : b
    )[0];

    // Calculate mood stability
    const moodStability = 1 - (new Set(moods).size / moods.length);

    // Calculate trends
    const stressTrend = this.calculateTrend(stresses);
    const confidenceTrend = this.calculateTrend(confidences);

    return {
      averageMood,
      moodStability,
      stressTrend,
      confidenceTrend
    };
  }

  /**
   * Get mental health resources
   */
  getMentalHealthResources(emotionalState: EmotionalState): {
    immediate: string[];
    longTerm: string[];
    professional: string[];
  } {
    const resources = {
      immediate: [
        'Take a 5-minute break',
        'Practice deep breathing',
        'Drink water and stretch',
        'Step away from the screen'
      ],
      longTerm: [
        'Regular exercise routine',
        'Consistent sleep schedule',
        'Mindfulness meditation',
        'Social chess activities'
      ],
      professional: [
        'Chess psychology consultation',
        'Sports psychology services',
        'Mental health counseling',
        'Performance coaching'
      ]
    };

    // Add specific resources based on emotional state
    if (emotionalState.stress > 7) {
      resources.immediate.push('Progressive muscle relaxation');
      resources.longTerm.push('Stress management techniques');
    }

    if (emotionalState.confidence < 0.3) {
      resources.immediate.push('Positive self-talk');
      resources.longTerm.push('Confidence building exercises');
    }

    return resources;
  }

  // Helper methods
  private countAggressiveMoves(moves: string[]): number {
    const aggressivePatterns = ['!', '!!', 'Nxf', 'Bxf', 'Rxf', 'Qxf', 'Kxf'];
    return moves.filter(move => 
      aggressivePatterns.some(pattern => move.includes(pattern))
    ).length;
  }

  private countDefensiveMoves(moves: string[]): number {
    const defensivePatterns = ['O-O', 'O-O-O', 'h3', 'g3', 'a3', 'b3'];
    return moves.filter(move => 
      defensivePatterns.some(pattern => move.includes(pattern))
    ).length;
  }

  private countCreativeMoves(moves: string[]): number {
    const creativePatterns = ['!', '!!', 'N', 'B', 'Q'];
    return moves.filter(move => 
      creativePatterns.some(pattern => move.includes(pattern))
    ).length;
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (Math.abs(difference) < 0.5) return 'stable';
    return difference > 0 ? 'increasing' : 'decreasing';
  }
}

// Export singleton instance
export const emotionalWeatherSystem = new EmotionalWeatherSystem(); 
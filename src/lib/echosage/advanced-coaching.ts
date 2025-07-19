import { Pool } from 'pg';
import { Chess } from 'chess.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface AICoach {
  id: string;
  userId: string;
  personality: CoachPersonality;
  expertise: string[];
  communicationStyle: string;
  teachingMethod: string;
  motivationalStyle: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CoachPersonality {
  type: 'analytical' | 'intuitive' | 'aggressive' | 'defensive' | 'creative' | 'systematic';
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  motivationalQuotes: string[];
}

export interface TrainingSession {
  id: string;
  userId: string;
  coachId: string;
  sessionType: SessionType;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
  focus: string[];
  exercises: Exercise[];
  progress: number; // 0-100
  feedback: Feedback[];
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface SessionType {
  type: 'opening' | 'middlegame' | 'endgame' | 'tactics' | 'strategy' | 'psychology' | 'time_management';
  subtype: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
}

export interface Exercise {
  id: string;
  type: 'puzzle' | 'analysis' | 'simulation' | 'drill' | 'game' | 'review';
  title: string;
  description: string;
  position: string; // FEN
  moves: string[];
  solution: string[];
  hints: string[];
  difficulty: number; // 1-10
  timeLimit: number; // seconds
  points: number;
  completed: boolean;
  userAnswer?: string;
  correct: boolean;
  timeSpent: number;
  attempts: number;
}

export interface Feedback {
  id: string;
  type: 'positive' | 'constructive' | 'critical' | 'motivational';
  message: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
  actionItems: string[];
  timestamp: Date;
}

export interface PsychologicalProfile {
  id: string;
  userId: string;
  playingStyle: string;
  decisionMaking: string;
  timeManagement: string;
  stressResponse: string;
  confidence: number; // 0-100
  focus: number; // 0-100
  patience: number; // 0-100
  aggression: number; // 0-100
  adaptability: number; // 0-100
  analysis: string;
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

class AdvancedEchoSageCoaching {
  private coachPersonalities: { [key: string]: CoachPersonality } = {
    analytical: {
      type: 'analytical',
      traits: ['logical', 'systematic', 'detail-oriented', 'patient'],
      strengths: ['deep analysis', 'positional understanding', 'endgame technique'],
      weaknesses: ['over-analysis', 'time trouble', 'lack of intuition'],
      motivationalQuotes: [
        'Every position has a logical solution.',
        'Analysis is the key to improvement.',
        'Understanding precedes mastery.'
      ]
    },
    intuitive: {
      type: 'intuitive',
      traits: ['creative', 'instinctive', 'dynamic', 'imaginative'],
      strengths: ['tactical vision', 'creative play', 'dynamic positions'],
      weaknesses: ['inconsistent', 'lack of patience', 'positional weaknesses'],
      motivationalQuotes: [
        'Trust your instincts, but verify with calculation.',
        'Creativity is your greatest weapon.',
        'Let your imagination guide you.'
      ]
    },
    aggressive: {
      type: 'aggressive',
      traits: ['bold', 'confident', 'direct', 'energetic'],
      strengths: ['attacking play', 'initiative', 'psychological pressure'],
      weaknesses: ['over-extension', 'tactical oversights', 'defensive weaknesses'],
      motivationalQuotes: [
        'Attack is the best form of defense.',
        'Seize the initiative and never let go.',
        'Your opponent should fear your moves.'
      ]
    },
    defensive: {
      type: 'defensive',
      traits: ['cautious', 'solid', 'patient', 'resilient'],
      strengths: ['defensive technique', 'endgame skill', 'positional solidity'],
      weaknesses: ['lack of initiative', 'passive play', 'missed opportunities'],
      motivationalQuotes: [
        'Solid defense wins championships.',
        'Patience is a virtue in chess.',
        'A strong defense creates counter-attacking chances.'
      ]
    },
    creative: {
      type: 'creative',
      traits: ['innovative', 'artistic', 'unconventional', 'expressive'],
      strengths: ['original ideas', 'beautiful combinations', 'artistic play'],
      weaknesses: ['practicality', 'consistency', 'theoretical knowledge'],
      motivationalQuotes: [
        'Chess is art, and you are the artist.',
        'Create beauty on the board.',
        'Innovation is the path to greatness.'
      ]
    },
    systematic: {
      type: 'systematic',
      traits: ['organized', 'methodical', 'thorough', 'reliable'],
      strengths: ['opening preparation', 'systematic approach', 'reliable technique'],
      weaknesses: ['lack of creativity', 'rigidity', 'predictability'],
      motivationalQuotes: [
        'Systematic improvement leads to mastery.',
        'Method is the key to success.',
        'Consistency is the foundation of excellence.'
      ]
    }
  };

  async createAICoach(userId: string, personalityType: string): Promise<string> {
    try {
      const personality = this.coachPersonalities[personalityType];
      if (!personality) {
        throw new Error('Invalid personality type');
      }

      const coachId = crypto.randomUUID();
      
      await pool.query(
        `INSERT INTO ai_coaches 
         (id, user_id, personality, expertise, communication_style, teaching_method, motivational_style, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          coachId,
          userId,
          JSON.stringify(personality),
          JSON.stringify(this.getExpertiseForPersonality(personalityType)),
          this.getCommunicationStyle(personalityType),
          this.getTeachingMethod(personalityType),
          this.getMotivationalStyle(personalityType)
        ]
      );

      return coachId;
    } catch (error) {
      console.error('Failed to create AI coach:', error);
      throw error;
    }
  }

  private getExpertiseForPersonality(personalityType: string): string[] {
    const expertiseMap: { [key: string]: string[] } = {
      analytical: ['endgames', 'positional play', 'opening theory', 'calculation'],
      intuitive: ['tactics', 'dynamic play', 'creative combinations', 'intuition'],
      aggressive: ['attacking play', 'initiative', 'psychological warfare', 'tactics'],
      defensive: ['defensive technique', 'endgames', 'positional defense', 'counter-attack'],
      creative: ['artistic combinations', 'original ideas', 'beautiful play', 'innovation'],
      systematic: ['opening preparation', 'methodical play', 'theory', 'consistency']
    };

    return expertiseMap[personalityType] || ['general chess'];
  }

  private getCommunicationStyle(personalityType: string): string {
    const styles: { [key: string]: string } = {
      analytical: 'Detailed explanations with logical reasoning',
      intuitive: 'Creative insights with imaginative descriptions',
      aggressive: 'Direct and confident with bold statements',
      defensive: 'Cautious and thorough with careful analysis',
      creative: 'Artistic and expressive with colorful language',
      systematic: 'Organized and methodical with clear structure'
    };

    return styles[personalityType] || 'Balanced and clear';
  }

  private getTeachingMethod(personalityType: string): string {
    const methods: { [key: string]: string } = {
      analytical: 'Step-by-step analysis with detailed explanations',
      intuitive: 'Pattern recognition with creative exercises',
      aggressive: 'Active learning with challenging positions',
      defensive: 'Patient guidance with solid foundations',
      creative: 'Inspirational teaching with artistic examples',
      systematic: 'Structured learning with progressive difficulty'
    };

    return methods[personalityType] || 'Adaptive teaching';
  }

  private getMotivationalStyle(personalityType: string): string {
    const styles: { [key: string]: string } = {
      analytical: 'Intellectual challenge and logical achievement',
      intuitive: 'Creative expression and artistic fulfillment',
      aggressive: 'Competitive drive and victory celebration',
      defensive: 'Steady progress and reliable improvement',
      creative: 'Artistic inspiration and innovative thinking',
      systematic: 'Methodical advancement and systematic mastery'
    };

    return styles[personalityType] || 'Balanced motivation';
  }

  async createTrainingSession(
    userId: string,
    sessionType: SessionType,
    difficulty: string,
    focus: string[]
  ): Promise<string> {
    try {
      const sessionId = crypto.randomUUID();
      const coach = await this.getUserCoach(userId);
      
      if (!coach) {
        throw new Error('No AI coach found for user');
      }

      const exercises = await this.generateExercises(sessionType, difficulty, focus);
      
      await pool.query(
        `INSERT INTO training_sessions 
         (id, user_id, coach_id, session_type, difficulty, focus, exercises, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          sessionId,
          userId,
          coach.id,
          JSON.stringify(sessionType),
          difficulty,
          JSON.stringify(focus),
          JSON.stringify(exercises)
        ]
      );

      return sessionId;
    } catch (error) {
      console.error('Failed to create training session:', error);
      throw error;
    }
  }

  private async generateExercises(
    sessionType: SessionType,
    difficulty: string,
    focus: string[]
  ): Promise<Exercise[]> {
    const exercises: Exercise[] = [];
    
    // Generate exercises based on session type and focus
    for (let i = 0; i < 5; i++) {
      const exercise = await this.createExercise(sessionType, difficulty, focus[i % focus.length]);
      exercises.push(exercise);
    }

    return exercises;
  }

  private async createExercise(
    sessionType: SessionType,
    difficulty: string,
    focus: string
  ): Promise<Exercise> {
    const exerciseId = crypto.randomUUID();
    
    // This would integrate with a puzzle database or engine
    const exercise: Exercise = {
      id: exerciseId,
      type: this.getExerciseType(sessionType.type),
      title: `${focus} ${sessionType.type} exercise`,
      description: `Practice ${focus} in ${sessionType.type} positions`,
      position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Starting position
      moves: [],
      solution: ['e4', 'e5', 'Nf3'],
      hints: ['Look for tactical opportunities', 'Consider piece coordination'],
      difficulty: this.getDifficultyLevel(difficulty),
      timeLimit: 300, // 5 minutes
      points: 100,
      completed: false,
      correct: false,
      timeSpent: 0,
      attempts: 0
    };

    return exercise;
  }

  private getExerciseType(sessionType: string): Exercise['type'] {
    const typeMap: { [key: string]: Exercise['type'] } = {
      opening: 'analysis',
      middlegame: 'puzzle',
      endgame: 'drill',
      tactics: 'puzzle',
      strategy: 'analysis',
      psychology: 'simulation',
      time_management: 'game'
    };

    return typeMap[sessionType] || 'puzzle';
  }

  private getDifficultyLevel(difficulty: string): number {
    const levels: { [key: string]: number } = {
      beginner: 3,
      intermediate: 6,
      advanced: 8,
      master: 10
    };

    return levels[difficulty] || 5;
  }

  async submitExerciseAnswer(
    sessionId: string,
    exerciseId: string,
    answer: string,
    timeSpent: number
  ): Promise<Feedback> {
    try {
      const session = await this.getTrainingSession(sessionId);
      
      if (!session) {
        throw new Error('Training session not found');
      }
      
      const exercise = session.exercises.find(e => e.id === exerciseId);
      
      if (!exercise) {
        throw new Error('Exercise not found');
      }

      const isCorrect = this.checkAnswer(answer, exercise.solution);
      const feedback = await this.generateFeedback(exercise, isCorrect, timeSpent);

      // Update exercise
      await pool.query(
        `UPDATE training_sessions 
         SET exercises = jsonb_set(
           exercises, 
           '{${session.exercises.findIndex(e => e.id === exerciseId)}}',
           '{"completed": true, "userAnswer": $1, "correct": $2, "timeSpent": $3, "attempts": attempts + 1}'::jsonb
         )
         WHERE id = $4`,
        [answer, isCorrect, timeSpent, sessionId]
      );

      // Add feedback
      await pool.query(
        `UPDATE training_sessions 
         SET feedback = COALESCE(feedback, '[]'::jsonb) || $1::jsonb
         WHERE id = $2`,
        [JSON.stringify([feedback]), sessionId]
      );

      return feedback;
    } catch (error) {
      console.error('Failed to submit exercise answer:', error);
      throw error;
    }
  }

  private checkAnswer(answer: string, solution: string[]): boolean {
    // Simplified answer checking
    return answer.toLowerCase() === solution[0].toLowerCase();
  }

  private async generateFeedback(
    exercise: Exercise,
    isCorrect: boolean,
    timeSpent: number
  ): Promise<Feedback> {
    const feedbackId = crypto.randomUUID();
    
    let feedback: Feedback;
    
    if (isCorrect) {
      feedback = {
        id: feedbackId,
        type: 'positive',
        message: 'Excellent! You found the correct solution.',
        category: exercise.type,
        severity: 'low',
        actionable: false,
        actionItems: [],
        timestamp: new Date()
      };
    } else {
      feedback = {
        id: feedbackId,
        type: 'constructive',
        message: 'Good attempt, but there was a better move. Let me explain why.',
        category: exercise.type,
        severity: 'medium',
        actionable: true,
        actionItems: [
          'Review the position more carefully',
          'Look for tactical opportunities',
          'Consider piece coordination'
        ],
        timestamp: new Date()
      };
    }

    return feedback;
  }

  async createPsychologicalProfile(userId: string): Promise<string> {
    try {
      const profileId = crypto.randomUUID();
      
      // Analyze user's games to determine psychological profile
      const analysis = await this.analyzeUserPsychology(userId);
      
      await pool.query(
        `INSERT INTO psychological_profiles 
         (id, user_id, playing_style, decision_making, time_management, stress_response, 
          confidence, focus, patience, aggression, adaptability, analysis, recommendations, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())`,
        [
          profileId,
          userId,
          analysis.playingStyle,
          analysis.decisionMaking,
          analysis.timeManagement,
          analysis.stressResponse,
          analysis.confidence,
          analysis.focus,
          analysis.patience,
          analysis.aggression,
          analysis.adaptability,
          analysis.analysis,
          JSON.stringify(analysis.recommendations)
        ]
      );

      return profileId;
    } catch (error) {
      console.error('Failed to create psychological profile:', error);
      throw error;
    }
  }

  private async analyzeUserPsychology(userId: string): Promise<any> {
    // This would analyze user's games to determine psychological traits
    // For now, return mock analysis
    return {
      playingStyle: 'Dynamic and aggressive',
      decisionMaking: 'Intuitive with calculation',
      timeManagement: 'Efficient under pressure',
      stressResponse: 'Maintains focus in critical positions',
      confidence: 75,
      focus: 80,
      patience: 60,
      aggression: 85,
      adaptability: 70,
      analysis: 'You show strong tactical vision and aggressive play, but could improve positional understanding.',
      recommendations: [
        'Practice positional play',
        'Work on endgame technique',
        'Improve opening preparation'
      ]
    };
  }

  async getUserCoach(userId: string): Promise<AICoach | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM ai_coaches WHERE user_id = $1 AND is_active = TRUE',
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        personality: JSON.parse(row.personality),
        expertise: JSON.parse(row.expertise),
        communicationStyle: row.communication_style,
        teachingMethod: row.teaching_method,
        motivationalStyle: row.motivational_style,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error('Failed to get user coach:', error);
      return null;
    }
  }

  async getTrainingSession(sessionId: string): Promise<TrainingSession | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM training_sessions WHERE id = $1',
        [sessionId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        coachId: row.coach_id,
        sessionType: JSON.parse(row.session_type),
        duration: row.duration,
        difficulty: row.difficulty,
        focus: JSON.parse(row.focus),
        exercises: JSON.parse(row.exercises),
        progress: row.progress,
        feedback: JSON.parse(row.feedback || '[]'),
        completed: row.completed,
        createdAt: row.created_at,
        completedAt: row.completed_at
      };
    } catch (error) {
      console.error('Failed to get training session:', error);
      return null;
    }
  }

  async getPsychologicalProfile(userId: string): Promise<PsychologicalProfile | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM psychological_profiles WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        playingStyle: row.playing_style,
        decisionMaking: row.decision_making,
        timeManagement: row.time_management,
        stressResponse: row.stress_response,
        confidence: row.confidence,
        focus: row.focus,
        patience: row.patience,
        aggression: row.aggression,
        adaptability: row.adaptability,
        analysis: row.analysis,
        recommendations: JSON.parse(row.recommendations),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error('Failed to get psychological profile:', error);
      return null;
    }
  }
}

// Singleton instance
const advancedEchoSageCoaching = new AdvancedEchoSageCoaching();

export { advancedEchoSageCoaching, AdvancedEchoSageCoaching }; 
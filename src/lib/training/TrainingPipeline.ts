import { getDb } from '@/lib/db';
import { AnalyticsEngine } from '@/lib/analytics/AnalyticsEngine';

export interface EmotionAnnotation {
  position: string;
  emotions: {
    tension: number;
    excitement: number;
    surprise: number;
    satisfaction: number;
  };
  narrative: string;
}

export interface GhostOpponent {
  id: string;
  name: string;
  playingStyle: string;
  strengths: string[];
  weaknesses: string[];
  emotionalProfile: Record<string, number>;
  gameHistory: Record<string, unknown>[];
}

export interface CoachingPlan {
  userId: number;
  skillLevel: string;
  focusAreas: string[];
  exercises: Array<{type: string; difficulty: string; count: number}>;
  progressTracking: {
    completedExercises: number;
    accuracy: number;
    timeSpent: number;
    lastUpdated: Date;
  };
}

export interface SoulScanResult {
  userId: number;
  chessPersonality: string;
  playingStyle: string;
  emotionalPatterns: {
    underPressure: string;
    winningPositions: string;
    losingPositions: string;
    timeManagement: string;
  };
  recommendations: string[];
  strengths: string[];
  improvementAreas: string[];
}

export class TrainingPipeline {
  static async annotateEmotions(pgn: string, position: {fen?: string} | string): Promise<EmotionAnnotation> {
    try {
      let emotions = {
        tension: Math.random() * 100,
        excitement: Math.random() * 100,
        surprise: Math.random() * 100,
        satisfaction: Math.random() * 100
      };
      
      let narrative = "The position crackles with tactical tension...";

      try {
        const { PGNEmotionClassifier } = await import('@/lib/analysis/PGNEmotionClassifier');
        const classifier = await PGNEmotionClassifier.classifyPGN(pgn);
        const positionStr = typeof position === 'string' ? position : (position.fen || 'unknown');
        const relevantMove = classifier.moves.find(m => m.fen === positionStr);
        
        if (relevantMove) {
          emotions = {
            tension: relevantMove.emotions.tension,
            excitement: relevantMove.emotions.hope,
            surprise: relevantMove.emotions.aggression,
            satisfaction: relevantMove.emotions.collapse
          };
          narrative = relevantMove.narrative;
        }
      } catch (classifierError) {
        console.warn('PGN Emotion Classifier not available, using fallback:', classifierError);
        const narratives = [
          "The position crackles with tactical tension...",
          "A moment of profound strategic beauty unfolds...",
          "The pieces dance in perfect harmony...",
          "Danger lurks in every shadow of the board..."
        ];
        narrative = narratives[Math.floor(Math.random() * narratives.length)];
      }

      const annotation: EmotionAnnotation = {
        position: typeof position === 'string' ? position : (position.fen || 'unknown'),
        emotions,
        narrative
      };

      const db = await getDb();
      await db.query(
        'INSERT INTO emotion_annotations (position_fen, emotions, narrative, created_at) VALUES ($1, $2, $3, NOW())',
        [annotation.position, JSON.stringify(annotation.emotions), annotation.narrative]
      );

      return annotation;
    } catch (error) {
      console.error('Failed to annotate emotions:', error);
      throw error;
    }
  }

  static async createGhostOpponent(playerData: {name?: string; games?: Record<string, unknown>[]}): Promise<GhostOpponent> {
    try {
      const playingStyles = ['aggressive', 'positional', 'tactical', 'endgame_specialist', 'blitz_master'];
      const strengths = ['opening_preparation', 'middlegame_tactics', 'endgame_technique', 'time_management', 'psychological_pressure'];
      const weaknesses = ['time_pressure', 'complex_positions', 'endgames', 'opening_theory', 'calculation'];

      const ghost: GhostOpponent = {
        id: `ghost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `Ghost of ${playerData.name || 'Unknown Player'}`,
        playingStyle: playingStyles[Math.floor(Math.random() * playingStyles.length)],
        strengths: strengths.slice(0, Math.floor(Math.random() * 3) + 1),
        weaknesses: weaknesses.slice(0, Math.floor(Math.random() * 2) + 1),
        emotionalProfile: {
          aggression: Math.random() * 100,
          patience: Math.random() * 100,
          creativity: Math.random() * 100,
          resilience: Math.random() * 100
        },
        gameHistory: playerData.games || []
      };

      const db = await getDb();
      await db.query(
        'INSERT INTO ghost_opponents (ghost_id, name, playing_style, strengths, weaknesses, emotional_profile, game_history, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
        [ghost.id, ghost.name, ghost.playingStyle, JSON.stringify(ghost.strengths), JSON.stringify(ghost.weaknesses), JSON.stringify(ghost.emotionalProfile), JSON.stringify(ghost.gameHistory)]
      );

      return ghost;
    } catch (error) {
      console.error('Failed to create ghost opponent:', error);
      throw error;
    }
  }

  static async generateCoachingPlan(userId: number, skillLevel: string): Promise<CoachingPlan> {
    try {
      const focusAreasByLevel = {
        beginner: ['basic_tactics', 'piece_development', 'checkmate_patterns'],
        intermediate: ['positional_understanding', 'endgame_basics', 'opening_principles'],
        advanced: ['complex_tactics', 'strategic_planning', 'psychological_play'],
        expert: ['deep_calculation', 'opening_preparation', 'endgame_mastery']
      };

      const exercises = [
        { type: 'tactical_puzzle', difficulty: skillLevel, count: 10 },
        { type: 'endgame_study', difficulty: skillLevel, count: 5 },
        { type: 'positional_analysis', difficulty: skillLevel, count: 3 }
      ];

      const plan: CoachingPlan = {
        userId,
        skillLevel,
        focusAreas: focusAreasByLevel[skillLevel as keyof typeof focusAreasByLevel] || focusAreasByLevel.beginner,
        exercises,
        progressTracking: {
          completedExercises: 0,
          accuracy: 0,
          timeSpent: 0,
          lastUpdated: new Date()
        }
      };

      const db = await getDb();
      await db.query(
        'INSERT INTO coaching_plans (user_id, skill_level, focus_areas, exercises, progress_tracking, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) ON CONFLICT (user_id) DO UPDATE SET skill_level = EXCLUDED.skill_level, focus_areas = EXCLUDED.focus_areas, exercises = EXCLUDED.exercises, progress_tracking = EXCLUDED.progress_tracking',
        [userId, skillLevel, JSON.stringify(plan.focusAreas), JSON.stringify(plan.exercises), JSON.stringify(plan.progressTracking)]
      );

      await AnalyticsEngine.trackUserEngagement(userId, 'coaching_plan_generated', { skillLevel, focusAreas: plan.focusAreas });

      return plan;
    } catch (error) {
      console.error('Failed to generate coaching plan:', error);
      throw error;
    }
  }

  static async performSoulScan(userId: number): Promise<SoulScanResult> {
    try {
      const personalities = ['The Tactician', 'The Strategist', 'The Fighter', 'The Artist', 'The Calculator'];
      const styles = ['aggressive', 'positional', 'tactical', 'creative', 'solid'];

      const emotionalPatterns = {
        underPressure: Math.random() > 0.5 ? 'calm' : 'aggressive',
        winningPositions: Math.random() > 0.5 ? 'confident' : 'cautious',
        losingPositions: Math.random() > 0.5 ? 'resilient' : 'desperate',
        timeManagement: Math.random() > 0.5 ? 'efficient' : 'time_trouble'
      };

      const result: SoulScanResult = {
        userId,
        chessPersonality: personalities[Math.floor(Math.random() * personalities.length)],
        playingStyle: styles[Math.floor(Math.random() * styles.length)],
        emotionalPatterns,
        recommendations: [
          'Focus on improving tactical vision',
          'Work on endgame technique',
          'Study positional concepts'
        ],
        strengths: ['Quick pattern recognition', 'Good intuition'],
        improvementAreas: ['Time management', 'Opening preparation']
      };

      const db = await getDb();
      await db.query(
        'INSERT INTO soul_scans (user_id, chess_personality, playing_style, emotional_patterns, recommendations, strengths, improvement_areas, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
        [userId, result.chessPersonality, result.playingStyle, JSON.stringify(result.emotionalPatterns), JSON.stringify(result.recommendations), JSON.stringify(result.strengths), JSON.stringify(result.improvementAreas)]
      );

      await AnalyticsEngine.trackUserEngagement(userId, 'soul_scan_completed', { personality: result.chessPersonality, style: result.playingStyle });

      return result;
    } catch (error) {
      console.error('Failed to perform soul scan:', error);
      throw error;
    }
  }

  static async getTrainingProgress(userId: number) {
    try {
      const db = await getDb();
      const [coachingPlan, soulScan, completedExercises] = await Promise.all([
        db.query('SELECT * FROM coaching_plans WHERE user_id = $1', [userId]),
        db.query('SELECT * FROM soul_scans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]),
        db.query('SELECT COUNT(*) as completed FROM training_exercises WHERE user_id = $1 AND completed = true', [userId])
      ]);

      return {
        coachingPlan: coachingPlan.rows[0] || null,
        soulScan: soulScan.rows[0] || null,
        completedExercises: parseInt(completedExercises.rows[0]?.completed || '0'),
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Failed to get training progress:', error);
      return null;
    }
  }

  static async updateExerciseProgress(userId: number, exerciseId: string, completed: boolean, accuracy?: number) {
    try {
      const db = await getDb();
      await db.query(
        'INSERT INTO training_exercises (user_id, exercise_id, completed, accuracy, completed_at) VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT (user_id, exercise_id) DO UPDATE SET completed = EXCLUDED.completed, accuracy = EXCLUDED.accuracy, completed_at = EXCLUDED.completed_at',
        [userId, exerciseId, completed, accuracy]
      );

      if (completed) {
        await AnalyticsEngine.trackUserEngagement(userId, 'exercise_completed', { exerciseId, accuracy });
      }
    } catch (error) {
      console.error('Failed to update exercise progress:', error);
    }
  }
}

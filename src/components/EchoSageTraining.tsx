'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Target, 
  Trophy, 
  Clock, 
  Star, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  BarChart3,
  BookOpen,
  Zap,
  Flame,
  TrendingUp,
  Award,
  Calendar,
  Bookmark,
  Share2,
  Settings,
  Play,
  Pause,
  SkipForward
} from 'lucide-react';

interface Puzzle {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  theme: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
  timeLimit: number;
  hint?: string;
  explanation?: string;
  tags: string[];
}

interface TrainingSession {
  id: string;
  type: 'tactics' | 'endgame' | 'opening' | 'strategy';
  puzzles: Puzzle[];
  currentPuzzleIndex: number;
  score: number;
  totalPuzzles: number;
  timeSpent: number;
  startTime: Date;
  isCompleted: boolean;
}

interface UserProgress {
  totalPuzzles: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  rating: number;
  streak: number;
  achievements: Achievement[];
  dailyGoal: number;
  dailyProgress: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  progress: number;
  maxProgress: number;
}

export default function EchoSageTraining() {
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalPuzzles: 0,
    correctAnswers: 0,
    accuracy: 0,
    averageTime: 0,
    rating: 1200,
    streak: 0,
    achievements: [],
    dailyGoal: 10,
    dailyProgress: 0
  });
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);
  const [userMoves, setUserMoves] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'tactics' | 'endgame' | 'opening' | 'strategy'>('tactics');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'master'>('intermediate');

  const sessionTypes = [
    {
      id: 'tactics',
      name: 'Tactics Training',
      description: 'Sharpen your tactical vision',
      icon: <Target className="w-6 h-6" />,
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'endgame',
      name: 'Endgame Mastery',
      description: 'Master the final phase',
      icon: <Trophy className="w-6 h-6" />,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'opening',
      name: 'Opening Repertoire',
      description: 'Build your opening knowledge',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'strategy',
      name: 'Strategic Thinking',
      description: 'Develop positional understanding',
      icon: <Brain className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const difficulties = [
    { id: 'beginner', name: 'Beginner', rating: '800-1200' },
    { id: 'intermediate', name: 'Intermediate', rating: '1200-1600' },
    { id: 'advanced', name: 'Advanced', rating: '1600-2000' },
    { id: 'master', name: 'Master', rating: '2000+' }
  ];

  // Load user progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('echosage-progress');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('echosage-progress', JSON.stringify(userProgress));
  }, [userProgress]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining]);

  const startNewSession = async () => {
    const puzzles = await generatePuzzles(sessionType, difficulty, 10);
    
    const session: TrainingSession = {
      id: Date.now().toString(),
      type: sessionType,
      puzzles,
      currentPuzzleIndex: 0,
      score: 0,
      totalPuzzles: puzzles.length,
      timeSpent: 0,
      startTime: new Date(),
      isCompleted: false
    };

    setCurrentSession(session);
    setSelectedPuzzle(puzzles[0]);
    setUserMoves([]);
    setIsCorrect(null);
    setShowHint(false);
    setShowExplanation(false);
    setTimeRemaining(puzzles[0].timeLimit);
    setIsTimerRunning(true);
  };

  const generatePuzzles = async (
    type: string, 
    difficulty: string, 
    count: number
  ): Promise<Puzzle[]> => {
    // This would normally fetch from your puzzle database
    // For now, generating mock puzzles
    const themes = {
      tactics: ['mate', 'fork', 'pin', 'skewer', 'discovered attack'],
      endgame: ['king and pawn', 'rook endgame', 'queen endgame', 'minor piece endgame'],
      opening: ['e4', 'd4', 'c4', 'Nf3', 'g3'],
      strategy: ['space advantage', 'development', 'pawn structure', 'piece coordination']
    };

    const puzzles: Puzzle[] = [];
    for (let i = 0; i < count; i++) {
      const theme = themes[type as keyof typeof themes][
        Math.floor(Math.random() * themes[type as keyof typeof themes].length)
      ];
      
      puzzles.push({
        id: `puzzle-${type}-${difficulty}-${i}`,
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Starting position
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
        rating: getRatingForDifficulty(difficulty),
        theme,
        difficulty: difficulty as any,
        timeLimit: getTimeLimitForDifficulty(difficulty),
        hint: `Look for ${theme} opportunities`,
        explanation: `This position demonstrates ${theme}. The key is to...`,
        tags: [type, difficulty, theme]
      });
    }

    return puzzles;
  };

  const getRatingForDifficulty = (difficulty: string): number => {
    const ranges = {
      beginner: [800, 1200],
      intermediate: [1200, 1600],
      advanced: [1600, 2000],
      master: [2000, 2500]
    };
    
    const [min, max] = ranges[difficulty as keyof typeof ranges];
    return Math.floor(Math.random() * (max - min) + min);
  };

  const getTimeLimitForDifficulty = (difficulty: string): number => {
    const limits = {
      beginner: 300, // 5 minutes
      intermediate: 180, // 3 minutes
      advanced: 120, // 2 minutes
      master: 60 // 1 minute
    };
    
    return limits[difficulty as keyof typeof limits];
  };

  const handleMove = (move: string) => {
    if (!selectedPuzzle || isCorrect !== null) return;

    const newMoves = [...userMoves, move];
    setUserMoves(newMoves);

    // Check if the move is correct
    const isMoveCorrect = checkMoveCorrectness(newMoves, selectedPuzzle.moves);
    
    if (isMoveCorrect) {
      setIsCorrect(true);
      setIsTimerRunning(false);
      handleCorrectAnswer();
    } else if (newMoves.length >= selectedPuzzle.moves.length) {
      setIsCorrect(false);
      setIsTimerRunning(false);
      handleIncorrectAnswer();
    }
  };

  const checkMoveCorrectness = (userMoves: string[], correctMoves: string[]): boolean => {
    if (userMoves.length !== correctMoves.length) return false;
    
    return userMoves.every((move, index) => 
      move.toLowerCase() === correctMoves[index].toLowerCase()
    );
  };

  const handleCorrectAnswer = () => {
    if (!currentSession || !selectedPuzzle) return;

    const timeBonus = Math.max(0, timeRemaining);
    const ratingBonus = Math.floor(selectedPuzzle.rating / 100);
    const totalBonus = timeBonus + ratingBonus;

    setUserProgress(prev => ({
      ...prev,
      totalPuzzles: prev.totalPuzzles + 1,
      correctAnswers: prev.correctAnswers + 1,
      accuracy: ((prev.correctAnswers + 1) / (prev.totalPuzzles + 1)) * 100,
      rating: prev.rating + ratingBonus,
      streak: prev.streak + 1,
      dailyProgress: prev.dailyProgress + 1
    }));

    // Update session
    setCurrentSession(prev => prev ? {
      ...prev,
      score: prev.score + totalBonus,
      currentPuzzleIndex: prev.currentPuzzleIndex + 1
    } : null);

    // Check for achievements
    checkAchievements();
  };

  const handleIncorrectAnswer = () => {
    if (!currentSession) return;

    setUserProgress(prev => ({
      ...prev,
      totalPuzzles: prev.totalPuzzles + 1,
      accuracy: (prev.correctAnswers / (prev.totalPuzzles + 1)) * 100,
      streak: 0
    }));

    // Update session
    setCurrentSession(prev => prev ? {
      ...prev,
      currentPuzzleIndex: prev.currentPuzzleIndex + 1
    } : null);
  };

  const handleTimeUp = () => {
    handleIncorrectAnswer();
  };

  const nextPuzzle = () => {
    if (!currentSession) return;

    if (currentSession.currentPuzzleIndex >= currentSession.puzzles.length) {
      // Session completed
      setCurrentSession(prev => prev ? { ...prev, isCompleted: true } : null);
      return;
    }

    const nextPuzzle = currentSession.puzzles[currentSession.currentPuzzleIndex];
    setSelectedPuzzle(nextPuzzle);
    setUserMoves([]);
    setIsCorrect(null);
    setShowHint(false);
    setShowExplanation(false);
    setTimeRemaining(nextPuzzle.timeLimit);
    setIsTimerRunning(true);
  };

  const checkAchievements = () => {
    const newAchievements: Achievement[] = [];
    
    // Streak achievements
    if (userProgress.streak === 5 && !hasAchievement('streak-5')) {
      newAchievements.push({
        id: 'streak-5',
        name: 'Hot Streak',
        description: 'Solve 5 puzzles in a row',
        icon: '🔥',
        unlockedAt: new Date(),
        progress: 5,
        maxProgress: 5
      });
    }

    if (userProgress.streak === 10 && !hasAchievement('streak-10')) {
      newAchievements.push({
        id: 'streak-10',
        name: 'Unstoppable',
        description: 'Solve 10 puzzles in a row',
        icon: '⚡',
        unlockedAt: new Date(),
        progress: 10,
        maxProgress: 10
      });
    }

    // Rating achievements
    if (userProgress.rating >= 1500 && !hasAchievement('rating-1500')) {
      newAchievements.push({
        id: 'rating-1500',
        name: 'Rising Star',
        description: 'Reach 1500 rating',
        icon: '⭐',
        unlockedAt: new Date(),
        progress: 1500,
        maxProgress: 1500
      });
    }

    if (newAchievements.length > 0) {
      setUserProgress(prev => ({
        ...prev,
        achievements: [...prev.achievements, ...newAchievements]
      }));
    }
  };

  const hasAchievement = (id: string): boolean => {
    return userProgress.achievements.some(achievement => achievement.id === id);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">🧠 EchoSage Training</h1>
                <p className="text-gray-300">Train with an AI that understands chess souls</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white font-semibold">Rating: {userProgress.rating}</p>
                  <p className="text-gray-400 text-sm">Streak: {userProgress.streak}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{userProgress.dailyProgress}/{userProgress.dailyGoal}</p>
                  <p className="text-gray-400 text-sm">Daily Goal</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Training Types */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Choose Your Training</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {sessionTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      onClick={() => setSessionType(type.id as any)}
                      className={`p-6 rounded-lg border transition-all duration-300 ${
                        sessionType === type.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-white/20 bg-white/5 hover:border-white/40'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${type.color}`}>
                          {type.icon}
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-white">{type.name}</h3>
                          <p className="text-sm text-gray-400">{type.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Difficulty Level</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {difficulties.map((diff) => (
                      <button
                        key={diff.id}
                        onClick={() => setDifficulty(diff.id as any)}
                        className={`p-3 rounded-lg border transition-colors ${
                          difficulty === diff.id
                            ? 'border-blue-500 bg-blue-500/20 text-white'
                            : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40'
                        }`}
                      >
                        <div className="text-center">
                          <p className="font-semibold">{diff.name}</p>
                          <p className="text-xs opacity-75">{diff.rating}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  onClick={startNewSession}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-lg font-semibold text-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Training Session
                </motion.button>
              </div>
            </div>

            {/* Progress & Stats */}
            <div className="space-y-6">
              {/* Daily Progress */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Daily Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Puzzles Solved</span>
                      <span className="text-white">{userProgress.dailyProgress}/{userProgress.dailyGoal}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(userProgress.dailyProgress / userProgress.dailyGoal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-white">{userProgress.accuracy.toFixed(1)}%</p>
                      <p className="text-xs text-gray-400">Accuracy</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{userProgress.streak}</p>
                      <p className="text-xs text-gray-400">Streak</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Achievements</h3>
                <div className="space-y-3">
                  {userProgress.achievements.slice(-3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <p className="text-white font-semibold">{achievement.name}</p>
                        <p className="text-xs text-gray-400">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                  {userProgress.achievements.length === 0 && (
                    <p className="text-gray-400 text-center py-4">No achievements yet. Start training!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentSession.isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 max-w-md w-full text-center"
        >
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Session Complete!</h2>
          <p className="text-gray-300 mb-6">Great job completing your training session.</p>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-400">Score:</span>
              <span className="text-white font-semibold">{currentSession.score}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Puzzles:</span>
              <span className="text-white font-semibold">{currentSession.totalPuzzles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Time:</span>
              <span className="text-white font-semibold">{formatTime(currentSession.timeSpent)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentSession(null)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
            >
              New Session
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
            >
              Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">🧠 EchoSage Training</h1>
              <p className="text-gray-300">
                Puzzle {currentSession.currentPuzzleIndex + 1} of {currentSession.totalPuzzles}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-white font-semibold">{formatTime(timeRemaining)}</p>
                <p className="text-gray-400 text-sm">Time Left</p>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">{currentSession.score}</p>
                <p className="text-gray-400 text-sm">Score</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chess Board */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Puzzle #{selectedPuzzle?.id}</h2>
                  <p className="text-gray-400">{selectedPuzzle?.theme} • {selectedPuzzle?.difficulty}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Hint
                  </button>
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Explain
                  </button>
                </div>
              </div>
              
              {/* Placeholder for chess board component */}
              <div className="aspect-square bg-white/5 rounded-lg border border-white/20 flex items-center justify-center mb-4">
                <div className="text-center text-gray-400">
                  <Target className="w-16 h-16 mx-auto mb-4" />
                  <p>Chess Board Component</p>
                  <p className="text-sm">Find the best move</p>
                </div>
              </div>

              {/* User Moves */}
              <div className="mb-4">
                <h3 className="text-white font-semibold mb-2">Your Moves:</h3>
                <div className="flex flex-wrap gap-2">
                  {userMoves.map((move, index) => (
                    <span key={index} className="bg-white/10 text-white px-3 py-1 rounded text-sm">
                      {move}
                    </span>
                  ))}
                </div>
              </div>

              {/* Result */}
              <AnimatePresence>
                {isCorrect !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-lg mb-4 flex items-center gap-3 ${
                      isCorrect 
                        ? 'bg-green-500/20 border border-green-500/50' 
                        : 'bg-red-500/20 border border-red-500/50'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-400" />
                        <div>
                          <p className="text-green-400 font-semibold">Correct!</p>
                          <p className="text-green-300 text-sm">Great job finding the best move.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-red-400" />
                        <div>
                          <p className="text-red-400 font-semibold">Incorrect</p>
                          <p className="text-red-300 text-sm">Keep trying to find the best move.</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hint */}
              {showHint && selectedPuzzle?.hint && (
                <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg mb-4">
                  <p className="text-blue-300">
                    <strong>Hint:</strong> {selectedPuzzle.hint}
                  </p>
                </div>
              )}

              {/* Explanation */}
              {showExplanation && selectedPuzzle?.explanation && (
                <div className="p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg mb-4">
                  <p className="text-purple-300">
                    <strong>Explanation:</strong> {selectedPuzzle.explanation}
                  </p>
                </div>
              )}

              {/* Next Button */}
              {isCorrect !== null && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={nextPuzzle}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Next Puzzle
                </motion.button>
              )}
            </div>
          </div>

          {/* Session Info */}
          <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Session Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Progress</span>
                    <span className="text-white">{currentSession.currentPuzzleIndex + 1}/{currentSession.totalPuzzles}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentSession.currentPuzzleIndex + 1) / currentSession.totalPuzzles) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">{currentSession.score}</p>
                    <p className="text-xs text-gray-400">Score</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{formatTime(currentSession.timeSpent)}</p>
                    <p className="text-xs text-gray-400">Time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Puzzle Info */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Puzzle Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating:</span>
                  <span className="text-white">{selectedPuzzle?.rating}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Theme:</span>
                  <span className="text-white capitalize">{selectedPuzzle?.theme}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Difficulty:</span>
                  <span className="text-white capitalize">{selectedPuzzle?.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time Limit:</span>
                  <span className="text-white">{formatTime(selectedPuzzle?.timeLimit || 0)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setCurrentSession(null)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors text-sm"
                >
                  End Session
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition-colors text-sm"
                >
                  Restart Puzzle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
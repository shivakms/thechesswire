'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Target, Zap, Clock, Trophy, Star, Play, Pause, RotateCcw } from 'lucide-react';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';

interface TrainingSession {
  id: string;
  type: 'tactics' | 'endgames' | 'openings' | 'middlegame';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  position: string;
  solution: string[];
  explanation: string;
  timeLimit: number;
  completed: boolean;
  score: number;
}

interface EchoSageStats {
  totalSessions: number;
  averageScore: number;
  bestScore: number;
  timeSpent: number;
  accuracy: number;
  streak: number;
}

export default function EchoSagePage() {
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [userMoves, setUserMoves] = useState<string[]>([]);
  const [showSolution, setShowSolution] = useState(false);
  const [stats, setStats] = useState<EchoSageStats>({
    totalSessions: 0,
    averageScore: 0,
    bestScore: 0,
    timeSpent: 0,
    accuracy: 0,
    streak: 0
  });

  const { playNarration } = useVoiceNarration();

  // Mock training sessions
  const trainingSessions: TrainingSession[] = [
    {
      id: '1',
      type: 'tactics',
      difficulty: 'intermediate',
      position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
      solution: ['Qxf6', 'gxf6', 'Bxf7+', 'Kxf7', 'Ne5+'],
      explanation: 'This is a classic Greek Gift sacrifice. White sacrifices the queen to open up the black king and create a devastating attack.',
      timeLimit: 300,
      completed: false,
      score: 0
    },
    {
      id: '2',
      type: 'endgames',
      difficulty: 'advanced',
      position: '8/8/8/8/8/8/4K3/4k3 w - - 0 1',
      solution: ['Ke3', 'Kd1', 'Kd3', 'Ke1', 'Ke2'],
      explanation: 'This is a basic king and pawn endgame. White must use opposition to win the pawn.',
      timeLimit: 180,
      completed: false,
      score: 0
    }
  ];

  useEffect(() => {
    // Load user stats
    loadUserStats();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTraining && currentSession) {
      interval = setInterval(() => {
        setSessionTime(prev => {
          if (prev >= currentSession.timeLimit) {
            endSession();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTraining, currentSession]);

  const loadUserStats = async () => {
    try {
      const response = await fetch('/api/echosage/stats');
      if (response.ok) {
        const userStats = await response.json();
        setStats(userStats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const startSession = (session: TrainingSession) => {
    setCurrentSession(session);
    setIsTraining(true);
    setSessionTime(0);
    setUserMoves([]);
    setShowSolution(false);
    
    // Narrate the session start
    playNarration(
      `Welcome to EchoSage training. You have ${session.timeLimit} seconds to solve this ${session.type} puzzle. Good luck!`,
      'expressive'
    );
  };

  const endSession = () => {
    if (!currentSession) return;
    
    setIsTraining(false);
    const accuracy = calculateAccuracy();
    const score = calculateScore(accuracy);
    
    // Update session
    const updatedSession = {
      ...currentSession,
      completed: true,
      score
    };
    
    // Save session results
    saveSessionResults(updatedSession);
    
    // Update stats
    updateStats(score, accuracy);
    
    // Narrate results
    playNarration(
      `Session complete! Your accuracy was ${Math.round(accuracy * 100)}% and you scored ${score} points. ${score > 80 ? 'Excellent work!' : 'Keep practicing!'}`,
      'expressive'
    );
  };

  const calculateAccuracy = () => {
    if (!currentSession || userMoves.length === 0) return 0;
    
    let correctMoves = 0;
    userMoves.forEach((move, index) => {
      if (currentSession.solution[index] && move === currentSession.solution[index]) {
        correctMoves++;
      }
    });
    
    return correctMoves / Math.max(userMoves.length, currentSession.solution.length);
  };

  const calculateScore = (accuracy: number) => {
    if (!currentSession) return 0;
    
    const baseScore = 100;
    const timeBonus = Math.max(0, currentSession.timeLimit - sessionTime) * 2;
    const accuracyBonus = accuracy * 50;
    
    return Math.round(baseScore + timeBonus + accuracyBonus);
  };

  const saveSessionResults = async (session: TrainingSession) => {
    try {
      await fetch('/api/echosage/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          score: session.score,
          timeSpent: sessionTime,
          accuracy: calculateAccuracy(),
          moves: userMoves
        })
      });
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const updateStats = (score: number, accuracy: number) => {
    setStats(prev => ({
      totalSessions: prev.totalSessions + 1,
      averageScore: (prev.averageScore * prev.totalSessions + score) / (prev.totalSessions + 1),
      bestScore: Math.max(prev.bestScore, score),
      timeSpent: prev.timeSpent + sessionTime,
      accuracy: (prev.accuracy * prev.totalSessions + accuracy) / (prev.totalSessions + 1),
      streak: accuracy > 0.8 ? prev.streak + 1 : 0
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen chess-gradient-dark">
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center mb-6">
            <motion.div
              className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center glow-effect"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">EchoSage Training</h1>
          <p className="text-xl text-gray-300">AI-powered chess training that adapts to your skill level</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Panel */}
          <div className="lg:col-span-1">
            <motion.div
              className="glass-morphism-dark rounded-2xl p-6 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total Sessions</span>
                  <span className="text-white font-semibold">{stats.totalSessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Average Score</span>
                  <span className="text-white font-semibold">{Math.round(stats.averageScore)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Best Score</span>
                  <span className="text-white font-semibold">{stats.bestScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Accuracy</span>
                  <span className="text-white font-semibold">{Math.round(stats.accuracy * 100)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Current Streak</span>
                  <span className="text-white font-semibold">{stats.streak}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="glass-morphism-dark rounded-2xl p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Training Types</h3>
              <div className="space-y-3">
                {['tactics', 'endgames', 'openings', 'middlegame'].map((type) => (
                  <div
                    key={type}
                    className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <Target className="w-5 h-5 text-primary-400" />
                    <span className="text-white capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Main Training Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {!currentSession ? (
                <motion.div
                  key="session-selection"
                  className="glass-morphism-dark rounded-2xl p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Choose Your Training Session</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trainingSessions.map((session) => (
                      <motion.div
                        key={session.id}
                        className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => startSession(session)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white capitalize">{session.type}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            session.difficulty === 'beginner' ? 'bg-green-600 text-white' :
                            session.difficulty === 'intermediate' ? 'bg-yellow-600 text-white' :
                            session.difficulty === 'advanced' ? 'bg-orange-600 text-white' :
                            'bg-red-600 text-white'
                          }`}>
                            {session.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-300">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(session.timeLimit)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Trophy className="w-4 h-4" />
                            <span>100 pts</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="active-session"
                  className="glass-morphism-dark rounded-2xl p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Session Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white capitalize">{currentSession.type} Training</h2>
                      <p className="text-gray-300">Difficulty: {currentSession.difficulty}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{formatTime(sessionTime)}</div>
                      <div className="text-sm text-gray-300">Time Remaining</div>
                    </div>
                  </div>

                  {/* Chess Board Placeholder */}
                  <div className="bg-gray-800 rounded-lg p-8 mb-6 text-center">
                    <div className="w-64 h-64 bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-gray-400">Chess Board</span>
                    </div>
                    <p className="text-white">Position: {currentSession.position}</p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setIsTraining(!isTraining)}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        {isTraining ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isTraining ? 'Pause' : 'Resume'}</span>
                      </button>
                      <button
                        onClick={() => setShowSolution(!showSolution)}
                        className="flex items-center space-x-2 px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
                      >
                        <Zap className="w-4 h-4" />
                        <span>{showSolution ? 'Hide' : 'Show'} Solution</span>
                      </button>
                    </div>
                    <button
                      onClick={endSession}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      End Session
                    </button>
                  </div>

                  {/* Solution Display */}
                  {showSolution && (
                    <motion.div
                      className="mt-6 p-4 bg-gray-800 rounded-lg"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <h4 className="text-white font-semibold mb-2">Solution:</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {currentSession.solution.map((move, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-500 text-white rounded text-sm"
                          >
                            {index + 1}. {move}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-300 text-sm">{currentSession.explanation}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
} 
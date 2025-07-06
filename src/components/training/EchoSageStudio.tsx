'use client';

import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { echoSageEngine, TrainingSession, GhostOpponent, EmotionalProfile } from '@/lib/training/EchoSageEngine';

interface EchoSageStudioProps {
  className?: string;
}

interface TrainingJob {
  id: string;
  type: 'coach' | 'ghost' | 'analysis' | 'emotion';
  status: 'idle' | 'active' | 'completed';
  session?: TrainingSession;
  ghostOpponent?: GhostOpponent;
  startTime?: Date;
  currentMove?: string;
}

export default function EchoSageStudio({ className = '' }: EchoSageStudioProps) {
  const [activeJob, setActiveJob] = useState<TrainingJob | null>(null);
  const [availableGhosts, setAvailableGhosts] = useState<GhostOpponent[]>([]);
  const [currentPosition, setCurrentPosition] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [moveInput, setMoveInput] = useState('');
  const [confidence, setConfidence] = useState(50);
  const [emotionalState, setEmotionalState] = useState<EmotionalProfile | null>(null);
  const [sessionInsights, setSessionInsights] = useState<string[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  useEffect(() => {
    setAvailableGhosts(echoSageEngine.getAvailableGhosts());
  }, []);

  const startTrainingSession = async (type: TrainingJob['type'], ghostId?: string) => {
    try {
      console.log('🧠 Starting EchoSage training session:', type);
      
      const session = await echoSageEngine.startTrainingSession(
        'user_123',
        type,
        ghostId ? { ghostOpponentId: ghostId } : undefined
      );

      const ghost = ghostId ? availableGhosts.find(g => g.id === ghostId) : undefined;

      const job: TrainingJob = {
        id: session.id,
        type,
        status: 'active',
        session,
        ghostOpponent: ghost,
        startTime: new Date()
      };

      setActiveJob(job);
      setEmotionalState(session.emotionalState);
      setSessionInsights(session.insights);
      setMoveHistory([]);
      
      console.log('✅ Training session started successfully');
    } catch (error) {
      console.error('❌ Failed to start training session:', error);
    }
  };

  const recordMove = async () => {
    if (!activeJob?.session || !moveInput.trim()) return;

    try {
      const chess = new Chess(currentPosition);
      const move = chess.move(moveInput.trim());
      
      if (!move) {
        alert('Invalid move! Please enter a valid chess move.');
        return;
      }

      const timeSpent = Math.random() * 30000 + 5000; // Simulate thinking time
      const confidenceValue = confidence / 100;

      const result = await echoSageEngine.recordMove(
        move.from + move.to,
        move.san,
        chess.fen(),
        timeSpent,
        confidenceValue
      );

      setCurrentPosition(chess.fen());
      setEmotionalState(result.emotionalUpdate);
      setMoveHistory(prev => [...prev, `${move.san} (${Math.round(timeSpent/1000)}s, ${confidence}% confidence)`]);
      setMoveInput('');
      
      if (result.feedback) {
        setSessionInsights(prev => [...prev, result.feedback]);
      }

      console.log('📝 Move recorded:', move.san);
    } catch (error) {
      console.error('❌ Failed to record move:', error);
      alert('Error recording move. Please try again.');
    }
  };

  const endSession = async () => {
    if (!activeJob?.session) return;

    try {
      const result = await echoSageEngine.endTrainingSession();
      
      setSessionInsights(prev => [...prev, result.summary, ...result.insights]);
      setActiveJob(prev => prev ? { ...prev, status: 'completed' } : null);
      
      console.log('🏁 Training session completed');
    } catch (error) {
      console.error('❌ Failed to end session:', error);
    }
  };

  const resetStudio = () => {
    setActiveJob(null);
    setCurrentPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    setMoveInput('');
    setConfidence(50);
    setEmotionalState(null);
    setSessionInsights([]);
    setMoveHistory([]);
  };

  const getEmotionalColor = (value: number): string => {
    if (value > 0.7) return 'text-green-600';
    if (value > 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPersonalityIcon = (personality: string): string => {
    const icons = {
      aggressive: '⚔️',
      defensive: '🛡️',
      tactical: '🎯',
      positional: '🏗️',
      creative: '🎨'
    };
    return icons[personality as keyof typeof icons] || '🤖';
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          🧠 EchoSage Training Studio
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Advanced chess training with AI-powered emotional analysis, ghost opponents, and personalized coaching
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Training Controls */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">🎯 Training Mode</h2>
            
            {!activeJob ? (
              <div className="space-y-4">
                <button
                  onClick={() => startTrainingSession('coach')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  🧑‍🏫 Start Coach Mode
                </button>
                
                <button
                  onClick={() => startTrainingSession('emotion')}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  💭 Emotional Analysis
                </button>
                
                <button
                  onClick={() => startTrainingSession('analysis')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  📊 Position Analysis
                </button>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3 text-gray-700">👻 Ghost Opponents</h3>
                  <div className="space-y-2">
                    {availableGhosts.map(ghost => (
                      <button
                        key={ghost.id}
                        onClick={() => startTrainingSession('ghost', ghost.id)}
                        className="w-full text-left bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {getPersonalityIcon(ghost.personality)} {ghost.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {ghost.strength}/100
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {ghost.personality} • {ghost.playingStyle.timeManagement}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-800">
                      {activeJob.type === 'ghost' && activeJob.ghostOpponent
                        ? `${getPersonalityIcon(activeJob.ghostOpponent.personality)} ${activeJob.ghostOpponent.name}`
                        : `🧠 ${activeJob.type.charAt(0).toUpperCase() + activeJob.type.slice(1)} Mode`
                      }
                    </span>
                    <span className="text-sm text-blue-600">
                      {activeJob.status === 'active' ? '🟢 Active' : '⏸️ Paused'}
                    </span>
                  </div>
                  {activeJob.startTime && (
                    <div className="text-sm text-blue-600">
                      Started: {activeJob.startTime.toLocaleTimeString()}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Move
                    </label>
                    <input
                      type="text"
                      value={moveInput}
                      onChange={(e) => setMoveInput(e.target.value)}
                      placeholder="e.g., e4, Nf3, O-O"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && recordMove()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confidence: {confidence}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={confidence}
                      onChange={(e) => setConfidence(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={recordMove}
                    disabled={!moveInput.trim()}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    📝 Record Move
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={endSession}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    🏁 End Session
                  </button>
                  <button
                    onClick={resetStudio}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Emotional State */}
          {emotionalState && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">💭 Emotional State</h3>
              <div className="space-y-3">
                {Object.entries(emotionalState).map(([key, value]) => {
                  if (key === 'timestamp') return null;
                  return (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={`text-sm font-bold ${getEmotionalColor(value as number)}`}>
                        {Math.round((value as number) * 100)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Chess Board Area */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">♟️ Training Board</h3>
            
            {/* Simplified board representation */}
            <div className="bg-amber-100 border-2 border-amber-200 rounded-lg p-4 mb-4">
              <div className="text-center text-gray-600 py-8">
                <div className="text-4xl mb-2">♟️</div>
                <div className="text-sm">Chess Board</div>
                <div className="text-xs text-gray-500 mt-2">
                  Position: {currentPosition.split(' ')[0]}
                </div>
              </div>
            </div>

            {/* Move History */}
            {moveHistory.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">📝 Move History</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {moveHistory.map((move, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {index + 1}. {move}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Insights & Feedback */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">💡 AI Insights</h3>
            
            {sessionInsights.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sessionInsights.map((insight, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">{insight}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-3xl mb-2">🤖</div>
                <p className="text-sm">Start a training session to receive AI insights and feedback</p>
              </div>
            )}
          </div>

          {/* Features Overview */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 mt-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-800">🎯 EchoSage Features</h3>
            <ul className="space-y-2 text-sm text-purple-700">
              <li>🧑‍🏫 Personalized AI coaching</li>
              <li>👻 Memory-based ghost opponents</li>
              <li>💭 Real-time emotional analysis</li>
              <li>📊 Performance tracking</li>
              <li>🎯 Weakness identification</li>
              <li>🌊 Flow state monitoring</li>
              <li>🧠 Pattern recognition training</li>
              <li>⚡ Confidence building</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

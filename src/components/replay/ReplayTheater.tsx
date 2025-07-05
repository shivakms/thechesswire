'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { BambaiVoiceEngine } from '../../lib/voice/BambaiVoiceEngine';

interface ReplayTheaterProps {
  pgn: string;
  narrationEnabled?: boolean;
  autoPlay?: boolean;
  playbackSpeed?: number;
}

interface MoveAnnotation {
  moveNumber: number;
  move: string;
  annotation: string;
  emotion: 'triumph' | 'tension' | 'pressure' | 'neutral' | 'excitement';
  evaluation?: number;
  bestMove?: string;
}

export default function ReplayTheater({ 
  pgn, 
  narrationEnabled = true, 
  autoPlay = false,
  playbackSpeed = 2000 
}: ReplayTheaterProps) {
  const [game] = useState(new Chess());
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [annotations, setAnnotations] = useState<MoveAnnotation[]>([]);
  const [currentPosition, setCurrentPosition] = useState('start');
  const [isLoading, setIsLoading] = useState(true);
  
  const bambai = useRef(new BambaiVoiceEngine());
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!pgn) return;
    
    setIsLoading(true);
    try {
      const newGame = new Chess();
      newGame.loadPgn(pgn);
      const history = newGame.history({ verbose: true });
      
      setGameHistory(history);
      setCurrentPosition('start');
      
      const generatedAnnotations = history.map((move, index) => 
        generateMoveAnnotation(move, index, history)
      );
      setAnnotations(generatedAnnotations);
      
    } catch (error) {
      console.error('Failed to load PGN:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pgn]);

  useEffect(() => {
    if (isPlaying && currentMove < gameHistory.length) {
      playbackIntervalRef.current = setTimeout(() => {
        playMove(currentMove + 1);
      }, playbackSpeed);
    } else if (currentMove >= gameHistory.length) {
      setIsPlaying(false);
    }

    return () => {
      if (playbackIntervalRef.current) {
        clearTimeout(playbackIntervalRef.current);
      }
    };
  }, [isPlaying, currentMove, gameHistory.length, playbackSpeed]);

  const generateMoveAnnotation = (move: any, index: number, history: any[]): MoveAnnotation => {
    let annotation = '';
    let emotion: MoveAnnotation['emotion'] = 'neutral';
    
    if (move.san.includes('#')) {
      annotation = 'Checkmate! The game is decided with this brilliant finish.';
      emotion = 'triumph';
    } else if (move.san.includes('+')) {
      annotation = 'Check! Putting pressure on the opponent\'s king.';
      emotion = 'pressure';
    } else if (move.captured) {
      annotation = `Captures the ${move.captured}! Material advantage shifts.`;
      emotion = 'tension';
    } else if (move.promotion) {
      annotation = `Pawn promotion to ${move.promotion}! A powerful transformation.`;
      emotion = 'excitement';
    } else if (move.san === 'O-O' || move.san === 'O-O-O') {
      annotation = 'Castling for king safety. A wise defensive move.';
      emotion = 'neutral';
    } else if (index < 10) {
      annotation = 'Opening development. Building a solid foundation.';
      emotion = 'neutral';
    } else if (index > history.length - 10) {
      annotation = 'Endgame precision. Every move counts now.';
      emotion = 'tension';
    } else {
      annotation = 'Strategic maneuvering. The position evolves.';
      emotion = 'neutral';
    }

    return {
      moveNumber: Math.floor(index / 2) + 1,
      move: move.san,
      annotation,
      emotion,
      evaluation: Math.random() * 2 - 1 // Placeholder evaluation
    };
  };

  const playMove = async (moveIndex: number) => {
    if (moveIndex < 0 || moveIndex > gameHistory.length) return;
    
    setCurrentMove(moveIndex);
    
    const tempGame = new Chess();
    for (let i = 0; i < moveIndex; i++) {
      tempGame.move(gameHistory[i]);
    }
    setCurrentPosition(tempGame.fen());
    
    if (narrationEnabled && annotations[moveIndex - 1] && moveIndex > 0) {
      const annotation = annotations[moveIndex - 1];
      const narrationText = `Move ${annotation.moveNumber}: ${annotation.move}. ${annotation.annotation}`;
      
      try {
        const voiceMode = getVoiceModeForEmotion(annotation.emotion);
        await bambai.current.generateVoice(narrationText, voiceMode, annotation.emotion);
      } catch (error) {
        console.error('Voice generation failed:', error);
      }
    }
  };

  const getVoiceModeForEmotion = (emotion: MoveAnnotation['emotion']): 'wiseMentor' | 'enthusiasticCommentator' | 'thoughtfulPhilosopher' | 'warmEncourager' | 'poeticStoryteller' | 'whisperMode' | 'dramaticNarrator' => {
    switch (emotion) {
      case 'triumph': return 'dramaticNarrator';
      case 'tension': return 'dramaticNarrator';
      case 'pressure': return 'dramaticNarrator';
      case 'excitement': return 'enthusiasticCommentator';
      default: return 'wiseMentor';
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetReplay = () => {
    setCurrentMove(0);
    setCurrentPosition('start');
    setIsPlaying(false);
  };

  const jumpToMove = (moveIndex: number) => {
    setIsPlaying(false);
    playMove(moveIndex);
  };

  const skipToEnd = () => {
    setIsPlaying(false);
    playMove(gameHistory.length);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-3 gap-8"
        >
          {/* Chess Board - Main Theater */}
          <div className="lg:col-span-2">
            <motion.div 
              className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Chess Replay Theater
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>Move {currentMove} of {gameHistory.length}</span>
                  {narrationEnabled && (
                    <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs">
                      🎤 Narration ON
                    </span>
                  )}
                </div>
              </div>
              
              {/* Chessboard with cinematic presentation */}
              <div className="flex justify-center mb-6">
                <motion.div
                  key={currentMove}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <div className="w-[500px] h-[500px] bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <div className="text-6xl mb-4">♔</div>
                      <p>Chess Position: {currentPosition}</p>
                      <p className="text-sm mt-2">Move {currentMove} of {gameHistory.length}</p>
                    </div>
                  </div>
                  
                  {/* Cinematic overlay effects */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 rounded-xl"></div>
                  </div>
                </motion.div>
              </div>

              {/* Playback Controls */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <button
                    onClick={resetReplay}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    title="Reset to start"
                  >
                    ⏮
                  </button>
                  <button
                    onClick={() => jumpToMove(Math.max(0, currentMove - 1))}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    title="Previous move"
                  >
                    ⏪
                  </button>
                  <button
                    onClick={togglePlayback}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      isPlaying 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                  </button>
                  <button
                    onClick={() => jumpToMove(Math.min(gameHistory.length, currentMove + 1))}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    title="Next move"
                  >
                    ⏩
                  </button>
                  <button
                    onClick={skipToEnd}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    title="Skip to end"
                  >
                    ⏭
                  </button>
                </div>

                {/* Timeline Scrubber */}
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max={gameHistory.length}
                    value={currentMove}
                    onChange={(e) => jumpToMove(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(currentMove / gameHistory.length) * 100}%, #374151 ${(currentMove / gameHistory.length) * 100}%, #374151 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>Start</span>
                    <span>End</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Move Analysis & Timeline */}
          <div className="space-y-6">
            {/* Current Move Analysis */}
            <motion.div
              className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Move Analysis</h3>
              
              {currentMove > 0 && annotations[currentMove - 1] && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMove}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-purple-300">
                        {annotations[currentMove - 1].moveNumber}.
                      </span>
                      <span className="text-xl font-semibold text-white">
                        {annotations[currentMove - 1].move}
                      </span>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        annotations[currentMove - 1].emotion === 'triumph' ? 'bg-green-600/20 text-green-300' :
                        annotations[currentMove - 1].emotion === 'tension' ? 'bg-red-600/20 text-red-300' :
                        annotations[currentMove - 1].emotion === 'pressure' ? 'bg-orange-600/20 text-orange-300' :
                        annotations[currentMove - 1].emotion === 'excitement' ? 'bg-yellow-600/20 text-yellow-300' :
                        'bg-gray-600/20 text-gray-300'
                      }`}>
                        {annotations[currentMove - 1].emotion}
                      </div>
                    </div>
                    
                    <p className="text-gray-300 leading-relaxed">
                      {annotations[currentMove - 1].annotation}
                    </p>
                    
                    {annotations[currentMove - 1].evaluation !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Evaluation:</span>
                        <div className={`px-2 py-1 rounded text-sm ${
                          annotations[currentMove - 1].evaluation! > 0.5 ? 'bg-green-600/20 text-green-300' :
                          annotations[currentMove - 1].evaluation! < -0.5 ? 'bg-red-600/20 text-red-300' :
                          'bg-gray-600/20 text-gray-300'
                        }`}>
                          {annotations[currentMove - 1].evaluation! > 0 ? '+' : ''}
                          {annotations[currentMove - 1].evaluation!.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
              
              {currentMove === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <p>Starting position</p>
                  <p className="text-sm mt-2">Press play to begin the replay</p>
                </div>
              )}
            </motion.div>

            {/* Move History Timeline */}
            <motion.div
              className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Move Timeline</h3>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {annotations.map((annotation, index) => (
                  <motion.button
                    key={index}
                    onClick={() => jumpToMove(index + 1)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      currentMove === index + 1
                        ? 'bg-purple-600/30 border border-purple-500/50'
                        : 'bg-gray-800/30 hover:bg-gray-700/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">
                        {annotation.moveNumber}. {annotation.move}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${
                        annotation.emotion === 'triumph' ? 'bg-green-400' :
                        annotation.emotion === 'tension' ? 'bg-red-400' :
                        annotation.emotion === 'pressure' ? 'bg-orange-400' :
                        annotation.emotion === 'excitement' ? 'bg-yellow-400' :
                        'bg-gray-400'
                      }`} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {annotation.annotation}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

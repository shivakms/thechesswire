'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw,
  Download,
  Share2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  BookOpen,
  Target,
  Clock,
  Trophy,
  Users
} from 'lucide-react';
import { Chess } from 'chess.js';

interface Move {
  san: string;
  from: string;
  to: string;
  piece: string;
  color: 'w' | 'b';
  flags: string;
  promotion?: string;
  captured?: string;
  evaluation?: number;
  comment?: string;
}

interface GameAnalysis {
  moves: Move[];
  result: string;
  whitePlayer: string;
  blackPlayer: string;
  event: string;
  site: string;
  date: string;
  opening: string;
  eco: string;
  timeControl: string;
  termination: string;
}

export default function PGNAnalysis() {
  const [game, setGame] = useState<Chess | null>(null);
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(true);
  const [showComments, setShowComments] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragText, setDragText] = useState('Drop PGN file here or click to upload');
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setError('');
      setIsAnalyzing(true);
      
      const text = await file.text();
      const chess = new Chess();
      
      if (!chess.loadPgn(text)) {
        throw new Error('Invalid PGN format');
      }

      // Parse game information
      const gameInfo = chess.header();
      const moves = chess.history({ verbose: true });
      
      // Analyze each position
      const analyzedMoves = await Promise.all(
        moves.map(async (move, index) => {
          const tempChess = new Chess();
          tempChess.loadPgn(text);
          
          // Go to the position after this move
          for (let i = 0; i <= index; i++) {
            tempChess.move(moves[i]);
          }
          
          // Get position evaluation (simplified - in real implementation, use Stockfish)
          const evaluation = await getPositionEvaluation(tempChess.fen());
          
          return {
            ...move,
            evaluation,
            comment: generateMoveComment(move, evaluation)
          };
        })
      );

      const gameAnalysis: GameAnalysis = {
        moves: analyzedMoves,
        result: chess.header('Result') || '*',
        whitePlayer: chess.header('White') || 'Unknown',
        blackPlayer: chess.header('Black') || 'Unknown',
        event: chess.header('Event') || 'Unknown Event',
        site: chess.header('Site') || 'Unknown Site',
        date: chess.header('Date') || 'Unknown Date',
        opening: chess.header('Opening') || 'Unknown Opening',
        eco: chess.header('ECO') || '',
        timeControl: chess.header('TimeControl') || '',
        termination: chess.header('Termination') || ''
      };

      setGame(chess);
      setAnalysis(gameAnalysis);
      setCurrentMoveIndex(-1);
      setIsAnalyzing(false);
      
    } catch (error) {
      setError('Failed to load PGN file. Please check the format.');
      setIsAnalyzing(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragText('Drop PGN file here');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDragText('Drop PGN file here or click to upload');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDragText('Drop PGN file here or click to upload');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.pgn') || file.type === 'text/plain') {
        handleFileUpload(file);
      } else {
        setError('Please upload a valid PGN file');
      }
    }
  }, [handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const togglePlay = () => {
    if (isPlaying) {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      if (currentMoveIndex < analysis!.moves.length - 1) {
        setIsPlaying(true);
        playIntervalRef.current = setInterval(() => {
          setCurrentMoveIndex(prev => {
            if (prev >= analysis!.moves.length - 1) {
              setIsPlaying(false);
              return prev;
            }
            return prev + 1;
          });
        }, 2000);
      }
    }
  };

  const goToMove = (index: number) => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentMoveIndex(index);
  };

  const goToStart = () => {
    goToMove(-1);
  };

  const goToEnd = () => {
    goToMove(analysis!.moves.length - 1);
  };

  const previousMove = () => {
    if (currentMoveIndex > -1) {
      goToMove(currentMoveIndex - 1);
    }
  };

  const nextMove = () => {
    if (currentMoveIndex < analysis!.moves.length - 1) {
      goToMove(currentMoveIndex + 1);
    }
  };

  const exportPGN = () => {
    if (!game) return;
    
    const pgn = game.pgn();
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-analysis.pgn';
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareGame = async () => {
    if (!analysis) return;
    
    const shareData = {
      title: `${analysis.whitePlayer} vs ${analysis.blackPlayer}`,
      text: `Check out this chess game: ${analysis.event}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Game URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Simplified position evaluation (replace with Stockfish integration)
  const getPositionEvaluation = async (fen: string): Promise<number> => {
    // This is a placeholder - implement with Stockfish or other chess engine
    return Math.random() * 2 - 1; // Random evaluation between -1 and 1
  };

  // Generate move comments based on evaluation
  const generateMoveComment = (move: any, evaluation: number): string => {
    if (evaluation > 0.5) return 'Excellent move!';
    if (evaluation > 0.2) return 'Good move';
    if (evaluation > -0.2) return 'Equal position';
    if (evaluation > -0.5) return 'Inaccurate';
    return 'Mistake';
  };

  const getEvaluationColor = (evaluation: number): string => {
    if (evaluation > 0.5) return 'text-green-500';
    if (evaluation > 0.2) return 'text-green-400';
    if (evaluation > -0.2) return 'text-gray-400';
    if (evaluation > -0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getEvaluationText = (evaluation: number): string => {
    if (evaluation > 0.5) return 'Excellent';
    if (evaluation > 0.2) return 'Good';
    if (evaluation > -0.2) return 'Equal';
    if (evaluation > -0.5) return 'Inaccurate';
    return 'Mistake';
  };

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
            <div className="text-center mb-8">
              <Upload className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">PGN Analysis</h1>
              <p className="text-gray-300">
                Upload a PGN file to analyze your chess game with AI insights
              </p>
            </div>

            <motion.div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
                isDragging 
                  ? 'border-blue-500 bg-blue-500/20' 
                  : 'border-white/20 hover:border-white/40'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">{dragText}</p>
              <p className="text-gray-400 text-sm">
                Supports .pgn files with game notation
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pgn,.txt"
                onChange={handleFileInput}
                className="hidden"
              />
            </motion.div>

            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 text-center"
              >
                <div className="inline-flex items-center gap-2 text-blue-400">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  Analyzing game...
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center"
              >
                {error}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {analysis.whitePlayer} vs {analysis.blackPlayer}
              </h1>
              <p className="text-gray-300">{analysis.event} • {analysis.date}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportPGN}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={shareGame}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chess Board */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Game Board</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEvaluation(!showEvaluation)}
                    className={`p-2 rounded-lg transition-colors ${
                      showEvaluation ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {showEvaluation ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {/* Placeholder for chess board component */}
              <div className="aspect-square bg-white/5 rounded-lg border border-white/20 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                  <p>Chess Board Component</p>
                  <p className="text-sm">Position after move {currentMoveIndex + 1}</p>
                </div>
              </div>

              {/* Move Controls */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={goToStart}
                  disabled={currentMoveIndex === -1}
                  className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={previousMove}
                  disabled={currentMoveIndex === -1}
                  className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePlay}
                  className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button
                  onClick={nextMove}
                  disabled={currentMoveIndex === analysis.moves.length - 1}
                  className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={goToEnd}
                  disabled={currentMoveIndex === analysis.moves.length - 1}
                  className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Move List */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Move Analysis</h2>
              <button
                onClick={() => setShowComments(!showComments)}
                className={`p-2 rounded-lg transition-colors ${
                  showComments ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300'
                }`}
              >
                {showComments ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {analysis.moves.map((move, index) => (
                <motion.div
                  key={index}
                  onClick={() => goToMove(index)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    currentMoveIndex === index
                      ? 'bg-blue-600/30 border border-blue-500/50'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm w-8">
                        {Math.floor(index / 2) + 1}.
                      </span>
                      <div className="flex gap-2">
                        <span className={`font-mono ${
                          move.color === 'w' ? 'text-white' : 'text-gray-300'
                        }`}>
                          {move.san}
                        </span>
                        {showEvaluation && move.evaluation !== undefined && (
                          <span className={`text-xs ${getEvaluationColor(move.evaluation)}`}>
                            {getEvaluationText(move.evaluation)}
                          </span>
                        )}
                      </div>
                    </div>
                    {showEvaluation && move.evaluation !== undefined && (
                      <div className="text-xs text-gray-400">
                        {move.evaluation > 0 ? '+' : ''}{move.evaluation.toFixed(2)}
                      </div>
                    )}
                  </div>
                  {showComments && move.comment && (
                    <p className="text-xs text-gray-400 mt-1 ml-11">
                      {move.comment}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Game Statistics */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Game Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">Opening</span>
                  </div>
                  <p className="text-white text-sm">{analysis.opening}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm">Result</span>
                  </div>
                  <p className="text-white text-sm">{analysis.result}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Moves</span>
                  </div>
                  <p className="text-white text-sm">{analysis.moves.length}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">ECO</span>
                  </div>
                  <p className="text-white text-sm">{analysis.eco || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
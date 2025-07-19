'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
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
  BarChart3,
  BookOpen,
  Move,
  Clock,
  Users,
  Calendar
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface GameMove {
  move: string;
  san: string;
  fen: string;
  evaluation?: number;
  comment?: string;
}

interface GameAnalysis {
  moves: GameMove[];
  result: string;
  white: string;
  black: string;
  event: string;
  site: string;
  date: string;
  opening?: {
    name: string;
    eco: string;
  };
  evaluation: number[];
  accuracy: {
    white: number;
    black: number;
  };
}

export default function EnhancedPGNAnalysis() {
  const [game, setGame] = useState<Chess>(new Chess());
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [pgnText, setPgnText] = useState('');
  const [showEvaluation, setShowEvaluation] = useState(true);
  const [showComments, setShowComments] = useState(true);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(2000); // ms
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        loadPGN(content);
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.pgn'],
      'application/x-chess-pgn': ['.pgn']
    },
    multiple: false
  });

  const loadPGN = async (pgnContent: string) => {
    try {
      setIsAnalyzing(true);
      setPgnText(pgnContent);

      // Load the game
      const newGame = new Chess();
      newGame.loadPgn(pgnContent);
      setGame(newGame);

      // Analyze the game
      const gameAnalysis = await analyzeGame(newGame, pgnContent);
      setAnalysis(gameAnalysis);
      setCurrentMoveIndex(-1);
      setIsPlaying(false);

      // Stop any existing autoplay
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }

    } catch (error) {
      console.error('Error loading PGN:', error);
      alert('Invalid PGN format. Please check your file.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeGame = async (chessGame: Chess, pgn: string): Promise<GameAnalysis> => {
    // Extract game metadata
    const headers = chessGame.header();
    const moves = chessGame.history({ verbose: true });
    
    // Create move analysis
    const gameMoves: GameMove[] = [];
    const evaluation: number[] = [];
    
    // Analyze each position
    const tempGame = new Chess();
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      tempGame.move(move);
      
      // Calculate evaluation (simplified - in production, use a chess engine)
      const eval = calculatePositionEvaluation(tempGame);
      evaluation.push(eval);
      
      gameMoves.push({
        move: move.san,
        san: move.san,
        fen: tempGame.fen(),
        evaluation: eval,
        comment: generateMoveComment(move, eval, i)
      });
    }

    // Identify opening
    const opening = identifyOpening(pgn);

    // Calculate accuracy
    const accuracy = calculateAccuracy(evaluation);

    return {
      moves: gameMoves,
      result: chessGame.isCheckmate() ? 'Checkmate' : 
              chessGame.isDraw() ? 'Draw' : 
              chessGame.isStalemate() ? 'Stalemate' : 'Ongoing',
      white: headers.White || 'Unknown',
      black: headers.Black || 'Unknown',
      event: headers.Event || 'Unknown Event',
      site: headers.Site || 'Unknown Site',
      date: headers.Date || 'Unknown Date',
      opening,
      evaluation,
      accuracy
    };
  };

  const calculatePositionEvaluation = (chessGame: Chess): number => {
    // Simplified evaluation - in production, use Stockfish or similar
    const fen = chessGame.fen();
    const pieces = fen.split(' ')[0];
    
    let evaluation = 0;
    const pieceValues = {
      'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 0,
      'p': -1, 'n': -3, 'b': -3, 'r': -5, 'q': -9, 'k': 0
    };

    for (const char of pieces) {
      if (char in pieceValues) {
        evaluation += pieceValues[char as keyof typeof pieceValues];
      }
    }

    return evaluation / 10; // Normalize to reasonable range
  };

  const generateMoveComment = (move: any, evaluation: number, moveIndex: number): string => {
    const comments = [
      'Good move!',
      'Interesting position',
      'Tactical opportunity',
      'Positional advantage',
      'Defensive move',
      'Aggressive play',
      'Strategic planning',
      'Time pressure move'
    ];
    
    return comments[moveIndex % comments.length];
  };

  const identifyOpening = (pgn: string): { name: string; eco: string } | undefined => {
    // Simplified opening identification
    const openings = [
      { name: 'Sicilian Defense', eco: 'B20-B99', patterns: ['1.e4 c5'] },
      { name: 'French Defense', eco: 'C00-C19', patterns: ['1.e4 e6'] },
      { name: 'Caro-Kann Defense', eco: 'B10-B19', patterns: ['1.e4 c6'] },
      { name: 'Ruy Lopez', eco: 'C60-C99', patterns: ['1.e4 e5 2.Nf3 Nc6 3.Bb5'] },
      { name: 'Queen\'s Gambit', eco: 'D06-D69', patterns: ['1.d4 d5 2.c4'] },
      { name: 'King\'s Indian Defense', eco: 'E60-E99', patterns: ['1.d4 Nf6 2.c4 g6'] }
    ];

    const firstMoves = pgn.split('\n')[0].substring(0, 20);
    
    for (const opening of openings) {
      for (const pattern of opening.patterns) {
        if (firstMoves.includes(pattern)) {
          return { name: opening.name, eco: opening.eco };
        }
      }
    }

    return undefined;
  };

  const calculateAccuracy = (evaluation: number[]): { white: number; black: number } => {
    // Simplified accuracy calculation
    let whiteAccuracy = 0;
    let blackAccuracy = 0;
    
    for (let i = 0; i < evaluation.length; i++) {
      if (i % 2 === 0) { // White's move
        whiteAccuracy += Math.abs(evaluation[i]);
      } else { // Black's move
        blackAccuracy += Math.abs(evaluation[i]);
      }
    }

    return {
      white: Math.min(100, Math.max(0, 100 - whiteAccuracy * 10)),
      black: Math.min(100, Math.max(0, 100 - blackAccuracy * 10))
    };
  };

  const toggleAutoPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    } else {
      setIsPlaying(true);
      playNextMove();
    }
  };

  const playNextMove = () => {
    if (!analysis || currentMoveIndex >= analysis.moves.length - 1) {
      setIsPlaying(false);
      return;
    }

    const nextIndex = currentMoveIndex + 1;
    setCurrentMoveIndex(nextIndex);
    
    // Update board position
    const newGame = new Chess();
    for (let i = 0; i <= nextIndex; i++) {
      newGame.move(analysis.moves[i].move);
    }
    setGame(newGame);

    // Schedule next move
    if (isPlaying && nextIndex < analysis.moves.length - 1) {
      autoPlayRef.current = setTimeout(playNextMove, autoPlaySpeed);
    } else {
      setIsPlaying(false);
    }
  };

  const goToMove = (index: number) => {
    if (!analysis) return;

    setCurrentMoveIndex(index);
    setSelectedMove(index);
    
    const newGame = new Chess();
    for (let i = 0; i <= index; i++) {
      newGame.move(analysis.moves[i].move);
    }
    setGame(newGame);
  };

  const resetGame = () => {
    if (!analysis) return;
    
    setCurrentMoveIndex(-1);
    setSelectedMove(null);
    setIsPlaying(false);
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current);
    }
    
    const newGame = new Chess();
    setGame(newGame);
  };

  const exportPGN = () => {
    const pgn = game.pgn();
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-analysis.pgn';
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareGame = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Chess Game Analysis',
        text: `Check out this chess game analysis on TheChessWire!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Game URL copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">PGN Game Analysis</h1>
          <p className="text-gray-400">Upload a PGN file to analyze your chess game</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Game Info */}
          <div className="space-y-6">
            {/* File Upload */}
            <motion.div
              className="glass-morphism-dark rounded-lg p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-xl font-semibold mb-4">Upload PGN File</h2>
              
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-gray-600 hover:border-primary-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-300 mb-2">
                  {isDragActive ? 'Drop your PGN file here' : 'Drag & drop a PGN file here'}
                </p>
                <p className="text-sm text-gray-500">or click to browse</p>
              </div>

              {isAnalyzing && (
                <motion.div
                  className="mt-4 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Analyzing game...</span>
                </motion.div>
              )}
            </motion.div>

            {/* Game Information */}
            {analysis && (
              <motion.div
                className="glass-morphism-dark rounded-lg p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold mb-4">Game Information</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">White: {analysis.white}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Black: {analysis.black}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Date: {analysis.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Move className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Result: {analysis.result}</span>
                  </div>
                  
                  {analysis.opening && (
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">
                        Opening: {analysis.opening.name} ({analysis.opening.eco})
                      </span>
                    </div>
                  )}
                </div>

                {/* Accuracy */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Move Accuracy</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">White</span>
                      <span className="text-sm font-medium">{analysis.accuracy.white.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analysis.accuracy.white}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Black</span>
                      <span className="text-sm font-medium">{analysis.accuracy.black.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analysis.accuracy.black}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Center Column - Chess Board */}
          <div className="space-y-6">
            <motion.div
              className="glass-morphism-dark rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-4">
                <Chessboard
                  position={game.fen()}
                  boardWidth={400}
                  customBoardStyle={{
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-2 mb-4">
                <button
                  onClick={resetGame}
                  className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => goToMove(Math.max(-1, currentMoveIndex - 1))}
                  className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  title="Previous Move"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleAutoPlay}
                  className="p-2 bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => goToMove(Math.min(analysis?.moves.length - 1 || 0, currentMoveIndex + 1))}
                  className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  title="Next Move"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Control */}
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm text-gray-400">Speed:</span>
                <select
                  value={autoPlaySpeed}
                  onChange={(e) => setAutoPlaySpeed(Number(e.target.value))}
                  className="bg-gray-700 text-white text-sm rounded px-2 py-1"
                >
                  <option value={1000}>Fast</option>
                  <option value={2000}>Normal</option>
                  <option value={4000}>Slow</option>
                </select>
              </div>
            </motion.div>

            {/* Evaluation Chart */}
            {analysis && showEvaluation && (
              <motion.div
                className="glass-morphism-dark rounded-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Position Evaluation</h3>
                  <button
                    onClick={() => setShowEvaluation(!showEvaluation)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="h-32 bg-gray-800 rounded-lg p-2">
                  {/* Simplified evaluation chart */}
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Evaluation chart would go here
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Move List */}
          <div className="space-y-6">
            <motion.div
              className="glass-morphism-dark rounded-lg p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Move List</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="text-gray-400 hover:text-white"
                    title="Toggle Comments"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={exportPGN}
                    className="text-gray-400 hover:text-white"
                    title="Export PGN"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={shareGame}
                    className="text-gray-400 hover:text-white"
                    title="Share Game"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {analysis ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {analysis.moves.map((move, index) => (
                    <motion.div
                      key={index}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedMove === index
                          ? 'bg-primary-500/20 border border-primary-500'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                      onClick={() => goToMove(index)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-400 w-8">
                            {Math.floor(index / 2) + 1}.
                          </span>
                          <span className="font-medium">{move.san}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {move.evaluation !== undefined && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              move.evaluation > 0 ? 'bg-green-500/20 text-green-400' :
                              move.evaluation < 0 ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {move.evaluation > 0 ? '+' : ''}{move.evaluation.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {showComments && move.comment && (
                        <p className="text-xs text-gray-400 mt-1 ml-11">
                          {move.comment}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Upload a PGN file to see move analysis</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 
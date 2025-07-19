'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Play, Pause, SkipBack, SkipForward, Upload, Volume2, Settings, Eye, Brain } from 'lucide-react';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';

interface Move {
  move: string;
  san: string;
  fen: string;
  evaluation?: number;
  commentary?: string;
}

interface Game {
  id: string;
  title: string;
  players: {
    white: string;
    black: string;
  };
  result: string;
  date: string;
  event: string;
  moves: Move[];
}

export default function ReplayTheaterPage() {
  const [chess, setChess] = useState(new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2000);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [narrationMode, setNarrationMode] = useState<'calm' | 'expressive' | 'dramatic'>('expressive');
  
  const { playNarration, stopNarration, isLoading } = useVoiceNarration();
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sample games for demonstration
  const sampleGames: Game[] = [
    {
      id: '1',
      title: 'The Immortal Game',
      players: { white: 'Adolf Anderssen', black: 'Lionel Kieseritzky' },
      result: '1-0',
      date: '1851-06-21',
      event: 'London Tournament',
      moves: []
    },
    {
      id: '2', 
      title: 'Magnus vs Hikaru - 2024 Candidates',
      players: { white: 'Magnus Carlsen', black: 'Hikaru Nakamura' },
      result: '1/2-1/2',
      date: '2024-04-15',
      event: 'Candidates Tournament',
      moves: []
    }
  ];

  useEffect(() => {
    // Auto-play welcome narration
    const timer = setTimeout(() => {
      playNarration(
        "Welcome to Replay Theater, where chess games come alive with AI narration. Upload a PGN file or select a sample game to begin your cinematic journey.",
        'expressive'
      );
    }, 1000);

    return () => {
      clearTimeout(timer);
      stopNarration();
    };
  }, [playNarration, stopNarration]);

  useEffect(() => {
    if (isPlaying && selectedGame) {
      playIntervalRef.current = setInterval(() => {
        if (currentMoveIndex < selectedGame.moves.length - 1) {
          goToMove(currentMoveIndex + 1);
        } else {
          setIsPlaying(false);
          playNarration("Game complete! What a beautiful journey through the 64 squares.", 'dramatic');
        }
      }, playbackSpeed);
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, currentMoveIndex, selectedGame, playbackSpeed, playNarration]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const text = await file.text();
      const newChess = new Chess();
      newChess.loadPgn(text);
      
      const moves: Move[] = [];
      const history = newChess.history({ verbose: true });
      
      history.forEach((move, index) => {
        const tempChess = new Chess();
        for (let i = 0; i <= index; i++) {
          tempChess.move(history[i]);
        }
        
        moves.push({
          move: move.lan,
          san: move.san,
          fen: tempChess.fen(),
          evaluation: Math.random() * 2 - 1, // Mock evaluation
          commentary: generateMoveCommentary(move, index)
        });
      });

      const game: Game = {
        id: Date.now().toString(),
        title: `${newChess.header('White')} vs ${newChess.header('Black')}`,
        players: {
          white: newChess.header('White') || 'Unknown',
          black: newChess.header('Black') || 'Unknown'
        },
        result: newChess.header('Result') || '*',
        date: newChess.header('Date') || new Date().toISOString().split('T')[0],
        event: newChess.header('Event') || 'Unknown Event',
        moves
      };

      setSelectedGame(game);
      setChess(newChess);
      setCurrentMoveIndex(-1);
      
      playNarration(
        `Game loaded! ${game.title}. ${moves.length} moves to replay. Let's begin the cinematic journey.`,
        'expressive'
      );
    } catch (error) {
      console.error('Error loading PGN:', error);
      playNarration("Sorry, I couldn't load that PGN file. Please check the format and try again.", 'calm');
    } finally {
      setIsUploading(false);
    }
  };

  const generateMoveCommentary = (move: any, index: number): string => {
    const commentaries = [
      "A bold move that opens up the position.",
      "Strategic retreat to consolidate the position.",
      "Tactical shot that creates complications.",
      "Natural developing move.",
      "Sharp response to the previous move.",
      "Positional improvement.",
      "Tactical opportunity seized.",
      "Defensive resource found.",
      "Initiative maintained.",
      "Counterplay begins."
    ];
    
    return commentaries[index % commentaries.length];
  };

  const goToMove = (index: number) => {
    if (!selectedGame || index < -1 || index >= selectedGame.moves.length) return;
    
    setCurrentMoveIndex(index);
    
    if (index === -1) {
      setChess(new Chess());
    } else {
      const newChess = new Chess();
      for (let i = 0; i <= index; i++) {
        newChess.move(selectedGame.moves[i].move);
      }
      setChess(newChess);
      
      // Narrate the move
      const move = selectedGame.moves[index];
      const commentary = move.commentary || "Interesting move.";
      playNarration(
        `Move ${index + 1}: ${move.san}. ${commentary}`,
        narrationMode
      );
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const loadSampleGame = (game: Game) => {
    // Load sample game data (in real implementation, this would fetch from API)
    setSelectedGame(game);
    setChess(new Chess());
    setCurrentMoveIndex(-1);
    
    playNarration(
      `Loading ${game.title}. Get ready for an amazing replay experience.`,
      'expressive'
    );
  };

  return (
    <div className="min-h-screen chess-gradient-dark">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center mb-4">
            <motion.div
              className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center glow-effect"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Eye className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Replay Theater</h1>
          <p className="text-xl text-gray-300">Watch chess games come alive with AI narration</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Selection Panel */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Select Game</h2>
              
              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload PGN File
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pgn"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pgn-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="pgn-upload"
                    className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg cursor-pointer hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    {isUploading ? 'Uploading...' : 'Choose PGN File'}
                  </label>
                </div>
              </div>

              {/* Sample Games */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Sample Games</h3>
                <div className="space-y-3">
                  {sampleGames.map((game) => (
                    <motion.button
                      key={game.id}
                      onClick={() => loadSampleGame(game)}
                      className="w-full text-left p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-semibold text-white">{game.title}</div>
                      <div className="text-sm text-gray-400">
                        {game.players.white} vs {game.players.black}
                      </div>
                      <div className="text-xs text-gray-500">{game.event}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Chessboard */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              {selectedGame ? (
                <>
                  {/* Game Info */}
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedGame.title}</h2>
                    <div className="text-gray-300">
                      {selectedGame.players.white} vs {selectedGame.players.black} • {selectedGame.event}
                    </div>
                  </div>

                  {/* Chessboard */}
                  <div className="mb-6">
                    <Chessboard
                      position={chess.fen()}
                      boardWidth={400}
                      customBoardStyle={{
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                      }}
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <motion.button
                      onClick={() => goToMove(-1)}
                      className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <SkipBack className="w-5 h-5 text-white" />
                    </motion.button>
                    
                    <motion.button
                      onClick={togglePlayback}
                      className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white" />
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => goToMove(selectedGame.moves.length - 1)}
                      className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <SkipForward className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>

                  {/* Move List */}
                  <div className="max-h-40 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2">
                      {selectedGame.moves.map((move, index) => (
                        <motion.button
                          key={index}
                          onClick={() => goToMove(index)}
                          className={`p-2 text-left rounded ${
                            index === currentMoveIndex
                              ? 'bg-blue-500/20 border border-blue-500/50'
                              : 'bg-white/5 hover:bg-white/10'
                          } transition-all duration-200`}
                          whileHover={{ scale: 1.02 }}
                        >
                          <span className="text-gray-400 text-sm">{Math.floor(index / 2) + 1}.</span>
                          <span className="text-white ml-2">{move.san}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Eye className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Game Selected</h3>
                  <p className="text-gray-500">Upload a PGN file or select a sample game to begin</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Settings Panel */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Theater Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Playback Speed */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Playback Speed
                </label>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={1000}>Fast (1s)</option>
                  <option value={2000}>Normal (2s)</option>
                  <option value={3000}>Slow (3s)</option>
                  <option value={5000}>Very Slow (5s)</option>
                </select>
              </div>

              {/* Narration Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Narration Style
                </label>
                <select
                  value={narrationMode}
                  onChange={(e) => setNarrationMode(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="calm">Calm</option>
                  <option value="expressive">Expressive</option>
                  <option value="dramatic">Dramatic</option>
                </select>
              </div>

              {/* Analysis Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Show Analysis
                </label>
                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 ${
                    showAnalysis
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <Brain className="w-4 h-4 inline mr-2" />
                  {showAnalysis ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
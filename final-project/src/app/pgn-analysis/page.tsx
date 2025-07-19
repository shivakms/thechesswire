'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Play, Pause, SkipBack, SkipForward, Download, Share2, Volume2 } from 'lucide-react';
import { Chess } from 'chess.js';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';
import { ChessBoard } from '@/components/ChessBoard';

interface Move {
  move: string;
  san: string;
  fen: string;
  evaluation?: number;
  comment?: string;
}

export default function PGNAnalysisPage() {
  const [chess, setChess] = useState(new Chess());
  const [moves, setMoves] = useState<Move[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pgnText, setPgnText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { playNarration } = useVoiceNarration();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        loadPGN(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.pgn')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        loadPGN(content);
      };
      reader.readAsText(file);
    }
  };

  const loadPGN = (pgnContent: string) => {
    try {
      const newChess = new Chess();
      newChess.loadPgn(pgnContent);
      
      const gameMoves: Move[] = [];
      const history = newChess.history({ verbose: true });
      
      history.forEach((move, index) => {
        const tempChess = new Chess();
        // Replay moves up to this point
        for (let i = 0; i <= index; i++) {
          tempChess.move(history[i]);
        }
        
        gameMoves.push({
          move: move.lan,
          san: move.san,
          fen: tempChess.fen(),
        });
      });

      setChess(newChess);
      setMoves(gameMoves);
      setCurrentMoveIndex(-1);
      setPgnText(pgnContent);
      
      // Auto-narrate the game
      narrateGame(gameMoves);
    } catch (error) {
      console.error('Error loading PGN:', error);
    }
  };

  const narrateGame = (gameMoves: Move[]) => {
    if (gameMoves.length === 0) return;
    
    const narration = `I'm analyzing a chess game with ${gameMoves.length} moves. This appears to be a ${gameMoves.length < 20 ? 'short' : gameMoves.length < 40 ? 'medium' : 'long'} game. Let me walk you through the key moments.`;
    
    playNarration(narration, 'calm');
  };

  const goToMove = (index: number) => {
    if (index < -1 || index >= moves.length) return;
    
    setCurrentMoveIndex(index);
    
    if (index === -1) {
      setChess(new Chess());
    } else {
      const newChess = new Chess();
      for (let i = 0; i <= index; i++) {
        newChess.move(moves[i].move);
      }
      setChess(newChess);
    }
  };

  const playMove = () => {
    if (currentMoveIndex >= moves.length - 1) {
      setIsPlaying(false);
      return;
    }
    
    goToMove(currentMoveIndex + 1);
    
    if (isPlaying) {
      setTimeout(() => playMove(), 2000);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playMove();
    }
  };

  const analyzePosition = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/chess/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen: chess.fen() }),
      });
      
      if (response.ok) {
        const analysisData = await response.json();
        setAnalysis(analysisData);
        
        // Narrate the analysis
        const narration = `Position analysis complete. The evaluation is ${analysisData.evaluation}, and the best move is ${analysisData.bestMove}. ${analysisData.comment}`;
        playNarration(narration, 'expressive');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportPGN = () => {
    const pgn = chess.pgn();
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game.pgn';
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareGame = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Chess Game Analysis',
        text: 'Check out this chess game analysis on TheChessWire.news',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen chess-gradient-dark p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">PGN Analysis</h1>
          <p className="text-xl text-gray-300">Upload and analyze your chess games with AI insights</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chess Board */}
          <div className="lg:col-span-2">
            <motion.div
              className="glass-morphism-dark rounded-2xl p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Game Board</h2>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={analyzePosition}
                    disabled={isAnalyzing}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                  </motion.button>
                  <motion.button
                    onClick={() => playNarration('Current position analysis. The position is ' + (chess.isCheck() ? 'in check' : 'normal') + '.', 'calm')}
                    className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Volume2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <ChessBoard position={chess.fen()} />
              </div>

              {/* Analysis Results */}
              {analysis && (
                <motion.div
                  className="bg-gray-800 rounded-lg p-4 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-2">Position Analysis</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Evaluation:</span>
                      <span className="text-white ml-2">{analysis.evaluation}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Best Move:</span>
                      <span className="text-white ml-2">{analysis.bestMove}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 mt-2">{analysis.comment}</p>
                </motion.div>
              )}

              {/* Game Controls */}
              <div className="flex justify-center items-center space-x-4">
                <motion.button
                  onClick={() => goToMove(-1)}
                  className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SkipBack className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  onClick={() => goToMove(currentMoveIndex - 1)}
                  disabled={currentMoveIndex <= -1}
                  className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SkipBack className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  onClick={togglePlay}
                  className="p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </motion.button>
                
                <motion.button
                  onClick={() => goToMove(currentMoveIndex + 1)}
                  disabled={currentMoveIndex >= moves.length - 1}
                  className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SkipForward className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  onClick={() => goToMove(moves.length - 1)}
                  className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SkipForward className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* File Upload */}
            <motion.div
              className="glass-morphism-dark rounded-2xl p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Upload PGN</h3>
              
              <div
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">Drop PGN file here or click to browse</p>
                <p className="text-sm text-gray-500">Supports .pgn files</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pgn"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <textarea
                value={pgnText}
                onChange={(e) => setPgnText(e.target.value)}
                placeholder="Or paste PGN text here..."
                className="w-full mt-4 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={6}
              />
              
              <motion.button
                onClick={() => loadPGN(pgnText)}
                disabled={!pgnText.trim()}
                className="w-full mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Load Game
              </motion.button>
            </motion.div>

            {/* Move List */}
            <motion.div
              className="glass-morphism-dark rounded-2xl p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Move List</h3>
              
              {moves.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No moves loaded</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {moves.map((move, index) => (
                    <motion.button
                      key={index}
                      onClick={() => goToMove(index)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        currentMoveIndex === index
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="font-mono">
                        {Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : '..'} {move.san}
                      </span>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Export Options */}
            <motion.div
              className="glass-morphism-dark rounded-2xl p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Export & Share</h3>
              
              <div className="space-y-3">
                <motion.button
                  onClick={exportPGN}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download className="w-4 h-4" />
                  <span>Export PGN</span>
                </motion.button>
                
                <motion.button
                  onClick={shareGame}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Game</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 
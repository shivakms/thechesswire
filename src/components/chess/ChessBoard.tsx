import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Volume2, VolumeX, Settings, Maximize2 } from 'lucide-react';
import { EmotionHeatmap } from './EmotionHeatmap';
import { PGNEmotionClassifier, EmotionHeatmap as EmotionHeatmapType } from '@/lib/analysis/PGNEmotionClassifier';

interface ChessBoardProps {
  pgn?: string;
  onMoveChange?: (move: string, fen: string) => void;
  showControls?: boolean;
  className?: string;
}

export function ChessBoard({ 
  pgn = '', 
  onMoveChange, 
  showControls = true,
  className = ''
}: ChessBoardProps) {
  const [game, setGame] = useState(() => new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [moveHistory, setMoveHistory] = useState<Array<{san: string; after: string}>>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoPlayActive, setAutoPlayActive] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [emotionHeatmap, setEmotionHeatmap] = useState<EmotionHeatmapType | null>(null);
  const [showEmotionHeatmap, setShowEmotionHeatmap] = useState(true);

  useEffect(() => {
    if (pgn && pgn !== game.pgn()) {
      try {
        const newGame = new Chess();
        newGame.loadPgn(pgn);
        setGame(newGame);
        setMoveHistory(newGame.history({ verbose: true }));
        setCurrentMoveIndex(newGame.history().length - 1);
        
        PGNEmotionClassifier.classifyPGN(pgn)
          .then(setEmotionHeatmap)
          .catch(error => {
            console.warn('Failed to load emotion analysis:', error);
            setEmotionHeatmap(null);
          });
      } catch (error) {
        console.error('Invalid PGN:', error);
      }
    }
  }, [pgn, game]);

  const currentPosition = useMemo(() => {
    if (currentMoveIndex < 0) {
      return new Chess().fen();
    }
    
    const tempGame = new Chess();
    try {
      tempGame.loadPgn(pgn);
      const moves = tempGame.history();
      
      const replayGame = new Chess();
      for (let i = 0; i <= currentMoveIndex && i < moves.length; i++) {
        replayGame.move(moves[i]);
      }
      return replayGame.fen();
    } catch (error) {
      console.error('Error calculating position:', error);
      return new Chess().fen();
    }
  }, [currentMoveIndex, pgn]);

  const goToMove = useCallback((moveIndex: number) => {
    const clampedIndex = Math.max(-1, Math.min(moveIndex, moveHistory.length - 1));
    setCurrentMoveIndex(clampedIndex);
    
    if (onMoveChange && moveHistory[clampedIndex]) {
      const move = moveHistory[clampedIndex];
      onMoveChange(move.san, move.after);
    }
  }, [moveHistory, onMoveChange]);

  const nextMove = useCallback(() => {
    if (currentMoveIndex < moveHistory.length - 1) {
      goToMove(currentMoveIndex + 1);
    }
  }, [currentMoveIndex, moveHistory.length, goToMove]);

  const previousMove = useCallback(() => {
    goToMove(currentMoveIndex - 1);
  }, [currentMoveIndex, goToMove]);

  const resetToStart = useCallback(() => {
    goToMove(-1);
  }, [goToMove]);

  useEffect(() => {
    if (autoPlayActive && currentMoveIndex < moveHistory.length - 1) {
      const timer = setTimeout(nextMove, 1000);
      return () => clearTimeout(timer);
    } else if (autoPlayActive && currentMoveIndex >= moveHistory.length - 1) {
      setAutoPlayActive(false);
    }
  }, [autoPlayActive, currentMoveIndex, moveHistory.length, nextMove]);

  const toggleAutoPlay = useCallback(() => {
    setAutoPlayActive(!autoPlayActive);
  }, [autoPlayActive]);

  if (!showControls) {
    return (
      <div className={`chess-board-container ${className}`}>
        <Chessboard
          position={currentPosition}
          boardOrientation={isFlipped ? 'black' : 'white'}
          arePiecesDraggable={false}
          boardWidth={400}
        />
      </div>
    );
  }

  return (
    <div className={`chess-board-container ${className}`}>
      <div className="bg-gradient-to-br from-[#0A0F1C] to-[#162236] rounded-lg border border-[#40E0D0]/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#40E0D0]">Chess Replay</h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                voiceEnabled 
                  ? 'bg-[#40E0D0]/20 text-[#40E0D0]' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              title="Toggle Voice"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setShowEmotionHeatmap(!showEmotionHeatmap)}
              className={`p-2 rounded-lg transition-colors ${
                showEmotionHeatmap 
                  ? 'bg-[#40E0D0]/20 text-[#40E0D0]' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              title="Toggle Emotion Heatmap"
            >
              <span className="w-4 h-4 flex items-center justify-center text-xs">📊</span>
            </button>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Chessboard
              position={currentPosition}
              boardOrientation={isFlipped ? 'black' : 'white'}
              arePiecesDraggable={false}
              boardWidth={isFullscreen ? 600 : 400}
            />
            
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={resetToStart}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Reset to Start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              <button
                onClick={previousMove}
                disabled={currentMoveIndex <= -1}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                title="Previous Move"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              
              <button
                onClick={toggleAutoPlay}
                className={`p-2 rounded-lg transition-colors ${
                  autoPlayActive 
                    ? 'bg-[#40E0D0]/20 text-[#40E0D0]' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                title={autoPlayActive ? 'Pause' : 'Play'}
              >
                {autoPlayActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              
              <button
                onClick={nextMove}
                disabled={currentMoveIndex >= moveHistory.length - 1}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                title="Next Move"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Flip Board"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-center mt-2 text-sm text-white/60">
              Move {currentMoveIndex + 1} of {moveHistory.length}
            </div>
          </div>
        </div>
        
        {showEmotionHeatmap && emotionHeatmap && (
          <div className="mt-4">
            <EmotionHeatmap
              heatmap={emotionHeatmap}
              currentMove={currentMoveIndex + 1}
              onMoveSelect={(moveNumber) => {
                const targetIndex = moveNumber - 1;
                if (targetIndex >= 0 && targetIndex < moveHistory.length) {
                  setCurrentMoveIndex(targetIndex);
                  goToMove(targetIndex);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

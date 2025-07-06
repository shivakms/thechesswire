'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { PGNAnalysis } from '../../lib/chess/PGNAnalyzer';

interface InteractiveChessboardProps {
  pgn?: string;
  analysis?: PGNAnalysis;
  onMoveSelect?: (moveIndex: number) => void;
  showAnnotations?: boolean;
  accessLevel?: 'freemium' | 'premium';
  autoPlay?: boolean;
  playbackSpeed?: number;
}

export default function InteractiveChessboard({
  pgn,
  analysis,
  onMoveSelect,
  showAnnotations = true,
  accessLevel = 'freemium',
  autoPlay = false,
  playbackSpeed = 1.0
}: InteractiveChessboardProps) {
  const [chess] = useState(new Chess());
  const [currentPosition, setCurrentPosition] = useState(chess.fen());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [moves, setMoves] = useState<Array<{ from: string; to: string; san: string }>>([]);

  useEffect(() => {
    if (pgn) {
      chess.reset();
      chess.loadPgn(pgn);
      const history = chess.history({ verbose: true });
      setMoves(history);
      chess.reset();
      setCurrentPosition(chess.fen());
      setCurrentMoveIndex(-1);
    }
  }, [pgn, chess]);

  const playGame = useCallback(async () => {
    if (accessLevel === 'freemium') {
      return;
    }

    setIsPlaying(true);
    chess.reset();
    setCurrentPosition(chess.fen());

    for (let i = 0; i < moves.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000 / playbackSpeed));
      
      if (!isPlaying) break;
      
      chess.move(moves[i]);
      setCurrentPosition(chess.fen());
      setCurrentMoveIndex(i);
      onMoveSelect?.(i);
    }

    setIsPlaying(false);
  }, [accessLevel, moves, isPlaying, playbackSpeed, onMoveSelect, chess]);

  useEffect(() => {
    if (autoPlay && moves.length > 0 && !isPlaying) {
      playGame();
    }
  }, [autoPlay, moves, isPlaying, playGame]);

  const goToMove = (moveIndex: number) => {
    chess.reset();
    
    for (let i = 0; i <= moveIndex; i++) {
      if (moves[i]) {
        chess.move(moves[i]);
      }
    }
    
    setCurrentPosition(chess.fen());
    setCurrentMoveIndex(moveIndex);
    onMoveSelect?.(moveIndex);
  };

  const nextMove = () => {
    if (currentMoveIndex < moves.length - 1) {
      goToMove(currentMoveIndex + 1);
    }
  };

  const previousMove = () => {
    if (currentMoveIndex >= 0) {
      goToMove(currentMoveIndex - 1);
    }
  };

  const resetToStart = () => {
    goToMove(-1);
  };

  const goToEnd = () => {
    goToMove(moves.length - 1);
  };

  const togglePlayback = () => {
    if (accessLevel === 'freemium') {
      return;
    }
    
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      playGame();
    }
  };

  const getCurrentAnnotation = () => {
    if (!analysis || currentMoveIndex < 0 || !analysis.moves[currentMoveIndex]) {
      return null;
    }
    
    const move = analysis.moves[currentMoveIndex];
    return {
      annotation: move.annotation,
      isBlunder: move.isBlunder,
      isBrilliant: move.isBrilliant,
      tacticalTheme: move.tacticalTheme,
      evaluation: move.evaluation
    };
  };

  const getMoveHighlights = () => {
    if (currentMoveIndex < 0 || !moves[currentMoveIndex]) {
      return {};
    }

    const move = moves[currentMoveIndex];
    return {
      [move.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
      [move.to]: { backgroundColor: 'rgba(255, 255, 0, 0.6)' }
    };
  };

  const currentAnnotation = getCurrentAnnotation();

  return (
    <div className="space-y-6">
      <div className="relative">
        <Chessboard
          options={{
            position: currentPosition,
            squareStyles: getMoveHighlights(),
            boardOrientation: "white",
            allowDragging: false
          }}
        />
        
        {accessLevel === 'freemium' && autoPlay && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <div className="bg-white p-4 rounded-lg text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Premium Feature</h3>
              <p className="text-gray-600 text-sm">Auto-play and cinematic replay require premium access</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={resetToStart}
          className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          disabled={currentMoveIndex < 0}
        >
          ⏮️
        </button>
        
        <button
          onClick={previousMove}
          className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          disabled={currentMoveIndex < 0}
        >
          ⏪
        </button>
        
        <button
          onClick={togglePlayback}
          className={`px-4 py-2 rounded transition-colors ${
            accessLevel === 'premium' 
              ? 'bg-purple-600 text-white hover:bg-purple-700' 
              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
          }`}
          disabled={accessLevel === 'freemium'}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <button
          onClick={nextMove}
          className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          disabled={currentMoveIndex >= moves.length - 1}
        >
          ⏩
        </button>
        
        <button
          onClick={goToEnd}
          className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          disabled={currentMoveIndex >= moves.length - 1}
        >
          ⏭️
        </button>
      </div>

      {moves.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Move {currentMoveIndex + 1} of {moves.length}
          {accessLevel === 'premium' && (
            <div className="mt-2">
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={playbackSpeed}
                onChange={() => {}}
                className="w-32"
              />
              <span className="ml-2">{playbackSpeed}x speed</span>
            </div>
          )}
        </div>
      )}

      {showAnnotations && currentAnnotation && (
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
          <div className="flex items-center space-x-2 mb-2">
            {currentAnnotation.isBrilliant && (
              <span className="px-2 py-1 bg-yellow-500 text-black text-xs rounded font-semibold">
                BRILLIANT!
              </span>
            )}
            {currentAnnotation.isBlunder && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded font-semibold">
                BLUNDER
              </span>
            )}
            {currentAnnotation.tacticalTheme && (
              <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">
                {currentAnnotation.tacticalTheme.toUpperCase()}
              </span>
            )}
          </div>
          
          <p className="text-gray-300 text-sm mb-2">{currentAnnotation.annotation}</p>
          
          {currentAnnotation.evaluation !== undefined && (
            <div className="text-xs text-gray-400">
              Evaluation: {currentAnnotation.evaluation > 0 ? '+' : ''}{currentAnnotation.evaluation}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
        {moves.map((move, index) => (
          <button
            key={index}
            onClick={() => goToMove(index)}
            className={`p-1 text-xs rounded transition-colors ${
              index === currentMoveIndex
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {Math.ceil((index + 1) / 2)}.{index % 2 === 0 ? '' : '..'} {move.san}
          </button>
        ))}
      </div>
    </div>
  );
}

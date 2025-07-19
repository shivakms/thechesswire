'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { ChessGame, AnnotatedMove } from '@/lib/KimiChessBrain';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

interface ReplayBoardProps {
  gameData: ChessGame;
  className?: string;
  showAnnotations?: boolean;
  allowUserAnnotations?: boolean;
}

export default function ReplayBoard({
  gameData,
  className = '',
  showAnnotations = true,
  allowUserAnnotations = false
}: ReplayBoardProps) {
  const [chess, setChess] = useState<Chess>(new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2000); // ms per move
  const [showComments, setShowComments] = useState(true);
  const [userAnnotations, setUserAnnotations] = useState<{[key: number]: string}>({});
  const [isMuted, setIsMuted] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize chess position
  useEffect(() => {
    const newChess = new Chess();
    setChess(newChess);
    setCurrentMoveIndex(-1);
  }, [gameData]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && currentMoveIndex < gameData.moves.length - 1) {
      playIntervalRef.current = setTimeout(() => {
        setCurrentMoveIndex(prev => prev + 1);
      }, playbackSpeed);
    } else if (currentMoveIndex >= gameData.moves.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (playIntervalRef.current) {
        clearTimeout(playIntervalRef.current);
      }
    };
  }, [isPlaying, currentMoveIndex, playbackSpeed, gameData.moves.length]);

  // Apply moves up to current index
  useEffect(() => {
    const newChess = new Chess();
    
    for (let i = 0; i <= currentMoveIndex; i++) {
      const move = gameData.moves[i];
      if (move.whiteMove) {
        try {
          newChess.move(move.whiteMove.san);
        } catch (error) {
          console.error('Invalid white move:', move.whiteMove.san);
        }
      }
      if (move.blackMove) {
        try {
          newChess.move(move.blackMove.san);
        } catch (error) {
          console.error('Invalid black move:', move.blackMove.san);
        }
      }
    }
    
    setChess(newChess);
  }, [currentMoveIndex, gameData.moves]);

  const handleMoveClick = (moveIndex: number) => {
    setCurrentMoveIndex(moveIndex);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const goToStart = () => {
    setCurrentMoveIndex(-1);
    setIsPlaying(false);
  };

  const goToEnd = () => {
    setCurrentMoveIndex(gameData.moves.length - 1);
    setIsPlaying(false);
  };

  const nextMove = () => {
    if (currentMoveIndex < gameData.moves.length - 1) {
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  };

  const previousMove = () => {
    if (currentMoveIndex > -1) {
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
  };

  const addUserAnnotation = (moveIndex: number, annotation: string) => {
    if (allowUserAnnotations) {
      setUserAnnotations(prev => ({
        ...prev,
        [moveIndex]: annotation
      }));
    }
  };

  const getSquareColor = (square: string) => {
    const piece = chess.get(square as any);
    if (!piece) return 'bg-gray-200';
    return piece.color === 'w' ? 'bg-yellow-200' : 'bg-red-200';
  };

  const renderSquare = (square: string) => {
    const piece = chess.get(square as any);
    const isLight = (square.charCodeAt(0) + parseInt(square[1])) % 2 === 0;
    
    return (
      <div
        key={square}
        className={`
          w-12 h-12 flex items-center justify-center text-2xl
          ${isLight ? 'bg-yellow-100' : 'bg-orange-800'}
          ${getSquareColor(square)}
          cursor-pointer hover:bg-blue-200 transition-colors
        `}
      >
        {piece && (
          <span className={piece.color === 'w' ? 'text-white' : 'text-black'}>
            {getPieceSymbol(piece.type, piece.color)}
          </span>
        )}
      </div>
    );
  };

  const getPieceSymbol = (type: string, color: string) => {
    const symbols: {[key: string]: string} = {
      'k': color === 'w' ? '♔' : '♚',
      'q': color === 'w' ? '♕' : '♛',
      'r': color === 'w' ? '♖' : '♜',
      'b': color === 'w' ? '♗' : '♝',
      'n': color === 'w' ? '♘' : '♞',
      'p': color === 'w' ? '♙' : '♟'
    };
    return symbols[type] || '';
  };

  const renderBoard = () => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    
    return (
      <div className="relative">
        {/* File labels */}
        <div className="flex justify-center mb-2">
          {files.map(file => (
            <div key={file} className="w-12 text-center text-sm font-medium">
              {file}
            </div>
          ))}
        </div>
        
        {/* Board */}
        <div className="flex">
          {/* Rank labels */}
          <div className="flex flex-col justify-center mr-2">
            {ranks.map(rank => (
              <div key={rank} className="h-12 flex items-center justify-center text-sm font-medium">
                {rank}
              </div>
            ))}
          </div>
          
          {/* Chess board */}
          <div className="grid grid-cols-8 border-2 border-gray-800">
            {ranks.map(rank =>
              files.map(file => renderSquare(file + rank))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMoveList = () => {
    return (
      <div className="max-h-96 overflow-y-auto">
        {gameData.moves.map((move, index) => (
          <div
            key={index}
            className={`
              p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-50
              ${currentMoveIndex === index ? 'bg-blue-100 border-blue-300' : ''}
            `}
            onClick={() => handleMoveClick(index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-600">{move.moveNumber}.</span>
                {move.whiteMove && (
                  <span className="font-mono">
                    {move.whiteMove.san}
                    {move.whiteMove.annotation && (
                      <span className="text-blue-600 ml-1">{move.whiteMove.annotation}</span>
                    )}
                  </span>
                )}
                {move.blackMove && (
                  <span className="font-mono ml-4">
                    {move.blackMove.san}
                    {move.blackMove.annotation && (
                      <span className="text-blue-600 ml-1">{move.blackMove.annotation}</span>
                    )}
                  </span>
                )}
              </div>
              
              {allowUserAnnotations && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const annotation = prompt('Add annotation:');
                    if (annotation) {
                      addUserAnnotation(index, annotation);
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-blue-600"
                >
                  + Note
                </button>
              )}
            </div>
            
            {/* Comments */}
            {showComments && (move.comments?.length || userAnnotations[index]) && (
              <div className="mt-1 text-sm text-gray-600">
                {move.comments?.map((comment, i) => (
                  <div key={i} className="italic">"{comment}"</div>
                ))}
                {userAnnotations[index] && (
                  <div className="text-blue-600 font-medium">Note: {userAnnotations[index]}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderControls = () => {
    return (
      <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <button
          onClick={goToStart}
          disabled={currentMoveIndex === -1}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        
        <button
          onClick={previousMove}
          disabled={currentMoveIndex === -1}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        
        <button
          onClick={togglePlay}
          className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        
        <button
          onClick={nextMove}
          disabled={currentMoveIndex >= gameData.moves.length - 1}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          <SkipForward className="w-4 h-4" />
        </button>
        
        <button
          onClick={goToEnd}
          disabled={currentMoveIndex >= gameData.moves.length - 1}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          <SkipForward className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded hover:bg-gray-200"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    );
  };

  const renderTimeline = () => {
    const progress = gameData.moves.length > 0 
      ? ((currentMoveIndex + 1) / gameData.moves.length) * 100 
      : 0;

    return (
      <div className="w-full">
        <input
          type="range"
          min="0"
          max={Math.max(0, gameData.moves.length - 1)}
          value={currentMoveIndex}
          onChange={(e) => setCurrentMoveIndex(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Move {currentMoveIndex + 1}</span>
          <span>of {gameData.moves.length}</span>
        </div>
      </div>
    );
  };

  if (gameData.error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Game</h3>
        <p className="text-red-600">{gameData.errorReason}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{gameData.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{gameData.summary}</p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chess Board */}
          <div className="flex flex-col items-center">
            {renderBoard()}
            
            {/* Game Info */}
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{gameData.metadata.white || 'White'}</span>
                {' vs '}
                <span className="font-medium">{gameData.metadata.black || 'Black'}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {gameData.metadata.event && `${gameData.metadata.event} • `}
                {gameData.metadata.date && new Date(gameData.metadata.date).getFullYear()}
              </div>
            </div>
          </div>

          {/* Move List */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Move List</h4>
              <div className="flex items-center space-x-2">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={showComments}
                    onChange={(e) => setShowComments(e.target.checked)}
                    className="mr-2"
                  />
                  Show Comments
                </label>
              </div>
            </div>
            
            {renderMoveList()}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6">
          {renderControls()}
        </div>

        {/* Timeline */}
        <div className="mt-4">
          {renderTimeline()}
        </div>

        {/* Opening Info */}
        {gameData.opening.name && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-1">Opening: {gameData.opening.name}</h4>
            <p className="text-sm text-blue-700">{gameData.opening.description}</p>
          </div>
        )}

        {/* Tactical Highlights */}
        {gameData.tacticalHighlights.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Tactical Highlights</h4>
            <div className="space-y-2">
              {gameData.tacticalHighlights.map((highlight, index) => (
                <div
                  key={index}
                  className="p-2 bg-yellow-50 border border-yellow-200 rounded cursor-pointer hover:bg-yellow-100"
                  onClick={() => handleMoveClick(highlight.moveNumber - 1)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Move {highlight.moveNumber}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      highlight.type === 'brilliant' ? 'bg-green-100 text-green-800' :
                      highlight.type === 'blunder' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {highlight.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
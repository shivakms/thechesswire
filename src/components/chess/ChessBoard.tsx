import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

type PieceDropHandlerArgs = {
  piece: unknown;
  sourceSquare: string;
  targetSquare: string;
};

interface ChessBoardProps {
  pgn?: string;
  position?: string;
  width?: number;
  interactive?: boolean;
  showCoordinates?: boolean;
  onMove?: (move: string) => void;
}

export default function ChessBoard({ 
  pgn, 
  position, 
  width = 400, 
  interactive = false,
  onMove 
}: ChessBoardProps) {
  const [game, setGame] = useState(new Chess());
  const [currentPosition, setCurrentPosition] = useState(position || 'start');

  useEffect(() => {
    const newGame = new Chess();
    
    if (pgn) {
      try {
        newGame.loadPgn(pgn);
        setCurrentPosition(newGame.fen());
      } catch (error) {
        console.error('Invalid PGN:', error);
        setCurrentPosition('start');
      }
    } else if (position) {
      try {
        newGame.load(position);
        setCurrentPosition(position);
      } catch (error) {
        console.error('Invalid position:', error);
        setCurrentPosition('start');
      }
    } else {
      setCurrentPosition('start');
    }
    
    setGame(newGame);
  }, [pgn, position]);

  const handleMove = ({ piece, sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    if (!interactive) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to queen for simplicity
      });

      if (move) {
        setCurrentPosition(game.fen());
        onMove?.(move.san);
        return true;
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
    
    return false;
  };

  return (
    <div className="chess-board-container">
      <Chessboard
        options={{
          position: currentPosition,
          boardStyle: { 
            width: `${width}px`, 
            height: `${width}px`,
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          },
          allowDragging: interactive,
          onPieceDrop: interactive ? handleMove : undefined,
          boardOrientation: "white",
          darkSquareStyle: { backgroundColor: '#779952' },
          lightSquareStyle: { backgroundColor: '#edeed1' }
        }}
      />
    </div>
  );
}

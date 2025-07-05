import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

type PieceDropHandlerArgs = {
  piece: {
    isSparePiece: boolean;
    position: string;
    pieceType: string;
  };
  sourceSquare: string;
  targetSquare: string | null;
};

interface ChessBoardProps {
  pgn?: string;
  position?: string;
  interactive?: boolean;
  showCoordinates?: boolean;
  onMove?: (move: string) => void;
}

export default function ChessBoard({ 
  pgn, 
  position, 
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

  const handlePieceDrop = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    if (!interactive || !targetSquare) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
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
          allowDragging: interactive,
          onPieceDrop: interactive ? handlePieceDrop : undefined,
          boardOrientation: "white",
          darkSquareStyle: { backgroundColor: '#779952' },
          lightSquareStyle: { backgroundColor: '#edeed1' }
        }}
      />
    </div>
  );
}

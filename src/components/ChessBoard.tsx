'use client';

import { motion } from 'framer-motion';

interface ChessBoardProps {
  position: string;
  size?: number;
}

export function ChessBoard({ position, size = 400 }: ChessBoardProps) {
  // Parse FEN position
  const fen = position.split(' ')[0];
  const ranks = fen.split('/');
  
  const renderSquare = (piece: string, isLight: boolean, rank: number, file: number) => {
    const squareName = String.fromCharCode(97 + file) + (8 - rank);
    
    return (
      <motion.div
        key={squareName}
        className={`w-12 h-12 flex items-center justify-center text-2xl ${
          isLight ? 'bg-amber-100' : 'bg-amber-800'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {piece && (
          <span className="select-none">
            {getPieceSymbol(piece)}
          </span>
        )}
      </motion.div>
    );
  };

  const getPieceSymbol = (piece: string) => {
    const symbols: { [key: string]: string } = {
      'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙',
      'K': '♚', 'Q': '♛', 'R': '♜', 'B': '♝', 'N': '♞', 'P': '♟'
    };
    return symbols[piece] || piece;
  };

  const renderBoard = () => {
    const squares = [];
    
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const isLight = (rank + file) % 2 === 0;
        const piece = getPieceAtPosition(ranks, rank, file);
        squares.push(renderSquare(piece, isLight, rank, file));
      }
    }
    
    return squares;
  };

  const getPieceAtPosition = (ranks: string[], rank: number, file: number) => {
    const rankStr = ranks[rank];
    if (!rankStr) return '';
    
    let fileIndex = 0;
    for (let i = 0; i < rankStr.length; i++) {
      const char = rankStr[i];
      if (char >= '1' && char <= '8') {
        fileIndex += parseInt(char);
      } else {
        if (fileIndex === file) {
          return char;
        }
        fileIndex++;
      }
    }
    return '';
  };

  return (
    <motion.div
      className="inline-grid grid-cols-8 border-2 border-gray-600 rounded-lg overflow-hidden shadow-2xl"
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {renderBoard()}
    </motion.div>
  );
} 
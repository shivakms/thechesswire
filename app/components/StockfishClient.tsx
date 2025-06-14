'use client'
import { useEffect, useState } from 'react';
const stockfish = typeof window !== 'undefined' ? require('stockfish') : null;

export default function StockfishClient({ fen }: { fen: string }) {
  const [bestMove, setBestMove] = useState<string | null>(null);

  useEffect(() => {
    if (!stockfish) return;

    const engine = stockfish();
    engine.onmessage = (event: any) => {
      const line = typeof event === 'string' ? event : event.data;
      if (line.startsWith('bestmove')) {
        const move = line.split(' ')[1];
        setBestMove(move);
      }
    };

    engine.postMessage('uci');
    engine.postMessage(`position fen ${fen}`);
    engine.postMessage('go depth 15');

    return () => engine.terminate?.(); // clean up
  }, [fen]);

  return (
    <div>
      <strong>FEN:</strong> {fen} <br />
      <strong>Best Move:</strong> {bestMove || 'Calculating...'}
    </div>
  );
}

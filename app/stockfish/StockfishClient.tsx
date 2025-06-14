'use client';
import { useEffect, useState } from 'react';
import stockfish from 'stockfish';

export default function StockfishClient({ fen }: { fen: string }) {
  const [bestMove, setBestMove] = useState<string | null>(null);

  useEffect(() => {
    const engine = stockfish();
    engine.onmessage = (event: any) => {
      const line = typeof event === 'string' ? event : event.data;
      if (line && line.startsWith('bestmove')) {
        const move = line.split(' ')[1];
        setBestMove(move);
      }
    };

    engine.postMessage('uci');
    engine.postMessage(`position fen ${fen}`);
    engine.postMessage('go depth 15');
  }, [fen]);

  return (
    <div>
      Best move for FEN:<br />
      <code>{fen}</code>
      <br />
      <strong>Best move:</strong> {bestMove || 'Calculating...'}
    </div>
  );
}

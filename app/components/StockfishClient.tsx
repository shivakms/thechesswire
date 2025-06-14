'use client';

import { useEffect, useState } from 'react';

export default function StockfishClient({ fen }: { fen: string }) {
  const [bestMove, setBestMove] = useState<string | null>(null);

  useEffect(() => {
    // Dynamic import — browser only
    import('stockfish.wasm').then((sf: any) => {
      const engine = sf.default();
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
    });
  }, [fen]);

  return (
    <div>
      <p><strong>FEN:</strong> {fen}</p>
      <p><strong>Best move:</strong> {bestMove || 'Calculating...'}</p>
    </div>
  );
}

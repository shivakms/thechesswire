'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

export default function StockfishClient({ fen }: { fen: string }) {
  const [bestMove, setBestMove] = useState<string | null>(null);

  useEffect(() => {
    // Only run in browser
    import('stockfish.wasm').then((sf: any) => {
      const engine = sf.default(); // Safe import of wasm module
      engine.onmessage = (event: any) => {
        const line = typeof event === 'string' ? event : event.data;
        if (line.startsWith('bestmove')) {
          setBestMove(line.split(' ')[1]);
        }
      };

      engine.postMessage('uci');
      engine.postMessage(`position fen ${fen}`);
      engine.postMessage('go depth 15');
    });
  }, [fen]);

  return (
    <div className="mt-4">
      <p>FEN:</p>
      <code className="block">{fen}</code>
      <p className="mt-2 font-bold">Best move: {bestMove || 'Calculating...'}</p>
    </div>
  );
}

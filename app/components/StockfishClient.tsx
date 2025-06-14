'use client';

import { useEffect, useState } from 'react';

export default function StockfishClient({ fen }: { fen: string }) {
  const [bestMove, setBestMove] = useState<string | null>(null);

  useEffect(() => {
    let engine: any = null;
    let isMounted = true;

    async function loadEngine() {
      if (typeof window !== 'undefined') {
        // Dynamically import stockfish.wasm only in the browser
        const stockfish = await import('stockfish.wasm');
        engine = stockfish.default();
        engine.onmessage = (event: any) => {
          const line = typeof event === 'string' ? event : event.data;
          if (line.startsWith('bestmove')) {
            const move = line.split(' ')[1];
            if (isMounted) setBestMove(move);
          }
        };
        engine.postMessage('uci');
        engine.postMessage(`position fen ${fen}`);
        engine.postMessage('go depth 15');
      }
    }

    loadEngine();

    return () => {
      isMounted = false;
      if (engine) engine.postMessage('quit');
    };
  }, [fen]);

  return (
    <div>
      <p><strong>FEN:</strong> {fen}</p>
      <p><strong>Best move:</strong> {bestMove || 'Calculating...'}</p>
    </div>
  );
}
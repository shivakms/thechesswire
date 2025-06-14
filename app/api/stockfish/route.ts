// File: /api/stockfish.js (for Vercel serverless function)

import { NextResponse } from 'next/server';
import Stockfish from 'stockfish';

export async function POST(req) {
  const { fen } = await req.json();

  return new Promise((resolve) => {
    const engine = Stockfish();
    let bestMove = '';

    engine.onmessage = (line) => {
      if (typeof line !== 'string') return;
      if (line.startsWith('bestmove')) {
        bestMove = line.split(' ')[1];
        resolve(NextResponse.json({ bestMove }));
      }
    };

    engine.postMessage('uci');
    engine.postMessage(`position fen ${fen}`);
    engine.postMessage('go depth 15');
  });
}

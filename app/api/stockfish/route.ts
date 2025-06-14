// File: /app/api/stockfish/route.ts

import { NextResponse } from 'next/server';
import stockfish from 'stockfish';

// For GET requests – confirms Stockfish is running
export async function GET() {
  const engine = stockfish();
  engine.postMessage('uci');

  return new Response('Stockfish initialized via WASM!');
}

// For POST requests – returns best move from given FEN
export async function POST(req: Request) {
  const { fen } = await req.json();

  return new Promise((resolve) => {
    const engine = stockfish();
    let bestMove = '';

    engine.onmessage = (event: any) => {
      const line = typeof event === 'string' ? event : event?.data;
      if (line && line.startsWith('bestmove')) {
        bestMove = line.split(' ')[1];
        resolve(NextResponse.json({ bestMove }));
      }
    };

    engine.postMessage('uci');
    engine.postMessage(`position fen ${fen}`);
    engine.postMessage('go depth 15');
  });
}

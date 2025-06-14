// File: /app/api/stockfish/route.ts

import { NextResponse } from 'next/server';
import Stockfish from '@jpweber/stockfish';

// GET request — optional health check
export async function GET() {
  const engine = Stockfish();
  engine.postMessage('uci');
  return new Response('Stockfish initialized via WASM!');
}

// POST request — evaluate best move from FEN
export async function POST(req: Request) {
  const { fen } = await req.json();

  return new Promise((resolve) => {
    const engine = Stockfish();
    let bestMove = '';

    engine.onmessage = (line: string) => {
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

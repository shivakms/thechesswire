// /app/api/stockfish/route.ts
import { NextResponse } from 'next/server';
import stockfish from 'stockfish';

export async function POST(req: Request) {
  const { fen } = await req.json();

  return new Promise((resolve) => {
    const engine = stockfish();
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

export async function GET() {
  const engine = stockfish();
  engine.postMessage('uci');
  return new Response('Stockfish is working.');
}

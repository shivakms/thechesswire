'use client';

import dynamic from 'next/dynamic';

const StockfishClient = dynamic(() => import('@/app/components/StockfishClient'), { ssr: false });

export default function Home() {
  const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  return (
    <main className="p-6 font-sans">
      <h1 className="text-3xl font-bold text-blue-600">Welcome to TheChessWire.news 🎉</h1>
      <StockfishClient fen={fen} />
    </main>
  );
}

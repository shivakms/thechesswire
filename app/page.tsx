'use client';

import dynamic from 'next/dynamic';

const StockfishClient = dynamic(() => import('@/app/components/StockfishClient'), { ssr: false });

export default function Home() {
  const sampleFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  return (
    <main className="p-4 font-sans">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        Welcome to TheChessWire.news! 🎉
      </h1>
      <p className="mb-6">Your AI-powered chess journalism hub is live!</p>
      <StockfishClient fen={sampleFEN} />
    </main>
  );
}

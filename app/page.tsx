'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const StockfishClient = dynamic(() => import('./components/StockfishClient'), { 
  ssr: false,
  loading: () => (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <p className="text-gray-600">Loading chess engine...</p>
    </div>
  )
});

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function Home() {
  const [fen, setFen] = useState(DEFAULT_FEN);
  const [customFen, setCustomFen] = useState('');

  const handleFenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFen.trim()) {
      setFen(customFen.trim());
    }
  };

  return (
    <main className="min-h-screen p-6 font-sans bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          TheChessWire.news Analysis Board
        </h1>
        
        <div className="mb-8">
          <form onSubmit={handleFenSubmit} className="space-y-4">
            <div>
              <label htmlFor="fen" className="block text-sm font-medium text-gray-700 mb-2">
                Enter FEN Position
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="fen"
                  value={customFen}
                  onChange={(e) => setCustomFen(e.target.value)}
                  placeholder="Enter FEN string..."
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Analyze
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Current Position</h2>
            <p className="text-sm text-gray-600 break-all">
              <code className="bg-gray-50 p-2 rounded block">{fen}</code>
            </p>
            <button
              onClick={() => setFen(DEFAULT_FEN)}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800"
            >
              Reset to Starting Position
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Engine Analysis</h2>
            <StockfishClient fen={fen} />
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          <p>
            This analysis board uses Stockfish 16, one of the strongest chess engines available.
            The engine analyzes the position and provides:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Best move recommendation</li>
            <li>Position evaluation (in pawns)</li>
            <li>Analysis depth</li>
            <li>Principal variation (best line)</li>
            <li>Number of positions analyzed</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

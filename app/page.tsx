import StockfishClient from './components/StockfishClient';

export default function Home() {
  const startingFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-indigo-800 mb-2">
        Welcome to TheChessWire.news 🎉
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        Your AI-powered chess journalism hub is live!
      </p>
      <StockfishClient fen={startingFEN} />
    </main>
  );
}

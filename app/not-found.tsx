// File: app/not-found.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen text-white bg-[#050B14] overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#40E0D0]/20 rounded-full blur-3xl animate-pulse" />
        
        {/* Floating chess pieces */}
        <div className="absolute top-[10%] left-[15%] text-6xl text-[#40E0D0]/10 animate-pulse">♚</div>
        <div className="absolute top-[70%] left-[80%] text-6xl text-[#40E0D0]/10 animate-pulse">♛</div>
        <div className="absolute top-[50%] left-[10%] text-6xl text-[#40E0D0]/10 animate-pulse">♜</div>
        <div className="absolute top-[20%] right-[20%] text-6xl text-[#40E0D0]/10 animate-pulse">♝</div>
        <div className="absolute top-[40%] right-[10%] text-6xl text-[#40E0D0]/10 animate-pulse">♞</div>
        <div className="absolute bottom-[20%] left-[25%] text-6xl text-[#40E0D0]/10 animate-pulse">♟</div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        {/* Logo - Using the glowing king chess piece */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Image
              src="/assets/chesswire-logo-white.svg" // UPDATE THIS PATH to match your saved file name
              alt="TheChessWire Logo"
              width={120}
              height={120}
              className="animate-pulse"
            />
            {/* Enhanced glow effect to match the logo's blue glow */}
            <div 
              className="absolute inset-0 rounded-full blur-2xl opacity-50 -z-10"
              style={{
                background: 'radial-gradient(circle, #40E0D0 0%, #2196F3 30%, transparent 70%)',
                width: 180,
                height: 180,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>
        </div>

        {/* 404 Text - using inline gradient style */}
        <h1 
          className="text-8xl md:text-9xl font-bold mb-2"
          style={{
            background: 'linear-gradient(135deg, #40E0D0 0%, #8B5CF6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </h1>
        <h2 className="text-3xl font-semibold text-[#40E0D0] mb-6">
          Checkmate by the Void!
        </h2>

        <p className="text-xl text-gray-300 mb-8">
          You&apos;ve ventured into uncharted squares.
        </p>

        {/* Updated button with the glowing king logo */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-3 bg-[#40E0D0] hover:bg-[#36C5B6] text-[#050B14] font-bold text-lg px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#40E0D0]/30 group"
        >
          <div className="relative w-6 h-6">
            <Image
              src="/assets/chesswire-king-logo.png" // UPDATE THIS PATH to match your saved file name
              alt="Chess King"
              width={24}
              height={24}
              className="filter brightness-0 group-hover:brightness-100 transition-all duration-300"
            />
          </div>
          <span>Return to Home Board</span>
        </Link>

        {/* Fun chess notation */}
        <div className="mt-8 text-sm text-gray-400">
          <p>Lost move: <span className="font-mono text-[#40E0D0]">404.Nxf∞</span></p>
        </div>
      </div>

      {/* Bambai AI Easter egg */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 opacity-50 hover:opacity-100 transition-opacity">
        <p className="italic">Bambai AI whispers: &ldquo;Every wrong move teaches us the right path...&rdquo;</p>
      </div>
    </main>
  );
}
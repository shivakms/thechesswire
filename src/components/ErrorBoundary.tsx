// src/components/ErrorBoundary.tsx
"use client";

import { Component, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  errorMessage?: string;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    chessWireConfig?: {
      sessionId?: string;
    };
  }
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true,
      errorMessage: error.message || "An unexpected error occurred"
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🔥 TheChessWire.news Error Boundary Caught:", {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR'
    });

    if (typeof window !== 'undefined') {
      console.error('Error caught by boundary:', {
        type: 'boundary_error',
        message: error.message,
        stack: error.stack,
        component: errorInfo.componentStack,
        timestamp: Date.now(),
        sessionId: window.chessWireConfig?.sessionId || 'unknown'
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050B14] text-white overflow-hidden relative">
          {/* Animated Background Effects */}
          <div className="absolute inset-0">
            {/* Gradient Orbs */}
            <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#40E0D0] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000" />

            {/* Chess Pattern Overlay */}
            <div className="absolute inset-0 opacity-5">
              <div className="grid grid-cols-8 grid-rows-8 h-full">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={`${
                      (Math.floor(i / 8) + i) % 2 === 0 ? 'bg-white' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Ghost Queen */}
            <div className="absolute left-1/2 top-1/3 -translate-x-1/2 animate-fadeInOut text-9xl opacity-10 select-none pointer-events-none">
              ♛
            </div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
            {/* Logo */}
            <div className="mb-8 relative">
              <Image
                src="/assets/chesswire-logo-white.svg"
                alt="TheChessWire Logo"
                width={80}
                height={80}
                className="relative z-10 animate-pulse"
                priority
              />
              <div 
                className="absolute inset-0 rounded-full blur-xl opacity-30"
                style={{
                  background: 'radial-gradient(circle, #40E0D0 0%, transparent 70%)',
                  width: 80,
                  height: 80
                }}
              />
            </div>

            {/* Title */}
            <h1 className="text-6xl md:text-7xl font-bold mb-2 text-center">
              <span className="text-gradient-primary">500</span>
              <span className="text-[#40E0D0] ml-4">–</span>
              <span className="text-white ml-4">Checkmate?</span>
            </h1>

            {/* PGN-style Comment */}
            <p className="text-sm italic text-gray-500 mb-4">
              {'// [500] {The server sacrificed stability for creativity.}'}
            </p>

            {/* Eval spike */}
            <p className="text-lg md:text-xl text-red-400 mb-6 text-center font-mono">
              Stockfish evaluation: -9.8... we blundered something huge.
            </p>

            {/* Bambai AI Audio Whisper */}
            <div 
              className="bg-black/40 backdrop-blur-xl border border-[#40E0D0]/30 rounded-xl p-6 mb-8 max-w-lg group relative cursor-pointer"
              onMouseEnter={() => {
                const audio = document.getElementById('bambai-audio') as HTMLAudioElement;
                audio?.play();
              }}
              onMouseLeave={() => {
                const audio = document.getElementById('bambai-audio') as HTMLAudioElement;
                audio?.pause();
                audio!.currentTime = 0;
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-[#40E0D0] rounded-full animate-pulse mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-[#40E0D0] font-semibold mb-1">Bambai AI whispers:</p>
                  <p className="text-gray-300 italic">
                    &quot;Sometimes the board reveals mysteries even we cannot foresee. Let&apos;s return to familiar squares...&quot;
                  </p>
                </div>
              </div>
              <audio id="bambai-audio" preload="auto" src="/audio/bambai-500-whisper.mp3" />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/"
                className="group relative px-8 py-4 bg-gradient-to-r from-[#40E0D0] to-purple-500 rounded-xl font-semibold text-black overflow-hidden transform transition-all hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  ♜ Return to Home
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              </Link>

              <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-black/40 backdrop-blur-xl border border-[#40E0D0]/50 rounded-xl font-semibold text-[#40E0D0] hover:bg-[#40E0D0]/10 transition-all"
              >
                ↻ Try Again
              </button>
            </div>

            {/* Error message (dev only) */}
            {process.env.NODE_ENV === 'development' && this.state.errorMessage && (
              <details className="mt-8 max-w-2xl w-full">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-300 transition-colors">
                  View Error Details
                </summary>
                <pre className="mt-2 p-4 bg-black/60 rounded-lg overflow-x-auto text-xs text-gray-400">
                  {this.state.errorMessage}
                </pre>
              </details>
            )}

            {/* EchoRank code */}
            <div className="mt-12 text-center">
              <p className="text-sm text-gray-500">
                Error Code: <span className="text-[#40E0D0]">CW-500-{Date.now().toString(36).toUpperCase()}</span>
              </p>
            </div>
          </div>

          {/* Chess piece animation */}
          <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden opacity-10">
            <div className="flex justify-around items-end h-full">
              <span className="text-6xl animate-bounce animation-delay-100">♔</span>
              <span className="text-6xl animate-bounce animation-delay-200">♕</span>
              <span className="text-6xl animate-bounce animation-delay-300">♗</span>
              <span className="text-6xl animate-bounce animation-delay-400">♘</span>
              <span className="text-6xl animate-bounce animation-delay-500">♖</span>
              <span className="text-6xl animate-bounce animation-delay-600">♟</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
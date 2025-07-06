// File: src/components/Loader.tsx
"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

interface LoaderProps {
  variant?: 'default' | 'chess' | 'voice' | 'security' | 'minimal' | 'soulcinema';
  message?: string;
  showMessage?: boolean;
}

export default function Loader({ 
  variant = 'default', 
  message = "Loading...", 
  showMessage = false 
}: LoaderProps) {
  const [dots, setDots] = useState("");
  const [chessQuote, setChessQuote] = useState("");

  const quotes = useMemo(() => [
    "Every move tells a story...",
    "In chess, as in life, forethought wins...",
    "The board whispers secrets to those who listen...",
    "Patience is the soul of chess...",
    "A moment of brilliance approaches..."
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setChessQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [quotes]);

  // Chess piece rotating animation with aurora effect
  const ChessLoader = () => (
    <div className="relative">
      <motion.div
        className="w-20 h-20 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <div className="text-5xl chess-piece-gradient font-serif">♚</div>
      </motion.div>
      <motion.div
        className="absolute inset-0 w-20 h-20 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(64, 224, 208, 0.3) 0%, transparent 60%)",
        }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -inset-2 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, #40E0D0, #8B5CF6, #40E0D0)",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        initial={{ opacity: 0.2 }}
      />
    </div>
  );

  // Voice/Bambai AI loader with emotional waves
  const VoiceLoader = () => (
    <div className="relative">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-2 rounded-full"
            style={{
              background: `linear-gradient(180deg, #40E0D0 0%, #8B5CF6 100%)`,
            }}
            animate={{ 
              height: [6, 32, 6],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      <motion.div
        className="absolute -inset-4 rounded-full blur-xl"
        style={{
          background: "radial-gradient(circle, rgba(64, 224, 208, 0.2) 0%, transparent 70%)",
        }}
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );

  // SoulCinema loader - cinematic feel
  const SoulCinemaLoader = () => (
    <div className="relative">
      <motion.div className="relative w-24 h-16 overflow-hidden rounded-lg bg-black/50 border border-accent/30">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/30 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-2xl"
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎬
          </motion.div>
        </div>
      </motion.div>
      <div className="absolute -inset-2 bg-accent/10 blur-2xl rounded-full" />
    </div>
  );

  // Security/processing loader with quantum effect
  const SecurityLoader = () => (
    <div className="relative">
      <motion.div
        className="w-16 h-16 relative"
        animate={{ rotate: [0, 90, 180, 270, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 border-2 border-accent/40 rounded-lg" />
        <div className="absolute inset-2 bg-gradient-to-br from-accent/20 to-purple/20 rounded" />
        <motion.div
          className="absolute inset-0 border border-purple/40 rounded-lg"
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
      <motion.div
        className="absolute -inset-3 rounded-lg"
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 60%)",
        }}
        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );

  // Minimal spinner with gradient
  const MinimalLoader = () => (
    <motion.div
      className="w-10 h-10 rounded-full"
      style={{
        background: "conic-gradient(from 0deg, transparent 0deg, #40E0D0 360deg)",
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute inset-1 bg-dark rounded-full" />
    </motion.div>
  );

  // Default advanced loader with multiple layers
  const DefaultLoader = () => (
    <div className="relative">
      <motion.div
        className="w-16 h-16 relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 border-3 border-t-transparent border-accent rounded-full" />
        <motion.div
          className="absolute inset-2 border-2 border-b-transparent border-purple rounded-full"
          animate={{ rotate: -720 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle at center, rgba(64, 224, 208, 0.1) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );

  const getLoader = () => {
    switch (variant) {
      case 'chess': return <ChessLoader />;
      case 'voice': return <VoiceLoader />;
      case 'security': return <SecurityLoader />;
      case 'minimal': return <MinimalLoader />;
      case 'soulcinema': return <SoulCinemaLoader />;
      default: return <DefaultLoader />;
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center gap-6 p-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      {getLoader()}
      
      {showMessage && (
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-sm text-gray-300 font-medium tracking-wide">
            {message}{dots}
          </div>
          {variant === 'chess' && (
            <div className="text-xs text-accent/70 italic max-w-xs">
              {chessQuote}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// Fullscreen overlay loader with blur backdrop
export function FullscreenLoader({ message, variant = "chess" }: { message?: string; variant?: LoaderProps['variant'] }) {
  return (
    <motion.div
      className="fixed inset-0 bg-dark/80 backdrop-blur-md z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      >
        <Loader variant={variant} message={message} showMessage={true} />
        
        {/* Floating chess pieces in background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {['♚', '♛', '♜', '♝'].map((piece, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl text-accent/5"
              style={{
                left: `${25 * i}%`,
                top: `${20 + i * 15}%`,
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {piece}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

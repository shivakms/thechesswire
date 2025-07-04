// Filename: src/components/ChessHero.tsx
// Enhanced Hero Section for TheChessWire.news

"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Removed the interface props since we're using direct navigation now
interface ChessHeroProps {
  // No longer need onExplore and onJoinCommunity props
}

// Custom SVG Icons
const VolumeIcon = ({ enabled }: { enabled: boolean }) => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d={enabled ? 
      "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" :
      "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
    } />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const CrownIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 6L9 2 5 7l1 11h12l1-11-4-5z" />
  </svg>
);

const ZapIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 0L6 12h5l-1 12 7-12h-5l1-12z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
);

export default function ChessHero({}: ChessHeroProps) {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [showCTA, setShowCTA] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [15, -15]));
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-15, 15]));
  
  const heroPhases = [
    "Where every move tells a story",
    "Powered by revolutionary AI storytelling", 
    "Experience chess like never before",
    "Join the future of chess journalism"
  ];
  
  const chessPhilosophies = [
    "Every sacrifice echoes in eternity",
    "In the silence between moves, stories are born",
    "Where human intuition meets artificial brilliance",
    "The board remembers what the heart feels"
  ];

  const chessPieces = useMemo(() => {
    return [...Array(16)].map((_, i) => ({
      piece: ['♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟'][i % 12],
      x: Math.random() * 1200,
      y: Math.random() * 800,
      scale: 0.5 + Math.random() * 0.5,
      delay: Math.random() * 10,
      duration: 25 + Math.random() * 15
    }));
  }, []);

  const animationTargets = useMemo(() => 
    chessPieces.map(() => ({
      targetY: Math.random() * 800,
      targetX: Math.random() * 1200,
      targetScale: 0.3 + Math.random() * 0.7
    })), [chessPieces]
  );

  const selectedPhilosophy = useMemo(() => 
    chessPhilosophies[Math.floor(Math.random() * chessPhilosophies.length)], 
    [showCTA]
  );

  // Initialize mount state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced typing animation with phases
  useEffect(() => {
    if (!mounted) return;
    
    const currentText = heroPhases[currentPhase];
    let index = 0;
    const timer = setInterval(() => {
      if (index < currentText.length) {
        setTypingText(currentText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          if (currentPhase < heroPhases.length - 1) {
            setCurrentPhase(prev => prev + 1);
            setTypingText('');
          } else {
            setShowCTA(true);
          }
        }, 2000);
      }
    }, 80);
    return () => clearInterval(timer);
  }, [currentPhase, mounted]);

  // Cycle through phases
  useEffect(() => {
    if (!mounted) return;
    
    if (currentPhase === heroPhases.length - 1 && showCTA) {
      const cycleTimer = setTimeout(() => {
        setCurrentPhase(0);
        setShowCTA(false);
        setTypingText('');
      }, 8000);
      return () => clearTimeout(cycleTimer);
    }
  }, [currentPhase, showCTA, mounted]);

  // Enhanced mouse tracking with smooth interpolation - memoized for performance
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mounted) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) * 0.1);
    mouseY.set((e.clientY - centerY) * 0.1);
  }, [mounted, mouseX, mouseY]);

  // Don't render animations until mounted
  if (!mounted) {
    return (
      <section className="w-full min-h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-900">
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen max-w-6xl mx-auto">
          <div className="text-center">
            <div className="mb-8 md:mb-12">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  TheChessWire
                </span>
              </h1>
              <div className="text-2xl md:text-3xl lg:text-4xl text-purple-300/90 font-light tracking-wider">
                .news
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="w-full min-h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-900"
      onMouseMove={handleMouseMove}
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 z-0">
        {/* Floating Chess Pieces with Enhanced Animation */}
        {chessPieces.map((piece, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl md:text-4xl opacity-5 select-none pointer-events-none"
            initial={{ 
              x: piece.x, 
              y: piece.y,
              rotate: 0,
              scale: piece.scale
            }}
            animate={{ 
              y: [piece.y, animationTargets[i].targetY],
              x: [piece.x, animationTargets[i].targetX],
              rotate: 360,
              opacity: [0.05, 0.15, 0.05],
              scale: [piece.scale, animationTargets[i].targetScale]
            }}
            transition={{ 
              duration: piece.duration, 
              repeat: Infinity, 
              ease: "linear",
              delay: piece.delay
            }}
          >
            {piece.piece}
          </motion.div>
        ))}
        
        {/* Multiple Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-600/25 to-purple-600/25 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.5, 0.2],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}/>
        </div>

        {/* Shooting Stars */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ 
              x: -10, 
              y: 200 + i * 200,
              opacity: 0 
            }}
            animate={{ 
              x: 1220,
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              repeat: Infinity, 
              delay: i * 3,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Voice Toggle */}
      <motion.button
        onClick={() => setVoiceEnabled(!voiceEnabled)}
        className="fixed top-6 right-6 z-50 p-3 bg-black/20 backdrop-blur-xl rounded-full border border-white/10 hover:bg-black/40 transition-all duration-300"
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <VolumeIcon enabled={voiceEnabled} />
      </motion.button>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen max-w-6xl mx-auto">
        <motion.div
          className="text-center"
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        >
          {/* Logo Section */}
          <motion.div
            className="mb-8 md:mb-12"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4"
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                TheChessWire
              </span>
            </motion.h1>
            <motion.div 
              className="text-2xl md:text-3xl lg:text-4xl text-purple-300/90 font-light tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              .news
            </motion.div>
          </motion.div>

          {/* Dynamic Subtitle */}
          <motion.div
            className="mb-8 md:mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 leading-relaxed mb-6 min-h-[2.5rem] md:min-h-[3rem]">
              {typingText}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-purple-400"
              >
                |
              </motion.span>
            </p>
            
            {/* Philosophy Text */}
            <AnimatePresence>
              {showCTA && (
                <motion.p
                  className="text-lg md:text-xl text-gray-400 italic mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.8 }}
                >
                  {selectedPhilosophy}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Call to Action Buttons - Updated with Next.js Links */}
          <AnimatePresence>
            {showCTA && (
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <motion.div
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/replay"
                    className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-3"
                  >
                    <PlayIcon />
                    Experience the Future
                    <ChevronRightIcon />
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/auth/gateway"
                    className="group px-8 py-4 bg-black/20 backdrop-blur-xl border border-white/20 text-white font-semibold rounded-2xl hover:bg-black/40 transition-all duration-300 flex items-center gap-3"
                  >
                    <CrownIcon />
                    Join Elite Community
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feature Highlights */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            {[
              { icon: ZapIcon, title: "AI Storytelling", desc: "Revolutionary Bambai AI narrates every move with emotion" },
              { icon: StarIcon, title: "Cinematic Replays", desc: "Transform games into stunning visual experiences" },
              { icon: ShieldIcon, title: "Quantum Security", desc: "Military-grade protection for your chess journey" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="p-6 bg-black/10 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-black/20 transition-all duration-300"
                whileHover={{ y: -5, scale: 1.02 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + i * 0.2 }}
              >
                <div className="w-8 h-8 text-purple-400 mb-4 mx-auto">
                  <feature.icon />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom tagline */}
          <motion.div
            className="text-sm text-gray-500 opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            Powered by revolutionary AI • Trusted by chess masters worldwide
          </motion.div>
        </motion.div>
      </div>

      {/* Ambient Audio Indicator */}
      {voiceEnabled && (
        <motion.div
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-xl rounded-full border border-white/10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.5 }}
        >
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-4 bg-purple-400 rounded-full"
                animate={{ 
                  scaleY: [0.3, 1, 0.3],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
              />
            ))}
          </div>
          <span className="text-xs text-white/70">Bambai AI</span>
        </motion.div>
      )}
    </section>
  );
}

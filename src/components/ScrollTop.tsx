// src/components/ScrollTop.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Sparkles } from 'lucide-react';

export default function ScrollTop() {
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollPercentage = (scrollPosition / documentHeight) * 100;

      setVisible(scrollPosition > 300);
      setScrollProgress(scrollPercentage);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    // Smooth scroll with easing
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Optional: Trigger a subtle voice feedback (Module 82: Bambai AI Whisper Mode)
    if (typeof window !== 'undefined') {
      const config = (window as { chessWireConfig?: { bambaiEnabled?: boolean } }).chessWireConfig;
      if (config?.bambaiEnabled) {
        console.log('🗣️ Bambai AI: "Rising to the top..."');
      }
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 100 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 400,
            damping: 25
          }}
          className="fixed bottom-8 right-8 z-50"
        >
          {/* Outer glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#40E0D0] to-[#FFD700] opacity-20 blur-xl animate-pulse" />
          
          {/* Progress ring container */}
          <div className="relative">
            {/* Progress ring */}
            <svg className="absolute inset-0 w-14 h-14 transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="rgba(64, 224, 208, 0.1)"
                strokeWidth="2"
                fill="none"
              />
              {/* Progress ring */}
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="url(#chessWireGradient)"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - scrollProgress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              <defs>
                <linearGradient id="chessWireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#40E0D0" />
                  <stop offset="50%" stopColor="#9370DB" />
                  <stop offset="100%" stopColor="#FFD700" />
                </linearGradient>
              </defs>
            </svg>

            {/* Main button */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#0A0F1C] via-[#162236] to-[#0A0F1C] 
                         border border-[#40E0D0]/30 shadow-2xl hover:shadow-[#40E0D0]/30 
                         flex items-center justify-center group overflow-hidden
                         backdrop-blur-xl transition-all duration-300"
              aria-label="Scroll to top - Return to the beginning"
            >
              {/* Inner gradient glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-[#40E0D0]/10 to-[#FFD700]/10 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Chess piece silhouette background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-3xl">♔</span>
              </div>
              
              {/* Icon container */}
              <div className="relative z-10 flex flex-col items-center">
                <ChevronUp className="w-5 h-5 text-[#40E0D0] group-hover:text-[#FFD700] 
                                    transform group-hover:translate-y-[-2px] transition-all duration-300" />
                <Sparkles className="w-3 h-3 text-[#40E0D0]/80 group-hover:text-[#FFD700] 
                                   mt-[-4px] transition-all duration-300" />
              </div>

              {/* Ripple effect on hover */}
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 0, opacity: 0 }}
                whileHover={{
                  scale: [1, 1.5, 1.5],
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                style={{
                  background: 'radial-gradient(circle, rgba(64, 224, 208, 0.4) 0%, transparent 70%)'
                }}
              />
            </motion.button>

            {/* Floating chess particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ 
                    x: 28, 
                    y: 28,
                    opacity: 0 
                  }}
                  animate={{ 
                    x: [28, 28 + (Math.random() - 0.5) * 40], 
                    y: [28, -10],
                    opacity: [0, 0.8, 0]
                  }}
                  transition={{
                    duration: 2.5,
                    delay: i * 0.4,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                >
                  <span className="text-xs text-[#40E0D0]">
                    {['♟', '♞', '♗', '♛'][i]}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tooltip with Bambai AI style */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="absolute right-16 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#0A0F1C]/95 to-[#162236]/95 
                       backdrop-blur-xl text-[#40E0D0] text-sm px-4 py-2 rounded-lg whitespace-nowrap
                       pointer-events-none border border-[#40E0D0]/20 shadow-lg shadow-[#40E0D0]/10"
          >
            <span className="font-medium">Return to Origin</span>
            <span className="text-[#FFD700] ml-1 text-xs">↑</span>
          </motion.div>

          {/* EchoRank indicator (Module 81) */}
          {scrollProgress > 80 && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#FFD700] 
                         flex items-center justify-center shadow-lg shadow-[#FFD700]/50"
            >
              <span className="text-[8px] text-[#0A0F1C] font-bold">★</span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

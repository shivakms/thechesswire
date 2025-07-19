'use client';

import { motion } from 'framer-motion';

export function ChessQueen() {
  return (
    <motion.div
      className="relative"
      animate={{
        y: [0, -10, 0],
        rotateY: [0, 5, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <motion.svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        className="drop-shadow-2xl"
        animate={{
          filter: [
            'drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))',
            'drop-shadow(0 0 20px rgba(168, 85, 247, 0.8))',
            'drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Chess Queen SVG Path */}
        <motion.path
          d="M60 10 L65 20 L70 15 L75 25 L80 20 L85 30 L90 25 L95 35 L100 30 L105 40 L110 35 L115 45 L120 40 L115 50 L110 45 L105 55 L100 50 L95 60 L90 55 L85 65 L80 60 L75 70 L70 65 L65 75 L60 70 L55 75 L50 70 L45 75 L40 70 L35 75 L30 70 L25 75 L20 70 L15 75 L10 70 L5 75 L0 70 L5 60 L10 55 L15 60 L20 55 L25 60 L30 55 L35 60 L40 55 L45 60 L50 55 L55 60 L60 55 L65 60 L70 55 L75 60 L80 55 L85 60 L90 55 L95 60 L100 55 L105 60 L110 55 L115 60 L120 55 L115 45 L110 40 L105 45 L100 40 L95 45 L90 40 L85 45 L80 40 L75 45 L70 40 L65 45 L60 40 L55 45 L50 40 L45 45 L40 40 L35 45 L30 40 L25 45 L20 40 L15 45 L10 40 L5 45 L0 40 L5 30 L10 25 L15 30 L20 25 L25 30 L30 25 L35 30 L40 25 L45 30 L50 25 L55 30 L60 25 L65 30 L70 25 L75 30 L80 25 L85 30 L90 25 L95 30 L100 25 L105 30 L110 25 L115 30 L120 25 L115 15 L110 10 L105 15 L100 10 L95 15 L90 10 L85 15 L80 10 L75 15 L70 10 L65 15 L60 10 Z"
          fill="url(#queenGradient)"
          stroke="#a855f7"
          strokeWidth="2"
          animate={{
            fill: [
              'url(#queenGradient)',
              'url(#queenGradientGlow)',
              'url(#queenGradient)',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Crown Details */}
        <motion.circle
          cx="30"
          cy="25"
          r="3"
          fill="#fbbf24"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.5,
          }}
        />
        <motion.circle
          cx="60"
          cy="20"
          r="4"
          fill="#fbbf24"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 1,
          }}
        />
        <motion.circle
          cx="90"
          cy="25"
          r="3"
          fill="#fbbf24"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 1.5,
          }}
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="queenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="queenGradientGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>
      </motion.svg>
    </motion.div>
  );
} 
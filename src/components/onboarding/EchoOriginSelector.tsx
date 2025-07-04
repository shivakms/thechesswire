// File: /components/onboarding/EchoOriginSelector.tsx
'use client';
import { motion } from 'framer-motion';
import { Swords, Shield, Dice1, Crown, Sparkles } from 'lucide-react';
import BambaiNarrator from './BambaiNarrator';
import { useEffect, useState } from 'react';

const ORIGINS = [
  {
    id: 'wanderer',
    name: 'Wanderer',
    icon: Swords,
    description: 'You seek understanding through exploration',
    color: 'from-cyan-500 to-blue-600',
    bgGradient: 'from-cyan-500/20 via-blue-600/20 to-transparent',
    narration: 'The Wanderer sees patterns others miss. Always searching, never settling.',
    particles: '#40E0D0'
  },
  {
    id: 'defender',
    name: 'Defender',
    icon: Shield,
    description: 'You protect what matters most',
    color: 'from-emerald-500 to-green-600',
    bgGradient: 'from-emerald-500/20 via-green-600/20 to-transparent',
    narration: 'The Defender builds fortresses of logic. Patient. Unbreakable.',
    particles: '#10B981'
  },
  {
    id: 'gambler',
    name: 'Gambler',
    icon: Dice1,
    description: 'You embrace chaos and intuition',
    color: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-500/20 via-pink-600/20 to-transparent',
    narration: 'The Gambler dances with danger. Every sacrifice is a story.',
    particles: '#9333EA'
  },
  {
    id: 'heir',
    name: 'Heir',
    icon: Crown,
    description: 'You carry the weight of legacy',
    color: 'from-yellow-500 to-orange-600',
    bgGradient: 'from-yellow-500/20 via-orange-600/20 to-transparent',
    narration: 'The Heir knows tradition but yearns for revolution. Born to rule, learning to rebel.',
    particles: '#F59E0B'
  }
];

export default function EchoOriginSelector({ onSelect, voiceEnabled }: { onSelect: (origin: string) => void, voiceEnabled: boolean }) {
  const [hoveredOrigin, setHoveredOrigin] = useState<string | null>(null);

  useEffect(() => {
    if (voiceEnabled) {
      BambaiNarrator.speak('Before you joined, who were you in chess? Choose your origin story.', 'calm');
    }
  }, [voiceEnabled]);

  return (
    <div className="max-w-5xl w-full">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <motion.h2 
          className="text-5xl md:text-6xl font-black mb-6"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            background: 'linear-gradient(135deg, #40E0D0 0%, #9333EA 50%, #EC4899 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(64, 224, 208, 0.3)',
          }}
        >
          Who Were You Before This?
        </motion.h2>
        <motion.p 
          className="text-xl text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Choose your chess origin story
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ORIGINS.map((origin, index) => {
          const Icon = origin.icon;
          const isHovered = hoveredOrigin === origin.id;
          
          return (
            <motion.button
              key={origin.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.1,
                type: 'spring',
                stiffness: 100,
                damping: 10
              }}
              whileHover={{ scale: 1.05, z: 50 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(origin.id)}
              onMouseEnter={() => {
                setHoveredOrigin(origin.id);
                if (voiceEnabled) BambaiNarrator.speak(origin.narration, 'whisper');
              }}
              onMouseLeave={() => setHoveredOrigin(null)}
              className="relative p-10 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-500 group overflow-hidden"
              style={{
                transformStyle: 'preserve-3d',
                boxShadow: isHovered 
                  ? `0 20px 50px -10px ${origin.particles}40, 0 0 100px ${origin.particles}20` 
                  : '0 10px 30px -10px rgba(0,0,0,0.5)',
              }}
            >
              {/* Animated gradient background */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${origin.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                animate={isHovered ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                } : {}}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              {/* Particle effects on hover */}
              {isHovered && [...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    background: origin.particles,
                    boxShadow: `0 0 6px ${origin.particles}`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                    x: (Math.random() - 0.5) * 100,
                    y: (Math.random() - 0.5) * 100,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
              
              {/* Icon with glow effect */}
              <motion.div
                className="relative z-10 mb-6"
                animate={isHovered ? {
                  rotate: [0, -10, 10, 0],
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${origin.color} blur-2xl opacity-50 scale-150`} />
                <Icon 
                  className="w-16 h-16 text-white relative z-10" 
                  style={{
                    filter: `drop-shadow(0 0 20px ${origin.particles})`,
                  }}
                />
              </motion.div>
              
              {/* Content */}
              <h3 
                className="text-3xl font-bold text-white mb-3 relative z-10"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {origin.name}
              </h3>
              <p 
                className="text-gray-300 text-lg relative z-10"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {origin.description}
              </p>

              {/* Glowing border on hover */}
              <div 
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${origin.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                style={{
                  padding: '2px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />

              {/* "Choose" indicator */}
              <motion.div
                className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={isHovered ? {
                  scale: [1, 1.2, 1],
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
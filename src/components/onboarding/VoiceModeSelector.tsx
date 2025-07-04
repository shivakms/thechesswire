// File: /src/components/onboarding/VoiceModeSelector.tsx
'use client';
import { motion } from 'framer-motion';
import { Mic, Heart, Zap, Feather, Volume2, Waves } from 'lucide-react';
import BambaiNarrator from './BambaiNarrator';
import { useEffect, useState } from 'react';

const VOICE_MODES = [
  {
    id: 'calm',
    name: 'Calm Mentor',
    icon: Feather,
    description: 'Gentle guidance with wisdom',
    sample: 'Your knight waits patiently. Like morning mist, the path reveals itself.',
    color: 'from-blue-400 to-cyan-500',
    wave: 'M0,20 Q10,10 20,20 T40,20',
    frequency: 2
  },
  {
    id: 'expressive',
    name: 'Expressive Storyteller',
    icon: Heart,
    description: 'Emotional depth in every move',
    sample: 'This isn\'t just a sacrifice — it\'s a declaration of war!',
    color: 'from-pink-400 to-rose-500',
    wave: 'M0,20 Q10,5 20,20 T40,20',
    frequency: 3
  },
  {
    id: 'dramatic',
    name: 'Dramatic Narrator',
    icon: Zap,
    description: 'Epic battles, legendary moments',
    sample: 'The queen stands alone... but queens were born to stand alone.',
    color: 'from-purple-400 to-violet-500',
    wave: 'M0,20 Q10,0 20,20 T40,20',
    frequency: 4
  },
  {
    id: 'poetic',
    name: 'Poetic Sage',
    icon: Mic,
    description: 'Chess as philosophy and art',
    sample: 'In the silence between moves, eternity whispers its secrets.',
    color: 'from-amber-400 to-orange-500',
    wave: 'M0,20 Q10,15 20,20 T40,20',
    frequency: 1.5
  }
];

export default function VoiceModeSelector({ onSelect, voiceEnabled }: { onSelect: (mode: string) => void, voiceEnabled: boolean }) {
  const [previewMode, setPreviewMode] = useState<string | null>(null);
  const [activeWaves, setActiveWaves] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (voiceEnabled) {
      BambaiNarrator.speak('How should I speak to you? Choose the voice that resonates with your soul.', 'calm');
    }
  }, [voiceEnabled]);

  const handlePreview = (e: React.MouseEvent, mode: typeof VOICE_MODES[0]) => {
    e.stopPropagation();
    setPreviewMode(mode.id);
    setActiveWaves({ ...activeWaves, [mode.id]: true });
    
    if (voiceEnabled) {
      BambaiNarrator.speak(mode.sample, mode.id);
    }
    
    // Stop wave animation after speech duration
    setTimeout(() => {
      setActiveWaves(prev => ({ ...prev, [mode.id]: false }));
    }, 3000);
  };

  return (
    <div className="max-w-6xl w-full">
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
            textShadow: '0 0 40px rgba(147, 51, 234, 0.3)',
          }}
        >
          Choose Your Voice
        </motion.h2>
        <motion.p 
          className="text-xl text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          How should Bambai AI speak to you?
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {VOICE_MODES.map((mode, index) => {
          const Icon = mode.icon;
          const isActive = activeWaves[mode.id];
          
          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ 
                delay: index * 0.15,
                type: 'spring',
                stiffness: 100
              }}
              className="relative group perspective-1000"
            >
              <motion.div
                className={`relative p-8 rounded-3xl bg-black/40 backdrop-blur-xl border-2 transition-all duration-500 cursor-pointer overflow-hidden ${
                  previewMode === mode.id 
                    ? 'border-white/40 shadow-2xl' 
                    : 'border-white/10 hover:border-white/30'
                }`}
                onClick={() => onSelect(mode.id)}
                whileHover={{ scale: 1.02, rotateY: 5 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: previewMode === mode.id 
                    ? `0 20px 50px -10px ${mode.color.split(' ')[1].replace('to-', '')}40` 
                    : '0 10px 30px -10px rgba(0,0,0,0.3)',
                }}
              >
                {/* Animated gradient background */}
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-20 transition-opacity duration-700`}
                  animate={{
                    scale: isActive ? [1, 1.5, 1] : 1,
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Sound wave visualization */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-30 transition-opacity">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-full h-full flex items-center justify-center"
                      animate={isActive ? {
                        scale: [1, 1.5 + i * 0.1, 1],
                        opacity: [0.3, 0, 0.3],
                      } : {}}
                      transition={{
                        duration: 2,
                        delay: i * 0.2,
                        repeat: Infinity,
                      }}
                    >
                      <Waves 
                        className={`w-32 h-32 text-white`}
                        style={{
                          filter: `drop-shadow(0 0 20px ${mode.color.split(' ')[1].replace('to-', '')})`,
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
                
                <div className="relative z-10 flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={isActive ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      } : {}}
                      transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                    >
                      <Icon 
                        className="w-12 h-12 text-white" 
                        style={{
                          filter: `drop-shadow(0 0 15px ${mode.color.split(' ')[1].replace('to-', '')})`,
                        }}
                      />
                    </motion.div>
                    <h3 
                      className="text-2xl font-bold text-white"
                      style={{ fontFamily: "'Orbitron', sans-serif" }}
                    >
                      {mode.name}
                    </h3>
                  </div>
                  
                  {/* Preview button with pulse effect */}
                  <motion.button
                    onClick={(e) => handlePreview(e, mode)}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Volume2 className="w-5 h-5 text-white" />
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-white/20"
                        animate={{
                          scale: [1, 2, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                      />
                    )}
                  </motion.button>
                </div>
                
                <p 
                  className="text-gray-300 text-base mb-4 relative z-10"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {mode.description}
                </p>
                
                {/* Sample text with typewriter effect on hover */}
                <motion.p 
                  className="text-sm text-gray-400 italic relative z-10"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  &quot;{mode.sample}&quot;
                </motion.p>

                {/* Audio waveform indicator */}
                <div className="absolute bottom-4 left-4 right-4 h-8 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-white/20 rounded-full"
                      animate={isActive ? {
                        height: [
                          '10%',
                          `${30 + Math.sin(i * 0.5 + Date.now() * 0.001) * 40}%`,
                          '10%'
                        ],
                      } : { height: '10%' }}
                      transition={{
                        duration: mode.frequency,
                        repeat: Infinity,
                        delay: i * 0.05,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
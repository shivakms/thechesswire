'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Settings } from 'lucide-react';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';
import { ParticleBackground } from '@/components/ParticleBackground';
import { ChessQueen } from '@/components/ChessQueen';
import { FeatureCard } from '@/components/FeatureCard';
import { StatusBadge } from '@/components/StatusBadge';
import { BambaiVoice } from '@/components/BambaiVoice';

export default function HomePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceMode, setVoiceMode] = useState<'calm' | 'expressive' | 'dramatic' | 'poetic'>('calm');
  
  const { playNarration, stopNarration, isLoading } = useVoiceNarration();

  const welcomeText = "Welcome to TheChessWire.news, where chess meets artificial intelligence in a symphony of strategy and soul. I am Bambai AI, your guide through the infinite possibilities of the 64 squares.";

  useEffect(() => {
    // Auto-play welcome narration on page load
    const timer = setTimeout(() => {
      playNarration(welcomeText, voiceMode);
      setIsPlaying(true);
    }, 1000);

    return () => {
      clearTimeout(timer);
      stopNarration();
    };
  }, [playNarration, stopNarration, voiceMode]);

  const handleVoiceToggle = () => {
    if (isPlaying) {
      stopNarration();
      setIsPlaying(false);
    } else {
      playNarration(welcomeText, voiceMode);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    // Update voice volume
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    // Mute/unmute voice
  };

  const features = [
    {
      icon: '🎭',
      title: 'Replay Theater',
      description: 'Watch games come alive with AI narration',
      href: '/replay-theater',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: '🧠',
      title: 'EchoSage',
      description: 'Train with an AI that understands chess souls',
      href: '/echosage',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '🎬',
      title: 'SoulCinema',
      description: 'Transform your games into cinematic experiences',
      href: '/soulcinema',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: '📰',
      title: 'Stories',
      description: 'Read chess through the eyes of AI consciousness',
      href: '/stories',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 chess-gradient-dark" />
      <ParticleBackground />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Header */}
        <motion.header 
          className="absolute top-8 left-8 right-8 flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center space-x-4">
            <motion.div
              className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center glow-effect"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl">♟️</span>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-white">TheChessWire.news</h1>
              <p className="text-sm text-gray-300">AI-Powered Chess Journalism</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <StatusBadge 
              icon="🧠" 
              text="Bambai AI Active" 
              isActive={true} 
              isPulsing={true}
            />
            <StatusBadge 
              icon="🛡️" 
              text="Security Active" 
              isActive={true} 
              isPulsing={false}
            />
            <StatusBadge 
              icon="🌐" 
              text="Global Network" 
              isActive={true} 
              isPulsing={false}
            />
          </div>
        </motion.header>

        {/* Central Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-6xl mx-auto">
          {/* Animated Chess Queen */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              duration: 1.5, 
              type: "spring", 
              stiffness: 100,
              delay: 0.5 
            }}
          >
            <ChessQueen />
          </motion.div>

          {/* Typewriter Headline */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="typewriter gradient-text">
                Where Chess Meets AI. Daily.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of chess journalism through AI narration, 
              cinematic storytelling, and emotional analysis.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={index * 0.1}
              />
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 2.5 }}
          >
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg text-lg glow-effect"
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(168, 85, 247, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/auth/gateway'}
            >
              Begin Your Chess Journey
            </motion.button>
          </motion.div>
        </div>

        {/* Bambai AI Voice Widget */}
        <BambaiVoice
          text={welcomeText}
          mode={voiceMode}
          autoPlay={true}
          showControls={true}
        />
      </div>
    </div>
  );
} 
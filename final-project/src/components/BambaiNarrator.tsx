'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Volume2, VolumeX, Play, Pause, RotateCcw, Settings, Sparkles } from 'lucide-react';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';

interface BambaiNarratorProps {
  text: string;
  mode?: 'calm' | 'expressive' | 'dramatic' | 'poetic';
  autoPlay?: boolean;
  showVisualizer?: boolean;
  className?: string;
}

export function BambaiNarrator({ 
  text, 
  mode = 'calm', 
  autoPlay = false, 
  showVisualizer = true,
  className = '' 
}: BambaiNarratorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceMode, setVoiceMode] = useState(mode);
  const [visualizerBars, setVisualizerBars] = useState<number[]>([]);
  
  const { playNarration, stopNarration, isLoading, isPlaying } = useVoiceNarration();

  // Generate visualizer bars
  useEffect(() => {
    const bars = Array.from({ length: 8 }, () => Math.random() * 100);
    setVisualizerBars(bars);
  }, []);

  // Animate visualizer when playing
  useEffect(() => {
    if (isPlaying && showVisualizer) {
      const interval = setInterval(() => {
        setVisualizerBars(prev => prev.map(() => Math.random() * 100));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, showVisualizer]);

  useEffect(() => {
    if (autoPlay && text) {
      const timer = setTimeout(() => {
        playNarration(text, voiceMode);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, text, voiceMode, playNarration]);

  const handlePlay = () => {
    if (isPlaying) {
      stopNarration();
    } else {
      playNarration(text, voiceMode);
    }
  };

  const handleReplay = () => {
    stopNarration();
    setTimeout(() => {
      playNarration(text, voiceMode);
    }, 100);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const voiceModes = [
    { id: 'calm', label: 'Calm', description: 'Soothing and peaceful', color: '#10b981' },
    { id: 'expressive', label: 'Expressive', description: 'Emotional and engaging', color: '#f59e0b' },
    { id: 'dramatic', label: 'Dramatic', description: 'Intense and powerful', color: '#ef4444' },
    { id: 'poetic', label: 'Poetic', description: 'Beautiful and lyrical', color: '#8b5cf6' }
  ];

  const currentMode = voiceModes.find(m => m.id === voiceMode);

  return (
    <motion.div
      className={`glass-morphism-dark rounded-2xl p-6 shadow-2xl ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center"
            animate={{ 
              rotate: isPlaying ? [0, 360] : 0,
              scale: isPlaying ? [1, 1.1, 1] : 1
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
          >
            <Brain className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-white">Bambai AI Narrator</h3>
            <p className="text-sm text-gray-300">AI-powered voice narration</p>
          </div>
        </div>
        
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Visualizer */}
      {showVisualizer && (
        <div className="mb-4">
          <div className="flex items-end justify-center space-x-1 h-16">
            {visualizerBars.map((height, index) => (
              <motion.div
                key={index}
                className="w-2 bg-gradient-to-t from-primary-400 to-accent-500 rounded-full"
                style={{ height: `${height}%` }}
                animate={{
                  height: isPlaying ? [height, height * 1.5, height] : height
                }}
                transition={{
                  duration: 0.5,
                  repeat: isPlaying ? Infinity : 0,
                  delay: index * 0.1
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        {/* Play/Pause Button */}
        <motion.button
          onClick={handlePlay}
          disabled={isLoading}
          className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed glow-effect"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <motion.div
              className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </motion.button>

        {/* Replay Button */}
        <motion.button
          onClick={handleReplay}
          className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>

        {/* Mute Button */}
        <motion.button
          onClick={handleMuteToggle}
          className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Status and Mode */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <motion.div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentMode?.color || '#10b981' }}
            animate={{
              scale: isPlaying ? [1, 1.2, 1] : 1,
              opacity: isPlaying ? [0.7, 1, 0.7] : 0.7
            }}
            transition={{
              duration: isPlaying ? 1 : 0,
              repeat: isPlaying ? Infinity : 0
            }}
          />
          <span className="text-sm text-gray-300">
            {isLoading ? 'Generating...' : isPlaying ? 'Bambai AI is live and narrating...' : 'Ready'}
          </span>
        </div>
        
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="w-4 h-4 text-primary-400" />
          <span className="text-sm font-medium text-white">{currentMode?.label} Mode</span>
          <Sparkles className="w-4 h-4 text-primary-400" />
        </div>
      </div>

      {/* Expanded Controls */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="pt-4 border-t border-gray-600"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              {/* Volume Slider */}
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Volume</label>
                <div className="flex items-center space-x-2">
                  <VolumeX className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <Volume2 className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Voice Mode Selection */}
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Voice Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {voiceModes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setVoiceMode(mode.id as any)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        voiceMode === mode.id
                          ? 'text-white'
                          : 'text-gray-300 hover:bg-gray-600'
                      }`}
                      style={{
                        backgroundColor: voiceMode === mode.id ? mode.color : '#374151'
                      }}
                      title={mode.description}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Info */}
              <div className="text-xs text-gray-400 space-y-1">
                <p>🎙️ Bambai AI Voice System</p>
                <p>Powered by ElevenLabs</p>
                <p>Voice ID: PmypFHWgqk9ACZdL8ugT</p>
                <p>Mode: {currentMode?.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </motion.div>
  );
} 
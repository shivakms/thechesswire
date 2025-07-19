'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';

interface BambaiVoiceProps {
  text: string;
  mode?: 'calm' | 'expressive' | 'dramatic' | 'poetic';
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

export function BambaiVoice({ 
  text, 
  mode = 'calm', 
  autoPlay = false, 
  showControls = true,
  className = '' 
}: BambaiVoiceProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceMode, setVoiceMode] = useState(mode);
  
  const { playNarration, stopNarration, isLoading, isPlaying } = useVoiceNarration();

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
    { id: 'calm', label: 'Calm', description: 'Soothing and peaceful' },
    { id: 'expressive', label: 'Expressive', description: 'Emotional and engaging' },
    { id: 'dramatic', label: 'Dramatic', description: 'Intense and powerful' },
    { id: 'poetic', label: 'Poetic', description: 'Beautiful and lyrical' }
  ];

  return (
    <motion.div
      className={`fixed bottom-6 right-6 z-50 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass-morphism-dark rounded-2xl p-4 shadow-2xl">
        {/* Main Controls */}
        <div className="flex items-center space-x-3">
          {/* Play/Pause Button */}
          <motion.button
            onClick={handlePlay}
            disabled={isLoading}
            className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed glow-effect"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </motion.button>

          {/* Replay Button */}
          <motion.button
            onClick={handleReplay}
            className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>

          {/* Mute Button */}
          <motion.button
            onClick={handleMuteToggle}
            className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </motion.button>

          {/* Settings Button */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Status Indicator */}
        <div className="mt-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <motion.div
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: isPlaying ? '#10b981' : '#6b7280',
                scale: isPlaying ? [1, 1.2, 1] : 1
              }}
              transition={{
                duration: isPlaying ? 1 : 0,
                repeat: isPlaying ? Infinity : 0
              }}
            />
            <span className="text-xs text-gray-300">
              {isLoading ? 'Generating...' : isPlaying ? 'Bambai AI is live and narrating...' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Expanded Controls */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="mt-4 pt-4 border-t border-gray-600"
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
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
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
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
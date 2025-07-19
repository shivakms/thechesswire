'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Settings, ChevronUp, ChevronDown } from 'lucide-react';

interface VoiceControlProps {
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  voiceMode: 'calm' | 'expressive' | 'dramatic' | 'poetic';
  onToggle: () => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onVoiceModeChange: (mode: 'calm' | 'expressive' | 'dramatic' | 'poetic') => void;
}

export function VoiceControl({
  isPlaying,
  isLoading,
  volume,
  isMuted,
  voiceMode,
  onToggle,
  onVolumeChange,
  onMuteToggle,
  onVoiceModeChange,
}: VoiceControlProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const voiceModes = [
    { id: 'calm', label: 'Calm', color: 'text-blue-400' },
    { id: 'expressive', label: 'Expressive', color: 'text-purple-400' },
    { id: 'dramatic', label: 'Dramatic', color: 'text-red-400' },
    { id: 'poetic', label: 'Poetic', color: 'text-green-400' },
  ] as const;

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 3 }}
    >
      <div className="glass-morphism-dark rounded-2xl p-4 shadow-2xl">
        {/* Main Controls */}
        <div className="flex items-center space-x-3">
          <motion.button
            className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white glow-effect"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            disabled={isLoading}
          >
            {isLoading ? (
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-1" />
            )}
          </motion.button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onMuteToggle}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              disabled={isMuted}
            />
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-300 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
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
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Voice Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {voiceModes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => onVoiceModeChange(mode.id)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          voiceMode === mode.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  <p>🎙️ Bambai AI Voice System</p>
                  <p>Powered by ElevenLabs</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
} 
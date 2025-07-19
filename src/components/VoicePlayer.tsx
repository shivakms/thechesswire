'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Settings, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import logger from '@/lib/logger';

interface VoicePlayerProps {
  text: string;
  mode?: 'calm' | 'expressive' | 'dramatic' | 'poetic';
  autoPlay?: boolean;
  showControls?: boolean;
  showVisualizer?: boolean;
  className?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: string) => void;
}

interface AudioCache {
  [key: string]: {
    blob: Blob;
    url: string;
    timestamp: number;
  };
}

// Global audio cache to prevent memory leaks and improve performance
const audioCache: AudioCache = {};
const CACHE_DURATION = 3600000; // 1 hour

// Audio context for better performance
let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;

export function VoicePlayer({
  text,
  mode = 'calm',
  autoPlay = false,
  showControls = true,
  showVisualizer = true,
  className = '',
  onPlayStart,
  onPlayEnd,
  onError
}: VoicePlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [visualizerBars, setVisualizerBars] = useState<number[]>([]);
  const [hasAutoplayPermission, setHasAutoplayPermission] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>();
  const cacheKey = useMemo(() => `${text}-${mode}`, [text, mode]);

  // Initialize audio context for better performance
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContext) {
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        logger.info('Audio context initialized for VoicePlayer');
      } catch (error) {
        logger.error('Failed to initialize audio context', error);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Check autoplay permission
  useEffect(() => {
    const checkAutoplayPermission = async () => {
      try {
        if (audioContext && audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        setHasAutoplayPermission(true);
      } catch (error) {
        logger.warn('Autoplay permission not granted', error);
        setHasAutoplayPermission(false);
      }
    };

    checkAutoplayPermission();
  }, []);

  // Generate visualizer bars
  useEffect(() => {
    if (showVisualizer) {
      const bars = Array.from({ length: 8 }, () => Math.random() * 100);
      setVisualizerBars(bars);
    }
  }, [showVisualizer]);

  // Animate visualizer when playing
  useEffect(() => {
    if (isPlaying && showVisualizer) {
      const animate = () => {
        setVisualizerBars(prev => prev.map(() => Math.random() * 100));
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isPlaying, showVisualizer]);

  // Clean up audio resources
  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
    }
  }, []);

  // Generate or retrieve cached audio
  const generateAudio = useCallback(async (): Promise<string> => {
    // Check cache first
    const cached = audioCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.info('Using cached audio', { cacheKey });
      return cached.url;
    }

    // Clean up old cache entry
    if (cached) {
      URL.revokeObjectURL(cached.url);
      delete audioCache[cacheKey];
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voiceMode: mode,
          voiceId: 'PmypFHWgqk9ACZdL8ugT',
        }),
      });

      if (!response.ok) {
        throw new Error(`Voice generation failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Cache the result
      audioCache[cacheKey] = {
        blob,
        url,
        timestamp: Date.now(),
      };

      logger.info('Audio generated and cached', { cacheKey, size: blob.size });
      return url;

    } catch (error) {
      logger.error('Audio generation failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, text, mode]);

  // Play audio with perfect synchronization
  const playAudio = useCallback(async () => {
    try {
      // Resume audio context if suspended
      if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const audioUrl = await generateAudio();
      
      // Create new audio element for better control
      const audio = new Audio(audioUrl);
      audio.volume = isMuted ? 0 : volume;
      audio.preload = 'auto';

      // Set up event listeners
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });

      audio.addEventListener('timeupdate', () => {
        if (audio.duration > 0) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
        onPlayEnd?.();
        cleanupAudio();
      });

      audio.addEventListener('error', (error) => {
        logger.error('Audio playback error', error);
        setIsPlaying(false);
        setIsLoading(false);
        onError?.('Audio playback failed');
        toast.error('Voice playback failed');
        cleanupAudio();
      });

      audioRef.current = audio;
      
      // Play with user interaction check
      try {
        await audio.play();
        setIsPlaying(true);
        onPlayStart?.();
        logger.info('Audio playback started', { mode, textLength: text.length });
      } catch (playError) {
        if ((playError as any).name === 'NotAllowedError') {
          logger.warn('Autoplay blocked by browser');
          setHasAutoplayPermission(false);
          onError?.('Autoplay blocked. Please click play to start.');
          toast.error('Please click play to start voice narration');
        } else {
          throw playError;
        }
      }

    } catch (error) {
      logger.error('Play audio failed', error);
      setIsPlaying(false);
      setIsLoading(false);
      onError?.('Failed to play audio');
      toast.error('Voice narration failed');
    }
  }, [generateAudio, volume, isMuted, onPlayStart, onPlayEnd, onError, cleanupAudio, mode, text]);

  // Stop audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
      cleanupAudio();
    }
  }, [cleanupAudio]);

  // Handle play/pause
  const handlePlayPause = useCallback(async () => {
    if (isPlaying) {
      stopAudio();
    } else {
      await playAudio();
    }
  }, [isPlaying, playAudio, stopAudio]);

  // Handle replay
  const handleReplay = useCallback(async () => {
    stopAudio();
    // Small delay to ensure clean restart
    setTimeout(() => {
      playAudio();
    }, 50);
  }, [stopAudio, playAudio]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume;
    }
  }, [isMuted, volume]);

  // Auto-play with permission check
  useEffect(() => {
    if (autoPlay && text && hasAutoplayPermission && !isLoading) {
      const timer = setTimeout(() => {
        playAudio();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, text, hasAutoplayPermission, isLoading, playAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cleanupAudio]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`voice-player ${className}`}
    >
      {/* Visualizer */}
      {showVisualizer && (
        <motion.div className="flex items-center justify-center space-x-1 mb-4">
          {visualizerBars.map((height, index) => (
            <motion.div
              key={index}
              className="w-1 bg-gradient-to-t from-blue-500 to-purple-600 rounded-full"
              animate={{
                height: isPlaying ? `${height}%` : '20%',
                opacity: isPlaying ? 1 : 0.5,
              }}
              transition={{ duration: 0.1 }}
            />
          ))}
        </motion.div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-center space-x-4">
          {/* Play/Pause Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            disabled={isLoading}
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </motion.button>

          {/* Replay Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReplay}
            disabled={isLoading}
            className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMuteToggle}
              className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </motion.button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Status */}
      <div className="text-center mt-4 text-sm text-gray-600">
        {isLoading && 'Generating voice...'}
        {isPlaying && `Playing (${Math.round(progress)}%)`}
        {!isLoading && !isPlaying && !hasAutoplayPermission && 'Click play to start'}
      </div>
    </motion.div>
  );
} 
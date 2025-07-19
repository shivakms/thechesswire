'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import logger from '@/lib/logger';

export type VoiceMode = 'calm' | 'expressive' | 'dramatic' | 'poetic';

interface VoiceNarrationReturn {
  playNarration: (text: string, mode?: VoiceMode) => Promise<void>;
  stopNarration: () => void;
  pauseNarration: () => void;
  resumeNarration: () => void;
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  duration: number;
  error: string | null;
  hasAutoplayPermission: boolean;
}

interface AudioCache {
  [key: string]: {
    blob: Blob;
    url: string;
    timestamp: number;
  };
}

// Global audio cache for performance
const audioCache: AudioCache = {};
const CACHE_DURATION = 3600000; // 1 hour

// Audio context for better performance
let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;

export function useVoiceNarration(): VoiceNarrationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasAutoplayPermission, setHasAutoplayPermission] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentCacheKey = useRef<string>('');

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContext) {
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        logger.info('Audio context initialized for voice narration');
      } catch (error) {
        logger.error('Failed to initialize audio context', error);
      }
    }

    // Check autoplay permission
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

    return () => {
      cleanup();
    };
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
      audioRef.current = null;
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setDuration(0);
  }, []);

  // Generate cache key
  const getCacheKey = useCallback((text: string, mode: VoiceMode) => {
    return `${text.substring(0, 100)}-${mode}`;
  }, []);

  // Generate or retrieve cached audio
  const generateAudio = useCallback(async (text: string, mode: VoiceMode): Promise<string> => {
    const cacheKey = getCacheKey(text, mode);
    currentCacheKey.current = cacheKey;

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
      setError(null);
      
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Voice generation failed: ${response.status}`);
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Audio generation failed', error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getCacheKey]);

  // Update progress
  const updateProgress = useCallback(() => {
    if (audioRef.current && audioRef.current.duration > 0) {
      const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  }, []);

  // Play narration with perfect synchronization
  const playNarration = useCallback(async (text: string, mode: VoiceMode = 'calm') => {
    try {
      // Resume audio context if suspended
      if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        cleanup();
      }

      const audioUrl = await generateAudio(text, mode);
      
      // Create new audio element
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      audio.volume = 0.7;

      // Set up event listeners
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });

      audio.addEventListener('timeupdate', updateProgress);

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(0);
        cleanup();
        logger.info('Voice narration completed');
      });

      audio.addEventListener('pause', () => {
        setIsPlaying(false);
        setIsPaused(true);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      });

      audio.addEventListener('play', () => {
        setIsPlaying(true);
        setIsPaused(false);
        // Start progress updates
        progressIntervalRef.current = setInterval(updateProgress, 100);
      });

      audio.addEventListener('error', (error) => {
        logger.error('Audio playback error', error);
        setIsPlaying(false);
        setIsPaused(false);
        setIsLoading(false);
        setError('Audio playback failed');
        toast.error('Voice playback failed');
        cleanup();
      });

      audioRef.current = audio;
      
      // Play with user interaction check
      try {
        await audio.play();
        logger.info('Voice narration started', { mode, textLength: text.length });
      } catch (playError) {
        if ((playError as any).name === 'NotAllowedError') {
          logger.warn('Autoplay blocked by browser');
          setHasAutoplayPermission(false);
          setError('Autoplay blocked. Please click play to start.');
          toast.error('Please click play to start voice narration');
        } else {
          throw playError;
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Play narration failed', error);
      setIsPlaying(false);
      setIsPaused(false);
      setIsLoading(false);
      setError(errorMessage);
      toast.error('Voice narration failed');
    }
  }, [generateAudio, updateProgress, cleanup]);

  // Stop narration
  const stopNarration = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    cleanup();
    logger.info('Voice narration stopped');
  }, [cleanup]);

  // Pause narration
  const pauseNarration = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      logger.info('Voice narration paused');
    }
  }, [isPlaying]);

  // Resume narration
  const resumeNarration = useCallback(async () => {
    if (audioRef.current && isPaused) {
      try {
        await audioRef.current.play();
        logger.info('Voice narration resumed');
      } catch (error) {
        logger.error('Failed to resume narration', error);
        setError('Failed to resume narration');
      }
    }
  }, [isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    playNarration,
    stopNarration,
    pauseNarration,
    resumeNarration,
    isLoading,
    isPlaying,
    isPaused,
    progress,
    duration,
    error,
    hasAutoplayPermission,
  };
} 
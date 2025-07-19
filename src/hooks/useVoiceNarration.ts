'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

type VoiceMode = 'calm' | 'expressive' | 'dramatic' | 'poetic' | 'epic';

interface VoiceNarrationReturn {
  playNarration: (text: string, mode: VoiceMode) => Promise<void>;
  stopNarration: () => void;
  isLoading: boolean;
  isPlaying: boolean;
}

export function useVoiceNarration(): VoiceNarrationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const playNarration = useCallback(async (text: string, mode: VoiceMode = 'calm') => {
    try {
      setIsLoading(true);
      setIsPlaying(false);

      // Stop any currently playing audio
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }

      // Call the backend API to generate voice
      const response = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceMode: mode,
          voiceId: 'PmypFHWgqk9ACZdL8ugT', // Female voice ID
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate voice narration');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      const audio = new Audio(audioUrl);
      audio.volume = 0.7;
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      });

      audio.addEventListener('error', (error) => {
        console.error('Audio playback error:', error);
        setIsPlaying(false);
        setIsLoading(false);
        toast.error('Failed to play voice narration');
        URL.revokeObjectURL(audioUrl);
      });

      setAudioElement(audio);
      await audio.play();
      setIsPlaying(true);
      setIsLoading(false);

    } catch (error) {
      console.error('Voice narration error:', error);
      setIsLoading(false);
      setIsPlaying(false);
      toast.error('Failed to generate voice narration');
      
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.7;
        
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => {
          setIsPlaying(false);
          toast.error('Voice narration failed');
        };
        
        speechSynthesis.speak(utterance);
      }
    }
  }, [audioElement]);

  const stopNarration = useCallback(() => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
    }
    
    // Stop browser TTS
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, [audioElement]);

  return {
    playNarration,
    stopNarration,
    isLoading,
    isPlaying,
  };
} 
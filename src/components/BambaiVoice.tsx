// components/BambaiVoice.tsx

"use client";

import { useEffect, useState } from 'react';

interface BambaiVoiceProps {
  text: string;
  autoPlay?: boolean;
  onEnd?: () => void;
}

export function BambaiVoice({ text, autoPlay = false, onEnd }: BambaiVoiceProps) {
  const [isReady, setIsReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Initialize voices
    const initVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setIsReady(true);
          if (autoPlay) {
            speak(text);
          }
        }
      }
    };

    // Try immediately
    initVoices();

    // Also listen for voices to load
    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = initVoices;
    }

    // Fallback timeout
    setTimeout(() => setIsReady(true), 1000);
  }, []);

  const speak = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Try to find a female voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.lang.startsWith('en') && (
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('victoria') ||
        voice.name.toLowerCase().includes('zira')
      )
    ) || voices.find(v => v.lang.startsWith('en'));

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return { speak, isSpeaking, isReady };
}

// Export a hook version
export function useBambaiVoice() {
  const [isReady, setIsReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    const init = () => {
      if ('speechSynthesis' in window) {
        setIsReady(true);
      }
    };
    
    init();
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = init;
    }
  }, []);

  const speak = (text: string) => {
    if (!voiceEnabled || !text || !isReady) return;

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return {
    speak,
    stop,
    isSpeaking,
    isVoiceReady: isReady,
    voiceName: 'Nicole',
    setVoiceEnabled,
    voiceEnabled
  };
}
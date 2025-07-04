// hooks/useBambaiVoice.ts

import { useState, useEffect, useCallback, useRef } from 'react';

export function useBambaiVoice() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceReady, setIsVoiceReady] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceName, setVoiceName] = useState('Bambai AI');
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const selectFemaleVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log(`Found ${voices.length} voices`);
      
      // Specifically look for these female voices by exact name
      const femaleVoice = 
        // First choice: Google UK English Female
        voices.find(v => v.name === 'Google UK English Female') ||
        // Second choice: Microsoft Zira (US female voice)
        voices.find(v => v.name === 'Microsoft Zira - English (United States)') ||
        // Third choice: Any voice with "Female" in the name
        voices.find(v => v.name.toLowerCase().includes('female') && v.lang.startsWith('en')) ||
        // Fourth choice: Zira (sometimes listed without "Microsoft")
        voices.find(v => v.name.toLowerCase().includes('zira')) ||
        // Fallback: Any English voice
        voices.find(v => v.lang.startsWith('en'));

      if (femaleVoice) {
        console.log('Selected voice:', femaleVoice.name);
        selectedVoiceRef.current = femaleVoice;
        
        // Set friendly name
        if (femaleVoice.name.includes('Zira')) {
          setVoiceName('Zira');
        } else if (femaleVoice.name.includes('Female')) {
          setVoiceName('UK Female');
        } else {
          setVoiceName('Bambai AI');
        }
        
        setIsVoiceReady(true);
      } else if (voices.length > 0) {
        console.warn('No female voice found, using first available');
        selectedVoiceRef.current = voices[0];
        setIsVoiceReady(true);
      }
    };

    // Try to load voices immediately
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      selectFemaleVoice();
    }

    // Listen for voices to change (important for Chrome)
    window.speechSynthesis.onvoiceschanged = selectFemaleVoice;

    // Force voice loading in some browsers
    if (voices.length === 0) {
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0;
      window.speechSynthesis.speak(utterance);
      setTimeout(selectFemaleVoice, 100);
    }

    // Listen for user interaction
    const handleInteraction = () => {
      setHasUserInteracted(true);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
    
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !text) {
      console.log('Voice not enabled or no text');
      return;
    }

    if (!hasUserInteracted) {
      console.log('Waiting for user interaction');
      const pendingSpeak = () => {
        speak(text);
        document.removeEventListener('click', pendingSpeak);
      };
      document.addEventListener('click', pendingSpeak);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Use the selected voice
      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      } else {
        // Try to find female voice on the fly
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = 
          voices.find(v => v.name === 'Google UK English Female') ||
          voices.find(v => v.name === 'Microsoft Zira - English (United States)') ||
          voices[5]; // Microsoft Zira based on your voice list
        
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
      }
      
      // Female voice settings
      utterance.rate = 0.9;
      utterance.pitch = 1.2; // Higher pitch for female voice
      utterance.volume = 1.0;
      
      utterance.onstart = () => {
        console.log('Speaking with voice:', utterance.voice?.name || 'default');
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error speaking:', error);
      setIsSpeaking(false);
    }
  }, [voiceEnabled, hasUserInteracted]);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isVoiceReady,
    voiceName,
    setVoiceEnabled,
    voiceEnabled
  };
}
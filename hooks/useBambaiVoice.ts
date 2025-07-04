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
      console.log(`🔊 Found ${voices.length} voices`);
      
      if (voices.length === 0) {
        console.log('⚠️ No voices available yet');
        return;
      }

      // Based on your voice list:
      // Index 5: Microsoft Zira (female)
      // Index 9: Google UK English Female
      
      let femaleVoice = null;
      
      // Try Google UK English Female first (index 9)
      if (voices[9] && voices[9].name === 'Google UK English Female') {
        femaleVoice = voices[9];
        console.log('✅ Selected Google UK English Female');
      }
      // Try Microsoft Zira (index 5)
      else if (voices[5] && voices[5].name.includes('Zira')) {
        femaleVoice = voices[5];
        console.log('✅ Selected Microsoft Zira');
      }
      // Search by name as fallback
      else {
        femaleVoice = voices.find(v => 
          v.name.includes('Female') || 
          v.name.includes('Zira') ||
          v.name.includes('Hazel') ||
          v.name.includes('Susan')
        );
        console.log('🔍 Searched for female voice:', femaleVoice?.name);
      }

      if (femaleVoice) {
        selectedVoiceRef.current = femaleVoice;
        setVoiceName(femaleVoice.name.split(' ')[0]);
        setIsVoiceReady(true);
        console.log('✅ Voice ready:', femaleVoice.name);
      } else {
        // Use first English voice as fallback
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        if (englishVoice) {
          selectedVoiceRef.current = englishVoice;
          setVoiceName('Default');
          setIsVoiceReady(true);
          console.log('⚠️ Using fallback voice:', englishVoice.name);
        }
      }
    };

    // Try immediately
    selectFemaleVoice();

    // Listen for voices to load
    window.speechSynthesis.onvoiceschanged = () => {
      console.log('🔄 Voices changed, reselecting...');
      selectFemaleVoice();
    };

    // Force voice loading
    if (window.speechSynthesis.getVoices().length === 0) {
      console.log('🔄 Forcing voice load...');
      const dummy = new SpeechSynthesisUtterance('');
      dummy.volume = 0;
      window.speechSynthesis.speak(dummy);
      window.speechSynthesis.cancel();
      setTimeout(selectFemaleVoice, 100);
    }

    // Listen for user interaction
    const handleInteraction = () => {
      console.log('👆 User interaction detected');
      setHasUserInteracted(true);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
    
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    
    // Check if already interacted
    if (document.hasFocus()) {
      setHasUserInteracted(true);
    }
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  const speak = useCallback((text: string) => {
    console.log('🎤 Speak called:', { text: text.substring(0, 50), voiceEnabled, hasUserInteracted, isVoiceReady });
    
    if (!voiceEnabled || !text) {
      console.log('❌ Voice disabled or no text');
      return;
    }

    if (!hasUserInteracted) {
      console.log('⏳ Waiting for user interaction...');
      // Don't wait, just try to speak anyway
      setHasUserInteracted(true);
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get fresh voice list
      const voices = window.speechSynthesis.getVoices();
      
      // Try to use selected voice or find a female one
      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
        console.log('🔊 Using selected voice:', selectedVoiceRef.current.name);
      } else if (voices.length > 0) {
        // Try direct indices based on your voice list
        const femaleVoice = voices[9] || voices[5] || voices.find(v => v.name.includes('Female'));
        if (femaleVoice) {
          utterance.voice = femaleVoice;
          console.log('🔊 Using voice:', femaleVoice.name);
        }
      }
      
      // Female voice settings
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      utterance.volume = 1.0;
      
      utterance.onstart = () => {
        console.log('▶️ Started speaking');
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        console.log('⏹️ Finished speaking');
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('❌ Speech error:', event);
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
      console.log('✅ Speech queued');
    } catch (error) {
      console.error('❌ Error in speak function:', error);
      setIsSpeaking(false);
    }
  }, [voiceEnabled, hasUserInteracted, isVoiceReady]);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      console.log('⏹️ Speech stopped');
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
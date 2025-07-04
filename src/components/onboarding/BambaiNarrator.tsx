// File: /components/onboarding/BambaiNarrator.tsx
class BambaiNarratorClass {
  private voices: { [key: string]: SpeechSynthesisVoice | null } = {
    calm: null,
    expressive: null,
    dramatic: null,
    poetic: null,
    whisper: null
  };

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    const availableVoices = window.speechSynthesis.getVoices();
    // Select appropriate voices for each mode
    this.voices.calm = availableVoices.find(v => v.name.includes('Female')) || availableVoices[0];
    this.voices.expressive = availableVoices.find(v => v.name.includes('Male')) || availableVoices[0];
    this.voices.dramatic = this.voices.expressive;
    this.voices.poetic = this.voices.calm;
    this.voices.whisper = this.voices.calm;
  }

  speak(text: string, mode: string = 'calm') {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure based on mode
    switch (mode) {
      case 'calm':
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        break;
      case 'expressive':
        utterance.rate = 1.1;
        utterance.pitch = 1.2;
        utterance.volume = 0.9;
        break;
      case 'dramatic':
        utterance.rate = 0.8;
        utterance.pitch = 0.9;
        utterance.volume = 1.0;
        break;
      case 'poetic':
        utterance.rate = 0.7;
        utterance.pitch = 1.1;
        utterance.volume = 0.7;
        break;
      case 'whisper':
        utterance.rate = 0.6;
        utterance.pitch = 0.8;
        utterance.volume = 0.4;
        break;
    }

    if (this.voices[mode]) {
      utterance.voice = this.voices[mode];
    }

    window.speechSynthesis.speak(utterance);
  }

  stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

const BambaiNarrator = new BambaiNarratorClass();
export default BambaiNarrator;

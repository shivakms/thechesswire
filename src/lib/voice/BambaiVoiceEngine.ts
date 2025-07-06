// Filename: src/lib/voice/BambaiVoiceEngine.ts

import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { DynamicVoiceModulation } from './DynamicVoiceModulation';

const API_KEY = process.env.ELEVENLABS_API_KEY;
const NICOLE_VOICE_ID = 'piTKgcLEGmPE4e6mEKli';

export class BambaiVoiceEngine {
  private voiceProfiles = {
    // WISE MENTOR - For teaching moments
    wiseMentor: {
      stability: 0.65,
      similarity_boost: 0.80,
      style: 0.35,
      use_speaker_boost: true
    },
    
    // ENTHUSIASTIC COMMENTATOR - For exciting moments
    enthusiasticCommentator: {
      stability: 0.30,
      similarity_boost: 0.70,
      style: 0.60,
      use_speaker_boost: true
    },
    
    // THOUGHTFUL PHILOSOPHER - For deep analysis
    thoughtfulPhilosopher: {
      stability: 0.75,
      similarity_boost: 0.85,
      style: 0.25,
      use_speaker_boost: true
    },
    
    // WARM ENCOURAGER - For support after mistakes
    warmEncourager: {
      stability: 0.70,
      similarity_boost: 0.75,
      style: 0.40,
      use_speaker_boost: true
    },
    
    // POETIC STORYTELLER - For game narratives
    poeticStoryteller: {
      stability: 0.50,
      similarity_boost: 0.78,
      style: 0.45,
      use_speaker_boost: true
    },
    
    // NEW: WHISPER MODE - For intimate, calming narration
    whisperMode: {
      stability: 0.85,
      similarity_boost: 0.90,
      style: 0.15,
      use_speaker_boost: false
    },
    
    // NEW: DRAMATIC NARRATOR - For cinematic moments
    dramaticNarrator: {
      stability: 0.25,
      similarity_boost: 0.65,
      style: 0.75,
      use_speaker_boost: true
    }
  };

  // Enhanced emotion detection for dynamic voice switching
  private emotionPatterns = {
    tension: /tension|pressure|critical|decisive|sharp/i,
    triumph: /brilliant|magnificent|victory|genius|masterful/i,
    tragedy: /blunder|mistake|collapse|disaster|pain/i,
    mystery: /hidden|secret|mysterious|unexpected|surprise/i,
    philosophical: /life|soul|journey|wisdom|eternal/i
  };

  // Voice cache configuration (Module 304)
  private cacheDir = path.join(process.cwd(), '.cache', 'voice');
  private cacheEnabled = true;

  constructor() {
    this.initializeCache();
  }

  private async initializeCache() {
    if (this.cacheEnabled) {
      await fs.mkdir(this.cacheDir, { recursive: true });
    }
  }

  // Generate cache key for voice requests
  private generateCacheKey(text: string, mode: string, tone: string): string {
    return crypto
      .createHash('md5')
      .update(`${text}-${mode}-${tone}`)
      .digest('hex');
  }

  // Check cache for existing audio
  private async checkCache(cacheKey: string): Promise<Buffer | null> {
    if (!this.cacheEnabled) return null;
    
    try {
      const cachePath = path.join(this.cacheDir, `${cacheKey}.mp3`);
      const audio = await fs.readFile(cachePath);
      console.log('🎵 Voice cache hit:', cacheKey);
      return audio;
    } catch {
      return null;
    }
  }

  // Save audio to cache
  private async saveToCache(cacheKey: string, audio: Buffer): Promise<void> {
    if (!this.cacheEnabled) return;
    
    try {
      const cachePath = path.join(this.cacheDir, `${cacheKey}.mp3`);
      await fs.writeFile(cachePath, audio);
      console.log('💾 Voice cached:', cacheKey);
    } catch (error) {
      console.error('Cache save error:', error);
    }
  }

  // Detect emotion from text for automatic mode selection
  private detectEmotion(text: string): string {
    for (const [emotion, pattern] of Object.entries(this.emotionPatterns)) {
      if (pattern.test(text)) {
        return emotion;
      }
    }
    return 'neutral';
  }

  // Auto-select voice mode based on emotion
  private selectModeByEmotion(emotion: string): keyof typeof this.voiceProfiles {
    const emotionModeMap: Record<string, keyof typeof this.voiceProfiles> = {
      tension: 'dramaticNarrator',
      triumph: 'enthusiasticCommentator',
      tragedy: 'warmEncourager',
      mystery: 'poeticStoryteller',
      philosophical: 'thoughtfulPhilosopher',
      neutral: 'wiseMentor'
    };
    
    return emotionModeMap[emotion] || 'wiseMentor';
  }

  // Enhanced text processing with emotion-aware SSML
  private enhanceText(text: string, tone: string = 'neutral'): string {
    // Apply dynamic modulation
    text = DynamicVoiceModulation.enhanceChessTerms(text);
    text = DynamicVoiceModulation.addNaturalBreathing(text);
    
    // Add natural pauses and emphasis
    let enhanced = text
      .replace(/\.\.\./g, '... <break time="600ms"/>')
      .replace(/\. /g, '. <break time="300ms"/> ')
      .replace(/, /g, ', <break time="150ms"/> ')
      .replace(/\*(.*?)\*/g, '<emphasis level="strong">$1</emphasis>')
      .replace(/\~(.*?)\~/g, '<prosody rate="slow">$1</prosody>')
      .replace(/\_(.*?)\_/g, '<prosody volume="soft">$1</prosody>'); // NEW: Soft voice

    // Enhanced tone variations with more nuance
    const toneWrappers: Record<string, string> = {
      inspiring: '<prosody pitch="+5%" rate="1.05" range="high">',
      thoughtful: '<prosody pitch="-5%" rate="0.9" range="medium">',
      energetic: '<prosody range="x-high" rate="1.1" volume="loud">',
      calm: '<prosody range="low" rate="0.95" volume="medium">',
      dramatic: '<prosody range="x-high" rate="1.0" pitch="-2%">',
      whisper: '<prosody volume="x-soft" rate="0.85" pitch="-10%">',
      mysterious: '<prosody pitch="-8%" rate="0.88" range="narrow">'
    };

    if (toneWrappers[tone]) {
      enhanced = `${toneWrappers[tone]}${enhanced}</prosody>`;
    }

    // Add emotional bookends for better flow
    const bookends = {
      inspiring: { start: '<break time="500ms"/>', end: '<break time="800ms"/>' },
      dramatic: { start: '<break time="700ms"/>', end: '<break time="1s"/>' },
      whisper: { start: '<break time="400ms"/>', end: '<break time="600ms"/>' }
    };

    if (bookends[tone as keyof typeof bookends]) {
      const bookend = bookends[tone as keyof typeof bookends];
      enhanced = `${bookend.start}${enhanced}${bookend.end}`;
    }

    return `<speak>${enhanced}</speak>`;
  }

  // Main voice generation method with caching
  async generateVoice(
    text: string, 
    mode?: keyof typeof this.voiceProfiles,
    tone: string = 'neutral'
  ): Promise<Buffer> {
    try {
      // Auto-detect mode if not specified
      if (!mode) {
        const emotion = this.detectEmotion(text);
        mode = this.selectModeByEmotion(emotion);
        console.log(`🎭 Auto-selected mode: ${mode} (emotion: ${emotion})`);
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(text, mode, tone);
      const cachedAudio = await this.checkCache(cacheKey);
      if (cachedAudio) {
        return cachedAudio;
      }

      // Enhance text with SSML
      const enhancedText = this.enhanceText(text, tone);
      
      // Apply human variation to voice settings
      const baseProfile = this.voiceProfiles[mode];
      const voiceSettings = DynamicVoiceModulation.addHumanVariation({
        stability: baseProfile.stability,
        similarity_boost: baseProfile.similarity_boost,
        style: baseProfile.style
      });

      // Generate voice via ElevenLabs
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${NICOLE_VOICE_ID}`,
        {
          text: enhancedText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings
        },
        {
          headers: {
            'xi-api-key': API_KEY!,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          responseType: 'arraybuffer'
        }
      );

      const audioBuffer = Buffer.from(response.data);
      
      // Save to cache
      await this.saveToCache(cacheKey, audioBuffer);

      return audioBuffer;
    } catch (error) {
      console.error('Bambai Voice Generation Error:', error);
      throw error;
    }
  }

  // Generate voice with language support (Module 117)
  async generateMultilingualVoice(
    text: string,
    language: string = 'en',
    mode: keyof typeof this.voiceProfiles = 'poeticStoryteller'
  ): Promise<Buffer> {
    // Language-specific adjustments
    const languageAdjustments: Record<string, Record<string, number>> = {
      'es': { style: 0.5, similarity_boost: 0.7 },
      'fr': { style: 0.4, similarity_boost: 0.75 },
      'hi': { style: 0.45, similarity_boost: 0.8 },
      'de': { style: 0.35, similarity_boost: 0.85 }
    };

    const baseSettings = this.voiceProfiles[mode];
    const adjustedSettings = {
      ...baseSettings,
      ...(languageAdjustments[language] || {})
    };
    
    console.log('Multilingual voice settings:', adjustedSettings);

    // Generate with language tag
    const languageText = `<speak><lang xml:lang="${language}">${text}</lang></speak>`;
    
    return this.generateVoice(languageText, mode, 'neutral');
  }

  // Stream voice for real-time applications
  async *streamVoice(
    text: string,
    mode: keyof typeof this.voiceProfiles = 'wiseMentor'
  ): AsyncGenerator<Buffer> {
    // Split text into sentences for streaming
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    for (const sentence of sentences) {
      const audio = await this.generateVoice(sentence.trim(), mode);
      yield audio;
    }
  }

  // Clear voice cache
  async clearCache(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.cacheDir, file)))
      );
      console.log('🧹 Voice cache cleared');
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

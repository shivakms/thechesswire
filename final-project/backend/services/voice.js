const { ElevenLabs } = require('elevenlabs');
const { trackVoiceUsage } = require('./database');
const { logSecurityEvent } = require('./security');

let elevenLabsClient;

const initializeVoiceService = async () => {
  try {
    elevenLabsClient = new ElevenLabs({
      apiKey: process.env.ELEVENLABS_API_KEY
    });
    
    console.log('✅ Voice service initialized');
  } catch (error) {
    console.error('❌ Voice service initialization failed:', error);
    throw error;
  }
};

// Voice mode configurations
const VOICE_MODES = {
  calm: {
    voiceId: 'PmypFHWgqk9ACZdL8ugT', // Female voice
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.0,
    useSpeakerBoost: true
  },
  expressive: {
    voiceId: 'PmypFHWgqk9ACZdL8ugT',
    stability: 0.3,
    similarityBoost: 0.75,
    style: 0.5,
    useSpeakerBoost: true
  },
  dramatic: {
    voiceId: 'PmypFHWgqk9ACZdL8ugT',
    stability: 0.2,
    similarityBoost: 0.75,
    style: 0.8,
    useSpeakerBoost: true
  },
  poetic: {
    voiceId: 'PmypFHWgqk9ACZdL8ugT',
    stability: 0.4,
    similarityBoost: 0.75,
    style: 0.6,
    useSpeakerBoost: true
  }
};

const generateVoice = async (text, mode = 'calm', userId = null) => {
  try {
    const startTime = Date.now();
    
    // Validate input
    if (!text || text.trim().length === 0) {
      throw new Error('Text is required for voice generation');
    }
    
    if (!VOICE_MODES[mode]) {
      throw new Error(`Invalid voice mode: ${mode}`);
    }
    
    // Check text length limits
    const textLength = text.length;
    if (textLength > 5000) {
      throw new Error('Text too long. Maximum 5000 characters allowed.');
    }
    
    // Get voice configuration
    const voiceConfig = VOICE_MODES[mode];
    
    // Generate voice using ElevenLabs
    const audioBuffer = await elevenLabsClient.textToSpeech({
      text: text,
      voiceId: voiceConfig.voiceId,
      voiceSettings: {
        stability: voiceConfig.stability,
        similarityBoost: voiceConfig.similarityBoost,
        style: voiceConfig.style,
        useSpeakerBoost: voiceConfig.useSpeakerBoost
      }
    });
    
    const generationTime = Date.now() - startTime;
    
    // Calculate API cost (approximate)
    const apiCost = calculateVoiceCost(textLength, mode);
    
    // Track usage if user is provided
    if (userId) {
      await trackVoiceUsage(
        userId,
        mode,
        textLength,
        Math.round(generationTime / 1000),
        apiCost
      );
    }
    
    // Log successful generation
    await logSecurityEvent({
      userId,
      eventType: 'voice_generation_success',
      details: {
        mode,
        textLength,
        generationTime,
        apiCost
      }
    });
    
    return {
      audioBuffer,
      duration: Math.round(generationTime / 1000),
      cost: apiCost,
      mode,
      textLength
    };
    
  } catch (error) {
    console.error('Voice generation failed:', error);
    
    // Log failed generation
    await logSecurityEvent({
      userId,
      eventType: 'voice_generation_failed',
      details: {
        mode,
        textLength: text?.length || 0,
        error: error.message
      }
    });
    
    throw error;
  }
};

const calculateVoiceCost = (textLength, mode) => {
  // ElevenLabs pricing (approximate)
  const baseCostPerCharacter = 0.000024; // $0.024 per 1000 characters
  const modeMultiplier = {
    calm: 1.0,
    expressive: 1.2,
    dramatic: 1.5,
    poetic: 1.3
  };
  
  return (textLength * baseCostPerCharacter * modeMultiplier[mode]).toFixed(4);
};

const getAvailableVoices = async () => {
  try {
    const voices = await elevenLabsClient.voices.getAll();
    return voices.map(voice => ({
      id: voice.voice_id,
      name: voice.name,
      category: voice.category,
      description: voice.labels?.description || '',
      previewUrl: voice.preview_url
    }));
  } catch (error) {
    console.error('Failed to get available voices:', error);
    throw error;
  }
};

const validateVoiceMode = (mode) => {
  return Object.keys(VOICE_MODES).includes(mode);
};

const getVoiceModeConfig = (mode) => {
  return VOICE_MODES[mode] || VOICE_MODES.calm;
};

// Batch voice generation for multiple texts
const generateBatchVoice = async (texts, mode = 'calm', userId = null) => {
  const results = [];
  
  for (const text of texts) {
    try {
      const result = await generateVoice(text, mode, userId);
      results.push({
        text,
        success: true,
        ...result
      });
    } catch (error) {
      results.push({
        text,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
};

// Voice analysis and optimization
const analyzeVoiceQuality = async (audioBuffer) => {
  // This would integrate with audio analysis tools
  // For now, return basic metrics
  return {
    duration: audioBuffer.length / 22050, // Assuming 22.05kHz sample rate
    quality: 'high',
    format: 'mp3'
  };
};

// Voice caching system
const voiceCache = new Map();

const getCachedVoice = (text, mode) => {
  const cacheKey = `${text}-${mode}`;
  const cached = voiceCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
    // Cache valid for 24 hours
    return cached.audioBuffer;
  }
  
  return null;
};

const cacheVoice = (text, mode, audioBuffer) => {
  const cacheKey = `${text}-${mode}`;
  voiceCache.set(cacheKey, {
    audioBuffer,
    timestamp: Date.now()
  });
  
  // Limit cache size
  if (voiceCache.size > 1000) {
    const firstKey = voiceCache.keys().next().value;
    voiceCache.delete(firstKey);
  }
};

// Enhanced voice generation with caching
const generateVoiceWithCache = async (text, mode = 'calm', userId = null) => {
  // Check cache first
  const cachedAudio = getCachedVoice(text, mode);
  if (cachedAudio) {
    return {
      audioBuffer: cachedAudio,
      duration: 0,
      cost: 0,
      mode,
      textLength: text.length,
      cached: true
    };
  }
  
  // Generate new voice
  const result = await generateVoice(text, mode, userId);
  
  // Cache the result
  cacheVoice(text, mode, result.audioBuffer);
  
  return {
    ...result,
    cached: false
  };
};

module.exports = {
  initializeVoiceService,
  generateVoice,
  generateVoiceWithCache,
  generateBatchVoice,
  getAvailableVoices,
  validateVoiceMode,
  getVoiceModeConfig,
  analyzeVoiceQuality,
  calculateVoiceCost
}; 
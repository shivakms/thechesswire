const axios = require('axios');
const fs = require('fs');

const API_KEY = 'sk_8777e05939b811078e4a6c2d51e501cf6e9e7d5e4d933273';  // Replace with your ElevenLabs API key
const VOICE_ID = 'piTKgcLEGmPE4e6mEKli'; // Nicole's voice ID

const text = "Sometimes the board reveals mysteries even we cannot foresee. Let's return to familiar squares...";
const audioFilePath = './public/audio/bambai-500-whisper.mp3';

async function generateBambaiWhisper() {
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.45,        // Slightly higher for consistency
          similarity_boost: 0.75, // Balanced for natural sound
          style: 0.3,            // Add some style variation
          use_speaker_boost: true // Enhance voice characteristics
        }
      },
      {
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer'
      }
    );

    // Save the audio file
    fs.writeFileSync(audioFilePath, Buffer.from(response.data));
    console.log('✨ Bambai AI whisper generated successfully!');
    
  } catch (error) {
    console.error('Error generating Bambai AI voice:', error.response?.data || error.message);
  }
}

// Generate different voice modes
async function generateBambaiVoiceModes() {
  const voiceModes = {
    whisper: {
      text: "Sometimes the board reveals mysteries even we cannot foresee...",
      settings: { stability: 0.65, similarity_boost: 0.85, style: 0.2 }
    },
    dramatic: {
      text: "A knight... for the soul of the game!",
      settings: { stability: 0.35, similarity_boost: 0.65, style: 0.5 }
    },
    calm: {
      text: "The board is quiet now. Let's just be still, and think.",
      settings: { stability: 0.75, similarity_boost: 0.80, style: 0.1 }
    },
    poetic: {
      text: "You weren't just learning chess. You were becoming someone.",
      settings: { stability: 0.50, similarity_boost: 0.70, style: 0.4 }
    }
  };
  
  // Generate each mode...
}

generateBambaiWhisper();
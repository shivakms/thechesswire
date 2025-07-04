// Filename: src/scripts/generateErrorPageAudio.ts

import { BambaiVoiceEngine } from '../lib/voice/BambaiVoiceEngine';
import fs from 'fs/promises';
import path from 'path';

async function generateErrorPageWhispers() {
  const bambai = new BambaiVoiceEngine();
  
  // Multiple professional variations for A/B testing
  const variations = [
    {
      text: "Sometimes the board reveals mysteries... " +
            "*even we* cannot foresee. <break time='800ms'/> " +
            "Every great journey includes ~unexpected detours~. " +
            "Shall we return to familiar squares?",
      tone: 'thoughtful'
    },
    {
      text: "Ah... we've wandered into ~uncharted territory~. " +
            "<break time='600ms'/> But you know what? " +
            "*The best discoveries* often come from getting lost. " +
            "Let's find our way back together.",
      tone: 'inspiring'
    },
    {
      text: "Even *Stockfish* encounters positions it cannot evaluate. " +
            "<break time='700ms'/> This is simply... " +
            "~a reminder of chess's infinite mystery~. " +
            "Ready to continue our journey?",
      tone: 'calm'
    }
  ];

  // Create audio directory if it doesn't exist
  const audioDir = path.join(process.cwd(), 'public', 'audio');
  await fs.mkdir(audioDir, { recursive: true });

  // Generate all variations
  for (let i = 0; i < variations.length; i++) {
    try {
      const audio = await bambai.generateVoice(
        variations[i].text,
        'thoughtfulPhilosopher',
        variations[i].tone
      );
      
      const filename = path.join(audioDir, `bambai-500-whisper-v${i + 1}.mp3`);
      await fs.writeFile(filename, audio);
      
      console.log(`✅ Generated: ${filename}`);
    } catch (error) {
      console.error(`❌ Failed to generate variation ${i + 1}:`, error);
    }
  }
}

// Run the script
generateErrorPageWhispers().catch(console.error);
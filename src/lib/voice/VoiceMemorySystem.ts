// Filename: src/lib/voice/VoiceMemorySystem.ts

import { BambaiVoiceEngine } from './BambaiVoiceEngine';

export class VoiceMemorySystem {
  private userMemories: Map<string, UserMemory> = new Map();
  private bambai: BambaiVoiceEngine;

  constructor() {
    this.bambai = new BambaiVoiceEngine();
  }

  // Store user interaction memory
  async rememberUser(userId: string, event: MemoryEvent): Promise<void> {
    if (!this.userMemories.has(userId)) {
      this.userMemories.set(userId, {
        userId,
        firstSeen: new Date(),
        memories: [],
        patterns: {
          favoriteOpenings: [],
          commonMistakes: [],
          emotionalMoments: []
        }
      });
    }

    const memory = this.userMemories.get(userId)!;
    memory.memories.push(event);
    
    // Update patterns
    if (event.type === 'opening') {
      memory.patterns.favoriteOpenings.push(event.data);
    } else if (event.type === 'mistake') {
      memory.patterns.commonMistakes.push(event.data);
    } else if (event.type === 'emotion') {
      memory.patterns.emotionalMoments.push(event.data);
    }
  }

  // Generate personalized narration with memories
  async generatePersonalizedNarration(
    userId: string, 
    baseText: string,
    context: 'game' | 'analysis' | 'welcome'
  ): Promise<Buffer> {
    const memory = this.userMemories.get(userId);
    
    if (!memory || memory.memories.length === 0) {
      // New user - welcoming tone
      const welcomeText = "Welcome to TheChessWire... " +
        "~I'm excited to discover your chess story~. " +
        baseText;
      return this.bambai.generateVoice(welcomeText, 'wiseMentor', 'inspiring');
    }

    // Add memory callbacks
    let personalizedText = baseText;
    
    if (context === 'game' && memory.patterns.commonMistakes.length > 0) {
      const lastMistake = memory.patterns.commonMistakes[memory.patterns.commonMistakes.length - 1];
      personalizedText = `_I remember..._ last time you struggled with ${lastMistake}. ` +
        "<break time='500ms'/> " + baseText;
    } else if (context === 'welcome') {
      const daysSinceFirst = Math.floor((Date.now() - memory.firstSeen.getTime()) / (1000 * 60 * 60 * 24));
      personalizedText = `*${daysSinceFirst} days* of chess journey together... ` +
        "<break time='400ms'/> " + baseText;
    }

    return this.bambai.generateVoice(personalizedText, 'thoughtfulPhilosopher', 'thoughtful');
  }

  // Generate weekly reflection
  async generateWeeklyReflection(userId: string): Promise<Buffer> {
    const memory = this.userMemories.get(userId);
    if (!memory) {
      return this.bambai.generateVoice(
        "Your chess journey begins here. ~Let's make it memorable~.",
        'wiseMentor',
        'inspiring'
      );
    }

    const weekMemories = memory.memories.filter(m => 
      Date.now() - m.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
    );

    const sacrificeCount = weekMemories.filter(m => m.type === 'sacrifice').length;
    const blunderCount = weekMemories.filter(m => m.type === 'mistake').length;
    
    const reflection = `This week... <break time='600ms'/> ` +
      `You *sacrificed ${sacrificeCount} pieces* for glory. ` +
      `You ~stumbled ${blunderCount} times~ but kept playing. ` +
      `<break time='500ms'/> _That's growth_. That's *courage*.`;

    return this.bambai.generateVoice(reflection, 'poeticStoryteller', 'inspiring');
  }
}

interface UserMemory {
  userId: string;
  firstSeen: Date;
  memories: MemoryEvent[];
  patterns: {
    favoriteOpenings: string[];
    commonMistakes: string[];
    emotionalMoments: string[];
  };
}

interface MemoryEvent {
  type: 'game' | 'opening' | 'mistake' | 'brilliancy' | 'sacrifice' | 'emotion';
  data: string;
  timestamp: Date;
  emotion?: 'joy' | 'frustration' | 'surprise' | 'pride';
}
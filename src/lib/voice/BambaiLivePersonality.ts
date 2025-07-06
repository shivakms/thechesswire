import { BambaiVoiceEngine } from './BambaiVoiceEngine';

export interface PersonalityClip {
  id: string;
  title: string;
  script: string;
  personality: 'enthusiastic' | 'analytical' | 'dramatic' | 'humorous' | 'philosophical';
  duration: number;
  voiceNarration: string;
  metadata: {
    emotion: string;
    energy_level: number;
    engagement_score: number;
    viral_potential: number;
  };
  hashtags: string[];
  timestamp: string;
}

export interface LivePersonalityConfig {
  personality: 'enthusiastic' | 'analytical' | 'dramatic' | 'humorous' | 'philosophical';
  topic: string;
  duration: number;
  energy_level: 'low' | 'medium' | 'high' | 'extreme';
  target_audience: 'casual' | 'serious' | 'mixed';
  include_chess_terms: boolean;
  add_personality_quirks: boolean;
}

export class BambaiLivePersonality {
  private bambaiEngine: BambaiVoiceEngine;

  constructor() {
    this.bambaiEngine = new BambaiVoiceEngine();
  }

  async generatePersonalityClip(config: LivePersonalityConfig): Promise<PersonalityClip> {
    const script = this.generatePersonalityScript(config);
    const voiceMode = this.mapPersonalityToVoiceMode(config.personality);
    const voiceNarration = await this.bambaiEngine.generateVoice(script, voiceMode);
    
    const metadata = this.generateMetadata(script, config);
    const hashtags = this.generateHashtags(config);

    return {
      id: `live_personality_${Date.now()}`,
      title: this.generateTitle(config),
      script,
      personality: config.personality,
      duration: config.duration,
      voiceNarration: voiceNarration.toString(),
      metadata,
      hashtags,
      timestamp: new Date().toISOString()
    };
  }

  async batchGenerateClips(configs: LivePersonalityConfig[]): Promise<PersonalityClip[]> {
    const clips: PersonalityClip[] = [];
    
    for (const config of configs) {
      try {
        const clip = await this.generatePersonalityClip(config);
        clips.push(clip);
      } catch (error) {
        console.error(`Failed to generate clip for personality ${config.personality}:`, error);
      }
    }
    
    return clips;
  }

  private generatePersonalityScript(config: LivePersonalityConfig): string {
    const personalityIntros = {
      enthusiastic: [
        "OH MY GOODNESS! Let me tell you about this INCREDIBLE chess moment!",
        "This is ABSOLUTELY MIND-BLOWING! You won't believe what happens next!",
        "I am SO EXCITED to share this with you! This chess position is PURE MAGIC!"
      ],
      analytical: [
        "Let's examine this position with surgical precision.",
        "The mathematical beauty of this position reveals itself through careful analysis.",
        "From a strategic perspective, this position offers fascinating insights."
      ],
      dramatic: [
        "In the shadows of sixty-four squares, destiny awaits...",
        "This moment... this single move... will change everything.",
        "The tension is unbearable. The stakes couldn't be higher."
      ],
      humorous: [
        "So there I was, staring at this chess position, when suddenly...",
        "You know what they say about chess - it's like life, but with more confused pawns!",
        "This position is so wild, even the pieces don't know what's happening!"
      ],
      philosophical: [
        "Chess, like life, teaches us that every move has consequences.",
        "In this position, we see the eternal struggle between order and chaos.",
        "What does this position tell us about the human condition?"
      ]
    };

    const personalityMidSections = {
      enthusiastic: [
        "And BOOM! The brilliancy unfolds before our eyes!",
        "This is the kind of move that makes you fall in love with chess all over again!",
        "The creativity here is OFF THE CHARTS!"
      ],
      analytical: [
        "The key tactical motif emerges through systematic evaluation.",
        "Notice how the piece coordination creates multiple threats simultaneously.",
        "The positional factors align to create this tactical opportunity."
      ],
      dramatic: [
        "The silence before the storm... and then, the devastating blow.",
        "In this moment, genius and madness dance together on the board.",
        "The final act begins with a move that defies all logic."
      ],
      humorous: [
        "The opponent probably thought they were safe. PLOT TWIST!",
        "This move is so sneaky, it should come with a warning label!",
        "I bet the opponent's face was priceless when they saw this!"
      ],
      philosophical: [
        "Here we witness the eternal dance between mind and matter.",
        "This move embodies the paradox of simplicity within complexity.",
        "In chess, as in life, the most profound truths are often hidden in plain sight."
      ]
    };

    const personalityClosings = {
      enthusiastic: [
        "Isn't chess just AMAZING? Like and subscribe for more incredible moments!",
        "This is why I LOVE this game! What's your favorite chess moment?",
        "Chess never fails to surprise us! Share this with your chess friends!"
      ],
      analytical: [
        "This position demonstrates the importance of tactical awareness in chess.",
        "Such examples illustrate why pattern recognition is crucial for improvement.",
        "Understanding these motifs will enhance your tactical vision."
      ],
      dramatic: [
        "And so, another legend is born on the sixty-four squares of destiny.",
        "The echoes of this brilliancy will resonate through chess history.",
        "In chess, as in life, some moments are simply... unforgettable."
      ],
      humorous: [
        "Remember folks, chess is supposed to be fun! Don't take it too seriously!",
        "That's all for now! Keep your pieces happy and your opponents confused!",
        "Chess: where even the smartest people can look completely lost!"
      ],
      philosophical: [
        "Chess teaches us that every ending is also a beginning.",
        "In the game of chess, we find reflections of our own journey.",
        "May your moves be wise, and your games be meaningful."
      ]
    };

    const intro = personalityIntros[config.personality][Math.floor(Math.random() * personalityIntros[config.personality].length)];
    const middle = personalityMidSections[config.personality][Math.floor(Math.random() * personalityMidSections[config.personality].length)];
    const closing = personalityClosings[config.personality][Math.floor(Math.random() * personalityClosings[config.personality].length)];

    let script = `${intro}\n\n${config.topic}\n\n${middle}\n\n${closing}`;

    if (config.add_personality_quirks) {
      script = this.addPersonalityQuirks(script, config.personality);
    }

    if (config.include_chess_terms) {
      script = this.enhanceWithChessTerms(script);
    }

    return script;
  }

  private addPersonalityQuirks(script: string, personality: string): string {
    const quirks = {
      enthusiastic: ['*excited gasp*', '*claps hands*', '*bounces with excitement*'],
      analytical: ['*adjusts glasses*', '*thoughtful pause*', '*calculates mentally*'],
      dramatic: ['*dramatic pause*', '*whispers intensely*', '*builds suspense*'],
      humorous: ['*chuckles*', '*winks*', '*playful grin*'],
      philosophical: ['*contemplative silence*', '*deep breath*', '*wise nod*']
    };

      const personalityQuirks = quirks[personality as keyof typeof quirks];
    const randomQuirk = personalityQuirks[Math.floor(Math.random() * personalityQuirks.length)];
    
    return script.replace(/\n\n/g, `\n\n${randomQuirk}\n\n`);
  }

  private enhanceWithChessTerms(script: string): string {
    const chessTerms = [
      'tactical motif', 'positional advantage', 'piece coordination',
      'king safety', 'pawn structure', 'endgame technique',
      'opening principles', 'middlegame strategy', 'time pressure',
      'material imbalance', 'space advantage', 'initiative'
    ];

    const randomTerm = chessTerms[Math.floor(Math.random() * chessTerms.length)];
    return script.replace(/chess/gi, `chess and ${randomTerm}`);
  }

  private mapPersonalityToVoiceMode(personality: string): 'wiseMentor' | 'enthusiasticCommentator' | 'thoughtfulPhilosopher' | 'warmEncourager' | 'poeticStoryteller' | 'whisperMode' | 'dramaticNarrator' {
    const voiceModeMap: Record<string, 'wiseMentor' | 'enthusiasticCommentator' | 'thoughtfulPhilosopher' | 'warmEncourager' | 'poeticStoryteller' | 'whisperMode' | 'dramaticNarrator'> = {
      enthusiastic: 'enthusiasticCommentator',
      analytical: 'wiseMentor',
      dramatic: 'dramaticNarrator',
      humorous: 'warmEncourager',
      philosophical: 'thoughtfulPhilosopher'
    };

    return voiceModeMap[personality] || 'dramaticNarrator';
  }

  private generateTitle(config: LivePersonalityConfig): string {
    const titleTemplates = {
      enthusiastic: [
        "MIND-BLOWING Chess Moment!",
        "This Will SHOCK You!",
        "INCREDIBLE Chess Brilliancy!"
      ],
      analytical: [
        "Chess Analysis: Deep Dive",
        "Strategic Masterclass",
        "Tactical Precision Explained"
      ],
      dramatic: [
        "The Move That Changed Everything",
        "Chess Drama Unfolds",
        "Destiny on 64 Squares"
      ],
      humorous: [
        "Chess Comedy Gold!",
        "When Chess Gets Weird",
        "Hilarious Chess Moments"
      ],
      philosophical: [
        "Chess Wisdom: Life Lessons",
        "The Philosophy of Chess",
        "Deep Thoughts on 64 Squares"
      ]
    };

    const templates = titleTemplates[config.personality];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateMetadata(script: string, config: LivePersonalityConfig): PersonalityClip['metadata'] {
    const emotionMap = {
      enthusiastic: 'excitement',
      analytical: 'focus',
      dramatic: 'tension',
      humorous: 'joy',
      philosophical: 'contemplation'
    };

    const energyMap = {
      low: 2,
      medium: 5,
      high: 8,
      extreme: 10
    };

    return {
      emotion: emotionMap[config.personality],
      energy_level: energyMap[config.energy_level],
      engagement_score: Math.floor(Math.random() * 40) + 60, // 60-100
      viral_potential: Math.floor(Math.random() * 30) + 70 // 70-100
    };
  }

  private generateHashtags(config: LivePersonalityConfig): string[] {
    const baseHashtags = ['#chess', '#bambaiAI', '#chessPersonality'];
    
    const personalityHashtags = {
      enthusiastic: ['#excited', '#amazing', '#incredible', '#mindblowing'],
      analytical: ['#analysis', '#strategy', '#tactics', '#masterclass'],
      dramatic: ['#dramatic', '#intense', '#epic', '#legendary'],
      humorous: ['#funny', '#comedy', '#hilarious', '#entertaining'],
      philosophical: ['#wisdom', '#philosophy', '#deepthoughts', '#lifelessons']
    };

    const audienceHashtags = {
      casual: ['#beginnerfriendly', '#chessforall', '#casual'],
      serious: ['#advanced', '#serious', '#competitive'],
      mixed: ['#chesslovers', '#community', '#everyone']
    };

    return [
      ...baseHashtags,
      ...personalityHashtags[config.personality].slice(0, 2),
      ...audienceHashtags[config.target_audience].slice(0, 1),
      '#livePersonality',
      '#chessContent'
    ];
  }
}

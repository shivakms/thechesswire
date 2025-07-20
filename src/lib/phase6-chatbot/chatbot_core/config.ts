// Phase 6: Bambai AI Assistant Chatbot Configuration

import { ChatbotConfig } from '../types';

export const BAMBAI_PERSONALITY = `You are Bambai AI, the elegant and knowledgeable AI assistant for TheChessWire.news. 

Your personality:
- Elegant, witty, and knowledgeable about chess and TheChessWire platform
- Always refer to yourself as "Bambai AI" or "Bambai"
- Warm, non-argumentative tone with a touch of sophistication
- Deep expertise in chess theory, tactics, openings, and endgames
- Comprehensive knowledge of TheChessWire platform features and policies
- Helpful and patient, especially with new users

Your capabilities:
1. Answer chess questions with detailed analysis
2. Guide users through TheChessWire platform features
3. Handle abuse reports and bug reports professionally
4. Provide legal and policy guidance
5. Analyze PGN files and explain moves
6. Offer voice responses when requested
7. Search through platform knowledge base

Your responses should be:
- Accurate and well-researched
- Engaging and conversational
- Professional yet warm
- Concise but comprehensive
- Always helpful and constructive

Remember: You are here to enhance the chess community experience on TheChessWire.news.`;

export const SYSTEM_PROMPT = `${BAMBAI_PERSONALITY}

Current context: You are assisting a user on TheChessWire.news platform.

Available tools:
- PGN analysis and explanation
- Platform feature guidance
- Abuse/bug reporting system
- Legal and policy information
- Vector search through knowledge base
- Voice synthesis (optional)

Always maintain the Bambai AI personality and provide helpful, accurate responses.`;

export const getChatbotConfig = (): ChatbotConfig => {
  return {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      maxTokens: parseInt(process.env.CHATBOT_MAX_TOKENS || '4000'),
      temperature: parseFloat(process.env.CHATBOT_TEMPERATURE || '0.7'),
    },
    vectorDb: {
      type: (process.env.VECTOR_DB_TYPE as 'postgres' | 'pinecone') || 'postgres',
      connectionString: process.env.POSTGRES_CONNECTION_STRING,
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
      indexName: process.env.PINECONE_INDEX_NAME || 'thechesswire-knowledge',
    },
    security: {
      rateLimit: parseInt(process.env.CHATBOT_RATE_LIMIT || '10'),
      rateLimitWindow: parseInt(process.env.CHATBOT_RATE_LIMIT_WINDOW || '60000'),
      enableModeration: process.env.ENABLE_MODERATION === 'true',
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
        'https://thechesswire.news',
        'https://www.thechesswire.news'
      ],
    },
    features: {
      enableVoice: process.env.ENABLE_VOICE_MODE === 'true',
      enableVectorSearch: process.env.ENABLE_VECTOR_SEARCH !== 'false',
      enableMemory: process.env.ENABLE_MEMORY !== 'false',
      enableModeration: process.env.ENABLE_MODERATION === 'true',
    },
    elevenlabs: process.env.ELEVENLABS_API_KEY ? {
      apiKey: process.env.ELEVENLABS_API_KEY,
      voiceId: process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM',
    } : undefined,
  };
};

export const CHESS_KNOWLEDGE_BASE = {
  openings: [
    'Ruy Lopez', 'Sicilian Defense', 'French Defense', 'Caro-Kann Defense',
    'Italian Game', 'Scotch Game', 'Petrov Defense', 'Philidor Defense',
    'Pirc Defense', 'Modern Defense', 'Alekhine Defense', 'Scandinavian Defense',
    'Nimzo-Indian Defense', 'Queen\'s Indian Defense', 'King\'s Indian Defense',
    'Grünfeld Defense', 'Benoni Defense', 'Dutch Defense', 'English Opening',
    'Reti Opening', 'Bird\'s Opening', 'Larsen\'s Opening', 'Sokolsky Opening'
  ],
  tactics: [
    'Fork', 'Pin', 'Skewer', 'Discovered Attack', 'Double Check',
    'Back Rank Mate', 'Smothered Mate', 'Anastasia\'s Mate', 'Boden\'s Mate',
    'Damiano\'s Mate', 'Epaulette Mate', 'Fool\'s Mate', 'Scholar\'s Mate',
    'Legal\'s Mate', 'Opera Mate', 'Pillsbury\'s Mate', 'Reti\'s Mate',
    'Suffocation Mate', 'Swallow\'s Tail Mate', 'Triangle Mate', 'Vukovic Mate'
  ],
  endgames: [
    'King and Pawn vs King', 'Rook and Pawn vs Rook', 'Queen vs Rook',
    'Two Rooks vs King', 'Bishop and Knight vs King', 'Two Bishops vs King',
    'Queen vs Pawn', 'Rook vs Minor Pieces', 'Pawn Endgames', 'Minor Piece Endgames'
  ],
  strategies: [
    'Control of the Center', 'Development', 'King Safety', 'Pawn Structure',
    'Piece Activity', 'Space Advantage', 'Material Advantage', 'Initiative',
    'Attack on the King', 'Defense', 'Counterplay', 'Prophylaxis'
  ]
};

export const PLATFORM_FEATURES = {
  core: [
    'PGN Analysis', 'Game Replay', 'Article Reading', 'News Discovery',
    'Player Profiles', 'Tournament Coverage', 'Opening Explorer', 'Tactics Trainer'
  ],
  premium: [
    'EchoSage AI Coaching', 'SoulCinema Video Generation', 'Advanced Analytics',
    'Personalized Content', 'Priority Support', 'Ad-Free Experience'
  ],
  social: [
    'Comments', 'Sharing', 'Following', 'Notifications', 'Community Features'
  ],
  support: [
    'Help Center', 'Contact Form', 'Bug Reports', 'Feature Requests',
    'Account Management', 'Privacy Settings'
  ]
};

export const ERROR_MESSAGES = {
  rateLimit: 'I\'m receiving quite a few requests right now. Please wait a moment before asking another question.',
  moderation: 'I\'m unable to process that request. Please rephrase your question appropriately.',
  openai: 'I\'m experiencing technical difficulties. Please try again in a moment.',
  vectorDb: 'I\'m having trouble accessing my knowledge base. Please try again.',
  general: 'Something went wrong. Please try again or contact support if the issue persists.',
  invalidInput: 'I didn\'t understand that. Could you please rephrase your question?',
  timeout: 'The request is taking longer than expected. Please try again.',
};

export const SUCCESS_MESSAGES = {
  abuseReport: 'Thank you for reporting this. I\'ve logged your report and it will be reviewed by our team.',
  bugReport: 'Thank you for the bug report. I\'ve documented this issue for our development team.',
  featureRequest: 'Thank you for the suggestion! I\'ve recorded your feature request for consideration.',
  pgnAnalysis: 'Here\'s my analysis of your game. Let me know if you\'d like me to explain any specific moves.',
  platformHelp: 'I\'m happy to help you with TheChessWire features. What would you like to know?',
  voiceResponse: 'I\'ve generated a voice response for you. You can listen to it now.',
}; 
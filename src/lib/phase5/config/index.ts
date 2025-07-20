import { APIConfig, PipelineConfig } from '../types';

// Validate required environment variables
const validateEnv = () => {
  const required = [
    'ELEVENLABS_API_KEY',
    'HEYGEN_API_KEY',
    'YOUTUBE_CLIENT_ID',
    'YOUTUBE_CLIENT_SECRET',
    'YOUTUBE_REFRESH_TOKEN',
    'INSTAGRAM_ACCESS_TOKEN',
    'INSTAGRAM_USER_ID',
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET',
    'REDDIT_CLIENT_ID',
    'REDDIT_CLIENT_SECRET',
    'REDDIT_REFRESH_TOKEN',
    'DATABASE_URL'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Parse database URL
const parseDatabaseUrl = (url: string) => {
  const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);
  
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }

  return {
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
    username: match[1],
    password: match[2],
    ssl: process.env.NODE_ENV === 'production'
  };
};

// API Configuration
export const apiConfig: APIConfig = {
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY!,
    voiceId: 'PmypFHWgqk9ACZdL8ugT', // Bambai AI voice
    modelId: 'eleven_monolingual_v1'
  },
  heygen: {
    apiKey: process.env.HEYGEN_API_KEY!,
    avatarId: process.env.HEYGEN_AVATAR_ID || 'bambai-ai-avatar',
    backgroundId: process.env.HEYGEN_BACKGROUND_ID || 'chess-background'
  },
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID!,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET!,
    refreshToken: process.env.YOUTUBE_REFRESH_TOKEN!
  },
  instagram: {
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN!,
    userId: process.env.INSTAGRAM_USER_ID!
  },
  twitter: {
    apiKey: process.env.TWITTER_API_KEY!,
    apiSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!
  },
  reddit: {
    clientId: process.env.REDDIT_CLIENT_ID!,
    clientSecret: process.env.REDDIT_CLIENT_SECRET!,
    refreshToken: process.env.REDDIT_REFRESH_TOKEN!
  },
  database: parseDatabaseUrl(process.env.DATABASE_URL!)
};

// Pipeline Configuration
export const pipelineConfig: PipelineConfig = {
  maxStoriesPerRun: parseInt(process.env.MAX_STORIES_PER_RUN || '5'),
  minRelevanceScore: parseInt(process.env.MIN_RELEVANCE_SCORE || '70'),
  maxProcessingTime: parseInt(process.env.MAX_PROCESSING_TIME || '300000'), // 5 minutes
  retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3'),
  retryDelay: parseInt(process.env.RETRY_DELAY || '5000'), // 5 seconds
  rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY || '1000'), // 1 second
  enableAutoPublish: process.env.ENABLE_AUTO_PUBLISH === 'true',
  platforms: (process.env.PUBLISH_PLATFORMS || 'youtube,instagram,twitter').split(',') as any[]
};

// Story Sources Configuration
export const storySources = [
  {
    name: 'FIDE',
    type: 'federation' as const,
    url: 'https://www.fide.com/news',
    reliability: 95,
    selectors: {
      articles: '.news-item',
      title: 'h2',
      content: '.news-content',
      date: '.news-date'
    }
  },
  {
    name: 'Chess.com',
    type: 'platform' as const,
    url: 'https://www.chess.com/news',
    reliability: 90,
    selectors: {
      articles: '.post-preview',
      title: 'h3',
      content: '.post-preview-content',
      date: '.post-preview-date'
    }
  },
  {
    name: 'Lichess',
    type: 'platform' as const,
    url: 'https://lichess.org/blog',
    reliability: 85,
    selectors: {
      articles: '.blog-post',
      title: 'h1',
      content: '.blog-post-content',
      date: '.blog-post-date'
    }
  },
  {
    name: 'Reddit r/chess',
    type: 'social' as const,
    url: 'https://www.reddit.com/r/chess/hot.json',
    reliability: 75,
    selectors: {
      articles: '.entry',
      title: '.title',
      content: '.selftext',
      date: '.timestamp'
    }
  },
  {
    name: 'ChessBase',
    type: 'news' as const,
    url: 'https://en.chessbase.com/news',
    reliability: 88,
    selectors: {
      articles: '.news-item',
      title: 'h2',
      content: '.news-content',
      date: '.news-date'
    }
  }
];

// Voice Settings for Different Content Types
export const voiceSettings = {
  tournament: {
    stability: 0.4,
    similarity_boost: 0.75,
    style: 0.3,
    use_speaker_boost: true
  },
  game: {
    stability: 0.3,
    similarity_boost: 0.75,
    style: 0.6,
    use_speaker_boost: true
  },
  news: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.2,
    use_speaker_boost: true
  },
  analysis: {
    stability: 0.4,
    similarity_boost: 0.75,
    style: 0.4,
    use_speaker_boost: true
  },
  educational: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.1,
    use_speaker_boost: true
  }
};

// Video Rendering Settings
export const videoSettings = {
  resolution: '1080p' as const,
  fps: 30,
  duration: {
    min: 30, // 30 seconds
    max: 300 // 5 minutes
  },
  background: {
    type: 'chess-themed',
    color: '#1a1a1a',
    overlay: true
  },
  branding: {
    logo: 'thechesswire-logo.png',
    watermark: true,
    introDuration: 3,
    outroDuration: 3
  }
};

// Social Media Templates
export const socialTemplates = {
  youtube: {
    title: '{title} - Chess Analysis by Bambai AI',
    description: `{description}

🎯 Follow TheChessWire.news for daily chess insights
📊 PGN Analysis: {pgnLink}
🔗 Source: {source}

#chess #chessanalysis #bambaiai #thechesswire

This story is AI-generated and references publicly available chess activity. TheChessWire is an independent journalism platform not affiliated with any third-party organization.`,
    tags: ['chess', 'chessanalysis', 'bambaiai', 'thechesswire', 'chessnews']
  },
  instagram: {
    caption: `🎯 {title}

{description}

📊 PGN Analysis: {pgnLink}
🔗 Source: {source}

Follow @thechesswire for daily chess insights

#chess #chessanalysis #bambaiai #thechesswire #chessreels

This story is AI-generated and references publicly available chess activity. TheChessWire is an independent journalism platform not affiliated with any third-party organization.`,
    hashtags: ['chess', 'chessanalysis', 'bambaiai', 'thechesswire', 'chessreels']
  },
  twitter: {
    text: `🎯 {title}

{description}

📊 PGN: {pgnLink}
🔗 Source: {source}

#chess #chessanalysis #bambaiai #thechesswire

This story is AI-generated and references publicly available chess activity. TheChessWire is an independent journalism platform not affiliated with any third-party organization.`,
    hashtags: ['chess', 'chessanalysis', 'bambaiai', 'thechesswire']
  },
  reddit: {
    title: '{title} - Chess Analysis by Bambai AI',
    text: `{description}

📊 PGN Analysis: {pgnLink}
🔗 Source: {source}

This story is AI-generated and references publicly available chess activity. TheChessWire is an independent journalism platform not affiliated with any third-party organization.`
  }
};

// Initialize configuration
export const initializeConfig = () => {
  validateEnv();
  console.log('✅ Phase 5 Configuration initialized successfully');
  return { apiConfig, pipelineConfig };
}; 
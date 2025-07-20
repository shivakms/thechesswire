export interface ChessStory {
  id: string;
  title: string;
  content: string;
  source: StorySource;
  url: string;
  pgn?: string;
  players?: {
    white: string;
    black: string;
  };
  result?: string;
  event?: string;
  date: string;
  hash: string; // For deduplication
  relevance: number; // 0-100
  category: 'tournament' | 'game' | 'news' | 'analysis' | 'educational';
  tags: string[];
  timestamp: Date;
}

export interface StorySource {
  name: string;
  type: 'federation' | 'platform' | 'social' | 'news' | 'tournament';
  url: string;
  reliability: number; // 0-100
}

export interface NarrativeScript {
  id: string;
  storyId: string;
  intro: string;
  story: string;
  gameHighlight?: string;
  outro: string;
  fullScript: string;
  duration: number; // Estimated duration in seconds
  tone: 'calm' | 'expressive' | 'dramatic' | 'poetic';
  keywords: string[];
  timestamp: Date;
}

export interface VoiceSynthesis {
  id: string;
  narrativeId: string;
  audioUrl: string;
  duration: number;
  fileSize: number;
  quality: 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  timestamp: Date;
}

export interface VideoRender {
  id: string;
  voiceId: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  resolution: '720p' | '1080p' | '4k';
  fileSize: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  timestamp: Date;
}

export interface ThumbnailMetadata {
  id: string;
  videoId: string;
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
  seoKeywords: string[];
  thumbnailUrl: string;
  timestamp: Date;
}

export interface SocialPost {
  id: string;
  videoId: string;
  platform: SocialPlatform;
  postId?: string;
  url?: string;
  status: 'pending' | 'published' | 'failed';
  error?: string;
  engagement?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  timestamp: Date;
}

export type SocialPlatform = 'youtube' | 'instagram' | 'twitter' | 'reddit';

export interface ContentLog {
  id: string;
  storyId: string;
  narrativeId?: string;
  voiceId?: string;
  videoId?: string;
  thumbnailId?: string;
  socialPosts: SocialPost[];
  status: 'processing' | 'completed' | 'failed';
  error?: string;
  processingTime: number; // Total processing time in seconds
  createdAt: Date;
  updatedAt: Date;
}

export interface APIConfig {
  elevenlabs: {
    apiKey: string;
    voiceId: string;
    modelId: string;
  };
  heygen: {
    apiKey: string;
    avatarId: string;
    backgroundId: string;
  };
  youtube: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
  instagram: {
    accessToken: string;
    userId: string;
  };
  twitter: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
  };
  reddit: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
  database: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
  };
}

export interface PipelineConfig {
  maxStoriesPerRun: number;
  minRelevanceScore: number;
  maxProcessingTime: number;
  retryAttempts: number;
  retryDelay: number;
  rateLimitDelay: number;
  enableAutoPublish: boolean;
  platforms: SocialPlatform[];
}

export interface ProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
  duration: number;
  retries: number;
}

export interface StoryFetchResult {
  stories: ChessStory[];
  totalFetched: number;
  uniqueStories: number;
  processingTime: number;
}

export interface NarrativeGenerationResult {
  narrative: NarrativeScript;
  processingTime: number;
}

export interface VoiceSynthesisResult {
  voice: VoiceSynthesis;
  processingTime: number;
}

export interface VideoRenderResult {
  video: VideoRender;
  processingTime: number;
}

export interface PublishingResult {
  posts: SocialPost[];
  totalPublished: number;
  failedPlatforms: SocialPlatform[];
  processingTime: number;
} 
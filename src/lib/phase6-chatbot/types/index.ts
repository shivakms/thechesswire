// Phase 6: Bambai AI Assistant Chatbot Types

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sessionId: string;
  metadata?: {
    source?: string;
    confidence?: number;
    tools?: string[];
    tokens?: number;
  };
}

export interface ChatSession {
  id: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  messageCount: number;
  metadata?: {
    platform?: string;
    referrer?: string;
    language?: string;
  };
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  messageId: string;
  timestamp: Date;
  metadata: {
    confidence: number;
    tools: string[];
    tokens: number;
    processingTime: number;
    vectorMatches?: VectorMatch[];
  };
}

export interface VectorMatch {
  id: string;
  content: string;
  source: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface ChatbotConfig {
  openai: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  vectorDb: {
    type: 'postgres' | 'pinecone';
    connectionString?: string;
    apiKey?: string;
    environment?: string;
    indexName: string;
  };
  security: {
    rateLimit: number;
    rateLimitWindow: number;
    enableModeration: boolean;
    allowedOrigins: string[];
  };
  features: {
    enableVoice: boolean;
    enableVectorSearch: boolean;
    enableMemory: boolean;
    enableModeration: boolean;
  };
  elevenlabs?: {
    apiKey: string;
    voiceId: string;
  };
}

export interface ChatbotTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
}

export interface ModerationResult {
  isToxic: boolean;
  categories: {
    hate: number;
    harassment: number;
    self_harm: number;
    sexual: number;
    violence: number;
  };
  flagged: boolean;
  reason?: string;
}

export interface VectorDocument {
  id: string;
  content: string;
  metadata: {
    source: string;
    type: 'pgn' | 'article' | 'policy' | 'faq';
    title?: string;
    author?: string;
    date?: string;
    tags?: string[];
  };
  embedding?: number[];
}

export interface ChatbotMemory {
  sessionId: string;
  messages: ChatMessage[];
  context: {
    userPreferences: Record<string, any>;
    conversationSummary: string;
    relevantDocuments: VectorDocument[];
  };
  lastUpdated: Date;
}

export interface RateLimitInfo {
  remaining: number;
  resetTime: Date;
  limit: number;
}

export interface ChatbotStats {
  totalSessions: number;
  totalMessages: number;
  averageResponseTime: number;
  successRate: number;
  popularQueries: Array<{
    query: string;
    count: number;
  }>;
  errorRate: number;
}

export type ChatbotCapability = 
  | 'chess_questions'
  | 'platform_support'
  | 'abuse_reporting'
  | 'legal_support'
  | 'pgn_analysis'
  | 'voice_synthesis'
  | 'vector_search';

export interface ChatbotCapabilities {
  [key: string]: {
    enabled: boolean;
    description: string;
    tools: string[];
  };
}

export interface VoiceResponse {
  audioUrl: string;
  duration: number;
  format: string;
  metadata: {
    voiceId: string;
    quality: string;
  };
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: any;
  timestamp: Date;
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    openai: boolean;
    vectorDb: boolean;
    database: boolean;
    memory: boolean;
  };
  timestamp: Date;
  version: string;
} 
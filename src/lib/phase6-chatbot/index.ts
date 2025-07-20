// Phase 6: Bambai AI Assistant Chatbot - Main Module

// Core exports
export { bambaiAgent } from './chatbot_core/agent';
export { getChatbotConfig, BAMBAI_PERSONALITY, SYSTEM_PROMPT } from './chatbot_core/config';

// Vector database exports
export { vectorManager } from './vector_index/vectorManager';

// Utility exports
export { moderationService } from './utils/moderation';
export { pgnExplainer } from './utils/pgn_explainer';

// UI exports
export { default as ChatWidget } from './public_ui/chatWidget';

// Type exports
export type {
  ChatMessage,
  ChatSession,
  ChatResponse,
  VectorMatch,
  ChatbotConfig,
  ChatbotTool,
  ModerationResult,
  VectorDocument,
  ChatbotMemory,
  RateLimitInfo,
  ChatbotStats,
  ChatbotCapability,
  ChatbotCapabilities,
  VoiceResponse,
  ErrorResponse,
  HealthCheck,
} from './types';

// API exports
export { POST as askChatbot, OPTIONS as chatbotOptions } from './api/ask';

// Initialize the chatbot system
import { bambaiAgent } from './chatbot_core/agent';
import { vectorManager } from './vector_index/vectorManager';
import { moderationService } from './utils/moderation';
import { pgnExplainer } from './utils/pgn_explainer';
import logger from '@/lib/logger';

/**
 * Initialize the Bambai AI Assistant Chatbot system
 */
export async function initializeChatbot(): Promise<void> {
  try {
    logger.info('🚀 Initializing Bambai AI Assistant Chatbot...');
    
    // Initialize vector database
    await vectorManager.initialize();
    
    // Initialize the main agent
    await bambaiAgent.initialize();
    
    logger.info('✅ Bambai AI Assistant Chatbot initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize Bambai AI Assistant Chatbot', error);
    throw error;
  }
}

/**
 * Health check for the chatbot system
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    agent: boolean;
    vectorDb: boolean;
    moderation: boolean;
  };
  timestamp: Date;
  version: string;
}> {
  try {
    const agentHealth = await bambaiAgent.healthCheck();
    const vectorHealth = await vectorManager.healthCheck();
    
    const checks = {
      agent: agentHealth,
      vectorDb: vectorHealth,
      moderation: true, // Moderation service is always available
    };
    
    const allHealthy = Object.values(checks).every(check => check);
    const anyHealthy = Object.values(checks).some(check => check);
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (allHealthy) {
      status = 'healthy';
    } else if (anyHealthy) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }
    
    return {
      status,
      checks,
      timestamp: new Date(),
      version: '1.0.0',
    };
  } catch (error) {
    logger.error('❌ Health check failed', error);
    return {
      status: 'unhealthy',
      checks: {
        agent: false,
        vectorDb: false,
        moderation: false,
      },
      timestamp: new Date(),
      version: '1.0.0',
    };
  }
}

/**
 * Get chatbot statistics
 */
export async function getChatbotStats(): Promise<{
  totalSessions: number;
  totalMessages: number;
  averageResponseTime: number;
  successRate: number;
  popularQueries: Array<{ query: string; count: number }>;
  errorRate: number;
}> {
  // This would typically fetch from a database
  // For now, return mock data
  return {
    totalSessions: 0,
    totalMessages: 0,
    averageResponseTime: 0,
    successRate: 1.0,
    popularQueries: [],
    errorRate: 0,
  };
}

/**
 * Process a chat message (convenience function)
 */
export async function processMessage(
  message: string,
  sessionId: string,
  userId?: string
): Promise<{
  message: string;
  sessionId: string;
  messageId: string;
  timestamp: Date;
  metadata: {
    confidence: number;
    tools: string[];
    tokens: number;
    processingTime: number;
    vectorMatches?: any[];
  };
}> {
  return await bambaiAgent.processMessage(message, sessionId, userId);
}

/**
 * Add document to vector database
 */
export async function addDocument(document: {
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
}): Promise<void> {
  await vectorManager.addDocument(document);
}

/**
 * Search vector database
 */
export async function searchVectorDatabase(
  query: string,
  limit: number = 5
): Promise<Array<{
  id: string;
  content: string;
  source: string;
  score: number;
  metadata?: Record<string, any>;
}>> {
  return await vectorManager.search(query, limit);
}

/**
 * Moderate content
 */
export async function moderateContent(text: string): Promise<{
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
}> {
  return await moderationService.moderate(text);
}

/**
 * Analyze PGN
 */
export async function analyzePGN(pgnText: string): Promise<{
  metadata: {
    event?: string;
    site?: string;
    date?: string;
    white?: string;
    black?: string;
    result?: string;
    whiteElo?: string;
    blackElo?: string;
    opening?: string;
    eco?: string;
  };
  moves: Array<{
    moveNumber: number;
    whiteMove?: string;
    blackMove?: string;
    annotation?: string;
    comment?: string;
  }>;
  analysis: {
    opening: string;
    middlegame: string;
    endgame: string;
    tactics: string[];
    mistakes: string[];
    highlights: string[];
  };
  summary: string;
}> {
  return await pgnExplainer.analyzePGN(pgnText);
}

// Auto-initialize when module is imported
if (typeof window === 'undefined') {
  // Server-side initialization
  initializeChatbot().catch(error => {
    logger.error('❌ Failed to auto-initialize chatbot', error);
  });
}

export default {
  initializeChatbot,
  healthCheck,
  getChatbotStats,
  processMessage,
  addDocument,
  searchVectorDatabase,
  moderateContent,
  analyzePGN,
  bambaiAgent,
  vectorManager,
  moderationService,
  pgnExplainer,
}; 
// Phase 6: Bambai AI Assistant Core Agent

import { ChatOpenAI } from '@langchain/openai';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import { ChatMessage, ChatResponse, ChatbotConfig, VectorMatch } from '../types';
import { SYSTEM_PROMPT, getChatbotConfig } from './config';
import { vectorManager } from '../vector_index/vectorManager';
import { moderationService } from '../utils/moderation';
import logger from '@/lib/logger';

export class BambaiAgent {
  private llm: ChatOpenAI;
  private chain: ConversationChain;
  private memory: BufferMemory;
  private config: ChatbotConfig;
  private isInitialized = false;

  constructor() {
    this.config = getChatbotConfig();
    this.llm = new ChatOpenAI({
      openAIApiKey: this.config.openai.apiKey,
      modelName: this.config.openai.model,
      maxTokens: this.config.openai.maxTokens,
      temperature: this.config.openai.temperature,
    });

    this.memory = new BufferMemory({
      returnMessages: true,
      memoryKey: 'history',
    });

    this.chain = new ConversationChain({
      llm: this.llm,
      memory: this.memory,
      verbose: false,
    });
  }

  async initialize(): Promise<void> {
    try {
      await vectorManager.initialize();
      this.isInitialized = true;
      logger.info('✅ Bambai AI Agent initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Bambai AI Agent', error);
      throw error;
    }
  }

  async processMessage(
    message: string,
    sessionId: string,
    userId?: string
  ): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Input validation
      if (!message || message.trim().length === 0) {
        throw new Error('Empty message received');
      }

      // Moderation check
      if (this.config.features.enableModeration) {
        const moderationResult = await moderationService.moderate(message);
        if (moderationResult.isToxic) {
          return {
            message: 'I\'m unable to process that request. Please rephrase your question appropriately.',
            sessionId,
            messageId: `msg-${Date.now()}`,
            timestamp: new Date(),
            metadata: {
              confidence: 0,
              tools: ['moderation'],
              tokens: 0,
              processingTime: Date.now() - startTime,
            },
          };
        }
      }

      // Vector search for relevant context
      let vectorMatches: VectorMatch[] = [];
      if (this.config.features.enableVectorSearch) {
        try {
          vectorMatches = await vectorManager.search(message, 3);
        } catch (error) {
          logger.warn('⚠️ Vector search failed, continuing without context', error);
        }
      }

      // Build context from vector matches
      const context = this.buildContext(vectorMatches);

      // Generate response
      const response = await this.generateResponse(message, context);

      const processingTime = Date.now() - startTime;

      return {
        message: response,
        sessionId,
        messageId: `msg-${Date.now()}`,
        timestamp: new Date(),
        metadata: {
          confidence: 0.9,
          tools: ['llm', 'vector_search'],
          tokens: this.estimateTokens(message + response),
          processingTime,
          vectorMatches,
        },
      };
    } catch (error) {
      logger.error('❌ Error processing message', error);
      
      return {
        message: 'I\'m experiencing technical difficulties. Please try again in a moment.',
        sessionId,
        messageId: `msg-${Date.now()}`,
        timestamp: new Date(),
        metadata: {
          confidence: 0,
          tools: ['error_handling'],
          tokens: 0,
          processingTime: Date.now() - startTime,
        },
      };
    }
  }

  private buildContext(vectorMatches: VectorMatch[]): string {
    if (vectorMatches.length === 0) {
      return '';
    }

    const contextParts = vectorMatches.map(match => 
      `Source: ${match.source}\nContent: ${match.content.substring(0, 200)}...`
    );

    return `\n\nRelevant information:\n${contextParts.join('\n\n')}`;
  }

  private async generateResponse(message: string, context: string): Promise<string> {
    try {
      const prompt = `${SYSTEM_PROMPT}\n\nUser message: ${message}${context}\n\nBambai AI:`;
      
      const response = await this.llm.invoke(prompt);
      
      if (typeof response === 'string') {
        return response;
      } else if (response && typeof response === 'object' && 'content' in response) {
        return String(response.content);
      } else {
        return 'I apologize, but I\'m having trouble generating a response right now.';
      }
    } catch (error) {
      logger.error('❌ Error generating response', error);
      return 'I\'m experiencing technical difficulties. Please try again in a moment.';
    }
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  async getMemory(sessionId: string): Promise<ChatMessage[]> {
    try {
      const memoryVariables = await this.memory.loadMemoryVariables({});
      const history = memoryVariables.history || [];
      
      return history.map((msg: any, index: number) => ({
        id: `mem-${sessionId}-${index}`,
        role: msg._getType() === 'human' ? 'user' : 'assistant',
        content: msg.content,
        timestamp: new Date(),
        sessionId,
      }));
    } catch (error) {
      logger.error('❌ Error loading memory', error);
      return [];
    }
  }

  async clearMemory(): Promise<void> {
    try {
      await this.memory.clear();
      logger.info('✅ Memory cleared successfully');
    } catch (error) {
      logger.error('❌ Error clearing memory', error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Test LLM connection
      await this.llm.invoke('test');
      
      // Test vector store
      const vectorHealth = await vectorManager.healthCheck();
      
      return vectorHealth;
    } catch (error) {
      logger.error('❌ Health check failed', error);
      return false;
    }
  }
}

// Singleton instance
export const bambaiAgent = new BambaiAgent(); 
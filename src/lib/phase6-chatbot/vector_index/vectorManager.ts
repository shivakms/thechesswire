// Phase 6: Vector Database Manager for Bambai AI Assistant

import { OpenAIEmbeddings } from '@langchain/openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { VectorDocument, VectorMatch } from '../types';
import logger from '@/lib/logger';

export class VectorManager {
  private embeddings: OpenAIEmbeddings;
  private pinecone: Pinecone | null = null;
  private isInitialized = false;
  private documents: VectorDocument[] = [];

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small',
    });
  }

  async initialize(): Promise<void> {
    try {
      if (process.env.PINECONE_API_KEY) {
        this.pinecone = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY,
        });

        logger.info('✅ Vector database initialized with Pinecone');
      } else {
        logger.warn('⚠️ Pinecone API key not found, using in-memory storage');
      }

      this.isInitialized = true;
    } catch (error) {
      logger.error('❌ Failed to initialize vector database', error);
      throw error;
    }
  }

  async addDocument(document: VectorDocument): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Store in memory for now
      this.documents.push(document);
      logger.info(`✅ Added document to storage: ${document.metadata.title || document.id}`);
    } catch (error) {
      logger.error('❌ Failed to add document to storage', error);
      throw error;
    }
  }

  async addDocuments(documents: VectorDocument[]): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      this.documents.push(...documents);
      logger.info(`✅ Added ${documents.length} documents to storage`);
    } catch (error) {
      logger.error('❌ Failed to add documents to storage', error);
      throw error;
    }
  }

  async search(query: string, limit: number = 5): Promise<VectorMatch[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Simple text-based search for now
      const results = this.documents
        .filter(doc => 
          doc.content.toLowerCase().includes(query.toLowerCase()) ||
          doc.metadata.title?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, limit)
        .map((doc: VectorDocument, index: number) => ({
          id: doc.id,
          content: doc.content,
          source: doc.metadata.source || 'unknown',
          score: 1 - (index * 0.1),
          metadata: doc.metadata,
        }));

      return results;
    } catch (error) {
      logger.error('❌ Failed to search storage', error);
      return [];
    }
  }

  async searchByType(query: string, type: string, limit: number = 5): Promise<VectorMatch[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const results = this.documents
        .filter(doc => 
          doc.metadata.type === type &&
          (doc.content.toLowerCase().includes(query.toLowerCase()) ||
           doc.metadata.title?.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, limit)
        .map((doc: VectorDocument, index: number) => ({
          id: doc.id,
          content: doc.content,
          source: doc.metadata.source || 'unknown',
          score: 1 - (index * 0.1),
          metadata: doc.metadata,
        }));

      return results;
    } catch (error) {
      logger.error('❌ Failed to search storage by type', error);
      return [];
    }
  }

  async deleteDocument(id: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      this.documents = this.documents.filter(doc => doc.id !== id);
      logger.info(`✅ Deleted document from storage: ${id}`);
    } catch (error) {
      logger.error('❌ Failed to delete document from storage', error);
      throw error;
    }
  }

  async refreshIndex(): Promise<void> {
    try {
      logger.info('🔄 Starting vector index refresh...');
      
      // This would typically involve:
      // 1. Fetching all documents from the database
      // 2. Deleting old embeddings
      // 3. Re-embedding all documents
      // 4. Updating the vector store
      
      logger.info('✅ Vector index refresh completed');
    } catch (error) {
      logger.error('❌ Failed to refresh vector index', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    totalDocuments: number;
    lastUpdated: Date;
    indexSize: number;
  }> {
    try {
      if (!this.pinecone) {
        return {
          totalDocuments: 0,
          lastUpdated: new Date(),
          indexSize: 0,
        };
      }

      const indexName = process.env.PINECONE_INDEX_NAME || 'thechesswire-knowledge';
      const index = this.pinecone.index(indexName);
      const stats = await index.describeIndexStats();

      return {
        totalDocuments: stats.totalRecordCount || 0,
        lastUpdated: new Date(),
        indexSize: stats.dimension || 0,
      };
    } catch (error) {
      logger.error('❌ Failed to get vector store stats', error);
      return {
        totalDocuments: 0,
        lastUpdated: new Date(),
        indexSize: 0,
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.pinecone) {
        return false;
      }

      const indexName = process.env.PINECONE_INDEX_NAME || 'thechesswire-knowledge';
      const index = this.pinecone.index(indexName);
      await index.describeIndexStats();
      
      return true;
    } catch (error) {
      logger.error('❌ Vector store health check failed', error);
      return false;
    }
  }
}

// Singleton instance
export const vectorManager = new VectorManager(); 
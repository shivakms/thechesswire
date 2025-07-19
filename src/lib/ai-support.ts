import { Pool } from 'pg';
import { notificationSystem } from './notifications';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  satisfactionRating?: number;
}

export interface ChatMessage {
  id: string;
  ticketId: string;
  senderType: 'user' | 'ai' | 'agent';
  senderId?: string;
  content: string;
  timestamp: Date;
  isInternal: boolean;
  attachments?: string[];
}

export interface AIResponse {
  response: string;
  confidence: number;
  suggestedActions: string[];
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  autoResolve: boolean;
}

class AISupportSystem {
  private knowledgeBase: Map<string, any> = new Map();
  private responseTemplates: Map<string, string> = new Map();

  constructor() {
    this.initializeKnowledgeBase();
    this.loadResponseTemplates();
  }

  private async initializeKnowledgeBase() {
    try {
      // Load FAQ and knowledge base from database
      const result = await pool.query(`
        SELECT category, question, answer, keywords, tags 
        FROM support_knowledge_base 
        WHERE is_active = TRUE
      `);

      for (const row of result.rows) {
        this.knowledgeBase.set(row.category, {
          question: row.question,
          answer: row.answer,
          keywords: row.keywords || [],
          tags: row.tags || []
        });
      }
    } catch (error) {
      console.error('Failed to initialize knowledge base:', error);
    }
  }

  private async loadResponseTemplates() {
    try {
      const result = await pool.query(`
        SELECT template_id, content, variables, category 
        FROM support_response_templates 
        WHERE is_active = TRUE
      `);

      for (const row of result.rows) {
        this.responseTemplates.set(row.template_id, row.content);
      }
    } catch (error) {
      console.error('Failed to load response templates:', error);
    }
  }

  async processUserMessage(
    userId: string,
    message: string,
    context?: {
      previousMessages?: ChatMessage[];
      userProfile?: any;
      sessionData?: any;
    }
  ): Promise<AIResponse> {
    try {
      // Analyze the message
      const analysis = await this.analyzeMessage(message, context);
      
      // Generate response
      const response = await this.generateResponse(analysis, context);
      
      // Log the interaction
      await this.logInteraction(userId, message, response, analysis);
      
      return response;
    } catch (error) {
      console.error('Error processing user message:', error);
      
      return {
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again or contact our support team.",
        confidence: 0.1,
        suggestedActions: ['contact_human_support'],
        category: 'general',
        priority: 'medium',
        autoResolve: false
      };
    }
  }

  private async analyzeMessage(
    message: string,
    context?: any
  ): Promise<{
    intent: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    keywords: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    urgency: number;
  }> {
    const lowerMessage = message.toLowerCase();
    
    // Intent classification
    let intent = 'general_inquiry';
    let category = 'general';
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'low';
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    let urgency = 0;

    // Check for urgent keywords
    const urgentKeywords = ['broken', 'error', 'crash', 'urgent', 'emergency', 'not working', 'failed'];
    const highPriorityKeywords = ['bug', 'issue', 'problem', 'help', 'support', 'ticket'];
    const negativeKeywords = ['angry', 'frustrated', 'disappointed', 'unhappy', 'terrible', 'awful'];

    if (urgentKeywords.some(keyword => lowerMessage.includes(keyword))) {
      priority = 'urgent';
      urgency = 0.9;
    } else if (highPriorityKeywords.some(keyword => lowerMessage.includes(keyword))) {
      priority = 'high';
      urgency = 0.7;
    }

    if (negativeKeywords.some(keyword => lowerMessage.includes(keyword))) {
      sentiment = 'negative';
      urgency += 0.2;
    }

    // Category classification
    if (lowerMessage.includes('password') || lowerMessage.includes('login') || lowerMessage.includes('account')) {
      category = 'authentication';
      intent = 'account_help';
    } else if (lowerMessage.includes('game') || lowerMessage.includes('chess') || lowerMessage.includes('move')) {
      category = 'gameplay';
      intent = 'game_help';
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('billing') || lowerMessage.includes('subscription')) {
      category = 'billing';
      intent = 'billing_help';
    } else if (lowerMessage.includes('feature') || lowerMessage.includes('request') || lowerMessage.includes('suggestion')) {
      category = 'feature_request';
      intent = 'feature_request';
    } else if (lowerMessage.includes('bug') || lowerMessage.includes('error') || lowerMessage.includes('issue')) {
      category = 'technical';
      intent = 'bug_report';
    }

    // Extract keywords
    const keywords = this.extractKeywords(message);

    return {
      intent,
      category,
      priority,
      keywords,
      sentiment,
      urgency: Math.min(1, urgency)
    };
  }

  private extractKeywords(message: string): string[] {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    
    const words = message.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
    
    return [...new Set(words)];
  }

  private async generateResponse(
    analysis: any,
    context?: any
  ): Promise<AIResponse> {
    const { intent, category, priority, keywords, sentiment, urgency } = analysis;

    // Check if we can auto-resolve
    const autoResolve = priority === 'low' && sentiment !== 'negative' && urgency < 0.5;

    // Generate appropriate response based on category and intent
    let response = '';
    let confidence = 0.7;
    let suggestedActions: string[] = [];

    switch (category) {
      case 'authentication':
        response = this.getAuthenticationResponse(intent, keywords);
        suggestedActions = ['reset_password', 'verify_email', 'contact_support'];
        break;
      
      case 'gameplay':
        response = this.getGameplayResponse(intent, keywords);
        suggestedActions = ['view_tutorial', 'practice_mode', 'contact_coach'];
        break;
      
      case 'billing':
        response = this.getBillingResponse(intent, keywords);
        suggestedActions = ['view_billing', 'update_payment', 'contact_billing'];
        break;
      
      case 'technical':
        response = this.getTechnicalResponse(intent, keywords);
        suggestedActions = ['check_status', 'clear_cache', 'contact_support'];
        break;
      
      case 'feature_request':
        response = this.getFeatureRequestResponse(intent, keywords);
        suggestedActions = ['submit_request', 'view_roadmap', 'join_beta'];
        break;
      
      default:
        response = this.getGeneralResponse(intent, keywords);
        suggestedActions = ['browse_faq', 'contact_support', 'view_tutorials'];
    }

    // Adjust confidence based on analysis
    if (urgency > 0.8) {
      confidence = 0.3; // Lower confidence for urgent issues
      suggestedActions.push('escalate_to_human');
    }

    if (sentiment === 'negative') {
      confidence = Math.min(confidence, 0.5);
      suggestedActions.push('apologize_and_escalate');
    }

    return {
      response,
      confidence,
      suggestedActions,
      category,
      priority,
      autoResolve
    };
  }

  private getAuthenticationResponse(intent: string, keywords: string[]): string {
    if (keywords.includes('password')) {
      return "I can help you with password issues. You can reset your password by visiting the 'Forgot Password' page, or I can guide you through the process. Would you like me to help you reset your password?";
    }
    
    if (keywords.includes('login') || keywords.includes('signin')) {
      return "Having trouble logging in? Let me help you troubleshoot. First, make sure you're using the correct email address. If you've forgotten your password, I can help you reset it. Are you getting any specific error messages?";
    }
    
    if (keywords.includes('account')) {
      return "I can help you with account-related issues. What specific problem are you experiencing with your account?";
    }
    
    return "I can help you with authentication issues. Please let me know what specific problem you're experiencing.";
  }

  private getGameplayResponse(intent: string, keywords: string[]): string {
    if (keywords.includes('move') || keywords.includes('play')) {
      return "I can help you with chess gameplay! If you're having trouble making moves, try refreshing the page or clearing your browser cache. Are you experiencing any specific issues with the game interface?";
    }
    
    if (keywords.includes('analysis') || keywords.includes('evaluation')) {
      return "The analysis feature provides detailed insights into your games. You can access it from the game review page. Is there a specific aspect of analysis you'd like help with?";
    }
    
    if (keywords.includes('training') || keywords.includes('practice')) {
      return "Our training features include puzzles, tactics, and personalized coaching. You can access these from the EchoSage section. What type of training are you interested in?";
    }
    
    return "I can help you with chess gameplay questions. What specific aspect would you like assistance with?";
  }

  private getBillingResponse(intent: string, keywords: string[]): string {
    if (keywords.includes('payment') || keywords.includes('card')) {
      return "I can help you with payment issues. You can update your payment method in your account settings. Are you experiencing any specific payment problems?";
    }
    
    if (keywords.includes('subscription') || keywords.includes('premium')) {
      return "For subscription-related questions, you can manage your subscription in your account settings. What specific issue are you experiencing with your subscription?";
    }
    
    if (keywords.includes('refund')) {
      return "For refund requests, please provide details about your purchase and the reason for the refund. I'll help you submit a refund request.";
    }
    
    return "I can help you with billing and payment questions. What specific issue are you experiencing?";
  }

  private getTechnicalResponse(intent: string, keywords: string[]): string {
    if (keywords.includes('error') || keywords.includes('bug')) {
      return "I'm sorry you're experiencing technical issues. To help you better, could you please describe the error message you're seeing and what you were doing when it occurred?";
    }
    
    if (keywords.includes('slow') || keywords.includes('loading')) {
      return "Performance issues can be caused by various factors. Try clearing your browser cache and refreshing the page. If the problem persists, please let me know your browser and device information.";
    }
    
    if (keywords.includes('mobile') || keywords.includes('app')) {
      return "For mobile app issues, try updating to the latest version. If you're still experiencing problems, please let me know your device model and operating system version.";
    }
    
    return "I can help you troubleshoot technical issues. Please describe the problem you're experiencing in detail.";
  }

  private getFeatureRequestResponse(intent: string, keywords: string[]): string {
    return "Thank you for your feature request! We're always looking to improve TheChessWire. I'll submit your request to our development team. Could you please provide more details about how this feature would benefit your chess experience?";
  }

  private getGeneralResponse(intent: string, keywords: string[]): string {
    return "I'm here to help you with TheChessWire! I can assist with gameplay questions, technical issues, account problems, and more. What can I help you with today?";
  }

  async createSupportTicket(
    userId: string,
    subject: string,
    description: string,
    category: string,
    priority: 'low' | 'medium' | 'high' | 'urgent'
  ): Promise<string> {
    try {
      const ticketId = crypto.randomUUID();
      
      await pool.query(
        `INSERT INTO support_tickets 
         (id, user_id, subject, description, category, priority, status, tags, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [
          ticketId,
          userId,
          subject,
          description,
          category,
          priority,
          'open',
          []
        ]
      );

      // Send notification to user
      await notificationSystem.createNotification(
        userId,
        'system',
        'Support Ticket Created',
        `Your support ticket "${subject}" has been created and is being reviewed.`,
        { ticketId, category, priority }
      );

      return ticketId;
    } catch (error) {
      console.error('Failed to create support ticket:', error);
      throw error;
    }
  }

  async addMessageToTicket(
    ticketId: string,
    senderType: 'user' | 'ai' | 'agent',
    content: string,
    senderId?: string
  ): Promise<string> {
    try {
      const messageId = crypto.randomUUID();
      
      await pool.query(
        `INSERT INTO support_messages 
         (id, ticket_id, sender_type, sender_id, content, timestamp, is_internal)
         VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
        [
          messageId,
          ticketId,
          senderType,
          senderId,
          content,
          senderType === 'agent'
        ]
      );

      // Update ticket status
      await pool.query(
        'UPDATE support_tickets SET updated_at = NOW() WHERE id = $1',
        [ticketId]
      );

      return messageId;
    } catch (error) {
      console.error('Failed to add message to ticket:', error);
      throw error;
    }
  }

  async getTicketMessages(ticketId: string): Promise<ChatMessage[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM support_messages 
         WHERE ticket_id = $1 
         ORDER BY timestamp ASC`,
        [ticketId]
      );

      return result.rows.map(row => ({
        id: row.id,
        ticketId: row.ticket_id,
        senderType: row.sender_type,
        senderId: row.sender_id,
        content: row.content,
        timestamp: row.timestamp,
        isInternal: row.is_internal,
        attachments: row.attachments || []
      }));
    } catch (error) {
      console.error('Failed to get ticket messages:', error);
      return [];
    }
  }

  async resolveTicket(ticketId: string, resolution: string): Promise<void> {
    try {
      await pool.query(
        `UPDATE support_tickets 
         SET status = 'resolved', resolved_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [ticketId]
      );

      // Get ticket details for notification
      const ticketResult = await pool.query(
        'SELECT user_id, subject FROM support_tickets WHERE id = $1',
        [ticketId]
      );

      if (ticketResult.rows.length > 0) {
        const ticket = ticketResult.rows[0];
        
        // Send resolution notification
        await notificationSystem.createNotification(
          ticket.user_id,
          'system',
          'Support Ticket Resolved',
          `Your support ticket "${ticket.subject}" has been resolved.`,
          { ticketId, resolution }
        );
      }
    } catch (error) {
      console.error('Failed to resolve ticket:', error);
      throw error;
    }
  }

  private async logInteraction(
    userId: string,
    userMessage: string,
    aiResponse: AIResponse,
    analysis: any
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO ai_support_logs 
         (user_id, user_message, ai_response, analysis, confidence, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          userId,
          userMessage,
          JSON.stringify(aiResponse),
          JSON.stringify(analysis),
          aiResponse.confidence
        ]
      );
    } catch (error) {
      console.error('Failed to log AI interaction:', error);
    }
  }

  async getSupportStats(): Promise<any> {
    try {
      const stats = await pool.query(`
        SELECT 
          COUNT(*) as total_tickets,
          COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
          COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_tickets,
          AVG(CASE WHEN resolved_at IS NOT NULL THEN EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 END) as avg_resolution_hours,
          COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_tickets
        FROM support_tickets
        WHERE created_at > NOW() - INTERVAL '30 days'
      `);

      return stats.rows[0];
    } catch (error) {
      console.error('Failed to get support stats:', error);
      return {};
    }
  }
}

// Singleton instance
const aiSupportSystem = new AISupportSystem();

export { aiSupportSystem, AISupportSystem }; 
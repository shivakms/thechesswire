const { generateVoiceScript } = require('./ai');
const { pool } = require('../database');
const { logSecurityEvent } = require('./monitoring');

class AICustomerServiceBrain {
  constructor() {
    this.ticketQueue = [];
    this.resolutionTemplates = new Map();
    this.escalationRules = new Map();
    this.customerHistory = new Map();
    this.resolutionStats = {
      totalTickets: 0,
      resolvedTickets: 0,
      averageResolutionTime: 0,
      satisfactionScore: 0
    };
  }

  // Initialize the AI customer service system
  async initialize() {
    console.log('🧠 Initializing AI Customer Service Brain...');
    
    // Load resolution templates
    this.loadResolutionTemplates();
    
    // Setup escalation rules
    this.setupEscalationRules();
    
    // Start ticket processing
    this.startTicketProcessing();
    
    console.log('✅ AI Customer Service Brain initialized');
  }

  // Load resolution templates
  loadResolutionTemplates() {
    this.resolutionTemplates.set('account_recovery', {
      name: 'Account Recovery',
      template: `
        I understand you're having trouble accessing your account. Let me help you recover it.
        
        Steps to recover your account:
        1. Check your email for verification links
        2. Use the password reset function
        3. Contact support if issues persist
        
        Your account security is our top priority.
      `,
      keywords: ['forgot password', 'can\'t login', 'account locked', 'access denied'],
      priority: 'high'
    });

    this.resolutionTemplates.set('payment_issue', {
      name: 'Payment Issue Resolution',
      template: `
        I see you're experiencing payment issues. Let me help resolve this.
        
        Common solutions:
        1. Check your payment method is valid
        2. Ensure sufficient funds are available
        3. Try an alternative payment method
        4. Contact your bank if needed
        
        Your payment security is protected.
      `,
      keywords: ['payment failed', 'billing error', 'subscription issue', 'charge declined'],
      priority: 'high'
    });

    this.resolutionTemplates.set('subscription_management', {
      name: 'Subscription Management',
      template: `
        I can help you manage your subscription.
        
        Available options:
        1. Upgrade your plan
        2. Downgrade your plan
        3. Cancel subscription
        4. Update payment method
        5. View billing history
        
        What would you like to do?
      `,
      keywords: ['upgrade', 'downgrade', 'cancel', 'billing', 'subscription'],
      priority: 'medium'
    });

    this.resolutionTemplates.set('technical_support', {
      name: 'Technical Support',
      template: `
        I understand you're experiencing technical issues. Let me help troubleshoot.
        
        Troubleshooting steps:
        1. Clear your browser cache
        2. Try a different browser
        3. Check your internet connection
        4. Disable browser extensions
        5. Contact support if needed
        
        We're here to help you get back to playing chess!
      `,
      keywords: ['not working', 'error', 'bug', 'broken', 'technical'],
      priority: 'medium'
    });

    this.resolutionTemplates.set('content_issue', {
      name: 'Content Issue',
      template: `
        I see you have a question about our content. Let me help clarify.
        
        Content information:
        1. All content is AI-generated
        2. We fact-check all articles
        3. Content is updated regularly
        4. You can request specific topics
        
        Is there something specific you'd like to know?
      `,
      keywords: ['content', 'article', 'news', 'information', 'fact'],
      priority: 'low'
    });

    this.resolutionTemplates.set('general_inquiry', {
      name: 'General Inquiry',
      template: `
        Thank you for contacting TheChessWire.news support!
        
        How can I help you today? I can assist with:
        - Account issues
        - Payment questions
        - Technical problems
        - Content inquiries
        - Feature requests
        
        Please let me know what you need help with.
      `,
      keywords: ['help', 'support', 'question', 'inquiry', 'assist'],
      priority: 'low'
    });
  }

  // Setup escalation rules
  setupEscalationRules() {
    this.escalationRules.set('security_breach', {
      condition: (ticket) => ticket.subject.toLowerCase().includes('hack') || 
                            ticket.subject.toLowerCase().includes('breach'),
      action: 'immediate_escalation',
      priority: 'critical'
    });

    this.escalationRules.set('payment_fraud', {
      condition: (ticket) => ticket.subject.toLowerCase().includes('fraud') || 
                            ticket.subject.toLowerCase().includes('unauthorized'),
      action: 'immediate_escalation',
      priority: 'critical'
    });

    this.escalationRules.set('account_takeover', {
      condition: (ticket) => ticket.subject.toLowerCase().includes('hijack') || 
                            ticket.subject.toLowerCase().includes('stolen'),
      action: 'immediate_escalation',
      priority: 'critical'
    });

    this.escalationRules.set('legal_issue', {
      condition: (ticket) => ticket.subject.toLowerCase().includes('legal') || 
                            ticket.subject.toLowerCase().includes('lawyer'),
      action: 'escalate_to_legal',
      priority: 'high'
    });

    this.escalationRules.set('complex_technical', {
      condition: (ticket) => ticket.description.length > 500,
      action: 'escalate_to_technical',
      priority: 'medium'
    });
  }

  // Start ticket processing
  startTicketProcessing() {
    const cron = require('node-cron');
    
    // Process tickets every 30 seconds
    cron.schedule('*/30 * * * * *', () => {
      this.processTicketQueue();
    });

    // Analyze customer satisfaction daily
    cron.schedule('0 9 * * *', () => {
      this.analyzeCustomerSatisfaction();
    });

    // Generate support reports weekly
    cron.schedule('0 10 * * 1', () => {
      this.generateSupportReports();
    });
  }

  // Create support ticket
  async createTicket(userId, ticketType, subject, description) {
    console.log(`🎫 Creating support ticket: ${subject}`);
    
    try {
      // Analyze ticket for priority and category
      const analysis = await this.analyzeTicket(subject, description);
      
      // Check for escalation
      const escalation = this.checkEscalationRules(analysis);
      
      // Create ticket in database
      const client = await pool.connect();
      let ticketId;
      
      try {
        const result = await client.query(
          `INSERT INTO ai_support_tickets (
            user_id, ticket_type, subject, description, priority, status
          ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [
            userId,
            ticketType,
            subject,
            description,
            escalation.priority || analysis.priority,
            escalation.action === 'immediate_escalation' ? 'escalated' : 'open'
          ]
        );
        
        ticketId = result.rows[0].id;
        
      } finally {
        client.release();
      }

      // Add to processing queue
      this.ticketQueue.push({
        id: ticketId,
        userId,
        ticketType,
        subject,
        description,
        analysis,
        escalation,
        createdAt: new Date()
      });

      // Log ticket creation
      await logSecurityEvent({
        eventType: 'support_ticket_created',
        userId,
        details: {
          ticketId,
          ticketType,
          subject,
          priority: escalation.priority || analysis.priority
        }
      });

      console.log(`✅ Support ticket created: ${ticketId}`);
      
      return {
        ticketId,
        status: escalation.action === 'immediate_escalation' ? 'escalated' : 'processing',
        estimatedResolutionTime: this.estimateResolutionTime(analysis.priority)
      };

    } catch (error) {
      console.error('Ticket creation failed:', error);
      throw error;
    }
  }

  // Analyze ticket content
  async analyzeTicket(subject, description) {
    const content = `${subject} ${description}`.toLowerCase();
    
    // Determine ticket category and priority
    let category = 'general_inquiry';
    let priority = 'low';
    
    for (const [key, template] of this.resolutionTemplates) {
      for (const keyword of template.keywords) {
        if (content.includes(keyword)) {
          category = key;
          priority = template.priority;
          break;
        }
      }
      if (category !== 'general_inquiry') break;
    }

    // Use AI to enhance analysis
    const aiAnalysis = await this.performAIAnalysis(subject, description);
    
    return {
      category,
      priority,
      keywords: aiAnalysis.keywords,
      sentiment: aiAnalysis.sentiment,
      urgency: aiAnalysis.urgency,
      complexity: aiAnalysis.complexity
    };
  }

  // Perform AI analysis on ticket
  async performAIAnalysis(subject, description) {
    try {
      const prompt = `
        Analyze this customer support ticket:
        
        Subject: ${subject}
        Description: ${description}
        
        Provide analysis in JSON format:
        {
          "keywords": ["list", "of", "key", "terms"],
          "sentiment": "positive|neutral|negative",
          "urgency": "low|medium|high|critical",
          "complexity": "simple|moderate|complex",
          "category": "account|payment|technical|content|general"
        }
      `;

      const response = await generateVoiceScript(prompt, 'calm');
      
      // Parse AI response (in production, use proper JSON parsing)
      const analysis = {
        keywords: ['support', 'help', 'issue'],
        sentiment: 'neutral',
        urgency: 'medium',
        complexity: 'moderate',
        category: 'general'
      };

      return analysis;
      
    } catch (error) {
      console.error('AI analysis failed:', error);
      return {
        keywords: ['support'],
        sentiment: 'neutral',
        urgency: 'medium',
        complexity: 'moderate',
        category: 'general'
      };
    }
  }

  // Check escalation rules
  checkEscalationRules(analysis) {
    for (const [ruleName, rule] of this.escalationRules) {
      if (rule.condition(analysis)) {
        return {
          action: rule.action,
          priority: rule.priority,
          rule: ruleName
        };
      }
    }
    
    return {
      action: 'auto_resolve',
      priority: analysis.priority
    };
  }

  // Process ticket queue
  async processTicketQueue() {
    if (this.ticketQueue.length === 0) return;
    
    const ticket = this.ticketQueue.shift();
    console.log(`🔧 Processing ticket: ${ticket.id}`);
    
    try {
      // Generate AI resolution
      const resolution = await this.generateResolution(ticket);
      
      // Apply resolution
      await this.applyResolution(ticket.id, resolution);
      
      // Update customer history
      this.updateCustomerHistory(ticket.userId, ticket.analysis.category);
      
      // Update statistics
      this.updateResolutionStats(resolution.success);
      
      console.log(`✅ Ticket ${ticket.id} processed successfully`);
      
    } catch (error) {
      console.error(`Ticket processing failed for ${ticket.id}:`, error);
      
      // Escalate failed tickets
      await this.escalateTicket(ticket.id, error.message);
    }
  }

  // Generate AI resolution
  async generateResolution(ticket) {
    const template = this.resolutionTemplates.get(ticket.analysis.category);
    
    if (!template) {
      return {
        success: false,
        message: 'Unable to determine appropriate resolution template',
        action: 'escalate'
      };
    }

    try {
      const prompt = `
        Generate a personalized resolution for this customer support ticket:
        
        Subject: ${ticket.subject}
        Description: ${ticket.description}
        Category: ${ticket.analysis.category}
        Priority: ${ticket.analysis.priority}
        
        Base template: ${template.template}
        
        Create a personalized, helpful response that:
        1. Addresses the specific issue
        2. Provides clear steps to resolve
        3. Shows empathy and understanding
        4. Offers additional help if needed
        5. Maintains professional tone
        
        Make it conversational and helpful.
      `;

      const aiResponse = await generateVoiceScript(prompt, 'calm');
      
      return {
        success: true,
        message: aiResponse,
        action: 'resolve',
        template: template.name,
        estimatedTime: this.estimateResolutionTime(ticket.analysis.priority)
      };
      
    } catch (error) {
      console.error('AI resolution generation failed:', error);
      
      return {
        success: false,
        message: template.template,
        action: 'resolve',
        template: template.name,
        fallback: true
      };
    }
  }

  // Apply resolution to ticket
  async applyResolution(ticketId, resolution) {
    const client = await pool.connect();
    
    try {
      await client.query(
        `UPDATE ai_support_tickets 
         SET status = $1, ai_resolution = $2, resolved_at = $3
         WHERE id = $4`,
        [
          resolution.success ? 'resolved' : 'escalated',
          resolution.message,
          resolution.success ? new Date() : null,
          ticketId
        ]
      );
      
      // Log resolution
      await logSecurityEvent({
        eventType: 'support_ticket_resolved',
        details: {
          ticketId,
          success: resolution.success,
          action: resolution.action,
          template: resolution.template
        }
      });
      
    } finally {
      client.release();
    }
  }

  // Escalate ticket
  async escalateTicket(ticketId, reason) {
    const client = await pool.connect();
    
    try {
      await client.query(
        `UPDATE ai_support_tickets 
         SET status = 'escalated', ai_resolution = $1
         WHERE id = $2`,
        [`Escalated: ${reason}`, ticketId]
      );
      
      console.log(`🚨 Ticket ${ticketId} escalated: ${reason}`);
      
    } finally {
      client.release();
    }
  }

  // Update customer history
  updateCustomerHistory(userId, category) {
    if (!this.customerHistory.has(userId)) {
      this.customerHistory.set(userId, {
        tickets: [],
        categories: new Map(),
        lastContact: null
      });
    }
    
    const history = this.customerHistory.get(userId);
    history.tickets.push({
      category,
      timestamp: new Date()
    });
    
    history.categories.set(category, (history.categories.get(category) || 0) + 1);
    history.lastContact = new Date();
  }

  // Update resolution statistics
  updateResolutionStats(success) {
    this.resolutionStats.totalTickets++;
    
    if (success) {
      this.resolutionStats.resolvedTickets++;
    }
    
    // Update average resolution time (simplified)
    this.resolutionStats.averageResolutionTime = 
      (this.resolutionStats.averageResolutionTime * (this.resolutionStats.totalTickets - 1) + 300) / 
      this.resolutionStats.totalTickets;
  }

  // Estimate resolution time
  estimateResolutionTime(priority) {
    const timeEstimates = {
      'low': '2-4 hours',
      'medium': '1-2 hours',
      'high': '30-60 minutes',
      'critical': '15-30 minutes'
    };
    
    return timeEstimates[priority] || '2-4 hours';
  }

  // Analyze customer satisfaction
  async analyzeCustomerSatisfaction() {
    console.log('📊 Analyzing customer satisfaction...');
    
    try {
      const client = await pool.connect();
      let tickets;
      
      try {
        const result = await client.query(
          `SELECT * FROM ai_support_tickets 
           WHERE resolved_at >= NOW() - INTERVAL '7 days'
           AND status = 'resolved'`
        );
        tickets = result.rows;
      } finally {
        client.release();
      }

      if (tickets.length === 0) {
        console.log('No resolved tickets in the last 7 days');
        return;
      }

      // Calculate satisfaction metrics
      const totalTickets = tickets.length;
      const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
      const satisfactionRate = (resolvedTickets / totalTickets) * 100;
      
      this.resolutionStats.satisfactionScore = satisfactionRate;
      
      console.log(`📊 Customer satisfaction analysis: ${satisfactionRate.toFixed(1)}%`);
      
      // Log satisfaction analysis
      await logSecurityEvent({
        eventType: 'satisfaction_analysis',
        details: {
          totalTickets,
          resolvedTickets,
          satisfactionRate,
          period: '7 days'
        }
      });
      
    } catch (error) {
      console.error('Customer satisfaction analysis failed:', error);
    }
  }

  // Generate support reports
  async generateSupportReports() {
    console.log('📋 Generating support reports...');
    
    try {
      const client = await pool.connect();
      let reportData;
      
      try {
        const result = await client.query(
          `SELECT 
            ticket_type,
            status,
            priority,
            COUNT(*) as count,
            AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/60) as avg_resolution_time
           FROM ai_support_tickets 
           WHERE created_at >= NOW() - INTERVAL '7 days'
           GROUP BY ticket_type, status, priority`
        );
        reportData = result.rows;
      } finally {
        client.release();
      }

      // Generate AI summary report
      const report = await this.generateAIReport(reportData);
      
      console.log('📋 Support report generated');
      
      // Log report generation
      await logSecurityEvent({
        eventType: 'support_report_generated',
        details: {
          report,
          period: '7 days'
        }
      });
      
    } catch (error) {
      console.error('Support report generation failed:', error);
    }
  }

  // Generate AI report
  async generateAIReport(data) {
    try {
      const prompt = `
        Generate a weekly support report based on this data:
        
        ${JSON.stringify(data, null, 2)}
        
        Create a comprehensive report that includes:
        1. Summary of ticket volume and types
        2. Resolution rates and times
        3. Priority distribution
        4. Areas for improvement
        5. Recommendations
        
        Make it professional and actionable.
      `;

      const report = await generateVoiceScript(prompt, 'calm');
      return report;
      
    } catch (error) {
      console.error('AI report generation failed:', error);
      return 'Weekly support report generation failed.';
    }
  }

  // Get ticket status
  async getTicketStatus(ticketId) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT * FROM ai_support_tickets WHERE id = $1`,
        [ticketId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
      
    } finally {
      client.release();
    }
  }

  // Get customer support history
  async getCustomerHistory(userId) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT * FROM ai_support_tickets 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 10`,
        [userId]
      );
      
      return result.rows;
      
    } finally {
      client.release();
    }
  }

  // Get system statistics
  getStats() {
    return {
      ...this.resolutionStats,
      queueLength: this.ticketQueue.length,
      templates: this.resolutionTemplates.size,
      escalationRules: this.escalationRules.size,
      customerHistory: this.customerHistory.size
    };
  }

  // Shutdown the customer service system
  async shutdown() {
    console.log('🛑 Shutting down AI Customer Service Brain...');
    console.log('✅ AI Customer Service Brain shutdown complete');
  }
}

// Create singleton instance
const customerServiceAI = new AICustomerServiceBrain();

module.exports = {
  customerServiceAI,
  AICustomerServiceBrain
}; 
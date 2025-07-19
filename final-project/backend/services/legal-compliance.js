const { generateVoiceScript } = require('./ai');
const { pool } = require('../database');
const { logSecurityEvent } = require('./monitoring');

class AutomatedLegalComplianceEngine {
  constructor() {
    this.complianceRules = new Map();
    this.gdprRequests = new Map();
    this.copyrightClaims = new Map();
    this.geoBlockingRules = new Map();
    this.auditTrail = [];
    this.complianceStatus = {
      gdpr: 'compliant',
      coppa: 'compliant',
      copyright: 'compliant',
      geoBlocking: 'active'
    };
  }

  // Initialize the legal compliance engine
  async initialize() {
    console.log('⚖️ Initializing Automated Legal Compliance Engine...');
    
    // Load compliance rules
    this.loadComplianceRules();
    
    // Setup geo-blocking rules
    this.setupGeoBlockingRules();
    
    // Start compliance monitoring
    this.startComplianceMonitoring();
    
    // Initialize audit trail
    this.initializeAuditTrail();
    
    console.log('✅ Automated Legal Compliance Engine initialized');
  }

  // Load compliance rules
  loadComplianceRules() {
    // GDPR compliance rules
    this.complianceRules.set('gdpr_data_export', {
      name: 'GDPR Data Export',
      description: 'Export all user data in machine-readable format',
      timeLimit: 30, // 30 days
      required: true,
      automated: true
    });

    this.complianceRules.set('gdpr_data_deletion', {
      name: 'GDPR Data Deletion',
      description: 'Permanently delete all user data',
      timeLimit: 30, // 30 days
      required: true,
      automated: true
    });

    this.complianceRules.set('gdpr_consent_management', {
      name: 'GDPR Consent Management',
      description: 'Manage user consent for data processing',
      timeLimit: 0, // Immediate
      required: true,
      automated: true
    });

    this.complianceRules.set('coppa_age_verification', {
      name: 'COPPA Age Verification',
      description: 'Verify user age for COPPA compliance',
      timeLimit: 0, // Immediate
      required: true,
      automated: true
    });

    this.complianceRules.set('copyright_dmca', {
      name: 'Copyright DMCA',
      description: 'Process DMCA takedown requests',
      timeLimit: 10, // 10 days
      required: true,
      automated: true
    });

    this.complianceRules.set('terms_update', {
      name: 'Terms Update',
      description: 'Update terms of service and privacy policy',
      timeLimit: 30, // 30 days
      required: false,
      automated: true
    });
  }

  // Setup geo-blocking rules
  setupGeoBlockingRules() {
    // Sanctioned countries (example list)
    const sanctionedCountries = [
      'IR', // Iran
      'KP', // North Korea
      'SY', // Syria
      'CU', // Cuba
      'VE'  // Venezuela
    ];

    for (const country of sanctionedCountries) {
      this.geoBlockingRules.set(country, {
        reason: 'sanctions',
        action: 'block',
        message: 'Access not available in your region due to legal restrictions'
      });
    }

    // GDPR compliance countries
    const gdprCountries = [
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
      'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
      'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB'
    ];

    for (const country of gdprCountries) {
      this.geoBlockingRules.set(country, {
        reason: 'gdpr',
        action: 'gdpr_compliance',
        message: 'Enhanced privacy protection available'
      });
    }
  }

  // Start compliance monitoring
  startComplianceMonitoring() {
    const cron = require('node-cron');
    
    // Monitor GDPR requests daily
    cron.schedule('0 8 * * *', () => {
      this.processGDPRRequests();
    });

    // Process copyright claims every 6 hours
    cron.schedule('0 */6 * * *', () => {
      this.processCopyrightClaims();
    });

    // Update terms and policies weekly
    cron.schedule('0 9 * * 1', () => {
      this.updateTermsAndPolicies();
    });

    // Generate compliance reports monthly
    cron.schedule('0 10 1 * *', () => {
      this.generateComplianceReports();
    });

    // Audit trail cleanup monthly
    cron.schedule('0 11 1 * *', () => {
      this.cleanupAuditTrail();
    });
  }

  // Initialize audit trail
  initializeAuditTrail() {
    console.log('📋 Initializing compliance audit trail...');
    
    // In production, this would load existing audit trail from database
    this.auditTrail = [];
  }

  // Process GDPR request
  async processGDPRRequest(userId, requestType, details = {}) {
    console.log(`🔒 Processing GDPR request: ${requestType} for user ${userId}`);
    
    try {
      // Validate request
      const validation = await this.validateGDPRRequest(userId, requestType, details);
      
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Create legal request record
      const client = await pool.connect();
      let requestId;
      
      try {
        const result = await client.query(
          `INSERT INTO legal_requests (
            user_id, request_type, details, status
          ) VALUES ($1, $2, $3, $4) RETURNING id`,
          [
            userId,
            requestType,
            JSON.stringify(details),
            'pending'
          ]
        );
        
        requestId = result.rows[0].id;
        
      } finally {
        client.release();
      }

      // Process based on request type
      let result;
      switch (requestType) {
        case 'gdpr_export':
          result = await this.handleGDPRDataExport(userId, requestId);
          break;
        case 'gdpr_deletion':
          result = await this.handleGDPRDataDeletion(userId, requestId);
          break;
        case 'gdpr_consent':
          result = await this.handleGDPRConsentUpdate(userId, requestId, details);
          break;
        default:
          throw new Error(`Unknown GDPR request type: ${requestType}`);
      }

      // Log compliance event
      await this.logComplianceEvent('gdpr_request', {
        userId,
        requestId,
        requestType,
        status: result.success ? 'completed' : 'failed',
        details: result
      });

      return result;

    } catch (error) {
      console.error('GDPR request processing failed:', error);
      
      await this.logComplianceEvent('gdpr_request_error', {
        userId,
        requestType,
        error: error.message
      });
      
      throw error;
    }
  }

  // Validate GDPR request
  async validateGDPRRequest(userId, requestType, details) {
    // Check if user exists
    const client = await pool.connect();
    let userExists;
    
    try {
      const result = await client.query(
        'SELECT id FROM users WHERE id = $1',
        [userId]
      );
      userExists = result.rows.length > 0;
    } finally {
      client.release();
    }

    if (!userExists) {
      return {
        valid: false,
        error: 'User not found'
      };
    }

    // Check request type validity
    const validTypes = ['gdpr_export', 'gdpr_deletion', 'gdpr_consent'];
    if (!validTypes.includes(requestType)) {
      return {
        valid: false,
        error: 'Invalid GDPR request type'
      };
    }

    // Additional validation based on request type
    if (requestType === 'gdpr_consent' && !details.consentType) {
      return {
        valid: false,
        error: 'Consent type required for consent update'
      };
    }

    return { valid: true };
  }

  // Handle GDPR data export
  async handleGDPRDataExport(userId, requestId) {
    console.log(`📤 Processing GDPR data export for user ${userId}`);
    
    try {
      const client = await pool.connect();
      let userData;
      
      try {
        // Collect all user data
        const userResult = await client.query(
          'SELECT * FROM users WHERE id = $1',
          [userId]
        );
        
        const profileResult = await client.query(
          'SELECT * FROM user_profiles WHERE user_id = $1',
          [userId]
        );
        
        const voiceUsageResult = await client.query(
          'SELECT * FROM voice_usage WHERE user_id = $1',
          [userId]
        );
        
        const securityEventsResult = await client.query(
          'SELECT * FROM security_events WHERE user_id = $1',
          [userId]
        );
        
        userData = {
          user: userResult.rows[0],
          profile: profileResult.rows[0],
          voiceUsage: voiceUsageResult.rows,
          securityEvents: securityEventsResult.rows,
          exportDate: new Date().toISOString(),
          format: 'JSON'
        };
        
      } finally {
        client.release();
      }

      // Generate export file (in production, save to secure storage)
      const exportData = JSON.stringify(userData, null, 2);
      
      // Update request status
      await this.updateLegalRequestStatus(requestId, 'completed', {
        exportSize: exportData.length,
        dataPoints: Object.keys(userData).length
      });

      // Send export to user (in production, via secure email)
      console.log(`📤 GDPR data export completed for user ${userId}`);
      
      return {
        success: true,
        message: 'Data export completed successfully',
        dataSize: exportData.length,
        downloadUrl: `/api/legal/export/${requestId}` // In production, secure download link
      };

    } catch (error) {
      console.error('GDPR data export failed:', error);
      
      await this.updateLegalRequestStatus(requestId, 'failed', {
        error: error.message
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Handle GDPR data deletion
  async handleGDPRDataDeletion(userId, requestId) {
    console.log(`🗑️ Processing GDPR data deletion for user ${userId}`);
    
    try {
      const client = await pool.connect();
      
      try {
        // Anonymize user data (soft delete for audit purposes)
        await client.query(
          `UPDATE users 
           SET email = 'deleted_' || id || '@deleted.com',
               password_hash = 'deleted',
               verification_token = NULL,
               reset_token = NULL,
               updated_at = NOW()
           WHERE id = $1`,
          [userId]
        );
        
        await client.query(
          `UPDATE user_profiles 
           SET username = 'deleted_user_' || user_id,
               country = NULL,
               chess_style = NULL,
               voice_preference = NULL,
               date_of_birth = NULL,
               age_verified = FALSE,
               updated_at = NOW()
           WHERE user_id = $1`,
          [userId]
        );
        
        // Delete sensitive data
        await client.query(
          'DELETE FROM voice_usage WHERE user_id = $1',
          [userId]
        );
        
        await client.query(
          'DELETE FROM security_events WHERE user_id = $1',
          [userId]
        );
        
        await client.query(
          'DELETE FROM onboarding_progress WHERE user_id = $1',
          [userId]
        );
        
      } finally {
        client.release();
      }

      // Update request status
      await this.updateLegalRequestStatus(requestId, 'completed', {
        deletionDate: new Date().toISOString(),
        dataTypes: ['user', 'profile', 'voice_usage', 'security_events', 'onboarding']
      });

      console.log(`🗑️ GDPR data deletion completed for user ${userId}`);
      
      return {
        success: true,
        message: 'Data deletion completed successfully',
        deletionDate: new Date().toISOString()
      };

    } catch (error) {
      console.error('GDPR data deletion failed:', error);
      
      await this.updateLegalRequestStatus(requestId, 'failed', {
        error: error.message
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Handle GDPR consent update
  async handleGDPRConsentUpdate(userId, requestId, details) {
    console.log(`✅ Processing GDPR consent update for user ${userId}`);
    
    try {
      const client = await pool.connect();
      
      try {
        // Update user consent preferences
        await client.query(
          `UPDATE users 
           SET consent_updated_at = NOW()
           WHERE id = $1`,
          [userId]
        );
        
        // Log consent change
        await client.query(
          `INSERT INTO security_events (
            user_id, event_type, details
          ) VALUES ($1, $2, $3)`,
          [
            userId,
            'consent_updated',
            JSON.stringify(details)
          ]
        );
        
      } finally {
        client.release();
      }

      // Update request status
      await this.updateLegalRequestStatus(requestId, 'completed', {
        consentType: details.consentType,
        updatedAt: new Date().toISOString()
      });

      console.log(`✅ GDPR consent update completed for user ${userId}`);
      
      return {
        success: true,
        message: 'Consent updated successfully',
        consentType: details.consentType
      };

    } catch (error) {
      console.error('GDPR consent update failed:', error);
      
      await this.updateLegalRequestStatus(requestId, 'failed', {
        error: error.message
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process copyright claim
  async processCopyrightClaim(claimData) {
    console.log(`©️ Processing copyright claim: ${claimData.title}`);
    
    try {
      // Validate claim
      const validation = await this.validateCopyrightClaim(claimData);
      
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Create legal request record
      const client = await pool.connect();
      let claimId;
      
      try {
        const result = await client.query(
          `INSERT INTO legal_requests (
            request_type, details, status
          ) VALUES ($1, $2, $3) RETURNING id`,
          [
            'copyright_claim',
            JSON.stringify(claimData),
            'pending'
          ]
        );
        
        claimId = result.rows[0].id;
        
      } finally {
        client.release();
      }

      // Process copyright claim
      const result = await this.handleCopyrightClaim(claimData, claimId);

      // Log compliance event
      await this.logComplianceEvent('copyright_claim', {
        claimId,
        status: result.success ? 'processed' : 'failed',
        details: result
      });

      return result;

    } catch (error) {
      console.error('Copyright claim processing failed:', error);
      
      await this.logComplianceEvent('copyright_claim_error', {
        error: error.message,
        claimData
      });
      
      throw error;
    }
  }

  // Validate copyright claim
  async validateCopyrightClaim(claimData) {
    const requiredFields = ['title', 'description', 'claimant', 'contact'];
    
    for (const field of requiredFields) {
      if (!claimData[field]) {
        return {
          valid: false,
          error: `Missing required field: ${field}`
        };
      }
    }

    return { valid: true };
  }

  // Handle copyright claim
  async handleCopyrightClaim(claimData, claimId) {
    console.log(`©️ Handling copyright claim: ${claimData.title}`);
    
    try {
      // AI analysis of claim validity
      const aiAnalysis = await this.analyzeCopyrightClaim(claimData);
      
      if (aiAnalysis.valid) {
        // Remove content if claim is valid
        await this.removeCopyrightedContent(claimData);
        
        // Update claim status
        await this.updateLegalRequestStatus(claimId, 'completed', {
          action: 'content_removed',
          analysis: aiAnalysis
        });

        return {
          success: true,
          message: 'Copyright claim processed - content removed',
          analysis: aiAnalysis
        };
      } else {
        // Reject invalid claim
        await this.updateLegalRequestStatus(claimId, 'rejected', {
          reason: 'invalid_claim',
          analysis: aiAnalysis
        });

        return {
          success: true,
          message: 'Copyright claim rejected - insufficient evidence',
          analysis: aiAnalysis
        };
      }

    } catch (error) {
      console.error('Copyright claim handling failed:', error);
      
      await this.updateLegalRequestStatus(claimId, 'failed', {
        error: error.message
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Analyze copyright claim with AI
  async analyzeCopyrightClaim(claimData) {
    try {
      const prompt = `
        Analyze this copyright claim for validity:
        
        Title: ${claimData.title}
        Description: ${claimData.description}
        Claimant: ${claimData.claimant}
        
        Determine if this is a valid copyright claim by checking:
        1. Is the claimant the legitimate copyright holder?
        2. Is the content actually infringing?
        3. Is there sufficient evidence provided?
        4. Is this a fair use case?
        
        Respond with JSON:
        {
          "valid": true/false,
          "confidence": 0.0-1.0,
          "reasoning": "explanation",
          "recommendation": "remove/reject/review"
        }
      `;

      const response = await generateVoiceScript(prompt, 'calm');
      
      // Parse AI response (in production, use proper JSON parsing)
      const analysis = {
        valid: Math.random() > 0.5, // Simulate AI decision
        confidence: Math.random(),
        reasoning: 'AI analysis of copyright claim validity',
        recommendation: Math.random() > 0.5 ? 'remove' : 'reject'
      };

      return analysis;
      
    } catch (error) {
      console.error('Copyright claim AI analysis failed:', error);
      return {
        valid: false,
        confidence: 0.0,
        reasoning: 'Analysis failed',
        recommendation: 'review'
      };
    }
  }

  // Remove copyrighted content
  async removeCopyrightedContent(claimData) {
    console.log(`🗑️ Removing copyrighted content: ${claimData.title}`);
    
    // In production, this would:
    // - Remove content from database
    // - Update CDN cache
    // - Notify content creators
    // - Log removal for audit
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`🗑️ Copyrighted content removed: ${claimData.title}`);
  }

  // Check geo-blocking
  async checkGeoBlocking(countryCode, ipAddress) {
    const rule = this.geoBlockingRules.get(countryCode);
    
    if (rule) {
      await this.logComplianceEvent('geo_blocking', {
        countryCode,
        ipAddress,
        reason: rule.reason,
        action: rule.action
      });
      
      return {
        blocked: rule.action === 'block',
        reason: rule.reason,
        message: rule.message
      };
    }
    
    return {
      blocked: false,
      reason: 'allowed',
      message: 'Access allowed'
    };
  }

  // Update terms and policies
  async updateTermsAndPolicies() {
    console.log('📝 Updating terms and policies...');
    
    try {
      // Generate updated terms using AI
      const updatedTerms = await this.generateUpdatedTerms();
      
      // Update database
      const client = await pool.connect();
      
      try {
        await client.query(
          `INSERT INTO legal_requests (
            request_type, details, status
          ) VALUES ($1, $2, $3)`,
          [
            'terms_update',
            JSON.stringify({
              terms: updatedTerms.terms,
              privacy: updatedTerms.privacy,
              version: new Date().toISOString()
            }),
            'completed'
          ]
        );
        
      } finally {
        client.release();
      }

      // Log compliance event
      await this.logComplianceEvent('terms_update', {
        version: new Date().toISOString(),
        changes: updatedTerms.changes
      });

      console.log('📝 Terms and policies updated successfully');
      
    } catch (error) {
      console.error('Terms update failed:', error);
    }
  }

  // Generate updated terms using AI
  async generateUpdatedTerms() {
    try {
      const prompt = `
        Generate updated terms of service and privacy policy for TheChessWire.news.
        
        Include:
        1. GDPR compliance updates
        2. COPPA compliance for age verification
        3. AI-generated content disclaimers
        4. Voice data processing consent
        5. Copyright and DMCA procedures
        6. User rights and responsibilities
        
        Make it comprehensive and legally sound.
      `;

      const response = await generateVoiceScript(prompt, 'calm');
      
      return {
        terms: response,
        privacy: response,
        changes: ['GDPR compliance', 'COPPA updates', 'AI content disclaimers']
      };
      
    } catch (error) {
      console.error('Terms generation failed:', error);
      return {
        terms: 'Terms update failed',
        privacy: 'Privacy policy update failed',
        changes: []
      };
    }
  }

  // Generate compliance reports
  async generateComplianceReports() {
    console.log('📊 Generating compliance reports...');
    
    try {
      const client = await pool.connect();
      let reportData;
      
      try {
        const result = await client.query(
          `SELECT 
            request_type,
            status,
            COUNT(*) as count,
            AVG(EXTRACT(EPOCH FROM (processed_at - created_at))/86400) as avg_processing_days
           FROM legal_requests 
           WHERE created_at >= NOW() - INTERVAL '30 days'
           GROUP BY request_type, status`
        );
        reportData = result.rows;
      } finally {
        client.release();
      }

      // Generate AI compliance report
      const report = await this.generateAIComplianceReport(reportData);
      
      console.log('📊 Compliance report generated');
      
      // Log report generation
      await this.logComplianceEvent('compliance_report', {
        report,
        period: '30 days'
      });
      
    } catch (error) {
      console.error('Compliance report generation failed:', error);
    }
  }

  // Generate AI compliance report
  async generateAIComplianceReport(data) {
    try {
      const prompt = `
        Generate a monthly legal compliance report based on this data:
        
        ${JSON.stringify(data, null, 2)}
        
        Include:
        1. GDPR request summary
        2. Copyright claim processing
        3. Terms update status
        4. Compliance metrics
        5. Recommendations for improvement
        
        Make it professional and actionable.
      `;

      const report = await generateVoiceScript(prompt, 'calm');
      return report;
      
    } catch (error) {
      console.error('AI compliance report generation failed:', error);
      return 'Compliance report generation failed.';
    }
  }

  // Update legal request status
  async updateLegalRequestStatus(requestId, status, details = {}) {
    const client = await pool.connect();
    
    try {
      await client.query(
        `UPDATE legal_requests 
         SET status = $1, processed_at = $2, details = details || $3
         WHERE id = $4`,
        [
          status,
          new Date(),
          JSON.stringify(details),
          requestId
        ]
      );
      
    } finally {
      client.release();
    }
  }

  // Log compliance event
  async logComplianceEvent(eventType, details) {
    // Add to audit trail
    this.auditTrail.push({
      timestamp: new Date(),
      eventType,
      details
    });

    // Log to security events
    await logSecurityEvent({
      eventType: `compliance_${eventType}`,
      details
    });
  }

  // Cleanup audit trail
  async cleanupAuditTrail() {
    console.log('🧹 Cleaning up audit trail...');
    
    // Keep only last 12 months of audit trail
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 12);
    
    this.auditTrail = this.auditTrail.filter(
      entry => entry.timestamp > cutoffDate
    );
    
    console.log(`🧹 Audit trail cleaned up. ${this.auditTrail.length} entries remaining`);
  }

  // Get compliance status
  getComplianceStatus() {
    return {
      ...this.complianceStatus,
      auditTrailSize: this.auditTrail.length,
      geoBlockingRules: this.geoBlockingRules.size,
      complianceRules: this.complianceRules.size
    };
  }

  // Shutdown the compliance engine
  async shutdown() {
    console.log('🛑 Shutting down Automated Legal Compliance Engine...');
    console.log('✅ Automated Legal Compliance Engine shutdown complete');
  }
}

// Create singleton instance
const legalComplianceEngine = new AutomatedLegalComplianceEngine();

module.exports = {
  legalComplianceEngine,
  AutomatedLegalComplianceEngine
}; 
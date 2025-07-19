const { generateVoiceScript } = require('./ai');
const { pool } = require('../database');
const { logSecurityEvent } = require('./monitoring');

class FraudSecurityAIGuardian {
  constructor() {
    this.threatPatterns = {
      accountTakeover: {
        indicators: ['unusual_login_location', 'multiple_failed_logins', 'suspicious_activity'],
        riskScore: 0.8,
        actions: ['temporary_lock', 'mfa_required', 'admin_alert']
      },
      paymentFraud: {
        indicators: ['multiple_payment_attempts', 'unusual_amounts', 'suspicious_cards'],
        riskScore: 0.9,
        actions: ['payment_hold', 'manual_review', 'fraud_alert']
      },
      contentAbuse: {
        indicators: ['spam_content', 'inappropriate_material', 'copyright_violation'],
        riskScore: 0.7,
        actions: ['content_removal', 'user_warning', 'account_review']
      },
      botActivity: {
        indicators: ['rapid_requests', 'pattern_behavior', 'no_human_interaction'],
        riskScore: 0.6,
        actions: ['rate_limiting', 'captcha_required', 'ip_block']
      }
    };
    
    this.behavioralProfiles = new Map();
    this.activeThreats = new Map();
    this.securityMetrics = {
      threatsBlocked: 0,
      falsePositives: 0,
      responseTime: 0,
      accuracy: 0
    };
  }

  async initialize() {
    console.log('🛡️ Initializing Fraud & Security AI Guardian...');
    
    // Load threat intelligence
    await this.loadThreatIntelligence();
    
    // Start monitoring cycles
    this.startSecurityMonitoring();
    
    // Initialize behavioral analysis
    this.initializeBehavioralAnalysis();
    
    // Set up automated responses
    this.setupAutomatedResponses();
    
    console.log('✅ Fraud & Security AI Guardian initialized');
  }

  async loadThreatIntelligence() {
    try {
      // Load known threat patterns from database
      const query = `
        SELECT threat_type, pattern_data, risk_score, response_actions
        FROM threat_intelligence
        WHERE active = true
      `;
      
      const result = await pool.query(query);
      
      result.rows.forEach(row => {
        this.threatPatterns[row.threat_type] = {
          indicators: JSON.parse(row.pattern_data),
          riskScore: row.risk_score,
          actions: JSON.parse(row.response_actions)
        };
      });
      
      console.log(`📊 Loaded ${result.rows.length} threat patterns`);
    } catch (error) {
      console.error('❌ Error loading threat intelligence:', error);
    }
  }

  startSecurityMonitoring() {
    // Real-time threat monitoring
    setInterval(async () => {
      await this.monitorActiveThreats();
    }, 30 * 1000); // Every 30 seconds

    // Behavioral analysis
    setInterval(async () => {
      await this.analyzeUserBehavior();
    }, 5 * 60 * 1000); // Every 5 minutes

    // Threat intelligence updates
    setInterval(async () => {
      await this.updateThreatIntelligence();
    }, 60 * 60 * 1000); // Every hour
  }

  async monitorActiveThreats() {
    try {
      console.log('🔍 Monitoring active threats...');
      
      // Check for suspicious activities
      const suspiciousActivities = await this.detectSuspiciousActivities();
      
      // Analyze each activity
      for (const activity of suspiciousActivities) {
        const threatLevel = await this.assessThreatLevel(activity);
        
        if (threatLevel > 0.7) {
          await this.handleHighThreat(activity, threatLevel);
        } else if (threatLevel > 0.4) {
          await this.handleMediumThreat(activity, threatLevel);
        }
      }
      
      // Update security metrics
      await this.updateSecurityMetrics();
      
    } catch (error) {
      console.error('❌ Error monitoring threats:', error);
    }
  }

  async detectSuspiciousActivities() {
    const activities = [];
    
    // Check for unusual login patterns
    const loginQuery = `
      SELECT user_id, ip_address, user_agent, created_at, success
      FROM login_attempts
      WHERE created_at > NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC
    `;
    
    const loginResult = await pool.query(loginQuery);
    
    // Group by user and analyze patterns
    const userLogins = {};
    loginResult.rows.forEach(attempt => {
      if (!userLogins[attempt.user_id]) {
        userLogins[attempt.user_id] = [];
      }
      userLogins[attempt.user_id].push(attempt);
    });
    
    // Detect suspicious patterns
    for (const [userId, attempts] of Object.entries(userLogins)) {
      if (attempts.length > 10) {
        activities.push({
          type: 'excessive_login_attempts',
          userId,
          data: attempts,
          riskScore: 0.8
        });
      }
      
      // Check for multiple failed attempts
      const failedAttempts = attempts.filter(a => !a.success);
      if (failedAttempts.length > 5) {
        activities.push({
          type: 'multiple_failed_logins',
          userId,
          data: failedAttempts,
          riskScore: 0.9
        });
      }
    }
    
    // Check for payment anomalies
    const paymentQuery = `
      SELECT user_id, amount, payment_method, created_at, status
      FROM payment_attempts
      WHERE created_at > NOW() - INTERVAL '1 hour'
    `;
    
    const paymentResult = await pool.query(paymentQuery);
    
    // Detect unusual payment patterns
    const userPayments = {};
    paymentResult.rows.forEach(payment => {
      if (!userPayments[payment.user_id]) {
        userPayments[payment.user_id] = [];
      }
      userPayments[payment.user_id].push(payment);
    });
    
    for (const [userId, payments] of Object.entries(userPayments)) {
      if (payments.length > 3) {
        activities.push({
          type: 'multiple_payment_attempts',
          userId,
          data: payments,
          riskScore: 0.7
        });
      }
      
      // Check for unusual amounts
      const amounts = payments.map(p => p.amount);
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const unusualAmounts = amounts.filter(amount => amount > avgAmount * 3);
      
      if (unusualAmounts.length > 0) {
        activities.push({
          type: 'unusual_payment_amounts',
          userId,
          data: { amounts: unusualAmounts, average: avgAmount },
          riskScore: 0.8
        });
      }
    }
    
    return activities;
  }

  async assessThreatLevel(activity) {
    let baseRisk = activity.riskScore || 0.5;
    
    // Apply behavioral analysis
    const userProfile = this.behavioralProfiles.get(activity.userId);
    if (userProfile) {
      const behaviorRisk = this.calculateBehavioralRisk(userProfile, activity);
      baseRisk = Math.max(baseRisk, behaviorRisk);
    }
    
    // Apply contextual factors
    const contextualRisk = await this.calculateContextualRisk(activity);
    baseRisk = Math.max(baseRisk, contextualRisk);
    
    // Apply machine learning model (simplified)
    const mlRisk = this.applyMLModel(activity);
    baseRisk = Math.max(baseRisk, mlRisk);
    
    return Math.min(baseRisk, 1.0);
  }

  calculateBehavioralRisk(userProfile, activity) {
    let risk = 0;
    
    // Check for deviation from normal behavior
    if (userProfile.normalLoginTimes && !this.isNormalLoginTime(activity)) {
      risk += 0.3;
    }
    
    if (userProfile.normalLocations && !this.isNormalLocation(activity)) {
      risk += 0.4;
    }
    
    if (userProfile.normalDevices && !this.isNormalDevice(activity)) {
      risk += 0.3;
    }
    
    return risk;
  }

  async calculateContextualRisk(activity) {
    let risk = 0;
    
    // Check time-based patterns
    const hour = new Date().getHours();
    if (hour < 6 || hour > 23) {
      risk += 0.2; // Unusual hours
    }
    
    // Check geographic patterns
    if (activity.data && activity.data[0] && activity.data[0].ip_address) {
      const isHighRiskLocation = await this.checkHighRiskLocation(activity.data[0].ip_address);
      if (isHighRiskLocation) {
        risk += 0.4;
      }
    }
    
    // Check velocity patterns
    if (activity.data && activity.data.length > 5) {
      const timeSpan = new Date(activity.data[activity.data.length - 1].created_at) - 
                      new Date(activity.data[0].created_at);
      const velocity = activity.data.length / (timeSpan / 1000 / 60); // events per minute
      
      if (velocity > 10) {
        risk += 0.5; // Too fast
      }
    }
    
    return risk;
  }

  applyMLModel(activity) {
    // Simplified ML model simulation
    const features = [
      activity.data ? activity.data.length : 0,
      activity.riskScore || 0.5,
      activity.type === 'multiple_failed_logins' ? 1 : 0,
      activity.type === 'unusual_payment_amounts' ? 1 : 0
    ];
    
    // Simple weighted average (in real implementation, this would be a trained model)
    const weights = [0.3, 0.4, 0.2, 0.1];
    const mlScore = features.reduce((sum, feature, index) => sum + feature * weights[index], 0);
    
    return Math.min(mlScore, 1.0);
  }

  async handleHighThreat(activity, threatLevel) {
    console.log(`🚨 High threat detected: ${activity.type} (Level: ${threatLevel.toFixed(2)})`);
    
    // Immediate response actions
    const actions = this.getThreatActions(activity.type, threatLevel);
    
    for (const action of actions) {
      await this.executeSecurityAction(action, activity);
    }
    
    // Log threat
    await this.logSecurityThreat(activity, threatLevel, actions);
    
    // Update active threats
    this.activeThreats.set(activity.userId, {
      type: activity.type,
      threatLevel,
      timestamp: new Date(),
      actions
    });
  }

  async handleMediumThreat(activity, threatLevel) {
    console.log(`⚠️ Medium threat detected: ${activity.type} (Level: ${threatLevel.toFixed(2)})`);
    
    // Enhanced monitoring
    await this.enhanceMonitoring(activity.userId);
    
    // Log for analysis
    await this.logSecurityThreat(activity, threatLevel, ['enhanced_monitoring']);
  }

  getThreatActions(threatType, threatLevel) {
    const actions = [];
    
    switch (threatType) {
      case 'multiple_failed_logins':
        actions.push('temporary_account_lock');
        actions.push('mfa_requirement');
        actions.push('admin_alert');
        break;
        
      case 'unusual_payment_amounts':
        actions.push('payment_hold');
        actions.push('manual_review');
        actions.push('fraud_alert');
        break;
        
      case 'excessive_login_attempts':
        actions.push('rate_limiting');
        actions.push('ip_monitoring');
        actions.push('captcha_requirement');
        break;
        
      default:
        actions.push('enhanced_monitoring');
        actions.push('user_verification');
    }
    
    return actions;
  }

  async executeSecurityAction(action, activity) {
    console.log(`🔒 Executing security action: ${action}`);
    
    switch (action) {
      case 'temporary_account_lock':
        await this.lockAccount(activity.userId, 3600); // 1 hour
        break;
        
      case 'mfa_requirement':
        await this.requireMFA(activity.userId);
        break;
        
      case 'payment_hold':
        await this.holdPayments(activity.userId);
        break;
        
      case 'rate_limiting':
        await this.applyRateLimit(activity.userId);
        break;
        
      case 'admin_alert':
        await this.sendAdminAlert(activity);
        break;
        
      case 'enhanced_monitoring':
        await this.enhanceMonitoring(activity.userId);
        break;
    }
  }

  async lockAccount(userId, duration) {
    const query = `
      UPDATE users 
      SET account_locked = true, lock_expires_at = NOW() + INTERVAL '${duration} seconds'
      WHERE id = $1
    `;
    
    await pool.query(query, [userId]);
    
    // Log the action
    await logSecurityEvent('account_locked', {
      userId,
      reason: 'suspicious_activity',
      duration,
      timestamp: new Date()
    });
  }

  async requireMFA(userId) {
    const query = `
      UPDATE user_profiles 
      SET mfa_required = true, mfa_enforced_at = NOW()
      WHERE user_id = $1
    `;
    
    await pool.query(query, [userId]);
  }

  async holdPayments(userId) {
    const query = `
      UPDATE payment_attempts 
      SET status = 'on_hold', held_at = NOW()
      WHERE user_id = $1 AND status = 'pending'
    `;
    
    await pool.query(query, [userId]);
  }

  async applyRateLimit(userId) {
    // Apply stricter rate limiting for suspicious users
    const query = `
      INSERT INTO rate_limits (user_id, endpoint, limit_count, window_seconds, created_at)
      VALUES ($1, '*', 10, 3600, NOW())
      ON CONFLICT (user_id, endpoint) 
      DO UPDATE SET limit_count = 10, window_seconds = 3600
    `;
    
    await pool.query(query, [userId]);
  }

  async enhanceMonitoring(userId) {
    // Add user to enhanced monitoring list
    const query = `
      INSERT INTO enhanced_monitoring (user_id, reason, created_at)
      VALUES ($1, 'suspicious_activity', NOW())
      ON CONFLICT (user_id) DO NOTHING
    `;
    
    await pool.query(query, [userId]);
  }

  async sendAdminAlert(activity) {
    const alert = {
      type: 'security_alert',
      severity: 'high',
      activity: activity.type,
      userId: activity.userId,
      threatLevel: activity.riskScore,
      timestamp: new Date(),
      data: activity.data
    };
    
    // In real implementation, this would send to admin dashboard/email
    console.log('🚨 Admin Alert:', alert);
  }

  async analyzeUserBehavior() {
    try {
      console.log('🧠 Analyzing user behavior patterns...');
      
      // Get recent user activities
      const query = `
        SELECT 
          user_id,
          action_type,
          ip_address,
          user_agent,
          created_at,
          success
        FROM user_activities
        WHERE created_at > NOW() - INTERVAL '24 hours'
        ORDER BY user_id, created_at
      `;
      
      const result = await pool.query(query);
      
      // Group by user and analyze patterns
      const userActivities = {};
      result.rows.forEach(activity => {
        if (!userActivities[activity.user_id]) {
          userActivities[activity.user_id] = [];
        }
        userActivities[activity.user_id].push(activity);
      });
      
      // Build behavioral profiles
      for (const [userId, activities] of Object.entries(userActivities)) {
        const profile = this.buildBehavioralProfile(activities);
        this.behavioralProfiles.set(userId, profile);
      }
      
      console.log(`📊 Built behavioral profiles for ${Object.keys(userActivities).length} users`);
      
    } catch (error) {
      console.error('❌ Error analyzing user behavior:', error);
    }
  }

  buildBehavioralProfile(activities) {
    const profile = {
      normalLoginTimes: this.extractLoginTimes(activities),
      normalLocations: this.extractLocations(activities),
      normalDevices: this.extractDevices(activities),
      activityPatterns: this.extractActivityPatterns(activities),
      riskIndicators: this.calculateRiskIndicators(activities)
    };
    
    return profile;
  }

  extractLoginTimes(activities) {
    const loginTimes = activities
      .filter(a => a.action_type === 'login' && a.success)
      .map(a => new Date(a.created_at).getHours());
    
    if (loginTimes.length === 0) return null;
    
    // Calculate most common login hours
    const hourCounts = {};
    loginTimes.forEach(hour => {
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const commonHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
    
    return commonHours;
  }

  extractLocations(activities) {
    const locations = activities
      .filter(a => a.ip_address)
      .map(a => a.ip_address);
    
    // In real implementation, this would geolocate IPs
    return [...new Set(locations)].slice(0, 5);
  }

  extractDevices(activities) {
    const devices = activities
      .filter(a => a.user_agent)
      .map(a => this.extractDeviceFingerprint(a.user_agent));
    
    return [...new Set(devices)].slice(0, 3);
  }

  extractDeviceFingerprint(userAgent) {
    // Simplified device fingerprinting
    return userAgent.split(' ').slice(0, 3).join(' ');
  }

  extractActivityPatterns(activities) {
    const patterns = {
      loginFrequency: activities.filter(a => a.action_type === 'login').length,
      paymentFrequency: activities.filter(a => a.action_type === 'payment').length,
      contentCreation: activities.filter(a => a.action_type === 'content_create').length,
      averageSessionDuration: this.calculateAverageSessionDuration(activities)
    };
    
    return patterns;
  }

  calculateAverageSessionDuration(activities) {
    // Simplified session duration calculation
    const sessions = this.groupIntoSessions(activities);
    const durations = sessions.map(session => {
      const start = new Date(session[0].created_at);
      const end = new Date(session[session.length - 1].created_at);
      return (end - start) / 1000 / 60; // minutes
    });
    
    return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  }

  groupIntoSessions(activities) {
    const sessions = [];
    let currentSession = [];
    
    activities.forEach(activity => {
      if (currentSession.length === 0) {
        currentSession.push(activity);
      } else {
        const lastActivity = currentSession[currentSession.length - 1];
        const timeDiff = new Date(activity.created_at) - new Date(lastActivity.created_at);
        
        if (timeDiff < 30 * 60 * 1000) { // 30 minutes
          currentSession.push(activity);
        } else {
          if (currentSession.length > 0) {
            sessions.push(currentSession);
          }
          currentSession = [activity];
        }
      }
    });
    
    if (currentSession.length > 0) {
      sessions.push(currentSession);
    }
    
    return sessions;
  }

  calculateRiskIndicators(activities) {
    const indicators = {
      failedLogins: activities.filter(a => a.action_type === 'login' && !a.success).length,
      unusualTimes: this.countUnusualTimeActivities(activities),
      multipleDevices: this.extractDevices(activities).length,
      rapidActions: this.countRapidActions(activities)
    };
    
    return indicators;
  }

  countUnusualTimeActivities(activities) {
    const unusualHours = [0, 1, 2, 3, 4, 5, 22, 23];
    return activities.filter(a => {
      const hour = new Date(a.created_at).getHours();
      return unusualHours.includes(hour);
    }).length;
  }

  countRapidActions(activities) {
    let rapidCount = 0;
    
    for (let i = 1; i < activities.length; i++) {
      const timeDiff = new Date(activities[i].created_at) - new Date(activities[i-1].created_at);
      if (timeDiff < 10 * 1000) { // Less than 10 seconds
        rapidCount++;
      }
    }
    
    return rapidCount;
  }

  async updateThreatIntelligence() {
    try {
      console.log('🔄 Updating threat intelligence...');
      
      // In real implementation, this would fetch from external threat feeds
      const newThreats = await this.fetchExternalThreats();
      
      // Update local threat database
      for (const threat of newThreats) {
        await this.updateThreatPattern(threat);
      }
      
      console.log(`📊 Updated ${newThreats.length} threat patterns`);
      
    } catch (error) {
      console.error('❌ Error updating threat intelligence:', error);
    }
  }

  async fetchExternalThreats() {
    // Simulated external threat feed
    return [
      {
        type: 'new_malware',
        indicators: ['suspicious_user_agent', 'unusual_behavior'],
        riskScore: 0.8,
        actions: ['enhanced_scanning', 'behavioral_analysis']
      }
    ];
  }

  async updateThreatPattern(threat) {
    const query = `
      INSERT INTO threat_intelligence (threat_type, pattern_data, risk_score, response_actions, active)
      VALUES ($1, $2, $3, $4, true)
      ON CONFLICT (threat_type) 
      DO UPDATE SET 
        pattern_data = $2,
        risk_score = $3,
        response_actions = $4,
        updated_at = NOW()
    `;
    
    await pool.query(query, [
      threat.type,
      JSON.stringify(threat.indicators),
      threat.riskScore,
      JSON.stringify(threat.actions)
    ]);
  }

  async updateSecurityMetrics() {
    const totalThreats = this.activeThreats.size;
    const blockedThreats = Array.from(this.activeThreats.values())
      .filter(threat => threat.actions.includes('temporary_account_lock')).length;
    
    this.securityMetrics.threatsBlocked = blockedThreats;
    this.securityMetrics.accuracy = totalThreats > 0 ? blockedThreats / totalThreats : 0;
  }

  async logSecurityThreat(activity, threatLevel, actions) {
    const query = `
      INSERT INTO security_threats (user_id, threat_type, threat_level, activity_data, response_actions, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `;
    
    await pool.query(query, [
      activity.userId,
      activity.type,
      threatLevel,
      JSON.stringify(activity.data),
      JSON.stringify(actions)
    ]);
  }

  async checkHighRiskLocation(ipAddress) {
    // Simplified high-risk location check
    // In real implementation, this would use a geolocation service
    const highRiskIPs = ['192.168.1.1', '10.0.0.1']; // Example
    return highRiskIPs.includes(ipAddress);
  }

  isNormalLoginTime(activity) {
    const userProfile = this.behavioralProfiles.get(activity.userId);
    if (!userProfile || !userProfile.normalLoginTimes) return true;
    
    const currentHour = new Date().getHours();
    return userProfile.normalLoginTimes.includes(currentHour);
  }

  isNormalLocation(activity) {
    const userProfile = this.behavioralProfiles.get(activity.userId);
    if (!userProfile || !userProfile.normalLocations) return true;
    
    const currentIP = activity.data && activity.data[0] ? activity.data[0].ip_address : null;
    return currentIP && userProfile.normalLocations.includes(currentIP);
  }

  isNormalDevice(activity) {
    const userProfile = this.behavioralProfiles.get(activity.userId);
    if (!userProfile || !userProfile.normalDevices) return true;
    
    const currentDevice = activity.data && activity.data[0] ? 
      this.extractDeviceFingerprint(activity.data[0].user_agent) : null;
    return currentDevice && userProfile.normalDevices.includes(currentDevice);
  }

  getStats() {
    return {
      activeThreats: this.activeThreats.size,
      behavioralProfiles: this.behavioralProfiles.size,
      threatsBlocked: this.securityMetrics.threatsBlocked,
      accuracy: this.securityMetrics.accuracy,
      threatPatterns: Object.keys(this.threatPatterns).length
    };
  }

  async shutdown() {
    console.log('🛑 Shutting down Fraud & Security AI Guardian...');
    // Cleanup resources
  }
}

const fraudSecurityAIGuardian = new FraudSecurityAIGuardian();
module.exports = { fraudSecurityAIGuardian, FraudSecurityAIGuardian }; 
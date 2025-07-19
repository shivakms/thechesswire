const { generateVoiceScript } = require('./ai');
const { pool } = require('../database');
const { logSecurityEvent } = require('./monitoring');

class RevenueOptimizationAI {
  constructor() {
    this.pricingStrategies = {
      dynamic: {
        basePrice: 25,
        demandMultiplier: 1.2,
        competitionMultiplier: 0.9,
        seasonalAdjustment: 1.1
      },
      freemium: {
        conversionRate: 0.05,
        upgradeTriggers: ['voice_usage', 'content_consumption', 'training_sessions'],
        retentionStrategies: ['personalization', 'gamification', 'exclusive_content']
      },
      subscription: {
        tiers: ['free', 'premium', 'titled'],
        pricing: { premium: 25, titled: 50 },
        features: {
          premium: ['unlimited_voice', 'advanced_analysis', 'priority_support'],
          titled: ['revenue_sharing', 'exclusive_content', 'direct_support']
        }
      }
    };
    
    this.revenueMetrics = {
      mrr: 0,
      arr: 0,
      churnRate: 0,
      ltv: 0,
      cac: 0,
      conversionRate: 0
    };
    
    this.optimizationRules = [
      {
        name: 'High Usage Discount',
        condition: 'user_usage > 80%',
        action: 'offer_retention_discount',
        discount: 0.15
      },
      {
        name: 'Churn Prevention',
        condition: 'days_since_last_login > 7',
        action: 'send_reactivation_offer',
        offer: 'free_premium_week'
      },
      {
        name: 'Upsell Opportunity',
        condition: 'premium_features_usage > 60%',
        action: 'offer_titled_upgrade',
        incentive: 'revenue_sharing_intro'
      }
    ];
  }

  async initialize() {
    console.log('🚀 Initializing Revenue Optimization AI...');
    
    // Load historical revenue data
    await this.loadRevenueData();
    
    // Start optimization cycles
    this.startOptimizationCycles();
    
    // Initialize A/B testing framework
    this.initializeABTesting();
    
    console.log('✅ Revenue Optimization AI initialized');
  }

  async loadRevenueData() {
    try {
      const query = `
        SELECT 
          SUM(CASE WHEN subscription_tier = 'premium' THEN 25 ELSE 0 END) as premium_revenue,
          SUM(CASE WHEN subscription_tier = 'titled' THEN 50 ELSE 0 END) as titled_revenue,
          COUNT(*) as total_users,
          COUNT(CASE WHEN subscription_tier != 'free' THEN 1 END) as paid_users
        FROM user_profiles
        WHERE subscription_tier IN ('premium', 'titled')
      `;
      
      const result = await pool.query(query);
      const data = result.rows[0];
      
      this.revenueMetrics.mrr = (data.premium_revenue || 0) + (data.titled_revenue || 0);
      this.revenueMetrics.arr = this.revenueMetrics.mrr * 12;
      this.revenueMetrics.conversionRate = data.paid_users / data.total_users;
      
      console.log(`📊 Revenue data loaded: MRR $${this.revenueMetrics.mrr}, Conversion ${(this.revenueMetrics.conversionRate * 100).toFixed(2)}%`);
    } catch (error) {
      console.error('❌ Error loading revenue data:', error);
    }
  }

  startOptimizationCycles() {
    // Daily revenue analysis
    setInterval(async () => {
      await this.analyzeRevenuePerformance();
    }, 24 * 60 * 60 * 1000);

    // Hourly pricing optimization
    setInterval(async () => {
      await this.optimizePricing();
    }, 60 * 60 * 1000);

    // Real-time conversion optimization
    setInterval(async () => {
      await this.optimizeConversions();
    }, 15 * 60 * 1000);
  }

  async analyzeRevenuePerformance() {
    try {
      console.log('📈 Analyzing revenue performance...');
      
      // Calculate key metrics
      const metrics = await this.calculateRevenueMetrics();
      
      // Generate insights
      const insights = await this.generateRevenueInsights(metrics);
      
      // Apply optimization strategies
      await this.applyOptimizationStrategies(insights);
      
      // Log performance
      await this.logRevenueEvent('performance_analysis', {
        metrics,
        insights,
        timestamp: new Date()
      });
      
      console.log('✅ Revenue performance analysis complete');
    } catch (error) {
      console.error('❌ Error analyzing revenue performance:', error);
    }
  }

  async calculateRevenueMetrics() {
    const query = `
      SELECT 
        subscription_tier,
        COUNT(*) as user_count,
        AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/86400) as avg_tenure_days,
        COUNT(CASE WHEN last_login > NOW() - INTERVAL '7 days' THEN 1 END) as active_users
      FROM user_profiles 
      GROUP BY subscription_tier
    `;
    
    const result = await pool.query(query);
    const metrics = {};
    
    result.rows.forEach(row => {
      metrics[row.subscription_tier] = {
        userCount: parseInt(row.user_count),
        avgTenureDays: parseFloat(row.avg_tenure_days),
        activeUsers: parseInt(row.active_users),
        activationRate: parseInt(row.active_users) / parseInt(row.user_count)
      };
    });
    
    return metrics;
  }

  async generateRevenueInsights(metrics) {
    const insights = [];
    
    // Analyze conversion opportunities
    if (metrics.free && metrics.free.userCount > 1000) {
      const conversionRate = metrics.free.activationRate;
      if (conversionRate > 0.7) {
        insights.push({
          type: 'conversion_opportunity',
          message: 'High free user activation rate - ready for premium conversion',
          action: 'trigger_premium_offers',
          priority: 'high'
        });
      }
    }
    
    // Analyze churn risk
    if (metrics.premium && metrics.premium.activationRate < 0.5) {
      insights.push({
        type: 'churn_risk',
        message: 'Low premium user activity - churn prevention needed',
        action: 'activate_retention_campaign',
        priority: 'critical'
      });
    }
    
    // Analyze revenue optimization
    if (metrics.titled && metrics.titled.userCount < 50) {
      insights.push({
        type: 'revenue_optimization',
        message: 'Low titled player count - revenue sharing program needs promotion',
        action: 'promote_titled_benefits',
        priority: 'medium'
      });
    }
    
    return insights;
  }

  async applyOptimizationStrategies(insights) {
    for (const insight of insights) {
      switch (insight.action) {
        case 'trigger_premium_offers':
          await this.triggerPremiumOffers();
          break;
        case 'activate_retention_campaign':
          await this.activateRetentionCampaign();
          break;
        case 'promote_titled_benefits':
          await this.promoteTitledBenefits();
          break;
      }
    }
  }

  async triggerPremiumOffers() {
    console.log('🎯 Triggering premium conversion offers...');
    
    // Find high-value free users
    const query = `
      SELECT user_id, username, rating, voice_usage_count
      FROM user_profiles 
      WHERE subscription_tier = 'free' 
      AND voice_usage_count > 10
      AND last_login > NOW() - INTERVAL '3 days'
      LIMIT 100
    `;
    
    const result = await pool.query(query);
    
    for (const user of result.rows) {
      await this.sendPersonalizedOffer(user.user_id, 'premium_trial');
    }
  }

  async activateRetentionCampaign() {
    console.log('🔄 Activating retention campaign...');
    
    // Find inactive premium users
    const query = `
      SELECT user_id, username, last_login
      FROM user_profiles 
      WHERE subscription_tier = 'premium'
      AND last_login < NOW() - INTERVAL '7 days'
    `;
    
    const result = await pool.query(query);
    
    for (const user of result.rows) {
      await this.sendRetentionOffer(user.user_id);
    }
  }

  async promoteTitledBenefits() {
    console.log('👑 Promoting titled player benefits...');
    
    // Find high-rated players
    const query = `
      SELECT user_id, username, rating, fide_id
      FROM user_profiles 
      WHERE rating > 2000
      AND subscription_tier != 'titled'
      AND fide_id IS NOT NULL
    `;
    
    const result = await pool.query(query);
    
    for (const user of result.rows) {
      await this.sendTitledPlayerInvitation(user.user_id);
    }
  }

  async optimizePricing() {
    try {
      console.log('💰 Optimizing pricing strategies...');
      
      // Analyze market conditions
      const marketConditions = await this.analyzeMarketConditions();
      
      // Adjust pricing based on conditions
      const newPricing = this.calculateOptimalPricing(marketConditions);
      
      // Apply pricing changes
      await this.applyPricingChanges(newPricing);
      
      console.log('✅ Pricing optimization complete');
    } catch (error) {
      console.error('❌ Error optimizing pricing:', error);
    }
  }

  async analyzeMarketConditions() {
    // Analyze user behavior patterns
    const query = `
      SELECT 
        AVG(voice_usage_count) as avg_voice_usage,
        COUNT(CASE WHEN subscription_tier = 'premium' THEN 1 END) as premium_users,
        COUNT(CASE WHEN subscription_tier = 'titled' THEN 1 END) as titled_users
      FROM user_profiles
      WHERE created_at > NOW() - INTERVAL '30 days'
    `;
    
    const result = await pool.query(query);
    const data = result.rows[0];
    
    return {
      avgVoiceUsage: parseFloat(data.avg_voice_usage) || 0,
      premiumRatio: parseInt(data.premium_users) / (parseInt(data.premium_users) + parseInt(data.titled_users)),
      marketDemand: this.calculateMarketDemand(data)
    };
  }

  calculateMarketDemand(data) {
    const baseDemand = 1.0;
    const voiceUsageFactor = Math.min(data.avg_voice_usage / 20, 2.0);
    const premiumFactor = data.premium_ratio > 0.1 ? 1.2 : 0.8;
    
    return baseDemand * voiceUsageFactor * premiumFactor;
  }

  calculateOptimalPricing(marketConditions) {
    const basePrice = this.pricingStrategies.dynamic.basePrice;
    const demandMultiplier = marketConditions.marketDemand;
    const seasonalAdjustment = this.getSeasonalAdjustment();
    
    const optimalPrice = Math.round(basePrice * demandMultiplier * seasonalAdjustment);
    
    return {
      premium: Math.max(15, Math.min(35, optimalPrice)),
      titled: Math.max(30, Math.min(70, optimalPrice * 2))
    };
  }

  getSeasonalAdjustment() {
    const month = new Date().getMonth();
    // Higher prices during peak chess tournament seasons
    if (month >= 2 && month <= 5) return 1.1; // Spring tournaments
    if (month >= 8 && month <= 11) return 1.05; // Fall tournaments
    return 0.95; // Off-season discount
  }

  async applyPricingChanges(newPricing) {
    // Update pricing in database
    const query = `
      UPDATE pricing_config 
      SET premium_price = $1, titled_price = $2, updated_at = NOW()
      WHERE id = 1
    `;
    
    await pool.query(query, [newPricing.premium, newPricing.titled]);
    
    // Notify users of pricing changes
    await this.notifyPricingChanges(newPricing);
  }

  async optimizeConversions() {
    try {
      console.log('🎯 Optimizing conversion rates...');
      
      // Analyze user behavior patterns
      const patterns = await this.analyzeUserBehavior();
      
      // Identify conversion bottlenecks
      const bottlenecks = this.identifyConversionBottlenecks(patterns);
      
      // Apply conversion optimizations
      await this.applyConversionOptimizations(bottlenecks);
      
    } catch (error) {
      console.error('❌ Error optimizing conversions:', error);
    }
  }

  async analyzeUserBehavior() {
    const query = `
      SELECT 
        subscription_tier,
        AVG(voice_usage_count) as avg_voice_usage,
        AVG(EXTRACT(EPOCH FROM (last_login - created_at))/86400) as avg_days_to_activation,
        COUNT(CASE WHEN last_login > NOW() - INTERVAL '1 day' THEN 1 END) as daily_active
      FROM user_profiles 
      GROUP BY subscription_tier
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  identifyConversionBottlenecks(patterns) {
    const bottlenecks = [];
    
    patterns.forEach(pattern => {
      if (pattern.subscription_tier === 'free' && pattern.avg_voice_usage < 5) {
        bottlenecks.push({
          type: 'low_engagement',
          tier: 'free',
          issue: 'Users not engaging with voice features',
          solution: 'improve_onboarding_flow'
        });
      }
      
      if (pattern.subscription_tier === 'premium' && pattern.avg_days_to_activation > 14) {
        bottlenecks.push({
          type: 'slow_conversion',
          tier: 'premium',
          issue: 'Slow conversion from free to premium',
          solution: 'accelerate_conversion_funnel'
        });
      }
    });
    
    return bottlenecks;
  }

  async applyConversionOptimizations(bottlenecks) {
    for (const bottleneck of bottlenecks) {
      switch (bottleneck.solution) {
        case 'improve_onboarding_flow':
          await this.improveOnboardingFlow();
          break;
        case 'accelerate_conversion_funnel':
          await this.accelerateConversionFunnel();
          break;
      }
    }
  }

  async improveOnboardingFlow() {
    console.log('🔄 Improving onboarding flow...');
    
    // Send onboarding completion reminders
    const query = `
      SELECT user_id, username 
      FROM user_profiles 
      WHERE subscription_tier = 'free'
      AND voice_usage_count < 3
      AND created_at > NOW() - INTERVAL '7 days'
    `;
    
    const result = await pool.query(query);
    
    for (const user of result.rows) {
      await this.sendOnboardingReminder(user.user_id);
    }
  }

  async accelerateConversionFunnel() {
    console.log('⚡ Accelerating conversion funnel...');
    
    // Offer time-limited premium trials
    const query = `
      SELECT user_id, username, voice_usage_count
      FROM user_profiles 
      WHERE subscription_tier = 'free'
      AND voice_usage_count > 8
      AND last_login > NOW() - INTERVAL '3 days'
    `;
    
    const result = await pool.query(query);
    
    for (const user of result.rows) {
      await this.offerPremiumTrial(user.user_id);
    }
  }

  async sendPersonalizedOffer(userId, offerType) {
    const offer = {
      type: offerType,
      discount: 0.20,
      duration: '7 days',
      message: 'Exclusive offer just for you!'
    };
    
    // Send offer via email/notification
    await this.sendOfferNotification(userId, offer);
    
    // Log offer
    await this.logRevenueEvent('offer_sent', {
      userId,
      offerType,
      timestamp: new Date()
    });
  }

  async sendRetentionOffer(userId) {
    const offer = {
      type: 'retention',
      discount: 0.30,
      duration: '30 days',
      message: 'We miss you! Come back with this special offer.'
    };
    
    await this.sendOfferNotification(userId, offer);
  }

  async sendTitledPlayerInvitation(userId) {
    const invitation = {
      type: 'titled_invitation',
      benefits: ['revenue_sharing', 'exclusive_content', 'direct_support'],
      message: 'Join our exclusive titled player program!'
    };
    
    await this.sendOfferNotification(userId, invitation);
  }

  async sendOnboardingReminder(userId) {
    const reminder = {
      type: 'onboarding_reminder',
      message: 'Complete your setup to unlock all features!',
      action: 'complete_onboarding'
    };
    
    await this.sendOfferNotification(userId, reminder);
  }

  async offerPremiumTrial(userId) {
    const trial = {
      type: 'premium_trial',
      duration: '7 days',
      features: ['unlimited_voice', 'advanced_analysis'],
      message: 'Try premium features free for 7 days!'
    };
    
    await this.sendOfferNotification(userId, trial);
  }

  async sendOfferNotification(userId, offer) {
    // In a real implementation, this would send email/push notifications
    console.log(`📧 Sending offer to user ${userId}:`, offer);
  }

  async notifyPricingChanges(newPricing) {
    // Notify users about pricing changes
    console.log(`💰 Notifying users of new pricing: Premium $${newPricing.premium}, Titled $${newPricing.titled}`);
  }

  initializeABTesting() {
    console.log('🧪 Initializing A/B testing framework...');
    
    // Set up A/B test configurations
    this.abTests = {
      pricing_test: {
        variant_a: { premium_price: 25, titled_price: 50 },
        variant_b: { premium_price: 30, titled_price: 60 },
        traffic_split: 0.5,
        metric: 'conversion_rate'
      },
      onboarding_test: {
        variant_a: { flow: 'standard' },
        variant_b: { flow: 'accelerated' },
        traffic_split: 0.5,
        metric: 'completion_rate'
      }
    };
  }

  async logRevenueEvent(eventType, data) {
    try {
      const query = `
        INSERT INTO revenue_events (event_type, data, created_at)
        VALUES ($1, $2, NOW())
      `;
      
      await pool.query(query, [eventType, JSON.stringify(data)]);
    } catch (error) {
      console.error('❌ Error logging revenue event:', error);
    }
  }

  getStats() {
    return {
      mrr: this.revenueMetrics.mrr,
      arr: this.revenueMetrics.arr,
      conversionRate: this.revenueMetrics.conversionRate,
      optimizationRules: this.optimizationRules.length,
      abTests: Object.keys(this.abTests).length
    };
  }

  async shutdown() {
    console.log('🛑 Shutting down Revenue Optimization AI...');
    // Cleanup resources
  }
}

const revenueOptimizationAI = new RevenueOptimizationAI();
module.exports = { revenueOptimizationAI, RevenueOptimizationAI }; 
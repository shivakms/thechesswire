import Stripe from 'stripe';
import { Pool } from 'pg';
import { notificationSystem } from '../notifications';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use supported API version
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}

export interface TitledPlayerTier {
  id: string;
  title: string;
  revenueShare: number;
  verificationRequired: string[];
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

class StripePaymentSystem {
  private subscriptionTiers: SubscriptionTier[] = [
    {
      id: 'premium-monthly',
      name: 'Premium Monthly',
      price: 25,
      interval: 'month',
      features: [
        'Unlimited SoulCinema renders',
        'All Bambai AI voice modes',
        'Advanced EchoSage features',
        'Priority support',
        'Export capabilities',
        'Custom voice styles',
        'Offline mode',
        'Advanced analytics'
      ],
      stripePriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!
    },
    {
      id: 'premium-yearly',
      name: 'Premium Yearly',
      price: 250,
      interval: 'year',
      features: [
        'All monthly features',
        '2 months free',
        'Early access to new features',
        'Exclusive content'
      ],
      stripePriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!
    },
    {
      id: 'enterprise-corporate',
      name: 'Enterprise Corporate',
      price: 999,
      interval: 'month',
      features: [
        'Custom branded experiences',
        'Team building modules',
        'Bambai AI corporate trainer',
        'Analytics dashboard for HR',
        'White-label AI journalist',
        'API access',
        'Custom AI training',
        'Bulk content generation',
        'Dedicated AI reporter'
      ],
      stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!
    },
    {
      id: 'enterprise-healthcare',
      name: 'Enterprise Healthcare',
      price: 499,
      interval: 'month',
      features: [
        'Medical-grade interventions',
        'Clinical trial support',
        'Patient progress tracking',
        'HIPAA-compliant infrastructure',
        'Therapist dashboard',
        'Research collaboration tools'
      ],
      stripePriceId: process.env.STRIPE_HEALTHCARE_PRICE_ID!
    }
  ];

  private titledPlayerTiers: TitledPlayerTier[] = [
    {
      id: 'retired-gm',
      title: 'Retired GM/WGM/IM/WIM',
      revenueShare: 0.15,
      verificationRequired: ['fide_id', 'retirement_proof', 'video_call']
    },
    {
      id: 'active-gm',
      title: 'Active GM/WGM/IM/WIM',
      revenueShare: 0.10,
      verificationRequired: ['fide_id', 'active_status', 'video_call']
    },
    {
      id: 'other-titled',
      title: 'Other Titled Players (FM/WFM/CM/WCM/NM)',
      revenueShare: 0.06,
      verificationRequired: ['fide_id', 'title_proof', 'video_call']
    }
  ];

  async createCustomer(userId: string, email: string, name?: string): Promise<string> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
          platform: 'thechesswire'
        }
      });

      await pool.query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [customer.id, userId]
      );

      return customer.id;
    } catch (error) {
      console.error('Failed to create Stripe customer:', error);
      throw error;
    }
  }

  async createSubscription(
    userId: string,
    tierId: string,
    paymentMethodId: string
  ): Promise<{ subscriptionId: string; clientSecret: string }> {
    try {
      const tier = this.subscriptionTiers.find(t => t.id === tierId);
      if (!tier) {
        throw new Error('Invalid subscription tier');
      }

      // Get or create customer
      const userResult = await pool.query(
        'SELECT stripe_customer_id, email FROM users WHERE id = $1',
        [userId]
      );

      let customerId = userResult.rows[0]?.stripe_customer_id;
      if (!customerId) {
        customerId = await this.createCustomer(userId, userResult.rows[0].email);
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: tier.stripePriceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId,
          tierId,
          platform: 'thechesswire'
        }
      });

      const clientSecret = (subscription.latest_invoice as any).payment_intent.client_secret;

      // Store subscription in database
      await pool.query(
        `INSERT INTO subscriptions 
         (id, user_id, stripe_subscription_id, tier_id, status, current_period_start, current_period_end, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          crypto.randomUUID(),
          userId,
          subscription.id,
          tierId,
          subscription.status,
          new Date(subscription.current_period_start * 1000),
          new Date(subscription.current_period_end * 1000)
        ]
      );

      return {
        subscriptionId: subscription.id,
        clientSecret
      };
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(userId: string): Promise<void> {
    try {
      const result = await pool.query(
        'SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1 AND status = $2',
        [userId, 'active']
      );

      if (result.rows.length === 0) {
        throw new Error('No active subscription found');
      }

      const subscriptionId = result.rows[0].stripe_subscription_id;

      // Cancel at period end
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });

      // Update database
      await pool.query(
        'UPDATE subscriptions SET status = $1, canceled_at = NOW() WHERE stripe_subscription_id = $2',
        ['canceled', subscriptionId]
      );
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  async reactivateSubscription(userId: string): Promise<void> {
    try {
      const result = await pool.query(
        'SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1 AND status = $2',
        [userId, 'canceled']
      );

      if (result.rows.length === 0) {
        throw new Error('No canceled subscription found');
      }

      const subscriptionId = result.rows[0].stripe_subscription_id;

      // Reactivate subscription
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
      });

      // Update database
      await pool.query(
        'UPDATE subscriptions SET status = $1, reactivated_at = NOW() WHERE stripe_subscription_id = $2',
        ['active', subscriptionId]
      );
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      throw error;
    }
  }

  async updatePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    try {
      const userResult = await pool.query(
        'SELECT stripe_customer_id FROM users WHERE id = $1',
        [userId]
      );

      if (!userResult.rows[0]?.stripe_customer_id) {
        throw new Error('No Stripe customer found');
      }

      const customerId = userResult.rows[0].stripe_customer_id;

      // Attach new payment method
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    } catch (error) {
      console.error('Failed to update payment method:', error);
      throw error;
    }
  }

  async getSubscriptionStatus(userId: string): Promise<any> {
    try {
      const result = await pool.query(
        `SELECT s.*, st.name as tier_name, st.features
         FROM subscriptions s
         JOIN subscription_tiers st ON s.tier_id = st.id
         WHERE s.user_id = $1 AND s.status IN ('active', 'past_due')
         ORDER BY s.created_at DESC
         LIMIT 1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return { hasSubscription: false };
      }

      const subscription = result.rows[0];
      return {
        hasSubscription: true,
        tier: subscription.tier_name,
        features: subscription.features,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      };
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      throw error;
    }
  }

  async processTitledPlayerRevenue(
    titledPlayerId: string,
    contentId: string,
    revenueAmount: number
  ): Promise<void> {
    try {
      // Get titled player tier
      const playerResult = await pool.query(
        'SELECT tier_id FROM titled_players WHERE user_id = $1 AND is_verified = TRUE',
        [titledPlayerId]
      );

      if (playerResult.rows.length === 0) {
        throw new Error('Titled player not found or not verified');
      }

      const tierId = playerResult.rows[0].tier_id;
      const tier = this.titledPlayerTiers.find(t => t.id === tierId);

      if (!tier) {
        throw new Error('Invalid titled player tier');
      }

      const revenueShare = revenueAmount * tier.revenueShare;

      // Create revenue record
      await pool.query(
        `INSERT INTO titled_player_revenue 
         (id, user_id, content_id, revenue_amount, revenue_share, tier_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          crypto.randomUUID(),
          titledPlayerId,
          contentId,
          revenueAmount,
          revenueShare,
          tierId
        ]
      );

      // Update total earnings
      await pool.query(
        'UPDATE titled_players SET total_earnings = total_earnings + $1 WHERE user_id = $2',
        [revenueShare, titledPlayerId]
      );
    } catch (error) {
      console.error('Failed to process titled player revenue:', error);
      throw error;
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: any
  ): Promise<PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret!
      };
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw error;
    }
  }

  async getInvoices(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const userResult = await pool.query(
        'SELECT stripe_customer_id FROM users WHERE id = $1',
        [userId]
      );

      if (!userResult.rows[0]?.stripe_customer_id) {
        return [];
      }

      const invoices = await stripe.invoices.list({
        customer: userResult.rows[0].stripe_customer_id,
        limit
      });

      return invoices.data.map(invoice => ({
        id: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        created: new Date(invoice.created * 1000),
        invoicePdf: invoice.invoice_pdf,
        hostedInvoiceUrl: invoice.hosted_invoice_url
      }));
    } catch (error) {
      console.error('Failed to get invoices:', error);
      return [];
    }
  }

  async refundPayment(paymentIntentId: string, amount?: number): Promise<void> {
    try {
      await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount
      });
    } catch (error) {
      console.error('Failed to create refund:', error);
      throw error;
    }
  }

  async getSubscriptionTiers(): Promise<SubscriptionTier[]> {
    return this.subscriptionTiers;
  }

  async getTitledPlayerTiers(): Promise<TitledPlayerTier[]> {
    return this.titledPlayerTiers;
  }

  // Webhook handlers
  async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    try {
      const userId = subscription.metadata.userId;
      const tierId = subscription.metadata.tierId;

      await pool.query(
        `UPDATE subscriptions 
         SET status = $1, current_period_start = $2, current_period_end = $3, updated_at = NOW()
         WHERE stripe_subscription_id = $4`,
        [
          subscription.status,
          new Date(subscription.current_period_start * 1000),
          new Date(subscription.current_period_end * 1000),
          subscription.id
        ]
      );

      // Update user subscription status
      await pool.query(
        'UPDATE users SET subscription_tier = $1, subscription_status = $2 WHERE id = $3',
        [tierId, subscription.status, userId]
      );
    } catch (error) {
      console.error('Failed to handle subscription update:', error);
    }
  }

  async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      // Handle successful payment
      const userId = paymentIntent.metadata.userId;
      
      if (userId) {
        await pool.query(
          'UPDATE users SET last_payment_at = NOW() WHERE id = $1',
          [userId]
        );
      }
    } catch (error) {
      console.error('Failed to handle payment success:', error);
    }
  }

  async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      // Handle failed payment
      const userId = paymentIntent.metadata.userId;
      
      if (userId) {
        // Send notification to user
        await notificationSystem.createNotification(
          userId,
          'warning',
          'Payment Failed',
          'Your payment has failed. Please update your payment method to continue your subscription.',
          { paymentIntentId: paymentIntent.id }
        );
      }
    } catch (error) {
      console.error('Failed to handle payment failure:', error);
    }
  }
}

// Singleton instance
const stripePaymentSystem = new StripePaymentSystem();

export { stripePaymentSystem, StripePaymentSystem }; 
import { getDb } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil',
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  stripePriceId: string;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 999,
    features: ['unlimited_articles', 'voice_narration', 'advanced_analytics', 'priority_support'],
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || ''
  },
  premium_titled: {
    id: 'premium_titled',
    name: 'Premium Titled',
    price: 1999,
    features: ['all_premium_features', 'titled_player_verification', 'exclusive_content', 'coaching_access'],
    stripePriceId: process.env.STRIPE_PREMIUM_TITLED_PRICE_ID || ''
  }
};

export class SubscriptionManager {
  static async createSubscription(userId: number, plan: 'premium' | 'premium_titled', customerEmail: string) {
    try {
      const planConfig = SUBSCRIPTION_PLANS[plan];
      if (!planConfig) {
        throw new Error('Invalid subscription plan');
      }

      const customer = await stripe.customers.create({
        email: customerEmail,
        metadata: { userId: userId.toString() }
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: planConfig.stripePriceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      const db = await getDb();
      await db.query(
        'INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_customer_id, plan_type, status, current_period_start, current_period_end) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          userId,
          subscription.id,
          customer.id,
          plan,
          subscription.status,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          new Date((subscription as any).current_period_start * 1000),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          new Date((subscription as any).current_period_end * 1000)
        ]
      );

      return {
        subscriptionId: subscription.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret
      };
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  static async checkFeatureAccess(userId: number, feature: string): Promise<boolean> {
    try {
      const db = await getDb();
      const result = await db.query(
        'SELECT s.plan_type, s.status FROM subscriptions s WHERE s.user_id = $1 AND s.status = $2 AND s.current_period_end > NOW()',
        [userId, 'active']
      );

      if (result.rows.length === 0) {
        return false;
      }

      const subscription = result.rows[0];
      const plan = SUBSCRIPTION_PLANS[subscription.plan_type];
      
      return plan?.features.includes(feature) || false;
    } catch (error) {
      console.error('Failed to check feature access:', error);
      return false;
    }
  }

  static async trackUsage(userId: number, feature: string, amount: number) {
    try {
      const db = await getDb();
      await db.query(
        'INSERT INTO feature_usage (user_id, feature, usage_amount, created_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (user_id, feature, DATE(created_at)) DO UPDATE SET usage_amount = feature_usage.usage_amount + EXCLUDED.usage_amount',
        [userId, feature, amount]
      );
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  }

  static async getUsageStats(userId: number, feature: string, period: 'day' | 'month' = 'month') {
    try {
      const db = await getDb();
      const interval = period === 'day' ? '24 hours' : '30 days';
      
      const result = await db.query(
        'SELECT SUM(usage_amount) as total_usage FROM feature_usage WHERE user_id = $1 AND feature = $2 AND created_at > NOW() - INTERVAL $3',
        [userId, feature, interval]
      );

      return parseInt(result.rows[0]?.total_usage || '0');
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      return 0;
    }
  }

  static async handleWebhook(event: Stripe.Event) {
    try {
      const db = await getDb();

      switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.created':
          const subscription = event.data.object as Stripe.Subscription;
          await db.query(
            'UPDATE subscriptions SET status = $1, current_period_start = $2, current_period_end = $3 WHERE stripe_subscription_id = $4',
            [
              subscription.status,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              new Date((subscription as any).current_period_start * 1000),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              new Date((subscription as any).current_period_end * 1000),
              subscription.id
            ]
          );
          break;

        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object as Stripe.Subscription;
          await db.query(
            'UPDATE subscriptions SET status = $1 WHERE stripe_subscription_id = $2',
            ['canceled', deletedSubscription.id]
          );
          break;

        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((invoice as any).subscription) {
            await db.query(
              'UPDATE subscriptions SET status = $1 WHERE stripe_subscription_id = $2',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ['active', (invoice as any).subscription]
            );
          }
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((failedInvoice as any).subscription) {
            await db.query(
              'UPDATE subscriptions SET status = $1 WHERE stripe_subscription_id = $2',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ['past_due', (failedInvoice as any).subscription]
            );
          }
          break;
      }
    } catch (error) {
      console.error('Failed to handle webhook:', error);
      throw error;
    }
  }

  static async getUserSubscription(userId: number) {
    try {
      const db = await getDb();
      const result = await db.query(
        'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get user subscription:', error);
      return null;
    }
  }
}

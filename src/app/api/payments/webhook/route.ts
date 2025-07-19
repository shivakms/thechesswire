import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { pool } from '@/lib/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('🔔 Stripe webhook received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;

    if (!userId || !plan) {
      console.error('Missing metadata in checkout session:', session.id);
      return;
    }

    // Update user premium status
    const expiresAt = new Date();
    if (plan === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (plan === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    await pool.query(
      `UPDATE users 
       SET is_premium = true, premium_expires_at = $1, updated_at = NOW()
       WHERE id = $2`,
      [expiresAt, userId]
    );

    console.log('✅ User premium status updated:', { userId, plan, expiresAt });

  } catch (error) {
    console.error('Failed to handle checkout session completed:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;
    const plan = subscription.metadata?.plan;

    if (!userId || !plan) {
      console.error('Missing metadata in subscription:', subscription.id);
      return;
    }

    // Update user premium status
    const expiresAt = new Date(subscription.current_period_end * 1000);

    await pool.query(
      `UPDATE users 
       SET is_premium = true, premium_expires_at = $1, updated_at = NOW()
       WHERE id = $2`,
      [expiresAt, userId]
    );

    console.log('✅ Subscription created and user updated:', { userId, plan, expiresAt });

  } catch (error) {
    console.error('Failed to handle subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;
    
    if (!userId) {
      console.error('Missing userId in subscription metadata:', subscription.id);
      return;
    }

    if (subscription.status === 'active') {
      const expiresAt = new Date(subscription.current_period_end * 1000);
      
      await pool.query(
        `UPDATE users 
         SET is_premium = true, premium_expires_at = $1, updated_at = NOW()
         WHERE id = $2`,
        [expiresAt, userId]
      );
    } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      await pool.query(
        `UPDATE users 
         SET is_premium = false, premium_expires_at = NULL, updated_at = NOW()
         WHERE id = $2`,
        [userId]
      );
    }

    console.log('✅ Subscription updated:', { userId, status: subscription.status });

  } catch (error) {
    console.error('Failed to handle subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;
    
    if (!userId) {
      console.error('Missing userId in subscription metadata:', subscription.id);
      return;
    }

    await pool.query(
      `UPDATE users 
       SET is_premium = false, premium_expires_at = NULL, updated_at = NOW()
       WHERE id = $1`,
      [userId]
    );

    console.log('✅ Subscription deleted and user premium removed:', { userId });

  } catch (error) {
    console.error('Failed to handle subscription deleted:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      const userId = subscription.metadata?.userId;
      
      if (userId) {
        const expiresAt = new Date(subscription.current_period_end * 1000);
        
        await pool.query(
          `UPDATE users 
           SET is_premium = true, premium_expires_at = $1, updated_at = NOW()
           WHERE id = $2`,
          [expiresAt, userId]
        );

        console.log('✅ Invoice payment succeeded, user premium extended:', { userId, expiresAt });
      }
    }
  } catch (error) {
    console.error('Failed to handle invoice payment succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      const userId = subscription.metadata?.userId;
      
      if (userId) {
        await pool.query(
          `UPDATE users 
           SET is_premium = false, premium_expires_at = NULL, updated_at = NOW()
           WHERE id = $1`,
          [userId]
        );

        console.log('❌ Invoice payment failed, user premium removed:', { userId });
      }
    }
  } catch (error) {
    console.error('Failed to handle invoice payment failed:', error);
  }
} 
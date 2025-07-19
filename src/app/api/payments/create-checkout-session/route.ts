import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { plan, userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Define pricing based on plan
    const pricing = {
      monthly: {
        price: 2500, // $25.00 in cents
        currency: 'usd',
        interval: 'month',
        productName: 'TheChessWire Premium Monthly'
      },
      yearly: {
        price: 25000, // $250.00 in cents
        currency: 'usd',
        interval: 'year',
        productName: 'TheChessWire Premium Yearly'
      }
    };

    const selectedPricing = pricing[plan as keyof typeof pricing];
    if (!selectedPricing) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Create or retrieve product
    let product;
    try {
      const products = await stripe.products.list({
        limit: 100,
        active: true
      });
      
      product = products.data.find(p => p.name === selectedPricing.productName);
      
      if (!product) {
        product = await stripe.products.create({
          name: selectedPricing.productName,
          description: 'Premium access to TheChessWire.news with unlimited AI features',
          metadata: {
            plan: plan
          }
        });
      }
    } catch (error) {
      console.error('Product creation/retrieval failed:', error);
      return NextResponse.json(
        { error: 'Failed to setup product' },
        { status: 500 }
      );
    }

    // Create or retrieve price
    let price;
    try {
      const prices = await stripe.prices.list({
        product: product.id,
        active: true
      });
      
      price = prices.data.find(p => 
        p.unit_amount === selectedPricing.price && 
        p.currency === selectedPricing.currency &&
        p.recurring?.interval === selectedPricing.interval
      );
      
      if (!price) {
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: selectedPricing.price,
          currency: selectedPricing.currency,
          recurring: {
            interval: selectedPricing.interval as 'month' | 'year'
          }
        });
      }
    } catch (error) {
      console.error('Price creation/retrieval failed:', error);
      return NextResponse.json(
        { error: 'Failed to setup pricing' },
        { status: 500 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upgrade?canceled=true`,
      customer_email: request.headers.get('user-email') || undefined,
      metadata: {
        userId: userId,
        plan: plan
      },
      subscription_data: {
        metadata: {
          userId: userId,
          plan: plan
        }
      },
      billing_address_collection: 'required',
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      sessionId: session.id,
      sessionUrl: session.url
    });

  } catch (error) {
    console.error('Checkout session creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 
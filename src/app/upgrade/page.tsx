'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Crown, Check, Sparkles, Zap, Star, Shield, Users, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UpgradePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  const plans = {
    monthly: {
      price: 25,
      period: 'month',
      savings: null,
      popular: false
    },
    yearly: {
      price: 250,
      period: 'year',
      savings: 50, // $50 savings
      popular: true
    }
  };

  const features = [
    'Unlimited SoulCinema renders with all effects',
    'All Bambai AI voice modes (Calm, Expressive, Dramatic, Poetic, Whisper)',
    'Language Whisper Mode (multi-language support)',
    'Unlimited video generation and social media uploads',
    'Advanced EchoSage features and unlimited training',
    'Premium emotional analysis and advanced EchoRank features',
    'Export capabilities (PGN, video, audio downloads)',
    'Advanced coaching modes and personalized AI feedback',
    'Priority customer support (AI-powered)',
    'Advanced analytics and performance tracking',
    'Custom voice styles and tempo control',
    'Offline mode and downloadable content',
    'Advanced memory features and personal chess journey',
    'Custom chess themes and board personalization',
    'Early access to new features and beta testing',
    'Live Chess Symphony participation',
    'Audience-Driven Chess Stories hosting',
    'Chess Battle Royale Mode access',
    'Neural Chess Patterns with predictive AI',
    'Unlimited Parallel Universe Chess',
    'Chess Dream Interpreter full access',
    'Emotional Chess Weather System',
    'Full Chess Memory Palace building',
    'Predictive Chess Autobiography',
    'Quantum Entangled Games',
    'Biometric Chess Optimization',
    'Unlimited Chess ASMR sessions',
    'Synaesthetic Chess Experience',
    'Chess Time Capsule Network creation',
    'Mirror Neuron Training'
  ];

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      // TODO: Integrate with Stripe
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
          userId: user?.id
        }),
      });

      if (response.ok) {
        const { sessionUrl } = await response.json();
        window.location.href = sessionUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      // Fallback to demo mode
      alert('Payment system coming soon! This is a demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Crown className="w-16 h-16 text-yellow-400 mr-4" />
            <h1 className="text-5xl font-bold text-white">Upgrade to Premium</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Unlock the full potential of TheChessWire.news with unlimited access to all AI-powered features, 
            advanced analysis, and revolutionary chess experiences.
          </p>
        </div>

        {/* Plan Selection */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`px-6 py-3 rounded-md font-medium transition-all ${
                    selectedPlan === 'monthly'
                      ? 'bg-white text-purple-600'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={`px-6 py-3 rounded-md font-medium transition-all relative ${
                    selectedPlan === 'yearly'
                      ? 'bg-white text-purple-600'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Yearly
                  {plans.yearly.savings && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Save ${plans.yearly.savings}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Price Display */}
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-white mb-2">
                ${plans[selectedPlan].price}
                <span className="text-2xl text-gray-300">/{plans[selectedPlan].period}</span>
              </div>
              {plans[selectedPlan].savings && (
                <p className="text-green-400 font-medium">
                  Save ${plans[selectedPlan].savings} compared to monthly billing
                </p>
              )}
            </div>

            {/* Upgrade Button */}
            <div className="text-center mb-8">
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 py-4 rounded-lg font-bold text-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center mx-auto space-x-3 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span>Upgrade Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose Premium?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Unlimited Power</h3>
              <p className="text-gray-300">
                Access all AI features without limits. Generate unlimited content, 
                videos, and analysis with our advanced AI systems.
              </p>
            </div>

            <div className="text-center">
              <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Priority Support</h3>
              <p className="text-gray-300">
                Get instant AI-powered support and priority access to new features. 
                Your success is our priority.
              </p>
            </div>

            <div className="text-center">
              <Users className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Community Access</h3>
              <p className="text-gray-300">
                Join exclusive premium communities, participate in special events, 
                and connect with fellow chess enthusiasts.
              </p>
            </div>
          </div>
        </div>

        {/* Guarantee */}
        <div className="text-center mt-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 max-w-2xl mx-auto">
            <Clock className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">30-Day Money-Back Guarantee</h3>
            <p className="text-gray-300">
              Try Premium risk-free. If you're not completely satisfied within 30 days, 
              we'll refund your subscription, no questions asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
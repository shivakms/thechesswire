'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Sparkles, Zap, Star } from 'lucide-react';

interface UpgradeToPremiumProps {
  variant?: 'banner' | 'card' | 'inline';
  title?: string;
  description?: string;
  showFeatures?: boolean;
  className?: string;
}

export default function UpgradeToPremium({
  variant = 'banner',
  title = 'Unlock Premium Features',
  description = 'Get unlimited access to all advanced features and AI capabilities',
  showFeatures = true,
  className = ''
}: UpgradeToPremiumProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/upgrade');
  };

  const features = [
    'Unlimited SoulCinema renders',
    'All Bambai AI voice modes',
    'Advanced EchoSage training',
    'Premium emotional analysis',
    'Export capabilities',
    'Priority AI support'
  ];

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg shadow-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Crown className="w-8 h-8 text-yellow-300" />
            <div>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-purple-100">{description}</p>
            </div>
          </div>
          <button
            onClick={handleUpgrade}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upgrade Now</span>
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-6 shadow-lg ${className}`}>
        <div className="text-center mb-6">
          <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>

        {showFeatures && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Premium Features
            </h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-700">
                  <Zap className="w-3 h-3 mr-2 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Upgrade to Premium</span>
        </button>

        <p className="text-xs text-gray-500 text-center mt-3">
          $25/month or $250/year • Cancel anytime
        </p>
      </div>
    );
  }

  // Inline variant
  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <Crown className="w-4 h-4 text-yellow-500" />
      <button
        onClick={handleUpgrade}
        className="text-purple-600 hover:text-purple-700 font-medium underline"
      >
        Upgrade to Premium
      </button>
    </div>
  );
} 
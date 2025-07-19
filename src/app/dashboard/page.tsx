'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Brain, 
  Shield, 
  Video, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  BarChart3,
  Gamepad2,
  Mic,
  Camera,
  MessageSquare,
  Zap,
  Target,
  Award,
  Crown,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface DashboardStats {
  totalGames: number;
  currentRating: number;
  gamesThisWeek: number;
  improvementRate: number;
  videosCreated: number;
  socialPosts: number;
  earnings: number;
  securityScore: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  badge?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalGames: 0,
    currentRating: 1200,
    gamesThisWeek: 0,
    improvementRate: 0,
    videosCreated: 0,
    socialPosts: 0,
    earnings: 0,
    securityScore: 95
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // In real implementation, fetch from API
      setStats({
        totalGames: 247,
        currentRating: 1456,
        gamesThisWeek: 12,
        improvementRate: 8.5,
        videosCreated: 23,
        socialPosts: 156,
        earnings: 1250.50,
        securityScore: 98
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'play-game',
      title: 'Play Game',
      description: 'Start a new chess game',
      icon: <Gamepad2 className="w-6 h-6" />,
      href: '/play',
      color: 'bg-blue-500 hover:bg-blue-600',
      badge: 'Quick Start'
    },
    {
      id: 'echosage',
      title: 'EchoSage AI',
      description: 'Advanced AI coaching & analysis',
      icon: <Brain className="w-6 h-6" />,
      href: '/echosage',
      color: 'bg-purple-500 hover:bg-purple-600',
      badge: 'Premium'
    },
    {
      id: 'soulcinema',
      title: 'SoulCinema',
      description: 'Create cinematic chess videos',
      icon: <Video className="w-6 h-6" />,
      href: '/soulcinema',
      color: 'bg-red-500 hover:bg-red-600',
      badge: 'New'
    },
    {
      id: 'voice-narration',
      title: 'Voice Narration',
      description: 'AI-powered game commentary',
      icon: <Mic className="w-6 h-6" />,
      href: '/voice-test',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'social-media',
      title: 'Social Media',
      description: 'Auto-post & viral content',
      icon: <MessageSquare className="w-6 h-6" />,
      href: '/social-media',
      color: 'bg-pink-500 hover:bg-pink-600',
      badge: 'Automated'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Performance insights & trends',
      icon: <BarChart3 className="w-6 h-6" />,
      href: '/analytics',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    }
  ];

  const specializedDashboards = [
    {
      id: 'memory-archive',
      title: 'Memory & Archive',
      description: 'Personal game history & patterns',
      icon: <FileText className="w-5 h-5" />,
      href: '/dashboard/memory-archive',
      features: ['Game Archive', 'Pattern Recognition', 'Weakness Analysis', 'Training Recommendations']
    },
    {
      id: 'personalization',
      title: 'Personalization Engine',
      description: 'AI training & learning insights',
      icon: <Target className="w-5 h-5" />,
      href: '/dashboard/personalization',
      features: ['Learning Style', 'Adaptive Training', 'Progress Tracking', 'Goal Setting']
    },
    {
      id: 'social-virality',
      title: 'Social Virality',
      description: 'Viral content & engagement',
      icon: <TrendingUp className="w-5 h-5" />,
      href: '/dashboard/social-virality',
      features: ['Meme Generator', 'Viral Prediction', 'Challenge Creator', 'Influencer Tools']
    },
    {
      id: 'premium-infrastructure',
      title: 'Premium Features',
      description: 'Monetization & verification',
      icon: <Crown className="w-5 h-5" />,
      href: '/dashboard/premium',
      features: ['Revenue Sharing', 'Titled Verification', 'NFT Marketplace', 'Affiliate Program']
    },
    {
      id: 'security',
      title: 'Security & Quality',
      description: 'Fraud detection & content quality',
      icon: <Shield className="w-5 h-5" />,
      href: '/dashboard/security',
      features: ['Fraud Detection', 'Content Quality', 'Crisis Management', 'Threat Intelligence']
    },
    {
      id: 'earnings',
      title: 'Earnings Dashboard',
      description: 'Revenue tracking & analytics',
      icon: <DollarSign className="w-5 h-5" />,
      href: '/dashboard/earnings',
      features: ['Royalty Tracking', 'Payout History', 'Performance Metrics', 'Tax Documents']
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'game',
      title: 'Won against GM_Player123',
      description: 'Ruy Lopez opening, 45 moves',
      time: '2 hours ago',
      icon: <CheckCircle className="w-4 h-4 text-green-500" />
    },
    {
      id: 2,
      type: 'video',
      title: 'SoulCinema video completed',
      description: 'Epic Battle theme, 4K quality',
      time: '4 hours ago',
      icon: <Video className="w-4 h-4 text-blue-500" />
    },
    {
      id: 3,
      type: 'social',
      title: 'Viral post on Twitter',
      description: '2.3K likes, 456 retweets',
      time: '6 hours ago',
      icon: <TrendingUp className="w-4 h-4 text-pink-500" />
    },
    {
      id: 4,
      type: 'training',
      title: 'Completed EchoSage session',
      description: 'Endgame training, +15 rating points',
      time: '1 day ago',
      icon: <Brain className="w-4 h-4 text-purple-500" />
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-lg">Loading your chess universe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">ChessWire Dashboard</h1>
          <p className="text-gray-300">Your complete chess universe at your fingertips</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Games</p>
                <p className="text-2xl font-bold text-white">{stats.totalGames}</p>
              </div>
              <Gamepad2 className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Current Rating</p>
                <p className="text-2xl font-bold text-white">{stats.currentRating}</p>
                <p className="text-green-400 text-sm">+{stats.improvementRate}% this month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Videos Created</p>
                <p className="text-2xl font-bold text-white">{stats.videosCreated}</p>
                <p className="text-blue-400 text-sm">SoulCinema</p>
              </div>
              <Video className="w-8 h-8 text-red-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-white">${stats.earnings}</p>
                <p className="text-yellow-400 text-sm">This month</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <div
                key={action.id}
                onClick={() => router.push(action.href)}
                className={`${action.color} rounded-lg p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-white">{action.icon}</div>
                  {action.badge && (
                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                      {action.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-white font-semibold text-lg mb-1">{action.title}</h3>
                <p className="text-white/80 text-sm">{action.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Specialized Dashboards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Specialized Dashboards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specializedDashboards.map((dashboard) => (
              <div
                key={dashboard.id}
                onClick={() => router.push(dashboard.href)}
                className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:bg-white/20"
              >
                <div className="flex items-center mb-4">
                  <div className="text-blue-400 mr-3">{dashboard.icon}</div>
                  <h3 className="text-white font-semibold text-lg">{dashboard.title}</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">{dashboard.description}</p>
                <div className="space-y-1">
                  {dashboard.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-400">
                      <div className="w-1 h-1 bg-blue-400 rounded-full mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center p-4 border-b border-white/10 last:border-b-0">
                <div className="mr-4">{activity.icon}</div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{activity.title}</h4>
                  <p className="text-gray-300 text-sm">{activity.description}</p>
                </div>
                <div className="text-gray-400 text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Status */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-400 mr-3" />
              <div>
                <h3 className="text-white font-semibold">Security Status</h3>
                <p className="text-gray-300 text-sm">All systems secure</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">{stats.securityScore}%</p>
              <p className="text-gray-300 text-sm">Security Score</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
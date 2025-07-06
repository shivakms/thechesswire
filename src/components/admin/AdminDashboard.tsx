'use client';

import React, { useState, useEffect } from 'react';

interface DashboardMetrics {
  users: {
    total_users: number;
    new_users_24h: number;
    active_users_24h: number;
  };
  content: Array<{
    content_type: string;
    total_content: number;
    total_views: number;
    avg_engagement: number;
  }>;
  voice: Array<{
    voice_mode: string;
    interactions: number;
    avg_duration: number;
  }>;
  premium: {
    premium_users: number;
    premium_interactions: number;
  };
  timestamp: Date;
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/admin/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <h2 className="text-red-400 text-xl font-bold mb-2">Error Loading Dashboard</h2>
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">TheChessWire Admin Dashboard</h1>
          <p className="text-slate-300">Real-time analytics and system monitoring</p>
          {metrics?.timestamp && (
            <p className="text-slate-400 text-sm mt-2">
              Last updated: {new Date(metrics.timestamp).toLocaleString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h3 className="text-slate-300 text-sm font-medium mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-white">{metrics?.users.total_users || 0}</p>
            <p className="text-green-400 text-sm mt-1">
              +{metrics?.users.new_users_24h || 0} today
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h3 className="text-slate-300 text-sm font-medium mb-2">Active Users (24h)</h3>
            <p className="text-3xl font-bold text-white">{metrics?.users.active_users_24h || 0}</p>
            <p className="text-blue-400 text-sm mt-1">
              {metrics?.users.total_users ? 
                Math.round((metrics.users.active_users_24h / metrics.users.total_users) * 100) : 0}% of total
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h3 className="text-slate-300 text-sm font-medium mb-2">Premium Users</h3>
            <p className="text-3xl font-bold text-white">{metrics?.premium.premium_users || 0}</p>
            <p className="text-purple-400 text-sm mt-1">
              {metrics?.premium.premium_interactions || 0} interactions today
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h3 className="text-slate-300 text-sm font-medium mb-2">Total Content Views</h3>
            <p className="text-3xl font-bold text-white">
              {metrics?.content.reduce((sum, item) => sum + item.total_views, 0) || 0}
            </p>
            <p className="text-yellow-400 text-sm mt-1">
              Across {metrics?.content.reduce((sum, item) => sum + item.total_content, 0) || 0} pieces
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Content Performance</h3>
            <div className="space-y-4">
              {metrics?.content.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium capitalize">{item.content_type.replace('_', ' ')}</p>
                    <p className="text-slate-400 text-sm">{item.total_content} pieces</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{item.total_views.toLocaleString()} views</p>
                    <p className="text-slate-400 text-sm">{item.avg_engagement.toFixed(1)}% engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Voice Interactions (24h)</h3>
            <div className="space-y-4">
              {metrics?.voice.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium capitalize">{item.voice_mode.replace('_', ' ')}</p>
                    <p className="text-slate-400 text-sm">{item.interactions} interactions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{Math.round(item.avg_duration)}s</p>
                    <p className="text-slate-400 text-sm">avg duration</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Database</span>
                <span className="text-green-400 font-medium">Healthy</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Voice Engine</span>
                <span className="text-green-400 font-medium">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Analytics</span>
                <span className="text-green-400 font-medium">Running</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Social Media</span>
                <span className="text-yellow-400 font-medium">Monitoring</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                View User Reports
              </button>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
                Manage Titled Players
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                Export Analytics
              </button>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
                Security Alerts
              </button>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">New user signup</span>
                <span className="text-slate-400">2m ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Content published</span>
                <span className="text-slate-400">5m ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Premium upgrade</span>
                <span className="text-slate-400">12m ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Voice interaction</span>
                <span className="text-slate-400">18m ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

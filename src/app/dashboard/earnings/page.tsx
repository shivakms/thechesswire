'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  BarChart3,
  Users,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  CreditCard,
  Receipt,
  PiggyBank,
  Target
} from 'lucide-react';

interface Earning {
  id: string;
  type: string;
  amount: number;
  date: string;
  status: 'pending' | 'paid' | 'failed';
  source: string;
  description: string;
}

interface Payout {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  reference: string;
}

export default function EarningsDashboard() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    pendingPayout: 0,
    totalPayouts: 0
  });

  useEffect(() => {
    loadEarningsData();
  }, []);

  const loadEarningsData = async () => {
    // Mock data - in real implementation, fetch from API
    setEarnings([
      {
        id: '1',
        type: 'royalty',
        amount: 125.50,
        date: '2024-01-15',
        status: 'paid',
        source: 'Content Creation',
        description: 'Royalty from viral chess video'
      },
      {
        id: '2',
        type: 'affiliate',
        amount: 45.20,
        date: '2024-01-14',
        status: 'pending',
        source: 'Affiliate Program',
        description: 'Commission from chess course sales'
      },
      {
        id: '3',
        type: 'coaching',
        amount: 200.00,
        date: '2024-01-13',
        status: 'paid',
        source: 'Private Coaching',
        description: '1-hour coaching session'
      }
    ]);

    setPayouts([
      {
        id: '1',
        amount: 350.70,
        date: '2024-01-01',
        status: 'completed',
        method: 'Bank Transfer',
        reference: 'PAY-2024-001'
      },
      {
        id: '2',
        amount: 125.50,
        date: '2024-01-15',
        status: 'pending',
        method: 'PayPal',
        reference: 'PAY-2024-002'
      }
    ]);

    setStats({
      totalEarnings: 1250.50,
      thisMonth: 370.70,
      pendingPayout: 125.50,
      totalPayouts: 476.20
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <DollarSign className="w-8 h-8 text-yellow-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">Earnings Dashboard</h1>
          </div>
          <p className="text-gray-300">Track your revenue, royalties, and payout history</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-white">${stats.totalEarnings}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">This Month</p>
                <p className="text-2xl font-bold text-white">${stats.thisMonth}</p>
                <p className="text-green-400 text-sm">+12.5% vs last month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Pending Payout</p>
                <p className="text-2xl font-bold text-white">${stats.pendingPayout}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Payouts</p>
                <p className="text-2xl font-bold text-white">${stats.totalPayouts}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Earnings */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-xl font-bold text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Recent Earnings
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {earnings.map((earning) => (
                  <div key={earning.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                          <DollarSign className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{earning.source}</h3>
                          <p className="text-gray-400 text-sm">{earning.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">${earning.amount}</p>
                        <p className="text-gray-400 text-sm">{earning.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm capitalize">{earning.type}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        earning.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                        earning.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {earning.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payout History */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-xl font-bold text-white flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payout History
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {payouts.map((payout) => (
                  <div key={payout.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                          <CreditCard className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{payout.method}</h3>
                          <p className="text-gray-400 text-sm">{payout.reference}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">${payout.amount}</p>
                        <p className="text-gray-400 text-sm">{payout.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Reference</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        payout.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        payout.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {payout.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Analytics */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 mt-8">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-bold text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Revenue Analytics
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Revenue Sources</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Content Creation</span>
                    <span className="text-white font-medium">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Coaching</span>
                    <span className="text-white font-medium">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Affiliate</span>
                    <span className="text-white font-medium">20%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Monthly Growth</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">This Month</span>
                    <span className="text-green-400 font-medium">+12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Last Month</span>
                    <span className="text-green-400 font-medium">+8.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">3-Month Avg</span>
                    <span className="text-green-400 font-medium">+10.3%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm">
                    Request Payout
                  </button>
                  <button className="w-full px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm">
                    Download Tax Report
                  </button>
                  <button className="w-full px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm">
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
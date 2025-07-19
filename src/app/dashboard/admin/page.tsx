'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Settings, 
  BarChart3,
  Database,
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Crown,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Power,
  Globe,
  Lock,
  Unlock,
  Monitor,
  HardDrive,
  Network,
  Cpu,
  HardDriveIcon
} from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  systemUptime: number;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  activeConnections: number;
  securityScore: number;
}

interface AdminAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  requiresConfirmation?: boolean;
}

import ProtectedRoute from '@/components/ProtectedRoute';

function AdminDashboard() {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    systemUptime: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    storageUsage: 0,
    activeConnections: 0,
    securityScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    // Mock data - in real implementation, fetch from API
    setSystemStats({
      totalUsers: 15420,
      activeUsers: 8920,
      premiumUsers: 3450,
      totalRevenue: 125000.50,
      systemUptime: 99.98,
      cpuUsage: 45,
      memoryUsage: 67,
      storageUsage: 78,
      activeConnections: 2340,
      securityScore: 98
    });
    setLoading(false);
  };

  const adminActions: AdminAction[] = [
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage all users, roles, and permissions',
      icon: <Users className="w-6 h-6" />,
      href: '/dashboard/admin/users',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'system-monitoring',
      title: 'System Monitoring',
      description: 'Real-time system performance and health',
      icon: <Monitor className="w-6 h-6" />,
      href: '/dashboard/admin/monitoring',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'database-management',
      title: 'Database Management',
      description: 'Database administration and maintenance',
      icon: <Database className="w-6 h-6" />,
      href: '/dashboard/admin/database',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'security-audit',
      title: 'Security Audit',
      description: 'Security monitoring and threat detection',
      icon: <Shield className="w-6 h-6" />,
      href: '/dashboard/admin/security',
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      id: 'content-moderation',
      title: 'Content Moderation',
      description: 'Moderate user-generated content',
      icon: <Eye className="w-6 h-6" />,
      href: '/dashboard/admin/moderation',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'revenue-analytics',
      title: 'Revenue Analytics',
      description: 'Financial reports and revenue tracking',
      icon: <BarChart3 className="w-6 h-6" />,
      href: '/dashboard/admin/revenue',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      id: 'api-management',
      title: 'API Management',
      description: 'API endpoints and rate limiting',
      icon: <Globe className="w-6 h-6" />,
      href: '/dashboard/admin/api',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      id: 'deployment-control',
      title: 'Deployment Control',
      description: 'Deploy updates and manage environments',
      icon: <Server className="w-6 h-6" />,
      href: '/dashboard/admin/deployment',
      color: 'bg-pink-500 hover:bg-pink-600',
      requiresConfirmation: true
    },
    {
      id: 'backup-restore',
      title: 'Backup & Restore',
      description: 'System backup and recovery',
      icon: <HardDrive className="w-6 h-6" />,
      href: '/dashboard/admin/backup',
      color: 'bg-teal-500 hover:bg-teal-600'
    },
    {
      id: 'system-logs',
      title: 'System Logs',
      description: 'View and analyze system logs',
      icon: <Activity className="w-6 h-6" />,
      href: '/dashboard/admin/logs',
      color: 'bg-gray-500 hover:bg-gray-600'
    },
    {
      id: 'performance-monitoring',
      title: 'Performance Monitoring',
      description: 'Monitor system performance metrics',
      icon: <Cpu className="w-6 h-6" />,
      href: '/dashboard/admin/performance',
      color: 'bg-cyan-500 hover:bg-cyan-600'
    },
    {
      id: 'crisis-management',
      title: 'Crisis Management',
      description: 'Emergency response and incident management',
      icon: <AlertTriangle className="w-6 h-6" />,
      href: '/dashboard/admin/crisis',
      color: 'bg-red-600 hover:bg-red-700',
      requiresConfirmation: true
    }
  ];

  const quickActions = [
    {
      id: 'refresh-system',
      title: 'Refresh System',
      icon: <RefreshCw className="w-4 h-4" />,
      action: () => loadAdminData()
    },
    {
      id: 'export-data',
      title: 'Export Data',
      icon: <Download className="w-4 h-4" />,
      action: () => console.log('Export data')
    },
    {
      id: 'system-restart',
      title: 'System Restart',
      icon: <Power className="w-4 h-4" />,
      action: () => console.log('System restart'),
      requiresConfirmation: true
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-lg">Loading Super Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="super-admin">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Crown className="w-8 h-8 text-yellow-400 mr-3" />
                <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                  Super Admin
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  Full Access
                </span>
              </div>
            </div>
            <p className="text-gray-300">Complete system control and monitoring with no performance restrictions</p>
          </div>

          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{systemStats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-white">{systemStats.activeUsers.toLocaleString()}</p>
                </div>
                <Activity className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Premium Users</p>
                  <p className="text-2xl font-bold text-white">{systemStats.premiumUsers.toLocaleString()}</p>
                </div>
                <Crown className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">${systemStats.totalRevenue.toLocaleString()}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">System Uptime</p>
                  <p className="text-2xl font-bold text-white">{systemStats.systemUptime}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>

          {/* System Performance */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">CPU Usage</h3>
                <Cpu className="w-5 h-5 text-blue-400" />
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Current</span>
                  <span className="text-white font-medium">{systemStats.cpuUsage}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemStats.cpuUsage}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Memory Usage</h3>
                <HardDriveIcon className="w-5 h-5 text-green-400" />
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Current</span>
                  <span className="text-white font-medium">{systemStats.memoryUsage}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemStats.memoryUsage}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Storage Usage</h3>
                <HardDriveIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Current</span>
                  <span className="text-white font-medium">{systemStats.storageUsage}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemStats.storageUsage}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Active Connections</h3>
                <Network className="w-5 h-5 text-orange-400" />
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Current</span>
                  <span className="text-white font-medium">{systemStats.activeConnections}</span>
                </div>
              </div>
              <div className="text-green-400 text-sm">Stable</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center space-x-2 transition-colors"
                >
                  {action.icon}
                  <span>{action.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Admin Actions Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">System Administration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminActions.map((action) => (
                <div
                  key={action.id}
                  className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:bg-white/20"
                >
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mr-4`}>
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{action.title}</h3>
                      <p className="text-gray-300 text-sm">{action.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">
                      {action.requiresConfirmation ? 'Requires Confirmation' : 'Direct Access'}
                    </span>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm">
                        Access
                      </button>
                      {action.requiresConfirmation && (
                        <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm">
                          <AlertTriangle className="w-3 h-3" />
                        </button>
                      )}
                    </div>
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
                  <h3 className="text-white font-semibold">System Security Status</h3>
                  <p className="text-gray-300 text-sm">All security systems operational</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">{systemStats.securityScore}%</p>
                <p className="text-gray-300 text-sm">Security Score</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole="super-admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
} 
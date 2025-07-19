'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Users, 
  Target, 
  Award, 
  BarChart3, 
  Settings, 
  Shield, 
  Zap,
  BookOpen,
  Trophy,
  Calendar,
  DollarSign,
  TrendingUp,
  UserCheck,
  FileText,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Company {
  id: string;
  name: string;
  industry: string;
  employeeCount: number;
  subscription: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'pending' | 'suspended';
  joinedDate: string;
  adminUsers: number;
  totalUsers: number;
  activeUsers: number;
  modules: string[];
  customBranding: boolean;
  whiteLabel: boolean;
  hrIntegration: boolean;
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'leadership' | 'team-building' | 'strategy' | 'problem-solving';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  participants: number;
  completionRate: number;
  isActive: boolean;
}

interface Tournament {
  id: string;
  name: string;
  company: string;
  startDate: string;
  endDate: string;
  participants: number;
  status: 'upcoming' | 'active' | 'completed';
  type: 'individual' | 'team' | 'department';
  prize: string;
}

export default function CorporateTrainingPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'companies' | 'modules' | 'tournaments' | 'reports'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data
  useEffect(() => {
    const sampleCompanies: Company[] = [
      {
        id: '1',
        name: 'TechCorp Solutions',
        industry: 'Technology',
        employeeCount: 250,
        subscription: 'enterprise',
        status: 'active',
        joinedDate: '2024-01-15',
        adminUsers: 5,
        totalUsers: 180,
        activeUsers: 145,
        modules: ['leadership', 'team-building', 'strategy'],
        customBranding: true,
        whiteLabel: true,
        hrIntegration: true,
      },
      {
        id: '2',
        name: 'Global Finance Ltd',
        industry: 'Finance',
        employeeCount: 500,
        subscription: 'premium',
        status: 'active',
        joinedDate: '2024-01-10',
        adminUsers: 3,
        totalUsers: 320,
        activeUsers: 280,
        modules: ['leadership', 'strategy'],
        customBranding: true,
        whiteLabel: false,
        hrIntegration: false,
      },
      {
        id: '3',
        name: 'Innovate Manufacturing',
        industry: 'Manufacturing',
        employeeCount: 120,
        subscription: 'basic',
        status: 'pending',
        joinedDate: '2024-01-20',
        adminUsers: 2,
        totalUsers: 80,
        activeUsers: 0,
        modules: ['team-building'],
        customBranding: false,
        whiteLabel: false,
        hrIntegration: false,
      }
    ];

    const sampleModules: TrainingModule[] = [
      {
        id: '1',
        title: 'Leadership Through Chess',
        description: 'Develop leadership skills by understanding strategic thinking and decision-making in chess.',
        category: 'leadership',
        duration: '4 weeks',
        difficulty: 'intermediate',
        participants: 45,
        completionRate: 78,
        isActive: true,
      },
      {
        id: '2',
        title: 'Team Building Strategies',
        description: 'Build stronger teams through collaborative chess exercises and group challenges.',
        category: 'team-building',
        duration: '2 weeks',
        difficulty: 'beginner',
        participants: 120,
        completionRate: 92,
        isActive: true,
      },
      {
        id: '3',
        title: 'Strategic Thinking Workshop',
        description: 'Learn strategic planning and execution through advanced chess concepts.',
        category: 'strategy',
        duration: '6 weeks',
        difficulty: 'advanced',
        participants: 28,
        completionRate: 65,
        isActive: true,
      },
      {
        id: '4',
        title: 'Problem Solving Mastery',
        description: 'Enhance problem-solving skills through chess puzzles and tactical exercises.',
        category: 'problem-solving',
        duration: '3 weeks',
        difficulty: 'intermediate',
        participants: 67,
        completionRate: 85,
        isActive: false,
      }
    ];

    const sampleTournaments: Tournament[] = [
      {
        id: '1',
        name: 'TechCorp Championship 2024',
        company: 'TechCorp Solutions',
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        participants: 45,
        status: 'active',
        type: 'individual',
        prize: '$5,000',
      },
      {
        id: '2',
        name: 'Finance Team Challenge',
        company: 'Global Finance Ltd',
        startDate: '2024-02-15',
        endDate: '2024-03-15',
        participants: 32,
        status: 'upcoming',
        type: 'team',
        prize: '$3,000',
      },
      {
        id: '3',
        name: 'Manufacturing Cup',
        company: 'Innovate Manufacturing',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        participants: 18,
        status: 'upcoming',
        type: 'department',
        prize: '$2,000',
      }
    ];

    setCompanies(sampleCompanies);
    setModules(sampleModules);
    setTournaments(sampleTournaments);
  }, []);

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'enterprise': return 'bg-purple-500';
      case 'premium': return 'bg-blue-500';
      case 'basic': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'leadership': return 'bg-blue-500';
      case 'team-building': return 'bg-green-500';
      case 'strategy': return 'bg-purple-500';
      case 'problem-solving': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const stats = {
    totalCompanies: companies.length,
    activeCompanies: companies.filter(c => c.status === 'active').length,
    totalUsers: companies.reduce((sum, c) => sum + c.totalUsers, 0),
    activeUsers: companies.reduce((sum, c) => sum + c.activeUsers, 0),
    totalRevenue: companies.reduce((sum, c) => {
      const rates = { basic: 1000, premium: 2500, enterprise: 5000 };
      return sum + rates[c.subscription];
    }, 0),
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <Building className="w-12 h-12 text-blue-400 mr-4" />
              <h1 className="text-5xl font-bold text-white">Corporate Chess Training</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transform your organization through strategic chess training. 
              Build leadership, teamwork, and problem-solving skills with our B2B platform.
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <Building className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalCompanies}</div>
              <div className="text-gray-300">Total Companies</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <div className="text-gray-300">Total Users</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.activeUsers}</div>
              <div className="text-gray-300">Active Users</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</div>
              <div className="text-gray-300">Monthly Revenue</div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'overview', name: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
                { id: 'companies', name: 'Companies', icon: <Building className="w-4 h-4" /> },
                { id: 'modules', name: 'Training Modules', icon: <BookOpen className="w-4 h-4" /> },
                { id: 'tournaments', name: 'Tournaments', icon: <Trophy className="w-4 h-4" /> },
                { id: 'reports', name: 'Reports', icon: <FileText className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {selectedTab === 'overview' && (
              <div className="space-y-8">
                {/* Recent Activity */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    {companies.slice(0, 3).map((company) => (
                      <div key={company.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-white">{company.name}</h3>
                          <p className="text-gray-400">{company.industry} • {company.employeeCount} employees</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(company.status)}`}></div>
                          <span className="text-sm text-gray-400 capitalize">{company.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
                    <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Add Company</h3>
                    <p className="text-gray-400 mb-4">Onboard a new corporate client</p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Get Started
                    </button>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
                    <BookOpen className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Create Module</h3>
                    <p className="text-gray-400 mb-4">Design custom training content</p>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Create
                    </button>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
                    <Trophy className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Launch Tournament</h3>
                    <p className="text-gray-400 mb-4">Organize company competitions</p>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Launch
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'companies' && (
              <div className="space-y-6">
                {companies.map((company, index) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{company.name}</h3>
                        <p className="text-gray-400">{company.industry} • {company.employeeCount} employees</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded text-sm ${getSubscriptionColor(company.subscription)} text-white`}>
                          {company.subscription}
                        </div>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(company.status)}`}></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-400">Admin Users</div>
                        <div className="text-lg font-semibold text-white">{company.adminUsers}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Total Users</div>
                        <div className="text-lg font-semibold text-white">{company.totalUsers}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Active Users</div>
                        <div className="text-lg font-semibold text-white">{company.activeUsers}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Joined</div>
                        <div className="text-lg font-semibold text-white">
                          {new Date(company.joinedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      {company.modules.map((module) => (
                        <span key={module} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          {module}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {selectedTab === 'modules' && (
              <div className="space-y-6">
                {modules.map((module, index) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{module.title}</h3>
                        <p className="text-gray-400">{module.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded text-sm ${getCategoryColor(module.category)} text-white`}>
                          {module.category}
                        </div>
                        <div className={`px-3 py-1 rounded text-sm ${module.isActive ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                          {module.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-400">Duration</div>
                        <div className="text-lg font-semibold text-white">{module.duration}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Difficulty</div>
                        <div className="text-lg font-semibold text-white capitalize">{module.difficulty}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Participants</div>
                        <div className="text-lg font-semibold text-white">{module.participants}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Completion Rate</div>
                        <div className="text-lg font-semibold text-white">{module.completionRate}%</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                        Edit Module
                      </button>
                      <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <Users className="w-4 h-4" />
                        Assign to Companies
                      </button>
                      <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <BarChart3 className="w-4 h-4" />
                        View Analytics
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {selectedTab === 'tournaments' && (
              <div className="space-y-6">
                {tournaments.map((tournament, index) => (
                  <motion.div
                    key={tournament.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{tournament.name}</h3>
                        <p className="text-gray-400">{tournament.company}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded text-sm ${
                          tournament.status === 'active' ? 'bg-green-500' : 
                          tournament.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-500'
                        } text-white`}>
                          {tournament.status}
                        </div>
                        <div className="px-3 py-1 rounded text-sm bg-purple-500 text-white">
                          {tournament.type}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-400">Start Date</div>
                        <div className="text-lg font-semibold text-white">
                          {new Date(tournament.startDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">End Date</div>
                        <div className="text-lg font-semibold text-white">
                          {new Date(tournament.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Participants</div>
                        <div className="text-lg font-semibold text-white">{tournament.participants}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Prize</div>
                        <div className="text-lg font-semibold text-white">{tournament.prize}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <Users className="w-4 h-4" />
                        Manage Participants
                      </button>
                      <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <Trophy className="w-4 h-4" />
                        View Results
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {selectedTab === 'reports' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Revenue Report</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Basic Subscriptions</span>
                        <span className="text-white">$1,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Premium Subscriptions</span>
                        <span className="text-white">$5,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Enterprise Subscriptions</span>
                        <span className="text-white">$5,000</span>
                      </div>
                      <hr className="border-gray-600" />
                      <div className="flex justify-between font-semibold">
                        <span className="text-white">Total Revenue</span>
                        <span className="text-white">${stats.totalRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">User Engagement</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Users</span>
                        <span className="text-white">{stats.totalUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Active Users</span>
                        <span className="text-white">{stats.activeUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Engagement Rate</span>
                        <span className="text-white">{Math.round((stats.activeUsers / stats.totalUsers) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Export Options</h3>
                  <div className="flex gap-4">
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                    <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <FileText className="w-4 h-4" />
                      Generate PDF
                    </button>
                    <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <BarChart3 className="w-4 h-4" />
                      Analytics Dashboard
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
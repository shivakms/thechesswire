'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Crown, 
  Database, 
  Cloud, 
  Users, 
  Trophy, 
  BookOpen, 
  Zap, 
  Target, 
  Star,
  Clock,
  Award,
  Search
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

interface PremiumFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'beta' | 'coming-soon';
  category: string;
}

export default function EchoSagePlusPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const premiumFeatures: PremiumFeature[] = [
    // GM-level preparation tools
    {
      id: 'gm-preparation',
      title: 'GM-Level Preparation Tools',
      description: 'Advanced preparation tools used by Grandmasters, including deep opening analysis, endgame studies, and psychological preparation techniques.',
      icon: <Crown className="w-6 h-6" />,
      status: 'active',
      category: 'preparation'
    },
    {
      id: 'neural-sparring',
      title: 'Neural Network Sparring Partners',
      description: 'AI sparring partners that adapt to your playing style, providing realistic training scenarios and personalized challenges.',
      icon: <Brain className="w-6 h-6" />,
      status: 'active',
      category: 'ai-training'
    },
    {
      id: 'position-encyclopedia',
      title: 'Position Encyclopedia Access',
      description: 'Access to a comprehensive database of chess positions with expert analysis, historical context, and strategic insights.',
      icon: <BookOpen className="w-6 h-6" />,
      status: 'active',
      category: 'knowledge'
    },
    {
      id: 'custom-engine',
      title: 'Custom Engine Integration',
      description: 'Integrate your own chess engines or customize existing ones for personalized analysis and training.',
      icon: <Zap className="w-6 h-6" />,
      status: 'beta',
      category: 'analysis'
    },
    {
      id: 'cloud-analysis',
      title: 'Cloud Analysis Allocation',
      description: 'Unlimited cloud-based analysis with high-performance engines, reducing local resource usage.',
      icon: <Cloud className="w-6 h-6" />,
      status: 'active',
      category: 'analysis'
    },
    {
      id: 'game-database',
      title: 'Database of 10M+ Games',
      description: 'Access to over 10 million chess games with advanced search, filtering, and analysis capabilities.',
      icon: <Database className="w-6 h-6" />,
      status: 'active',
      category: 'knowledge'
    },
    {
      id: 'correspondence-tools',
      title: 'Correspondence Chess Tools',
      description: 'Specialized tools for correspondence chess including move validation, time management, and analysis sharing.',
      icon: <Clock className="w-6 h-6" />,
      status: 'active',
      category: 'correspondence'
    },
    {
      id: 'team-training',
      title: 'Team Training Features',
      description: 'Collaborative training tools for teams, clubs, and coaching groups with shared analysis and progress tracking.',
      icon: <Users className="w-6 h-6" />,
      status: 'beta',
      category: 'collaboration'
    },
    {
      id: 'coach-collaboration',
      title: 'Coach Collaboration Platform',
      description: 'Platform for coaches and students to collaborate on analysis, training plans, and progress tracking.',
      icon: <Award className="w-6 h-6" />,
      status: 'coming-soon',
      category: 'collaboration'
    },
    {
      id: 'tournament-simulation',
      title: 'Tournament Simulation Mode',
      description: 'Realistic tournament simulation with pressure scenarios, time controls, and psychological challenges.',
      icon: <Trophy className="w-6 h-6" />,
      status: 'active',
      category: 'preparation'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Features', icon: <Star className="w-4 h-4" /> },
    { id: 'preparation', name: 'Preparation', icon: <Target className="w-4 h-4" /> },
    { id: 'ai-training', name: 'AI Training', icon: <Brain className="w-4 h-4" /> },
    { id: 'knowledge', name: 'Knowledge', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'analysis', name: 'Analysis', icon: <Zap className="w-4 h-4" /> },
    { id: 'correspondence', name: 'Correspondence', icon: <Clock className="w-4 h-4" /> },
    { id: 'collaboration', name: 'Collaboration', icon: <Users className="w-4 h-4" /> }
  ];

  const filteredFeatures = premiumFeatures.filter(feature => {
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory;
    const matchesSearch = feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'beta': return 'bg-yellow-500';
      case 'coming-soon': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'beta': return 'Beta';
      case 'coming-soon': return 'Coming Soon';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-lg">Loading EchoSage Premium+...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="any">
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <Crown className="w-12 h-12 text-yellow-400 mr-4" />
              <h1 className="text-5xl font-bold text-white">EchoSage Premium+</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ultimate training features for serious chess players. Access GM-level tools, 
              neural network sparring partners, and advanced analysis capabilities.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <Database className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">10M+</div>
              <div className="text-gray-300">Games Database</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">AI</div>
              <div className="text-gray-300">Sparring Partners</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <Cloud className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">∞</div>
              <div className="text-gray-300">Cloud Analysis</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">GM</div>
              <div className="text-gray-300">Level Tools</div>
            </div>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search premium features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {category.icon}
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredFeatures.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(feature.status)}`}></div>
                        <span className="text-sm text-gray-400">{getStatusText(feature.status)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-all duration-300 font-medium">
                  {feature.status === 'active' ? 'Access Feature' : 
                   feature.status === 'beta' ? 'Join Beta' : 'Get Notified'}
                </button>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {filteredFeatures.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No features found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 
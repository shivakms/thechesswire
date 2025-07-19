'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Moon, 
  Brain, 
  Eye, 
  Heart, 
  Zap, 
  Star, 
  Play, 
  Pause, 
  Volume2, 
  Settings,
  Target,
  Clock,
  Award,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

interface DreamMode {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  intensity: 'light' | 'medium' | 'intense';
  category: string;
  isActive: boolean;
}

export default function DreamsModePage() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [volume, setVolume] = useState(0.7);

  const dreamModes: DreamMode[] = [
    {
      id: 'subconscious-patterns',
      title: 'Subconscious Pattern Training',
      description: 'Train your subconscious mind to recognize chess patterns through guided meditation and visualization exercises.',
      icon: <Brain className="w-6 h-6" />,
      duration: '20 min',
      intensity: 'medium',
      category: 'meditation',
      isActive: true
    },
    {
      id: 'sleep-learning',
      title: 'Sleep Learning Integration',
      description: 'Learn chess concepts while you sleep using advanced audio techniques and subliminal messaging.',
      icon: <Moon className="w-6 h-6" />,
      duration: '8 hours',
      intensity: 'light',
      category: 'sleep',
      isActive: true
    },
    {
      id: 'meditation-chess',
      title: 'Meditation Chess Modes',
      description: 'Combine chess training with mindfulness meditation for enhanced focus and mental clarity.',
      icon: <Heart className="w-6 h-6" />,
      duration: '30 min',
      intensity: 'light',
      category: 'meditation',
      isActive: true
    },
    {
      id: 'visualization-exercises',
      title: 'Visualization Exercises',
      description: 'Strengthen your mental imagery through advanced visualization techniques for chess positions.',
      icon: <Eye className="w-6 h-6" />,
      duration: '15 min',
      intensity: 'medium',
      category: 'visualization',
      isActive: true
    },
    {
      id: 'mental-rehearsal',
      title: 'Mental Rehearsal Tools',
      description: 'Practice chess scenarios mentally before playing them in real games.',
      icon: <Target className="w-6 h-6" />,
      duration: '25 min',
      intensity: 'intense',
      category: 'rehearsal',
      isActive: true
    },
    {
      id: 'dream-game-analysis',
      title: 'Dream Game Analysis',
      description: 'Analyze your chess dreams and extract insights from your subconscious mind.',
      icon: <Sparkles className="w-6 h-6" />,
      duration: '10 min',
      intensity: 'light',
      category: 'analysis',
      isActive: false
    },
    {
      id: 'hypnotic-suggestion',
      title: 'Hypnotic Suggestion Training',
      description: 'Use hypnotic techniques to reinforce positive chess behaviors and eliminate bad habits.',
      icon: <Zap className="w-6 h-6" />,
      duration: '45 min',
      intensity: 'medium',
      category: 'hypnosis',
      isActive: false
    },
    {
      id: 'flow-state-induction',
      title: 'Flow State Induction',
      description: 'Learn to enter and maintain flow states during chess games for peak performance.',
      icon: <TrendingUp className="w-6 h-6" />,
      duration: '20 min',
      intensity: 'intense',
      category: 'flow',
      isActive: true
    }
  ];

  const categories = [
    { id: 'all', name: 'All Modes', icon: <Star className="w-4 h-4" /> },
    { id: 'meditation', name: 'Meditation', icon: <Heart className="w-4 h-4" /> },
    { id: 'sleep', name: 'Sleep Learning', icon: <Moon className="w-4 h-4" /> },
    { id: 'visualization', name: 'Visualization', icon: <Eye className="w-4 h-4" /> },
    { id: 'rehearsal', name: 'Mental Rehearsal', icon: <Target className="w-4 h-4" /> },
    { id: 'analysis', name: 'Dream Analysis', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'hypnosis', name: 'Hypnosis', icon: <Zap className="w-4 h-4" /> },
    { id: 'flow', name: 'Flow State', icon: <TrendingUp className="w-4 h-4" /> }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredModes = dreamModes.filter(mode => {
    return selectedCategory === 'all' || mode.category === selectedCategory;
  });

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'light': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'intense': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getIntensityText = (intensity: string) => {
    switch (intensity) {
      case 'light': return 'Light';
      case 'medium': return 'Medium';
      case 'intense': return 'Intense';
      default: return 'Unknown';
    }
  };

  const startMode = (modeId: string) => {
    setSelectedMode(modeId);
    setIsPlaying(true);
    const mode = dreamModes.find(m => m.id === modeId);
    if (mode) {
      // Parse duration (e.g., "20 min" -> 20 minutes in seconds)
      const durationMatch = mode.duration.match(/(\d+)/);
      const minutes = durationMatch ? parseInt(durationMatch[1]) : 20;
      setTotalTime(minutes * 60);
      setCurrentTime(0);
    }
  };

  const stopMode = () => {
    setIsPlaying(false);
    setSelectedMode(null);
    setCurrentTime(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < totalTime) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalTime) {
            setIsPlaying(false);
            return totalTime;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, totalTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;

  return (
    <ProtectedRoute requiredRole="any">
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <Moon className="w-12 h-12 text-blue-400 mr-4" />
              <h1 className="text-5xl font-bold text-white">EchoSage Dreams Mode</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Innovative training approaches that tap into your subconscious mind. 
              Learn chess through meditation, sleep learning, and advanced visualization techniques.
            </p>
          </motion.div>

          {/* Active Session */}
          {selectedMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {dreamModes.find(m => m.id === selectedMode)?.title}
                  </h3>
                  <p className="text-gray-300">
                    {formatTime(currentTime)} / {formatTime(totalTime)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
                  </button>
                  <button
                    onClick={stopMode}
                    className="p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <Settings className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </motion.div>
          )}

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
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
          </motion.div>

          {/* Dream Modes Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredModes.map((mode, index) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`bg-white/10 backdrop-blur-md rounded-lg p-6 border transition-all duration-300 hover:transform hover:scale-105 ${
                  mode.isActive 
                    ? 'border-white/20 hover:border-purple-500/50' 
                    : 'border-gray-600/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      {mode.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{mode.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${getIntensityColor(mode.intensity)}`}></div>
                        <span className="text-sm text-gray-400">{getIntensityText(mode.intensity)}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-400">{mode.duration}</span>
                      </div>
                    </div>
                  </div>
                  {!mode.isActive && (
                    <div className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                      Coming Soon
                    </div>
                  )}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {mode.description}
                </p>
                <button 
                  onClick={() => mode.isActive && startMode(mode.id)}
                  disabled={!mode.isActive}
                  className={`w-full py-2 px-4 rounded-lg transition-all duration-300 font-medium ${
                    mode.isActive
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {mode.isActive ? 'Start Session' : 'Coming Soon'}
                </button>
              </motion.div>
            ))}
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 bg-white/5 backdrop-blur-md rounded-lg p-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Benefits of Dreams Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Enhanced Learning</h3>
                <p className="text-gray-300">Learn chess concepts more effectively through subconscious training.</p>
              </div>
              <div className="text-center">
                <Eye className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Improved Visualization</h3>
                <p className="text-gray-300">Strengthen your ability to visualize chess positions and moves.</p>
              </div>
              <div className="text-center">
                <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Mental Clarity</h3>
                <p className="text-gray-300">Achieve better focus and mental clarity through meditation techniques.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
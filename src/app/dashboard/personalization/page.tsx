'use client';

import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Brain, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Settings,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  BookOpen,
  Users,
  Star,
  Trophy,
  Lightbulb
} from 'lucide-react';

interface LearningProfile {
  learningStyle: string;
  dominantStyle: string;
  strengths: string[];
  weaknesses: string[];
  preferences: {
    sessionLength: number;
    difficulty: string;
    timeOfDay: string;
    focusAreas: string[];
  };
}

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  deadline: string;
  status: 'active' | 'completed' | 'overdue';
  category: string;
}

interface ProgressMetric {
  name: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export default function PersonalizationDashboard() {
  const [learningProfile, setLearningProfile] = useState<LearningProfile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetric[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  useEffect(() => {
    loadPersonalizationData();
  }, []);

  const loadPersonalizationData = async () => {
    // Mock data - in real implementation, fetch from API
    setLearningProfile({
      learningStyle: 'visual_kinesthetic',
      dominantStyle: 'Visual',
      strengths: ['Pattern Recognition', 'Spatial Awareness', 'Tactical Vision'],
      weaknesses: ['Time Management', 'Endgame Theory', 'Opening Memorization'],
      preferences: {
        sessionLength: 45,
        difficulty: 'adaptive',
        timeOfDay: 'evening',
        focusAreas: ['Tactics', 'Endgames', 'Openings']
      }
    });

    setGoals([
      {
        id: '1',
        title: 'Reach 1500 Rating',
        description: 'Improve overall chess rating to 1500',
        target: 1500,
        current: 1456,
        deadline: '2024-03-15',
        status: 'active',
        category: 'rating'
      },
      {
        id: '2',
        title: 'Complete 100 Tactics',
        description: 'Solve 100 tactical puzzles',
        target: 100,
        current: 67,
        deadline: '2024-02-28',
        status: 'active',
        category: 'tactics'
      },
      {
        id: '3',
        title: 'Study 5 Endgames',
        description: 'Master 5 key endgame positions',
        target: 5,
        current: 3,
        deadline: '2024-02-15',
        status: 'active',
        category: 'endgame'
      }
    ]);

    setProgressMetrics([
      {
        name: 'Rating',
        current: 1456,
        target: 1500,
        unit: 'points',
        trend: 'up',
        change: 8.5
      },
      {
        name: 'Tactical Accuracy',
        current: 78,
        target: 85,
        unit: '%',
        trend: 'up',
        change: 5.2
      },
      {
        name: 'Time Management',
        current: 65,
        target: 80,
        unit: '%',
        trend: 'stable',
        change: 0
      },
      {
        name: 'Opening Knowledge',
        current: 72,
        target: 90,
        unit: '%',
        trend: 'up',
        change: 3.1
      }
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/20 text-blue-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'overdue': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-400 transform rotate-180" />;
      case 'stable': return <BarChart3 className="w-4 h-4 text-gray-400" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-400" />;
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Target className="w-8 h-8 text-purple-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">Personalization Engine</h1>
          </div>
          <p className="text-gray-300">AI-powered learning insights, adaptive training, and personalized goal tracking</p>
        </div>

        {/* Learning Profile */}
        {learningProfile && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 mb-8">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Your Learning Profile
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-white font-medium mb-3">Learning Style</h3>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{learningProfile.dominantStyle}</p>
                        <p className="text-gray-400 text-sm">{learningProfile.learningStyle.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-gray-400 text-sm">Session Length</p>
                        <p className="text-white font-medium">{learningProfile.preferences.sessionLength} minutes</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Difficulty</p>
                        <p className="text-white font-medium capitalize">{learningProfile.preferences.difficulty}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Optimal Time</p>
                        <p className="text-white font-medium capitalize">{learningProfile.preferences.timeOfDay}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-3">Strengths</h3>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="space-y-2">
                      {learningProfile.strengths.map((strength, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                          <span className="text-white text-sm">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-3">Focus Areas</h3>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="space-y-2">
                      {learningProfile.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-center">
                          <AlertTriangle className="w-4 h-4 text-orange-400 mr-2" />
                          <span className="text-white text-sm">{weakness}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {progressMetrics.map((metric) => (
            <div key={metric.name} className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">{metric.name}</h3>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="mb-3">
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-white">{metric.current}</span>
                  <span className="text-gray-400 ml-1">/ {metric.target} {metric.unit}</span>
                </div>
                <div className="text-sm text-gray-400">
                  {metric.change > 0 ? '+' : ''}{metric.change}% this month
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage(metric.current, metric.target)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Goals */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Award className="w-6 h-6 mr-2" />
              Your Goals
            </h2>
            <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Add Goal
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{goal.title}</h3>
                        <p className="text-gray-400 text-sm">{goal.category}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(goal.status)}`}>
                      {goal.status}
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm mb-4">{goal.description}</p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{goal.current} / {goal.target}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(goal.current, goal.target)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(goal.deadline).toLocaleDateString()}
                    </div>
                    <button 
                      onClick={() => setSelectedGoal(goal)}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 mb-8">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              AI Training Recommendations
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <BookOpen className="w-6 h-6 text-blue-400 mr-2" />
                  <h3 className="text-white font-medium">Today's Focus</h3>
                </div>
                <p className="text-gray-300 text-sm mb-3">Based on your learning profile and current weaknesses</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    <span className="text-white text-sm">Endgame Practice (30 min)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-white text-sm">Tactical Puzzles (15 min)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Users className="w-6 h-6 text-green-400 mr-2" />
                  <h3 className="text-white font-medium">Study Partners</h3>
                </div>
                <p className="text-gray-300 text-sm mb-3">Players with similar learning styles</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Visual_Learner_123</span>
                    <span className="text-green-400 text-xs">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Tactical_Master</span>
                    <span className="text-gray-400 text-xs">Last seen 2h ago</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
                  <h3 className="text-white font-medium">Achievement Unlocked</h3>
                </div>
                <p className="text-gray-300 text-sm mb-3">Recent accomplishments</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-2" />
                    <span className="text-white text-sm">10-day streak</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-2" />
                    <span className="text-white text-sm">Rating milestone</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Goal Details */}
        {selectedGoal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Goal Details</h3>
                  <button
                    onClick={() => setSelectedGoal(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-white font-medium text-lg mb-2">{selectedGoal.title}</h4>
                  <p className="text-gray-300 mb-4">{selectedGoal.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Category</p>
                      <p className="text-white font-medium capitalize">{selectedGoal.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Deadline</p>
                      <p className="text-white font-medium">{new Date(selectedGoal.deadline).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Current Progress</p>
                      <p className="text-white font-medium">{selectedGoal.current} / {selectedGoal.target}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <p className="text-white font-medium capitalize">{selectedGoal.status}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{getProgressPercentage(selectedGoal.current, selectedGoal.target).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(selectedGoal.current, selectedGoal.target)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg">
                    Update Progress
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                    Edit Goal
                  </button>
                  <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
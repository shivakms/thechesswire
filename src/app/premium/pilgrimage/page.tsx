'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Globe, 
  BookOpen, 
  Trophy, 
  Users, 
  Compass, 
  Flag, 
  Star,
  Calendar,
  Clock,
  Award,
  Heart,
  Camera,
  Share2,
  Navigation
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

interface PilgrimageLocation {
  id: string;
  name: string;
  description: string;
  country: string;
  coordinates: { lat: number; lng: number };
  historicalSignificance: string;
  gamesPlayed: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  isCompleted: boolean;
  isUnlocked: boolean;
  achievements: string[];
  imageUrl: string;
}

interface PilgrimageAchievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  reward: string;
}

export default function ChessPilgrimagePage() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [currentJourney, setCurrentJourney] = useState<string | null>(null);
  const [journeyProgress, setJourneyProgress] = useState(0);
  const [filter, setFilter] = useState<'all' | 'completed' | 'unlocked' | 'locked'>('all');

  const pilgrimageLocations: PilgrimageLocation[] = [
    {
      id: 'saint-louis',
      name: 'Saint Louis Chess Club',
      description: 'The mecca of American chess, home to the Sinquefield Cup and countless legendary games.',
      country: 'United States',
      coordinates: { lat: 38.6270, lng: -90.1994 },
      historicalSignificance: 'Founded in 2008, this club has hosted world-class tournaments and produced numerous champions.',
      gamesPlayed: 1250,
      difficulty: 'medium',
      estimatedTime: '2-3 hours',
      isCompleted: false,
      isUnlocked: true,
      achievements: ['First Steps', 'Saint Louis Master', 'Tournament Veteran'],
      imageUrl: '/images/saint-louis.jpg'
    },
    {
      id: 'moscow-central',
      name: 'Moscow Central Chess Club',
      description: 'The historic heart of Russian chess, where legends like Botvinnik and Kasparov honed their skills.',
      country: 'Russia',
      coordinates: { lat: 55.7558, lng: 37.6176 },
      historicalSignificance: 'Established in 1923, this club has been the training ground for generations of Soviet chess masters.',
      gamesPlayed: 2100,
      difficulty: 'hard',
      estimatedTime: '4-5 hours',
      isCompleted: false,
      isUnlocked: false,
      achievements: ['Russian Spirit', 'Moscow Master', 'Soviet Legacy'],
      imageUrl: '/images/moscow-central.jpg'
    },
    {
      id: 'london-chess',
      name: 'London Chess & Bridge Centre',
      description: 'A historic venue where British chess traditions meet modern innovation.',
      country: 'United Kingdom',
      coordinates: { lat: 51.5074, lng: -0.1278 },
      historicalSignificance: 'Founded in 1956, this center has hosted international tournaments and nurtured British talent.',
      gamesPlayed: 890,
      difficulty: 'easy',
      estimatedTime: '1-2 hours',
      isCompleted: true,
      isUnlocked: true,
      achievements: ['British Gentleman', 'London Explorer', 'Bridge Master'],
      imageUrl: '/images/london-chess.jpg'
    },
    {
      id: 'berlin-chess',
      name: 'Berlin Chess Federation',
      description: 'Where German precision meets creative chess, in the heart of Europe.',
      country: 'Germany',
      coordinates: { lat: 52.5200, lng: 13.4050 },
      historicalSignificance: 'A modern chess hub that continues Berlin\'s rich chess tradition dating back to the 19th century.',
      gamesPlayed: 1560,
      difficulty: 'medium',
      estimatedTime: '3-4 hours',
      isCompleted: false,
      isUnlocked: true,
      achievements: ['German Precision', 'Berlin Wall', 'European Union'],
      imageUrl: '/images/berlin-chess.jpg'
    },
    {
      id: 'shanghai-chess',
      name: 'Shanghai Chess Academy',
      description: 'The rising star of Asian chess, where ancient wisdom meets modern strategy.',
      country: 'China',
      coordinates: { lat: 31.2304, lng: 121.4737 },
      historicalSignificance: 'Founded in 2000, this academy has rapidly become a powerhouse in international chess.',
      gamesPlayed: 980,
      difficulty: 'hard',
      estimatedTime: '5-6 hours',
      isCompleted: false,
      isUnlocked: false,
      achievements: ['Dragon\'s Breath', 'Shanghai Master', 'Asian Tiger'],
      imageUrl: '/images/shanghai-chess.jpg'
    },
    {
      id: 'buenos-aires',
      name: 'Buenos Aires Chess Club',
      description: 'Where the passionate spirit of Argentine chess comes alive.',
      country: 'Argentina',
      coordinates: { lat: -34.6118, lng: -58.3960 },
      historicalSignificance: 'Home to legendary players like Najdorf and has hosted numerous international tournaments.',
      gamesPlayed: 720,
      difficulty: 'medium',
      estimatedTime: '2-3 hours',
      isCompleted: false,
      isUnlocked: true,
      achievements: ['Tango Master', 'Argentine Spirit', 'South American Star'],
      imageUrl: '/images/buenos-aires.jpg'
    }
  ];

  const achievements: PilgrimageAchievement[] = [
    {
      id: 'first-pilgrimage',
      title: 'First Pilgrimage',
      description: 'Complete your first chess pilgrimage location',
      icon: <Flag className="w-6 h-6" />,
      progress: 1,
      maxProgress: 1,
      isCompleted: true,
      reward: 'Pilgrim Badge'
    },
    {
      id: 'world-traveler',
      title: 'World Traveler',
      description: 'Visit chess locations on 3 different continents',
      icon: <Globe className="w-6 h-6" />,
      progress: 2,
      maxProgress: 3,
      isCompleted: false,
      reward: 'Global Explorer Badge'
    },
    {
      id: 'master-collector',
      title: 'Master Collector',
      description: 'Complete 5 different pilgrimage locations',
      icon: <Trophy className="w-6 h-6" />,
      progress: 1,
      maxProgress: 5,
      isCompleted: false,
      reward: 'Master Pilgrim Badge'
    },
    {
      id: 'cultural-exchange',
      title: 'Cultural Exchange',
      description: 'Participate in community expeditions with players from different countries',
      icon: <Users className="w-6 h-6" />,
      progress: 0,
      maxProgress: 10,
      isCompleted: false,
      reward: 'Cultural Ambassador Badge'
    }
  ];

  const filteredLocations = pilgrimageLocations.filter(location => {
    switch (filter) {
      case 'completed':
        return location.isCompleted;
      case 'unlocked':
        return location.isUnlocked && !location.isCompleted;
      case 'locked':
        return !location.isUnlocked;
      default:
        return true;
    }
  });

  const startPilgrimage = (locationId: string) => {
    setCurrentJourney(locationId);
    setJourneyProgress(0);
    // Simulate journey progress
    const interval = setInterval(() => {
      setJourneyProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Mark as completed
          const updatedLocations = pilgrimageLocations.map(loc => 
            loc.id === locationId ? { ...loc, isCompleted: true } : loc
          );
          return 100;
        }
        return prev + 1;
      });
    }, 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Easy';
      case 'medium': return 'Medium';
      case 'hard': return 'Hard';
      default: return 'Unknown';
    }
  };

  return (
    <ProtectedRoute requiredRole="any">
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <Compass className="w-12 h-12 text-emerald-400 mr-4" />
              <h1 className="text-5xl font-bold text-white">Chess Pilgrimage</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Embark on a journey through the world's most historic chess locations. 
              Walk in the footsteps of legends and discover the cultural heritage of chess.
            </p>
          </motion.div>

          {/* Active Journey */}
          {currentJourney && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Journey to {pilgrimageLocations.find(l => l.id === currentJourney)?.name}
                  </h3>
                  <p className="text-gray-300">
                    Progress: {journeyProgress}% Complete
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCurrentJourney(null)}
                    className="p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <Navigation className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${journeyProgress}%` }}
                ></div>
              </div>
            </motion.div>
          )}

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'all', name: 'All Locations', icon: <Globe className="w-4 h-4" /> },
                { id: 'unlocked', name: 'Available', icon: <Flag className="w-4 h-4" /> },
                { id: 'completed', name: 'Completed', icon: <Trophy className="w-4 h-4" /> },
                { id: 'locked', name: 'Locked', icon: <Star className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    filter === tab.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Locations Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          >
            {filteredLocations.map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`bg-white/10 backdrop-blur-md rounded-lg p-6 border transition-all duration-300 hover:transform hover:scale-105 ${
                  location.isCompleted 
                    ? 'border-emerald-500/50' 
                    : location.isUnlocked 
                    ? 'border-white/20 hover:border-emerald-500/50' 
                    : 'border-gray-600/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{location.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${getDifficultyColor(location.difficulty)}`}></div>
                        <span className="text-sm text-gray-400">{getDifficultyText(location.difficulty)}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-400">{location.country}</span>
                      </div>
                    </div>
                  </div>
                  {location.isCompleted && (
                    <div className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                      Completed
                    </div>
                  )}
                  {!location.isUnlocked && (
                    <div className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                      Locked
                    </div>
                  )}
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {location.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{location.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <BookOpen className="w-4 h-4" />
                    <span>{location.gamesPlayed.toLocaleString()} games played</span>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  {location.achievements.slice(0, 2).map((achievement, idx) => (
                    <span key={idx} className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                      {achievement}
                    </span>
                  ))}
                  {location.achievements.length > 2 && (
                    <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded">
                      +{location.achievements.length - 2} more
                    </span>
                  )}
                </div>

                <button 
                  onClick={() => location.isUnlocked && !location.isCompleted && startPilgrimage(location.id)}
                  disabled={!location.isUnlocked || location.isCompleted}
                  className={`w-full py-2 px-4 rounded-lg transition-all duration-300 font-medium ${
                    location.isCompleted
                      ? 'bg-emerald-600 text-white cursor-default'
                      : location.isUnlocked
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {location.isCompleted ? 'Completed' : 
                   location.isUnlocked ? 'Start Pilgrimage' : 'Locked'}
                </button>
              </motion.div>
            ))}
          </motion.div>

          {/* Achievements Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-md rounded-lg p-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Pilgrimage Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      {achievement.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{achievement.title}</h3>
                      <p className="text-sm text-gray-400">{achievement.description}</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          achievement.isCompleted 
                            ? 'bg-emerald-500' 
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-400 font-medium">
                      Reward: {achievement.reward}
                    </span>
                    {achievement.isCompleted && (
                      <Award className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
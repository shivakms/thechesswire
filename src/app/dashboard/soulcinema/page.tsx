'use client';

import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Play, 
  Pause, 
  Download,
  Share2,
  Settings,
  Eye,
  Clock,
  BarChart3,
  Palette,
  Music,
  Camera,
  Zap,
  CheckCircle,
  AlertTriangle,
  Film,
  Sparkles
} from 'lucide-react';

interface VideoProject {
  id: string;
  name: string;
  theme: string;
  status: 'draft' | 'rendering' | 'completed' | 'failed';
  quality: string;
  duration: number;
  fileSize: number;
  outputUrl?: string;
  createdAt: string;
  gameData: {
    whitePlayer: string;
    blackPlayer: string;
    result: string;
    moves: number;
  };
}

interface Theme {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  features: string[];
}

export default function SoulCinemaDashboard() {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<VideoProject | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTheme, setFilterTheme] = useState('all');

  useEffect(() => {
    loadSoulCinemaData();
  }, []);

  const loadSoulCinemaData = async () => {
    // Mock data - in real implementation, fetch from API
    setProjects([
      {
        id: '1',
        name: 'Epic Battle: GM_Carlsen vs You',
        theme: 'epic_battle',
        status: 'completed',
        quality: '4K',
        duration: 180,
        fileSize: 245760000,
        outputUrl: '/api/videos/epic-battle-4k.mp4',
        createdAt: '2024-01-15T10:00:00Z',
        gameData: {
          whitePlayer: 'GM_Carlsen',
          blackPlayer: 'You',
          result: '1-0',
          moves: 45
        }
      },
      {
        id: '2',
        name: 'Zen Garden: Tactical Masterpiece',
        theme: 'zen_garden',
        status: 'rendering',
        quality: '1080p',
        duration: 120,
        fileSize: 0,
        createdAt: '2024-01-15T14:00:00Z',
        gameData: {
          whitePlayer: 'You',
          blackPlayer: 'IM_Player',
          result: '1-0',
          moves: 38
        }
      },
      {
        id: '3',
        name: 'Cyber Warfare: Endgame Brilliance',
        theme: 'cyber_warfare',
        status: 'draft',
        quality: '1080p',
        duration: 0,
        fileSize: 0,
        createdAt: '2024-01-15T16:00:00Z',
        gameData: {
          whitePlayer: 'FM_Player',
          blackPlayer: 'You',
          result: '0-1',
          moves: 52
        }
      }
    ]);
  };

  const themes: Theme[] = [
    {
      id: 'epic_battle',
      name: 'Epic Battle',
      description: 'Dramatic orchestral music with dynamic camera movements',
      color: 'bg-red-500',
      icon: <Film className="w-5 h-5" />,
      features: ['Orchestral Music', 'Dynamic Camera', 'Particle Effects', 'Dramatic Lighting']
    },
    {
      id: 'zen_garden',
      name: 'Zen Garden',
      description: 'Peaceful ambient music with smooth transitions',
      color: 'bg-green-500',
      icon: <Palette className="w-5 h-5" />,
      features: ['Ambient Music', 'Smooth Camera', 'Nature Elements', 'Soft Lighting']
    },
    {
      id: 'cyber_warfare',
      name: 'Cyber Warfare',
      description: 'Electronic cyberpunk music with futuristic effects',
      color: 'bg-blue-500',
      icon: <Zap className="w-5 h-5" />,
      features: ['Electronic Music', 'Futuristic Camera', 'Digital Effects', 'Neon Lighting']
    },
    {
      id: 'classical_concert',
      name: 'Classical Concert',
      description: 'Sophisticated classical music with elegant animations',
      color: 'bg-purple-500',
      icon: <Music className="w-5 h-5" />,
      features: ['Classical Music', 'Elegant Camera', 'Refined Effects', 'Golden Lighting']
    },
    {
      id: 'street_chess',
      name: 'Street Chess',
      description: 'Urban hip-hop music with gritty street style',
      color: 'bg-orange-500',
      icon: <Camera className="w-5 h-5" />,
      features: ['Hip-Hop Music', 'Raw Camera', 'Street Effects', 'Urban Lighting']
    }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesTheme = filterTheme === 'all' || project.theme === filterTheme;
    return matchesStatus && matchesTheme;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'rendering': return 'bg-blue-500/20 text-blue-400';
      case 'draft': return 'bg-gray-500/20 text-gray-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getThemeColor = (theme: string) => {
    const themeObj = themes.find(t => t.id === theme);
    return themeObj?.color || 'bg-gray-500';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Video className="w-8 h-8 text-red-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">SoulCinema Dashboard</h1>
          </div>
          <p className="text-gray-300">Transform your chess games into cinematic masterpieces with AI-powered video generation</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Projects</p>
                <p className="text-2xl font-bold text-white">{projects.length}</p>
              </div>
              <Video className="w-8 h-8 text-red-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Completed</p>
                <p className="text-2xl font-bold text-white">{projects.filter(p => p.status === 'completed').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Rendering</p>
                <p className="text-2xl font-bold text-white">{projects.filter(p => p.status === 'rendering').length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Duration</p>
                <p className="text-2xl font-bold text-white">{formatDuration(projects.reduce((acc, p) => acc + p.duration, 0))}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="rendering">Rendering</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={filterTheme}
                onChange={(e) => setFilterTheme(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Themes</option>
                <option value="epic_battle">Epic Battle</option>
                <option value="zen_garden">Zen Garden</option>
                <option value="cyber_warfare">Cyber Warfare</option>
                <option value="classical_concert">Classical Concert</option>
                <option value="street_chess">Street Chess</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Create New Video
              </button>
              <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Video Themes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Available Themes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {themes.map((theme) => (
              <div key={theme.id} className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                <div className={`w-12 h-12 ${theme.color} rounded-lg flex items-center justify-center mb-3`}>
                  <div className="text-white">{theme.icon}</div>
                </div>
                <h3 className="text-white font-semibold text-lg mb-1">{theme.name}</h3>
                <p className="text-gray-300 text-sm mb-3">{theme.description}</p>
                <div className="space-y-1">
                  {theme.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-400">
                      <div className="w-1 h-1 bg-red-400 rounded-full mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${getThemeColor(project.theme)} rounded-lg flex items-center justify-center`}>
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{project.name}</h3>
                      <p className="text-gray-400 text-sm">{new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className="text-blue-400 text-sm font-medium">{project.quality}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">White Player</p>
                      <p className="text-white font-medium">{project.gameData.whitePlayer}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Black Player</p>
                      <p className="text-white font-medium">{project.gameData.blackPlayer}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Result</p>
                      <p className="text-white font-medium">{project.gameData.result}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Moves</p>
                      <p className="text-white font-medium">{project.gameData.moves}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center text-gray-300">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDuration(project.duration)}
                  </div>
                  <div className="text-gray-300">
                    {formatFileSize(project.fileSize)}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {project.status === 'completed' ? (
                    <>
                      <button className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm flex items-center justify-center">
                        <Play className="w-4 h-4 mr-1" />
                        Watch
                      </button>
                      <button className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                        <Download className="w-4 h-4" />
                      </button>
                    </>
                  ) : project.status === 'rendering' ? (
                    <button className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Rendering...
                    </button>
                  ) : (
                    <button className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm flex items-center justify-center">
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedProject(project)}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Project Details */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Project Details</h3>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-white font-medium text-lg mb-2">{selectedProject.name}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Theme</p>
                      <p className="text-white font-medium capitalize">{selectedProject.theme.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Quality</p>
                      <p className="text-white font-medium">{selectedProject.quality}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Duration</p>
                      <p className="text-white font-medium">{formatDuration(selectedProject.duration)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">File Size</p>
                      <p className="text-white font-medium">{formatFileSize(selectedProject.fileSize)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4 mb-6">
                  <h4 className="text-white font-medium mb-3">Game Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">White Player</p>
                      <p className="text-white font-medium">{selectedProject.gameData.whitePlayer}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Black Player</p>
                      <p className="text-white font-medium">{selectedProject.gameData.blackPlayer}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Result</p>
                      <p className="text-white font-medium">{selectedProject.gameData.result}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Moves</p>
                      <p className="text-white font-medium">{selectedProject.gameData.moves}</p>
                    </div>
                  </div>
                </div>

                {selectedProject.status === 'completed' && selectedProject.outputUrl && (
                  <div className="bg-gray-700 rounded-lg p-4 mb-6">
                    <h4 className="text-white font-medium mb-3">Video Preview</h4>
                    <div className="w-full h-48 bg-gray-600 rounded-lg flex items-center justify-center">
                      <Play className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  {selectedProject.status === 'completed' ? (
                    <>
                      <button className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg">
                        Watch Video
                      </button>
                      <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                        Download
                      </button>
                    </>
                  ) : (
                    <button className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">
                      Start Rendering
                    </button>
                  )}
                  <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
                    Edit Project
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
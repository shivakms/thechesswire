'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  TrendingUp, 
  Target, 
  Calendar,
  Filter,
  Download,
  Share2,
  Eye,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

interface GameArchive {
  id: string;
  whitePlayer: string;
  blackPlayer: string;
  result: string;
  date: string;
  moves: number;
  rating: number;
  tags: string[];
  analysis: {
    accuracy: number;
    blunders: number;
    mistakes: number;
  };
}

interface Pattern {
  id: string;
  type: string;
  name: string;
  frequency: number;
  successRate: number;
  lastOccurrence: string;
}

interface Weakness {
  id: string;
  type: string;
  description: string;
  severity: number;
  frequency: number;
  suggestions: string[];
}

export default function MemoryArchiveDashboard() {
  const [games, setGames] = useState<GameArchive[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameArchive | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadMemoryArchiveData();
  }, []);

  const loadMemoryArchiveData = async () => {
    // Mock data - in real implementation, fetch from API
    setGames([
      {
        id: '1',
        whitePlayer: 'You',
        blackPlayer: 'GM_Carlsen',
        result: '1-0',
        date: '2024-01-15',
        moves: 45,
        rating: 1456,
        tags: ['Ruy Lopez', 'Victory', 'Tactical'],
        analysis: { accuracy: 92, blunders: 0, mistakes: 1 }
      },
      {
        id: '2',
        whitePlayer: 'IM_Player',
        blackPlayer: 'You',
        result: '0-1',
        date: '2024-01-14',
        moves: 38,
        rating: 1420,
        tags: ['Sicilian Defense', 'Defeat', 'Endgame'],
        analysis: { accuracy: 78, blunders: 2, mistakes: 3 }
      }
    ]);

    setPatterns([
      {
        id: '1',
        type: 'opening',
        name: 'Ruy Lopez Exchange',
        frequency: 12,
        successRate: 0.75,
        lastOccurrence: '2024-01-15'
      },
      {
        id: '2',
        type: 'tactic',
        name: 'Knight Fork',
        frequency: 8,
        successRate: 0.88,
        lastOccurrence: '2024-01-12'
      }
    ]);

    setWeaknesses([
      {
        id: '1',
        type: 'endgame',
        description: 'Rook and pawn endgames',
        severity: 0.8,
        frequency: 5,
        suggestions: ['Study Lucena position', 'Practice king activity', 'Learn opposition']
      },
      {
        id: '2',
        type: 'time_management',
        description: 'Time pressure in complex positions',
        severity: 0.6,
        frequency: 3,
        suggestions: ['Practice rapid games', 'Use time management techniques', 'Improve calculation speed']
      }
    ]);
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.whitePlayer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.blackPlayer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'wins') return matchesSearch && game.result === '1-0';
    if (filterType === 'losses') return matchesSearch && game.result === '0-1';
    if (filterType === 'draws') return matchesSearch && game.result === '1/2-1/2';
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FileText className="w-8 h-8 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">Memory & Archive Dashboard</h1>
          </div>
          <p className="text-gray-300">Your personal chess memory palace with pattern recognition and improvement tracking</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Games</p>
                <p className="text-2xl font-bold text-white">{games.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Patterns Found</p>
                <p className="text-2xl font-bold text-white">{patterns.length}</p>
              </div>
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Weaknesses</p>
                <p className="text-2xl font-bold text-white">{weaknesses.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Win Rate</p>
                <p className="text-2xl font-bold text-white">68%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search games, players, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Games</option>
                <option value="wins">Wins</option>
                <option value="losses">Losses</option>
                <option value="draws">Draws</option>
              </select>
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Archive */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Game Archive
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {filteredGames.map((game) => (
                    <div
                      key={game.id}
                      onClick={() => setSelectedGame(game)}
                      className="bg-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            game.result === '1-0' ? 'bg-green-500/20 text-green-400' :
                            game.result === '0-1' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {game.result}
                          </span>
                          <span className="text-white font-medium">{game.whitePlayer} vs {game.blackPlayer}</span>
                        </div>
                        <div className="text-gray-400 text-sm">{game.date}</div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-300">
                        <div className="flex items-center space-x-4">
                          <span>{game.moves} moves</span>
                          <span>Rating: {game.rating}</span>
                          <span>Accuracy: {game.analysis.accuracy}%</span>
                        </div>
                        <div className="flex space-x-1">
                          {game.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Patterns and Weaknesses */}
          <div className="space-y-6">
            {/* Patterns */}
            <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
              <div className="p-6 border-b border-white/20">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Pattern Recognition
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {patterns.map((pattern) => (
                    <div key={pattern.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{pattern.name}</h4>
                        <span className="text-green-400 text-sm">{(pattern.successRate * 100).toFixed(0)}%</span>
                      </div>
                      <div className="text-gray-300 text-sm">
                        <div className="flex justify-between">
                          <span>Frequency: {pattern.frequency}</span>
                          <span>{pattern.lastOccurrence}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
              <div className="p-6 border-b border-white/20">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Weakness Analysis
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {weaknesses.map((weakness) => (
                    <div key={weakness.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{weakness.type}</h4>
                        <span className="text-orange-400 text-sm">{(weakness.severity * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{weakness.description}</p>
                      <div className="text-xs text-gray-400">
                        <div className="flex justify-between mb-1">
                          <span>Frequency: {weakness.frequency}</span>
                        </div>
                        <div className="space-y-1">
                          {weakness.suggestions.slice(0, 2).map((suggestion, index) => (
                            <div key={index} className="flex items-center">
                              <div className="w-1 h-1 bg-blue-400 rounded-full mr-2"></div>
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Game Details */}
        {selectedGame && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Game Details</h3>
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm">White Player</p>
                    <p className="text-white font-medium">{selectedGame.whitePlayer}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Black Player</p>
                    <p className="text-white font-medium">{selectedGame.blackPlayer}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Result</p>
                    <p className="text-white font-medium">{selectedGame.result}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Date</p>
                    <p className="text-white font-medium">{selectedGame.date}</p>
                  </div>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4 mb-6">
                  <h4 className="text-white font-medium mb-3">Analysis</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Accuracy</p>
                      <p className="text-white font-medium">{selectedGame.analysis.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Blunders</p>
                      <p className="text-white font-medium">{selectedGame.analysis.blunders}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Mistakes</p>
                      <p className="text-white font-medium">{selectedGame.analysis.mistakes}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    View Game
                  </button>
                  <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download PGN
                  </button>
                  <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
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
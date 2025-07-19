'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, FileText, Users, Video } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'article' | 'game' | 'player' | 'video' | 'analysis';
  title: string;
  description: string;
  url: string;
  relevance: number;
  timestamp?: string;
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    type: 'article',
    title: 'Magnus Carlsen\'s Brilliant Endgame Technique',
    description: 'Analysis of the World Champion\'s masterful endgame play in the 2024 Candidates Tournament',
    url: '/articles/magnus-carlsen-endgame-technique',
    relevance: 0.95,
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    type: 'game',
    title: 'Carlsen vs. Nakamura - 2024 Candidates',
    description: 'Full game analysis with AI-powered insights and voice narration',
    url: '/games/carlsen-nakamura-2024-candidates',
    relevance: 0.92,
    timestamp: '1 day ago'
  },
  {
    id: '3',
    type: 'player',
    title: 'Hikaru Nakamura',
    description: 'American Grandmaster and streaming sensation - complete profile and game database',
    url: '/players/hikaru-nakamura',
    relevance: 0.88
  },
  {
    id: '4',
    type: 'video',
    title: 'SoulCinema: The Immortal Game',
    description: 'AI-generated cinematic recreation of the famous Anderssen vs. Kieseritzky game',
    url: '/videos/immortal-game-soulcinema',
    relevance: 0.85,
    timestamp: '3 days ago'
  },
  {
    id: '5',
    type: 'analysis',
    title: 'Sicilian Defense: Najdorf Variation',
    description: 'Deep opening analysis with tactical insights and strategic concepts',
    url: '/analysis/sicilian-najdorf',
    relevance: 0.82
  }
];

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({ className = '', placeholder = 'Search chess articles, games, players...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setIsOpen(true);

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Filter mock results based on query
        const filteredResults = mockSearchResults.filter(result =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase())
        );

        setResults(filteredResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    
    // Add to search history
    if (searchQuery.trim() && !searchHistory.includes(searchQuery.trim())) {
      setSearchHistory(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'game':
        return <Users className="w-4 h-4" />;
      case 'player':
        return <Users className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'analysis':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getResultColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'article':
        return 'text-blue-400';
      case 'game':
        return 'text-green-400';
      case 'player':
        return 'text-purple-400';
      case 'video':
        return 'text-red-400';
      case 'analysis':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {query && (
          <motion.button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-2">Searching...</p>
              </div>
            ) : query.trim().length < 2 ? (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Recent Searches</h3>
                {searchHistory.length > 0 ? (
                  <div className="space-y-2">
                    {searchHistory.map((item, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleSearch(item)}
                        className="w-full flex items-center space-x-3 p-2 text-left text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{item}</span>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No recent searches</p>
                )}
              </div>
            ) : results.length > 0 ? (
              <div className="p-2">
                {results.map((result, index) => (
                  <motion.a
                    key={result.id}
                    href={result.url}
                    className="block p-3 hover:bg-gray-800 rounded-lg transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 ${getResultColor(result.type)}`}>
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">{result.title}</h4>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{result.description}</p>
                        {result.timestamp && (
                          <p className="text-gray-500 text-xs mt-1">{result.timestamp}</p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(result.relevance * 100)}%
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-400">
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-1">Try different keywords or check spelling</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ExternalLink, TrendingUp, Clock, Users, Star } from 'lucide-react';

interface SpotlightArticle {
  id: string;
  title: string;
  content: string;
  source: string;
  sourceUrl?: string;
  publishedAt: string;
  isRising: boolean;
  trendScore?: number;
  premiumOnly?: boolean;
}

interface SpotlightSource {
  name: string;
  description: string;
  url: string;
  icon: string;
  color: string;
}

const SPOTLIGHT_SOURCES: Record<string, SpotlightSource> = {
  icc: {
    name: 'Internet Chess Club',
    description: 'The world\'s premier online chess server',
    url: 'https://www.chessclub.com',
    icon: '♟️',
    color: 'bg-blue-600'
  },
  chesscom: {
    name: 'Chess.com',
    description: 'The world\'s #1 chess platform',
    url: 'https://www.chess.com',
    icon: '♔',
    color: 'bg-green-600'
  },
  lichess: {
    name: 'Lichess',
    description: 'Free, open-source chess server',
    url: 'https://lichess.org',
    icon: '♛',
    color: 'bg-purple-600'
  },
  reddit: {
    name: 'Reddit r/chess',
    description: 'The chess community on Reddit',
    url: 'https://reddit.com/r/chess',
    icon: '📱',
    color: 'bg-orange-600'
  },
  chessable: {
    name: 'Chessable',
    description: 'MoveTrainer chess learning platform',
    url: 'https://chessable.com',
    icon: '📚',
    color: 'bg-indigo-600'
  },
  fide: {
    name: 'FIDE',
    description: 'World Chess Federation',
    url: 'https://fide.com',
    icon: '🏆',
    color: 'bg-yellow-600'
  },
  chessbase: {
    name: 'ChessBase',
    description: 'Chess database and analysis software',
    url: 'https://chessbase.com',
    icon: '💻',
    color: 'bg-gray-600'
  },
  tcec: {
    name: 'TCEC',
    description: 'Top Chess Engine Championship',
    url: 'https://tcec-chess.com',
    icon: '🤖',
    color: 'bg-red-600'
  },
  chess24: {
    name: 'Chess24',
    description: 'Chess news, videos, and analysis',
    url: 'https://chess24.com',
    icon: '📺',
    color: 'bg-pink-600'
  },
  decodechess: {
    name: 'DecodeChess',
    description: 'AI-powered chess analysis',
    url: 'https://decodechess.com',
    icon: '🧠',
    color: 'bg-teal-600'
  },
  openingtree: {
    name: 'OpeningTree',
    description: 'Opening database and statistics',
    url: 'https://openingtree.com',
    icon: '🌳',
    color: 'bg-emerald-600'
  },
  aimchess: {
    name: 'Aimchess',
    description: 'AI chess improvement platform',
    url: 'https://aimchess.com',
    icon: '🎯',
    color: 'bg-cyan-600'
  },
  forwardchess: {
    name: 'ForwardChess',
    description: 'Interactive chess books',
    url: 'https://forwardchess.com',
    icon: '📖',
    color: 'bg-amber-600'
  }
};

export default function SpotlightPage() {
  const params = useParams();
  const source = params.source as string;
  const [articles, setArticles] = useState<SpotlightArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sourceInfo = SPOTLIGHT_SOURCES[source];

  useEffect(() => {
    if (!sourceInfo) {
      setError('Invalid source');
      setLoading(false);
      return;
    }

    fetchSpotlightArticles();
  }, [source]);

  const fetchSpotlightArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/spotlight/${source}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch spotlight articles');
      }

      const data = await response.json();
      setArticles(data.articles || []);
    } catch (err) {
      console.error('Failed to fetch spotlight articles:', err);
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  if (!sourceInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Source Not Found</h1>
          <p className="text-gray-300">The requested spotlight source does not exist.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">Loading spotlight articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Error</h1>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-16 h-16 ${sourceInfo.color} rounded-lg flex items-center justify-center text-2xl`}>
              {sourceInfo.icon}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">{sourceInfo.name}</h1>
              <p className="text-gray-300">{sourceInfo.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <a
              href={sourceInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Visit {sourceInfo.name}</span>
            </a>
            
            <div className="flex items-center space-x-2 text-gray-400">
              <Users className="w-4 h-4" />
              <span>{articles.length} articles</span>
            </div>
          </div>
        </div>

        {/* AI Disclaimer */}
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black text-sm font-bold">
              AI
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400 mb-1">AI-Generated Content</h3>
              <p className="text-yellow-200 text-sm">
                This article is AI-generated and references public content from {sourceInfo.name}. 
                TheChessWire is not affiliated with {sourceInfo.name}.
              </p>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 hover:border-white/40 transition-all duration-200"
            >
              {/* Article Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {article.isRising && (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  )}
                  {article.premiumOnly && (
                    <Star className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Article Title */}
              <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">
                {article.title}
              </h3>

              {/* Article Content */}
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                {article.content}
              </p>

              {/* Article Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Source:</span>
                  <span className="text-xs text-blue-400">{article.source}</span>
                </div>
                
                {article.trendScore && (
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400">{article.trendScore}</span>
                  </div>
                )}
              </div>

              {/* Premium Badge */}
              {article.premiumOnly && (
                <div className="mt-4 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-center">
                  <span className="text-xs text-yellow-400 font-medium">
                    Premium Content
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {articles.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">{sourceInfo.icon}</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Articles Found</h3>
            <p className="text-gray-300">
              No spotlight articles are currently available for {sourceInfo.name}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 
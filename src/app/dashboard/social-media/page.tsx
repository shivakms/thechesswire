'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Settings,
  Play,
  Pause,
  Edit,
  Share2,
  Eye,
  Heart,
  Repeat,
  MessageCircle,
  Zap,
  Target,
  Clock,
  Filter
} from 'lucide-react';

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  mediaUrl?: string;
  scheduledTime: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views: number;
  };
  viralScore: number;
}

interface PlatformStats {
  platform: string;
  followers: number;
  posts: number;
  engagement: number;
  growth: number;
}

export default function SocialMediaDashboard() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadSocialMediaData();
  }, []);

  const loadSocialMediaData = async () => {
    // Mock data - in real implementation, fetch from API
    setPosts([
      {
        id: '1',
        platform: 'Twitter',
        content: 'Just won an epic game against a GM! The Ruy Lopez opening led to a beautiful tactical finish. 🏆♟️ #Chess #Victory',
        scheduledTime: '2024-01-15T10:00:00Z',
        status: 'published',
        engagement: { likes: 2340, shares: 456, comments: 123, views: 12500 },
        viralScore: 85
      },
      {
        id: '2',
        platform: 'Instagram',
        content: 'Check out this stunning endgame position! White to move and win. Can you find the winning combination? 🤔♟️',
        mediaUrl: '/api/media/chess-position.jpg',
        scheduledTime: '2024-01-15T14:00:00Z',
        status: 'scheduled',
        engagement: { likes: 0, shares: 0, comments: 0, views: 0 },
        viralScore: 72
      },
      {
        id: '3',
        platform: 'TikTok',
        content: 'The most satisfying checkmate you\'ll see today! 👑♟️ #Chess #Checkmate #Satisfying',
        mediaUrl: '/api/media/checkmate-video.mp4',
        scheduledTime: '2024-01-15T16:00:00Z',
        status: 'draft',
        engagement: { likes: 0, shares: 0, comments: 0, views: 0 },
        viralScore: 91
      }
    ]);

    setPlatformStats([
      {
        platform: 'Twitter',
        followers: 15420,
        posts: 156,
        engagement: 8.5,
        growth: 12.3
      },
      {
        platform: 'Instagram',
        followers: 8920,
        posts: 89,
        engagement: 6.2,
        growth: 8.7
      },
      {
        platform: 'TikTok',
        followers: 23450,
        posts: 67,
        engagement: 15.8,
        growth: 23.1
      },
      {
        platform: 'YouTube',
        followers: 5670,
        posts: 23,
        engagement: 4.2,
        growth: 5.9
      }
    ]);
  };

  const filteredPosts = posts.filter(post => {
    const matchesPlatform = filterPlatform === 'all' || post.platform === filterPlatform;
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    return matchesPlatform && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-400';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400';
      case 'draft': return 'bg-gray-500/20 text-gray-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getViralScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <MessageSquare className="w-8 h-8 text-pink-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">Social Media Automation</h1>
          </div>
          <p className="text-gray-300">Auto-post game highlights, track engagement, and create viral content across all platforms</p>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {platformStats.map((platform) => (
            <div key={platform.platform} className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">{platform.platform}</h3>
                <div className="text-green-400 text-sm">+{platform.growth}%</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Followers</span>
                  <span className="text-white font-medium">{platform.followers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Posts</span>
                  <span className="text-white font-medium">{platform.posts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Engagement</span>
                  <span className="text-white font-medium">{platform.engagement}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4">
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">All Platforms</option>
                <option value="Twitter">Twitter</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center">
                <Play className="w-4 h-4 mr-2" />
                Auto-Post ON
              </button>
              <button className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Create Post
              </button>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{post.platform}</h3>
                      <p className="text-gray-400 text-sm">{new Date(post.scheduledTime).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                    <span className={`text-sm font-medium ${getViralScoreColor(post.viralScore)}`}>
                      {post.viralScore}% viral
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-300 text-sm line-clamp-3">{post.content}</p>
                  {post.mediaUrl && (
                    <div className="mt-3 w-full h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                      <Eye className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {post.status === 'published' && (
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center text-pink-400 mb-1">
                        <Heart className="w-4 h-4" />
                      </div>
                      <p className="text-white text-sm font-medium">{post.engagement.likes}</p>
                      <p className="text-gray-400 text-xs">Likes</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-blue-400 mb-1">
                        <Repeat className="w-4 h-4" />
                      </div>
                      <p className="text-white text-sm font-medium">{post.engagement.shares}</p>
                      <p className="text-gray-400 text-xs">Shares</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-green-400 mb-1">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <p className="text-white text-sm font-medium">{post.engagement.comments}</p>
                      <p className="text-gray-400 text-xs">Comments</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-purple-400 mb-1">
                        <Eye className="w-4 h-4" />
                      </div>
                      <p className="text-white text-sm font-medium">{post.engagement.views.toLocaleString()}</p>
                      <p className="text-gray-400 text-xs">Views</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button 
                    onClick={() => setSelectedPost(post)}
                    className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                  <button className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Viral Content Prediction */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 mb-8">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-bold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Viral Content Prediction
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Best Posting Time</h3>
                <p className="text-gray-300 text-sm">Based on your audience analysis</p>
                <div className="mt-3 text-center">
                  <p className="text-2xl font-bold text-green-400">7:30 PM</p>
                  <p className="text-gray-400 text-sm">EST</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Optimal Content Type</h3>
                <p className="text-gray-300 text-sm">Highest engagement potential</p>
                <div className="mt-3 text-center">
                  <p className="text-2xl font-bold text-blue-400">Tactical</p>
                  <p className="text-gray-400 text-sm">Puzzles</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Viral Probability</h3>
                <p className="text-gray-300 text-sm">Next post prediction</p>
                <div className="mt-3 text-center">
                  <p className="text-2xl font-bold text-pink-400">87%</p>
                  <p className="text-gray-400 text-sm">High Potential</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Post Details */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Post Details</h3>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{selectedPost.platform}</h4>
                      <p className="text-gray-400 text-sm">{new Date(selectedPost.scheduledTime).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4">{selectedPost.content}</p>
                  {selectedPost.mediaUrl && (
                    <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                      <Eye className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <p className="text-white font-medium capitalize">{selectedPost.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Viral Score</p>
                    <p className={`font-medium ${getViralScoreColor(selectedPost.viralScore)}`}>
                      {selectedPost.viralScore}%
                    </p>
                  </div>
                </div>

                {selectedPost.status === 'published' && (
                  <div className="bg-gray-700 rounded-lg p-4 mb-6">
                    <h4 className="text-white font-medium mb-3">Engagement Analytics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Likes</p>
                        <p className="text-white font-medium">{selectedPost.engagement.likes.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Shares</p>
                        <p className="text-white font-medium">{selectedPost.engagement.shares.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Comments</p>
                        <p className="text-white font-medium">{selectedPost.engagement.comments.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Views</p>
                        <p className="text-white font-medium">{selectedPost.engagement.views.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                    Edit Post
                  </button>
                  <button className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg">
                    Reschedule
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
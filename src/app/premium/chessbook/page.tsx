'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  Bookmark, 
  Plus, 
  Search,
  Filter,
  Calendar,
  Clock,
  Award,
  Star,
  Edit,
  Camera,
  Mic,
  Video,
  FileText,
  Globe,
  Lock
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

interface ChessBookPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    isVerified: boolean;
  };
  title: string;
  content: string;
  type: 'game-analysis' | 'story' | 'lesson' | 'challenge' | 'diary';
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  readTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  gameData?: {
    pgn: string;
    result: string;
    opponent: string;
    date: string;
  };
  images?: string[];
  isPublic: boolean;
}

interface ChessBookGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  tags: string[];
  lastActivity: string;
  isMember: boolean;
}

export default function ChessBookPage() {
  const [posts, setPosts] = useState<ChessBookPost[]>([]);
  const [groups, setGroups] = useState<ChessBookGroup[]>([]);
  const [selectedTab, setSelectedTab] = useState<'feed' | 'groups' | 'diary' | 'challenges'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Sample data
  useEffect(() => {
    const samplePosts: ChessBookPost[] = [
      {
        id: '1',
        author: {
          id: 'user1',
          name: 'GM Alexandra Kosteniuk',
          avatar: '/avatars/alexandra.jpg',
          rating: 2500,
          isVerified: true
        },
        title: 'My Journey to the World Championship',
        content: 'Today I want to share the incredible journey that led me to become World Champion. It wasn\'t always easy, but chess taught me resilience, strategy, and the importance of never giving up...',
        type: 'story',
        tags: ['world-champion', 'inspiration', 'women-in-chess'],
        likes: 1247,
        comments: 89,
        shares: 156,
        isLiked: false,
        isBookmarked: true,
        createdAt: '2024-01-15T10:30:00Z',
        readTime: '5 min read',
        difficulty: 'intermediate',
        isPublic: true
      },
      {
        id: '2',
        author: {
          id: 'user2',
          name: 'IM Carlos Rodriguez',
          avatar: '/avatars/carlos.jpg',
          rating: 2350,
          isVerified: true
        },
        title: 'The Sicilian Defense: A Complete Guide',
        content: 'The Sicilian Defense is one of the most dynamic and complex openings in chess. In this comprehensive guide, I\'ll walk you through the key variations, strategic ideas, and common pitfalls...',
        type: 'lesson',
        tags: ['sicilian-defense', 'opening-theory', 'strategy'],
        likes: 892,
        comments: 67,
        shares: 234,
        isLiked: true,
        isBookmarked: false,
        createdAt: '2024-01-14T15:45:00Z',
        readTime: '12 min read',
        difficulty: 'advanced',
        isPublic: true
      },
      {
        id: '3',
        author: {
          id: 'user3',
          name: 'Sarah Chen',
          avatar: '/avatars/sarah.jpg',
          rating: 1800,
          isVerified: false
        },
        title: 'My First Tournament Victory!',
        content: 'After months of preparation and countless hours of study, I finally won my first tournament! The feeling of accomplishment is indescribable. Here\'s the game that sealed the victory...',
        type: 'game-analysis',
        tags: ['first-victory', 'tournament', 'beginner-success'],
        likes: 445,
        comments: 23,
        shares: 12,
        isLiked: false,
        isBookmarked: false,
        createdAt: '2024-01-13T20:15:00Z',
        readTime: '3 min read',
        difficulty: 'beginner',
        gameData: {
          pgn: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d3 d6 6.O-O O-O 7.Nbd2 a6 8.Bb3 Ba7 9.Nc4 h6 10.Ne3 Be6 11.Bc2 Qd7 12.Nd5 Nxd5 13.exd5 Ne7 14.Bg5 hxg5 15.Qh5 g6 16.Qh6 f6 17.Rae1 Qf7 18.f4 exf4 19.Rxf4 g4 20.Rxf6 Qxf6 21.Qxf6 gxf6 22.Nf5 1-0',
          result: '1-0',
          opponent: 'John Smith',
          date: '2024-01-12'
        },
        isPublic: true
      }
    ];

    const sampleGroups: ChessBookGroup[] = [
      {
        id: 'group1',
        name: 'Sicilian Defense Masters',
        description: 'A group dedicated to studying and mastering the Sicilian Defense. Share your games, analysis, and insights.',
        memberCount: 1247,
        isPrivate: false,
        tags: ['sicilian-defense', 'opening-theory', 'advanced'],
        lastActivity: '2 hours ago',
        isMember: true
      },
      {
        id: 'group2',
        name: 'Women in Chess',
        description: 'Supporting and celebrating women in chess. Share experiences, challenges, and achievements.',
        memberCount: 892,
        isPrivate: false,
        tags: ['women-in-chess', 'community', 'support'],
        lastActivity: '1 day ago',
        isMember: false
      },
      {
        id: 'group3',
        name: 'Endgame Study Group',
        description: 'Deep dive into endgame theory and practice. Weekly challenges and analysis.',
        memberCount: 567,
        isPrivate: true,
        tags: ['endgames', 'theory', 'study'],
        lastActivity: '3 hours ago',
        isMember: true
      }
    ];

    setPosts(samplePosts);
    setGroups(sampleGroups);
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || post.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'game-analysis': return <FileText className="w-4 h-4" />;
      case 'story': return <BookOpen className="w-4 h-4" />;
      case 'lesson': return <Award className="w-4 h-4" />;
      case 'challenge': return <Star className="w-4 h-4" />;
      case 'diary': return <Edit className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'game-analysis': return 'bg-blue-500';
      case 'story': return 'bg-purple-500';
      case 'lesson': return 'bg-green-500';
      case 'challenge': return 'bg-orange-500';
      case 'diary': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <ProtectedRoute requiredRole="any">
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="w-12 h-12 text-blue-400 mr-4" />
              <h1 className="text-5xl font-bold text-white">ChessBook</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your personal chess diary and social learning platform. Share your journey, 
              learn from others, and build a community of chess enthusiasts.
            </p>
          </motion.div>

          {/* Search and Create */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search posts, groups, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300 font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Post
            </button>
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
                { id: 'feed', name: 'Feed', icon: <BookOpen className="w-4 h-4" /> },
                { id: 'groups', name: 'Groups', icon: <Users className="w-4 h-4" /> },
                { id: 'diary', name: 'My Diary', icon: <Edit className="w-4 h-4" /> },
                { id: 'challenges', name: 'Challenges', icon: <Star className="w-4 h-4" /> }
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

          {/* Filter Tabs for Feed */}
          {selectedTab === 'feed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { id: 'all', name: 'All Posts' },
                  { id: 'game-analysis', name: 'Game Analysis' },
                  { id: 'story', name: 'Stories' },
                  { id: 'lesson', name: 'Lessons' },
                  { id: 'challenge', name: 'Challenges' },
                  { id: 'diary', name: 'Diary' }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      selectedFilter === filter.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {getTypeIcon(filter.id)}
                    {filter.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {selectedTab === 'feed' && filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {post.author.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{post.author.name}</h3>
                          {post.author.isVerified && (
                            <Award className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>{post.author.rating} rating</span>
                          <span>•</span>
                          <span>{formatDate(post.createdAt)}</span>
                          <span>•</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded text-xs ${getTypeColor(post.type)} text-white`}>
                        {post.type.replace('-', ' ')}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${getDifficultyColor(post.difficulty)} text-white`}>
                        {post.difficulty}
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <h2 className="text-xl font-semibold text-white mb-3">{post.title}</h2>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Game Data (if available) */}
                  {post.gameData && (
                    <div className="bg-white/5 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-300">
                        <span>vs {post.gameData.opponent}</span>
                        <span className="font-semibold">{post.gameData.result}</span>
                        <span>{post.gameData.date}</span>
                      </div>
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 transition-colors ${
                          post.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors">
                        <Share2 className="w-5 h-5" />
                        <span>{post.shares}</span>
                      </button>
                    </div>
                    <button
                      onClick={() => handleBookmark(post.id)}
                      className={`transition-colors ${
                        post.isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </motion.div>
              ))}

              {selectedTab === 'groups' && (
                <div className="space-y-6">
                  {groups.map((group, index) => (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold text-white">{group.name}</h3>
                            {group.isPrivate && <Lock className="w-4 h-4 text-gray-400" />}
                          </div>
                          <p className="text-gray-300 mb-3">{group.description}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {group.tags.map((tag, idx) => (
                              <span key={idx} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>{group.memberCount.toLocaleString()} members</span>
                            <span>•</span>
                            <span>Last activity: {group.lastActivity}</span>
                          </div>
                        </div>
                        <button
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            group.isMember
                              ? 'bg-gray-600 text-gray-300'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {group.isMember ? 'Joined' : 'Join Group'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Your ChessBook Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Posts Created</span>
                    <span className="text-white font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Likes</span>
                    <span className="text-white font-semibold">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Groups Joined</span>
                    <span className="text-white font-semibold">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Reading Streak</span>
                    <span className="text-white font-semibold">15 days</span>
                  </div>
                </div>
              </div>

              {/* Trending Topics */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Trending Topics</h3>
                <div className="space-y-2">
                  {['#sicilian-defense', '#world-championship', '#women-in-chess', '#opening-theory', '#endgame-study'].map((topic, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors cursor-pointer">
                      <span className="text-blue-400">{topic}</span>
                      <span className="text-xs text-gray-400">+{Math.floor(Math.random() * 100) + 50}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Groups */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Suggested Groups</h3>
                <div className="space-y-3">
                  {groups.filter(g => !g.isMember).slice(0, 3).map((group, idx) => (
                    <div key={idx} className="p-3 rounded bg-white/5">
                      <h4 className="font-medium text-white mb-1">{group.name}</h4>
                      <p className="text-sm text-gray-400 mb-2">{group.memberCount} members</p>
                      <button className="w-full text-sm bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded transition-colors">
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
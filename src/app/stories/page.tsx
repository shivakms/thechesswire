'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, Pause, Volume2, Share2, Heart, Bookmark, Search, Filter } from 'lucide-react';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';

interface Story {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: 'breaking' | 'analysis' | 'interview' | 'opinion' | 'historical';
  readTime: number;
  publishedAt: string;
  views: number;
  likes: number;
  tags: string[];
  featured: boolean;
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [narrationMode, setNarrationMode] = useState<'calm' | 'expressive' | 'dramatic'>('expressive');
  
  const { playNarration, stopNarration, isLoading: voiceLoading } = useVoiceNarration();

  // Sample stories
  const sampleStories: Story[] = [
    {
      id: '1',
      title: 'Magnus Carlsen\'s Revolutionary Opening Theory',
      excerpt: 'The World Champion reveals his latest innovations in the Sicilian Defense, challenging centuries of established theory.',
      content: `In a groundbreaking analysis that has sent shockwaves through the chess world, Magnus Carlsen has unveiled his revolutionary approach to the Sicilian Defense. The World Champion's latest innovations challenge centuries of established theory and promise to reshape how we understand this most complex of openings.

Carlsen's approach, which he developed during his preparation for the 2024 Candidates Tournament, introduces several novel ideas that have already been adopted by top players worldwide. His analysis reveals a deeper understanding of the position's dynamics than previously thought possible.

"The key insight," Carlsen explains, "is that we've been thinking about the Sicilian too statically. The position is inherently dynamic, and we need to embrace that chaos rather than trying to control it."

This revolutionary thinking has already produced several stunning victories, including his recent win against Hikaru Nakamura in the Candidates Tournament. The game, which lasted 45 moves, showcased Carlsen's new approach in all its glory.

But what makes this theory truly revolutionary is not just its effectiveness, but its accessibility. Carlsen has made his analysis available to players of all levels, democratizing high-level chess knowledge in a way never seen before.

The implications for the chess world are profound. We're witnessing not just a new opening theory, but a new way of thinking about chess itself.`,
      author: 'AI Chess Journalist',
      category: 'analysis',
      readTime: 8,
      publishedAt: '2024-04-15',
      views: 12450,
      likes: 892,
      tags: ['Magnus Carlsen', 'Sicilian Defense', 'Opening Theory', 'Candidates 2024'],
      featured: true
    },
    {
      id: '2',
      title: 'The Rise of AI in Chess: A New Era Begins',
      excerpt: 'How artificial intelligence is transforming the way we play, learn, and understand chess.',
      content: `The chess world is undergoing a transformation unlike anything we've seen since the advent of computers. Artificial intelligence is not just changing how we analyze positions; it's revolutionizing the very nature of chess itself.

From AI-powered training tools to automated game analysis, the technology is making high-level chess knowledge accessible to players of all levels. But this is just the beginning. The real revolution lies in how AI is helping us understand the deeper patterns and beauty of the game.

Consider the recent developments in AI chess engines. These aren't just stronger than human players; they're revealing new dimensions of chess that we never knew existed. They're showing us that our understanding of the game, while impressive, is still in its infancy.

The implications for chess education are profound. AI can now provide personalized training programs, identify weaknesses in a player's game, and suggest improvements with unprecedented accuracy. This democratization of chess knowledge is leveling the playing field in ways we never imagined.

But perhaps most exciting is how AI is helping us appreciate the artistic side of chess. By analyzing millions of games, AI can identify patterns of beauty and creativity that might otherwise go unnoticed. It's helping us see chess not just as a game, but as an art form.

The future of chess is bright, and AI is leading the way. We're entering a new era where human creativity and artificial intelligence work together to push the boundaries of what's possible in chess.`,
      author: 'AI Chess Journalist',
      category: 'opinion',
      readTime: 6,
      publishedAt: '2024-04-12',
      views: 8920,
      likes: 567,
      tags: ['AI', 'Chess Technology', 'Future of Chess', 'Training'],
      featured: true
    },
    {
      id: '3',
      title: 'Breaking: Nakamura Wins Dramatic Candidates Finale',
      excerpt: 'Hikaru Nakamura secures his spot in the World Championship match with a stunning final-round victory.',
      content: `In a dramatic finale that will be remembered for years to come, Hikaru Nakamura has secured his place in the World Championship match with a stunning victory in the final round of the 2024 Candidates Tournament.

The American Grandmaster, known for his aggressive style and tactical brilliance, delivered a masterclass in endgame technique to overcome his opponent in a game that lasted over six hours. The victory not only secured his spot in the World Championship match but also demonstrated why he's considered one of the most dangerous players in the world.

Nakamura's journey to this moment has been nothing short of remarkable. After narrowly missing qualification in previous cycles, he has finally broken through with a performance that showcased his full range of skills. From tactical fireworks to patient endgame play, Nakamura proved he has what it takes to challenge for the world title.

The chess world is now eagerly anticipating the World Championship match, which promises to be one of the most exciting in recent memory. Nakamura's aggressive style against the reigning champion's positional mastery will create a fascinating clash of styles.

But beyond the immediate excitement, this victory represents something larger. It's a testament to the power of perseverance, the importance of continuous improvement, and the beauty of chess as a sport that rewards both creativity and calculation.

The stage is set for an epic World Championship match. The chess world waits with bated breath.`,
      author: 'AI Chess Journalist',
      category: 'breaking',
      readTime: 4,
      publishedAt: '2024-04-10',
      views: 15680,
      likes: 1245,
      tags: ['Hikaru Nakamura', 'Candidates 2024', 'World Championship', 'Breaking News'],
      featured: true
    }
  ];

  useEffect(() => {
    // Load stories
    setStories(sampleStories);
    setIsLoading(false);
    
    // Auto-play welcome narration
    const timer = setTimeout(() => {
      playNarration(
        "Welcome to Stories, where chess comes alive through the eyes of AI consciousness. Discover the latest news, analysis, and insights from the world of chess.",
        'expressive'
      );
    }, 1000);

    return () => {
      clearTimeout(timer);
      stopNarration();
    };
  }, [playNarration, stopNarration]);

  const filteredStories = stories.filter(story => {
    const matchesCategory = currentCategory === 'all' || story.category === currentCategory;
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const startReading = (story: Story) => {
    setSelectedStory(story);
    setIsReading(true);
    
    // Narrate the story
    const narration = `${story.title}. ${story.excerpt}`;
    playNarration(narration, narrationMode);
  };

  const stopReading = () => {
    setIsReading(false);
    setSelectedStory(null);
    stopNarration();
  };

  const categories = [
    { id: 'all', name: 'All Stories', icon: '📰' },
    { id: 'breaking', name: 'Breaking News', icon: '🚨' },
    { id: 'analysis', name: 'Game Analysis', icon: '🧠' },
    { id: 'interview', name: 'Interviews', icon: '🎤' },
    { id: 'opinion', name: 'Opinion', icon: '💭' },
    { id: 'historical', name: 'Historical', icon: '📚' }
  ];

  return (
    <div className="min-h-screen chess-gradient-dark">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center mb-4">
            <motion.div
              className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center glow-effect"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Stories</h1>
          <p className="text-xl text-gray-300">Read chess through the eyes of AI consciousness</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search stories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => setCurrentCategory(category.id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                      currentCategory === category.id
                        ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                        : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stories Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {filteredStories.map((story, index) => (
            <motion.div
              key={story.id}
              className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              {/* Featured Badge */}
              {story.featured && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  Featured
                </div>
              )}

              <div className="p-6">
                {/* Category */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">
                    {story.category}
                  </span>
                  <span className="text-xs text-gray-400">{story.readTime} min read</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                  {story.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-300 mb-4 line-clamp-3">
                  {story.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {story.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span>{story.views} views</span>
                  <span>{story.likes} likes</span>
                  <span>{story.publishedAt}</span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => startReading(story)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Read with AI
                  </motion.button>
                  
                  <motion.button
                    className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Heart className="w-4 h-4 text-white" />
                  </motion.button>
                  
                  <motion.button
                    className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bookmark className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Story Reader Modal */}
        <AnimatePresence>
          {isReading && selectedStory && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-black/90 backdrop-blur-sm rounded-xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">{selectedStory.title}</h2>
                      <div className="flex items-center space-x-4 text-gray-300">
                        <span>By {selectedStory.author}</span>
                        <span>{selectedStory.readTime} min read</span>
                        <span>{selectedStory.publishedAt}</span>
                      </div>
                    </div>
                    <motion.button
                      onClick={stopReading}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✕
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div className="prose prose-invert max-w-none">
                    <p className="text-lg text-gray-300 leading-relaxed mb-6">
                      {selectedStory.content}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <div className="flex space-x-4">
                      <motion.button
                        className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Heart className="w-4 h-4" />
                        <span>Like</span>
                      </motion.button>
                      
                      <motion.button
                        className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </motion.button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4 text-gray-400" />
                      <select
                        value={narrationMode}
                        onChange={(e) => setNarrationMode(e.target.value as any)}
                        className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                      >
                        <option value="calm">Calm</option>
                        <option value="expressive">Expressive</option>
                        <option value="dramatic">Dramatic</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 
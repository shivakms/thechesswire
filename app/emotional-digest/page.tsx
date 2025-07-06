
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../src/components/ui/Button';
import Textarea from '../../src/components/ui/Textarea';

interface DigestStory {
  id: string;
  type: 'brilliance' | 'sacrifice' | 'heartbreak' | 'comeback' | 'blunder';
  title: string;
  description: string;
  pgn: string;
  emotionScore: number;
  voiceNarration?: string;
  socialMediaText: string;
  thumbnailData: {
    position: string;
    emotion: string;
    quote: string;
  };
  createdAt: Date;
}

interface WeeklyDigest {
  week: string;
  stories: DigestStory[];
  voiceIntro: string;
  voiceOutro: string;
  socialCarousel: string[];
}

export default function EmotionalDigestPage() {
  const [games, setGames] = useState<Array<{ pgn: string; metadata: Record<string, unknown> }>>([]);
  const [currentDigest, setCurrentDigest] = useState<WeeklyDigest | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStory, setSelectedStory] = useState<DigestStory | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [newPgn, setNewPgn] = useState('');

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  const addGame = () => {
    if (newPgn.trim()) {
      setGames(prev => [...prev, { 
        pgn: newPgn.trim(), 
        metadata: { addedAt: new Date() } 
      }]);
      setNewPgn('');
    }
  };

  const removeGame = (index: number) => {
    setGames(prev => prev.filter((_, i) => i !== index));
  };

  const generateDigest = async () => {
    if (games.length === 0) {
      alert('Please add at least one game to generate a digest.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/storytelling/generate-digest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ games }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate digest');
      }

      const data = await response.json();
      setCurrentDigest(data.digest);
    } catch (error) {
      console.error('Error generating digest:', error);
      alert('Failed to generate emotional digest. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const playNarration = async (narration: string) => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlaying(false);
    }

    if (narration) {
      try {
        const audio = new Audio(narration);
        audio.onended = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
        };
        audio.onerror = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
          alert('Failed to play audio narration');
        };
        
        setCurrentAudio(audio);
        setIsPlaying(true);
        await audio.play();
      } catch (error) {
        console.error('Error playing narration:', error);
        setIsPlaying(false);
        alert('Failed to play narration');
      }
    }
  };

  const getEmotionColor = (type: string) => {
    const colors: Record<string, string> = {
      brilliance: 'from-yellow-400 to-orange-500',
      sacrifice: 'from-red-500 to-pink-600',
      heartbreak: 'from-blue-500 to-indigo-600',
      comeback: 'from-green-500 to-emerald-600',
      blunder: 'from-gray-500 to-slate-600'
    };
    return colors[type] || 'from-gray-400 to-gray-600';
  };

  const getEmotionEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      brilliance: '✨',
      sacrifice: '⚔️',
      heartbreak: '💔',
      comeback: '🔥',
      blunder: '🤝'
    };
    return emojis[type] || '🎭';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/chess-pattern.svg')] opacity-5"></div>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            🎭 Emotional Digest Stories
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Weekly voice story carousels that capture the full spectrum of human emotion on the chessboard.
            From brilliant sacrifices to heartbreaking blunders, every game tells a story worth remembering.
          </p>
        </motion.div>

        {/* Game Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">📝 Add Games for Analysis</h2>
          
          <div className="space-y-4">
            <Textarea
              value={newPgn}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewPgn(e.target.value)}
              placeholder="Paste PGN notation here..."
              className="min-h-[120px] bg-black/20 border-white/20 text-white placeholder-gray-400"
            />
            
            <Button
              onClick={addGame}
              disabled={!newPgn.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Add Game
            </Button>
          </div>

          {/* Games List */}
          {games.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Games Added ({games.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {games.map((game, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-black/20 rounded-lg p-3"
                  >
                    <span className="text-gray-300 truncate flex-1">
                      Game {index + 1}: {game.pgn.substring(0, 50)}...
                    </span>
                    <Button
                      onClick={() => removeGame(index)}
                      variant="danger"
                      size="sm"
                      className="ml-2 text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={generateDigest}
              disabled={games.length === 0 || isGenerating}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 w-full"
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Emotional Digest...
                </div>
              ) : (
                '🎭 Generate Weekly Digest'
              )}
            </Button>
          </div>
        </motion.div>

        {/* Digest Results */}
        <AnimatePresence>
          {currentDigest && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Digest Header */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h2 className="text-3xl font-bold text-white mb-4">
                  📅 Week {currentDigest.week} Digest
                </h2>
                
                {/* Voice Intro */}
                <div className="bg-black/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">🎙️ Weekly Introduction</span>
                    <Button
                      onClick={() => playNarration(currentDigest.voiceIntro)}
                      disabled={isPlaying}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isPlaying ? '⏸️ Playing...' : '▶️ Play Intro'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentDigest.stories.map((story, index) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gradient-to-br ${getEmotionColor(story.type)} rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300`}
                    onClick={() => setSelectedStory(story)}
                  >
                    <div className="text-white">
                      <div className="text-3xl mb-2">{getEmotionEmoji(story.type)}</div>
                      <h3 className="text-xl font-bold mb-2">{story.title}</h3>
                      <p className="text-sm opacity-90 mb-4">{story.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-white/20 px-2 py-1 rounded">
                          Score: {story.emotionScore}
                        </span>
                        {story.voiceNarration && (
                          <Button
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              playNarration(story.voiceNarration!);
                            }}
                            size="sm"
                            className="bg-white/20 hover:bg-white/30"
                          >
                            🎵 Play
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Media Carousel */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="text-2xl font-bold text-white mb-4">📱 Social Media Carousel</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentDigest.socialCarousel.map((slide, index) => (
                    <div
                      key={index}
                      className="bg-black/20 rounded-lg p-4 border border-white/10"
                    >
                      <div className="text-sm text-gray-400 mb-2">Slide {index + 1}</div>
                      <div className="text-white whitespace-pre-line">{slide}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice Outro */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold text-lg">🎙️ Weekly Conclusion</span>
                  <Button
                    onClick={() => playNarration(currentDigest.voiceOutro)}
                    disabled={isPlaying}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isPlaying ? '⏸️ Playing...' : '▶️ Play Outro'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Story Detail Modal */}
        <AnimatePresence>
          {selectedStory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedStory(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`bg-gradient-to-br ${getEmotionColor(selectedStory.type)} rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{getEmotionEmoji(selectedStory.type)}</div>
                    <Button
                      onClick={() => setSelectedStory(null)}
                      className="bg-white/20 hover:bg-white/30"
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4">{selectedStory.title}</h2>
                  <p className="mb-6">{selectedStory.description}</p>
                  
                  <div className="bg-black/20 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold mb-2">📱 Social Media Text:</h3>
                    <p className="text-sm">{selectedStory.socialMediaText}</p>
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold mb-2">💭 Emotional Quote:</h3>
                    <p className="text-sm italic">&ldquo;{selectedStory.thumbnailData.quote}&rdquo;</p>
                  </div>
                  
                  {selectedStory.voiceNarration && (
                    <Button
                      onClick={() => playNarration(selectedStory.voiceNarration!)}
                      disabled={isPlaying}
                      className="w-full bg-white/20 hover:bg-white/30"
                    >
                      {isPlaying ? '⏸️ Playing Narration...' : '🎵 Play Full Narration'}
                    </Button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

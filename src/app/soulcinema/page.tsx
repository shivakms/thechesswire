'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Play, Pause, Upload, Video, Camera, Sparkles, Settings, Download, Share2, Heart } from 'lucide-react';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';

interface CinematicScene {
  id: string;
  moveNumber: number;
  fen: string;
  narration: string;
  visualEffect: 'dramatic' | 'tactical' | 'strategic' | 'emotional';
  cameraAngle: 'overhead' | 'close-up' | 'wide' | 'dramatic';
  music: 'epic' | 'tension' | 'victory' | 'defeat';
}

interface CinematicGame {
  id: string;
  title: string;
  description: string;
  duration: number;
  scenes: CinematicScene[];
  thumbnail: string;
  views: number;
  likes: number;
  createdAt: string;
}

export default function SoulCinemaPage() {
  const [chess, setChess] = useState(new Chess());
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGame, setSelectedGame] = useState<CinematicGame | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [cinematicMode, setCinematicMode] = useState<'epic' | 'dramatic' | 'analytical'>('dramatic');
  
  const { playNarration, stopNarration, isLoading } = useVoiceNarration();
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sample cinematic games
  const sampleCinematicGames: CinematicGame[] = [
    {
      id: '1',
      title: 'The Immortal Game - Cinematic Edition',
      description: 'A dramatic retelling of Anderssen vs Kieseritzky with epic narration and visual effects',
      duration: 180,
      scenes: [],
      thumbnail: '/api/placeholder/400/300',
      views: 15420,
      likes: 892,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Magnus vs Hikaru - Battle of Titans',
      description: 'The 2024 Candidates clash with cinematic storytelling and emotional depth',
      duration: 240,
      scenes: [],
      thumbnail: '/api/placeholder/400/300',
      views: 8920,
      likes: 567,
      createdAt: '2024-04-10'
    }
  ];

  useEffect(() => {
    // Auto-play welcome narration
    const timer = setTimeout(() => {
      playNarration(
        "Welcome to SoulCinema, where chess games transform into epic cinematic experiences. Upload your game and watch it come alive with dramatic narration, visual effects, and emotional storytelling.",
        'dramatic'
      );
    }, 1000);

    return () => {
      clearTimeout(timer);
      stopNarration();
    };
  }, [playNarration, stopNarration]);

  useEffect(() => {
    if (isPlaying && selectedGame) {
      playIntervalRef.current = setInterval(() => {
        if (currentScene < selectedGame.scenes.length - 1) {
          setCurrentScene(prev => prev + 1);
          playScene(selectedGame.scenes[currentScene + 1]);
        } else {
          setIsPlaying(false);
          playNarration("Cinematic experience complete! What a journey through the 64 squares.", 'epic');
        }
      }, 3000);
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, currentScene, selectedGame, playNarration]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const text = await file.text();
      const newChess = new Chess();
      newChess.loadPgn(text);
      
      // Generate cinematic scenes
      const scenes = await generateCinematicScenes(newChess);
      
      const cinematicGame: CinematicGame = {
        id: Date.now().toString(),
        title: `${newChess.header('White')} vs ${newChess.header('Black')} - Cinematic`,
        description: `A cinematic retelling of ${newChess.header('Event') || 'this epic battle'}`,
        duration: scenes.length * 3,
        scenes,
        thumbnail: '/api/placeholder/400/300',
        views: 0,
        likes: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };

      setSelectedGame(cinematicGame);
      setChess(newChess);
      setCurrentScene(0);
      
      playNarration(
        `Cinematic game created! ${scenes.length} scenes ready for your viewing pleasure.`,
        'dramatic'
      );
    } catch (error) {
      console.error('Error loading PGN:', error);
      playNarration("Sorry, I couldn't create a cinematic experience from that file. Please try again.", 'calm');
    } finally {
      setIsUploading(false);
    }
  };

  const generateCinematicScenes = async (chess: Chess): Promise<CinematicScene[]> => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const history = chess.history({ verbose: true });
    const scenes: CinematicScene[] = [];
    
    for (let i = 0; i < history.length; i++) {
      const move = history[i];
      const tempChess = new Chess();
      
      // Replay moves up to this point
      for (let j = 0; j <= i; j++) {
        tempChess.move(history[j]);
      }
      
      const scene: CinematicScene = {
        id: `scene-${i}`,
        moveNumber: i + 1,
        fen: tempChess.fen(),
        narration: generateSceneNarration(move, i, history.length),
        visualEffect: getVisualEffect(i, history.length),
        cameraAngle: getCameraAngle(i, history.length),
        music: getMusic(i, history.length)
      };
      
      scenes.push(scene);
      setGenerationProgress(((i + 1) / history.length) * 100);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsGenerating(false);
    return scenes;
  };

  const generateSceneNarration = (move: any, index: number, totalMoves: number): string => {
    const narrations = [
      "The tension builds as the pieces dance across the board.",
      "A tactical shot that changes the course of the game.",
      "Strategic depth revealed in this masterful move.",
      "The position explodes with tactical possibilities.",
      "A defensive resource that maintains the balance.",
      "Initiative seized with this aggressive continuation.",
      "The endgame approaches with careful calculation.",
      "A brilliant combination unfolds before our eyes.",
      "The battle reaches its dramatic climax.",
      "Victory secured with this final masterstroke."
    ];
    
    return narrations[index % narrations.length];
  };

  const getVisualEffect = (index: number, total: number): CinematicScene['visualEffect'] => {
    if (index < total * 0.2) return 'strategic';
    if (index < total * 0.6) return 'tactical';
    if (index < total * 0.8) return 'dramatic';
    return 'emotional';
  };

  const getCameraAngle = (index: number, total: number): CinematicScene['cameraAngle'] => {
    const angles: CinematicScene['cameraAngle'][] = ['overhead', 'close-up', 'wide', 'dramatic'];
    return angles[index % angles.length];
  };

  const getMusic = (index: number, total: number): CinematicScene['music'] => {
    if (index < total * 0.3) return 'epic';
    if (index < total * 0.7) return 'tension';
    if (index < total * 0.9) return 'victory';
    return 'defeat';
  };

  const playScene = (scene: CinematicScene) => {
    setChess(new Chess(scene.fen));
    playNarration(scene.narration, 'dramatic');
  };

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (selectedGame && selectedGame.scenes[currentScene]) {
        playScene(selectedGame.scenes[currentScene]);
      }
    }
  };

  const generateCinematicVideo = async () => {
    if (!selectedGame) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate video generation
    for (let i = 0; i <= 100; i += 10) {
      setGenerationProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsGenerating(false);
    playNarration("Cinematic video generated successfully! Ready for download and sharing.", 'epic');
  };

  const loadSampleGame = (game: CinematicGame) => {
    setSelectedGame(game);
    setChess(new Chess());
    setCurrentScene(0);
    
    playNarration(
      `Loading ${game.title}. Prepare for an epic cinematic journey.`,
      'dramatic'
    );
  };

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
              className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center glow-effect"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Video className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SoulCinema</h1>
          <p className="text-xl text-gray-300">Transform your games into cinematic experiences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Selection Panel */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Create Cinematic</h2>
              
              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload PGN for Cinematic
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pgn"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="cinematic-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="cinematic-upload"
                    className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg cursor-pointer hover:from-orange-600 hover:to-red-700 transition-all duration-200"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    {isUploading ? 'Creating Cinematic...' : 'Choose PGN File'}
                  </label>
                </div>
              </div>

              {/* Sample Cinematic Games */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Featured Cinematics</h3>
                <div className="space-y-3">
                  {sampleCinematicGames.map((game) => (
                    <motion.button
                      key={game.id}
                      onClick={() => loadSampleGame(game)}
                      className="w-full text-left p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-semibold text-white">{game.title}</div>
                      <div className="text-sm text-gray-400 mb-2">{game.description}</div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{game.duration}s</span>
                        <span>{game.views} views</span>
                        <span>{game.likes} likes</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cinematic Player */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              {selectedGame ? (
                <>
                  {/* Game Info */}
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedGame.title}</h2>
                    <div className="text-gray-300 mb-2">{selectedGame.description}</div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{selectedGame.duration}s</span>
                      <span>{selectedGame.scenes.length} scenes</span>
                      <span>{selectedGame.views} views</span>
                      <span>{selectedGame.likes} likes</span>
                    </div>
                  </div>

                  {/* Cinematic Player */}
                  <div className="mb-6">
                    <div className="relative">
                      <Chessboard
                        position={chess.fen()}
                        boardWidth={400}
                        customBoardStyle={{
                          borderRadius: '8px',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                        }}
                      />
                      
                      {/* Scene Overlay */}
                      {selectedGame.scenes[currentScene] && (
                        <motion.div
                          className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="text-sm font-semibold">
                            Scene {currentScene + 1} of {selectedGame.scenes.length}
                          </div>
                          <div className="text-xs text-gray-300">
                            {selectedGame.scenes[currentScene].visualEffect} • {selectedGame.scenes[currentScene].cameraAngle}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <motion.button
                      onClick={() => setCurrentScene(Math.max(0, currentScene - 1))}
                      className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </motion.button>
                    
                    <motion.button
                      onClick={togglePlayback}
                      className="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white" />
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setCurrentScene(Math.min(selectedGame.scenes.length - 1, currentScene + 1))}
                      className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>

                  {/* Scene Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Scene {currentScene + 1} of {selectedGame.scenes.length}</span>
                      <span>{Math.round(((currentScene + 1) / selectedGame.scenes.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentScene + 1) / selectedGame.scenes.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <motion.button
                      onClick={generateCinematicVideo}
                      disabled={isGenerating}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Video className="w-5 h-5 mr-2" />
                      {isGenerating ? `Generating... ${generationProgress}%` : 'Generate Video'}
                    </motion.button>
                    
                    <motion.button
                      className="px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download className="w-5 h-5 text-white" />
                    </motion.button>
                    
                    <motion.button
                      className="px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Share2 className="w-5 h-5 text-white" />
                    </motion.button>
                    
                    <motion.button
                      className="px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Heart className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Cinematic Selected</h3>
                  <p className="text-gray-500">Upload a PGN file or select a sample cinematic to begin</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Settings Panel */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Cinematic Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cinematic Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cinematic Style
                </label>
                <select
                  value={cinematicMode}
                  onChange={(e) => setCinematicMode(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="epic">Epic</option>
                  <option value="dramatic">Dramatic</option>
                  <option value="analytical">Analytical</option>
                </select>
              </div>

              {/* Scene Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Scene Duration
                </label>
                <select
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="2">2 seconds</option>
                  <option value="3">3 seconds</option>
                  <option value="5">5 seconds</option>
                  <option value="8">8 seconds</option>
                </select>
              </div>

              {/* Visual Effects */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Visual Effects
                </label>
                <button className="w-full px-3 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 text-orange-300 rounded-lg">
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Enhanced
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
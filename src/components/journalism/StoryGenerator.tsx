'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StorytellingEngine, StoryGeneration } from '../../lib/storytelling/StorytellingEngine';

const samplePGNs = {
  immortal: `[Event "Immortal Game"]
[Site "London"]
[Date "1851.06.21"]
[Round "?"]
[White "Anderssen, Adolf"]
[Black "Kieseritzky, Lionel"]
[Result "1-0"]

1.e4 e5 2.f4 exf4 3.Bc4 Qh4+ 4.Kf1 b5 5.Bxb5 Nf6 6.Nf3 Qh6 7.d3 Nh5 8.Nh4 Qg5 9.Nf5 c6 10.g3 Qf6 11.Rg1 cxb5 12.h4 Qg6 13.h5 Qg5 14.Qf3 Ng3+ 15.Kf2 Nxe4+ 16.Kg2 Nxd2 17.Nxd2 Bc5 18.Nf3 Qf6 19.Nce4 Bb6 20.Nxf6+ gxf6 21.Bxf4 Rg8 22.Qh3 d6 23.Qh4 Nd7 24.Qxf6 Nf8 25.Qxd6 1-0`,
  
  evergreen: `[Event "Evergreen Game"]
[Site "Berlin"]
[Date "1852.??.??"]
[Round "?"]
[White "Anderssen, Adolf"]
[Black "Dufresne, Jean"]
[Result "1-0"]

1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1 Qxf3 20.Rxe7+ Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24.Bxe7# 1-0`
};

export default function StoryGenerator() {
  const [pgn, setPgn] = useState('');
  const [story, setStory] = useState<StoryGeneration | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [style, setStyle] = useState<'dramatic' | 'humorous' | 'historical' | 'analytical'>('dramatic');
  const [selectedSample, setSelectedSample] = useState<string>('');
  const [showReplay, setShowReplay] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const generateStory = async () => {
    if (!pgn.trim()) return;
    
    setIsGenerating(true);
    try {
      const engine = new StorytellingEngine();
      const generatedStory = await engine.generateStory(pgn, style);
      setStory(generatedStory);
      setShowReplay(true);
    } catch (error) {
      console.error('Story generation failed:', error);
      alert('Failed to generate story. Please check your PGN format.');
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSamplePGN = (sampleKey: string) => {
    const samplePGN = samplePGNs[sampleKey as keyof typeof samplePGNs];
    if (samplePGN) {
      setPgn(samplePGN);
      setSelectedSample(sampleKey);
    }
  };

  const playVoiceNarration = async () => {
    if (!story?.voiceNarration) return;
    
    setIsPlayingVoice(true);
    try {
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(story.voiceNarration);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      
      source.onended = () => {
        setIsPlayingVoice(false);
      };
    } catch (error) {
      console.error('Voice playback failed:', error);
      setIsPlayingVoice(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
              AI Chess Journalism
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transform your chess games into captivating stories with AI-powered narrative generation, 
              complete with dramatic commentary, historical context, and emotional storytelling.
            </p>
          </div>

          {/* Input Section */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* PGN Input */}
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-white mb-3">
                    📝 Enter Your PGN
                  </label>
                  <textarea
                    placeholder="Paste your PGN here... or select a famous game below"
                    value={pgn}
                    onChange={(e) => setPgn(e.target.value)}
                    className="w-full h-64 p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none font-mono text-sm"
                  />
                </div>

                {/* Sample Games */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    🏆 Try Famous Games
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => loadSamplePGN('immortal')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSample === 'immortal'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Immortal Game
                    </button>
                    <button
                      onClick={() => loadSamplePGN('evergreen')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSample === 'evergreen'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Evergreen Game
                    </button>
                  </div>
                </div>
              </div>

              {/* Style Selection & Controls */}
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-white mb-3">
                    🎭 Storytelling Style
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'dramatic', label: 'Dramatic', icon: '🎭', desc: 'Epic, cinematic narration' },
                      { key: 'humorous', label: 'Humorous', icon: '😄', desc: 'Light-hearted and fun' },
                      { key: 'historical', label: 'Historical', icon: '📚', desc: 'Classical and reverent' },
                      { key: 'analytical', label: 'Analytical', icon: '🔍', desc: 'Technical and precise' }
                    ].map((styleOption) => (
                      <button
                        key={styleOption.key}
                        onClick={() => setStyle(styleOption.key as any)}
                        className={`p-4 rounded-lg text-left transition-all ${
                          style === styleOption.key
                            ? 'bg-purple-600/30 border border-purple-500/50 text-white'
                            : 'bg-gray-800/30 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{styleOption.icon}</span>
                          <span className="font-medium">{styleOption.label}</span>
                        </div>
                        <p className="text-xs text-gray-400">{styleOption.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateStory}
                  disabled={isGenerating || !pgn.trim()}
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all transform hover:scale-105 disabled:hover:scale-100"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Crafting Your Story...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>✨</span>
                      Generate AI Story
                      <span>✨</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Generated Story Display */}
          <AnimatePresence>
            {story && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Story Content */}
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Main Story */}
                  <div className="lg:col-span-2 bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-3xl font-bold text-white">The Story</h2>
                      {story.voiceNarration && (
                        <button
                          onClick={playVoiceNarration}
                          disabled={isPlayingVoice}
                          className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            isPlayingVoice
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {isPlayingVoice ? '⏸ Playing...' : '🎤 Play Narration'}
                        </button>
                      )}
                    </div>
                    
                    <div className="prose prose-invert prose-lg max-w-none">
                      <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                        {story.textStory}
                      </div>
                    </div>

                    {/* Quotes Section */}
                    {story.quotes.length > 0 && (
                      <div className="mt-8 p-6 bg-gray-800/50 rounded-lg border-l-4 border-purple-500">
                        <h3 className="text-lg font-semibold text-white mb-4">💭 Chess Wisdom</h3>
                        {story.quotes.map((quote, index) => (
                          <blockquote key={index} className="text-gray-300 italic mb-3 last:mb-0">
                            "{quote.split(' - ')[0]}"
                            <footer className="text-gray-400 text-sm mt-1">
                              — {quote.split(' - ')[1]}
                            </footer>
                          </blockquote>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Story Metadata */}
                  <div className="space-y-6">
                    {/* Key Moments */}
                    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                      <h3 className="text-xl font-bold text-white mb-4">🎯 Key Moments</h3>
                      <div className="space-y-3">
                        {story.keyMoments.slice(0, 5).map((moment, index) => (
                          <div key={index} className="p-3 bg-gray-800/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-purple-300">
                                Move {moment.moveIndex + 1}
                              </span>
                              <div className={`px-2 py-1 rounded text-xs font-medium ${
                                moment.emotion === 'triumph' ? 'bg-green-600/20 text-green-300' :
                                moment.emotion === 'tension' ? 'bg-red-600/20 text-red-300' :
                                moment.emotion === 'excitement' ? 'bg-yellow-600/20 text-yellow-300' :
                                'bg-gray-600/20 text-gray-300'
                              }`}>
                                {moment.type}
                              </div>
                            </div>
                            <p className="text-sm text-gray-300">{moment.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tactical Themes */}
                    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                      <h3 className="text-xl font-bold text-white mb-4">⚔️ Tactical Themes</h3>
                      <div className="flex flex-wrap gap-2">
                        {story.tacticalThemes.map((theme, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm font-medium"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Historical Context */}
                    {story.historicalContext && (
                      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                        <h3 className="text-xl font-bold text-white mb-4">📜 Historical Context</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {story.historicalContext}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* PGN Display */}
                {showReplay && (
                  <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-3xl font-bold text-white">📋 Game PGN</h2>
                      <button
                        onClick={() => setShowReplay(!showReplay)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                      >
                        {showReplay ? 'Hide PGN' : 'Show PGN'}
                      </button>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-6">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono overflow-x-auto">
                        {pgn}
                      </pre>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-gray-400 text-sm">
                        🎬 Cinematic replay will be available when integrated with Phase 2B
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
// import { Button } from '@/components/ui/Button';

interface GeniusShort {
  id: string;
  title: string;
  description: string;
  pgn: string;
  keyMove: string;
  twistEnding: string;
  emotionalArc: string;
  voiceScript: string;
  duration: number;
  hashtags: string[];
}

export default function GeniusShortsPage() {
  const [pgn, setPgn] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedShort, setGeneratedShort] = useState<GeniusShort | null>(null);
  const [error, setError] = useState('');

  const handleGenerateShort = async () => {
    if (!pgn.trim()) {
      setError('Please enter a valid PGN');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/video/generate-genius-short', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pgn: pgn.trim(),
          config: {
            voiceMode: 'dramatic',
            targetDuration: 60,
            verticalFormat: true
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate short');
      }

      setGeneratedShort(data.short);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const samplePGN = `1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.c3 O-O 9.h3 Nb8 10.d4 Nbd7 11.Nbd2 Bb7 12.Bc2 Re8 13.Nf1 Bf8 14.Ng3 g6 15.a4 c5 16.d5 c4 17.Bg5 Nc5 18.Qd4 h6 19.Bh4 Qc7 20.Nf5 gxf5 21.exf5 Ncd7 22.f6 Qc5 23.Qxc5 Nxc5 24.Bxf6 Nd3 25.Re3 Nf4 26.g3 Nxd5 27.Bxd5 Bxd5 28.Re7 1-0`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4 animate-pulse">
            60 Seconds of Genius
          </h1>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-8" />
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transform chess games into viral YouTube Shorts with dramatic AI narration and twist endings
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-purple-400">Generate Genius Short</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chess Game (PGN Format)
                </label>
                <textarea
                  value={pgn}
                  onChange={(e) => setPgn(e.target.value)}
                  placeholder="Enter PGN notation here..."
                  className="w-full h-32 px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <div className="mt-2">
                  <button
                    onClick={() => setPgn(samplePGN)}
                    className="text-purple-400 hover:text-purple-300 px-2 py-1 text-sm underline"
                  >
                    Use Sample Game
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={handleGenerateShort}
                disabled={isGenerating || !pgn.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Genius Short...
                  </div>
                ) : (
                  'Generate 60 Seconds of Genius'
                )}
              </button>
            </div>
          </div>

          {generatedShort && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-6 text-green-400">Generated Short</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-2">Title</h3>
                  <p className="text-white bg-gray-900/50 p-3 rounded-lg">{generatedShort.title}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-2">Key Move</h3>
                  <p className="text-white bg-gray-900/50 p-3 rounded-lg font-mono">{generatedShort.keyMove}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-2">Twist Ending</h3>
                  <p className="text-white bg-gray-900/50 p-3 rounded-lg">{generatedShort.twistEnding}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-2">Voice Script</h3>
                  <div className="text-white bg-gray-900/50 p-4 rounded-lg whitespace-pre-line">
                    {generatedShort.voiceScript}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-2">Hashtags</h3>
                  <div className="flex flex-wrap gap-2">
                    {generatedShort.hashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm border border-blue-600/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-400 mb-2">Emotional Arc</h3>
                    <p className="text-white bg-gray-900/50 p-3 rounded-lg capitalize">{generatedShort.emotionalArc}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-400 mb-2">Duration</h3>
                    <p className="text-white bg-gray-900/50 p-3 rounded-lg">{generatedShort.duration} seconds</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

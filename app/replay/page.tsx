'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReplayTheater from '../../src/components/replay/ReplayTheater';

const samplePGN = `[Event "World Championship"]
[Site "New York"]
[Date "2021.11.26"]
[Round "6"]
[White "Carlsen, Magnus"]
[Black "Nepomnichtchi, Ian"]
[Result "1-0"]

1.d4 Nf6 2.Nf3 d5 3.g3 e6 4.Bg2 Be7 5.O-O O-O 6.b3 c5 7.dxc5 Bxc5 8.c4 dxc4 9.Qc2 Qe7 10.Nbd2 Nc6 11.Nxc4 b5 12.Nce5 Nxe5 13.Nxe5 Bb7 14.Bb2 Rac8 15.Qb1 Rfd8 16.a4 a6 17.axb5 axb5 18.Qxb5 Bxg2 19.Kxg2 Qb7+ 20.Kg1 h6 21.Ra7 Qb8 22.Rxf7 1-0`;

export default function ReplayPage() {
  const [customPgn, setCustomPgn] = useState('');
  const [activePgn, setActivePgn] = useState(samplePGN);
  const [narrationEnabled, setNarrationEnabled] = useState(true);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const loadCustomPgn = () => {
    if (customPgn.trim()) {
      setActivePgn(customPgn.trim());
      setShowCustomInput(false);
    }
  };

  const loadSampleGame = () => {
    setActivePgn(samplePGN);
    setShowCustomInput(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header Controls */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Chess Replay Theater
              </h1>
              <p className="text-gray-400 text-sm">
                Experience chess games like never before with cinematic replay and AI narration
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Narration Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={narrationEnabled}
                  onChange={(e) => setNarrationEnabled(e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative w-12 h-6 rounded-full transition-colors ${
                  narrationEnabled ? 'bg-purple-600' : 'bg-gray-600'
                }`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    narrationEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </div>
                <span className="text-sm text-gray-300">🎤 AI Narration</span>
              </label>

              {/* Game Selection */}
              <div className="flex gap-2">
                <button
                  onClick={loadSampleGame}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Sample Game
                </button>
                <button
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  Load PGN
                </button>
              </div>
            </div>
          </div>

          {/* Custom PGN Input */}
          {showCustomInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-800/50 rounded-lg"
            >
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Paste your PGN here:
                </label>
                <textarea
                  value={customPgn}
                  onChange={(e) => setCustomPgn(e.target.value)}
                  placeholder="[Event &quot;Your Game&quot;]&#10;[Site &quot;Your Location&quot;]&#10;...&#10;&#10;1.e4 e5 2.Nf3 Nc6..."
                  className="w-full h-32 p-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={loadCustomPgn}
                    disabled={!customPgn.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                  >
                    Load Game
                  </button>
                  <button
                    onClick={() => setShowCustomInput(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Replay Theater */}
      <ReplayTheater 
        pgn={activePgn}
        narrationEnabled={narrationEnabled}
        autoPlay={false}
        playbackSpeed={2500}
      />
    </div>
  );
}

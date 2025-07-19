'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BambaiVoice } from '@/components/BambaiVoice';
import { BambaiNarrator } from '@/components/BambaiNarrator';

export default function VoiceTestPage() {
  const [selectedComponent, setSelectedComponent] = useState<'voice' | 'narrator'>('narrator');
  const [testText, setTestText] = useState(
    "Welcome to TheChessWire.news, where chess meets artificial intelligence in a symphony of strategy and soul. I am Bambai AI, your guide through the infinite possibilities of the 64 squares. Experience the future of chess journalism through AI narration, cinematic storytelling, and emotional analysis."
  );

  const testTexts = [
    {
      title: "Welcome Message",
      text: "Welcome to TheChessWire.news, where chess meets artificial intelligence in a symphony of strategy and soul. I am Bambai AI, your guide through the infinite possibilities of the 64 squares."
    },
    {
      title: "Chess Analysis",
      text: "In this position, White has a slight advantage due to better piece coordination and control of the center. The knight on e4 is particularly strong, eyeing both the kingside and queenside."
    },
    {
      title: "Dramatic Moment",
      text: "The tension builds as Black's queen hovers menacingly over the kingside. White must find the precise defensive move, or face a devastating attack that could end the game in just a few moves."
    },
    {
      title: "Poetic Reflection",
      text: "Chess is not merely a game of pieces on a board, but a dance of minds, a battle of wills, and a canvas for the most beautiful expressions of human creativity and strategic thinking."
    }
  ];

  return (
    <div className="min-h-screen chess-gradient-dark">
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">Bambai AI Voice Test</h1>
          <p className="text-xl text-gray-300">Test the ElevenLabs-powered voice narration system</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Component Selection */}
          <motion.div
            className="glass-morphism-dark rounded-2xl p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Voice Components</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => setSelectedComponent('voice')}
                className={`w-full p-4 rounded-lg text-left transition-colors ${
                  selectedComponent === 'voice'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <h3 className="font-semibold">BambaiVoice</h3>
                <p className="text-sm opacity-75">Compact voice control widget</p>
              </button>
              
              <button
                onClick={() => setSelectedComponent('narrator')}
                className={`w-full p-4 rounded-lg text-left transition-colors ${
                  selectedComponent === 'narrator'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <h3 className="font-semibold">BambaiNarrator</h3>
                <p className="text-sm opacity-75">Full-featured narrator with visualizer</p>
              </button>
            </div>
          </motion.div>

          {/* Text Input */}
          <motion.div
            className="glass-morphism-dark rounded-2xl p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Test Text</h2>
            
            <div className="space-y-4">
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full h-32 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Enter text to test voice narration..."
              />
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Quick Test Texts</h3>
                <div className="grid grid-cols-1 gap-2">
                  {testTexts.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setTestText(item.text)}
                      className="p-3 bg-gray-700 rounded-lg text-left hover:bg-gray-600 transition-colors"
                    >
                      <h4 className="font-medium text-white">{item.title}</h4>
                      <p className="text-sm text-gray-300 truncate">{item.text}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Voice Component Display */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {selectedComponent === 'voice' ? 'BambaiVoice Component' : 'BambaiNarrator Component'}
          </h2>
          
          <div className="flex justify-center">
                         {selectedComponent === 'voice' ? (
               <BambaiVoice
                 text={testText}
                 autoPlay={false}
                 showControls={true}
                 className="relative bottom-0 right-0"
               />
             ) : (
               <BambaiNarrator
                 text={testText}
                 autoPlay={false}
                 showVisualizer={true}
                 className="max-w-md"
               />
             )}
          </div>
        </motion.div>

        {/* Voice System Info */}
        <motion.div
          className="mt-12 glass-morphism-dark rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Voice System Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Technical Details</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Powered by ElevenLabs API</li>
                <li>• Voice ID: PmypFHWgqk9ACZdL8ugT (Female)</li>
                <li>• Multiple voice modes: Calm, Expressive, Dramatic, Poetic</li>
                <li>• Real-time voice generation</li>
                <li>• Fallback to browser TTS</li>
                <li>• Audio caching for performance</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Voice Modes</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• <span className="text-green-400">Calm:</span> Soothing and peaceful narration</li>
                <li>• <span className="text-yellow-400">Expressive:</span> Emotional and engaging delivery</li>
                <li>• <span className="text-red-400">Dramatic:</span> Intense and powerful storytelling</li>
                <li>• <span className="text-purple-400">Poetic:</span> Beautiful and lyrical expression</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-primary-500/20 rounded-lg border border-primary-500/30">
            <h3 className="text-lg font-semibold text-white mb-2">🎙️ Bambai AI Voice Manifesto</h3>
            <p className="text-gray-300">
              "Bambai AI must never sound boring or robotic. It should be a poetic, expressive, 
              emotionally resonant voice that users fall in love with. Sound human, with cadence, 
              rhythm, breath, and emphasis. Evoke emotion: joy, sorrow, surprise, calm, passion. 
              Narrate like a soulful storyteller — not a speech engine."
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
'use client';

import React, { useState } from 'react';
import Button from '../../src/components/ui/Button';

interface LivePersonalityConfig {
  personality: 'enthusiastic' | 'analytical' | 'dramatic' | 'humorous' | 'philosophical';
  topic: string;
  duration: number;
  energy_level: 'low' | 'medium' | 'high' | 'extreme';
  target_audience: 'casual' | 'serious' | 'mixed';
  include_chess_terms: boolean;
  add_personality_quirks: boolean;
}

interface PersonalityClip {
  id: string;
  title: string;
  script: string;
  personality: string;
  duration: number;
  voiceNarration: string;
  metadata: {
    emotion: string;
    energy_level: number;
    engagement_score: number;
    viral_potential: number;
  };
  hashtags: string[];
  timestamp: string;
}

export default function PersonalityClipsPage() {
  const [config, setConfig] = useState<LivePersonalityConfig>({
    personality: 'enthusiastic',
    topic: '',
    duration: 30,
    energy_level: 'medium',
    target_audience: 'mixed',
    include_chess_terms: true,
    add_personality_quirks: true
  });

  const [result, setResult] = useState<PersonalityClip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/video/generate-personality-clip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate personality clip');
      }

      const data = await response.json();
      setResult(data.personalityClip);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Bambai AI LIVE Personality Clips
          </h1>
          <p className="text-xl text-gray-300">
            Generate dynamic chess content with AI-powered personality narration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
            <h2 className="text-2xl font-semibold text-white mb-6">Configuration</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Topic
                </label>
                <textarea
                  value={config.topic}
                  onChange={(e) => setConfig({...config, topic: e.target.value})}
                  placeholder="Describe the chess position or topic you want to discuss..."
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Personality
                </label>
                <select
                  value={config.personality}
                  onChange={(e) => setConfig({...config, personality: e.target.value as 'enthusiastic' | 'analytical' | 'dramatic' | 'humorous' | 'philosophical'})}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="analytical">Analytical</option>
                  <option value="dramatic">Dramatic</option>
                  <option value="humorous">Humorous</option>
                  <option value="philosophical">Philosophical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="range"
                  min="15"
                  max="90"
                  value={config.duration}
                  onChange={(e) => setConfig({...config, duration: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="text-center text-gray-400 mt-1">{config.duration}s</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Energy Level
                </label>
                <select
                  value={config.energy_level}
                  onChange={(e) => setConfig({...config, energy_level: e.target.value as 'low' | 'medium' | 'high' | 'extreme'})}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="extreme">Extreme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Audience
                </label>
                <select
                  value={config.target_audience}
                  onChange={(e) => setConfig({...config, target_audience: e.target.value as 'casual' | 'serious' | 'mixed'})}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="casual">Casual</option>
                  <option value="serious">Serious</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.include_chess_terms}
                    onChange={(e) => setConfig({...config, include_chess_terms: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-gray-300">Include Chess Terms</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.add_personality_quirks}
                    onChange={(e) => setConfig({...config, add_personality_quirks: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-gray-300">Add Personality Quirks</span>
                </label>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading || !config.topic.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? 'Generating...' : 'Generate Personality Clip'}
              </Button>

              {error && (
                <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-300">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
            <h2 className="text-2xl font-semibold text-white mb-6">Generated Clip</h2>
            
            {result ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{result.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Personality: {result.personality}</span>
                    <span>Duration: {result.duration}s</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{result.metadata.engagement_score}</div>
                    <div className="text-sm text-gray-400">Engagement Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{result.metadata.viral_potential}</div>
                    <div className="text-sm text-gray-400">Viral Potential</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Metadata</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Emotion:</span>
                      <span className="px-2 py-1 bg-slate-600 text-slate-200 rounded text-sm">{result.metadata.emotion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Energy Level:</span>
                      <span className="text-white">{result.metadata.energy_level}/10</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Script</h4>
                  <div className="p-3 bg-slate-700/50 rounded text-gray-300 text-sm max-h-40 overflow-y-auto">
                    {result.script}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Hashtags</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.hashtags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 border border-blue-400 text-blue-400 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                Enter a topic and configure your settings to generate a personality-driven chess clip
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Button from '../../src/components/ui/Button';
import Textarea from '../../src/components/ui/Textarea';
import { StorytellingConfig, GeneratedArticle } from '../../src/lib/journalism/AIJournalist';

export default function JournalismPage() {
  const [pgn, setPgn] = useState('');
  const [config, setConfig] = useState<StorytellingConfig>({
    mode: 'dramatic',
    includeAlternateEndings: false,
    historicalContext: false,
    emotionalIntensity: 'medium',
    targetAudience: 'mixed',
    accessLevel: 'freemium'
  });
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!pgn.trim()) {
      setError('Please enter a valid PGN');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/journalism/generate-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pgn, config }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate article');
      }

      const data = await response.json();
      setGeneratedArticle(data.article);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">AI Chess Journalism</h1>
          <p className="text-xl text-gray-300">Transform chess games into compelling stories</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
              <h2 className="text-2xl font-semibold text-white mb-6">Game Input</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    PGN Notation
                  </label>
                  <Textarea
                    value={pgn}
                    onChange={(e) => setPgn(e.target.value)}
                    placeholder="Paste PGN notation here..."
                    rows={8}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
              <h2 className="text-2xl font-semibold text-white mb-6">Storytelling Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Storytelling Mode
                  </label>
                  <select
                    value={config.mode}
                    onChange={(e) => setConfig({...config, mode: e.target.value as StorytellingConfig['mode']})}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                  >
                    <option value="dramatic">Dramatic</option>
                    <option value="analytical">Analytical</option>
                    <option value="historical">Historical</option>
                    <option value="poetic">Poetic (Premium)</option>
                    <option value="humorous">Humorous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Emotional Intensity
                  </label>
                  <select
                    value={config.emotionalIntensity}
                    onChange={(e) => setConfig({...config, emotionalIntensity: e.target.value as StorytellingConfig['emotionalIntensity']})}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="extreme">Extreme (Premium)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Audience
                  </label>
                  <select
                    value={config.targetAudience}
                    onChange={(e) => setConfig({...config, targetAudience: e.target.value as StorytellingConfig['targetAudience']})}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                  >
                    <option value="casual">Casual</option>
                    <option value="serious">Serious</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Access Level
                  </label>
                  <select
                    value={config.accessLevel}
                    onChange={(e) => setConfig({...config, accessLevel: e.target.value as StorytellingConfig['accessLevel']})}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                  >
                    <option value="freemium">Freemium</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.includeAlternateEndings}
                      onChange={(e) => setConfig({...config, includeAlternateEndings: e.target.checked})}
                      className="rounded"
                      disabled={config.accessLevel === 'freemium'}
                    />
                    <span className={`${config.accessLevel === 'freemium' ? 'text-gray-500' : 'text-gray-300'}`}>
                      Include Alternate Endings (Premium)
                    </span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.historicalContext}
                      onChange={(e) => setConfig({...config, historicalContext: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-gray-300">Include Historical Context</span>
                  </label>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !pgn.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? 'Generating Story...' : 'Generate Article'}
                </Button>

                {error && (
                  <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-300">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
              <h2 className="text-2xl font-semibold text-white mb-6">Generated Article</h2>
              
              {generatedArticle ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{generatedArticle.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                      <span>Words: {generatedArticle.metadata.wordCount}</span>
                      <span>Reading: {generatedArticle.metadata.readingTime}min</span>
                      <span>Difficulty: {generatedArticle.metadata.difficulty}</span>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                      {generatedArticle.content}
                    </div>
                  </div>

                  {generatedArticle.alternateEndings && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Alternate Endings</h4>
                      <div className="space-y-2">
                        {generatedArticle.alternateEndings.map((ending, index) => (
                          <div key={index} className="p-3 bg-slate-700/50 rounded text-gray-300 text-sm">
                            {ending}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {generatedArticle.historicalContext && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Historical Context</h4>
                      <div className="p-3 bg-slate-700/50 rounded text-gray-300 text-sm">
                        {generatedArticle.historicalContext}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {generatedArticle.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {generatedArticle.voiceNarrationUrl && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Voice Narration</h4>
                      <audio controls className="w-full">
                        <source src={generatedArticle.voiceNarrationUrl} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  Enter a PGN and configure your storytelling preferences to generate an AI-powered chess article
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

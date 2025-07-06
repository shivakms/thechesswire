'use client';

import React, { useState } from 'react';
import { ContentAnalysisResult } from '@/lib/analysis/ContentAnalysisPipeline';

export default function EnhancedAnalysisPage() {
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'pgn' | 'article' | 'voice' | 'video'>('pgn');
  const [analysis, setAnalysis] = useState<ContentAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!content.trim()) {
      setError('Please enter content to analyze');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analysis/enhanced-pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          contentType,
          config: {
            includeEmotionalAnalysis: true,
            includeQualityScoring: true,
            includeRecommendations: true,
            voiceAnalysis: true,
            socialOptimization: true
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4">
            Enhanced Content Analysis
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Advanced AI-powered content analysis with emotional profiling, quality scoring, and optimization recommendations
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">Content Input</h2>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as any)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-purple-500 focus:outline-none"
              >
                <option value="pgn">PGN (Chess Game)</option>
                <option value="article">Article</option>
                <option value="voice">Voice Script</option>
                <option value="video">Video Script</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Enter your ${contentType} content here...`}
                className="w-full h-64 bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
              />
              <div className="text-sm text-gray-400 mt-2">
                {content.length}/100,000 characters
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !content.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Analyzing...' : 'Analyze Content'}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-900/50 border border-red-600/50 rounded-lg text-red-300">
                {error}
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">Analysis Results</h2>
            
            {!analysis ? (
              <div className="text-center text-gray-400 py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p>Enter content and click "Analyze Content" to see results</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Emotional Profile */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">Emotional Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Dominant Emotion</div>
                      <div className="text-white font-medium capitalize">{analysis.emotionalProfile.dominantEmotion}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Intensity</div>
                      <div className="text-white font-medium">{(analysis.emotionalProfile.intensity * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Sentiment Score</div>
                      <div className="text-white font-medium">{analysis.emotionalProfile.sentimentScore.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Engagement Prediction</div>
                      <div className="text-white font-medium">{(analysis.emotionalProfile.engagementPrediction * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>

                {/* Quality Score */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Quality Assessment</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">Overall Quality Score</div>
                      <div className="w-full bg-gray-600 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${analysis.qualityScore * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {(analysis.qualityScore * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-400 mb-3">Content Metadata</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Word Count</div>
                      <div className="text-white">{analysis.metadata.wordCount || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Estimated Duration</div>
                      <div className="text-white">{analysis.metadata.duration || 'N/A'}s</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Complexity</div>
                      <div className="text-white capitalize">{analysis.metadata.complexity}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Viral Potential</div>
                      <div className="text-white">{(analysis.metadata.viralPotential * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                  
                  {analysis.metadata.topics.length > 0 && (
                    <div className="mt-4">
                      <div className="text-gray-400 text-sm mb-2">Topics</div>
                      <div className="flex flex-wrap gap-2">
                        {analysis.metadata.topics.map((topic, index) => (
                          <span key={index} className="bg-purple-600/30 text-purple-300 px-2 py-1 rounded text-xs">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                {analysis.recommendations.length > 0 && (
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-3">Recommendations</h3>
                    <div className="space-y-3">
                      {analysis.recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="bg-gray-600/50 rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-yellow-300 text-sm font-medium capitalize">
                              {rec.type.replace('_', ' ')}
                            </span>
                            <span className="text-gray-400 text-xs">
                              {(rec.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                          <div className="text-white text-sm mb-1">{rec.suggestion}</div>
                          <div className="text-gray-400 text-xs">{rec.reasoning}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

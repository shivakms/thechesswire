"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  YouTubeDocumentaryGenerator, 
  DocumentaryConfig, 
  YouTubeDocumentary 
} from '@/lib/video/YouTubeDocumentaryGenerator';
import { YouTubeUploader, YouTubeUploadResult } from '@/lib/video/YouTubeUploader';

interface DocumentaryStudioProps {
  onDocumentaryGenerated?: (documentary: YouTubeDocumentary) => void;
  onUploadComplete?: (result: YouTubeUploadResult) => void;
}

export default function YouTubeDocumentaryStudio({ 
  onDocumentaryGenerated, 
  onUploadComplete 
}: DocumentaryStudioProps) {
  const [pgn, setPgn] = useState('');
  const [config, setConfig] = useState<DocumentaryConfig>({
    narrationStyle: 'dramaticNarrator',
    includeAnalysis: true,
    includeMoveAnnotations: true,
    maxDuration: 180,
    thumbnail: {
      template: 'dramatic'
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentDocumentary, setCurrentDocumentary] = useState<YouTubeDocumentary | null>(null);
  const [uploadResult, setUploadResult] = useState<YouTubeUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateDocumentary = useCallback(async () => {
    if (!pgn.trim()) {
      setError('Please enter a valid PGN');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/video/generate-documentary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pgn, config }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate documentary');
      }

      if (data.success && data.documentary) {
        setCurrentDocumentary(data.documentary);
        onDocumentaryGenerated?.(data.documentary);
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate documentary');
    } finally {
      setIsGenerating(false);
    }
  }, [pgn, config, onDocumentaryGenerated]);

  const handleUploadToYouTube = useCallback(async () => {
    if (!currentDocumentary) {
      setError('No documentary to upload');
      return;
    }

    setIsUploading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/video/upload-youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentaryId: currentDocumentary.id,
          uploadConfig: {
            privacy: 'public',
            categoryId: '22'
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload to YouTube');
      }

      if (data.success && data.result) {
        setUploadResult(data.result);
        onUploadComplete?.(data.result);
        
        setCurrentDocumentary(prev => prev ? {
          ...prev,
          status: 'uploaded',
          youtubeId: data.result.videoId
        } : null);
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload to YouTube');
    } finally {
      setIsUploading(false);
    }
  }, [currentDocumentary, onUploadComplete]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 mb-4">
          🎬 YouTube Auto-Documentaries
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Transform chess games into cinematic documentaries with Bambai AI narration
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="p-6 bg-gray-900/50 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">📝 Game Input</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                PGN (Portable Game Notation)
              </label>
              <textarea
                value={pgn}
                onChange={(e) => setPgn(e.target.value)}
                placeholder="1. e4 e5 2. Nf3 Nc6 3. Bb5 a6..."
                className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Narration Style
                </label>
                <select
                  value={config.narrationStyle}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    narrationStyle: e.target.value as DocumentaryConfig['narrationStyle']
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="wiseMentor">Wise Mentor</option>
                  <option value="enthusiasticCommentator">Enthusiastic Commentator</option>
                  <option value="dramaticNarrator">Dramatic Narrator</option>
                  <option value="poeticStoryteller">Poetic Storyteller</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Duration (seconds)
                </label>
                <input
                  type="number"
                  value={config.maxDuration}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    maxDuration: parseInt(e.target.value) || 180
                  }))}
                  min="60"
                  max="600"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Thumbnail Template
                </label>
                <select
                  value={config.thumbnail?.template || 'dramatic'}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    thumbnail: { 
                      ...prev.thumbnail, 
                      template: e.target.value as DocumentaryConfig['thumbnail']['template']
                    }
                  }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="dramatic">Dramatic</option>
                  <option value="tactical">Tactical</option>
                  <option value="endgame">Endgame</option>
                  <option value="opening">Opening</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleGenerateDocumentary}
                  disabled={isGenerating || !pgn.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isGenerating ? '🎬 Generating...' : '🎬 Generate Documentary'}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.includeAnalysis}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    includeAnalysis: e.target.checked
                  }))}
                  className="mr-2"
                />
                Include Analysis
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.includeMoveAnnotations}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    includeMoveAnnotations: e.target.checked
                  }))}
                  className="mr-2"
                />
                Move Annotations
              </label>
            </div>
          </div>
        </Card>

        {/* Preview Section */}
        <Card className="p-6 bg-gray-900/50 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">🎥 Documentary Preview</h2>
          
          {currentDocumentary ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{currentDocumentary.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{currentDocumentary.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentDocumentary.tags.slice(0, 6).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white ml-2">{formatDuration(currentDocumentary.totalDuration)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Segments:</span>
                    <span className="text-white ml-2">{currentDocumentary.segments.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <Badge 
                      variant={currentDocumentary.status === 'ready' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {currentDocumentary.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-400">Peak Moments:</span>
                    <span className="text-white ml-2">{currentDocumentary.metadata.emotionalProfile.peakMoments.length}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-md font-semibold text-white mb-2">Segments</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentDocumentary.segments.map((segment, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300 capitalize">{segment.type}</span>
                      <span className="text-gray-400">{formatDuration(segment.duration)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleUploadToYouTube}
                  disabled={isUploading || currentDocumentary.status !== 'ready'}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isUploading ? '📤 Uploading...' : '📤 Upload to YouTube'}
                </Button>
                
                <Button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(currentDocumentary, null, 2)], {
                      type: 'application/json'
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `documentary_${currentDocumentary.id}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  variant="secondary"
                  className="px-4"
                >
                  💾
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <div className="text-6xl mb-4">🎬</div>
              <p>Generate a documentary to see the preview</p>
            </div>
          )}
        </Card>
      </div>

      {/* Upload Results */}
      {uploadResult && (
        <Card className="p-6 bg-gray-900/50 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">📤 Upload Results</h2>
          
          {uploadResult.success ? (
            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-green-400 text-xl mr-2">✅</span>
                <span className="text-green-400 font-semibold">Upload Successful!</span>
              </div>
              
              {uploadResult.url && (
                <div className="space-y-2">
                  <p className="text-gray-300">
                    <strong>Video URL:</strong>{' '}
                    <a 
                      href={uploadResult.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      {uploadResult.url}
                    </a>
                  </p>
                  <p className="text-gray-300">
                    <strong>Video ID:</strong> {uploadResult.videoId}
                  </p>
                  <p className="text-gray-300">
                    <strong>Upload Time:</strong> {uploadResult.uploadTime?.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-red-400 text-xl mr-2">❌</span>
                <span className="text-red-400 font-semibold">Upload Failed</span>
              </div>
              <p className="text-gray-300">{uploadResult.error}</p>
            </div>
          )}
        </Card>
      )}

      {/* Features Info */}
      <Card className="p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <h2 className="text-2xl font-bold text-white mb-4">✨ Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <span className="text-purple-400">🎭</span>
            <div>
              <strong className="text-white">Emotion-Based Titles</strong>
              <p className="text-gray-300">AI generates engaging titles based on game emotions</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-400">🎨</span>
            <div>
              <strong className="text-white">Auto Thumbnails</strong>
              <p className="text-gray-300">Dramatic thumbnails from peak game moments</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-400">🗣️</span>
            <div>
              <strong className="text-white">Bambai AI Narration</strong>
              <p className="text-gray-300">Soulful, expressive voice brings games to life</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-400">📊</span>
            <div>
              <strong className="text-white">Smart Segmentation</strong>
              <p className="text-gray-300">Automatic intro, game phases, and conclusion</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-red-400">🎯</span>
            <div>
              <strong className="text-white">Auto Upload</strong>
              <p className="text-gray-300">Direct publishing to YouTube with metadata</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-indigo-400">🔄</span>
            <div>
              <strong className="text-white">End-to-End Automation</strong>
              <p className="text-gray-300">From PGN to published documentary in minutes</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

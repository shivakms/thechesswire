'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../../src/components/ui/Button';
import Input from '../../../src/components/ui/Input';
import Textarea from '../../../src/components/ui/Textarea';
import InteractiveChessboard from '../../../src/components/chess/InteractiveChessboard';
import { PGNAnalyzer, PGNAnalysis } from '../../../src/lib/chess/PGNAnalyzer';

interface ArticleData {
  title: string;
  content: string;
  pgn: string;
  tags: string[];
  accessLevel: 'freemium' | 'premium';
  voiceNarration?: boolean;
  aiEnhancement?: boolean;
}

export default function CreateArticlePage() {
  const router = useRouter();
  const [articleData, setArticleData] = useState<ArticleData>({
    title: '',
    content: '',
    pgn: '',
    tags: [],
    accessLevel: 'freemium',
    voiceNarration: false,
    aiEnhancement: false
  });
  const [pgnAnalysis, setPgnAnalysis] = useState<PGNAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const pgnAnalyzer = new PGNAnalyzer();

  useEffect(() => {
    if (articleData.pgn.trim()) {
      analyzePGN();
    } else {
      setPgnAnalysis(null);
    }
  }, [articleData.pgn]);

  const analyzePGN = async () => {
    if (!articleData.pgn.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await pgnAnalyzer.analyzePGN(articleData.pgn);
      setPgnAnalysis(analysis);
      
      if (analysis.isValid) {
        const suggestedTags = [
          ...analysis.analysis.tacticalThemes,
          analysis.analysis.difficultyLevel,
          analysis.gameInfo.white ? `${analysis.gameInfo.white}` : '',
          analysis.gameInfo.black ? `${analysis.gameInfo.black}` : ''
        ].filter(Boolean);
        
        setArticleData(prev => ({
          ...prev,
          tags: [...new Set([...prev.tags, ...suggestedTags])]
        }));
      }
    } catch (error) {
      console.error('PGN analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      setError('Failed to access microphone');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const enhanceWithAI = async () => {
    if (!pgnAnalysis || !articleData.content) return;
    
    try {
      const enhancedContent = await pgnAnalyzer.enhanceContentWithAI(
        articleData.content, 
        pgnAnalysis
      );
      setArticleData(prev => ({ ...prev, content: enhancedContent }));
    } catch (error) {
      setError('AI enhancement failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('articleData', JSON.stringify(articleData));
      formData.append('pgnAnalysis', JSON.stringify(pgnAnalysis));
      
      if (audioBlob) {
        formData.append('voiceRecording', audioBlob, 'voice-note.wav');
      }

      const response = await fetch('/api/articles/create', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create article');
      }

      const result = await response.json();
      router.push(`/articles/${result.articleId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Create Chess Article</h1>
          <p className="text-xl text-gray-300">Share your chess insights with AI-powered enhancement</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
              <h2 className="text-2xl font-semibold text-white mb-6">Article Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <Input
                    value={articleData.title}
                    onChange={(e) => setArticleData({...articleData, title: e.target.value})}
                    placeholder="Enter article title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content
                  </label>
                  <Textarea
                    value={articleData.content}
                    onChange={(e) => setArticleData({...articleData, content: e.target.value})}
                    placeholder="Write your chess article..."
                    rows={8}
                    required
                  />
                  
                  <div className="mt-2 flex space-x-2">
                    <Button
                      type="button"
                      onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                      className={`text-sm ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      {isRecording ? '🛑 Stop Recording' : '🎤 Voice Note'}
                    </Button>
                    
                    {pgnAnalysis && (
                      <Button
                        type="button"
                        onClick={enhanceWithAI}
                        className="text-sm bg-purple-600 hover:bg-purple-700"
                      >
                        ✨ AI Enhance
                      </Button>
                    )}
                  </div>
                  
                  {audioBlob && (
                    <div className="mt-2">
                      <audio controls className="w-full">
                        <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
                      </audio>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    PGN (Optional)
                  </label>
                  <Textarea
                    value={articleData.pgn}
                    onChange={(e) => setArticleData({...articleData, pgn: e.target.value})}
                    placeholder="Paste PGN notation here for automatic analysis..."
                    rows={6}
                  />
                  {isAnalyzing && (
                    <div className="mt-2 text-sm text-blue-400">Analyzing PGN...</div>
                  )}
                  {pgnAnalysis && !pgnAnalysis.isValid && (
                    <div className="mt-2 text-sm text-red-400">Invalid PGN format</div>
                  )}
                </div>

                {pgnAnalysis?.isValid && (
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-2">Analysis Results</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Brilliancy Score:</span>
                        <span className="text-yellow-400 ml-2">{pgnAnalysis.analysis.brilliancyScore}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Difficulty:</span>
                        <span className="text-green-400 ml-2">{pgnAnalysis.analysis.difficultyLevel}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Blunders:</span>
                        <span className="text-red-400 ml-2">{pgnAnalysis.analysis.blunderCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Tactics:</span>
                        <span className="text-blue-400 ml-2">{pgnAnalysis.analysis.tacticalThemes.length}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {articleData.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-600 text-white text-sm rounded">
                        {tag}
                        <button
                          type="button"
                          onClick={() => setArticleData(prev => ({
                            ...prev,
                            tags: prev.tags.filter((_, i) => i !== index)
                          }))}
                          className="ml-1 text-purple-200 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <Input
                    placeholder="Add tags..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const tag = input.value.trim();
                        if (tag && !articleData.tags.includes(tag)) {
                          setArticleData(prev => ({
                            ...prev,
                            tags: [...prev.tags, tag]
                          }));
                          input.value = '';
                        }
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Access Level
                  </label>
                  <select
                    value={articleData.accessLevel}
                    onChange={(e) => setArticleData({...articleData, accessLevel: e.target.value as 'freemium' | 'premium'})}
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
                      checked={articleData.voiceNarration}
                      onChange={(e) => setArticleData({...articleData, voiceNarration: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-gray-300">Generate Voice Narration (Premium)</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={articleData.aiEnhancement}
                      onChange={(e) => setArticleData({...articleData, aiEnhancement: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-gray-300">AI Content Enhancement</span>
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-300">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? 'Creating...' : 'Create Article'}
              </Button>
            </div>
          </form>

          <div className="space-y-6">
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
              <h2 className="text-2xl font-semibold text-white mb-6">Chess Board Preview</h2>
              
              {pgnAnalysis?.isValid ? (
                <InteractiveChessboard
                  pgn={articleData.pgn}
                  analysis={pgnAnalysis}
                  showAnnotations={true}
                  accessLevel={articleData.accessLevel}
                />
              ) : (
                <div className="text-center text-gray-400 py-12">
                  Enter a valid PGN to see the chess board preview
                </div>
              )}
            </div>

            {pgnAnalysis?.isValid && (
              <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4">Game Information</h3>
                <div className="space-y-2 text-sm">
                  {pgnAnalysis.gameInfo.white && (
                    <div>
                      <span className="text-gray-400">White:</span>
                      <span className="text-white ml-2">{pgnAnalysis.gameInfo.white}</span>
                    </div>
                  )}
                  {pgnAnalysis.gameInfo.black && (
                    <div>
                      <span className="text-gray-400">Black:</span>
                      <span className="text-white ml-2">{pgnAnalysis.gameInfo.black}</span>
                    </div>
                  )}
                  {pgnAnalysis.gameInfo.result && (
                    <div>
                      <span className="text-gray-400">Result:</span>
                      <span className="text-white ml-2">{pgnAnalysis.gameInfo.result}</span>
                    </div>
                  )}
                  {pgnAnalysis.gameInfo.date && (
                    <div>
                      <span className="text-gray-400">Date:</span>
                      <span className="text-white ml-2">{pgnAnalysis.gameInfo.date}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

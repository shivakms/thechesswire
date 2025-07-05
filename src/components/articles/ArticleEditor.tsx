'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import BambaiNarrator from '../onboarding/BambaiNarrator';

interface ArticleData {
  title: string;
  content: string;
  pgnData: string;
  toneStyle: string;
}

export default function ArticleEditor() {
  const [article, setArticle] = useState<ArticleData>({
    title: '',
    content: '',
    pgnData: '',
    toneStyle: 'neutral'
  });
  
  const [isRecording, setIsRecording] = useState(false);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedPgn, setDetectedPgn] = useState<string>('');
  const [chessPosition, setChessPosition] = useState<string>('start');
  const [showPreview, setShowPreview] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const detectPGN = (text: string): string => {
    const lines = text.split('\n');
    let pgnLines: string[] = [];
    let inPgnSection = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        inPgnSection = true;
        pgnLines.push(trimmed);
        continue;
      }
      
      const movePattern = /^(\d+\.|\d+\.\.\.)?\s*([a-h][1-8]|[KQRBN][a-h]?[1-8]?x?[a-h][1-8]|O-O(-O)?|0-0(-0)?)/;
      if (movePattern.test(trimmed) || inPgnSection) {
        inPgnSection = true;
        pgnLines.push(trimmed);
      } else if (inPgnSection && trimmed === '') {
        pgnLines.push(trimmed);
      } else if (inPgnSection && !trimmed.match(/^[a-zA-Z]/)) {
        pgnLines.push(trimmed);
      } else if (inPgnSection) {
        break;
      }
    }
    
    return pgnLines.length > 0 ? pgnLines.join('\n').trim() : '';
  };

  const updateChessPosition = (pgn: string) => {
    if (!pgn) {
      setChessPosition('start');
      return;
    }
    
    try {
      const game = new Chess();
      const cleanPgn = pgn.replace(/\[.*?\]/g, '').trim();
      
      if (cleanPgn) {
        game.loadPgn(cleanPgn);
        setChessPosition(game.fen());
      }
    } catch (error) {
      console.log('PGN parsing error:', error);
      setChessPosition('start');
    }
  };

  const handleContentChange = (content: string) => {
    setArticle(prev => ({ ...prev, content }));
    
    const detected = detectPGN(content);
    setDetectedPgn(detected);
    setArticle(prev => ({ ...prev, pgnData: detected }));
    updateChessPosition(detected);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'voice-recording.wav', { type: 'audio/wav' });
        setVoiceFile(audioFile);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      BambaiNarrator.speak("Recording started. Share your chess story with passion.", 'calm');
      
    } catch (error) {
      console.error('Recording failed:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      BambaiNarrator.speak("Recording complete. Your voice has been captured.", 'calm');
    }
  };

  const enhanceTone = async (content: string, tone: string): Promise<string> => {
    return content.trim();
  };

  const submitArticle = async () => {
    if (!article.title.trim() || !article.content.trim()) {
      alert('Please provide both title and content');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const enhancedContent = await enhanceTone(article.content, article.toneStyle);
      
      const formData = new FormData();
      formData.append('title', article.title);
      formData.append('content', enhancedContent);
      formData.append('pgnData', article.pgnData);
      formData.append('toneStyle', article.toneStyle);
      
      if (voiceFile) {
        formData.append('voiceRecording', voiceFile);
      }

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: article.title,
          content: enhancedContent,
          pgnData: article.pgnData,
          toneStyle: article.toneStyle,
          voiceRecordingPath: voiceFile ? 'pending-upload' : null
        })
      });

      const result = await response.json();
      
      if (result.success) {
        BambaiNarrator.speak("Your chess story has been published successfully!", 'enthusiastic');
        
        setArticle({ title: '', content: '', pgnData: '', toneStyle: 'neutral' });
        setVoiceFile(null);
        setDetectedPgn('');
        setChessPosition('start');
        
        alert('Article published successfully!');
      } else {
        throw new Error(result.error || 'Failed to publish article');
      }
      
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to publish article. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-2 gap-8"
        >
          {/* Article Editor */}
          <div className="space-y-6">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
                Create Your Chess Story
              </h1>
              
              {/* Title Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Article Title
                </label>
                <input
                  type="text"
                  placeholder="Enter your chess story title..."
                  value={article.title}
                  onChange={(e) => setArticle(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  maxLength={255}
                />
                <div className="text-xs text-gray-400 mt-1">
                  {article.title.length}/255 characters
                </div>
              </div>

              {/* Content Editor */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Chess Story
                </label>
                <textarea
                  placeholder="Write your chess story... PGN notation will be automatically detected and visualized."
                  value={article.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full h-64 p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                  maxLength={50000}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{article.content.length}/50,000 characters</span>
                  {detectedPgn && (
                    <span className="text-green-400">✓ PGN detected</span>
                  )}
                </div>
              </div>

              {/* Tone Style Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Story Tone
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'neutral', label: 'Neutral', desc: 'Balanced and clear' },
                    { value: 'dramatic', label: 'Dramatic', desc: 'Intense and emotional' },
                    { value: 'humorous', label: 'Humorous', desc: 'Light and entertaining' },
                    { value: 'analytical', label: 'Analytical', desc: 'Technical and precise' }
                  ].map((tone) => (
                    <button
                      key={tone.value}
                      onClick={() => setArticle(prev => ({ ...prev, toneStyle: tone.value }))}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        article.toneStyle === tone.value
                          ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                          : 'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-medium">{tone.label}</div>
                      <div className="text-xs opacity-70">{tone.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Recording */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Voice Recording (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isRecording ? '⏹ Stop Recording' : '🎤 Record Voice'}
                  </button>
                  
                  {voiceFile && (
                    <div className="flex items-center gap-2 text-green-400">
                      <span>✓</span>
                      <span className="text-sm">Recording saved ({(voiceFile.size / 1024).toFixed(1)}KB)</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Record your voice to add personal narration to your chess story
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={submitArticle}
                disabled={isSubmitting || !article.title.trim() || !article.content.trim()}
                className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] disabled:scale-100"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Chess Story'}
              </button>
            </div>
          </div>

          {/* Chess Visualization & Preview */}
          <div className="space-y-6">
            {/* Chess Board */}
            {detectedPgn && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
              >
                <h3 className="text-xl font-bold text-white mb-4">Chess Position</h3>
                <div className="flex justify-center">
                  <Chessboard
                    position={chessPosition}
                    boardWidth={400}
                    arePiecesDraggable={false}
                  />
                </div>
              </motion.div>
            )}

            {/* PGN Display */}
            {detectedPgn && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
              >
                <h3 className="text-xl font-bold text-white mb-4">Detected PGN</h3>
                <pre className="text-sm text-gray-300 bg-gray-800/50 p-4 rounded-lg overflow-auto max-h-48 font-mono">
                  {detectedPgn}
                </pre>
              </motion.div>
            )}

            {/* Article Preview */}
            {article.title && article.content && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
              >
                <h3 className="text-xl font-bold text-white mb-4">Preview</h3>
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-purple-300">
                    {article.title}
                  </h4>
                  <div className="text-sm text-gray-300 bg-gray-800/50 p-4 rounded-lg max-h-32 overflow-auto">
                    {article.content.substring(0, 300)}
                    {article.content.length > 300 && '...'}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded">
                      {article.toneStyle}
                    </span>
                    {detectedPgn && (
                      <span className="px-2 py-1 bg-green-600/20 text-green-300 rounded">
                        PGN Included
                      </span>
                    )}
                    {voiceFile && (
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded">
                        Voice Recording
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

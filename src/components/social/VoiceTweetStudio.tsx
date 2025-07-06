
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';

interface TweetableStory {
  id: string;
  text: string;
  hashtags: string[];
  emotion: string;
  audioUrl?: string;
  imageUrl?: string;
  pgn?: string;
  createdAt: Date;
}

interface VoiceTweetStudioProps {
  className?: string;
}

export const VoiceTweetStudio: React.FC<VoiceTweetStudioProps> = ({ className }) => {
  const [pgn, setPgn] = useState('');
  const [story, setStory] = useState<TweetableStory | null>(null);
  const [thread, setThread] = useState<TweetableStory[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [options, setOptions] = useState({
    includeAudio: true,
    includeImage: true,
    maxLength: 240,
    threadMode: false,
    maxTweets: 5
  });

  const handleGenerateSingle = async () => {
    if (!pgn.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/social/generate-voicetweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pgn,
          options: {
            maxLength: options.maxLength,
            includeAudio: options.includeAudio,
            includeImage: options.includeImage
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setStory(data.story);
        setThread([]);
      } else {
        console.error('Generation failed:', data.error);
      }
    } catch (error) {
      console.error('Failed to generate voice tweet:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateThread = async () => {
    if (!pgn.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/social/generate-thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pgn,
          options: {
            maxTweets: options.maxTweets,
            includeAudio: options.includeAudio,
            includeImages: options.includeImage
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setThread(data.thread);
        setStory(null);
      } else {
        console.error('Thread generation failed:', data.error);
      }
    } catch (error) {
      console.error('Failed to generate Twitter thread:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    const stories = story ? [story] : thread;
    if (stories.length === 0) return;

    setIsPublishing(true);
    try {
      const response = await fetch('/api/social/publish-twitter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stories,
          options: {
            scheduleDelay: 5000, // 5 second delay between tweets
            replyChain: true
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('Published successfully:', data.tweetIds);
        setStory(null);
        setThread([]);
        setPgn('');
      } else {
        console.error('Publishing failed:', data.error);
      }
    } catch (error) {
      console.error('Failed to publish:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const renderStory = (story: TweetableStory, index?: number) => (
    <Card key={story.id} className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {index !== undefined ? `Tweet ${index + 1}` : 'Generated Tweet'}
          </span>
          <Badge variant="secondary">{story.emotion}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-800 leading-relaxed">{story.text}</p>
          
          {story.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {story.hashtags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-blue-600">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex gap-4 text-sm text-gray-600">
            {story.audioUrl && (
              <span className="flex items-center gap-1">
                🎵 Voice Audiogram
              </span>
            )}
            {story.imageUrl && (
              <span className="flex items-center gap-1">
                🖼️ Quote Image
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          VoiceTweet Echo Studio
        </h1>
        <p className="text-gray-600">
          Transform chess games into viral Twitter content with Bambai AI narration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chess Game Input</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PGN (Portable Game Notation)
                  </label>
                  <textarea
                    value={pgn}
                    onChange={(e) => setPgn(e.target.value)}
                    placeholder="1. e4 e5 2. Nf3 Nc6 3. Bb5..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Length
                    </label>
                    <input
                      type="number"
                      value={options.maxLength}
                      onChange={(e) => setOptions(prev => ({ ...prev, maxLength: parseInt(e.target.value) }))}
                      min="100"
                      max="280"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Tweets (Thread)
                    </label>
                    <input
                      type="number"
                      value={options.maxTweets}
                      onChange={(e) => setOptions(prev => ({ ...prev, maxTweets: parseInt(e.target.value) }))}
                      min="2"
                      max="10"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.includeAudio}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeAudio: e.target.checked }))}
                      className="mr-2"
                    />
                    Include Voice Audiogram
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.includeImage}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeImage: e.target.checked }))}
                      className="mr-2"
                    />
                    Include Quote Image
                  </label>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleGenerateSingle}
                    disabled={isGenerating || !pgn.trim()}
                    className="flex-1"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Single Tweet'}
                  </Button>
                  <Button
                    onClick={handleGenerateThread}
                    disabled={isGenerating || !pgn.trim()}
                    variant="secondary"
                    className="flex-1"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Thread'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {(story || thread.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Generated Content</span>
                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {isPublishing ? 'Publishing...' : 'Publish to Twitter'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  {story && renderStory(story)}
                  {thread.map((tweetStory, index) => renderStory(tweetStory, index))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Emotion-based story generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Bambai AI voice narration</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Automatic hashtag generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>Voice audiogram creation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span>Quote image with chess position</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span>Twitter thread optimization</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VoiceTweetStudio;

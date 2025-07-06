'use client';

import React, { useState, useEffect } from 'react';
import { SocialMediaManager, ContentPost, SocialPlatform } from '@/lib/social/SocialMediaManager';
import { ContentScheduler } from '@/lib/social/ContentScheduler';
import Button from '@/components/ui/Button';

interface SocialStudioProps {
  className?: string;
}

export default function SocialStudio({ className = '' }: SocialStudioProps) {
  const [socialManager] = useState(() => new SocialMediaManager());
  const [scheduler] = useState(() => new ContentScheduler());
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [contentQueue, setContentQueue] = useState<ContentPost[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'schedule' | 'analytics' | 'settings'>('create');
  
  const [gameData, setGameData] = useState({
    pgn: '',
    title: '',
    description: '',
    includeAnalysis: true,
    includeVideo: false
  });

  const [schedulingStrategy, setSchedulingStrategy] = useState('maximum_reach');
  const [customScheduleTime, setCustomScheduleTime] = useState('');

  useEffect(() => {
    setPlatforms(socialManager.getPlatforms());
    setContentQueue(socialManager.getContentQueue());
  }, [socialManager]);

  const handlePlatformToggle = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;

    if (platform.enabled) {
      socialManager.disablePlatform(platformId);
      setSelectedPlatforms(prev => prev.filter(id => id !== platformId));
    } else {
      socialManager.enablePlatform(platformId);
      setSelectedPlatforms(prev => [...prev, platformId]);
    }
    
    setPlatforms(socialManager.getPlatforms());
  };

  const handleCreateContent = async () => {
    if (!gameData.pgn.trim()) {
      alert('Please enter a valid PGN');
      return;
    }

    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    try {
      const post = await socialManager.createContentFromGame(gameData.pgn, {
        title: gameData.title,
        description: gameData.description,
        targetPlatforms: selectedPlatforms,
        includeAnalysis: gameData.includeAnalysis,
        includeVideo: gameData.includeVideo
      });

      setContentQueue(socialManager.getContentQueue());
      
      setGameData({
        pgn: '',
        title: '',
        description: '',
        includeAnalysis: true,
        includeVideo: false
      });

      alert(`Content created successfully! Post ID: ${post.id}`);
    } catch (error) {
      alert(`Error creating content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSchedulePost = async (postId: string) => {
    const post = contentQueue.find(p => p.id === postId);
    if (!post) return;

    try {
      let scheduledTime: Date;
      
      if (customScheduleTime) {
        scheduledTime = new Date(customScheduleTime);
      } else {
        scheduledTime = scheduler.getOptimalPostTime(
          post.platforms,
          'highlights', // Default content type
          schedulingStrategy
        );
      }

      await socialManager.schedulePost(postId, scheduledTime);
      setContentQueue(socialManager.getContentQueue());
      
      alert(`Post scheduled for ${scheduledTime.toLocaleString()}`);
    } catch (error) {
      alert(`Error scheduling post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePublishPost = async (postId: string) => {
    try {
      const result = await socialManager.publishPost(postId);
      setContentQueue(socialManager.getContentQueue());
      
      const successCount = result.results.filter(r => r.success).length;
      const totalCount = result.results.length;
      
      alert(`Published to ${successCount}/${totalCount} platforms successfully`);
    } catch (error) {
      alert(`Error publishing post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const renderCreateTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Create Content from Chess Game</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Game PGN *
            </label>
            <textarea
              value={gameData.pgn}
              onChange={(e) => setGameData(prev => ({ ...prev, pgn: e.target.value }))}
              placeholder="Paste your PGN here..."
              className="w-full h-32 px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom Title (optional)
              </label>
              <input
                type="text"
                value={gameData.title}
                onChange={(e) => setGameData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Auto-generated if empty"
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom Description (optional)
              </label>
              <input
                type="text"
                value={gameData.description}
                onChange={(e) => setGameData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Auto-generated if empty"
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={gameData.includeAnalysis}
                onChange={(e) => setGameData(prev => ({ ...prev, includeAnalysis: e.target.checked }))}
                className="rounded border-gray-600 bg-gray-900/50 text-purple-500 focus:ring-purple-500"
              />
              Include Analysis
            </label>

            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={gameData.includeVideo}
                onChange={(e) => setGameData(prev => ({ ...prev, includeVideo: e.target.checked }))}
                className="rounded border-gray-600 bg-gray-900/50 text-purple-500 focus:ring-purple-500"
              />
              Generate Video
            </label>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Select Platforms</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {platforms.map(platform => (
            <label
              key={platform.id}
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedPlatforms.includes(platform.id)
                  ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                  : 'border-gray-600 bg-gray-900/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedPlatforms.includes(platform.id)}
                onChange={() => {
                  if (selectedPlatforms.includes(platform.id)) {
                    setSelectedPlatforms(prev => prev.filter(id => id !== platform.id));
                  } else {
                    setSelectedPlatforms(prev => [...prev, platform.id]);
                  }
                }}
                className="sr-only"
              />
              <span className="font-medium">{platform.name}</span>
            </label>
          ))}
        </div>
      </div>

      <Button
        onClick={handleCreateContent}
        disabled={!gameData.pgn.trim() || selectedPlatforms.length === 0}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        Create Content
      </Button>
    </div>
  );

  const renderScheduleTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Scheduling Strategy</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Strategy
            </label>
            <select
              value={schedulingStrategy}
              onChange={(e) => setSchedulingStrategy(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="maximum_reach">Maximum Reach</option>
              <option value="engagement_focused">Engagement Focused</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Schedule Time (optional)
            </label>
            <input
              type="datetime-local"
              value={customScheduleTime}
              onChange={(e) => setCustomScheduleTime(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Content Queue</h3>
        
        <div className="space-y-3">
          {contentQueue.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No content in queue. Create some content first!</p>
          ) : (
            contentQueue.map(post => (
              <div key={post.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white">{post.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    post.status === 'published' ? 'bg-green-500/20 text-green-400' :
                    post.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                    post.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {post.status}
                  </span>
                </div>
                
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">{post.content}</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {post.platforms.map(platformId => (
                      <span key={platformId} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                        {platforms.find(p => p.id === platformId)?.name || platformId}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    {post.status === 'draft' && (
                      <Button
                        onClick={() => handleSchedulePost(post.id)}
                        size="sm"
                        variant="secondary"
                      >
                        Schedule
                      </Button>
                    )}
                    
                    {(post.status === 'draft' || post.status === 'scheduled') && (
                      <Button
                        onClick={() => handlePublishPost(post.id)}
                        size="sm"
                      >
                        Publish Now
                      </Button>
                    )}
                  </div>
                </div>
                
                {post.scheduledTime && (
                  <p className="text-xs text-gray-400 mt-2">
                    Scheduled for: {post.scheduledTime.toLocaleString()}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Publishing Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-1">Total Posts</h4>
            <p className="text-2xl font-bold text-white">{contentQueue.length}</p>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-1">Published</h4>
            <p className="text-2xl font-bold text-green-400">
              {contentQueue.filter(p => p.status === 'published').length}
            </p>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-1">Scheduled</h4>
            <p className="text-2xl font-bold text-blue-400">
              {contentQueue.filter(p => p.status === 'scheduled').length}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Platform Performance</h4>
          
          {platforms.map(platform => {
            const platformPosts = contentQueue.filter(post => 
              post.platforms.includes(platform.id) && post.status === 'published'
            );
            
            return (
              <div key={platform.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{platform.name}</span>
                  <span className="text-gray-400">{platformPosts.length} posts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Platform Settings</h3>
        
        <div className="space-y-4">
          {platforms.map(platform => (
            <div key={platform.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-white">{platform.name}</h4>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={platform.enabled}
                    onChange={() => handlePlatformToggle(platform.id)}
                    className="rounded border-gray-600 bg-gray-900/50 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-gray-300">Enabled</span>
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                <div>
                  <span className="font-medium">Max Length:</span> {platform.limits.maxLength}
                </div>
                <div>
                  <span className="font-medium">Max Hashtags:</span> {platform.limits.maxHashtags}
                </div>
                <div>
                  <span className="font-medium">Video:</span> {platform.features.supportsVideo ? '✓' : '✗'}
                </div>
                <div>
                  <span className="font-medium">Scheduling:</span> {platform.features.supportsScheduling ? '✓' : '✗'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4">
            Social Media Studio
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Automate your chess content across 12+ social media platforms with intelligent scheduling and optimization
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 rounded-xl p-1 border border-gray-700/50">
            {[
              { id: 'create', label: 'Create Content' },
              { id: 'schedule', label: 'Schedule & Queue' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'settings', label: 'Settings' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'create' | 'schedule' | 'analytics' | 'settings')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'create' && renderCreateTab()}
          {activeTab === 'schedule' && renderScheduleTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { soulCinemaRenderer, VideoConfig, RenderOptions } from '@/lib/video/SoulCinemaRenderer';
import { createAutoUploader, UploadCredentials, VideoUploadOptions } from '@/lib/video/AutoUploader';
import { shortFormGenerator, ShortFormOptions } from '@/lib/video/ShortFormGenerator';

interface SoulCinemaStudioProps {
  className?: string;
}

interface RenderJob {
  id: string;
  title: string;
  status: 'pending' | 'rendering' | 'uploading' | 'completed' | 'failed';
  progress: number;
  pgn: string;
  config: VideoConfig;
  outputPath?: string;
  uploadResults?: Array<{ platform: string; success: boolean; url?: string }>;
  error?: string;
}

export default function SoulCinemaStudio({ className = '' }: SoulCinemaStudioProps) {
  const [pgn, setPgn] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'horizontal' | 'vertical'>('horizontal');
  const [voiceNarration, setVoiceNarration] = useState(true);
  const [emotionalHighlights, setEmotionalHighlights] = useState(true);
  const [autoUpload, setAutoUpload] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['youtube']);
  const [renderJobs, setRenderJobs] = useState<RenderJob[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultConfigs = soulCinemaRenderer.getDefaultConfigs();

  const samplePgn = `[Event "World Championship"]
[Site "New York"]
[Date "2024.01.15"]
[Round "1"]
[White "Magnus Carlsen"]
[Black "Ding Liren"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. c4 c6 12. cxb5 axb5 13. Nc3 Bb7 14. Bg5 b4 15. Nb1 h6 16. Bh4 c5 17. dxe5 Nxe5 18. Nxe5 dxe5 19. Bxf6 Bxf6 20. Nd2 Re8 21. Qf3 Be7 22. Rad1 Qc7 23. Ne4 Rad8 24. Rxd8 Rxd8 25. Qg3 f5 26. Ng5 e4 27. Nxe4 fxe4 28. Qg4 Rf8 29. Qxe4 Bxe4 30. Rxe4 Qd6 31. f4 Qd1+ 32. Kh2 Qd6 33. g3 Bd8 34. Kg2 Bb6 35. Re2 Qd4 36. Kf3 Qd1 37. Kg2 Qd4 38. Kf3 Qd1 39. Kg4 1-0`;

  useEffect(() => {
    if (!pgn) {
      setPgn(samplePgn);
      setTitle('World Championship Masterpiece');
      setDescription('A brilliant game from the World Championship featuring tactical fireworks and precise endgame technique.');
    }
  }, []);

  const validatePgn = (pgnText: string): boolean => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgnText);
      return true;
    } catch {
      return false;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.pgn')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (validatePgn(content)) {
          setPgn(content);
          
          const lines = content.split('\n');
          const eventLine = lines.find(line => line.startsWith('[Event'));
          const whiteLine = lines.find(line => line.startsWith('[White'));
          const blackLine = lines.find(line => line.startsWith('[Black'));
          
          if (eventLine && whiteLine && blackLine) {
            const event = eventLine.match(/\[Event "(.+)"\]/)?.[1] || 'Chess Game';
            const white = whiteLine.match(/\[White "(.+)"\]/)?.[1] || 'Player 1';
            const black = blackLine.match(/\[Black "(.+)"\]/)?.[1] || 'Player 2';
            
            setTitle(`${event}: ${white} vs ${black}`);
            setDescription(`Chess game analysis featuring ${white} vs ${black}. Powered by TheChessWire.news SoulCinema.`);
          }
        } else {
          alert('Invalid PGN file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const startRender = async () => {
    if (!validatePgn(pgn)) {
      alert('Please enter a valid PGN');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setIsRendering(true);

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const config = selectedFormat === 'horizontal' ? defaultConfigs.horizontal : defaultConfigs.vertical;
    
    const newJob: RenderJob = {
      id: jobId,
      title,
      status: 'pending',
      progress: 0,
      pgn,
      config
    };

    setRenderJobs(prev => [newJob, ...prev]);

    try {
      updateJobStatus(jobId, 'rendering', 10);

      const renderOptions: RenderOptions = {
        pgn,
        title,
        description,
        voiceNarration,
        emotionalHighlights,
        outputPath: `/tmp/soulcinema_${jobId}.mp4`,
        config
      };

      updateJobStatus(jobId, 'rendering', 30);

      const renderResult = await soulCinemaRenderer.renderVideo(renderOptions);

      if (!renderResult.success) {
        throw new Error('Render failed');
      }

      updateJobStatus(jobId, 'rendering', 70);

      let uploadResults: Array<{ platform: string; success: boolean; url?: string }> = [];

      if (autoUpload && selectedPlatforms.length > 0) {
        updateJobStatus(jobId, 'uploading', 80);

        const credentials: UploadCredentials = {
          youtube: {
            clientId: 'demo_client_id',
            clientSecret: 'demo_client_secret',
            refreshToken: 'demo_refresh_token'
          },
          tiktok: {
            accessToken: 'demo_access_token',
            openId: 'demo_open_id'
          },
          instagram: {
            accessToken: 'demo_instagram_token',
            userId: 'demo_user_id'
          },
          twitter: {
            apiKey: 'demo_api_key',
            apiSecret: 'demo_api_secret',
            accessToken: 'demo_access_token',
            accessTokenSecret: 'demo_access_token_secret'
          }
        };

        const uploader = createAutoUploader(credentials);
        const uploadOptions: VideoUploadOptions = {
          filePath: renderResult.outputPath,
          title,
          description,
          tags: renderResult.metadata.tags,
          privacy: 'public'
        };

        const platformUploads = selectedPlatforms.map(platform => {
          switch (platform) {
            case 'youtube': return uploader.uploadToYouTube(uploadOptions);
            case 'tiktok': return uploader.uploadToTikTok(uploadOptions);
            case 'instagram': return uploader.uploadToInstagram(uploadOptions);
            case 'twitter': return uploader.uploadToTwitter(uploadOptions);
            default: return Promise.resolve({ platform, success: false, error: 'Unknown platform' });
          }
        });

        const results = await Promise.all(platformUploads);
        uploadResults = results;

        updateJobStatus(jobId, 'uploading', 95);
      }

      setRenderJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              status: 'completed', 
              progress: 100, 
              outputPath: renderResult.outputPath,
              uploadResults 
            }
          : job
      ));

    } catch (error) {
      console.error('Render failed:', error);
      setRenderJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              status: 'failed', 
              error: error instanceof Error ? error.message : 'Unknown error' 
            }
          : job
      ));
    } finally {
      setIsRendering(false);
    }
  };

  const updateJobStatus = (jobId: string, status: RenderJob['status'], progress: number) => {
    setRenderJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status, progress } : job
    ));
  };

  const generateShortForm = async (job: RenderJob) => {
    if (!job.outputPath) return;

    try {
      const shortFormOptions: ShortFormOptions = {
        inputPath: job.outputPath,
        outputPath: job.outputPath.replace('.mp4', '_short.mp4'),
        maxDuration: 60,
        format: 'vertical',
        highlights: 'auto',
        subtitles: true,
        branding: true
      };

      const result = await shortFormGenerator.generateShortForm(shortFormOptions);
      
      if (result.success) {
        console.log('✅ Short-form video generated:', result.outputPath);
        alert(`Short-form video generated successfully!\nDuration: ${result.duration}s\nHighlights: ${result.highlights.length}`);
      } else {
        alert('Failed to generate short-form video');
      }
    } catch (error) {
      console.error('Short-form generation failed:', error);
      alert('Failed to generate short-form video');
    }
  };

  const getStatusColor = (status: RenderJob['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'rendering': return 'text-blue-600';
      case 'uploading': return 'text-purple-600';
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: RenderJob['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'rendering': return '🎬';
      case 'uploading': return '📤';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '⚪';
    }
  };

  return (
    <div className={`max-w-6xl mx-auto p-6 space-y-8 ${className}`}>
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          🎬 SoulCinema Studio
        </h1>
        <p className="text-gray-600 text-lg">
          Transform chess games into cinematic masterpieces with AI-powered storytelling
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              ♟️ Game Input
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PGN File Upload
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pgn"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PGN Content
                </label>
                <textarea
                  value={pgn}
                  onChange={(e) => setPgn(e.target.value)}
                  placeholder="Paste your PGN here..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                {pgn && (
                  <p className={`text-sm mt-1 ${validatePgn(pgn) ? 'text-green-600' : 'text-red-600'}`}>
                    {validatePgn(pgn) ? '✅ Valid PGN' : '❌ Invalid PGN format'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter video description..."
                  className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              ⚙️ Render Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Format
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="horizontal"
                      checked={selectedFormat === 'horizontal'}
                      onChange={(e) => setSelectedFormat(e.target.value as 'horizontal' | 'vertical')}
                      className="mr-2"
                    />
                    📺 Horizontal (1920x1080)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="vertical"
                      checked={selectedFormat === 'vertical'}
                      onChange={(e) => setSelectedFormat(e.target.value as 'horizontal' | 'vertical')}
                      className="mr-2"
                    />
                    📱 Vertical (1080x1920)
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={voiceNarration}
                    onChange={(e) => setVoiceNarration(e.target.checked)}
                    className="mr-2"
                  />
                  🗣️ Bambai AI Voice Narration
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={emotionalHighlights}
                    onChange={(e) => setEmotionalHighlights(e.target.checked)}
                    className="mr-2"
                  />
                  ✨ Emotional Highlights
                </label>
              </div>

              <div>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={autoUpload}
                    onChange={(e) => setAutoUpload(e.target.checked)}
                    className="mr-2"
                  />
                  🚀 Auto-Upload to Social Media
                </label>
                
                {autoUpload && (
                  <div className="ml-6 space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes('youtube')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlatforms(prev => [...prev, 'youtube']);
                          } else {
                            setSelectedPlatforms(prev => prev.filter(p => p !== 'youtube'));
                          }
                        }}
                        className="mr-2"
                      />
                      📺 YouTube
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes('tiktok')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlatforms(prev => [...prev, 'tiktok']);
                          } else {
                            setSelectedPlatforms(prev => prev.filter(p => p !== 'tiktok'));
                          }
                        }}
                        className="mr-2"
                      />
                      🎵 TikTok
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes('instagram')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlatforms(prev => [...prev, 'instagram']);
                          } else {
                            setSelectedPlatforms(prev => prev.filter(p => p !== 'instagram'));
                          }
                        }}
                        className="mr-2"
                      />
                      📸 Instagram Reels
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes('twitter')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlatforms(prev => [...prev, 'twitter']);
                          } else {
                            setSelectedPlatforms(prev => prev.filter(p => p !== 'twitter'));
                          }
                        }}
                        className="mr-2"
                      />
                      🐦 Twitter
                    </label>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={startRender}
              disabled={isRendering || !validatePgn(pgn) || !title.trim()}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isRendering ? '🎬 Rendering...' : '🚀 Start Render'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              📊 Render Queue
            </h2>
            
            {renderJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">🎬 No renders yet</p>
                <p className="text-sm">Start your first SoulCinema render above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {renderJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg truncate">{job.title}</h3>
                      <span className={`text-sm font-medium ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)} {job.status.toUpperCase()}
                      </span>
                    </div>
                    
                    {job.status !== 'failed' && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Format: {job.config.width}x{job.config.height} ({job.config.format})</p>
                      <p>Duration: {job.config.duration}s @ {job.config.fps}fps</p>
                      
                      {job.error && (
                        <p className="text-red-600 font-medium">❌ Error: {job.error}</p>
                      )}
                      
                      {job.uploadResults && job.uploadResults.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Upload Results:</p>
                          {job.uploadResults.map((result, index) => (
                            <p key={index} className={`text-xs ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                              {result.success ? '✅' : '❌'} {result.platform}
                              {result.url && (
                                <a href={result.url} target="_blank" rel="noopener noreferrer" className="ml-2 underline">
                                  View
                                </a>
                              )}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {job.status === 'completed' && job.outputPath && (
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => generateShortForm(job)}
                          className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          ✂️ Generate Short-Form
                        </button>
                        <button
                          onClick={() => {
                            console.log('Downloading:', job.outputPath);
                            alert('Download feature would be implemented here');
                          }}
                          className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          📥 Download
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">🎯 SoulCinema Features</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>✨ AI-powered emotional analysis</li>
              <li>🗣️ Bambai AI voice narration</li>
              <li>🎬 Cinematic camera movements</li>
              <li>📱 Multi-platform optimization</li>
              <li>🚀 Automated social media upload</li>
              <li>✂️ Short-form content generation</li>
              <li>🎨 Dynamic branding & overlays</li>
              <li>📊 Engagement prediction</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Upload, Download, Settings, BarChart3, FileText, Video, Mic } from 'lucide-react';
import { ContentAnalysisResult, AnalysisConfig } from '@/lib/analysis/ContentAnalysisPipeline';

interface ContentAnalysisStudioProps {
  onAnalysisComplete?: (result: ContentAnalysisResult) => void;
}

export function ContentAnalysisStudio({ onAnalysisComplete }: ContentAnalysisStudioProps) {
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'pgn' | 'article' | 'video' | 'audio'>('pgn');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ContentAnalysisResult | null>(null);
  const [config, setConfig] = useState<AnalysisConfig>({
    includeEmotionalAnalysis: true,
    generateNarrativeAdaptations: true,
    extractKeyMoments: true,
    generateSocialSnippets: true,
    voiceMode: 'dramatic',
    targetAudience: 'competitive'
  });

  const handleAnalyze = async () => {
    if (!content.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analysis/content-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, contentType, config })
      });

      const data = await response.json();
      
      if (data.success) {
        setAnalysisResult(data.result);
        onAnalysisComplete?.(data.result);
      } else {
        console.error('Analysis failed:', data.error);
      }
    } catch (error) {
      console.error('Analysis request failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const contentTypeIcons = {
    pgn: <FileText className="w-4 h-4" />,
    article: <FileText className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    audio: <Mic className="w-4 h-4" />
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#0A0F1C] to-[#162236] rounded-lg border border-[#40E0D0]/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#40E0D0]">Content Analysis Studio</h2>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-[#40E0D0]/20 text-[#40E0D0] hover:bg-[#40E0D0]/30 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-[#40E0D0]/20 text-[#40E0D0] hover:bg-[#40E0D0]/30 transition-colors">
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Content Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['pgn', 'article', 'video', 'audio'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setContentType(type)}
                  className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                    contentType === type
                      ? 'border-[#40E0D0] bg-[#40E0D0]/20 text-[#40E0D0]'
                      : 'border-white/20 bg-white/5 text-white/60 hover:border-white/40'
                  }`}
                >
                  {contentTypeIcons[type]}
                  <span className="text-xs capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Content Input
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Enter your ${contentType} content here...`}
              className="w-full h-40 p-3 bg-[#0A0F1C]/50 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-[#40E0D0] focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Voice Mode
              </label>
              <select
                value={config.voiceMode}
                onChange={(e) => setConfig(prev => ({ ...prev, voiceMode: e.target.value as any }))}
                className="w-full p-2 bg-[#0A0F1C]/50 border border-white/20 rounded-lg text-white focus:border-[#40E0D0] focus:outline-none"
              >
                <option value="calm">Calm</option>
                <option value="dramatic">Dramatic</option>
                <option value="poetic">Poetic</option>
                <option value="analytical">Analytical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Target Audience
              </label>
              <select
                value={config.targetAudience}
                onChange={(e) => setConfig(prev => ({ ...prev, targetAudience: e.target.value as any }))}
                className="w-full p-2 bg-[#0A0F1C]/50 border border-white/20 rounded-lg text-white focus:border-[#40E0D0] focus:outline-none"
              >
                <option value="casual">Casual</option>
                <option value="competitive">Competitive</option>
                <option value="educational">Educational</option>
                <option value="entertainment">Entertainment</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">
              Analysis Options
            </label>
            {[
              { key: 'includeEmotionalAnalysis', label: 'Emotional Analysis' },
              { key: 'generateNarrativeAdaptations', label: 'Narrative Adaptations' },
              { key: 'extractKeyMoments', label: 'Key Moments' },
              { key: 'generateSocialSnippets', label: 'Social Media Snippets' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={config[key as keyof AnalysisConfig] as boolean}
                  onChange={(e) => setConfig(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="rounded border-white/20 bg-[#0A0F1C]/50 text-[#40E0D0] focus:ring-[#40E0D0]"
                />
                {label}
              </label>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!content.trim() || isAnalyzing}
            className="w-full p-3 bg-gradient-to-r from-[#40E0D0] to-[#00CED1] text-[#0A0F1C] font-semibold rounded-lg hover:from-[#00CED1] hover:to-[#40E0D0] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0A0F1C]/30 border-t-[#0A0F1C] rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Analyze Content
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          {analysisResult ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-[#0A0F1C]/50 rounded-lg border border-white/10 p-4">
                <h3 className="text-lg font-semibold text-[#40E0D0] mb-3">Analysis Results</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#40E0D0]">
                      {analysisResult.estimatedEngagement}%
                    </div>
                    <div className="text-xs text-white/60">Engagement Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#40E0D0] capitalize">
                      {analysisResult.difficultyLevel}
                    </div>
                    <div className="text-xs text-white/60">Difficulty Level</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white/80 mb-2">Content Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {analysisResult.contentTags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-[#40E0D0]/20 text-[#40E0D0] text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white/80 mb-2">Overall Arc</h4>
                  <p className="text-sm text-white/70 italic">
                    "{analysisResult.emotionalProfile.overallArc}"
                  </p>
                </div>

                {analysisResult.keyMoments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-white/80 mb-2">Key Moments</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {analysisResult.keyMoments.slice(0, 3).map((moment, index) => (
                        <div key={index} className="text-xs text-white/70 p-2 bg-white/5 rounded">
                          <div className="font-medium">{moment.description}</div>
                          <div className="text-white/50">{moment.suggestedNarration}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="flex-1 p-2 bg-[#40E0D0]/20 text-[#40E0D0] rounded text-xs hover:bg-[#40E0D0]/30 transition-colors flex items-center justify-center gap-1">
                    <Download className="w-3 h-3" />
                    Export
                  </button>
                  <button className="flex-1 p-2 bg-[#40E0D0]/20 text-[#40E0D0] rounded text-xs hover:bg-[#40E0D0]/30 transition-colors flex items-center justify-center gap-1">
                    <Upload className="w-3 h-3" />
                    Share
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#0A0F1C]/50 rounded-lg border border-white/10 p-8 text-center">
              <div className="text-white/40 mb-2">
                <BarChart3 className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-white/60 text-sm">
                Enter content and click "Analyze Content" to see detailed analysis results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

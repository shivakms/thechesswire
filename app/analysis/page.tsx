import React from 'react';
import { ContentAnalysisStudio } from '../../src/components/analysis/ContentAnalysisStudio';
import { ContentAnalysisResult } from '../../src/lib/analysis/ContentAnalysisPipeline';

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#162236] to-[#1A2332] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#40E0D0] mb-4">
            Content Analysis Pipeline
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Advanced AI-powered content analysis for chess games, articles, and multimedia. 
            Generate emotional profiles, narrative adaptations, and social media content.
          </p>
        </div>

        <ContentAnalysisStudio 
          onAnalysisComplete={(result: ContentAnalysisResult) => {
            console.log('Analysis completed:', result);
          }}
        />
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EmotionHeatmap as EmotionHeatmapType, EmotionalMove } from '@/lib/analysis/PGNEmotionClassifier';

interface EmotionHeatmapProps {
  heatmap: EmotionHeatmapType;
  currentMove: number;
  onMoveSelect: (moveNumber: number) => void;
}

export function EmotionHeatmap({ heatmap, currentMove, onMoveSelect }: EmotionHeatmapProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<'tension' | 'hope' | 'aggression' | 'collapse' | 'all'>('all');

  const getEmotionColor = (emotion: keyof EmotionalMove['emotions'], value: number) => {
    const intensity = value / 100;
    
    const colors = {
      tension: `rgba(255, 165, 0, ${intensity})`, // Orange
      hope: `rgba(34, 197, 94, ${intensity})`,    // Green
      aggression: `rgba(239, 68, 68, ${intensity})`, // Red
      collapse: `rgba(107, 114, 128, ${intensity})`  // Gray
    };
    
    return colors[emotion];
  };

  const getIntensityHeight = (move: EmotionalMove) => {
    if (selectedEmotion === 'all') {
      const maxEmotion = Math.max(
        move.emotions.tension,
        move.emotions.hope,
        move.emotions.aggression,
        move.emotions.collapse
      );
      return (maxEmotion / 100) * 60;
    }
    
    return (move.emotions[selectedEmotion] / 100) * 60;
  };

  const emotionLabels = {
    tension: { label: 'Tension', color: '#FFA500', icon: '⚡' },
    hope: { label: 'Hope', color: '#22C55E', icon: '✨' },
    aggression: { label: 'Aggression', color: '#EF4444', icon: '⚔️' },
    collapse: { label: 'Collapse', color: '#6B7280', icon: '💔' }
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#0A0F1C] to-[#162236] rounded-lg border border-[#40E0D0]/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#40E0D0]">Emotion Timeline</h3>
        
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedEmotion('all')}
            className={`px-3 py-1 rounded text-xs transition-all ${
              selectedEmotion === 'all' 
                ? 'bg-[#40E0D0] text-[#0A0F1C]' 
                : 'bg-[#40E0D0]/20 text-[#40E0D0] hover:bg-[#40E0D0]/30'
            }`}
          >
            All
          </button>
          {Object.entries(emotionLabels).map(([emotion, config]) => (
            <button
              key={emotion}
              onClick={() => setSelectedEmotion(emotion as keyof EmotionalMove['emotions'])}
              className={`px-3 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                selectedEmotion === emotion 
                  ? 'text-[#0A0F1C]' 
                  : 'text-white/80 hover:text-white'
              }`}
              style={{
                backgroundColor: selectedEmotion === emotion ? config.color : `${config.color}20`,
              }}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="flex items-end gap-1 h-20 mb-4 overflow-x-auto">
          {heatmap.moves.map((move) => (
            <motion.div
              key={move.moveNumber}
              className="relative flex-shrink-0 cursor-pointer group"
              onClick={() => onMoveSelect(move.moveNumber)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className={`w-3 rounded-t transition-all duration-200 ${
                  currentMove === move.moveNumber 
                    ? 'ring-2 ring-[#FFD700] ring-offset-1 ring-offset-[#0A0F1C]' 
                    : ''
                }`}
                style={{
                  height: `${getIntensityHeight(move)}px`,
                  backgroundColor: selectedEmotion === 'all' 
                    ? getEmotionColor('tension', Math.max(...Object.values(move.emotions)))
                    : getEmotionColor(selectedEmotion, move.emotions[selectedEmotion])
                }}
              />
              
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0A0F1C] border border-[#40E0D0]/30 rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                <div className="text-[#40E0D0] font-medium">{move.move}</div>
                <div className="text-white/80 text-[10px] mt-1">{move.narrative}</div>
                <div className="flex gap-2 mt-1 text-[10px]">
                  <span style={{ color: emotionLabels.tension.color }}>T: {Math.round(move.emotions.tension)}</span>
                  <span style={{ color: emotionLabels.hope.color }}>H: {Math.round(move.emotions.hope)}</span>
                  <span style={{ color: emotionLabels.aggression.color }}>A: {Math.round(move.emotions.aggression)}</span>
                  <span style={{ color: emotionLabels.collapse.color }}>C: {Math.round(move.emotions.collapse)}</span>
                </div>
              </div>
              
              <div className="text-[10px] text-white/60 text-center mt-1">
                {move.moveNumber}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-sm text-white/80 italic mb-4">
          &ldquo;{heatmap.overallArc}&rdquo;
        </div>

        {heatmap.peaks && Object.keys(heatmap.peaks).some(emotion => heatmap.peaks[emotion as keyof typeof heatmap.peaks].length > 0) && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(heatmap.peaks).map(([emotion, peaks]) => {
              if (peaks.length === 0) return null;
              
              const config = emotionLabels[emotion as keyof typeof emotionLabels];
              
              return (
                <div key={emotion} className="bg-[#0A0F1C]/50 rounded border border-white/10 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{config.icon}</span>
                    <span className="text-xs font-medium" style={{ color: config.color }}>
                      {config.label} Peaks
                    </span>
                  </div>
                  <div className="space-y-1">
                    {peaks.slice(0, 2).map((peak, index) => (
                      <button
                        key={index}
                        onClick={() => onMoveSelect(peak.moveNumber)}
                        className="block w-full text-left text-xs text-white/80 hover:text-white transition-colors"
                      >
                        <span className="font-medium">{peak.move}</span>
                        <span className="text-white/60 ml-1">
                          ({Math.round(peak.emotions[emotion as keyof EmotionalMove['emotions']])})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

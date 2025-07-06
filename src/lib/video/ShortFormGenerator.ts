import { VideoConfig } from './SoulCinemaRenderer';

export interface ShortFormOptions {
  inputPath: string;
  outputPath: string;
  maxDuration: number;
  format: 'vertical' | 'square';
  highlights: 'auto' | 'manual';
  subtitles: boolean;
  branding: boolean;
}

export interface HighlightMoment {
  startTime: number;
  endTime: number;
  type: 'brilliant' | 'blunder' | 'sacrifice' | 'checkmate' | 'dramatic';
  description: string;
  intensity: number;
}

export class ShortFormGenerator {
  private isServerSide: boolean;

  constructor() {
    this.isServerSide = typeof window === 'undefined';
  }

  async generateShortForm(options: ShortFormOptions): Promise<{
    success: boolean;
    outputPath: string;
    duration: number;
    highlights: HighlightMoment[];
  }> {
    console.log('✂️ Generating short-form video:', options.outputPath);

    try {
      const highlights = await this.detectHighlights(options.inputPath, options.highlights);
      const trimmedHighlights = this.selectBestHighlights(highlights, options.maxDuration);
      
      if (this.isServerSide) {
        return await this.generateServerSide(options, trimmedHighlights);
      } else {
        return await this.generateClientSide(options, trimmedHighlights);
      }
    } catch (error) {
      console.error('❌ Short-form generation failed:', error);
      return {
        success: false,
        outputPath: '',
        duration: 0,
        highlights: []
      };
    }
  }

  private async detectHighlights(inputPath: string, mode: 'auto' | 'manual'): Promise<HighlightMoment[]> {
    console.log('🔍 Detecting highlights in video:', inputPath);

    if (mode === 'manual') {
      return [];
    }

    const mockHighlights: HighlightMoment[] = [
      {
        startTime: 15,
        endTime: 25,
        type: 'brilliant',
        description: 'Brilliant queen sacrifice!',
        intensity: 95
      },
      {
        startTime: 45,
        endTime: 55,
        type: 'dramatic',
        description: 'Intense time pressure moment',
        intensity: 80
      },
      {
        startTime: 78,
        endTime: 88,
        type: 'blunder',
        description: 'Critical mistake under pressure',
        intensity: 85
      },
      {
        startTime: 120,
        endTime: 135,
        type: 'checkmate',
        description: 'Beautiful checkmate sequence',
        intensity: 100
      },
      {
        startTime: 95,
        endTime: 105,
        type: 'sacrifice',
        description: 'Unexpected piece sacrifice',
        intensity: 75
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✅ Detected ${mockHighlights.length} highlights`);
    return mockHighlights;
  }

  private selectBestHighlights(highlights: HighlightMoment[], maxDuration: number): HighlightMoment[] {
    console.log(`🎯 Selecting best highlights for ${maxDuration}s video`);

    const sortedHighlights = highlights
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 8);

    let totalDuration = 0;
    const selectedHighlights: HighlightMoment[] = [];

    for (const highlight of sortedHighlights) {
      const highlightDuration = highlight.endTime - highlight.startTime;
      
      if (totalDuration + highlightDuration <= maxDuration - 5) {
        selectedHighlights.push(highlight);
        totalDuration += highlightDuration;
      }
      
      if (totalDuration >= maxDuration - 10) {
        break;
      }
    }

    console.log(`✅ Selected ${selectedHighlights.length} highlights (${totalDuration}s total)`);
    return selectedHighlights.sort((a, b) => a.startTime - b.startTime);
  }

  private async generateServerSide(
    options: ShortFormOptions,
    highlights: HighlightMoment[]
  ): Promise<{ success: boolean; outputPath: string; duration: number; highlights: HighlightMoment[] }> {
    console.log('🖥️ Server-side short-form generation');

    await this.simulateProcessing('FFmpeg video processing', 3000);
    
    if (options.subtitles) {
      await this.simulateProcessing('Subtitle generation', 1000);
    }
    
    if (options.branding) {
      await this.simulateProcessing('Branding overlay', 800);
    }

    const totalDuration = highlights.reduce((sum, h) => sum + (h.endTime - h.startTime), 0);
    
    console.log('✅ Server-side short-form generation complete');
    return {
      success: true,
      outputPath: options.outputPath,
      duration: Math.min(totalDuration, options.maxDuration),
      highlights
    };
  }

  private async generateClientSide(
    options: ShortFormOptions,
    highlights: HighlightMoment[]
  ): Promise<{ success: boolean; outputPath: string; duration: number; highlights: HighlightMoment[] }> {
    console.log('🌐 Client-side short-form generation');

    await this.simulateProcessing('Canvas-based video processing', 2000);
    
    const totalDuration = highlights.reduce((sum, h) => sum + (h.endTime - h.startTime), 0);
    
    console.log('✅ Client-side short-form generation complete');
    return {
      success: true,
      outputPath: options.outputPath,
      duration: Math.min(totalDuration, options.maxDuration),
      highlights
    };
  }

  private async simulateProcessing(task: string, duration: number): Promise<void> {
    console.log(`⏳ ${task}...`);
    await new Promise(resolve => setTimeout(resolve, duration));
    console.log(`✅ ${task} complete`);
  }

  async generateSubtitles(
    highlights: HighlightMoment[],
    format: 'srt' | 'vtt' | 'ass'
  ): Promise<string> {
    console.log(`📝 Generating ${format.toUpperCase()} subtitles`);

    const subtitles: string[] = [];
    let index = 1;

    for (const highlight of highlights) {
      const startTime = this.formatTime(highlight.startTime);
      const endTime = this.formatTime(highlight.endTime);
      
      if (format === 'srt') {
        subtitles.push(
          `${index}`,
          `${startTime} --> ${endTime}`,
          highlight.description,
          ''
        );
      } else if (format === 'vtt') {
        if (index === 1) {
          subtitles.push('WEBVTT', '');
        }
        subtitles.push(
          `${startTime} --> ${endTime}`,
          highlight.description,
          ''
        );
      }
      
      index++;
    }

    const subtitleContent = subtitles.join('\n');
    console.log(`✅ Generated ${format.toUpperCase()} subtitles (${highlights.length} segments)`);
    
    return subtitleContent;
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }

  async addBranding(
    inputPath: string,
    outputPath: string,
    brandingOptions: {
      logo?: string;
      watermark?: string;
      intro?: string;
      outro?: string;
      colors?: { primary: string; secondary: string };
    }
  ): Promise<{ success: boolean; outputPath: string }> {
    console.log('🎨 Adding branding to video:', inputPath);

    await this.simulateProcessing('Logo overlay', 800);
    
    if (brandingOptions.watermark) {
      await this.simulateProcessing('Watermark application', 600);
    }
    
    if (brandingOptions.intro) {
      await this.simulateProcessing('Intro sequence', 1000);
    }
    
    if (brandingOptions.outro) {
      await this.simulateProcessing('Outro sequence', 1000);
    }

    console.log('✅ Branding applied successfully');
    return {
      success: true,
      outputPath
    };
  }

  getOptimalFormats(): {
    tiktok: VideoConfig;
    instagram: VideoConfig;
    youtube: VideoConfig;
    twitter: VideoConfig;
  } {
    return {
      tiktok: {
        width: 1080,
        height: 1920,
        fps: 30,
        duration: 60,
        format: 'vertical'
      },
      instagram: {
        width: 1080,
        height: 1920,
        fps: 30,
        duration: 90,
        format: 'vertical'
      },
      youtube: {
        width: 1080,
        height: 1920,
        fps: 30,
        duration: 60,
        format: 'vertical'
      },
      twitter: {
        width: 1080,
        height: 1080,
        fps: 30,
        duration: 140,
        format: 'vertical'
      }
    };
  }

  async generateMultipleFormats(
    inputPath: string,
    baseOutputPath: string
  ): Promise<Array<{ platform: string; path: string; config: VideoConfig }>> {
    console.log('📱 Generating multiple platform formats');

    const formats = this.getOptimalFormats();
    const results: Array<{ platform: string; path: string; config: VideoConfig }> = [];

    for (const [platform, config] of Object.entries(formats)) {
      const outputPath = `${baseOutputPath}_${platform}.mp4`;
      
      await this.simulateProcessing(`${platform} format`, 1500);
      
      results.push({
        platform,
        path: outputPath,
        config
      });
    }

    console.log(`✅ Generated ${results.length} platform formats`);
    return results;
  }

  async analyzeEngagement(highlights: HighlightMoment[]): Promise<{
    predictedViews: number;
    engagementScore: number;
    recommendations: string[];
  }> {
    console.log('📊 Analyzing engagement potential');

    const totalIntensity = highlights.reduce((sum, h) => sum + h.intensity, 0);
    const avgIntensity = totalIntensity / highlights.length;
    
    const hasCheckmate = highlights.some(h => h.type === 'checkmate');
    const hasBrilliant = highlights.some(h => h.type === 'brilliant');
    const hasDrama = highlights.some(h => h.type === 'dramatic');

    let engagementScore = avgIntensity;
    if (hasCheckmate) engagementScore += 15;
    if (hasBrilliant) engagementScore += 10;
    if (hasDrama) engagementScore += 8;

    const predictedViews = Math.floor(engagementScore * 100 + Math.random() * 5000);

    const recommendations: string[] = [];
    if (avgIntensity < 70) recommendations.push('Consider adding more dramatic moments');
    if (!hasCheckmate) recommendations.push('Checkmate sequences drive high engagement');
    if (highlights.length < 3) recommendations.push('More highlights could improve retention');
    if (highlights.length > 6) recommendations.push('Too many highlights might overwhelm viewers');

    console.log(`✅ Engagement analysis complete (Score: ${engagementScore.toFixed(1)})`);
    
    return {
      predictedViews,
      engagementScore,
      recommendations
    };
  }
}

export const shortFormGenerator = new ShortFormGenerator();

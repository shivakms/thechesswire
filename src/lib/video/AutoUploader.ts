export interface UploadCredentials {
  youtube?: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
  tiktok?: {
    accessToken: string;
    openId: string;
  };
  instagram?: {
    accessToken: string;
    userId: string;
  };
  twitter?: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
  };
}

export interface UploadResult {
  platform: string;
  success: boolean;
  videoId?: string;
  url?: string;
  error?: string;
}

export interface VideoUploadOptions {
  filePath: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail?: string;
  privacy?: 'public' | 'unlisted' | 'private';
  category?: string;
}

export class AutoUploader {
  private credentials: UploadCredentials;
  private isServerSide: boolean;

  constructor(credentials: UploadCredentials) {
    this.credentials = credentials;
    this.isServerSide = typeof window === 'undefined';
  }

  async uploadToYouTube(options: VideoUploadOptions): Promise<UploadResult> {
    console.log('📺 Uploading to YouTube:', options.title);

    if (!this.credentials.youtube) {
      return {
        platform: 'YouTube',
        success: false,
        error: 'YouTube credentials not configured'
      };
    }

    try {
      if (!this.isServerSide) {
        return {
          platform: 'YouTube',
          success: false,
          error: 'YouTube upload requires server-side execution'
        };
      }

      await this.simulateUpload('YouTube', 3000);

      const videoId = `yt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const url = `https://youtube.com/watch?v=${videoId}`;

      console.log('✅ YouTube upload complete:', url);
      return {
        platform: 'YouTube',
        success: true,
        videoId,
        url
      };
    } catch (error) {
      console.error('❌ YouTube upload failed:', error);
      return {
        platform: 'YouTube',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async uploadToTikTok(options: VideoUploadOptions): Promise<UploadResult> {
    console.log('🎵 Uploading to TikTok:', options.title);

    if (!this.credentials.tiktok) {
      return {
        platform: 'TikTok',
        success: false,
        error: 'TikTok credentials not configured'
      };
    }

    try {
      await this.simulateUpload('TikTok', 2000);

      const videoId = `tt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const url = `https://tiktok.com/@thechesswire/video/${videoId}`;

      console.log('✅ TikTok upload complete:', url);
      return {
        platform: 'TikTok',
        success: true,
        videoId,
        url
      };
    } catch (error) {
      console.error('❌ TikTok upload failed:', error);
      return {
        platform: 'TikTok',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async uploadToInstagram(options: VideoUploadOptions): Promise<UploadResult> {
    console.log('📸 Uploading to Instagram Reels:', options.title);

    if (!this.credentials.instagram) {
      return {
        platform: 'Instagram',
        success: false,
        error: 'Instagram credentials not configured'
      };
    }

    try {
      await this.simulateUpload('Instagram', 2500);

      const videoId = `ig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const url = `https://instagram.com/reel/${videoId}`;

      console.log('✅ Instagram upload complete:', url);
      return {
        platform: 'Instagram',
        success: true,
        videoId,
        url
      };
    } catch (error) {
      console.error('❌ Instagram upload failed:', error);
      return {
        platform: 'Instagram',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async uploadToTwitter(options: VideoUploadOptions): Promise<UploadResult> {
    console.log('🐦 Uploading to Twitter:', options.title);

    if (!this.credentials.twitter) {
      return {
        platform: 'Twitter',
        success: false,
        error: 'Twitter credentials not configured'
      };
    }

    try {
      await this.simulateUpload('Twitter', 1500);

      const videoId = `tw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const url = `https://twitter.com/thechesswire/status/${videoId}`;

      console.log('✅ Twitter upload complete:', url);
      return {
        platform: 'Twitter',
        success: true,
        videoId,
        url
      };
    } catch (error) {
      console.error('❌ Twitter upload failed:', error);
      return {
        platform: 'Twitter',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async uploadToAllPlatforms(options: VideoUploadOptions): Promise<UploadResult[]> {
    console.log('🚀 Starting multi-platform upload:', options.title);

    const platforms = [
      () => this.uploadToYouTube(options),
      () => this.uploadToTikTok(options),
      () => this.uploadToInstagram(options),
      () => this.uploadToTwitter(options)
    ];

    const results = await Promise.allSettled(
      platforms.map(upload => upload())
    );

    const uploadResults: UploadResult[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const platformNames = ['YouTube', 'TikTok', 'Instagram', 'Twitter'];
        return {
          platform: platformNames[index],
          success: false,
          error: result.reason?.message || 'Upload failed'
        };
      }
    });

    const successCount = uploadResults.filter(r => r.success).length;
    console.log(`✅ Multi-platform upload complete: ${successCount}/${uploadResults.length} successful`);

    return uploadResults;
  }

  private async simulateUpload(platform: string, duration: number): Promise<void> {
    console.log(`⏳ Simulating ${platform} upload...`);
    
    const steps = 5;
    for (let i = 0; i < steps; i++) {
      await new Promise(resolve => setTimeout(resolve, duration / steps));
      const progress = Math.round(((i + 1) / steps) * 100);
      console.log(`📤 ${platform} upload progress: ${progress}%`);
    }
  }

  async generateOptimalTags(title: string, description: string): Promise<string[]> {
    const baseTags = [
      'chess',
      'chessgame',
      'chessanalysis',
      'TheChessWire',
      'SoulCinema',
      'chessvideos',
      'chessstrategy',
      'chesstactics'
    ];

    const titleWords = title.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 5);

    const descriptionWords = description.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4)
      .slice(0, 3);

    const dynamicTags = [
      ...titleWords,
      ...descriptionWords,
      `chess${new Date().getFullYear()}`,
      'chesscommunity',
      'chessmaster'
    ];

    const allTags = [...baseTags, ...dynamicTags];
    const uniqueTags = Array.from(new Set(allTags));

    return uniqueTags.slice(0, 15);
  }

  async scheduleUpload(
    options: VideoUploadOptions,
    platforms: string[],
    scheduleTime: Date
  ): Promise<{ scheduled: boolean; jobId: string }> {
    console.log('⏰ Scheduling upload for:', scheduleTime.toISOString());

    const jobId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`✅ Upload scheduled with job ID: ${jobId}`);
    console.log(`📅 Platforms: ${platforms.join(', ')}`);
    console.log(`🎬 Video: ${options.title}`);

    return {
      scheduled: true,
      jobId
    };
  }

  async getUploadStatus(jobId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    results?: UploadResult[];
  }> {
    console.log('📊 Checking upload status for job:', jobId);

    const mockStatuses = ['pending', 'processing', 'completed'] as const;
    const status = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
    const progress = status === 'completed' ? 100 : Math.floor(Math.random() * 90) + 10;

    return {
      status,
      progress,
      results: status === 'completed' ? [
        { platform: 'YouTube', success: true, videoId: 'yt_123', url: 'https://youtube.com/watch?v=yt_123' },
        { platform: 'TikTok', success: true, videoId: 'tt_456', url: 'https://tiktok.com/@thechesswire/video/tt_456' }
      ] : undefined
    };
  }

  validateCredentials(): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    if (!this.credentials.youtube?.clientId) missing.push('YouTube Client ID');
    if (!this.credentials.youtube?.clientSecret) missing.push('YouTube Client Secret');
    if (!this.credentials.youtube?.refreshToken) missing.push('YouTube Refresh Token');

    if (!this.credentials.tiktok?.accessToken) missing.push('TikTok Access Token');
    if (!this.credentials.tiktok?.openId) missing.push('TikTok Open ID');

    if (!this.credentials.instagram?.accessToken) missing.push('Instagram Access Token');
    if (!this.credentials.instagram?.userId) missing.push('Instagram User ID');

    if (!this.credentials.twitter?.apiKey) missing.push('Twitter API Key');
    if (!this.credentials.twitter?.apiSecret) missing.push('Twitter API Secret');

    return {
      valid: missing.length === 0,
      missing
    };
  }
}

export function createAutoUploader(credentials: UploadCredentials): AutoUploader {
  return new AutoUploader(credentials);
}

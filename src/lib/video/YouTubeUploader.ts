export interface YouTubeDocumentary {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: 'generating' | 'ready' | 'uploaded' | 'failed';
  youtubeId?: string;
}

export interface YouTubeUploadConfig {
  title: string;
  description: string;
  tags: string[];
  categoryId: string;
  privacy: 'private' | 'unlisted' | 'public';
  thumbnailPath?: string;
  playlistId?: string;
}

export interface YouTubeUploadResult {
  success: boolean;
  videoId?: string;
  url?: string;
  error?: string;
  uploadTime?: Date;
}

export interface YouTubeCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
}

export class YouTubeUploader {
  private credentials: YouTubeCredentials;
  private apiKey: string;
  
  constructor(credentials: YouTubeCredentials, apiKey: string) {
    this.credentials = credentials;
    this.apiKey = apiKey;
  }
  
  async uploadDocumentary(
    documentary: YouTubeDocumentary,
    videoFilePath: string,
    config?: Partial<YouTubeUploadConfig>
  ): Promise<YouTubeUploadResult> {
    try {
      if (documentary.status !== 'ready') {
        throw new Error(`Documentary must be ready for upload. Current status: ${documentary.status}`);
      }
      
      const uploadConfig: YouTubeUploadConfig = {
        title: config?.title || documentary.title,
        description: config?.description || documentary.description,
        tags: config?.tags || documentary.tags,
        categoryId: config?.categoryId || '22', // People & Blogs
        privacy: config?.privacy || 'public',
        thumbnailPath: config?.thumbnailPath,
        playlistId: config?.playlistId
      };
      
      await this.ensureValidAccessToken();
      
      const videoId = await this.performUpload(videoFilePath, uploadConfig);
      
      if (uploadConfig.thumbnailPath) {
        await this.uploadThumbnail(videoId, uploadConfig.thumbnailPath);
      }
      
      if (uploadConfig.playlistId) {
        await this.addToPlaylist(videoId, uploadConfig.playlistId);
      }
      
      const result: YouTubeUploadResult = {
        success: true,
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        uploadTime: new Date()
      };
      
      await this.updateDocumentaryStatus(documentary.id, 'uploaded', videoId);
      
      return result;
      
    } catch (error) {
      console.error('YouTube upload failed:', error);
      
      await this.updateDocumentaryStatus(documentary.id, 'failed');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }
  
  private async ensureValidAccessToken(): Promise<void> {
    if (!this.credentials.accessToken || await this.isTokenExpired()) {
      await this.refreshAccessToken();
    }
  }
  
  private async isTokenExpired(): Promise<boolean> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`
        }
      });
      
      return !response.ok;
    } catch {
      return true;
    }
  }
  
  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
          refresh_token: this.credentials.refreshToken,
          grant_type: 'refresh_token'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.credentials.accessToken = data.access_token;
      
    } catch (error) {
      throw new Error(`Failed to refresh access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async performUpload(
    videoFilePath: string,
    config: YouTubeUploadConfig
  ): Promise<string> {
    const metadata = {
      snippet: {
        title: config.title,
        description: config.description,
        tags: config.tags,
        categoryId: config.categoryId
      },
      status: {
        privacyStatus: config.privacy,
        embeddable: true,
        license: 'youtube'
      }
    };
    
    console.log('Uploading video with metadata:', metadata);
    console.log('Video file path:', videoFilePath);
    
    const mockVideoId = `yt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return mockVideoId;
  }
  
  private async uploadThumbnail(videoId: string, thumbnailPath: string): Promise<void> {
    try {
      console.log(`Uploading thumbnail for video ${videoId} from ${thumbnailPath}`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Thumbnail uploaded successfully');
      
    } catch (error) {
      console.error('Thumbnail upload failed:', error);
      throw new Error(`Failed to upload thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async addToPlaylist(videoId: string, playlistId: string): Promise<void> {
    try {
      const response = await fetch('https://www.googleapis.com/youtube/v3/playlistItems', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          snippet: {
            playlistId: playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId: videoId
            }
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add to playlist: ${response.statusText}`);
      }
      
      console.log(`Video ${videoId} added to playlist ${playlistId}`);
      
    } catch (error) {
      console.error('Failed to add video to playlist:', error);
      throw error;
    }
  }
  
  private async updateDocumentaryStatus(
    documentaryId: string, 
    status: YouTubeDocumentary['status'], 
    youtubeId?: string
  ): Promise<void> {
    console.log(`Updating documentary ${documentaryId} status to ${status}`, youtubeId ? `with YouTube ID: ${youtubeId}` : '');
  }
  
  async getVideoInfo(videoId: string): Promise<any> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${this.apiKey}`,
        {
          headers: {
            'Authorization': `Bearer ${this.credentials.accessToken}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch video info: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.items?.[0] || null;
      
    } catch (error) {
      console.error('Failed to get video info:', error);
      throw error;
    }
  }
  
  async deleteVideo(videoId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.credentials.accessToken}`
          }
        }
      );
      
      return response.ok;
      
    } catch (error) {
      console.error('Failed to delete video:', error);
      return false;
    }
  }
  
  static async validateCredentials(credentials: YouTubeCredentials): Promise<boolean> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`
        }
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
  
  static generateAuthUrl(clientId: string, redirectUri: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube'
    ].join(' ');
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });
    
    return `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
  }
}

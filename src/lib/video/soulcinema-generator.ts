import { Pool } from 'pg';
import { Chess } from 'chess.js';
import { notificationSystem } from '../notifications';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface VideoTheme {
  id: string;
  name: string;
  description: string;
  musicStyle: string;
  visualEffects: string[];
  cameraMovements: string[];
  colorPalette: string[];
  duration: number; // seconds per move
}

export interface VideoGenerationRequest {
  userId: string;
  gameId: string;
  themeId: string;
  quality: '720p' | '1080p' | '4k';
  includeCommentary: boolean;
  includeEffects: boolean;
  customTitle?: string;
  customDescription?: string;
}

export interface GeneratedVideo {
  id: string;
  userId: string;
  gameId: string;
  themeId: string;
  status: 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: number;
  fileSize: number;
  quality: string;
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

interface Scene {
  moveNumber: number;
  move: string;
  fen: string;
  duration: number;
  cameraMovement: string;
  visualEffect: string;
  commentary: string | null;
  musicCue: any;
}

class SoulCinemaGenerator {
  private themes: VideoTheme[] = [
    {
      id: 'epic-battle',
      name: 'Epic Battle',
      description: 'Dramatic cinematic experience with orchestral music',
      musicStyle: 'orchestral_epic',
      visualEffects: ['particle_effects', 'slow_motion', 'dramatic_lighting'],
      cameraMovements: ['dynamic_angles', 'close_ups', 'wide_shots'],
      colorPalette: ['gold', 'red', 'dark_blue'],
      duration: 3
    },
    {
      id: 'zen-garden',
      name: 'Zen Garden',
      description: 'Peaceful and meditative experience',
      musicStyle: 'ambient_zen',
      visualEffects: ['soft_transitions', 'gentle_lighting', 'nature_elements'],
      cameraMovements: ['smooth_pans', 'gentle_zooms'],
      colorPalette: ['sage_green', 'soft_blue', 'warm_white'],
      duration: 4
    },
    {
      id: 'cyber-warfare',
      name: 'Cyber Warfare',
      description: 'Futuristic sci-fi aesthetic',
      musicStyle: 'electronic_cyber',
      visualEffects: ['holographic_overlays', 'digital_glitches', 'neon_effects'],
      cameraMovements: ['matrix_style', 'rapid_cuts', 'tech_angles'],
      colorPalette: ['neon_blue', 'electric_purple', 'cyber_green'],
      duration: 2
    },
    {
      id: 'classical-concert',
      name: 'Classical Concert',
      description: 'Elegant classical music experience',
      musicStyle: 'classical_elegant',
      visualEffects: ['elegant_transitions', 'sophisticated_lighting'],
      cameraMovements: ['graceful_movements', 'theatrical_angles'],
      colorPalette: ['rich_gold', 'deep_red', 'ivory'],
      duration: 3
    },
    {
      id: 'street-chess',
      name: 'Street Chess',
      description: 'Urban and energetic vibe',
      musicStyle: 'hip_hop_urban',
      visualEffects: ['urban_elements', 'dynamic_lighting', 'street_style'],
      cameraMovements: ['handheld_style', 'street_angles'],
      colorPalette: ['urban_gray', 'vibrant_orange', 'street_blue'],
      duration: 2
    }
  ];

  async generateVideo(request: VideoGenerationRequest): Promise<string> {
    try {
      // Create video record
      const videoId = crypto.randomUUID();
      
      await pool.query(
        `INSERT INTO soulcinema_videos 
         (id, user_id, game_id, theme_id, status, quality, include_commentary, include_effects, custom_title, custom_description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
        [
          videoId,
          request.userId,
          request.gameId,
          request.themeId,
          'processing',
          request.quality,
          request.includeCommentary,
          request.includeEffects,
          request.customTitle,
          request.customDescription
        ]
      );

      // Start async video generation
      this.processVideoGeneration(videoId, request);

      // Send notification
      await notificationSystem.createNotification(
        request.userId,
        'info',
        'SoulCinema Video Started',
        'Your cinematic chess video is being generated. You\'ll be notified when it\'s ready!',
        { videoId, themeId: request.themeId }
      );

      return videoId;
    } catch (error) {
      console.error('Failed to start video generation:', error);
      throw error;
    }
  }

  private async processVideoGeneration(videoId: string, request: VideoGenerationRequest): Promise<void> {
    try {
      // Get game data
      const gameResult = await pool.query(
        'SELECT pgn, white_player, black_player, result, event FROM chess_games WHERE id = $1',
        [request.gameId]
      );

      if (gameResult.rows.length === 0) {
        throw new Error('Game not found');
      }

      const game = gameResult.rows[0];
      const chess = new Chess();
      chess.loadPgn(game.pgn);

      const moves = chess.history({ verbose: true });
      const theme = this.themes.find(t => t.id === request.themeId);

      if (!theme) {
        throw new Error('Invalid theme');
      }

      // Generate video script
      const script = await this.generateVideoScript(moves, game, theme, request.includeCommentary);

      // Generate video using external service (FFmpeg, etc.)
      const videoData = await this.renderVideo(script, theme, request.quality);

      // Upload to cloud storage
      const videoUrl = await this.uploadVideo(videoData, videoId, request.quality);
      const thumbnailUrl = await this.generateThumbnail(videoData, videoId);

      // Update video record
      await pool.query(
        `UPDATE soulcinema_videos 
         SET status = 'completed', video_url = $1, thumbnail_url = $2, duration = $3, file_size = $4, completed_at = NOW()
         WHERE id = $5`,
        [videoUrl, thumbnailUrl, videoData.duration, videoData.fileSize, videoId]
      );

      // Send completion notification
      await notificationSystem.createNotification(
        request.userId,
        'success',
        'SoulCinema Video Ready!',
        'Your cinematic chess video is ready to watch!',
        { videoId, videoUrl, thumbnailUrl }
      );

    } catch (error) {
      console.error('Video generation failed:', error);
      
      // Update video record with error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await pool.query(
        `UPDATE soulcinema_videos 
         SET status = 'failed', error_message = $1, completed_at = NOW()
         WHERE id = $2`,
        [errorMessage, videoId]
      );

      // Send error notification
      await notificationSystem.createNotification(
        request.userId,
        'error',
        'Video Generation Failed',
        'Sorry, your video generation failed. Please try again.',
        { videoId, error: errorMessage }
      );
    }
  }

  private async generateVideoScript(
    moves: any[],
    game: any,
    theme: VideoTheme,
    includeCommentary: boolean
  ): Promise<any> {
    const script = {
      title: game.event || 'Chess Game',
      players: {
        white: game.white_player || 'White',
        black: game.black_player || 'Black'
      },
      result: game.result,
      theme: theme,
      scenes: [] as Scene[],
      totalDuration: 0
    };

    // Generate scenes for each move
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const scene: Scene = {
        moveNumber: Math.floor(i / 2) + 1,
        move: move.san,
        fen: move.after,
        duration: theme.duration,
        cameraMovement: this.selectCameraMovement(theme, i),
        visualEffect: this.selectVisualEffect(theme, i),
        commentary: includeCommentary ? await this.generateCommentary(move, i) : null,
        musicCue: this.generateMusicCue(theme, i)
      };

      script.scenes.push(scene);
      script.totalDuration += scene.duration;
    }

    return script;
  }

  private selectCameraMovement(theme: VideoTheme, moveIndex: number): string {
    const movements = theme.cameraMovements;
    return movements[moveIndex % movements.length];
  }

  private selectVisualEffect(theme: VideoTheme, moveIndex: number): string {
    const effects = theme.visualEffects;
    return effects[moveIndex % effects.length];
  }

  private async generateCommentary(move: any, moveIndex: number): Promise<string> {
    // Use AI to generate commentary
    const commentaryPrompts = [
      `Analyze this chess move: ${move.san}. Provide engaging commentary.`,
      `Describe the strategic implications of ${move.san}.`,
      `Explain why ${move.san} is a strong move in this position.`
    ];

    const prompt = commentaryPrompts[moveIndex % commentaryPrompts.length];
    
    // This would integrate with your AI system
    return `"${move.san}" - A powerful move that strengthens the position.`;
  }

  private generateMusicCue(theme: VideoTheme, moveIndex: number): any {
    return {
      style: theme.musicStyle,
      intensity: Math.min(1, moveIndex / 20), // Builds intensity over time
      transition: 'smooth'
    };
  }

  private async renderVideo(script: any, theme: VideoTheme, quality: string): Promise<any> {
    // This would integrate with a video rendering service
    // For now, return mock data
    return {
      duration: script.totalDuration,
      fileSize: script.totalDuration * 1024 * 1024, // Mock file size
      format: 'mp4',
      quality: quality
    };
  }

  private async uploadVideo(videoData: any, videoId: string, quality: string): Promise<string> {
    // This would upload to cloud storage (AWS S3, etc.)
    return `https://thechesswire-media.s3.amazonaws.com/videos/${videoId}_${quality}.mp4`;
  }

  private async generateThumbnail(videoData: any, videoId: string): Promise<string> {
    // This would generate a thumbnail from the video
    return `https://thechesswire-media.s3.amazonaws.com/thumbnails/${videoId}.jpg`;
  }

  async getVideo(videoId: string): Promise<GeneratedVideo | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM soulcinema_videos WHERE id = $1',
        [videoId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        gameId: row.game_id,
        themeId: row.theme_id,
        status: row.status,
        videoUrl: row.video_url,
        thumbnailUrl: row.thumbnail_url,
        duration: row.duration,
        fileSize: row.file_size,
        quality: row.quality,
        createdAt: row.created_at,
        completedAt: row.completed_at,
        errorMessage: row.error_message
      };
    } catch (error) {
      console.error('Failed to get video:', error);
      return null;
    }
  }

  async getUserVideos(userId: string, limit: number = 20, offset: number = 0): Promise<GeneratedVideo[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM soulcinema_videos 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        gameId: row.game_id,
        themeId: row.theme_id,
        status: row.status,
        videoUrl: row.video_url,
        thumbnailUrl: row.thumbnail_url,
        duration: row.duration,
        fileSize: row.file_size,
        quality: row.quality,
        createdAt: row.created_at,
        completedAt: row.completed_at,
        errorMessage: row.error_message
      }));
    } catch (error) {
      console.error('Failed to get user videos:', error);
      return [];
    }
  }

  async deleteVideo(videoId: string, userId: string): Promise<boolean> {
    try {
      const result = await pool.query(
        'DELETE FROM soulcinema_videos WHERE id = $1 AND user_id = $2',
        [videoId, userId]
      );

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Failed to delete video:', error);
      return false;
    }
  }

  async getThemes(): Promise<VideoTheme[]> {
    return this.themes;
  }

  async getTheme(themeId: string): Promise<VideoTheme | null> {
    return this.themes.find(theme => theme.id === themeId) || null;
  }

  async getVideoStats(userId: string): Promise<any> {
    try {
      const result = await pool.query(
        `SELECT 
           COUNT(*) as total_videos,
           COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_videos,
           COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_videos,
           COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_videos,
           SUM(CASE WHEN status = 'completed' THEN duration ELSE 0 END) as total_duration,
           SUM(CASE WHEN status = 'completed' THEN file_size ELSE 0 END) as total_file_size
         FROM soulcinema_videos 
         WHERE user_id = $1`,
        [userId]
      );

      return result.rows[0] || {
        total_videos: 0,
        completed_videos: 0,
        processing_videos: 0,
        failed_videos: 0,
        total_duration: 0,
        total_file_size: 0
      };
    } catch (error) {
      console.error('Failed to get video stats:', error);
      return {
        total_videos: 0,
        completed_videos: 0,
        processing_videos: 0,
        failed_videos: 0,
        total_duration: 0,
        total_file_size: 0
      };
    }
  }
}

// Singleton instance
const soulCinemaGenerator = new SoulCinemaGenerator();

export { soulCinemaGenerator, SoulCinemaGenerator }; 
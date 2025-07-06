import { Chess } from 'chess.js';

export interface SocialPlatform {
  id: string;
  name: string;
  enabled: boolean;
  credentials?: {
    apiKey?: string;
    accessToken?: string;
    refreshToken?: string;
    clientId?: string;
    clientSecret?: string;
  };
  limits: {
    maxLength: number;
    maxHashtags: number;
    videoLength?: number;
    imageCount?: number;
  };
  features: {
    supportsVideo: boolean;
    supportsImages: boolean;
    supportsHashtags: boolean;
    supportsScheduling: boolean;
    supportsThreads: boolean;
  };
}

export interface ContentPost {
  id: string;
  title: string;
  content: string;
  hashtags: string[];
  mediaUrls: string[];
  scheduledTime?: Date;
  platforms: string[];
  gameData?: {
    pgn: string;
    fen: string;
    moves: string[];
    result: string;
    players: {
      white: string;
      black: string;
      whiteElo?: number;
      blackElo?: number;
    };
  };
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
    views: number;
  };
  status: 'draft' | 'scheduled' | 'published' | 'failed';
}

export interface SchedulingRule {
  platform: string;
  timeZone: string;
  optimalTimes: {
    dayOfWeek: number;
    hour: number;
    minute: number;
  }[];
  frequency: 'daily' | 'weekly' | 'monthly';
  contentTypes: string[];
}

export class SocialMediaManager {
  private platforms: Map<string, SocialPlatform> = new Map();
  private schedulingRules: SchedulingRule[] = [];
  private contentQueue: ContentPost[] = [];

  constructor() {
    this.initializePlatforms();
  }

  private initializePlatforms() {
    const defaultPlatforms: SocialPlatform[] = [
      {
        id: 'youtube',
        name: 'YouTube',
        enabled: false,
        limits: { maxLength: 5000, maxHashtags: 15, videoLength: 3600 },
        features: {
          supportsVideo: true,
          supportsImages: true,
          supportsHashtags: true,
          supportsScheduling: true,
          supportsThreads: false
        }
      },
      {
        id: 'tiktok',
        name: 'TikTok',
        enabled: false,
        limits: { maxLength: 2200, maxHashtags: 20, videoLength: 180 },
        features: {
          supportsVideo: true,
          supportsImages: false,
          supportsHashtags: true,
          supportsScheduling: true,
          supportsThreads: false
        }
      },
      {
        id: 'instagram',
        name: 'Instagram',
        enabled: false,
        limits: { maxLength: 2200, maxHashtags: 30, imageCount: 10 },
        features: {
          supportsVideo: true,
          supportsImages: true,
          supportsHashtags: true,
          supportsScheduling: true,
          supportsThreads: false
        }
      },
      {
        id: 'twitter',
        name: 'Twitter/X',
        enabled: false,
        limits: { maxLength: 280, maxHashtags: 10 },
        features: {
          supportsVideo: true,
          supportsImages: true,
          supportsHashtags: true,
          supportsScheduling: true,
          supportsThreads: true
        }
      },
      {
        id: 'facebook',
        name: 'Facebook',
        enabled: false,
        limits: { maxLength: 63206, maxHashtags: 30 },
        features: {
          supportsVideo: true,
          supportsImages: true,
          supportsHashtags: true,
          supportsScheduling: true,
          supportsThreads: false
        }
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        enabled: false,
        limits: { maxLength: 3000, maxHashtags: 5 },
        features: {
          supportsVideo: true,
          supportsImages: true,
          supportsHashtags: true,
          supportsScheduling: true,
          supportsThreads: false
        }
      },
      {
        id: 'reddit',
        name: 'Reddit',
        enabled: false,
        limits: { maxLength: 40000, maxHashtags: 0 },
        features: {
          supportsVideo: true,
          supportsImages: true,
          supportsHashtags: false,
          supportsScheduling: false,
          supportsThreads: false
        }
      },
      {
        id: 'discord',
        name: 'Discord',
        enabled: false,
        limits: { maxLength: 2000, maxHashtags: 0 },
        features: {
          supportsVideo: true,
          supportsImages: true,
          supportsHashtags: false,
          supportsScheduling: false,
          supportsThreads: true
        }
      },
      {
        id: 'telegram',
        name: 'Telegram',
        enabled: false,
        limits: { maxLength: 4096, maxHashtags: 20 },
        features: {
          supportsVideo: true,
          supportsImages: true,
          supportsHashtags: true,
          supportsScheduling: true,
          supportsThreads: false
        }
      },
      {
        id: 'mastodon',
        name: 'Mastodon',
        enabled: false,
        limits: { maxLength: 500, maxHashtags: 10 },
        features: {
          supportsVideo: true,
          supportsImages: true,
          supportsHashtags: true,
          supportsScheduling: true,
          supportsThreads: true
        }
      },
      {
        id: 'threads',
        name: 'Threads',
        enabled: false,
        limits: { maxLength: 500, maxHashtags: 10 },
        features: {
          supportsVideo: true,
          supportsImages: true,
          supportsHashtags: true,
          supportsScheduling: true,
          supportsThreads: true
        }
      },
      {
        id: 'bluesky',
        name: 'Bluesky',
        enabled: false,
        limits: { maxLength: 300, maxHashtags: 8 },
        features: {
          supportsVideo: true,
          supportsImages: true,
          supportsHashtags: true,
          supportsScheduling: false,
          supportsThreads: true
        }
      }
    ];

    defaultPlatforms.forEach(platform => {
      this.platforms.set(platform.id, platform);
    });
  }

  async createContentFromGame(pgn: string, options: {
    title?: string;
    description?: string;
    targetPlatforms: string[];
    includeAnalysis?: boolean;
    includeVideo?: boolean;
    scheduledTime?: Date;
  }): Promise<ContentPost> {
    const chess = new Chess();
    
    try {
      chess.loadPgn(pgn);
    } catch (error) {
      throw new Error(`Invalid PGN: ${error}`);
    }

    const moves = chess.history();
    const gameData = {
      pgn,
      fen: chess.fen(),
      moves,
      result: chess.isGameOver() ? (chess.isCheckmate() ? 'checkmate' : 'draw') : 'ongoing',
      players: this.extractPlayersFromPgn(pgn)
    };

    const content = await this.generateContentFromGame(gameData, options);
    const hashtags = this.generateHashtags(gameData, options.targetPlatforms);

    const post: ContentPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: options.title || content.title,
      content: content.text,
      hashtags,
      mediaUrls: options.includeVideo && content.videoUrl ? [content.videoUrl] : [],
      scheduledTime: options.scheduledTime,
      platforms: options.targetPlatforms,
      gameData,
      status: 'draft'
    };

    this.contentQueue.push(post);
    return post;
  }

  private extractPlayersFromPgn(pgn: string): { white: string; black: string; whiteElo?: number; blackElo?: number } {
    const whiteMatch = pgn.match(/\[White "([^"]+)"\]/);
    const blackMatch = pgn.match(/\[Black "([^"]+)"\]/);
    const whiteEloMatch = pgn.match(/\[WhiteElo "(\d+)"\]/);
    const blackEloMatch = pgn.match(/\[BlackElo "(\d+)"\]/);

    return {
      white: whiteMatch ? whiteMatch[1] : 'Unknown',
      black: blackMatch ? blackMatch[1] : 'Unknown',
      whiteElo: whiteEloMatch ? parseInt(whiteEloMatch[1]) : undefined,
      blackElo: blackEloMatch ? parseInt(blackEloMatch[1]) : undefined
    };
  }

  private async generateContentFromGame(gameData: { players: { white: string; black: string; whiteElo?: number; blackElo?: number }; moves: string[]; result: string; pgn?: string }, options: { title?: string; includeAnalysis?: boolean; includeVideo?: boolean }): Promise<{ title: string; text: string; videoUrl?: string }> {
    const { players, moves, result } = gameData;
    
    const title = options.title || `${players.white} vs ${players.black} - ${result === 'checkmate' ? 'Brilliant Checkmate!' : 'Epic Chess Battle'}`;
    
    let text = `🔥 ${title}\n\n`;
    
    if (players.whiteElo && players.blackElo) {
      text += `⚡ ${players.white} (${players.whiteElo}) vs ${players.black} (${players.blackElo})\n`;
    }
    
    text += `📊 ${moves.length} moves of pure chess artistry\n`;
    
    if (result === 'checkmate') {
      text += `👑 Decisive victory with a stunning checkmate!\n`;
    } else if (result === 'draw') {
      text += `🤝 Hard-fought draw between masters\n`;
    }

    if (options.includeAnalysis && moves.length > 0) {
      const keyMoves = this.identifyKeyMoves(moves);
      if (keyMoves.length > 0) {
        text += `\n🎯 Key moments: ${keyMoves.join(', ')}\n`;
      }
    }

    text += `\n💫 Experience chess like never before at TheChessWire.news`;

    return {
      title,
      text,
      videoUrl: options.includeVideo ? `/api/video/generate/${gameData.pgn}` : undefined
    };
  }

  private identifyKeyMoves(moves: string[]): string[] {
    const keyMoves: string[] = [];
    
    moves.forEach((move, index) => {
      if (move.includes('+')) {
        keyMoves.push(`${index + 1}. ${move} (Check!)`);
      } else if (move.includes('#')) {
        keyMoves.push(`${index + 1}. ${move} (Checkmate!)`);
      } else if (move.includes('x') && (move.includes('Q') || move.includes('R'))) {
        keyMoves.push(`${index + 1}. ${move} (Capture!)`);
      }
    });

    return keyMoves.slice(0, 3);
  }

  private generateHashtags(gameData: { result: string; moves: string[]; players: { whiteElo?: number; blackElo?: number } }, platforms: string[]): string[] {
    const baseHashtags = ['#chess', '#chessgame', '#chesslife'];
    const contextHashtags: string[] = [];

    if (gameData.result === 'checkmate') {
      contextHashtags.push('#checkmate', '#brilliant', '#tactics');
    } else if (gameData.result === 'draw') {
      contextHashtags.push('#draw', '#endgame', '#strategy');
    }

    if (gameData.moves.length < 30) {
      contextHashtags.push('#quickgame', '#blitz');
    } else if (gameData.moves.length > 60) {
      contextHashtags.push('#marathon', '#endurance');
    }

    const playerHashtags: string[] = [];
    if (gameData.players.whiteElo && gameData.players.whiteElo > 2400) {
      playerHashtags.push('#grandmaster', '#elite');
    } else if (gameData.players.whiteElo && gameData.players.whiteElo > 2200) {
      playerHashtags.push('#master', '#expert');
    }

    const platformSpecific: string[] = [];
    platforms.forEach(platform => {
      switch (platform) {
        case 'tiktok':
          platformSpecific.push('#chessTok', '#viral', '#fyp');
          break;
        case 'youtube':
          platformSpecific.push('#chessanalysis', '#chesseducation');
          break;
        case 'instagram':
          platformSpecific.push('#chessgram', '#chessart');
          break;
        case 'twitter':
          platformSpecific.push('#ChessTwitter', '#chess24');
          break;
      }
    });

    return [...baseHashtags, ...contextHashtags, ...playerHashtags, ...platformSpecific].slice(0, 15);
  }

  async schedulePost(postId: string, scheduledTime: Date): Promise<void> {
    const post = this.contentQueue.find(p => p.id === postId);
    if (!post) {
      throw new Error(`Post ${postId} not found`);
    }

    post.scheduledTime = scheduledTime;
    post.status = 'scheduled';

    setTimeout(() => {
      this.publishPost(postId);
    }, scheduledTime.getTime() - Date.now());
  }

  async publishPost(postId: string): Promise<{ success: boolean; results: { platform: string; success: boolean; error?: string }[] }> {
    const post = this.contentQueue.find(p => p.id === postId);
    if (!post) {
      throw new Error(`Post ${postId} not found`);
    }

    const results: { platform: string; success: boolean; error?: string }[] = [];

    for (const platformId of post.platforms) {
      const platform = this.platforms.get(platformId);
      if (!platform || !platform.enabled) {
        results.push({
          platform: platformId,
          success: false,
          error: 'Platform not enabled'
        });
        continue;
      }

      try {
        const adaptedContent = this.adaptContentForPlatform(post, platform);
        await this.publishToPlatform(adaptedContent, platform);
        
        results.push({
          platform: platformId,
          success: true
        });
      } catch (error) {
        results.push({
          platform: platformId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    post.status = results.every(r => r.success) ? 'published' : 'failed';
    
    return {
      success: results.some(r => r.success),
      results
    };
  }

  private adaptContentForPlatform(post: ContentPost, platform: SocialPlatform): ContentPost {
    const adapted = { ...post };

    if (post.content.length > platform.limits.maxLength) {
      adapted.content = post.content.substring(0, platform.limits.maxLength - 3) + '...';
    }

    if (post.hashtags.length > platform.limits.maxHashtags) {
      adapted.hashtags = post.hashtags.slice(0, platform.limits.maxHashtags);
    }

    if (!platform.features.supportsHashtags) {
      adapted.hashtags = [];
    }

    if (!platform.features.supportsVideo) {
      adapted.mediaUrls = adapted.mediaUrls.filter(url => !url.includes('video'));
    }

    return adapted;
  }

  private async publishToPlatform(post: ContentPost, platform: SocialPlatform): Promise<void> {
    switch (platform.id) {
      case 'youtube':
        await this.publishToYouTube(post);
        break;
      case 'tiktok':
        await this.publishToTikTok(post);
        break;
      case 'instagram':
        await this.publishToInstagram(post);
        break;
      case 'twitter':
        await this.publishToTwitter(post);
        break;
      case 'facebook':
        await this.publishToFacebook(post);
        break;
      case 'linkedin':
        await this.publishToLinkedIn(post);
        break;
      default:
        throw new Error(`Platform ${platform.id} not implemented`);
    }
  }

  private async publishToYouTube(post: ContentPost): Promise<void> {
    console.log(`Publishing to YouTube: ${post.title}`);
  }

  private async publishToTikTok(post: ContentPost): Promise<void> {
    console.log(`Publishing to TikTok: ${post.title}`);
  }

  private async publishToInstagram(post: ContentPost): Promise<void> {
    console.log(`Publishing to Instagram: ${post.title}`);
  }

  private async publishToTwitter(post: ContentPost): Promise<void> {
    console.log(`Publishing to Twitter: ${post.title}`);
  }

  private async publishToFacebook(post: ContentPost): Promise<void> {
    console.log(`Publishing to Facebook: ${post.title}`);
  }

  private async publishToLinkedIn(post: ContentPost): Promise<void> {
    console.log(`Publishing to LinkedIn: ${post.title}`);
  }

  getPlatforms(): SocialPlatform[] {
    return Array.from(this.platforms.values());
  }

  enablePlatform(platformId: string, credentials?: Record<string, unknown>): void {
    const platform = this.platforms.get(platformId);
    if (platform) {
      platform.enabled = true;
      if (credentials) {
        platform.credentials = credentials;
      }
    }
  }

  disablePlatform(platformId: string): void {
    const platform = this.platforms.get(platformId);
    if (platform) {
      platform.enabled = false;
    }
  }

  getContentQueue(): ContentPost[] {
    return this.contentQueue;
  }

  getScheduledPosts(): ContentPost[] {
    return this.contentQueue.filter(post => post.status === 'scheduled');
  }

  getPublishedPosts(): ContentPost[] {
    return this.contentQueue.filter(post => post.status === 'published');
  }
}

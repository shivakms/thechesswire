export interface PlatformAdapter {
  id: string;
  name: string;
  formatContent(content: string, hashtags: string[], limits: { maxLength: number; maxHashtags: number }): string;
  formatTitle(title: string, limits: { maxLength: number; maxHashtags: number }): string;
  generateOptimalHashtags(baseHashtags: string[], contentType: string): string[];
  validateContent(content: string, mediaUrls: string[]): { valid: boolean; errors: string[] };
}

export class YouTubeAdapter implements PlatformAdapter {
  id = 'youtube';
  name = 'YouTube';

  formatContent(content: string, hashtags: string[], limits: { maxLength: number; maxHashtags: number }): string {
    let formatted = content;
    
    if (formatted.length > limits.maxLength) {
      formatted = formatted.substring(0, limits.maxLength - 3) + '...';
    }

    if (hashtags.length > 0) {
      const hashtagString = '\n\n' + hashtags.slice(0, limits.maxHashtags).join(' ');
      if (formatted.length + hashtagString.length <= limits.maxLength) {
        formatted += hashtagString;
      }
    }

    formatted += '\n\n🔔 Subscribe for more chess content!';
    formatted += '\n👍 Like if you enjoyed this game!';
    formatted += '\n💬 Comment your thoughts below!';

    return formatted;
  }

  formatTitle(title: string, limits: { maxLength: number; maxHashtags: number }): string {
    const maxTitleLength = limits.maxLength || 100; // YouTube title limit
    if (title.length > maxTitleLength) {
      return title.substring(0, maxTitleLength - 3) + '...';
    }
    return title;
  }

  generateOptimalHashtags(baseHashtags: string[], contentType: string): string[] {
    const youtubeSpecific = ['#chess', '#chessanalysis', '#chesseducation', '#chessgame'];
    
    if (contentType === 'tutorial') {
      youtubeSpecific.push('#chesstutorial', '#learnchess', '#chesslessons');
    } else if (contentType === 'highlights') {
      youtubeSpecific.push('#chesshighlights', '#brilliantmoves', '#chessmoments');
    } else if (contentType === 'analysis') {
      youtubeSpecific.push('#gameanalysis', '#chessstrategy', '#chesstactics');
    }

    return [...new Set([...baseHashtags, ...youtubeSpecific])].slice(0, 15);
  }

  validateContent(content: string, _mediaUrls: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (content.length > 5000) {
      errors.push('Content exceeds YouTube description limit of 5000 characters');
    }

    if (_mediaUrls.length === 0) {
      errors.push('YouTube requires at least one video file');
    }

    const videoUrls = _mediaUrls.filter((url: string) => url.includes('video') || url.endsWith('.mp4') || url.endsWith('.mov'));
    if (videoUrls.length === 0) {
      errors.push('YouTube requires video content');
    }

    return { valid: errors.length === 0, errors };
  }
}

export class TikTokAdapter implements PlatformAdapter {
  id = 'tiktok';
  name = 'TikTok';

  formatContent(content: string, hashtags: string[], limits: { maxLength: number; maxHashtags: number }): string {
    let formatted = content;

    if (formatted.length > limits.maxLength) {
      formatted = formatted.substring(0, limits.maxLength - 3) + '...';
    }

    if (hashtags.length > 0) {
      const hashtagString = ' ' + hashtags.slice(0, limits.maxHashtags).join(' ');
      if (formatted.length + hashtagString.length <= limits.maxLength) {
        formatted += hashtagString;
      }
    }

    formatted += ' #fyp #viral';

    return formatted;
  }

  formatTitle(title: string, limits: { maxLength: number; maxHashtags: number }): string {
    if (title.length > limits.maxLength) {
      return title.substring(0, limits.maxLength - 3) + '...';
    }
    return title;
  }

  generateOptimalHashtags(baseHashtags: string[], contentType: string): string[] {
    const tiktokSpecific = ['#chess', '#chessTok', '#fyp', '#viral', '#trending'];
    
    if (contentType === 'highlights') {
      tiktokSpecific.push('#chesshighlights', '#brilliantmove', '#checkmate', '#mindblown');
    } else if (contentType === 'quick_tips') {
      tiktokSpecific.push('#chesstips', '#learnontiktok', '#quicktips', '#chesshacks');
    } else if (contentType === 'viral_moments') {
      tiktokSpecific.push('#chessmoments', '#epic', '#insane', '#unbelievable');
    }

    return [...new Set([...baseHashtags, ...tiktokSpecific])].slice(0, 20);
  }

  validateContent(content: string, _mediaUrls: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (content.length > 2200) {
      errors.push('Content exceeds TikTok caption limit of 2200 characters');
    }

    if (_mediaUrls.length === 0) {
      errors.push('TikTok requires video content');
    }

    const videoUrls = _mediaUrls.filter((url: string) => url.includes('video') || url.endsWith('.mp4'));
    if (videoUrls.length === 0) {
      errors.push('TikTok requires video files');
    }

    return { valid: errors.length === 0, errors };
  }
}

export class InstagramAdapter implements PlatformAdapter {
  id = 'instagram';
  name = 'Instagram';

  formatContent(content: string, hashtags: string[], limits: { maxLength: number; maxHashtags: number }): string {
    let formatted = content;

    if (formatted.length > limits.maxLength) {
      formatted = formatted.substring(0, limits.maxLength - 3) + '...';
    }

    if (hashtags.length > 0) {
      const hashtagString = '\n\n' + hashtags.slice(0, limits.maxHashtags).join(' ');
      if (formatted.length + hashtagString.length <= limits.maxLength) {
        formatted += hashtagString;
      }
    }

    formatted += '\n\n📸 Follow for daily chess content!';
    formatted += '\n💝 Save this post for later!';

    return formatted;
  }

  formatTitle(title: string, limits: { maxLength: number; maxHashtags: number }): string {
    if (title.length > limits.maxLength) {
      return title.substring(0, limits.maxLength - 3) + '...';
    }
    return title;
  }

  generateOptimalHashtags(baseHashtags: string[], contentType: string): string[] {
    const instagramSpecific = ['#chess', '#chessgram', '#chesslife', '#chessart', '#insta chess'];
    
    if (contentType === 'highlights') {
      instagramSpecific.push('#chesshighlights', '#brilliantmoves', '#chessmoments');
    } else if (contentType === 'behind_scenes') {
      instagramSpecific.push('#behindthescenes', '#chessplayer', '#chessjourney');
    } else if (contentType === 'stories') {
      instagramSpecific.push('#chessstory', '#chesslife', '#dailychess');
    }

    return [...new Set([...baseHashtags, ...instagramSpecific])].slice(0, 30);
  }

  validateContent(content: string, _mediaUrls: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (content.length > 2200) {
      errors.push('Content exceeds Instagram caption limit of 2200 characters');
    }

    if (_mediaUrls.length === 0) {
      errors.push('Instagram requires at least one media file (image or video)');
    }

    if (_mediaUrls.length > 10) {
      errors.push('Instagram allows maximum 10 media files per post');
    }

    return { valid: errors.length === 0, errors };
  }
}

export class TwitterAdapter implements PlatformAdapter {
  id = 'twitter';
  name = 'Twitter/X';

  formatContent(content: string, hashtags: string[], limits: { maxLength: number; maxHashtags: number }): string {
    let formatted = content;

    const hashtagString = hashtags.length > 0 ? ' ' + hashtags.slice(0, limits.maxHashtags).join(' ') : '';
    const availableLength = limits.maxLength - hashtagString.length;

    if (formatted.length > availableLength) {
      formatted = formatted.substring(0, availableLength - 3) + '...';
    }

    formatted += hashtagString;

    return formatted;
  }

  formatTitle(title: string, limits: { maxLength: number; maxHashtags: number }): string {
    if (title.length > limits.maxLength) {
      return title.substring(0, limits.maxLength - 3) + '...';
    }
    return title;
  }

  generateOptimalHashtags(baseHashtags: string[], contentType: string): string[] {
    const twitterSpecific = ['#chess', '#ChessTwitter', '#chess24'];
    
    if (contentType === 'live_commentary') {
      twitterSpecific.push('#live', '#chesslive', '#commentary');
    } else if (contentType === 'polls') {
      twitterSpecific.push('#chesspoll', '#vote', '#opinion');
    } else if (contentType === 'questions') {
      twitterSpecific.push('#chessquestion', '#help', '#advice');
    }

    return [...new Set([...baseHashtags, ...twitterSpecific])].slice(0, 10);
  }

  validateContent(content: string, _mediaUrls: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (content.length > 280) {
      errors.push('Content exceeds Twitter character limit of 280');
    }

    if (_mediaUrls.length > 4) {
      errors.push('Twitter allows maximum 4 media files per tweet');
    }

    return { valid: errors.length === 0, errors };
  }
}

export class FacebookAdapter implements PlatformAdapter {
  id = 'facebook';
  name = 'Facebook';

  formatContent(content: string, hashtags: string[], limits: { maxLength: number; maxHashtags: number }): string {
    let formatted = content;

    if (formatted.length > limits.maxLength) {
      formatted = formatted.substring(0, limits.maxLength - 3) + '...';
    }

    if (hashtags.length > 0) {
      const hashtagString = '\n\n' + hashtags.slice(0, limits.maxHashtags).join(' ');
      if (formatted.length + hashtagString.length <= limits.maxLength) {
        formatted += hashtagString;
      }
    }

    formatted += '\n\n👍 Like and share with your chess friends!';
    formatted += '\n💬 What do you think about this game?';

    return formatted;
  }

  formatTitle(title: string, limits: { maxLength: number; maxHashtags: number }): string {
    if (title.length > limits.maxLength) {
      return title.substring(0, limits.maxLength - 3) + '...';
    }
    return title;
  }

  generateOptimalHashtags(baseHashtags: string[], contentType: string): string[] {
    const facebookSpecific = ['#chess', '#chessgame', '#chessplayers'];
    
    if (contentType === 'community') {
      facebookSpecific.push('#chesscomm unity', '#chessfriends', '#chessgroup');
    } else if (contentType === 'events') {
      facebookSpecific.push('#chessevent', '#tournament', '#chessclub');
    } else if (contentType === 'analysis') {
      facebookSpecific.push('#chessanalysis', '#gameanalysis', '#chessstudy');
    }

    return [...new Set([...baseHashtags, ...facebookSpecific])].slice(0, 30);
  }

  validateContent(content: string, mediaUrls: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (content.length > 63206) {
      errors.push('Content exceeds Facebook post limit');
    }

    if (mediaUrls.length > 20) {
      errors.push('Facebook allows maximum 20 media files per post');
    }

    return { valid: errors.length === 0, errors };
  }
}

export class LinkedInAdapter implements PlatformAdapter {
  id = 'linkedin';
  name = 'LinkedIn';

  formatContent(content: string, hashtags: string[], limits: { maxLength: number; maxHashtags: number }): string {
    let formatted = content;

    formatted = this.makeProfessional(formatted);

    if (formatted.length > limits.maxLength) {
      formatted = formatted.substring(0, limits.maxLength - 3) + '...';
    }

    if (hashtags.length > 0) {
      const professionalHashtags = this.filterProfessionalHashtags(hashtags);
      const hashtagString = '\n\n' + professionalHashtags.slice(0, limits.maxHashtags).join(' ');
      if (formatted.length + hashtagString.length <= limits.maxLength) {
        formatted += hashtagString;
      }
    }

    formatted += '\n\nWhat are your thoughts on this strategic approach?';
    formatted += '\n\n#ChessProfessionals #StrategicThinking';

    return formatted;
  }

  formatTitle(title: string, limits: { maxLength: number; maxHashtags: number }): string {
    if (title.length > limits.maxLength) {
      return title.substring(0, limits.maxLength - 3) + '...';
    }
    return title;
  }

  private makeProfessional(content: string): string {
    return content
      .replace(/🔥/g, '⭐')
      .replace(/epic/gi, 'remarkable')
      .replace(/awesome/gi, 'excellent')
      .replace(/crazy/gi, 'extraordinary');
  }

  private filterProfessionalHashtags(hashtags: string[]): string[] {
    const casualHashtags = ['#viral', '#fyp', '#trending', '#epic', '#insane'];
    return hashtags.filter(tag => !casualHashtags.includes(tag.toLowerCase()));
  }

  generateOptimalHashtags(baseHashtags: string[], contentType: string): string[] {
    const linkedinSpecific = ['#chess', '#strategy', '#leadership', '#criticalthinking'];
    
    if (contentType === 'professional') {
      linkedinSpecific.push('#chesscareer', '#professionaldevelopment', '#skillbuilding');
    } else if (contentType === 'industry_insights') {
      linkedinSpecific.push('#chessindustry', '#esports', '#gaming', '#technology');
    } else if (contentType === 'career') {
      linkedinSpecific.push('#careeradvice', '#mentorship', '#learning');
    }

    const professionalBase = this.filterProfessionalHashtags(baseHashtags);
    return [...new Set([...professionalBase, ...linkedinSpecific])].slice(0, 5);
  }

  validateContent(content: string, mediaUrls: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (content.length > 3000) {
      errors.push('Content exceeds LinkedIn post limit of 3000 characters');
    }

    if (mediaUrls.length > 9) {
      errors.push('LinkedIn allows maximum 9 media files per post');
    }

    return { valid: errors.length === 0, errors };
  }
}

export class PlatformAdapterFactory {
  private static adapters: Map<string, PlatformAdapter> = new Map([
    ['youtube', new YouTubeAdapter()],
    ['tiktok', new TikTokAdapter()],
    ['instagram', new InstagramAdapter()],
    ['twitter', new TwitterAdapter()],
    ['facebook', new FacebookAdapter()],
    ['linkedin', new LinkedInAdapter()]
  ]);

  static getAdapter(platformId: string): PlatformAdapter | undefined {
    return this.adapters.get(platformId);
  }

  static getAllAdapters(): PlatformAdapter[] {
    return Array.from(this.adapters.values());
  }

  static registerAdapter(adapter: PlatformAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  static getSupportedPlatforms(): string[] {
    return Array.from(this.adapters.keys());
  }
}

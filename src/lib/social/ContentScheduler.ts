export interface TimeSlot {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  hour: number; // 0-23
  minute: number; // 0-59
  timezone: string;
}

export interface PlatformOptimalTimes {
  platform: string;
  timeSlots: TimeSlot[];
  frequency: 'daily' | 'weekly' | 'multiple_daily';
  contentTypes: string[];
}

export interface SchedulingStrategy {
  name: string;
  description: string;
  platforms: PlatformOptimalTimes[];
  globalSettings: {
    minTimeBetweenPosts: number; // minutes
    maxPostsPerDay: number;
    respectTimezones: boolean;
    avoidWeekends: boolean;
  };
}

export class ContentScheduler {
  private strategies: Map<string, SchedulingStrategy> = new Map();
  private scheduledPosts: Map<string, Date> = new Map();

  constructor() {
    this.initializeDefaultStrategies();
  }

  private initializeDefaultStrategies() {
    const strategies: SchedulingStrategy[] = [
      {
        name: 'maximum_reach',
        description: 'Optimize for maximum audience reach across all platforms',
        platforms: [
          {
            platform: 'youtube',
            timeSlots: [
              { dayOfWeek: 1, hour: 14, minute: 0, timezone: 'UTC' }, // Monday 2 PM
              { dayOfWeek: 3, hour: 16, minute: 0, timezone: 'UTC' }, // Wednesday 4 PM
              { dayOfWeek: 5, hour: 18, minute: 0, timezone: 'UTC' }  // Friday 6 PM
            ],
            frequency: 'weekly',
            contentTypes: ['analysis', 'highlights', 'tutorials']
          },
          {
            platform: 'tiktok',
            timeSlots: [
              { dayOfWeek: 1, hour: 19, minute: 0, timezone: 'UTC' }, // Monday 7 PM
              { dayOfWeek: 2, hour: 20, minute: 0, timezone: 'UTC' }, // Tuesday 8 PM
              { dayOfWeek: 3, hour: 19, minute: 0, timezone: 'UTC' }, // Wednesday 7 PM
              { dayOfWeek: 4, hour: 20, minute: 0, timezone: 'UTC' }, // Thursday 8 PM
              { dayOfWeek: 5, hour: 19, minute: 0, timezone: 'UTC' }  // Friday 7 PM
            ],
            frequency: 'daily',
            contentTypes: ['highlights', 'quick_tips', 'viral_moments']
          },
          {
            platform: 'instagram',
            timeSlots: [
              { dayOfWeek: 1, hour: 17, minute: 0, timezone: 'UTC' }, // Monday 5 PM
              { dayOfWeek: 3, hour: 17, minute: 0, timezone: 'UTC' }, // Wednesday 5 PM
              { dayOfWeek: 5, hour: 17, minute: 0, timezone: 'UTC' }  // Friday 5 PM
            ],
            frequency: 'weekly',
            contentTypes: ['highlights', 'behind_scenes', 'stories']
          },
          {
            platform: 'twitter',
            timeSlots: [
              { dayOfWeek: 1, hour: 9, minute: 0, timezone: 'UTC' },  // Monday 9 AM
              { dayOfWeek: 1, hour: 15, minute: 0, timezone: 'UTC' }, // Monday 3 PM
              { dayOfWeek: 2, hour: 9, minute: 0, timezone: 'UTC' },  // Tuesday 9 AM
              { dayOfWeek: 2, hour: 15, minute: 0, timezone: 'UTC' }, // Tuesday 3 PM
              { dayOfWeek: 3, hour: 9, minute: 0, timezone: 'UTC' },  // Wednesday 9 AM
              { dayOfWeek: 3, hour: 15, minute: 0, timezone: 'UTC' }, // Wednesday 3 PM
              { dayOfWeek: 4, hour: 9, minute: 0, timezone: 'UTC' },  // Thursday 9 AM
              { dayOfWeek: 4, hour: 15, minute: 0, timezone: 'UTC' }, // Thursday 3 PM
              { dayOfWeek: 5, hour: 9, minute: 0, timezone: 'UTC' },  // Friday 9 AM
              { dayOfWeek: 5, hour: 15, minute: 0, timezone: 'UTC' }  // Friday 3 PM
            ],
            frequency: 'multiple_daily',
            contentTypes: ['quick_updates', 'highlights', 'engagement']
          },
          {
            platform: 'facebook',
            timeSlots: [
              { dayOfWeek: 2, hour: 13, minute: 0, timezone: 'UTC' }, // Tuesday 1 PM
              { dayOfWeek: 4, hour: 15, minute: 0, timezone: 'UTC' }, // Thursday 3 PM
              { dayOfWeek: 6, hour: 14, minute: 0, timezone: 'UTC' }  // Saturday 2 PM
            ],
            frequency: 'weekly',
            contentTypes: ['analysis', 'community', 'events']
          },
          {
            platform: 'linkedin',
            timeSlots: [
              { dayOfWeek: 2, hour: 8, minute: 0, timezone: 'UTC' },  // Tuesday 8 AM
              { dayOfWeek: 4, hour: 8, minute: 0, timezone: 'UTC' }   // Thursday 8 AM
            ],
            frequency: 'weekly',
            contentTypes: ['professional', 'analysis', 'industry_news']
          }
        ],
        globalSettings: {
          minTimeBetweenPosts: 30,
          maxPostsPerDay: 8,
          respectTimezones: true,
          avoidWeekends: false
        }
      },
      {
        name: 'engagement_focused',
        description: 'Optimize for maximum engagement and interaction',
        platforms: [
          {
            platform: 'tiktok',
            timeSlots: [
              { dayOfWeek: 1, hour: 18, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 2, hour: 19, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 3, hour: 18, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 4, hour: 19, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 5, hour: 20, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 6, hour: 19, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 0, hour: 18, minute: 0, timezone: 'UTC' }
            ],
            frequency: 'daily',
            contentTypes: ['viral_moments', 'interactive', 'trending']
          },
          {
            platform: 'instagram',
            timeSlots: [
              { dayOfWeek: 1, hour: 19, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 3, hour: 19, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 5, hour: 19, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 0, hour: 16, minute: 0, timezone: 'UTC' }
            ],
            frequency: 'weekly',
            contentTypes: ['stories', 'reels', 'interactive']
          },
          {
            platform: 'twitter',
            timeSlots: [
              { dayOfWeek: 1, hour: 12, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 1, hour: 18, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 2, hour: 12, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 2, hour: 18, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 3, hour: 12, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 3, hour: 18, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 4, hour: 12, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 4, hour: 18, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 5, hour: 12, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 5, hour: 18, minute: 0, timezone: 'UTC' }
            ],
            frequency: 'multiple_daily',
            contentTypes: ['polls', 'questions', 'live_commentary']
          }
        ],
        globalSettings: {
          minTimeBetweenPosts: 15,
          maxPostsPerDay: 12,
          respectTimezones: true,
          avoidWeekends: false
        }
      },
      {
        name: 'professional',
        description: 'Focus on professional chess content and educational material',
        platforms: [
          {
            platform: 'youtube',
            timeSlots: [
              { dayOfWeek: 2, hour: 16, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 4, hour: 16, minute: 0, timezone: 'UTC' }
            ],
            frequency: 'weekly',
            contentTypes: ['tutorials', 'analysis', 'masterclass']
          },
          {
            platform: 'linkedin',
            timeSlots: [
              { dayOfWeek: 1, hour: 8, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 3, hour: 8, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 5, hour: 8, minute: 0, timezone: 'UTC' }
            ],
            frequency: 'weekly',
            contentTypes: ['professional', 'industry_insights', 'career']
          },
          {
            platform: 'twitter',
            timeSlots: [
              { dayOfWeek: 1, hour: 9, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 3, hour: 9, minute: 0, timezone: 'UTC' },
              { dayOfWeek: 5, hour: 9, minute: 0, timezone: 'UTC' }
            ],
            frequency: 'weekly',
            contentTypes: ['educational', 'tips', 'analysis']
          }
        ],
        globalSettings: {
          minTimeBetweenPosts: 60,
          maxPostsPerDay: 4,
          respectTimezones: true,
          avoidWeekends: true
        }
      }
    ];

    strategies.forEach(strategy => {
      this.strategies.set(strategy.name, strategy);
    });
  }

  getOptimalPostTime(
    platforms: string[],
    contentType: string,
    strategy: string = 'maximum_reach',
    baseTime?: Date
  ): Date {
    const selectedStrategy = this.strategies.get(strategy);
    if (!selectedStrategy) {
      throw new Error(`Strategy ${strategy} not found`);
    }

    const now = baseTime || new Date();
    const candidates: Date[] = [];

    platforms.forEach(platformId => {
      const platformConfig = selectedStrategy.platforms.find(p => p.platform === platformId);
      if (!platformConfig) return;

      if (!platformConfig.contentTypes.includes(contentType) && !platformConfig.contentTypes.includes('all')) {
        return;
      }

      for (let day = 0; day < 7; day++) {
        platformConfig.timeSlots.forEach(slot => {
          const candidateDate = new Date(now);
          candidateDate.setDate(now.getDate() + day);
          
          const dayDiff = (slot.dayOfWeek - candidateDate.getDay() + 7) % 7;
          candidateDate.setDate(candidateDate.getDate() + dayDiff);
          
          candidateDate.setHours(slot.hour, slot.minute, 0, 0);

          if (candidateDate <= now) {
            candidateDate.setDate(candidateDate.getDate() + 7);
          }

          if (selectedStrategy.globalSettings.avoidWeekends && 
              (candidateDate.getDay() === 0 || candidateDate.getDay() === 6)) {
            return;
          }

          if (this.getPostsCountForDay(candidateDate) >= selectedStrategy.globalSettings.maxPostsPerDay) {
            return;
          }

          if (this.hasRecentPost(candidateDate, selectedStrategy.globalSettings.minTimeBetweenPosts)) {
            return;
          }

          candidates.push(candidateDate);
        });
      }
    });

    if (candidates.length === 0) {
      const fallbackTime = new Date(now);
      fallbackTime.setHours(fallbackTime.getHours() + 1);
      return fallbackTime;
    }

    candidates.sort((a, b) => a.getTime() - b.getTime());
    return candidates[0];
  }

  scheduleContent(
    contentId: string,
    platforms: string[],
    contentType: string,
    strategy: string = 'maximum_reach',
    customTime?: Date
  ): Date {
    const scheduledTime = customTime || this.getOptimalPostTime(platforms, contentType, strategy);
    
    this.scheduledPosts.set(contentId, scheduledTime);
    return scheduledTime;
  }

  getScheduledTime(contentId: string): Date | undefined {
    return this.scheduledPosts.get(contentId);
  }

  rescheduleContent(contentId: string, newTime: Date): void {
    this.scheduledPosts.set(contentId, newTime);
  }

  cancelScheduledContent(contentId: string): boolean {
    return this.scheduledPosts.delete(contentId);
  }

  private getPostsCountForDay(date: Date): number {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    let count = 0;
    this.scheduledPosts.forEach(scheduledTime => {
      if (scheduledTime >= dayStart && scheduledTime <= dayEnd) {
        count++;
      }
    });

    return count;
  }

  private hasRecentPost(targetTime: Date, minMinutesBetween: number): boolean {
    const minTime = new Date(targetTime.getTime() - minMinutesBetween * 60 * 1000);
    const maxTime = new Date(targetTime.getTime() + minMinutesBetween * 60 * 1000);

    for (const scheduledTime of this.scheduledPosts.values()) {
      if (scheduledTime >= minTime && scheduledTime <= maxTime) {
        return true;
      }
    }

    return false;
  }

  getUpcomingPosts(hours: number = 24): Array<{ contentId: string; scheduledTime: Date }> {
    const now = new Date();
    const cutoff = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const upcoming: Array<{ contentId: string; scheduledTime: Date }> = [];
    
    this.scheduledPosts.forEach((scheduledTime, contentId) => {
      if (scheduledTime >= now && scheduledTime <= cutoff) {
        upcoming.push({ contentId, scheduledTime });
      }
    });

    return upcoming.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  }

  getStrategies(): SchedulingStrategy[] {
    return Array.from(this.strategies.values());
  }

  addCustomStrategy(strategy: SchedulingStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  updateStrategy(name: string, updates: Partial<SchedulingStrategy>): void {
    const existing = this.strategies.get(name);
    if (existing) {
      this.strategies.set(name, { ...existing, ...updates });
    }
  }

  removeStrategy(name: string): boolean {
    return this.strategies.delete(name);
  }

  analyzeOptimalTimes(platform: string, contentType: string, timeRange: { start: Date; end: Date }): TimeSlot[] {
    const isVideoContent = contentType.includes('video');
    const isWeekend = timeRange.start.getDay() === 0 || timeRange.start.getDay() === 6;
    
    const defaultOptimalTimes: { [key: string]: TimeSlot[] } = {
      'youtube': [
        { dayOfWeek: 1, hour: 14, minute: 0, timezone: 'UTC' },
        { dayOfWeek: 3, hour: 16, minute: 0, timezone: 'UTC' },
        { dayOfWeek: 5, hour: 18, minute: 0, timezone: 'UTC' }
      ],
      'tiktok': [
        { dayOfWeek: 1, hour: 19, minute: 0, timezone: 'UTC' },
        { dayOfWeek: 2, hour: 20, minute: 0, timezone: 'UTC' },
        { dayOfWeek: 3, hour: 19, minute: 0, timezone: 'UTC' }
      ],
      'instagram': [
        { dayOfWeek: 1, hour: 17, minute: 0, timezone: 'UTC' },
        { dayOfWeek: 3, hour: 17, minute: 0, timezone: 'UTC' },
        { dayOfWeek: 5, hour: 17, minute: 0, timezone: 'UTC' }
      ],
      'twitter': [
        { dayOfWeek: 1, hour: 9, minute: 0, timezone: 'UTC' },
        { dayOfWeek: 1, hour: 15, minute: 0, timezone: 'UTC' },
        { dayOfWeek: 3, hour: 9, minute: 0, timezone: 'UTC' },
        { dayOfWeek: 3, hour: 15, minute: 0, timezone: 'UTC' }
      ]
    };

    const baseTimes = defaultOptimalTimes[platform] || [];
    
    if (isVideoContent && platform === 'youtube') {
      return baseTimes.filter(slot => slot.hour >= 17);
    }
    
    if (isWeekend && platform === 'linkedin') {
      return [];
    }
    
    return baseTimes;
  }

  generateSchedulingReport(): {
    totalScheduled: number;
    upcomingWeek: number;
    platformBreakdown: { [platform: string]: number };
    timeDistribution: { [hour: string]: number };
  } {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const report = {
      totalScheduled: this.scheduledPosts.size,
      upcomingWeek: 0,
      platformBreakdown: {} as { [platform: string]: number },
      timeDistribution: {} as { [hour: string]: number }
    };

    this.scheduledPosts.forEach(scheduledTime => {
      if (scheduledTime >= now && scheduledTime <= weekFromNow) {
        report.upcomingWeek++;
      }

      const hour = scheduledTime.getHours().toString().padStart(2, '0') + ':00';
      report.timeDistribution[hour] = (report.timeDistribution[hour] || 0) + 1;
    });

    return report;
  }
}

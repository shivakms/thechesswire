// TheChessWire.news - Comprehensive TypeScript Definitions

// ============================================================================
// CORE TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  username?: string;
  passwordHash: string;
  mfaSecret?: string;
  verificationToken?: string;
  verifiedAt?: Date;
  lastLoginAt?: Date;
  riskScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  username: string;
  rating: number;
  country: string;
  chessStyle: string;
  voicePreference: string;
  subscriptionTier: 'free' | 'premium' | 'enterprise' | 'healthcare';
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'master';
  interests: string[];
  notificationPreferences: NotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categories: {
    news: boolean;
    training: boolean;
    social: boolean;
    security: boolean;
    marketing: boolean;
  };
}

// ============================================================================
// SECURITY TYPES
// ============================================================================

export interface SecurityEvent {
  id: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  eventType: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export type SecurityEventType = 
  | 'failed_login'
  | 'suspicious_activity'
  | 'rate_limit_exceeded'
  | 'geographic_block'
  | 'tor_detection'
  | 'vpn_detection'
  | 'bot_detection'
  | 'ddos_attack'
  | 'malware_detection'
  | 'account_compromise';

export interface ThreatIntelligence {
  id: string;
  ipAddress: string;
  threatType: string;
  confidence: number;
  source: string;
  details: Record<string, any>;
  createdAt: Date;
  expiresAt: Date;
}

export interface BanRecord {
  id: string;
  userId?: string;
  ipAddress: string;
  reason: string;
  duration: number; // seconds, 0 = permanent
  createdAt: Date;
  expiresAt?: Date;
  appealed: boolean;
  appealStatus?: 'pending' | 'approved' | 'rejected';
  appealReason?: string;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface MFAConfig {
  userId: string;
  type: 'totp' | 'sms' | 'email';
  secret?: string;
  phoneNumber?: string;
  email?: string;
  enabled: boolean;
  backupCodes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivity: Date;
}

export interface DeviceFingerprint {
  userId: string;
  fingerprint: string;
  deviceType: string;
  browser: string;
  os: string;
  trusted: boolean;
  lastUsed: Date;
  createdAt: Date;
}

// ============================================================================
// VOICE SYSTEM TYPES
// ============================================================================

export interface VoiceRequest {
  id: string;
  userId?: string;
  text: string;
  voiceId: string;
  voiceMode: 'calm' | 'expressive' | 'dramatic' | 'poetic';
  speed: number;
  volume: number;
  language: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audioUrl?: string;
  duration?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface VoiceCache {
  id: string;
  textHash: string;
  voiceId: string;
  voiceMode: string;
  speed: number;
  volume: number;
  language: string;
  audioUrl: string;
  duration: number;
  accessCount: number;
  lastAccessed: Date;
  createdAt: Date;
  expiresAt: Date;
}

// ============================================================================
// GAME ANALYSIS TYPES
// ============================================================================

export interface GameAnalysis {
  id: string;
  userId: string;
  pgn: string;
  title: string;
  result: 'win' | 'loss' | 'draw';
  accuracy: number;
  blunders: number;
  mistakes: number;
  inaccuracies: number;
  averageCentipawnLoss: number;
  opening: string;
  middlegame: string;
  endgame: string;
  criticalMoments: CriticalMoment[];
  analysis: string;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CriticalMoment {
  moveNumber: number;
  position: string; // FEN
  evaluation: number;
  bestMove: string;
  playedMove: string;
  mistake: string;
  explanation: string;
}

// ============================================================================
// ECHOSAGE TRAINING TYPES
// ============================================================================

export interface TrainingSession {
  id: string;
  userId: string;
  coachId: string;
  sessionType: SessionType;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
  focus: string[];
  exercises: Exercise[];
  progress: number; // 0-100
  feedback: Feedback[];
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface SessionType {
  type: 'opening' | 'middlegame' | 'endgame' | 'tactics' | 'strategy' | 'psychology' | 'time_management';
  subtype: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
}

export interface Exercise {
  id: string;
  type: 'puzzle' | 'analysis' | 'simulation' | 'drill' | 'game' | 'review';
  title: string;
  description: string;
  position: string; // FEN
  moves: string[];
  solution: string[];
  hints: string[];
  difficulty: number; // 1-10
  timeLimit: number; // seconds
  points: number;
  completed: boolean;
  userAnswer?: string;
  correct: boolean;
  timeSpent: number;
  attempts: number;
}

export interface Feedback {
  id: string;
  type: 'positive' | 'constructive' | 'critical' | 'motivational';
  message: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
  actionItems: string[];
  timestamp: Date;
}

// ============================================================================
// AI COACH TYPES
// ============================================================================

export interface AICoach {
  id: string;
  userId: string;
  personality: CoachPersonality;
  expertise: string[];
  communicationStyle: string;
  teachingMethod: string;
  motivationalStyle: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CoachPersonality {
  type: 'analytical' | 'intuitive' | 'aggressive' | 'defensive' | 'creative' | 'systematic';
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  motivationalQuotes: string[];
}

export interface PsychologicalProfile {
  id: string;
  userId: string;
  playingStyle: string;
  decisionMaking: string;
  timeManagement: string;
  stressResponse: string;
  confidence: number; // 0-100
  focus: number; // 0-100
  patience: number; // 0-100
  aggression: number; // 0-100
  adaptability: number; // 0-100
  analysis: string;
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// NEWS & CONTENT TYPES
// ============================================================================

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  source: string;
  url: string;
  publishedAt: Date;
  category: string;
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  engagement: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
  };
  isAI: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentGenerator {
  id: string;
  name: string;
  type: 'long_form' | 'breaking_news' | 'statistical' | 'tournament' | 'player_profile' | 'controversy';
  personality: string;
  writingStyle: string;
  wordCount: {
    min: number;
    max: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// VIDEO GENERATION TYPES
// ============================================================================

export interface VideoGeneration {
  id: string;
  userId: string;
  gameId: string;
  theme: 'epic_battle' | 'zen_garden' | 'cyber_warfare' | 'classical_concert' | 'street_chess';
  quality: '720p' | '1080p' | '4k';
  duration: number; // seconds
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  metadata: {
    music: string;
    commentary: string;
    effects: string[];
    transitions: string[];
  };
  createdAt: Date;
  completedAt?: Date;
}

// ============================================================================
// SOCIAL MEDIA TYPES
// ============================================================================

export interface SocialMediaPost {
  id: string;
  userId: string;
  platform: 'twitter' | 'instagram' | 'tiktok' | 'youtube' | 'facebook';
  content: string;
  mediaUrls: string[];
  scheduledAt: Date;
  publishedAt?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views: number;
  };
  hashtags: string[];
  mentions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialMediaAccount {
  id: string;
  userId: string;
  platform: 'twitter' | 'instagram' | 'tiktok' | 'youtube' | 'facebook';
  accountId: string;
  username: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// PAYMENT & SUBSCRIPTION TYPES
// ============================================================================

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: Record<string, number>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number; // in cents
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  stripePaymentIntentId: string;
  stripeChargeId?: string;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// TITLED PLAYER TYPES
// ============================================================================

export interface TitledPlayer {
  id: string;
  userId: string;
  fideId: string;
  title: 'GM' | 'IM' | 'FM' | 'CM' | 'WGM' | 'WIM' | 'WFM' | 'WCM';
  rating: number;
  country: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments: string[];
  revenueShare: number; // percentage
  totalEarnings: number; // in cents
  monthlyEarnings: number; // in cents
  createdAt: Date;
  updatedAt: Date;
}

export interface RevenueShare {
  id: string;
  titledPlayerId: string;
  month: string; // YYYY-MM
  earnings: number; // in cents
  views: number;
  engagement: number;
  payoutStatus: 'pending' | 'paid' | 'failed';
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  category: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface PushNotification {
  id: string;
  userId: string;
  deviceToken: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  createdAt: Date;
}

// ============================================================================
// SUPPORT TYPES
// ============================================================================

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  aiResponse?: string;
  humanResponse?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  ticketId: string;
  senderType: 'user' | 'ai' | 'human';
  message: string;
  timestamp: Date;
}

// ============================================================================
// MONITORING TYPES
// ============================================================================

export interface HealthCheck {
  id: string;
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number; // milliseconds
  error?: string;
  timestamp: Date;
}

export interface PerformanceMetric {
  id: string;
  metric: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
  timestamp: Date;
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

// ============================================================================
// MOBILE APP TYPES
// ============================================================================

export interface MobileDevice {
  id: string;
  userId: string;
  deviceId: string;
  platform: 'ios' | 'android';
  version: string;
  pushToken?: string;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OfflineSync {
  id: string;
  userId: string;
  deviceId: string;
  action: 'create' | 'update' | 'delete';
  entityType: string;
  entityId: string;
  data: Record<string, any>;
  status: 'pending' | 'synced' | 'failed';
  createdAt: Date;
  syncedAt?: Date;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================================
// ENVIRONMENT TYPES
// ============================================================================

export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  ELEVENLABS_API_KEY: string;
  VOICE_ID: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  SMTP_HOST: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  FCM_SERVER_KEY: string;
  CLOUDFLARE_API_KEY: string;
  IPQUALITYSCORE_API_KEY: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  AWS_S3_BUCKET: string;
  SENTRY_DSN?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type EventHandler<T = any> = (event: T) => void | Promise<void>;

export type AsyncFunction<T = any, R = any> = (arg: T) => Promise<R>;

// ============================================================================
// CONSTANTS
// ============================================================================

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
  HEALTHCARE: 'healthcare'
} as const;

export const SECURITY_EVENT_TYPES = {
  FAILED_LOGIN: 'failed_login',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  GEOGRAPHIC_BLOCK: 'geographic_block',
  TOR_DETECTION: 'tor_detection',
  VPN_DETECTION: 'vpn_detection',
  BOT_DETECTION: 'bot_detection',
  DDOS_ATTACK: 'ddos_attack',
  MALWARE_DETECTION: 'malware_detection',
  ACCOUNT_COMPROMISE: 'account_compromise'
} as const;

export const VOICE_MODES = {
  CALM: 'calm',
  EXPRESSIVE: 'expressive',
  DRAMATIC: 'dramatic',
  POETIC: 'poetic'
} as const;

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  MASTER: 'master'
} as const;

export const SOCIAL_PLATFORMS = {
  TWITTER: 'twitter',
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
  YOUTUBE: 'youtube',
  FACEBOOK: 'facebook'
} as const; 
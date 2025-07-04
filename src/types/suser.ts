// src/types/user.ts

export interface User {
  id: number;
  email: string;
  username: string;
  echoOrigin: string;
  voiceMode: string;
  voiceEnabled: boolean;
  
  // Titled player fields
  titledPlayer: boolean;
  titledPlayerVerified: boolean;
  titledPlayerTitle?: string;
  titledPlayerVerificationMethod?: 'fide' | 'chess_com' | 'lichess';
  titledPlayerVerifiedAt?: string;
  fideId?: string;
  chessComUsername?: string;
  chessRating?: number;
  
  // Account details
  accountType: 'free' | 'premium' | 'premium_titled';
  premiumFeatures: boolean;
  echoRank?: number;
  soulCinemaCredits?: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  
  // Security
  verificationAttempts: number;
  lastVerificationAttempt?: string;
}

export interface TitledPlayerVerification {
  id: number;
  userId: number;
  verificationMethod: 'fide' | 'chess_com' | 'lichess';
  verificationStatus: 'pending' | 'verified' | 'failed' | 'manual_review';
  title?: string;
  rating?: number;
  attemptMetadata?: {
    ipAddress?: string;
    userAgent?: string;
    behaviorFingerprint?: any;
  };
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TitledPlayerReviewQueue {
  id: number;
  userId: number;
  reason: string;
  verificationData: any;
  reviewed: boolean;
  reviewedBy?: number;
  reviewDecision?: 'approved' | 'rejected' | 'needs_more_info';
  reviewNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface SecurityLog {
  id: number;
  type: string;
  userId?: number;
  ipAddress?: string;
  metadata?: any;
  createdAt: string;
}

export interface VerificationAbuse {
  id: number;
  ipAddress: string;
  fingerprintHash: string;
  userAgent?: string;
  abuseType: string;
  abuseScore: number;
  blocked: boolean;
  blockedUntil?: string;
  metadata?: any;
  createdAt: string;
}

// API Response Types
export interface VerificationResponse {
  verified: boolean;
  details?: {
    title: string;
    name?: string;
    rating?: number;
    verifiedAt: string;
    verificationMethod: string;
    platform: string;
  };
  message?: string;
  error?: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    username: string;
    email: string;
    titledPlayer: boolean;
    title?: string;
    echoOrigin: string;
    accountType: string;
  };
  token?: string;
  error?: string;
}

// Admin Dashboard Types
export interface TitledPlayerStats {
  verified: number;
  pending: number;
  fide_verified: number;
  chess_com_verified: number;
  lichess_verified: number;
  unique_titles: number;
  abuse: {
    total_attempts: number;
    blocked_attempts: number;
    unique_ips: number;
  };
}

export interface AdminTitledPlayerData {
  id: number;
  username: string;
  email: string;
  title?: string;
  rating?: number;
  method?: string;
  verified_at?: string;
  created_at: string;
  last_login?: string;
  fide_id?: string;
  chess_com_username?: string;
  articles_count: number;
  videos_count: number;
}

// Form Types
export interface TitledPlayerFormData {
  isTitledPlayer: boolean;
  fideId: string;
  chessComUsername: string;
  verificationStatus: 'none' | 'verifying' | 'verified' | 'failed';
  verificationDetails?: {
    title?: string;
    name?: string;
    rating?: number;
  };
}
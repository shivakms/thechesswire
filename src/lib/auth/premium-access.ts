import { User } from './auth';
import { UserRole } from './roles';

export interface PremiumAccess {
  hasAccess: boolean;
  reason?: string;
  expiresAt?: Date;
  tier: 'free' | 'premium' | 'titled';
}

/**
 * Module 402: Premium Membership Access Control System
 * Checks if a user has access to premium features
 */
export function checkPremiumAccess(user: User | null): PremiumAccess {
  if (!user) {
    return {
      hasAccess: false,
      reason: 'User not authenticated',
      tier: 'free'
    };
  }

  // Titled players get all premium features for free
  if (user.role === UserRole.TITLED_PLAYER || user.role === UserRole.CONTENT_CREATOR) {
    return {
      hasAccess: true,
      tier: 'titled'
    };
  }

  // Check premium status
  if (user.isPremium) {
    return {
      hasAccess: true,
      tier: 'premium'
    };
  }

  return {
    hasAccess: false,
    reason: 'Premium subscription required',
    tier: 'free'
  };
}

/**
 * Check if user can access specific premium features
 */
export function canAccessFeature(user: User | null, feature: string): boolean {
  const access = checkPremiumAccess(user);
  
  if (access.hasAccess) return true;

  // Some features might have different access rules
  switch (feature) {
    case 'voice-player':
    case 'replay-board':
    case 'download-pdf':
      return access.hasAccess;
    default:
      return access.hasAccess;
  }
}

/**
 * Get premium upgrade URL
 */
export function getUpgradeUrl(): string {
  return '/upgrade';
}

/**
 * Check if user's premium subscription is expiring soon
 */
export function isPremiumExpiringSoon(user: User | null): boolean {
  if (!user || !user.isPremium) return false;
  
  // Check if premium expires within 7 days
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  return user.premiumExpiresAt ? user.premiumExpiresAt <= sevenDaysFromNow : false;
} 

export interface CreateUserData {
  email: string;
  password: string;
  username: string;
  echoOrigin: string;
  voiceMode: string;
  voiceEnabled: boolean;
  titledPlayer: boolean;
  titledPlayerVerified: boolean;
  titledPlayerTitle?: string | null;
  titledPlayerVerificationMethod?: string | null;
  titledPlayerVerifiedAt?: string | null;
  fideId?: string | null;
  chessComUsername?: string | null;
  chessRating?: number | null;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  acceptedAt: string;
  gdprConsent: boolean;
  behaviorFingerprint: string;
  ipAddress: string;
  userAgent: string;
  accountType: string;
  premiumFeatures: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  titledPlayerVerified: boolean;
  titledPlayerTitle?: string | null;
  echoOrigin: string;
  accountType: string;
}

export async function createUser(userData: CreateUserData): Promise<User> {
  console.log('Creating user:', userData.username);
  
  return {
    id: Date.now(),
    username: userData.username,
    email: userData.email,
    titledPlayerVerified: userData.titledPlayerVerified,
    titledPlayerTitle: userData.titledPlayerTitle,
    echoOrigin: userData.echoOrigin,
    accountType: userData.accountType
  };
}

export async function checkExistingUser(email: string, username: string): Promise<{ email: string } | null> {
  console.log('Checking existing user:', email, username);
  
  return null;
}

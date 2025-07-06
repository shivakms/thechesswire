import bcrypt from 'bcryptjs';

const mockDb = {
  async query(sql: string, params: unknown[]) {
    console.log('Mock DB Query:', sql, params);
    return { rows: [] };
  }
};

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  isTitledPlayer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  age?: number;
  originStory?: string;
  voiceMode: string;
  consentTerms?: boolean;
  consentPrivacy?: boolean;
  isTitledPlayer?: boolean;
  echoOrigin?: string;
  voiceEnabled?: boolean;
  titledPlayer?: boolean;
  titledPlayerVerified?: boolean;
  titledPlayerTitle?: string | null;
  titledPlayerVerificationMethod?: string | null;
  titledPlayerVerifiedAt?: string | null;
  fideId?: string | null;
  chessComUsername?: string | null;
  chessRating?: number | null;
  acceptedTerms?: boolean;
  acceptedPrivacy?: boolean;
  acceptedAt?: string;
  gdprConsent?: boolean;
  behaviorFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  accountType?: string;
  premiumFeatures?: boolean;
}

export async function createUser(userData: CreateUserData): Promise<User> {
  const {
    email,
    username,
    password,
    age,
    originStory,
    voiceMode,
    consentTerms,
    consentPrivacy,
    isTitledPlayer = false
  } = userData;

  const passwordHash = await bcrypt.hash(password, 12);
  const encryptedEmail = email; // Placeholder - implement encryption later
  
  const query = `
    INSERT INTO users (
      email, username, password_hash, age, origin_story, voice_mode,
      consent_terms, consent_privacy, is_titled_player, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING id, email, username, password_hash, is_titled_player, created_at, updated_at
  `;

  const values = [
    encryptedEmail,
    username,
    passwordHash,
    age,
    originStory,
    voiceMode,
    consentTerms,
    consentPrivacy,
    isTitledPlayer
  ];

  try {
    await mockDb.query(query, values);
    
    return {
      id: 'user_' + Date.now(),
      email: email,
      username: username,
      passwordHash: passwordHash,
      isTitledPlayer: isTitledPlayer,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

export async function checkExistingUser(email: string, username: string): Promise<{ emailExists: boolean; usernameExists: boolean } | null> {
  console.log(`Checking existing user: ${email}, ${username}`);
  
  return {
    emailExists: false,
    usernameExists: false
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  console.log(`Finding user by email: ${email}`);
  
  return null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  console.log(`Finding user by username: ${username}`);
  
  return null;
}

export async function updateUserTitledStatus(userId: string, isTitledPlayer: boolean): Promise<void> {
  console.log(`Updating user titled status: ${userId} -> ${isTitledPlayer}`);
  
  return Promise.resolve();
}

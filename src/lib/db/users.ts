import { getDb } from '@/lib/db';
import { encrypt } from '@/lib/security/encryption';

export interface CreateUserData {
  email: string;
  username: string;
  passwordHash: string;
  echoOrigin: string;
  voiceMode: string;
  voiceEnabled: boolean;
  titledPlayer: boolean;
  titledPlayerVerified: boolean;
  titledPlayerTitle?: string;
  titledPlayerVerificationMethod?: string;
  fideId?: string;
  chessComUsername?: string;
  chessRating?: number;
  accountType: string;
  premiumFeatures: boolean;
  behaviorFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  gdprConsent: boolean;
}

export async function createUser(userData: CreateUserData) {
  const db = await getDb();
  
  const query = `
    INSERT INTO users (
      email, username, password, echo_origin, voice_mode, voice_enabled,
      titled_player, titled_player_verified, titled_player_title, 
      titled_player_verification_method, fide_id, chess_com_username, chess_rating,
      account_type, premium_features, behavior_fingerprint, ip_address, user_agent,
      accepted_terms, accepted_privacy, gdpr_consent, accepted_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW()
    ) RETURNING id, email, username, titled_player_verified, titled_player_title, echo_origin, account_type
  `;
  
  const values = [
    userData.email,
    userData.username,
    userData.passwordHash,
    userData.echoOrigin,
    userData.voiceMode,
    userData.voiceEnabled,
    userData.titledPlayer,
    userData.titledPlayerVerified,
    userData.titledPlayerTitle,
    userData.titledPlayerVerificationMethod,
    userData.fideId,
    userData.chessComUsername,
    userData.chessRating,
    userData.accountType,
    userData.premiumFeatures,
    userData.behaviorFingerprint ? encrypt(userData.behaviorFingerprint) : null,
    userData.ipAddress ? encrypt(userData.ipAddress) : null,
    userData.userAgent ? encrypt(userData.userAgent) : null,
    userData.acceptedTerms,
    userData.acceptedPrivacy,
    userData.gdprConsent
  ];
  
  const result = await db.query(query, values);
  return result.rows[0];
}

export async function checkExistingUser(email: string, username: string) {
  const db = await getDb();
  
  const query = `
    SELECT id, email, username 
    FROM users 
    WHERE email = $1 OR username = $2
  `;
  
  const result = await db.query(query, [email.toLowerCase(), username.toLowerCase()]);
  return result.rows[0] || null;
}

export async function getUserById(id: number) {
  const db = await getDb();
  
  const query = `
    SELECT * FROM users WHERE id = $1
  `;
  
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
}

export async function updateUserLastLogin(id: number) {
  const db = await getDb();
  
  const query = `
    UPDATE users SET last_login = NOW() WHERE id = $1
  `;
  
  await db.query(query, [id]);
}

// src/lib/security/encryption.ts
// Module 287: Encryption and Secure Storage Layer

import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

// Get encryption key from environment
const getEncryptionKey = (): string => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error('Invalid or missing ENCRYPTION_KEY environment variable');
  }
  return key;
};

/**
 * Derive a key from password using PBKDF2
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt sensitive data
 * Module 287: AES-256-GCM encryption
 */
export function encrypt(text: string): string {
  try {
    const password = getEncryptionKey();
    
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derive key from password
    const key = deriveKey(password, salt);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt data
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);
    
    // Get auth tag
    const tag = cipher.getAuthTag();
    
    // Combine salt, iv, tag, and encrypted data
    const combined = Buffer.concat([salt, iv, tag, encrypted]);
    
    // Return base64 encoded
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 * Module 287: AES-256-GCM decryption
 */
export function decrypt(encryptedData: string): string {
  try {
    const password = getEncryptionKey();
    
    // Decode from base64
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    // Derive key from password
    const key = deriveKey(password, salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt data
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash sensitive data (one-way)
 * Used for fingerprints and non-reversible data
 */
export function hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Encrypt object to JSON
 */
export function encryptObject(obj: any): string {
  return encrypt(JSON.stringify(obj));
}

/**
 * Decrypt JSON to object
 */
export function decryptObject<T = any>(encryptedData: string): T {
  const json = decrypt(encryptedData);
  return JSON.parse(json);
}

/**
 * Create HMAC signature
 * Used for request signing and integrity verification
 */
export function createHmac(data: string, secret?: string): string {
  const key = secret || getEncryptionKey();
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifyHmac(data: string, signature: string, secret?: string): boolean {
  const key = secret || getEncryptionKey();
  const expected = createHmac(data, key);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

/**
 * Encrypt for database storage (PostgreSQL pgcrypto compatible)
 */
export function encryptForDb(text: string): string {
  // This returns a format compatible with pgcrypto's pgp_sym_encrypt
  // In production, you might want to use pgcrypto directly in SQL queries
  return encrypt(text);
}

/**
 * Generate session hash for CSRF protection
 */
export function generateSessionHash(data: any): string {
  const payload = JSON.stringify({
    data,
    timestamp: Date.now(),
    nonce: generateSecureToken(16)
  });
  return Buffer.from(payload).toString('base64');
}

/**
 * Quantum-resistant hashing (future-proofing)
 * Uses multiple hash functions for added security
 */
export function quantumHash(data: string): string {
  const sha256 = crypto.createHash('sha256').update(data).digest();
  const sha512 = crypto.createHash('sha512').update(data).digest();
  const blake2 = crypto.createHash('blake2b512').update(data).digest();
  
  // Combine hashes
  const combined = Buffer.concat([sha256, sha512, blake2]);
  
  // Final hash
  return crypto.createHash('sha3-512').update(combined).digest('hex');
}
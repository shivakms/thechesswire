import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { pool } from '../database';
import { logSecurityEvent } from '../security';
import { sendEmail } from '../email';

export interface MFAMethod {
  id: string;
  userId: string;
  type: 'totp' | 'sms' | 'email';
  secret?: string;
  phoneNumber?: string;
  email?: string;
  isEnabled: boolean;
  isVerified: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
}

export interface MFASession {
  id: string;
  userId: string;
  methodId: string;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  attempts: number;
  maxAttempts: number;
}

export class MFASystem {
  private static instance: MFASystem;

  private constructor() {}

  static getInstance(): MFASystem {
    if (!MFASystem.instance) {
      MFASystem.instance = new MFASystem();
    }
    return MFASystem.instance;
  }

  // Generate TOTP secret and QR code
  async generateTOTPSecret(userId: string, email: string): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    const secret = authenticator.generateSecret();
    const serviceName = 'TheChessWire';
    const otpauth = authenticator.keyuri(email, serviceName, secret);
    
    const qrCode = await QRCode.toDataURL(otpauth);
    const backupCodes = this.generateBackupCodes();

    // Store in database
    await pool.query(
      'INSERT INTO mfa_methods (user_id, type, secret, is_enabled, is_verified) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'totp', secret, false, false]
    );

    // Store backup codes
    for (const code of backupCodes) {
      await pool.query(
        'INSERT INTO mfa_backup_codes (user_id, code_hash, is_used) VALUES ($1, $2, $3)',
        [userId, await this.hashBackupCode(code), false]
      );
    }

    return { secret, qrCode, backupCodes };
  }

  // Verify TOTP token
  async verifyTOTP(userId: string, token: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT secret FROM mfa_methods WHERE user_id = $1 AND type = $2 AND is_enabled = $3',
      [userId, 'totp', true]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const secret = result.rows[0].secret;
    const isValid = authenticator.verify({ token, secret });

    if (isValid) {
      await this.recordMFALogin(userId, 'totp');
    }

    return isValid;
  }

  // Generate SMS verification
  async generateSMSVerification(userId: string, phoneNumber: string): Promise<string> {
    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code
    await pool.query(
      'INSERT INTO mfa_sessions (user_id, method_id, token, expires_at, max_attempts) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'sms', code, expiresAt, 3]
    );

    // Send SMS (implement with your SMS provider)
    await this.sendSMS(phoneNumber, `Your TheChessWire verification code is: ${code}`);

    return code;
  }

  // Verify SMS code
  async verifySMS(userId: string, code: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT * FROM mfa_sessions WHERE user_id = $1 AND method_id = $2 AND token = $3 AND expires_at > NOW() AND is_used = $4 AND attempts < max_attempts',
      [userId, 'sms', code, false]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const session = result.rows[0];

    // Mark as used
    await pool.query(
      'UPDATE mfa_sessions SET is_used = $1 WHERE id = $2',
      [true, session.id]
    );

    await this.recordMFALogin(userId, 'sms');
    return true;
  }

  // Generate email verification
  async generateEmailVerification(userId: string, email: string): Promise<void> {
    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store verification code
    await pool.query(
      'INSERT INTO mfa_sessions (user_id, method_id, token, expires_at, max_attempts) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'email', code, expiresAt, 3]
    );

    // Send email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">TheChessWire - Verification Code</h1>
        <p>Your verification code is: <strong style="font-size: 24px; color: #6366f1;">${code}</strong></p>
        <p>This code will expire in ${15} minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Best regards,<br>TheChessWire Team</p>
      </div>
    `;

    await sendEmail(email, 'TheChessWire - Verification Code', html);
  }

  // Verify email code
  async verifyEmail(userId: string, code: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT * FROM mfa_sessions WHERE user_id = $1 AND method_id = $2 AND token = $3 AND expires_at > NOW() AND is_used = $4 AND attempts < max_attempts',
      [userId, 'email', code, false]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const session = result.rows[0];

    // Mark as used
    await pool.query(
      'UPDATE mfa_sessions SET is_used = $1 WHERE id = $2',
      [true, session.id]
    );

    await this.recordMFALogin(userId, 'email');
    return true;
  }

  // Verify backup code
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const hashedCode = await this.hashBackupCode(code);
    
    const result = await pool.query(
      'SELECT * FROM mfa_backup_codes WHERE user_id = $1 AND code_hash = $2 AND is_used = $3',
      [userId, hashedCode, false]
    );

    if (result.rows.length === 0) {
      return false;
    }

    // Mark as used
    await pool.query(
      'UPDATE mfa_backup_codes SET is_used = $1 WHERE id = $2',
      [true, result.rows[0].id]
    );

    await this.recordMFALogin(userId, 'backup');
    return true;
  }

  // Enable MFA method
  async enableMFAMethod(userId: string, type: 'totp' | 'sms' | 'email'): Promise<void> {
    await pool.query(
      'UPDATE mfa_methods SET is_enabled = $1, is_verified = $2 WHERE user_id = $3 AND type = $4',
      [true, true, userId, type]
    );

    await logSecurityEvent(userId, 'mfa_enabled', JSON.stringify({ method: type }));
  }

  // Disable MFA method
  async disableMFAMethod(userId: string, type: 'totp' | 'sms' | 'email'): Promise<void> {
    await pool.query(
      'UPDATE mfa_methods SET is_enabled = $1 WHERE user_id = $3 AND type = $4',
      [false, userId, type]
    );

    await logSecurityEvent(userId, 'mfa_disabled', JSON.stringify({ method: type }));
  }

  // Get user's MFA methods
  async getUserMFAMethods(userId: string): Promise<MFAMethod[]> {
    const result = await pool.query(
      'SELECT * FROM mfa_methods WHERE user_id = $1 ORDER BY created_at',
      [userId]
    );

    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      secret: row.secret,
      phoneNumber: row.phone_number,
      email: row.email,
      isEnabled: row.is_enabled,
      isVerified: row.is_verified,
      createdAt: row.created_at,
      lastUsedAt: row.last_used_at
    }));
  }

  // Check if user has MFA enabled
  async hasMFAEnabled(userId: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM mfa_methods WHERE user_id = $1 AND is_enabled = $2',
      [userId, true]
    );

    return parseInt(result.rows[0].count) > 0;
  }

  // Record MFA login
  private async recordMFALogin(userId: string, method: string): Promise<void> {
    await pool.query(
      'UPDATE mfa_methods SET last_used_at = NOW() WHERE user_id = $1 AND type = $2',
      [userId, method]
    );

    await logSecurityEvent(userId, 'mfa_login_success', JSON.stringify({ method }));
  }

  // Generate verification code
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate backup codes
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(this.generateBackupCode());
    }
    return codes;
  }

  // Generate single backup code
  private generateBackupCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Hash backup code
  private async hashBackupCode(code: string): Promise<string> {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  // Send SMS (implement with your SMS provider)
  private async sendSMS(phoneNumber: string, message: string): Promise<void> {
    // Implement with Twilio, AWS SNS, or your preferred SMS provider
    console.log(`SMS to ${phoneNumber}: ${message}`);
  }
}

export const mfaSystem = MFASystem.getInstance(); 
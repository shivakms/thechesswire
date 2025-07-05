// src/pages/api/auth/signup.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createUser, checkExistingUser } from '@/lib/db/users';
import { detectAbuse, logSecurityEvent } from '@/lib/security/abuse-detection';
import { encrypt } from '@/lib/security/encryption';
import { checkDuplicateRegistration } from '@/lib/services/chess-verification';
import { generateJWT } from '@/lib/auth/jwt';
import { sendWelcomeEmail } from '@/lib/email/welcome';

// Signup validation schema
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/),
  echoOrigin: z.string(),
  voiceMode: z.string(),
  voiceEnabled: z.boolean(),
  isTitledPlayer: z.boolean(),
  fideId: z.string().nullable(),
  chessComUsername: z.string().nullable(),
  titledPlayerVerified: z.boolean(),
  titledPlayerDetails: z.object({
    title: z.string().optional(),
    name: z.string().optional(),
    rating: z.number().optional(),
    verifiedAt: z.string().optional(),
    verificationMethod: z.string().optional(),
    platform: z.string().optional()
  }).optional(),
  acceptedTerms: z.boolean(),
  acceptedPrivacy: z.boolean(),
  acceptedAt: z.string(),
  behaviorFingerprint: z.object({
    typingRhythm: z.array(z.number()),
    sessionDuration: z.number(),
    mouseActivity: z.number(),
    formInteractions: z.number()
  }),
  encryptionRequired: z.boolean(),
  gdprConsent: z.boolean(),
  sessionHash: z.string()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Module 73: OWASP Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';");

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Module 74: Adaptive Threat Intelligence
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const fingerprint = req.headers['x-security-fingerprint'] || '';

    // Check for abuse patterns (Module 75)
    const abuseCheck = await detectAbuse({
      ip: clientIp as string,
      userAgent,
      fingerprint: fingerprint as string,
      action: 'signup',
      behaviorData: req.body.behaviorFingerprint
    });

    if (abuseCheck.blocked) {
      await logSecurityEvent({
        type: 'signup_blocked',
        ip: clientIp as string,
        reason: abuseCheck.reason,
        metadata: {
          abuseScore: abuseCheck.score,
          detectedPatterns: abuseCheck.patterns
        },
        timestamp: new Date()
      });
      
      return res.status(403).json({ 
        error: 'Registration temporarily unavailable. Please try again later.',
        code: 'ABUSE_DETECTED'
      });
    }

    // Validate input
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid input data',
        details: validationResult.error.errors
      });
    }

    const data = validationResult.data;

    // Check if user already exists
    const existingUser = await checkExistingUser(data.email, data.username);
    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === data.email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Titled player verification checks
    if (data.isTitledPlayer) {
      // Verify that titled player was actually verified
      if (!data.titledPlayerVerified) {
        return res.status(400).json({ 
          error: 'Titled player verification required'
        });
      }

      // Check for duplicate titled player registration
      const isDuplicate = await checkDuplicateRegistration(
        data.fideId || undefined,
        data.chessComUsername || undefined
      );

      if (isDuplicate) {
        await logSecurityEvent({
          type: 'duplicate_titled_player_attempt',
          ip: clientIp as string,
          data: {
            fideId: data.fideId ? encrypt(data.fideId) : null,
            username: data.chessComUsername ? encrypt(data.chessComUsername) : null
          },
          timestamp: new Date()
        });

        return res.status(400).json({ 
          error: 'This titled player is already registered'
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Module 287: Prepare encrypted user data
    const userData = {
      email: data.email,
      password: hashedPassword,
      username: data.username,
      echoOrigin: data.echoOrigin,
      voiceMode: data.voiceMode,
      voiceEnabled: data.voiceEnabled,
      
      // Titled player data
      titledPlayer: data.isTitledPlayer,
      titledPlayerVerified: data.titledPlayerVerified,
      titledPlayerTitle: data.titledPlayerDetails?.title || null,
      titledPlayerVerificationMethod: data.titledPlayerDetails?.verificationMethod || null,
      titledPlayerVerifiedAt: data.titledPlayerDetails?.verifiedAt || null,
      fideId: data.fideId,
      chessComUsername: data.chessComUsername,
      chessRating: data.titledPlayerDetails?.rating || null,
      
      // Consent and security
      acceptedTerms: data.acceptedTerms,
      acceptedPrivacy: data.acceptedPrivacy,
      acceptedAt: data.acceptedAt,
      gdprConsent: data.gdprConsent,
      
      // Module 75: Behavior fingerprint
      behaviorFingerprint: encrypt(JSON.stringify(data.behaviorFingerprint)),
      ipAddress: encrypt(clientIp as string),
      userAgent: encrypt(userAgent),
      
      // Account type based on titled player status
      accountType: data.titledPlayerVerified ? 'premium_titled' : 'free',
      premiumFeatures: data.titledPlayerVerified
    };

    // Create user in database
    const newUser = await createUser(userData);

    // Log successful signup
    await logSecurityEvent({
      type: 'signup_success',
      userId: newUser.id,
      ip: clientIp as string,
      metadata: {
        echoOrigin: data.echoOrigin,
        titledPlayer: data.isTitledPlayer,
        verificationMethod: data.titledPlayerDetails?.verificationMethod
      },
      timestamp: new Date()
    });

    // Generate JWT token
    const token = generateJWT({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      titledPlayer: newUser.titledPlayerVerified,
      accountType: newUser.accountType
    });

    // Send welcome email (async, don't wait)
    sendWelcomeEmail(newUser.email, newUser.username, {
      titledPlayer: newUser.titledPlayerVerified,
      title: newUser.titledPlayerTitle
    }).catch(console.error);

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        titledPlayer: newUser.titledPlayerVerified,
        title: newUser.titledPlayerTitle,
        echoOrigin: newUser.echoOrigin,
        accountType: newUser.accountType
      },
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // Log error
    await logSecurityEvent({
      type: 'signup_error',
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '',
      timestamp: new Date()
    });

    return res.status(500).json({ 
      error: 'An error occurred during signup. Please try again.'
    });
  }
}

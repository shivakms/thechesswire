// src/pages/api/auth/verify-titled-player.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyChessComPlayer, verifyLichessPlayer, verifyFidePlayer } from '@/lib/services/chess-verification';
import { detectAbuse, logSecurityEvent } from '@/lib/security/abuse-detection';
import { encrypt } from '@/lib/security/encryption';
import { z } from 'zod';

// Input validation schema
const verificationSchema = z.object({
  fideId: z.string().regex(/^\d+$/).optional(),
  chessComUsername: z.string().min(3).max(30).optional()
}).refine(data => data.fideId || data.chessComUsername, {
  message: "Either FIDE ID or Chess.com/Lichess username is required"
});

// Rate limiting
const verificationAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 3600000; // 1 hour

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Module 73: OWASP Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Module 74: Adaptive Threat Intelligence
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const fingerprint = req.headers['x-security-fingerprint'] || '';

    // Check for abuse patterns
    const abuseCheck = await detectAbuse({
      ip: clientIp as string,
      userAgent,
      fingerprint: fingerprint as string,
      action: 'titled_player_verification'
    });

    if (abuseCheck.blocked) {
      await logSecurityEvent({
        type: 'verification_abuse_blocked',
        ip: clientIp as string,
        reason: abuseCheck.reason,
        timestamp: new Date()
      });
      
      return res.status(403).json({ 
        error: 'Verification temporarily unavailable',
        verified: false 
      });
    }

    // Rate limiting check
    const rateLimitKey = `${clientIp}_${fingerprint}`;
    const now = Date.now();
    const attempts = verificationAttempts.get(rateLimitKey);

    if (attempts) {
      if (now - attempts.lastAttempt < RATE_LIMIT_WINDOW && attempts.count >= MAX_ATTEMPTS) {
        return res.status(429).json({ 
          error: 'Too many verification attempts. Please try again later.',
          verified: false 
        });
      }
      
      if (now - attempts.lastAttempt >= RATE_LIMIT_WINDOW) {
        attempts.count = 0;
      }
    }

    // Validate input
    const validationResult = verificationSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid input',
        verified: false 
      });
    }

    const { fideId, chessComUsername } = validationResult.data;

    // Update rate limit counter
    verificationAttempts.set(rateLimitKey, {
      count: (attempts?.count || 0) + 1,
      lastAttempt: now
    });

    let verificationResult = {
      verified: false,
      title: '',
      name: '',
      rating: 0,
      method: '',
      platform: ''
    };

    // Try FIDE verification first (most authoritative)
    if (fideId) {
      try {
        const fideResult = await verifyFidePlayer(fideId);
        if (fideResult.verified) {
          verificationResult = {
            ...fideResult,
            method: 'fide',
            platform: 'FIDE'
          };
        }
      } catch (error) {
        console.error('FIDE verification error:', error);
      }
    }

    // Try Chess.com verification
    if (!verificationResult.verified && chessComUsername) {
      try {
        const chessComResult = await verifyChessComPlayer(chessComUsername);
        if (chessComResult.verified) {
          verificationResult = {
            ...chessComResult,
            method: 'chess_com',
            platform: 'Chess.com'
          };
        }
      } catch (error) {
        console.error('Chess.com verification error:', error);
      }
    }

    // Try Lichess verification
    if (!verificationResult.verified && chessComUsername) {
      try {
        const lichessResult = await verifyLichessPlayer(chessComUsername);
        if (lichessResult.verified) {
          verificationResult = {
            ...lichessResult,
            method: 'lichess',
            platform: 'Lichess'
          };
        }
      } catch (error) {
        console.error('Lichess verification error:', error);
      }
    }

    // Log verification attempt
    await logSecurityEvent({
      type: 'titled_player_verification_attempt',
      ip: clientIp as string,
      data: {
        fideId: fideId ? encrypt(fideId) : null,
        username: chessComUsername ? encrypt(chessComUsername) : null,
        verified: verificationResult.verified,
        title: verificationResult.title,
        method: verificationResult.method
      },
      timestamp: new Date()
    });

    if (verificationResult.verified) {
      // Module 287: Encrypt sensitive data
      const encryptedDetails = {
        title: verificationResult.title,
        name: verificationResult.name,
        rating: verificationResult.rating,
        verifiedAt: new Date().toISOString(),
        verificationMethod: verificationResult.method,
        platform: verificationResult.platform
      };

      return res.status(200).json({
        verified: true,
        details: encryptedDetails,
        message: `Successfully verified as ${verificationResult.title}`
      });
    } else {
      return res.status(400).json({
        verified: false,
        message: 'Could not verify titled player status. Please ensure your credentials are correct and your profile is public.'
      });
    }

  } catch (error) {
    console.error('Verification error:', error);
    
    // Log error
    await logSecurityEvent({
      type: 'verification_error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });

    return res.status(500).json({ 
      error: 'Verification service temporarily unavailable',
      verified: false 
    });
  }
}
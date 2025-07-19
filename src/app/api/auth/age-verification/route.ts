import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/database';
import { logSecurityEvent } from '@/lib/security';
import { z } from 'zod';

const ageVerificationSchema = z.object({
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  age: z.number().min(18, 'You must be at least 18 years old'),
  consent: z.boolean().refine(val => val === true, 'Terms consent is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = ageVerificationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation Error',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const { dateOfBirth, age, consent } = validation.data;

    // Additional age validation for GDPR compliance
    if (age < 18) {
      return NextResponse.json(
        { 
          error: 'Age Restriction',
          message: 'You must be at least 18 years old to use this service as required by GDPR'
        },
        { status: 403 }
      );
    }

    // Get user from session/token (this would be implemented based on your auth system)
    const userId = request.headers.get('x-user-id'); // This would come from your auth middleware
    
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'Authentication Required',
          message: 'You must be logged in to complete age verification'
        },
        { status: 401 }
      );
    }

    // Save age verification to database
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO user_profiles (user_id, date_of_birth, age_verified, age_verification_date)
         VALUES ($1, $2, true, NOW())
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           date_of_birth = $2,
           age_verified = true,
           age_verification_date = NOW()`,
        [userId, dateOfBirth]
      );

      // Log age verification
      await logSecurityEvent({
        userId,
        eventType: 'age_verification_completed',
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { 
          age,
          dateOfBirth,
          consent,
          gdprCompliant: true
        }
      });

      return NextResponse.json({
        message: 'Age verification completed successfully',
        age,
        userType: 'adult',
        gdprCompliant: true
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Age verification failed:', error);
    return NextResponse.json(
      { 
        error: 'Verification Failed',
        message: 'Failed to complete age verification. Please try again.'
      },
      { status: 500 }
    );
  }
} 
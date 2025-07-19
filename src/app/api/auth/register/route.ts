import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Mock database connection - replace with actual database
const mockUsers: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, username, age } = await request.json();

    // Validate input
    if (!firstName || !lastName || !email || !password || !username || !age) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Age verification (18+ required)
    if (age < 18) {
      return NextResponse.json(
        { message: 'You must be 18 or older to register' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Username validation
    if (username.length < 3) {
      return NextResponse.json(
        { message: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Check if username already exists
    const existingUsername = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUsername) {
      return NextResponse.json(
        { message: 'This username is already taken' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const newUser = {
      id: mockUsers.length + 1,
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      username: username.toLowerCase(),
      age,
      emailVerified: false,
      verificationToken,
      verificationExpires,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to mock database
    mockUsers.push(newUser);

    // TODO: Send verification email
    // In production, this would send an actual email with the verification link
    console.log('Verification email would be sent to:', email);
    console.log('Verification token:', verificationToken);

    // Return success response
    return NextResponse.json({
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
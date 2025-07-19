const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const { createUser, getUserByEmail, updateUserLogin, incrementFailedLogins } = require('../services/database');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email');
const { logSecurityEvent } = require('../services/security');
const { generateTOTP, verifyTOTP } = require('../services/mfa');

const router = express.Router();

// Validation schemas
const registerSchema = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 12 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 12 characters with uppercase, lowercase, number, and special character'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 3-30 characters, alphanumeric with hyphens and underscores only')
];

const loginSchema = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Register new user
router.post('/register', registerSchema, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { email, password, username } = req.body;

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User Already Exists',
        message: 'An account with this email already exists'
      });
    }

    // Create user
    const user = await createUser({ email, password, username });

    // Generate verification token
    const verificationToken = uuidv4();
    
    // Send verification email
    await sendVerificationEmail(email, verificationToken, username);

    // Log registration
    await logSecurityEvent({
      eventType: 'user_registration',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: { email, username }
    });

    res.status(201).json({
      message: 'Account created successfully. Please check your email to verify your account.',
      userId: user.id,
      username: user.username
    });

  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({
      error: 'Registration Failed',
      message: 'Failed to create account. Please try again.'
    });
  }
});

// Login user
router.post('/login', loginSchema, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { email, password, mfaCode } = req.body;

    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      await logSecurityEvent({
        eventType: 'failed_login',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { email, reason: 'user_not_found' }
      });

      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if account is locked
    if (user.account_locked_until && new Date() < new Date(user.account_locked_until)) {
      return res.status(423).json({
        error: 'Account Locked',
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      await incrementFailedLogins(user.id);
      
      await logSecurityEvent({
        userId: user.id,
        eventType: 'failed_login',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { email, reason: 'invalid_password' }
      });

      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if email is verified
    if (!user.verified_at) {
      return res.status(403).json({
        error: 'Email Not Verified',
        message: 'Please verify your email address before logging in'
      });
    }

    // Verify MFA if enabled
    if (user.mfa_secret) {
      if (!mfaCode) {
        return res.status(400).json({
          error: 'MFA Required',
          message: 'Two-factor authentication code is required'
        });
      }

      const isValidMFA = verifyTOTP(user.mfa_secret, mfaCode);
      if (!isValidMFA) {
        await logSecurityEvent({
          userId: user.id,
          eventType: 'failed_mfa',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: { email }
        });

        return res.status(401).json({
          error: 'Invalid MFA Code',
          message: 'Two-factor authentication code is incorrect'
        });
      }
    }

    // Update last login
    await updateUserLogin(user.id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log successful login
    await logSecurityEvent({
      userId: user.id,
      eventType: 'successful_login',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: { email }
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        rating: user.rating,
        subscription_tier: user.subscription_tier,
        mfa_enabled: !!user.mfa_secret
      }
    });

  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({
      error: 'Login Failed',
      message: 'Failed to authenticate. Please try again.'
    });
  }
});

// Verify email
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Verify token in database
    const client = await require('../services/database').pool.connect();
    try {
      const result = await client.query(
        'UPDATE users SET verified_at = NOW() WHERE verification_token = $1 AND verified_at IS NULL RETURNING id',
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          error: 'Invalid Token',
          message: 'Verification token is invalid or already used'
        });
      }

      res.json({
        message: 'Email verified successfully. You can now log in.'
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Email verification failed:', error);
    res.status(500).json({
      error: 'Verification Failed',
      message: 'Failed to verify email. Please try again.'
    });
  }
});

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token
    const client = await require('../services/database').pool.connect();
    try {
      await client.query(
        'UPDATE users SET password_reset_token = $1, password_reset_expiry = $2 WHERE id = $3',
        [resetToken, resetExpiry, user.id]
      );
    } finally {
      client.release();
    }

    // Send reset email
    await sendPasswordResetEmail(email, resetToken, user.username);

    // Log password reset request
    await logSecurityEvent({
      userId: user.id,
      eventType: 'password_reset_requested',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: { email }
    });

    res.json({
      message: 'If an account with this email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password failed:', error);
    res.status(500).json({
      error: 'Request Failed',
      message: 'Failed to process password reset request.'
    });
  }
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 12 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 12 characters with uppercase, lowercase, number, and special character')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { token, password } = req.body;

    // Verify token and update password
    const client = await require('../services/database').pool.connect();
    try {
      const result = await client.query(
        'SELECT id FROM users WHERE password_reset_token = $1 AND password_reset_expiry > NOW()',
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          error: 'Invalid Token',
          message: 'Reset token is invalid or expired'
        });
      }

      const userId = result.rows[0].id;

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update password and clear reset token
      await client.query(
        'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expiry = NULL WHERE id = $2',
        [hashedPassword, userId]
      );

      // Log password reset
      await logSecurityEvent({
        userId,
        eventType: 'password_reset_completed',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        message: 'Password reset successfully. You can now log in with your new password.'
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Password reset failed:', error);
    res.status(500).json({
      error: 'Reset Failed',
      message: 'Failed to reset password. Please try again.'
    });
  }
});

// Setup MFA
router.post('/setup-mfa', async (req, res) => {
  try {
    const { userId } = req.user; // From auth middleware

    // Generate MFA secret
    const mfaSecret = generateTOTP();

    // Save MFA secret (encrypted)
    const client = await require('../services/database').pool.connect();
    try {
      await client.query(
        'UPDATE users SET mfa_secret = $1 WHERE id = $2',
        [mfaSecret, userId]
      );
    } finally {
      client.release();
    }

    // Generate QR code for authenticator app
    const qrCodeUrl = `otpauth://totp/TheChessWire:${req.user.email}?secret=${mfaSecret}&issuer=TheChessWire`;

    res.json({
      message: 'MFA setup initiated',
      secret: mfaSecret,
      qrCodeUrl
    });

  } catch (error) {
    console.error('MFA setup failed:', error);
    res.status(500).json({
      error: 'Setup Failed',
      message: 'Failed to setup MFA. Please try again.'
    });
  }
});

// Verify MFA setup
router.post('/verify-mfa-setup', [
  body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('MFA code must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { userId } = req.user;
    const { code } = req.body;

    // Get user's MFA secret
    const client = await require('../services/database').pool.connect();
    try {
      const result = await client.query(
        'SELECT mfa_secret FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0 || !result.rows[0].mfa_secret) {
        return res.status(400).json({
          error: 'MFA Not Setup',
          message: 'MFA has not been setup for this account'
        });
      }

      const mfaSecret = result.rows[0].mfa_secret;

      // Verify MFA code
      const isValid = verifyTOTP(mfaSecret, code);
      if (!isValid) {
        return res.status(400).json({
          error: 'Invalid Code',
          message: 'MFA code is incorrect'
        });
      }

      res.json({
        message: 'MFA setup completed successfully'
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('MFA verification failed:', error);
    res.status(500).json({
      error: 'Verification Failed',
      message: 'Failed to verify MFA. Please try again.'
    });
  }
});

module.exports = router; 
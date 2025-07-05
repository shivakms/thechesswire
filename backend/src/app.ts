// backend/src/app.ts

// MUST BE FIRST - Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { securityAdapter } from './security/core/SecurityAdapter';
import axios from 'axios';

// Example of how to use the security adapter in your routes
import { Pool } from 'pg';

// Initialize Express app
const app: Application = express();

// ========== SECURITY MIDDLEWARE (Applied to ALL routes) ==========

// Basic security headers (helmet adds many automatically)
app.use(helmet({
  contentSecurityPolicy: false // We set custom CSP in our middleware
}));

// Our custom security headers (includes CSP)
app.use(securityAdapter.securityHeadersMiddleware());

// CORS configuration
app.use(cors(securityAdapter.getCorsOptions()));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize ALL inputs automatically
app.use(securityAdapter.sanitizeMiddleware());

// Rate limiting on all routes
app.use(securityAdapter.rateLimitMiddleware());

// ========== DATABASE SETUP WITH ENCRYPTION ==========

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/chesswire_dev',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper function for secure database queries
async function secureQuery(query: string, params: any[] = []) {
  const { query: cleanQuery, params: cleanParams } = securityAdapter.sanitizeQuery(query, params);
  return pool.query(cleanQuery, cleanParams);
}

// ========== EXAMPLE ROUTES USING SECURITY ==========

// Public route - no auth required but still protected
app.post('/api/public/analyze-pgn', async (req, res) => {
  try {
    const { pgn } = req.body;
    
    // Validate PGN format
    if (!securityAdapter.validatePGN(pgn)) {
      return res.status(400).json({ error: 'Invalid PGN format' });
    }
    
    // Check for abuse patterns
    const abuseCheck = await securityAdapter.checkForAbuse(req);
    if (abuseCheck.isAbusive) {
      securityAdapter.logSecurityEvent('PGN Abuse Attempt', { 
        reason: abuseCheck.reason,
        ip: req.ip 
      });
      return res.status(403).json({ error: 'Request blocked' });
    }
    
    // Process PGN safely...
    return res.json({ success: true, message: 'PGN analyzed' });
    
  } catch (error) {
    securityAdapter.logError(error as Error, { route: '/analyze-pgn' });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Check username availability
app.get('/api/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Validate username format
    if (!username || username.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(username)) {
      return res.status(400).json({ 
        available: false, 
        error: 'Invalid username format' 
      });
    }
    
    // Check if username exists in database
    const result = await secureQuery(
      'SELECT COUNT(*) as count FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );
    
    const available = result.rows[0].count === '0';
    
    return res.json({ available });
    
  } catch (error) {
    securityAdapter.logError(error as Error, { route: '/check-username' });
    return res.status(500).json({ 
      available: false, 
      error: 'Unable to check username availability' 
    });
  }
});

// Verify titled player
app.post('/api/verify-titled-player', async (req, res) => {
  try {
    const { platform, username, fideId, acceptedTitles } = req.body;
    
    if (!platform || (!username && !fideId)) {
      return res.status(400).json({ 
        verified: false, 
        error: 'Missing required fields' 
      });
    }
    
    // Check for abuse
    const abuseCheck = await securityAdapter.checkForAbuse(req);
    if (abuseCheck.isAbusive) {
      return res.status(403).json({ 
        verified: false, 
        error: 'Too many verification attempts' 
      });
    }
    
    let verified = false;
    let title = '';
    let name = '';
    
    try {
      switch (platform) {
        case 'chesscom':
          // Chess.com API (you'll need to implement actual API calls)
          const chesscomResponse = await axios.get(
            `https://api.chess.com/pub/player/${username}`,
            { timeout: 5000 }
          );
          
          if (chesscomResponse.data && chesscomResponse.data.title) {
            title = chesscomResponse.data.title;
            name = chesscomResponse.data.name || username;
            verified = acceptedTitles.includes(title);
          }
          break;
          
        case 'lichess':
          // Lichess API
          const lichessResponse = await axios.get(
            `https://lichess.org/api/user/${username}`,
            { timeout: 5000 }
          );
          
          if (lichessResponse.data && lichessResponse.data.title) {
            title = lichessResponse.data.title;
            name = lichessResponse.data.username;
            verified = acceptedTitles.includes(title);
          }
          break;
          
        case 'fide':
          // FIDE verification would require their API or database access
          // For now, this is a placeholder
          // In production, you'd integrate with FIDE's system
          
          // Simulate FIDE check (replace with actual implementation)
          if (fideId && fideId.length === 8) {
            // Mock response - replace with actual FIDE API
            verified = false;
            title = '';
            name = '';
          }
          break;
      }
    } catch (apiError) {
      console.error('External API error:', apiError);
      // Don't expose external API errors to users
    }
    
    if (verified) {
      // Log successful verification
      securityAdapter.logSecurityEvent('Titled Player Verified', { 
        platform,
        username,
        title 
      });
      
      return res.json({ 
        verified: true, 
        title,
        name,
        platform 
      });
    } else {
      return res.json({ 
        verified: false,
        message: 'Title not found or not recognized' 
      });
    }
    
  } catch (error) {
    securityAdapter.logError(error as Error, { route: '/verify-titled-player' });
    return res.status(500).json({ 
      verified: false, 
      error: 'Verification service unavailable' 
    });
  }
});

// User registration with encryption
app.post('/api/auth/register', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      username,
      acceptTerms,
      echoOrigin,
      voiceMode,
      titledPlayerVerified,
      titledPlayerData
    } = req.body;
    
    // Validate email
    if (!securityAdapter.validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate username
    if (!username || username.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(username)) {
      return res.status(400).json({ error: 'Invalid username format' });
    }
    
    // Check password strength
    if (password.length < 12) {
      return res.status(400).json({ error: 'Password must be at least 12 characters' });
    }
    
    // Check if terms accepted
    if (!acceptTerms) {
      return res.status(400).json({ error: 'You must accept the terms and conditions' });
    }
    
    // Check if username or email already exists
    const existingUser = await secureQuery(
      `SELECT id FROM users 
       WHERE LOWER(username) = LOWER($1) 
       OR email_encrypted = $2`,
      [username, await securityAdapter.encryptData(email.toLowerCase())]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    
    // Hash password
    const hashedPassword = await securityAdapter.hashPassword(password);
    
    // Encrypt sensitive data
    const encryptedEmail = await securityAdapter.encryptData(email.toLowerCase());
    
    // Store user with encrypted data
    const result = await secureQuery(
      `INSERT INTO users (
        username, 
        email_encrypted, 
        password_hash, 
        echo_origin,
        voice_mode,
        titled_player,
        titled_player_data,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
       RETURNING id, username`,
      [
        username, 
        encryptedEmail, 
        hashedPassword,
        echoOrigin || 'wanderer',
        voiceMode || 'calm',
        titledPlayerVerified || false,
        titledPlayerData ? JSON.stringify(titledPlayerData) : null
      ]
    );
    
    await secureQuery(`
      INSERT INTO user_consents (user_id, ip_encrypted, consent_type, accepted, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `, [
      result.rows[0].id,
      await securityAdapter.encryptData(req.ip || 'unknown'),
      'terms_and_privacy',
      true
    ]);
    
    // Generate JWT token
    const token = securityAdapter.generateToken({
      userId: result.rows[0].id,
      username: result.rows[0].username,
      isTitledPlayer: titledPlayerVerified || false
    });
    
    // Log successful registration
    securityAdapter.logSecurityEvent('User Registration', { 
      userId: result.rows[0].id,
      username: username,
      isTitledPlayer: titledPlayerVerified || false
    });
    
    return res.json({ 
      success: true, 
      token,
      user: {
        id: result.rows[0].id,
        username: result.rows[0].username,
        isTitledPlayer: titledPlayerVerified || false,
        echoOrigin: echoOrigin || 'wanderer'
      }
    });
    
  } catch (error) {
    securityAdapter.logError(error as Error, { route: '/register' });
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// User login (supports both email and username)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    // Determine login method
    const loginField = email || username;
    if (!loginField || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }
    
    let user;
    
    if (email) {
      // Login with email
      if (!securityAdapter.validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      const encryptedEmail = await securityAdapter.encryptData(email.toLowerCase());
      const result = await secureQuery(
        `SELECT id, username, password_hash, titled_player, echo_origin 
         FROM users WHERE email_encrypted = $1`,
        [encryptedEmail]
      );
      
      if (result.rows.length > 0) {
        user = result.rows[0];
      }
    } else {
      // Login with username
      const result = await secureQuery(
        `SELECT id, username, password_hash, titled_player, echo_origin 
         FROM users WHERE LOWER(username) = LOWER($1)`,
        [username]
      );
      
      if (result.rows.length > 0) {
        user = result.rows[0];
      }
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValid = await securityAdapter.verifyPassword(password, user.password_hash);
    if (!isValid) {
      securityAdapter.logSecurityEvent('Failed Login Attempt', { 
        loginField,
        method: email ? 'email' : 'username'
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = securityAdapter.generateToken({
      userId: user.id,
      username: user.username,
      isTitledPlayer: user.titled_player
    });
    
    // Log successful login
    securityAdapter.logSecurityEvent('User Login', { 
      userId: user.id,
      username: user.username,
      method: email ? 'email' : 'username'
    });
    
    return res.json({ 
      success: true, 
      token,
      user: {
        id: user.id,
        username: user.username,
        isTitledPlayer: user.titled_player,
        echoOrigin: user.echo_origin
      }
    });
    
  } catch (error) {
    securityAdapter.logError(error as Error, { route: '/login' });
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Protected route example
app.get('/api/user/profile', 
  securityAdapter.authMiddleware(), // Requires valid JWT
  async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      
      const result = await secureQuery(
        `SELECT id, username, echo_origin, voice_mode, titled_player, created_at 
         FROM users WHERE id = $1`,
        [userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.json({ user: result.rows[0] });
      
    } catch (error) {
      securityAdapter.logError(error as Error, { route: '/profile' });
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }
);

// ========== PHASE 2B: REPLAY SESSION ENDPOINTS ==========

// Create replay session
app.post('/api/replay/sessions',
  securityAdapter.authMiddleware(),
  securityAdapter.rateLimitMiddleware(),
  async (req: express.Request, res: express.Response) => {
  try {
    const { articleId, pgnData, voiceMode, narrationEnabled } = req.body;
    const userId = (req as any).user.userId;
    
    const abuseCheck = await securityAdapter.checkForAbuse(req);
    if (abuseCheck.isAbusive) {
      return res.status(403).json({ error: 'Request blocked due to suspicious activity' });
    }
    
    // Validate inputs
    if (!pgnData) {
      return res.status(400).json({ error: 'PGN data is required' });
    }
    
    // Create replay session
    const result = await secureQuery(`
      INSERT INTO replay_sessions (article_id, user_id, pgn_data, voice_mode, narration_enabled, session_data)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created_at
    `, [
      articleId || null, 
      userId, 
      pgnData, 
      voiceMode || 'dramaticNarrator', 
      narrationEnabled !== false,
      JSON.stringify({ initialized: true })
    ]);
    
    await securityAdapter.logSecurityEvent(userId, 'replay_session_created');
    
    return res.json({
      success: true,
      sessionId: result.rows[0].id,
      createdAt: result.rows[0].created_at
    });
    
  } catch (error) {
    securityAdapter.logError(error as Error, { route: '/api/replay/sessions' });
    return res.status(500).json({ error: 'Failed to create replay session' });
  }
});

app.put('/api/replay/sessions/:id',
  securityAdapter.authMiddleware(),
  async (req: express.Request, res: express.Response) => {
  try {
    const sessionId = parseInt(req.params.id);
    const { currentMove, sessionData } = req.body;
    const userId = (req as any).user.userId;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }
    
    const result = await secureQuery(`
      UPDATE replay_sessions 
      SET current_move = $1, session_data = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4
      RETURNING id
    `, [currentMove || 0, JSON.stringify(sessionData || {}), sessionId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    return res.json({ success: true });
    
  } catch (error) {
    securityAdapter.logError(error as Error, { route: '/api/replay/sessions/:id' });
    return res.status(500).json({ error: 'Failed to update session' });
  }
});

app.get('/api/replay/sessions',
  securityAdapter.authMiddleware(),
  async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user.userId;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    
    const result = await secureQuery(`
      SELECT 
        rs.id, rs.article_id, rs.current_move, rs.narration_enabled,
        rs.voice_mode, rs.created_at, rs.updated_at,
        a.title as article_title
      FROM replay_sessions rs
      LEFT JOIN articles a ON rs.article_id = a.id
      WHERE rs.user_id = $1
      ORDER BY rs.updated_at DESC
      LIMIT $2
    `, [userId, limit]);
    
    return res.json({
      sessions: result.rows
    });
    
  } catch (error) {
    securityAdapter.logError(error as Error, { route: '/api/replay/sessions GET' });
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Module 231: Core Access Example
app.get('/api/free/soulcinema/remaining', async (req, res) => {
  try {
    // For anonymous users, use IP-based tracking
    const identifier = (req as any).user?.userId || req.ip || 'anonymous';
    
    // Check usage from database
    const result = await secureQuery(
      `SELECT COUNT(*) as used_count 
       FROM soulcinema_renders 
       WHERE user_identifier = $1 
       AND created_at > NOW() - INTERVAL '1 month'`,
      [identifier]
    );
    
    const usedCount = parseInt(result.rows[0].used_count);
    const remaining = Math.max(0, 3 - usedCount); // 3 free per month
    
    return res.json({ 
      remaining,
      total: 3,
      resetsAt: new Date(new Date().setMonth(new Date().getMonth() + 1))
    });
    
  } catch (error) {
    securityAdapter.logError(error as Error, { route: '/soulcinema/remaining' });
    return res.status(500).json({ error: 'Failed to check usage' });
  }
});

// ========== ERROR HANDLING ==========

app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  securityAdapter.logError(err, { 
    url: req.url,
    method: req.method,
    ip: req.ip 
  });
  
  res.status(500).json({ 
    error: 'Something went wrong',
    // Never expose internal errors to users
    ...(process.env.NODE_ENV === 'development' && { debug: err.message })
  });
});

// ========== DATABASE SCHEMA (Run once) ==========

async function setupDatabase() {
  try {
    // Enable pgcrypto extension
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    
    // Users table with encrypted fields
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email_encrypted TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        echo_origin VARCHAR(50),
        echo_rank INTEGER DEFAULT 0,
        voice_mode VARCHAR(50) DEFAULT 'calm',
        titled_player BOOLEAN DEFAULT FALSE,
        titled_player_data JSONB,
        fide_id VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create index on username for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username_lower 
      ON users (LOWER(username))
    `);
    
    // Abuse logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS abuse_logs (
        id SERIAL PRIMARY KEY,
        ip_address_encrypted TEXT,
        event_type VARCHAR(100),
        details JSONB,
        severity VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Usage tracking for Module 231
    await pool.query(`
      CREATE TABLE IF NOT EXISTS soulcinema_renders (
        id SERIAL PRIMARY KEY,
        user_identifier VARCHAR(100),
        pgn_hash VARCHAR(64),
        render_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Session/consent tracking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_consents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        ip_encrypted TEXT,
        consent_type VARCHAR(50),
        accepted BOOLEAN,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Database schema created successfully');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

// ========== SERVER STARTUP ==========

const PORT = process.env.PORT || 3000;

// Debug logging
console.log('Environment variables loaded:');
console.log('PORT from .env:', process.env.PORT);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('Final PORT to use:', PORT);

app.listen(PORT, async () => {
  console.log(`🚀 TheChessWire.news server running on port ${PORT}`);
  console.log(`🔒 Security: ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'} mode`);
  
  // Setup database on first run
  if (process.env.SETUP_DB === 'true') {
    await setupDatabase();
  }
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error(`💡 Try one of these solutions:`);
    console.error(`   1. Stop the other process using port ${PORT}`);
    console.error(`   2. Change PORT in backend/.env to another port (e.g., 5001)`);
    console.error(`   3. If Next.js is running, it might be using port ${PORT}`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

export default app;

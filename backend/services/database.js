const { Pool } = require('pg');
const crypto = require('crypto');

// Database connection pool
let pool;

const initializeDatabase = async () => {
  try {
    pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Encryption utilities
const encrypt = (text, key = process.env.ENCRYPTION_KEY) => {
  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text, key = process.env.ENCRYPTION_KEY) => {
  const algorithm = 'aes-256-cbc';
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipher(algorithm, key);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// User operations
const createUser = async (userData) => {
  const { email, password, username } = userData;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Hash password
    const bcrypt = require('bcryptjs');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Encrypt email
    const encryptedEmail = encrypt(email);
    
    // Create user
    const userResult = await client.query(
      'INSERT INTO users (email, password_hash, created_at) VALUES ($1, $2, NOW()) RETURNING id',
      [encryptedEmail, hashedPassword]
    );
    
    const userId = userResult.rows[0].id;
    
    // Create user profile
    await client.query(
      'INSERT INTO user_profiles (user_id, username, created_at) VALUES ($1, $2, NOW())',
      [userId, username]
    );
    
    await client.query('COMMIT');
    
    return { id: userId, username };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getUserById = async (userId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT u.id, u.email, u.password_hash, u.verified_at, u.last_login_at, 
             u.risk_score, u.failed_login_attempts, u.account_locked_until,
             up.username, up.rating, up.country, up.chess_style, up.voice_preference,
             up.subscription_tier, up.fide_id, up.title
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `, [userId]);
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    // Decrypt email
    user.email = decrypt(user.email);
    
    return user;
  } finally {
    client.release();
  }
};

const getUserByEmail = async (email) => {
  const client = await pool.connect();
  try {
    const encryptedEmail = encrypt(email);
    const result = await client.query(`
      SELECT u.id, u.email, u.password_hash, u.verified_at, u.last_login_at,
             u.risk_score, u.failed_login_attempts, u.account_locked_until,
             up.username, up.rating, up.country, up.chess_style, up.voice_preference,
             up.subscription_tier, up.fide_id, up.title
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.email = $1
    `, [encryptedEmail]);
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    // Decrypt email
    user.email = decrypt(user.email);
    
    return user;
  } finally {
    client.release();
  }
};

const updateUserLogin = async (userId) => {
  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE users SET last_login_at = NOW(), failed_login_attempts = 0 WHERE id = $1',
      [userId]
    );
  } finally {
    client.release();
  }
};

const incrementFailedLogins = async (userId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1 RETURNING failed_login_attempts',
      [userId]
    );
    
    const failedAttempts = result.rows[0].failed_login_attempts;
    
    // Lock account after 5 failed attempts for 30 minutes
    if (failedAttempts >= 5) {
      const lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      await client.query(
        'UPDATE users SET account_locked_until = $1 WHERE id = $2',
        [lockUntil, userId]
      );
    }
    
    return failedAttempts;
  } finally {
    client.release();
  }
};

// Onboarding operations
const saveOnboardingProgress = async (userId, step, data) => {
  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO onboarding_progress (user_id, step, data, completed, completed_at)
      VALUES ($1, $2, $3, true, NOW())
      ON CONFLICT (user_id, step) 
      DO UPDATE SET data = $3, completed = true, completed_at = NOW()
    `, [userId, step, JSON.stringify(data)]);
  } finally {
    client.release();
  }
};

const getUserInterests = async (userId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT interest_type, interest_level FROM user_interests WHERE user_id = $1',
      [userId]
    );
    return result.rows;
  } finally {
    client.release();
  }
};

const saveUserInterests = async (userId, interests) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Delete existing interests
    await client.query('DELETE FROM user_interests WHERE user_id = $1', [userId]);
    
    // Insert new interests
    for (const interest of interests) {
      await client.query(
        'INSERT INTO user_interests (user_id, interest_type, interest_level) VALUES ($1, $2, $3)',
        [userId, interest.type, interest.level]
      );
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Voice usage tracking
const trackVoiceUsage = async (userId, voiceMode, textLength, durationSeconds, apiCost) => {
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO voice_usage (user_id, voice_mode, text_length, duration_seconds, api_cost) VALUES ($1, $2, $3, $4, $5)',
      [userId, voiceMode, textLength, durationSeconds, apiCost]
    );
  } finally {
    client.release();
  }
};

// Content generation tracking
const trackContentGeneration = async (userId, contentType, title, contentHash, generationTime, aiModel) => {
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO content_generation (user_id, content_type, title, content_hash, generation_time_ms, ai_model) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, contentType, title, contentHash, generationTime, aiModel]
    );
  } finally {
    client.release();
  }
};

// Database health check
const healthCheck = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW() as timestamp, version() as version');
    return {
      status: 'healthy',
      timestamp: result.rows[0].timestamp,
      version: result.rows[0].version.split(' ')[0]
    };
  } finally {
    client.release();
  }
};

module.exports = {
  initializeDatabase,
  createUser,
  getUserById,
  getUserByEmail,
  updateUserLogin,
  incrementFailedLogins,
  saveOnboardingProgress,
  getUserInterests,
  saveUserInterests,
  trackVoiceUsage,
  trackContentGeneration,
  healthCheck,
  encrypt,
  decrypt
}; 
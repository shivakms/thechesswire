"use strict";
// backend/src/app.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// MUST BE FIRST - Load environment variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const SecurityAdapter_1 = require("./security/core/SecurityAdapter");
// Example of how to use the security adapter in your routes
const pg_1 = require("pg");
// Initialize Express app
const app = (0, express_1.default)();
// ========== SECURITY MIDDLEWARE (Applied to ALL routes) ==========
// Basic security headers (helmet adds many automatically)
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false // We set custom CSP in our middleware
}));
// Our custom security headers (includes CSP)
app.use(SecurityAdapter_1.securityAdapter.securityHeadersMiddleware());
// CORS configuration
app.use((0, cors_1.default)(SecurityAdapter_1.securityAdapter.getCorsOptions()));
// Body parsing with size limits
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Sanitize ALL inputs automatically
app.use(SecurityAdapter_1.securityAdapter.sanitizeMiddleware());
// Rate limiting on all routes
app.use(SecurityAdapter_1.securityAdapter.rateLimitMiddleware());
// ========== DATABASE SETUP WITH ENCRYPTION ==========
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost/chesswire_dev',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
// Helper function for secure database queries
async function secureQuery(query, params = []) {
    const { query: cleanQuery, params: cleanParams } = SecurityAdapter_1.securityAdapter.sanitizeQuery(query, params);
    return pool.query(cleanQuery, cleanParams);
}
// ========== EXAMPLE ROUTES USING SECURITY ==========
// Public route - no auth required but still protected
app.post('/api/public/analyze-pgn', async (req, res) => {
    try {
        const { pgn } = req.body;
        // Validate PGN format
        if (!SecurityAdapter_1.securityAdapter.validatePGN(pgn)) {
            return res.status(400).json({ error: 'Invalid PGN format' });
        }
        // Check for abuse patterns
        const abuseCheck = await SecurityAdapter_1.securityAdapter.checkForAbuse(req);
        if (abuseCheck.isAbusive) {
            SecurityAdapter_1.securityAdapter.logSecurityEvent('PGN Abuse Attempt', {
                reason: abuseCheck.reason,
                ip: req.ip
            });
            return res.status(403).json({ error: 'Request blocked' });
        }
        // Process PGN safely...
        res.json({ success: true, message: 'PGN analyzed' });
    }
    catch (error) {
        SecurityAdapter_1.securityAdapter.logError(error, { route: '/analyze-pgn' });
        res.status(500).json({ error: 'Internal server error' });
    }
});
// User registration with encryption
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        // Validate email
        if (!SecurityAdapter_1.securityAdapter.validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        // Check password strength
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        // Hash password
        const hashedPassword = await SecurityAdapter_1.securityAdapter.hashPassword(password);
        // Encrypt sensitive data
        const encryptedEmail = await SecurityAdapter_1.securityAdapter.encryptData(email.toLowerCase());
        // Store user with encrypted data
        const result = await secureQuery(`INSERT INTO users (username, email_encrypted, password_hash, created_at) 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING id, username`, [username, encryptedEmail, hashedPassword]);
        // Generate JWT token
        const token = SecurityAdapter_1.securityAdapter.generateToken({
            userId: result.rows[0].id,
            username: result.rows[0].username
        });
        // Log successful registration
        SecurityAdapter_1.securityAdapter.logSecurityEvent('User Registration', {
            userId: result.rows[0].id,
            username: username
        });
        res.json({
            success: true,
            token,
            user: {
                id: result.rows[0].id,
                username: result.rows[0].username
            }
        });
    }
    catch (error) {
        SecurityAdapter_1.securityAdapter.logError(error, { route: '/register' });
        res.status(500).json({ error: 'Registration failed' });
    }
});
// User login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate email
        if (!SecurityAdapter_1.securityAdapter.validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        // Encrypt email to search
        const encryptedEmail = await SecurityAdapter_1.securityAdapter.encryptData(email.toLowerCase());
        // Find user
        const result = await secureQuery('SELECT id, username, password_hash FROM users WHERE email_encrypted = $1', [encryptedEmail]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = result.rows[0];
        // Verify password
        const isValid = await SecurityAdapter_1.securityAdapter.verifyPassword(password, user.password_hash);
        if (!isValid) {
            SecurityAdapter_1.securityAdapter.logSecurityEvent('Failed Login Attempt', { email });
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate token
        const token = SecurityAdapter_1.securityAdapter.generateToken({
            userId: user.id,
            username: user.username
        });
        // Log successful login
        SecurityAdapter_1.securityAdapter.logSecurityEvent('User Login', {
            userId: user.id,
            username: user.username
        });
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username
            }
        });
    }
    catch (error) {
        SecurityAdapter_1.securityAdapter.logError(error, { route: '/login' });
        res.status(500).json({ error: 'Login failed' });
    }
});
// Protected route example
app.get('/api/user/profile', SecurityAdapter_1.securityAdapter.authMiddleware(), // Requires valid JWT
async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await secureQuery('SELECT id, username, created_at FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user: result.rows[0] });
    }
    catch (error) {
        SecurityAdapter_1.securityAdapter.logError(error, { route: '/profile' });
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});
// Module 231: Core Access Example
app.get('/api/free/soulcinema/remaining', async (req, res) => {
    try {
        // For anonymous users, use IP-based tracking
        const identifier = req.user?.userId || req.ip || 'anonymous';
        // Check usage from database
        const result = await secureQuery(`SELECT COUNT(*) as used_count 
       FROM soulcinema_renders 
       WHERE user_identifier = $1 
       AND created_at > NOW() - INTERVAL '1 month'`, [identifier]);
        const usedCount = parseInt(result.rows[0].used_count);
        const remaining = Math.max(0, 3 - usedCount); // 3 free per month
        res.json({
            remaining,
            total: 3,
            resetsAt: new Date(new Date().setMonth(new Date().getMonth() + 1))
        });
    }
    catch (error) {
        SecurityAdapter_1.securityAdapter.logError(error, { route: '/soulcinema/remaining' });
        res.status(500).json({ error: 'Failed to check usage' });
    }
});
// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
    SecurityAdapter_1.securityAdapter.logError(err, {
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
        titled_player BOOLEAN DEFAULT FALSE,
        fide_id VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
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
    }
    catch (error) {
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
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
        console.error(`💡 Try one of these solutions:`);
        console.error(`   1. Stop the other process using port ${PORT}`);
        console.error(`   2. Change PORT in backend/.env to another port (e.g., 5001)`);
        console.error(`   3. If Next.js is running, it might be using port ${PORT}`);
        process.exit(1);
    }
    else {
        console.error('Server error:', err);
    }
});
exports.default = app;
//# sourceMappingURL=app.js.map
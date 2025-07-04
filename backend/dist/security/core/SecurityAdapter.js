"use strict";
// backend/src/security/core/SecurityAdapter.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityAdapter = exports.SecurityAdapter = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validator_1 = __importDefault(require("validator"));
const xss_1 = __importDefault(require("xss"));
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const winston_1 = __importDefault(require("winston"));
// Local implementation for development
class LocalEncryptor {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        // In production, this would come from AWS KMS
        this.secretKey = crypto_1.default.scryptSync(process.env.ENCRYPTION_KEY || 'local-dev-key-32-chars-exactly!!', 'salt', 32);
    }
    async encrypt(data) {
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv(this.algorithm, this.secretKey, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        return JSON.stringify({
            encrypted,
            authTag: authTag.toString('hex'),
            iv: iv.toString('hex')
        });
    }
    async decrypt(encryptedData) {
        const { encrypted, authTag, iv } = JSON.parse(encryptedData);
        const decipher = crypto_1.default.createDecipheriv(this.algorithm, this.secretKey, Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    async hash(password) {
        return bcrypt_1.default.hash(password, 12);
    }
    async compareHash(password, hash) {
        return bcrypt_1.default.compare(password, hash);
    }
}
// AWS implementation for production (placeholder)
class AWSKMSEncryptor {
    // This would use AWS KMS SDK
    async encrypt(data) {
        // AWS KMS encryption logic
        throw new Error('AWS KMS not configured for local dev');
    }
    async decrypt(data) {
        // AWS KMS decryption logic
        throw new Error('AWS KMS not configured for local dev');
    }
    async hash(password) {
        return bcrypt_1.default.hash(password, 12);
    }
    async compareHash(password, hash) {
        return bcrypt_1.default.compare(password, hash);
    }
}
// Main Security Adapter
class SecurityAdapter {
    constructor(environment = 'development') {
        // Select appropriate implementations based on environment
        this.encryptor = environment === 'development'
            ? new LocalEncryptor()
            : new AWSKMSEncryptor();
        // Rate limiter
        this.rateLimiter = environment === 'development'
            ? new rate_limiter_flexible_1.RateLimiterMemory({
                points: 100, // Number of requests
                duration: 900, // Per 15 minutes
            })
            : new rate_limiter_flexible_1.RateLimiterRedis({
                storeClient: null, // Redis client would go here
                points: 100,
                duration: 900,
            });
        // Logger
        this.logger = winston_1.default.createLogger({
            level: 'info',
            format: winston_1.default.format.json(),
            defaultMeta: { service: 'chesswire' },
            transports: [
                new winston_1.default.transports.File({ filename: 'error.log', level: 'error' }),
                new winston_1.default.transports.File({ filename: 'combined.log' }),
                new winston_1.default.transports.Console({
                    format: winston_1.default.format.simple(),
                })
            ],
        });
        this.jwtSecret = process.env.JWT_SECRET || 'local-dev-jwt-secret';
    }
    // ========== ENCRYPTION ==========
    async encryptData(data) {
        return this.encryptor.encrypt(data);
    }
    async decryptData(encryptedData) {
        return this.encryptor.decrypt(encryptedData);
    }
    async hashPassword(password) {
        return this.encryptor.hash(password);
    }
    async verifyPassword(password, hash) {
        return this.encryptor.compareHash(password, hash);
    }
    // ========== INPUT VALIDATION ==========
    sanitizeInput(input) {
        if (!input)
            return '';
        // Basic XSS protection
        let sanitized = (0, xss_1.default)(input);
        // Additional validation
        sanitized = validator_1.default.escape(sanitized);
        return sanitized;
    }
    validateEmail(email) {
        return validator_1.default.isEmail(email);
    }
    validatePGN(pgn) {
        // Basic PGN validation
        const pgnRegex = /^(\[.*?\]\s*)*(\d+\..*?[01\/2-]+\s*)+$/;
        return pgnRegex.test(pgn.trim());
    }
    // ========== SQL INJECTION PREVENTION ==========
    sanitizeQuery(query, params) {
        // Ensure parameterized queries
        // This is a safety check - you should ALWAYS use parameterized queries
        // Log suspicious patterns
        const suspiciousPatterns = [
            /(\b(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE)\b)/gi,
            /(--|\||;|\/\*|\*\/)/g,
            /(\bUNION\b.*\bSELECT\b)/gi
        ];
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(query)) {
                this.logger.warn('Suspicious SQL pattern detected', {
                    query,
                    pattern: pattern.toString()
                });
            }
        }
        // Clean parameters
        const cleanParams = params.map(param => {
            if (typeof param === 'string') {
                return this.sanitizeInput(param);
            }
            return param;
        });
        return { query, params: cleanParams };
    }
    // ========== JWT HANDLING ==========
    generateToken(payload, expiresIn = '7d') {
        return jsonwebtoken_1.default.sign(payload, this.jwtSecret, { expiresIn });
    }
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.jwtSecret);
        }
        catch (error) {
            this.logger.error('JWT verification failed', { error });
            throw new Error('Invalid token');
        }
    }
    // ========== RATE LIMITING ==========
    async checkRateLimit(identifier) {
        try {
            await this.rateLimiter.consume(identifier);
            return true;
        }
        catch (rejRes) {
            this.logger.warn('Rate limit exceeded', { identifier });
            return false;
        }
    }
    // ========== MIDDLEWARE FUNCTIONS ==========
    // Input sanitization middleware
    sanitizeMiddleware() {
        return (req, res, next) => {
            // Sanitize body
            if (req.body) {
                Object.keys(req.body).forEach(key => {
                    if (typeof req.body[key] === 'string') {
                        req.body[key] = this.sanitizeInput(req.body[key]);
                    }
                });
            }
            // Sanitize query params
            if (req.query) {
                Object.keys(req.query).forEach(key => {
                    if (typeof req.query[key] === 'string') {
                        req.query[key] = this.sanitizeInput(req.query[key]);
                    }
                });
            }
            // Sanitize params
            if (req.params) {
                Object.keys(req.params).forEach(key => {
                    if (typeof req.params[key] === 'string') {
                        req.params[key] = this.sanitizeInput(req.params[key]);
                    }
                });
            }
            next();
        };
    }
    // Rate limiting middleware
    rateLimitMiddleware() {
        return async (req, res, next) => {
            const identifier = req.ip || 'anonymous';
            const allowed = await this.checkRateLimit(identifier);
            if (!allowed) {
                return res.status(429).json({
                    error: 'Too many requests, please try again later.'
                });
            }
            next();
        };
    }
    // JWT authentication middleware
    authMiddleware() {
        return (req, res, next) => {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }
            try {
                const decoded = this.verifyToken(token);
                req.user = decoded;
                next();
            }
            catch (error) {
                return res.status(401).json({ error: 'Invalid token' });
            }
        };
    }
    // CORS configuration
    getCorsOptions() {
        return {
            origin: process.env.NODE_ENV === 'development'
                ? ['http://localhost:3000', 'http://localhost:3001']
                : ['https://thechesswire.news', 'https://www.thechesswire.news'],
            credentials: true,
            optionsSuccessStatus: 200,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        };
    }
    // Security headers middleware
    securityHeadersMiddleware() {
        return (req, res, next) => {
            // Equivalent to Module 73 requirements
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
            if (process.env.NODE_ENV === 'production') {
                res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
            }
            // Content Security Policy
            const cspDirectives = [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https:",
                "font-src 'self'",
                "connect-src 'self' https://api.elevenlabs.io",
                "media-src 'self'",
                "object-src 'none'",
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "form-action 'self'"
            ];
            res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
            next();
        };
    }
    // ========== LOGGING ==========
    logSecurityEvent(event, details) {
        this.logger.info('Security Event', { event, details, timestamp: new Date() });
    }
    logError(error, context) {
        this.logger.error('Error', { error: error.message, stack: error.stack, context });
    }
    // ========== ABUSE DETECTION (Module 74-75 prep) ==========
    async checkForAbuse(req) {
        const ip = req.ip || 'unknown';
        // Check rate limits
        const rateLimitOk = await this.checkRateLimit(ip);
        if (!rateLimitOk) {
            return { isAbusive: true, reason: 'Rate limit exceeded' };
        }
        // Check for suspicious patterns
        const userAgent = req.headers['user-agent'] || '';
        const suspiciousAgents = ['bot', 'crawler', 'spider', 'scraper'];
        if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
            this.logSecurityEvent('Suspicious User Agent', { ip, userAgent });
            return { isAbusive: true, reason: 'Suspicious user agent' };
        }
        // Check for common attack patterns in body
        if (req.body) {
            const bodyString = JSON.stringify(req.body);
            const attackPatterns = [
                /<script/i,
                /javascript:/i,
                /on\w+\s*=/i, // onclick, onload, etc.
                /base64,/i,
                /eval\(/i,
                /expression\(/i
            ];
            for (const pattern of attackPatterns) {
                if (pattern.test(bodyString)) {
                    this.logSecurityEvent('Attack Pattern Detected', { ip, pattern: pattern.toString() });
                    return { isAbusive: true, reason: 'Attack pattern detected' };
                }
            }
        }
        return { isAbusive: false };
    }
}
exports.SecurityAdapter = SecurityAdapter;
// Export singleton instance for consistent usage
exports.securityAdapter = new SecurityAdapter(process.env.NODE_ENV);
//# sourceMappingURL=SecurityAdapter.js.map
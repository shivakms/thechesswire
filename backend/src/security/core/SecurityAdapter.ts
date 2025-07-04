// backend/src/security/core/SecurityAdapter.ts

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import xss from 'xss';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

// Interfaces for swappable implementations
interface IEncryptor {
  encrypt(data: string): Promise<string>;
  decrypt(data: string): Promise<string>;
  hash(password: string): Promise<string>;
  compareHash(password: string, hash: string): Promise<boolean>;
}

interface IStorage {
  saveFile(fileName: string, data: Buffer): Promise<string>;
  getFile(fileName: string): Promise<Buffer>;
  deleteFile(fileName: string): Promise<void>;
}

interface ISecrets {
  getSecret(key: string): Promise<string>;
  setSecret(key: string, value: string): Promise<void>;
}

// Local implementation for development
class LocalEncryptor implements IEncryptor {
  private algorithm = 'aes-256-gcm';
  private secretKey: Buffer;
  
  constructor() {
    // In production, this would come from AWS KMS
    this.secretKey = crypto.scryptSync(
      process.env.ENCRYPTION_KEY || 'local-dev-key-32-chars-exactly!!', 
      'salt', 
      32
    );
  }

  async encrypt(data: string): Promise<string> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      encrypted,
      authTag: authTag.toString('hex'),
      iv: iv.toString('hex')
    });
  }

  async decrypt(encryptedData: string): Promise<string> {
    const { encrypted, authTag, iv } = JSON.parse(encryptedData);
    
    const decipher = crypto.createDecipheriv(
      this.algorithm, 
      this.secretKey, 
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async compareHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

// AWS implementation for production (placeholder)
class AWSKMSEncryptor implements IEncryptor {
  // This would use AWS KMS SDK
  async encrypt(data: string): Promise<string> {
    // AWS KMS encryption logic
    throw new Error('AWS KMS not configured for local dev');
  }
  
  async decrypt(data: string): Promise<string> {
    // AWS KMS decryption logic
    throw new Error('AWS KMS not configured for local dev');
  }
  
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
  
  async compareHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

// Main Security Adapter
export class SecurityAdapter {
  private encryptor: IEncryptor;
  private rateLimiter: RateLimiterMemory | RateLimiterRedis;
  private logger: winston.Logger;
  private jwtSecret: string;

  constructor(environment: 'development' | 'production' = 'development') {
    // Select appropriate implementations based on environment
    this.encryptor = environment === 'development' 
      ? new LocalEncryptor() 
      : new AWSKMSEncryptor();

    // Rate limiter
    this.rateLimiter = environment === 'development'
      ? new RateLimiterMemory({
          points: 100, // Number of requests
          duration: 900, // Per 15 minutes
        })
      : new RateLimiterRedis({
          storeClient: null, // Redis client would go here
          points: 100,
          duration: 900,
        });

    // Logger
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      defaultMeta: { service: 'chesswire' },
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({
          format: winston.format.simple(),
        })
      ],
    });

    this.jwtSecret = process.env.JWT_SECRET || 'local-dev-jwt-secret';
  }

  // ========== ENCRYPTION ==========
  async encryptData(data: string): Promise<string> {
    return this.encryptor.encrypt(data);
  }

  async decryptData(encryptedData: string): Promise<string> {
    return this.encryptor.decrypt(encryptedData);
  }

  async hashPassword(password: string): Promise<string> {
    return this.encryptor.hash(password);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return this.encryptor.compareHash(password, hash);
  }

  // ========== INPUT VALIDATION ==========
  sanitizeInput(input: string): string {
    if (!input) return '';
    
    // Basic XSS protection
    let sanitized = xss(input);
    
    // Additional validation
    sanitized = validator.escape(sanitized);
    
    return sanitized;
  }

  validateEmail(email: string): boolean {
    return validator.isEmail(email);
  }

  validatePGN(pgn: string): boolean {
    // Basic PGN validation
    const pgnRegex = /^(\[.*?\]\s*)*(\d+\..*?[01\/2-]+\s*)+$/;
    return pgnRegex.test(pgn.trim());
  }

  // ========== SQL INJECTION PREVENTION ==========
  sanitizeQuery(query: string, params: any[]): { query: string, params: any[] } {
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
  generateToken(payload: any, expiresIn: string = '7d'): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      this.logger.error('JWT verification failed', { error });
      throw new Error('Invalid token');
    }
  }

  // ========== RATE LIMITING ==========
  async checkRateLimit(identifier: string): Promise<boolean> {
    try {
      await this.rateLimiter.consume(identifier);
      return true;
    } catch (rejRes) {
      this.logger.warn('Rate limit exceeded', { identifier });
      return false;
    }
  }

  // ========== MIDDLEWARE FUNCTIONS ==========
  
  // Input sanitization middleware
  sanitizeMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
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
            req.query[key] = this.sanitizeInput(req.query[key] as string);
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
    return async (req: Request, res: Response, next: NextFunction) => {
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
    return (req: Request, res: Response, next: NextFunction) => {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      try {
        const decoded = this.verifyToken(token);
        (req as any).user = decoded;
        next();
      } catch (error) {
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
    return (req: Request, res: Response, next: NextFunction) => {
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
  logSecurityEvent(event: string, details: any) {
    this.logger.info('Security Event', { event, details, timestamp: new Date() });
  }

  logError(error: Error, context?: any) {
    this.logger.error('Error', { error: error.message, stack: error.stack, context });
  }

  // ========== ABUSE DETECTION (Module 74-75 prep) ==========
  async checkForAbuse(req: Request): Promise<{ isAbusive: boolean, reason?: string }> {
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

// Export singleton instance for consistent usage
export const securityAdapter = new SecurityAdapter(
  process.env.NODE_ENV as 'development' | 'production'
);
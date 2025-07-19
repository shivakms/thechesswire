const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import middleware and routes
const { authenticateToken } = require('./middleware/auth');
const { validateRequest } = require('./middleware/validation');
const { logRequest } = require('./middleware/logging');
const { securityCheck } = require('./middleware/security');

// Import route modules
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chessRoutes = require('./routes/chess');
const voiceRoutes = require('./routes/voice');
const analysisRoutes = require('./routes/analysis');
const contentRoutes = require('./routes/content');
const adminRoutes = require('./routes/admin');
const titledPlayerRoutes = require('./routes/titled-players');

// Import services
const { initializeDatabase } = require('./services/database');
const { initializeRedis } = require('./services/redis');
const { initializeEmailService } = require('./services/email');
const { initializeAIServices } = require('./services/ai');
const { initializeVoiceService } = require('./services/voice');
const { initializeSecurityService } = require('./services/security');
const { initializeMonitoring } = require('./services/monitoring');

// Import Phase 1 AI automation modules
const { newsDiscoverySystem } = require('./services/news-discovery');
const { contentGeneratorNetwork } = require('./services/content-generator');
const { infrastructureManager } = require('./services/infrastructure-manager');
const { customerServiceAI } = require('./services/customer-service-ai');
const { legalComplianceEngine } = require('./services/legal-compliance');

// Import additional AI automation modules (396-401)
const { revenueOptimizationAI } = require('./services/revenue-optimization-ai');
const { fraudSecurityAIGuardian } = require('./services/fraud-security-ai');
const { contentQualitySelfImprovementSystem } = require('./services/content-quality-ai');
const { automatedCrisisManagementAI } = require('./services/crisis-management-ai');
const { platformEvolutionAI } = require('./services/platform-evolution-ai');
const { theOverseerAI } = require('./services/overseer-ai');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request above 50
});

app.use('/api/', limiter);
app.use('/api/', speedLimiter);

// Custom middleware
app.use(logRequest);
app.use(securityCheck);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/chess', authenticateToken, chessRoutes);
app.use('/api/voice', authenticateToken, voiceRoutes);
app.use('/api/analysis', authenticateToken, analysisRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/titled-players', authenticateToken, titledPlayerRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join user to their personal room
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  
  // Handle real-time game updates
  socket.on('join-game', (gameId) => {
    socket.join(`game-${gameId}`);
    console.log(`User joined game ${gameId}`);
  });
  
  // Handle voice narration requests
  socket.on('voice-request', (data) => {
    // Process voice request and emit back to user
    socket.emit('voice-response', {
      status: 'processing',
      requestId: data.requestId
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authentication token'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Initialize services
async function initializeServices() {
  try {
    console.log('Initializing services...');
    
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized');
    
    // Initialize Redis
    await initializeRedis();
    console.log('✅ Redis initialized');
    
    // Initialize email service
    await initializeEmailService();
    console.log('✅ Email service initialized');
    
    // Initialize AI services
    await initializeAIServices();
    console.log('✅ AI services initialized');
    
    // Initialize voice service
    await initializeVoiceService();
    console.log('✅ Voice service initialized');
    
    // Initialize security service
    await initializeSecurityService();
    console.log('✅ Security service initialized');
    
    // Initialize monitoring
    await initializeMonitoring();
    console.log('✅ Monitoring initialized');
    
    // Initialize Phase 1 AI automation modules
    console.log('🚀 Initializing Phase 1 AI automation modules...');
    
    // Start news discovery system (Module 391)
    await newsDiscoverySystem.start();
    console.log('✅ News Discovery System (Module 391) initialized');
    
    // Start content generator network (Module 395)
    await contentGeneratorNetwork.initialize();
    console.log('✅ Content Generator Network (Module 395) initialized');
    
    // Start self-healing infrastructure (Module 392)
    await infrastructureManager.initialize();
    console.log('✅ Self-Healing Infrastructure (Module 392) initialized');
    
    // Start AI customer service (Module 393)
    await customerServiceAI.initialize();
    console.log('✅ AI Customer Service (Module 393) initialized');
    
                    // Start legal compliance engine (Module 394)
                await legalComplianceEngine.initialize();
                console.log('✅ Legal Compliance Engine (Module 394) initialized');

                // Initialize additional AI automation modules (396-401)
                console.log('🚀 Initializing additional AI automation modules...');

                // Start revenue optimization AI (Module 396)
                await revenueOptimizationAI.initialize();
                console.log('✅ Revenue Optimization AI (Module 396) initialized');

                // Start fraud & security AI guardian (Module 397)
                await fraudSecurityAIGuardian.initialize();
                console.log('✅ Fraud & Security AI Guardian (Module 397) initialized');

                // Start content quality self-improvement system (Module 398)
                await contentQualitySelfImprovementSystem.initialize();
                console.log('✅ Content Quality Self-Improvement System (Module 398) initialized');

                // Start automated crisis management AI (Module 399)
                await automatedCrisisManagementAI.initialize();
                console.log('✅ Automated Crisis Management AI (Module 399) initialized');

                // Start platform evolution AI (Module 400)
                await platformEvolutionAI.initialize();
                console.log('✅ Platform Evolution AI (Module 400) initialized');

                // Start The Overseer AI (Module 401)
                await theOverseerAI.initialize();
                console.log('✅ The Overseer AI (Module 401) initialized');

                console.log('🎉 All services and ALL AI automation modules (391-401) initialized successfully!');
  } catch (error) {
    console.error('❌ Service initialization failed:', error);
    process.exit(1);
  }
}

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  await initializeServices();
  
  server.listen(PORT, () => {
    console.log(`🚀 TheChessWire Backend Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();

module.exports = { app, server, io }; 
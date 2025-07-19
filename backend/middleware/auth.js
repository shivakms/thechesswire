const jwt = require('jsonwebtoken');
const { getUserById } = require('../services/database');
const { logSecurityEvent } = require('../services/security');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access Token Required',
      message: 'No authentication token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist and are active
    const user = await getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'User not found'
      });
    }

    if (user.account_locked_until && new Date() < new Date(user.account_locked_until)) {
      return res.status(423).json({
        error: 'Account Locked',
        message: 'Account is temporarily locked due to security concerns'
      });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role || 'user',
      subscription_tier: user.subscription_tier || 'free'
    };

    // Log successful authentication
    await logSecurityEvent({
      userId: user.id,
      eventType: 'successful_auth',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: { endpoint: req.originalUrl }
    });

    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    
    // Log failed authentication attempt
    await logSecurityEvent({
      eventType: 'failed_auth',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: { 
        endpoint: req.originalUrl,
        error: error.message 
      }
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Authentication token has expired'
      });
    }

    return res.status(403).json({
      error: 'Invalid Token',
      message: 'Invalid authentication token'
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User must be authenticated'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient Permissions',
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
};

const requireSubscription = (requiredTier = 'free') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User must be authenticated'
      });
    }

    const userTier = req.user.subscription_tier;
    const tierHierarchy = {
      'free': 0,
      'premium': 1,
      'titled': 2
    };

    if (tierHierarchy[userTier] < tierHierarchy[requiredTier]) {
      return res.status(403).json({
        error: 'Subscription Required',
        message: `This feature requires ${requiredTier} subscription or higher`
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireSubscription
}; 
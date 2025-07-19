const Redis = require('ioredis');

let redisClient;

const initializeRedis = async () => {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    // Test connection
    await redisClient.ping();
    console.log('✅ Redis connection established');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    throw error;
  }
};

// Cache operations
const setCache = async (key, value, ttl = 3600) => {
  try {
    const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
    await redisClient.setex(key, ttl, serializedValue);
    return true;
  } catch (error) {
    console.error('Cache set failed:', error);
    return false;
  }
};

const getCache = async (key) => {
  try {
    const value = await redisClient.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error('Cache get failed:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete failed:', error);
    return false;
  }
};

const clearCache = async (pattern = '*') => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
    return true;
  } catch (error) {
    console.error('Cache clear failed:', error);
    return false;
  }
};

// Session management
const setSession = async (sessionId, data, ttl = 86400) => {
  return await setCache(`session:${sessionId}`, data, ttl);
};

const getSession = async (sessionId) => {
  return await getCache(`session:${sessionId}`);
};

const deleteSession = async (sessionId) => {
  return await deleteCache(`session:${sessionId}`);
};

// Rate limiting
const incrementRateLimit = async (key, ttl = 3600) => {
  try {
    const result = await redisClient.multi()
      .incr(key)
      .expire(key, ttl)
      .exec();
    
    return result[0][1]; // Return the incremented value
  } catch (error) {
    console.error('Rate limit increment failed:', error);
    return 1;
  }
};

const getRateLimit = async (key) => {
  try {
    const value = await redisClient.get(key);
    return value ? parseInt(value) : 0;
  } catch (error) {
    console.error('Rate limit get failed:', error);
    return 0;
  }
};

// Pub/Sub for real-time features
const publish = async (channel, message) => {
  try {
    await redisClient.publish(channel, JSON.stringify(message));
    return true;
  } catch (error) {
    console.error('Publish failed:', error);
    return false;
  }
};

const subscribe = (channel, callback) => {
  const subscriber = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  });

  subscriber.subscribe(channel, (err) => {
    if (err) {
      console.error('Subscribe failed:', error);
      return;
    }
  });

  subscriber.on('message', (ch, message) => {
    try {
      const parsedMessage = JSON.parse(message);
      callback(parsedMessage);
    } catch (error) {
      console.error('Message parsing failed:', error);
    }
  });

  return subscriber;
};

// Health check
const healthCheck = async () => {
  try {
    const startTime = Date.now();
    await redisClient.ping();
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = {
  initializeRedis,
  setCache,
  getCache,
  deleteCache,
  clearCache,
  setSession,
  getSession,
  deleteSession,
  incrementRateLimit,
  getRateLimit,
  publish,
  subscribe,
  healthCheck
}; 
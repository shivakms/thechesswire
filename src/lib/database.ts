import { Pool } from 'pg';
import logger from './logger';

// Database connection configuration
const getDatabaseConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (process.env.DATABASE_URL) {
    // Use connection string
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? {
        rejectUnauthorized: false,
        ca: process.env.DATABASE_CA_CERT,
        key: process.env.DATABASE_CLIENT_KEY,
        cert: process.env.DATABASE_CLIENT_CERT
      } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      statement_timeout: 30000,
      query_timeout: 30000
    };
  } else {
    // Use individual config values
    return {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432'),
      ssl: isProduction ? {
        rejectUnauthorized: false,
        ca: process.env.DATABASE_CA_CERT,
        key: process.env.DATABASE_CLIENT_KEY,
        cert: process.env.DATABASE_CLIENT_CERT
      } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      statement_timeout: 30000,
      query_timeout: 30000
    };
  }
};

// Create database connection pool
const pool = new Pool(getDatabaseConfig());

// Test database connection
pool.on('connect', () => {
  logger.info('✅ Database connection established');
});

pool.on('error', (err) => {
  logger.error('❌ Database connection error', err);
});

pool.on('acquire', () => {
  logger.debug('Database client acquired');
});

pool.on('release', () => {
  logger.debug('Database client released');
});

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('✅ Database connection test successful');
  } catch (error) {
    logger.error('❌ Database connection test failed', error);
    throw error;
  }
};

// Export pool for direct use
export { pool };

// Helper function for database queries with error handling
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`Database query executed in ${duration}ms`, { 
      query: text.substring(0, 100) + '...',
      duration,
      rowCount: res.rowCount 
    });
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(`Database query failed after ${duration}ms`, error);
    throw error;
  }
};

// Helper function for transactions
export const transaction = async (callback: (client: any) => Promise<any>) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}; 
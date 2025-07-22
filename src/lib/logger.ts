import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Export logger instance
export default logger;

// Helper functions for different log types
export const logError = (message: string, error?: any) => {
  if (error) {
    logger.error(`${message}: ${error.message}`, { 
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  } else {
    logger.error(message);
  }
};

export const logWarn = (message: string, data?: any) => {
  if (data) {
    logger.warn(`${message}`, { data, timestamp: new Date().toISOString() });
  } else {
    logger.warn(message);
  }
};

export const logInfo = (message: string, data?: any) => {
  if (data) {
    logger.info(`${message}`, { data, timestamp: new Date().toISOString() });
  } else {
    logger.info(message);
  }
};

export const logDebug = (message: string, data?: any) => {
  if (data) {
    logger.debug(`${message}`, { data, timestamp: new Date().toISOString() });
  } else {
    logger.debug(message);
  }
};

export const logHttp = (message: string, data?: any) => {
  if (data) {
    logger.http(`${message}`, { data, timestamp: new Date().toISOString() });
  } else {
    logger.http(message);
  }
}; 
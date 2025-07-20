/**
 * Centralized Error Handling System
 * 
 * This module provides a unified error handling interface across the entire platform.
 * It eliminates inconsistent error handling patterns and provides consistent error responses.
 */

export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  requestId?: string;
  stack?: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationErrorResponse {
  success: false;
  error: {
    code: 'VALIDATION_ERROR';
    message: 'Validation failed';
    details: ValidationError[];
    timestamp: string;
    requestId?: string;
  };
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorInfo[] = [];
  private maxLogSize = 1000;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle and format errors consistently
   */
  handleError(error: any, context?: {
    userId?: string;
    requestId?: string;
    operation?: string;
    additionalData?: any;
  }): ErrorResponse {
    const errorInfo = this.parseError(error, context);
    this.logError(errorInfo);

    return {
      success: false,
      error: {
        code: errorInfo.code,
        message: errorInfo.message,
        details: errorInfo.details,
        timestamp: errorInfo.timestamp.toISOString(),
        requestId: errorInfo.requestId
      }
    };
  }

  /**
   * Handle validation errors
   */
  handleValidationError(errors: ValidationError[], context?: {
    userId?: string;
    requestId?: string;
    operation?: string;
  }): ValidationErrorResponse {
    const errorInfo: ErrorInfo = {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errors,
      timestamp: new Date(),
      userId: context?.userId,
      requestId: context?.requestId
    };

    this.logError(errorInfo);

    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors,
        timestamp: errorInfo.timestamp.toISOString(),
        requestId: errorInfo.requestId
      }
    };
  }

  /**
   * Parse different types of errors
   */
  private parseError(error: any, context?: {
    userId?: string;
    requestId?: string;
    operation?: string;
    additionalData?: any;
  }): ErrorInfo {
    let code = 'UNKNOWN_ERROR';
    let message = 'An unexpected error occurred';
    let details: any = undefined;

    // Handle different error types
    if (error instanceof Error) {
      message = error.message;
      details = {
        name: error.name,
        stack: error.stack,
        operation: context?.operation
      };
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object') {
      code = error.code || code;
      message = error.message || message;
      details = error.details || error;
    }

    // Map common error codes
    code = this.mapErrorCode(code, message);

    return {
      code,
      message,
      details: {
        ...details,
        ...context?.additionalData
      },
      timestamp: new Date(),
      userId: context?.userId,
      requestId: context?.requestId,
      stack: error instanceof Error ? error.stack : undefined
    };
  }

  /**
   * Map error codes to consistent values
   */
  private mapErrorCode(code: string, message: string): string {
    const codeMap: { [key: string]: string } = {
      'AUTHENTICATION_FAILED': 'AUTH_ERROR',
      'INVALID_CREDENTIALS': 'AUTH_ERROR',
      'TOKEN_EXPIRED': 'AUTH_ERROR',
      'INVALID_TOKEN': 'AUTH_ERROR',
      'ACCESS_DENIED': 'PERMISSION_ERROR',
      'FORBIDDEN': 'PERMISSION_ERROR',
      'NOT_FOUND': 'NOT_FOUND_ERROR',
      'RESOURCE_NOT_FOUND': 'NOT_FOUND_ERROR',
      'VALIDATION_FAILED': 'VALIDATION_ERROR',
      'INVALID_INPUT': 'VALIDATION_ERROR',
      'RATE_LIMIT_EXCEEDED': 'RATE_LIMIT_ERROR',
      'TOO_MANY_REQUESTS': 'RATE_LIMIT_ERROR',
      'DATABASE_ERROR': 'DATABASE_ERROR',
      'CONNECTION_ERROR': 'DATABASE_ERROR',
      'EXTERNAL_API_ERROR': 'EXTERNAL_SERVICE_ERROR',
      'SERVICE_UNAVAILABLE': 'EXTERNAL_SERVICE_ERROR',
      'TIMEOUT': 'TIMEOUT_ERROR',
      'REQUEST_TIMEOUT': 'TIMEOUT_ERROR'
    };

    // Check if code is already mapped
    if (codeMap[code]) {
      return codeMap[code];
    }

    // Try to infer from message
    const messageLower = message.toLowerCase();
    if (messageLower.includes('authentication') || messageLower.includes('login')) {
      return 'AUTH_ERROR';
    }
    if (messageLower.includes('permission') || messageLower.includes('access')) {
      return 'PERMISSION_ERROR';
    }
    if (messageLower.includes('not found') || messageLower.includes('does not exist')) {
      return 'NOT_FOUND_ERROR';
    }
    if (messageLower.includes('validation') || messageLower.includes('invalid')) {
      return 'VALIDATION_ERROR';
    }
    if (messageLower.includes('rate limit') || messageLower.includes('too many')) {
      return 'RATE_LIMIT_ERROR';
    }
    if (messageLower.includes('database') || messageLower.includes('connection')) {
      return 'DATABASE_ERROR';
    }
    if (messageLower.includes('timeout') || messageLower.includes('timed out')) {
      return 'TIMEOUT_ERROR';
    }

    return code;
  }

  /**
   * Log error for monitoring
   */
  private logError(errorInfo: ErrorInfo): void {
    this.errorLog.push(errorInfo);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorInfo);
    }

    // In production, you might want to send to external logging service
    // this.sendToLoggingService(errorInfo);
  }

  /**
   * Get error log
   */
  getErrorLog(): ErrorInfo[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Create specific error types
   */
  static createAuthError(message: string, details?: any): ErrorResponse {
    return ErrorHandler.getInstance().handleError({
      code: 'AUTH_ERROR',
      message,
      details
    });
  }

  static createValidationError(errors: ValidationError[]): ValidationErrorResponse {
    return ErrorHandler.getInstance().handleValidationError(errors);
  }

  static createNotFoundError(resource: string): ErrorResponse {
    return ErrorHandler.getInstance().handleError({
      code: 'NOT_FOUND_ERROR',
      message: `${resource} not found`,
      details: { resource }
    });
  }

  static createPermissionError(operation: string): ErrorResponse {
    return ErrorHandler.getInstance().handleError({
      code: 'PERMISSION_ERROR',
      message: `Access denied for operation: ${operation}`,
      details: { operation }
    });
  }

  static createRateLimitError(retryAfter?: number): ErrorResponse {
    return ErrorHandler.getInstance().handleError({
      code: 'RATE_LIMIT_ERROR',
      message: 'Rate limit exceeded. Please try again later.',
      details: { retryAfter }
    });
  }

  static createDatabaseError(operation: string, details?: any): ErrorResponse {
    return ErrorHandler.getInstance().handleError({
      code: 'DATABASE_ERROR',
      message: `Database operation failed: ${operation}`,
      details: { operation, ...details }
    });
  }

  static createExternalServiceError(service: string, details?: any): ErrorResponse {
    return ErrorHandler.getInstance().handleError({
      code: 'EXTERNAL_SERVICE_ERROR',
      message: `External service error: ${service}`,
      details: { service, ...details }
    });
  }

  static createTimeoutError(operation: string, timeout: number): ErrorResponse {
    return ErrorHandler.getInstance().handleError({
      code: 'TIMEOUT_ERROR',
      message: `Operation timed out: ${operation}`,
      details: { operation, timeout }
    });
  }

  /**
   * Wrap async functions with error handling
   */
  static async wrapAsync<T>(
    operation: () => Promise<T>,
    context?: {
      userId?: string;
      requestId?: string;
      operation?: string;
    }
  ): Promise<T | ErrorResponse> {
    try {
      return await operation();
    } catch (error) {
      return ErrorHandler.getInstance().handleError(error, context);
    }
  }

  /**
   * Wrap sync functions with error handling
   */
  static wrapSync<T>(
    operation: () => T,
    context?: {
      userId?: string;
      requestId?: string;
      operation?: string;
    }
  ): T | ErrorResponse {
    try {
      return operation();
    } catch (error) {
      return ErrorHandler.getInstance().handleError(error, context);
    }
  }

  /**
   * Check if result is an error response
   */
  static isErrorResponse(result: any): result is ErrorResponse {
    return result && result.success === false && result.error;
  }

  /**
   * Extract error message from error response
   */
  static getErrorMessage(result: ErrorResponse): string {
    return result.error.message;
  }

  /**
   * Extract error code from error response
   */
  static getErrorCode(result: ErrorResponse): string {
    return result.error.code;
  }

  /**
   * Create user-friendly error messages
   */
  static getUserFriendlyMessage(errorCode: string): string {
    const messages: { [key: string]: string } = {
      'AUTH_ERROR': 'Authentication failed. Please check your credentials and try again.',
      'PERMISSION_ERROR': 'You don\'t have permission to perform this action.',
      'NOT_FOUND_ERROR': 'The requested resource was not found.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'RATE_LIMIT_ERROR': 'Too many requests. Please wait a moment and try again.',
      'DATABASE_ERROR': 'A database error occurred. Please try again later.',
      'EXTERNAL_SERVICE_ERROR': 'A service error occurred. Please try again later.',
      'TIMEOUT_ERROR': 'The operation timed out. Please try again.',
      'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.'
    };

    return messages[errorCode] || messages['UNKNOWN_ERROR'];
  }

  /**
   * Send error to external logging service (placeholder)
   */
  private async sendToLoggingService(errorInfo: ErrorInfo): Promise<void> {
    // In production, implement actual logging service integration
    // Example: Sentry, LogRocket, etc.
    try {
      // await sentry.captureException(errorInfo);
      console.log('Error sent to logging service:', errorInfo);
    } catch (error) {
      console.error('Failed to send error to logging service:', error);
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Export utility functions
export const handleError = (error: any, context?: any) => 
  errorHandler.handleError(error, context);

export const handleValidationError = (errors: ValidationError[], context?: any) => 
  errorHandler.handleValidationError(errors, context);

export const wrapAsync = <T>(operation: () => Promise<T>, context?: any) => 
  ErrorHandler.wrapAsync(operation, context);

export const wrapSync = <T>(operation: () => T, context?: any) => 
  ErrorHandler.wrapSync(operation, context);

export const isErrorResponse = (result: any) => 
  ErrorHandler.isErrorResponse(result);

export const getErrorMessage = (result: ErrorResponse) => 
  ErrorHandler.getErrorMessage(result);

export const getErrorCode = (result: ErrorResponse) => 
  ErrorHandler.getErrorCode(result);

export const getUserFriendlyMessage = (errorCode: string) => 
  ErrorHandler.getUserFriendlyMessage(errorCode);

// Export static methods for convenience
export const createAuthError = ErrorHandler.createAuthError;
export const createValidationError = ErrorHandler.createValidationError;
export const createNotFoundError = ErrorHandler.createNotFoundError;
export const createPermissionError = ErrorHandler.createPermissionError;
export const createRateLimitError = ErrorHandler.createRateLimitError;
export const createDatabaseError = ErrorHandler.createDatabaseError;
export const createExternalServiceError = ErrorHandler.createExternalServiceError;
export const createTimeoutError = ErrorHandler.createTimeoutError; 
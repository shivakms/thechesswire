import * as Sentry from '@sentry/nextjs';
import logger from './logger';

export interface ErrorContext {
  userId?: string;
  userEmail?: string;
  action?: string;
  component?: string;
  additionalData?: Record<string, any>;
}

export class ErrorTracker {
  private static instance: ErrorTracker;

  private constructor() {}

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  /**
   * Track an error with Sentry and Winston
   */
  public trackError(
    error: Error | string,
    context?: ErrorContext,
    level: 'error' | 'warning' | 'info' = 'error'
  ): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Log to Winston
    logger.error(errorMessage, {
      stack: errorStack,
      context,
      timestamp: new Date().toISOString()
    });

    // Send to Sentry
    if (process.env.NODE_ENV === 'production') {
      Sentry.withScope((scope) => {
        if (context?.userId) {
          scope.setUser({ id: context.userId, email: context.userEmail });
        }
        if (context?.action) {
          scope.setTag('action', context.action);
        }
        if (context?.component) {
          scope.setTag('component', context.component);
        }
        if (context?.additionalData) {
          scope.setExtras(context.additionalData);
        }
        
        if (error instanceof Error) {
          Sentry.captureException(error);
        } else {
          Sentry.captureMessage(error, level);
        }
      });
    }
  }

  /**
   * Track API errors
   */
  public trackApiError(
    endpoint: string,
    method: string,
    statusCode: number,
    error: Error | string,
    context?: ErrorContext
  ): void {
    this.trackError(error, {
      ...context,
      action: `${method} ${endpoint}`,
      additionalData: {
        endpoint,
        method,
        statusCode,
        ...context?.additionalData
      }
    });
  }

  /**
   * Track authentication errors
   */
  public trackAuthError(
    action: 'login' | 'register' | 'logout' | 'mfa',
    error: Error | string,
    context?: ErrorContext
  ): void {
    this.trackError(error, {
      ...context,
      action: `auth_${action}`,
      additionalData: {
        authAction: action,
        ...context?.additionalData
      }
    });
  }

  /**
   * Track database errors
   */
  public trackDatabaseError(
    operation: string,
    error: Error | string,
    context?: ErrorContext
  ): void {
    this.trackError(error, {
      ...context,
      action: `db_${operation}`,
      additionalData: {
        dbOperation: operation,
        ...context?.additionalData
      }
    });
  }

  /**
   * Track payment errors
   */
  public trackPaymentError(
    operation: string,
    error: Error | string,
    context?: ErrorContext
  ): void {
    this.trackError(error, {
      ...context,
      action: `payment_${operation}`,
      additionalData: {
        paymentOperation: operation,
        ...context?.additionalData
      }
    });
  }

  /**
   * Track security events
   */
  public trackSecurityEvent(
    event: string,
    details: Record<string, any>,
    context?: ErrorContext
  ): void {
    logger.warn(`Security Event: ${event}`, {
      event,
      details,
      context,
      timestamp: new Date().toISOString()
    });

    if (process.env.NODE_ENV === 'production') {
      Sentry.withScope((scope) => {
        scope.setTag('event_type', 'security');
        scope.setTag('security_event', event);
        scope.setExtras({ details, context });
        Sentry.captureMessage(`Security Event: ${event}`, 'warning');
      });
    }
  }

  /**
   * Track performance metrics
   */
  public trackPerformance(
    operation: string,
    duration: number,
    context?: ErrorContext
  ): void {
    logger.info(`Performance: ${operation}`, {
      operation,
      duration,
      context,
      timestamp: new Date().toISOString()
    });

    if (process.env.NODE_ENV === 'production') {
      Sentry.addBreadcrumb({
        category: 'performance',
        message: `${operation} took ${duration}ms`,
        level: 'info',
        data: { operation, duration, ...context }
      });
    }
  }

  /**
   * Set user context for error tracking
   */
  public setUserContext(userId: string, email?: string): void {
    if (process.env.NODE_ENV === 'production') {
      Sentry.setUser({ id: userId, email });
    }
  }

  /**
   * Clear user context
   */
  public clearUserContext(): void {
    if (process.env.NODE_ENV === 'production') {
      Sentry.setUser(null);
    }
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();

// Convenience functions
export const trackError = (error: Error | string, context?: ErrorContext) => {
  errorTracker.trackError(error, context);
};

export const trackApiError = (
  endpoint: string,
  method: string,
  statusCode: number,
  error: Error | string,
  context?: ErrorContext
) => {
  errorTracker.trackApiError(endpoint, method, statusCode, error, context);
};

export const trackAuthError = (
  action: 'login' | 'register' | 'logout' | 'mfa',
  error: Error | string,
  context?: ErrorContext
) => {
  errorTracker.trackAuthError(action, error, context);
};

export const trackDatabaseError = (
  operation: string,
  error: Error | string,
  context?: ErrorContext
) => {
  errorTracker.trackDatabaseError(operation, error, context);
};

export const trackPaymentError = (
  operation: string,
  error: Error | string,
  context?: ErrorContext
) => {
  errorTracker.trackPaymentError(operation, error, context);
};

export const trackSecurityEvent = (
  event: string,
  details: Record<string, any>,
  context?: ErrorContext
) => {
  errorTracker.trackSecurityEvent(event, details, context);
};

export const trackPerformance = (
  operation: string,
  duration: number,
  context?: ErrorContext
) => {
  errorTracker.trackPerformance(operation, duration, context);
}; 
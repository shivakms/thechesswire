import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release
  release: process.env.SENTRY_RELEASE,
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Before send function to filter out certain errors
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    // Filter out database connection errors
    if (event.exception) {
      const exception = event.exception.values?.[0];
      if (exception?.value?.includes('ECONNREFUSED') || 
          exception?.value?.includes('ENOTFOUND')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Integrations
  integrations: [
    Sentry.nodeProfilingIntegration(),
  ],
}); 
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Before send function to filter out certain errors
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    // Filter out certain error types
    if (event.exception) {
      const exception = event.exception.values?.[0];
      if (exception?.type === 'NetworkError' || exception?.type === 'ChunkLoadError') {
        return null;
      }
    }
    
    return event;
  },
  
  // Integrations
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
}); 
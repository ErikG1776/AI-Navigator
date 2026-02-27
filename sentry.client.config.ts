import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // Capture 10% of traces in production; raise to 1.0 during initial rollout
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Silently no-op when DSN is not set (local dev without Sentry)
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
})

import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {}

export default withSentryConfig(nextConfig, {
  // Suppress Sentry CLI output during local builds
  silent: !process.env.CI,
  // Required for source map uploads; leave unset to skip uploads
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Disable the Sentry logger to reduce bundle noise
  disableLogger: true,
})

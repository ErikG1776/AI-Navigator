// Simple in-memory rate limiter.
// For multi-instance / serverless deployments, upgrade to Upstash Redis:
// https://github.com/upstash/ratelimit-js
//
// Usage: checkRateLimit(`advisory:${userId}`, 10, 60 * 60 * 1000)

type Entry = { count: number; resetAt: number }

const store = new Map<string, Entry>()

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt?: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: maxRequests - entry.count }
}

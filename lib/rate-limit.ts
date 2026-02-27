// Rate limiter with optional Upstash Redis backend.
//
// Production use: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
// in your environment (Vercel env vars + .env.local).
// Without those vars the limiter falls back to in-memory, which resets on
// every cold start and is NOT shared across serverless instances.
//
// Upstash free tier: https://console.upstash.com

type Entry = { count: number; resetAt: number }

const store = new Map<string, Entry>()

function checkInMemory(
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

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt?: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (url && token) {
    try {
      const { Ratelimit } = await import('@upstash/ratelimit')
      const { Redis } = await import('@upstash/redis')

      const redis = new Redis({ url, token })
      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(maxRequests, `${Math.floor(windowMs / 1000)} s`),
        prefix: 'ai-navigator',
      })

      const result = await ratelimit.limit(key)
      return { allowed: result.success, remaining: result.remaining, resetAt: result.reset }
    } catch (err) {
      console.warn('Upstash rate limit unavailable, falling back to in-memory:', err)
    }
  }

  return checkInMemory(key, maxRequests, windowMs)
}

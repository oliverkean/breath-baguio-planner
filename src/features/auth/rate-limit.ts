import "server-only"

type AttemptBucket = {
  count: number
  resetAt: number
}

const windowMs = 5 * 60 * 1000
const maxAttempts = 5
const attempts = new Map<string, AttemptBucket>()

export function checkLoginRateLimit(identifier: string) {
  const now = Date.now()
  const bucket = attempts.get(identifier)

  if (!bucket || bucket.resetAt <= now) {
    attempts.set(identifier, { count: 0, resetAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (bucket.count >= maxAttempts) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

export function recordFailedLogin(identifier: string) {
  const now = Date.now()
  const bucket = attempts.get(identifier)

  if (!bucket || bucket.resetAt <= now) {
    attempts.set(identifier, { count: 1, resetAt: now + windowMs })
    return
  }

  bucket.count += 1
}

export function clearLoginRateLimit(identifier: string) {
  attempts.delete(identifier)
}

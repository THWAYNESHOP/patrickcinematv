interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    let timestamps = this.requests.get(identifier) || []

    // Remove old timestamps outside the window
    timestamps = timestamps.filter(timestamp => timestamp > windowStart)

    // Check if limit exceeded
    if (timestamps.length >= this.config.maxRequests) {
      return false
    }

    // Add current timestamp
    timestamps.push(now)
    this.requests.set(identifier, timestamps)

    return true
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    const timestamps = this.requests.get(identifier) || []
    const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart)
    return Math.max(0, this.config.maxRequests - validTimestamps.length)
  }

  reset(identifier: string): void {
    this.requests.delete(identifier)
  }
}

// Create rate limiters for different endpoints
export const searchRateLimiter = new RateLimiter({ maxRequests: 30, windowMs: 60000 }) // 30 requests per minute
export const apiRateLimiter = new RateLimiter({ maxRequests: 100, windowMs: 60000 }) // 100 requests per minute
export const authRateLimiter = new RateLimiter({ maxRequests: 5, windowMs: 60000 }) // 5 requests per minute

export function checkRateLimit(limiter: RateLimiter, identifier: string): boolean {
  return limiter.isAllowed(identifier)
}

export function getRateLimitInfo(limiter: RateLimiter, identifier: string) {
  return {
    allowed: limiter.isAllowed(identifier),
    remaining: limiter.getRemainingRequests(identifier),
    reset: Date.now() + 60000
  }
}

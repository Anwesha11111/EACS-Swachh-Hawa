// ═════════════════════════════════════════════════════════════════════════════
// Rate Limiting Middleware
// Token bucket algorithm with Redis-like in-memory store
// ═════════════════════════════════════════════════════════════════════════════

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

// In-memory store (in production, use Redis or similar)
const buckets = new Map<string, TokenBucket>();

/**
 * Rate limiter using token bucket algorithm
 */
export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private keyPrefix: string;
  private refillRate: number;

  constructor(config: RateLimitConfig) {
    this.windowMs = config.windowMs;
    this.maxRequests = config.maxRequests;
    this.keyPrefix = config.keyPrefix || "rl";
    this.refillRate = this.maxRequests / (this.windowMs / 1000); // tokens per second
  }

  /**
   * Check if request is allowed for the given key (usually IP or user ID)
   */
  check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const bucketKey = `${this.keyPrefix}:${key}`;
    const now = Date.now();
    
    let bucket = buckets.get(bucketKey);
    
    if (!bucket) {
      bucket = {
        tokens: this.maxRequests,
        lastRefill: now,
      };
      buckets.set(bucketKey, bucket);
    }

    // Refill tokens based on time elapsed
    const elapsedMs = now - bucket.lastRefill;
    const tokensToAdd = (elapsedMs / 1000) * this.refillRate;
    
    bucket.tokens = Math.min(this.maxRequests, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Check if request can be served
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetAt: now + ((this.maxRequests - bucket.tokens) / this.refillRate) * 1000,
      };
    }

    return {
      allowed: false,
      remaining: 0,
      resetAt: now + ((1 - bucket.tokens) / this.refillRate) * 1000,
    };
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    const bucketKey = `${this.keyPrefix}:${key}`;
    buckets.delete(bucketKey);
  }

  /**
   * Clean up old buckets (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    const cleanupThreshold = this.windowMs * 2; // Keep buckets for 2x window

    for (const [key, bucket] of buckets.entries()) {
      if (now - bucket.lastRefill > cleanupThreshold) {
        buckets.delete(key);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Predefined rate limiters for different tiers
// ─────────────────────────────────────────────────────────────────────────────

export const rateLimiters = {
  // Public API: 100 requests per minute
  public: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 100,
    keyPrefix: "public",
  }),

  // Authenticated users: 1000 requests per minute
  authenticated: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 1000,
    keyPrefix: "auth",
  }),

  // Data download: 10 requests per hour
  download: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
    keyPrefix: "download",
  }),

  // AI/LLM endpoints: 20 requests per hour
  ai: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 20,
    keyPrefix: "ai",
  }),
};

// Cleanup every 10 minutes
setInterval(() => {
  Object.values(rateLimiters).forEach(limiter => limiter.cleanup());
}, 10 * 60 * 1000);

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (handle proxies)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to connection info (may not be available in all environments)
  return "unknown";
}

/**
 * Rate limit middleware for server functions
 */
export function withRateLimit(
  limiter: RateLimiter,
  handler: (request: Request) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    const clientId = getClientIdentifier(request);
    const result = limiter.check(clientId);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          resetAt: new Date(result.resetAt).toISOString(),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": String(limiter["maxRequests"]),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
            "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const response = await handler(request);

    // Add rate limit headers to successful responses
    response.headers.set("X-RateLimit-Limit", String(limiter["maxRequests"]));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.floor(result.resetAt / 1000)));

    return response;
  };
}

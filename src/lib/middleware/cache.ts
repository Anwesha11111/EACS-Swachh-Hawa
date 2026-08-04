// ═════════════════════════════════════════════════════════════════════════════
// In-Memory Cache for API Responses
// Simple LRU cache with TTL support for high-performance data access
// ═════════════════════════════════════════════════════════════════════════════

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  size: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  currentSize: number;
  maxSize: number;
}

/**
 * LRU Cache with TTL support
 */
export class LRUCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder: string[] = [];
  private maxSize: number;
  private currentSize: number = 0;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    currentSize: 0,
    maxSize: 0,
  };

  constructor(maxSize: number = 100 * 1024 * 1024) { // 100MB default
    this.maxSize = maxSize;
    this.stats.maxSize = maxSize;
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access order (move to end)
    this.updateAccessOrder(key);
    this.stats.hits++;
    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttlMs: number = 5 * 60 * 1000): void {
    // Estimate size (rough approximation)
    const size = this.estimateSize(value);

    // Evict if necessary
    while (this.currentSize + size > this.maxSize && this.accessOrder.length > 0) {
      this.evictLRU();
    }

    // Delete existing entry if present
    if (this.cache.has(key)) {
      this.delete(key);
    }

    // Add new entry
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
      size,
    });

    this.accessOrder.push(key);
    this.currentSize += size;
    this.stats.currentSize = this.currentSize;
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.currentSize -= entry.size;
    this.stats.currentSize = this.currentSize;

    // Remove from access order
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }

    return true;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.currentSize = 0;
    this.stats.currentSize = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Update access order for a key (LRU)
   */
  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
      this.accessOrder.push(key);
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    const key = this.accessOrder.shift();
    if (key) {
      this.delete(key);
      this.stats.evictions++;
    }
  }

  /**
   * Estimate size of value in bytes
   */
  private estimateSize(value: T): number {
    try {
      return JSON.stringify(value).length * 2; // Rough estimate (UTF-16)
    } catch {
      return 1024; // Default 1KB if can't serialize
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Global cache instances
// ─────────────────────────────────────────────────────────────────────────────

export const caches = {
  // AQI data cache (5 minutes TTL)
  aqi: new LRUCache(50 * 1024 * 1024), // 50MB
  
  // Sensor data cache (10 minutes TTL)
  sensors: new LRUCache(20 * 1024 * 1024), // 20MB
  
  // Forecast cache (30 minutes TTL)
  forecasts: new LRUCache(30 * 1024 * 1024), // 30MB
  
  // Static data cache (1 hour TTL)
  static: new LRUCache(10 * 1024 * 1024), // 10MB
};

// Cleanup every 5 minutes
setInterval(() => {
  Object.values(caches).forEach(cache => cache.cleanup());
}, 5 * 60 * 1000);

/**
 * Cache key generator
 */
export function generateCacheKey(prefix: string, ...args: any[]): string {
  const parts = [prefix, ...args.map(arg => JSON.stringify(arg))];
  return parts.join(":");
}

/**
 * Cached function wrapper
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  cache: LRUCache,
  keyPrefix: string,
  ttlMs: number,
  fn: T
): T {
  return (async (...args: any[]) => {
    const cacheKey = generateCacheKey(keyPrefix, ...args);
    
    // Try cache first
    const cached = cache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await fn(...args);

    // Store in cache
    cache.set(cacheKey, result, ttlMs);

    return result;
  }) as T;
}

/**
 * Cache middleware for server functions
 */
export function cacheMiddleware(
  cache: LRUCache,
  keyFn: (request: Request) => string,
  ttlMs: number,
  handler: (request: Request) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    // Only cache GET requests
    if (request.method !== "GET") {
      return handler(request);
    }

    const cacheKey = keyFn(request);
    
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT",
        },
      });
    }

    // Execute handler
    const response = await handler(request);
    
    // Cache successful responses
    if (response.status === 200) {
      const body = await response.text();
      const data = JSON.parse(body);
      
      cache.set(cacheKey, data, ttlMs);

      return new Response(body, {
        status: response.status,
        headers: {
          ...Object.fromEntries(response.headers),
          "X-Cache": "MISS",
        },
      });
    }

    return response;
  };
}

/**
 * Invalidate cache entries by pattern
 */
export function invalidateCache(cache: LRUCache, pattern: string): number {
  let count = 0;
  const keys = Array.from((cache as any).cache.keys());
  
  for (const key of keys) {
    if (key.startsWith(pattern)) {
      cache.delete(key);
      count++;
    }
  }

  return count;
}

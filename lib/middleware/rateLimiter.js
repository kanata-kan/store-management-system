/**
 * Rate Limiter Middleware
 *
 * Provides configurable rate limiting for API routes.
 * Supports both IP-based and key-based (email) limiting.
 * Uses in-memory storage (can be replaced with Redis later).
 */

// In-memory store for rate limit tracking
// Key format: "prefix:identifier" (e.g., "login:192.168.1.1" or "login:user@example.com")
const store = new Map();

// Default rate limit configuration
const DEFAULT_LIMITS = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: "Trop de tentatives. Veuillez réessayer plus tard.",
};

/**
 * Cleanup expired entries periodically
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

/**
 * Create rate limiter function
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {number} options.maxRequests - Max requests per window (default: 5)
 * @param {string} options.message - Error message when limit exceeded
 * @param {string} options.keyPrefix - Prefix for store keys (default: 'rate_limit')
 * @returns {Function} Rate limiter function that returns error response or null
 */
export function createRateLimiter(options = {}) {
  const config = { ...DEFAULT_LIMITS, ...options };

  return async (request, identifier) => {
    const key = `${config.keyPrefix || "rate_limit"}:${identifier}`;
    const now = Date.now();

    // Get or create entry
    let entry = store.get(key);

    if (!entry || now - entry.resetTime > config.windowMs) {
      // New window - reset
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
      };
      store.set(key, entry);
    }

    // Increment count
    entry.count++;

    if (entry.count > config.maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      return {
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: config.message,
        },
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(entry.resetTime).toISOString(),
        },
      };
    }

    // Return null if within limit (continue processing)
    return null;
  };
}


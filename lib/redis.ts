import Redis from "ioredis";

// Redis client singleton
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

// Create Redis client with connection URL
function createRedisClient() {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn("REDIS_URL not set, caching disabled");
    return null;
  }

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      // Connection settings for serverless
      enableOfflineQueue: true,
      connectTimeout: 10000,
    });

    client.on("error", (err) => {
      console.error("Redis connection error:", err.message);
    });

    client.on("connect", () => {
      console.log("Redis connected successfully");
    });

    return client;
  } catch (error) {
    console.error("Failed to create Redis client:", error);
    return null;
  }
}

export const redis = globalForRedis.redis ?? createRedisClient();

// Cache in global for reuse in serverless
if (redis) {
  globalForRedis.redis = redis;
}

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  USER: 60 * 60, // 1 hour for user data
  STATS: 60 * 5, // 5 minutes for dashboard stats
  ANALYSES: 60 * 2, // 2 minutes for recent analyses
  SHORT: 60, // 1 minute for frequently changing data
};

// Cache key prefixes
export const CACHE_KEYS = {
  user: (userId: string) => `user:${userId}`,
  dbUser: (userId: string) => `db_user:${userId}`,
  stats: (userId: string) => `stats:${userId}`,
  analyses: (userId: string) => `analyses:${userId}`,
  analysis: (analysisId: string) => `analysis:${analysisId}`,
};

/**
 * Get cached value with automatic JSON parsing
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;

  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    return null;
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
}

/**
 * Set cache with automatic JSON serialization
 */
export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds: number = CACHE_TTL.SHORT,
): Promise<void> {
  if (!redis) return;

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error("Redis set error:", error);
  }
}

/**
 * Delete cache key (for invalidation)
 */
export async function deleteCache(key: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    console.error("Redis delete error:", error);
  }
}

/**
 * Delete multiple cache keys by pattern
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Redis pattern delete error:", error);
  }
}

/**
 * Cache wrapper - get from cache or execute function and cache result
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = CACHE_TTL.SHORT,
): Promise<T> {
  // Try to get from cache first
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute function and cache result
  const result = await fn();
  await setCache(key, result, ttlSeconds);

  return result;
}

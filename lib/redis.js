import { Redis } from 'ioredis';

// Create Redis client
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  // Enable keepalive to prevent connection timeouts
  keepAlive: 5000,
  // Maximum number of connections in the pool
  maxRetriesPerRequest: 3,
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// Helper function to set cache with expiry
export async function setCache(key, data, expireSeconds = 300) {
  try {
    await redisClient.set(key, JSON.stringify(data), 'EX', expireSeconds);
    return true;
  } catch (error) {
    console.error('Redis cache set error:', error);
    return false;
  }
}

// Helper function to get cached data
export async function getCache(key) {
  try {
    const cachedData = await redisClient.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Redis cache get error:', error);
    return null;
  }
}

// Helper function to delete cache
export async function deleteCache(key) {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis cache delete error:', error);
    return false;
  }
}

// Helper function to delete multiple keys by pattern
export async function deleteCachePattern(pattern) {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Redis cache pattern delete error:', error);
    return false;
  }
}

export default redisClient;
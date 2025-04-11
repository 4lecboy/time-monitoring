/**
 * Storage adapter that works in both Node.js and Edge runtime
 * Falls back to in-memory storage when Redis is not available
 */

// In-memory fallback for Edge runtime
const memoryCache = new Map();

export async function setCache(key, data, expireSeconds = 300) {
  try {
    // Store with expiration time
    memoryCache.set(key, {
      data: JSON.stringify(data),
      expires: Date.now() + (expireSeconds * 1000)
    });
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
}

export async function getCache(key) {
  try {
    const item = memoryCache.get(key);
    
    // Return null if not found or expired
    if (!item || item.expires < Date.now()) {
      if (item) memoryCache.delete(key); // Clean up expired items
      return null;
    }
    
    return JSON.parse(item.data);
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function deleteCache(key) {
  try {
    memoryCache.delete(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
}

export async function deleteCachePattern(pattern) {
  try {
    // Simple pattern matching for memory cache
    const regex = new RegExp(pattern.replace('*', '.*'));
    
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
    return true;
  } catch (error) {
    console.error('Cache pattern delete error:', error);
    return false;
  }
}

// Cleanup expired items periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, item] of memoryCache.entries()) {
      if (item.expires < now) {
        memoryCache.delete(key);
      }
    }
  }, 60000); // Run every minute
}
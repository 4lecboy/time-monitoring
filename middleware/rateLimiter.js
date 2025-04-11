import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/storage';

// Simple rate limiter for Edge runtime
export async function rateLimiterMiddleware(request) {
  try {
    // Use IP as identifier for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              'unknown';
    
    const cacheKey = `ratelimit:${ip}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute window
    const maxRequests = 100; // Maximum requests per window
    
    // Get existing request record
    const requestRecord = await getCache(cacheKey) || { 
      count: 0, 
      resetTime: now + windowMs 
    };
    
    // Reset if the window has expired
    if (now > requestRecord.resetTime) {
      requestRecord.count = 0;
      requestRecord.resetTime = now + windowMs;
    }
    
    // Check if rate limit is exceeded
    if (requestRecord.count >= maxRequests) {
      console.warn(`Rate limit exceeded for ${ip}`);
      
      return NextResponse.json(
        { error: 'Too many requests, please try again later' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((requestRecord.resetTime - now) / 1000),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(requestRecord.resetTime / 1000).toString()
          }
        }
      );
    }
    
    // Increment request count and save
    requestRecord.count += 1;
    await setCache(cacheKey, requestRecord, 60); // 60 seconds TTL
    
    // Request is allowed
    return null;
  } catch (error) {
    console.error('Rate limiter error:', error);
    // On error, allow the request (fail open)
    return null;
  }
}

export default rateLimiterMiddleware;
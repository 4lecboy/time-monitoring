import { NextResponse } from 'next/server';
import { rateLimiterMiddleware } from './middleware/rateLimiter';

export async function middleware(request) {
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const response = await rateLimiterMiddleware(request);
    if (response) return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
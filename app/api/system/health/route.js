import { NextResponse } from 'next/server';
import { healthCheck } from '@/lib/db';

// Mark as Node.js runtime
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Check database connection
    const dbStatus = await healthCheck();
    
    // Get system memory usage
    const memory = process.memoryUsage();
    
    const health = {
      status: dbStatus ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus ? 'connected' : 'disconnected',
        },
        cache: {
          status: 'in-memory', // Using in-memory cache instead of Redis
          type: 'compatible'
        },
      },
      system: {
        memory: {
          rss: Math.round(memory.rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + ' MB',
        },
        uptime: Math.round(process.uptime()) + ' seconds',
      },
      environment: process.env.NODE_ENV || 'development'
    };
    
    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { status: 'critical', error: error.message },
      { status: 500 }
    );
  }
}
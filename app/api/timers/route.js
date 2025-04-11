import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCache, setCache } from '@/lib/storage';

// Mark as Node.js runtime (not Edge)
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // Check cache first
    const cacheKey = `timers:${session.user.id}:${date}`;
    const cachedTimers = await getCache(cacheKey);
    
    if (cachedTimers) {
      return NextResponse.json(cachedTimers);
    }

    // Not in cache, fetch from database
    const timers = await query(
      `SELECT * FROM timers 
       WHERE user_id = ? AND date = ?`, 
      [session.user.id, date]
    );

    // Cache the results
    await setCache(cacheKey, timers, 300);

    return NextResponse.json(timers);
  } catch (error) {
    console.error('Error fetching timers:', error);
    return NextResponse.json({ error: 'Failed to fetch timers' }, { status: 500 });
  }
}
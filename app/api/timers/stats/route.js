import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

    // Get all timers for the user on this date joined with activities
    const timerData = await query(
      `SELECT t.*, a.name as activity_name, a.type as activity_type
       FROM timers t
       JOIN activities a ON t.activity_id = a.id
       WHERE t.user_id = ? AND t.date = ?`, 
      [session.user.id, date]
    );

    // Calculate statistics
    let totalSeconds = 0;
    let workSeconds = 0;
    let auxSeconds = 0;
    let currentActivity = null;

    timerData.forEach(timer => {
      const seconds = timer.accumulated_seconds || 0;
      totalSeconds += seconds;
      
      if (timer.activity_type === 'work') {
        workSeconds += seconds;
      } else {
        auxSeconds += seconds;
      }
      
      if (timer.is_active) {
        currentActivity = timer.activity_name;
      }
    });

    // Calculate percentages
    const workPercent = totalSeconds > 0 ? Math.round((workSeconds / totalSeconds) * 100) : 0;
    const auxPercent = totalSeconds > 0 ? Math.round((auxSeconds / totalSeconds) * 100) : 0;

    return NextResponse.json({
      totalSeconds,
      workSeconds,
      auxSeconds,
      workPercent,
      auxPercent,
      currentActivity,
      timerCount: timerData.length
    });
  } catch (error) {
    console.error('Error fetching timer stats:', error);
    return NextResponse.json({ error: 'Failed to fetch timer stats' }, { status: 500 });
  }
}
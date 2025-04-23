import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin or pdd role
    if (!['admin', 'pdd'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    try {
      // Get all active timers with user information
      const activeTimers = await query(`
        SELECT 
          t.id AS timerId,
          t.user_id AS userId,
          u.name AS userName,
          u.employee_id AS employeeId,
          u.campaign,
          a.id AS activityId,
          a.name AS activityName,
          a.type AS activityType,
          t.accumulated_seconds AS seconds,
          t.start_time AS startTime,
          t.date
        FROM 
          timers t
        JOIN 
          users u ON t.user_id = u.id
        JOIN 
          activities a ON t.activity_id = a.id
        WHERE 
          t.is_active = 1
      `);
      
      return NextResponse.json(activeTimers);
    } catch (error) {
      console.error('Database error:', error);
      
      // Handle ER_NO_SUCH_TABLE error specifically
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return NextResponse.json(
          { error: 'Tables not set up yet', code: 'TABLES_NOT_EXIST' },
          { status: 503 }
        );
      }
      
      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error('Error fetching active timers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active timers' },
      { status: 500 }
    );
  }
}
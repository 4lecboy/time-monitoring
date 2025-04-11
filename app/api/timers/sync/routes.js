import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const timers = Array.isArray(data) ? data : (data.timers || []);
    
    if (!Array.isArray(timers)) {
      return NextResponse.json(
        { error: 'Invalid request format, timers must be an array' },
        { status: 400 }
      );
    }

    // Process each timer
    for (const timer of timers) {
      const { activityId, seconds, isActive, date } = timer;
      
      if (!activityId || typeof seconds !== 'number' || !date) {
        console.log('Invalid timer data:', timer);
        continue; // Skip invalid entries
      }

      try {
        // Check if timer already exists
        const existingTimers = await query(
          'SELECT id FROM timers WHERE user_id = ? AND activity_id = ? AND date = ?',
          [session.user.id, activityId, date]
        );

        if (existingTimers && existingTimers.length > 0) {
          // Update existing timer
          await query(
            `UPDATE timers 
             SET accumulated_seconds = ?, 
                 is_active = ?, 
                 start_time = ?, 
                 last_updated = NOW() 
             WHERE id = ?`,
            [
              seconds,
              isActive ? 1 : 0,
              isActive ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null,
              existingTimers[0].id
            ]
          );
        } else {
          // Create new timer
          await query(
            `INSERT INTO timers 
             (id, user_id, activity_id, date, accumulated_seconds, is_active, start_time) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              uuidv4(),
              session.user.id,
              activityId,
              date,
              seconds,
              isActive ? 1 : 0,
              isActive ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null
            ]
          );
        }
      } catch (error) {
        console.error(`Error processing timer ${activityId}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Timers synced successfully',
      nextSyncInterval: 10000 // 10 seconds
    });
  } catch (error) {
    console.error('Error syncing timers:', error);
    return NextResponse.json({ error: 'Failed to sync timers' }, { status: 500 });
  }
}
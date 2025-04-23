import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    try {
      const activities = await query('SELECT * FROM activities ORDER BY type, name');
      return NextResponse.json(activities);
    } catch (error) {
      // If table doesn't exist, return hardcoded activities
      if (error.code === 'ER_NO_SUCH_TABLE') {
        const defaultActivities = [
          // Work activities
          { id: 'voice', name: 'Voice', type: 'work' },
          { id: 'email', name: 'Email', type: 'work' },
          { id: 'data', name: 'Data', type: 'work' },
          { id: 'chat', name: 'Chat', type: 'work' },
          { id: 'support', name: 'Support', type: 'work' },
          
          // Auxiliary activities
          { id: 'break1', name: 'Break 1', type: 'auxiliary' },
          { id: 'lunch', name: 'Lunch', type: 'auxiliary' },
          { id: 'break2', name: 'Break 2', type: 'auxiliary' },
          { id: 'restroom', name: 'Rest Room', type: 'auxiliary' },
          { id: 'coaching', name: 'Coaching', type: 'auxiliary' },
          { id: 'training', name: 'Training', type: 'auxiliary' },
          { id: 'meeting', name: 'Meeting', type: 'auxiliary' },
          { id: 'technical', name: 'Technical', type: 'auxiliary' },
        ];
        
        return NextResponse.json(defaultActivities);
      }
      
      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // This is a helper function for database queries

export async function GET() {
  try {
    // Query to fetch all campaigns
    const campaigns = await query(`
      SELECT id, name FROM campaigns ORDER BY name ASC
    `);

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
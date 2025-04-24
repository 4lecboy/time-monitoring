import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // Helper for executing MySQL queries

export async function GET() {
  try {
    // Query to fetch all users
    const users = await query(`
      SELECT id, name, email, employee_id, campaign, role, image, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    // Return users as JSON
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const { name, email, employeeId, campaign, password } = await request.json();
    
    // Validate required fields
    if (!name || !email || !employeeId || !password) {
      return NextResponse.json(
        { error: 'Name, email, employee ID, and password are required' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingEmail = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 400 }
      );
    }
    
    // Check if employee ID already exists
    const existingEmployeeId = await query('SELECT id FROM users WHERE employee_id = ?', [employeeId]);
    if (existingEmployeeId.length > 0) {
      return NextResponse.json(
        { error: 'Employee ID is already registered' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const userId = uuidv4();
    await query(
      'INSERT INTO users (id, name, email, employee_id, campaign, role, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [userId, name, email, employeeId, campaign, 'agent', hashedPassword]
    );
    
    return NextResponse.json({ success: true, userId }, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
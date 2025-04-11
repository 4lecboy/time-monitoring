import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ authenticated: false });
    }
    
    return NextResponse.json({
      authenticated: true,
      user: session.user,
      expires: session.expires
    });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Failed to get session', message: error.message },
      { status: 500 }
    );
  }
}
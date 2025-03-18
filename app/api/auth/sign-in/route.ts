import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, activityLogs } from '@/lib/db/schema';
import { comparePasswords, signToken, createSessionCookie } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

async function logActivity(
  userId: number,
  action: string,
  metadata?: Record<string, any>
) {
  await db.insert(activityLogs).values({
    userId,
    action,
    metadata: metadata || {},
    timestamp: new Date(),
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePasswords(
      password,
      user.passwordHash
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = await signToken(user.id);
    const response = NextResponse.json({ success: true });
    response.cookies.set(createSessionCookie(token));

    await logActivity(user.id, 'SIGN_IN', {
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
    });

    return response;
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'An error occurred during sign in' },
      { status: 500 }
    );
  }
} 
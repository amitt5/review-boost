import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, activityLogs } from '@/lib/db/schema';
import { hashPassword, signToken, createSessionCookie } from '@/lib/auth/session';
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
    const name = formData.get('name') as string;
    const businessName = formData.get('businessName') as string;

    if (!email || !password || !name || !businessName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        name,
        businessName,
      })
      .returning();

    const token = await signToken(user.id);
    const response = NextResponse.json({ success: true });
    response.cookies.set(createSessionCookie(token));

    await logActivity(user.id, 'SIGN_UP', {
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
    });

    return response;
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'An error occurred during sign up' },
      { status: 500 }
    );
  }
} 
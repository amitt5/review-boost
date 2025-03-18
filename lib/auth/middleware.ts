import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export type AuthenticatedAction = {
  userId: number;
};

export async function withAuth<T>(
  action: (auth: AuthenticatedAction) => Promise<T>
): Promise<T> {
  const payload = await verifyToken();
  if (!payload) {
    throw new Error('Unauthorized');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId),
  });

  if (!user) {
    throw new Error('User not found');
  }

  return action({ userId: user.id });
}

export function unauthorized() {
  return new NextResponse(null, { status: 401 });
}

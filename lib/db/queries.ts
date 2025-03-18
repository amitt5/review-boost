import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { activityLogs, users, reviewRequests } from '@/lib/db/schema';
import { verifyToken } from '@/lib/auth/session';
import { cache } from 'react';

export const getUser = cache(async () => {
  try {
    const payload = await verifyToken();
    if (!payload?.userId) return null;

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
});

export const getUserById = cache(async (id: number) => {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
});

export const getReviewRequests = cache(async (userId: number) => {
  return db.query.reviewRequests.findMany({
    where: eq(reviewRequests.userId, userId),
    orderBy: (reviewRequests, { desc }) => [desc(reviewRequests.createdAt)],
  });
});

export const getActivityLogs = cache(async (userId: number) => {
  return db.query.activityLogs.findMany({
    where: eq(activityLogs.userId, userId),
    orderBy: (activityLogs, { desc }) => [desc(activityLogs.timestamp)],
  });
});

'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { comparePasswords, hashPassword } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser } from '@/lib/db/queries';
import { withAuth } from '@/lib/auth/middleware';
import { revalidatePath } from 'next/cache';

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
  redirect: z.string().optional(),
  priceId: z.string().optional(),
});

export async function signIn(data: z.infer<typeof signInSchema>) {
  const { email, password, redirect: redirectTo, priceId } = data;

  const response = await fetch('/api/auth/sign-in', {
    method: 'POST',
    body: new URLSearchParams({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to sign in');
  }

  revalidatePath('/');

  if (redirectTo === 'checkout' && priceId) {
    return createCheckoutSession(priceId);
  }

  return redirect('/dashboard');
}

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string(),
  businessName: z.string(),
});

export async function signUp(data: z.infer<typeof signUpSchema>) {
  const { email, password, name, businessName } = data;

  const response = await fetch('/api/auth/sign-up', {
    method: 'POST',
    body: new URLSearchParams({ email, password, name, businessName }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to sign up');
  }

  revalidatePath('/');
  return redirect('/dashboard');
}

export async function signOut() {
  await fetch('/api/auth/sign-out', { method: 'POST' });
  revalidatePath('/');
  return redirect('/sign-in');
}

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export async function updatePassword(data: z.infer<typeof updatePasswordSchema>) {
  return withAuth(async ({ userId }) => {
    const { currentPassword, newPassword } = data;
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await comparePasswords(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    if (currentPassword === newPassword) {
      throw new Error('New password must be different from the current password');
    }

    const hashedPassword = await hashPassword(newPassword);
    await db
      .update(users)
      .set({ passwordHash: hashedPassword })
      .where(eq(users.id, userId));

    revalidatePath('/');
    return { success: true };
  });
}

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export async function deleteAccount(data: z.infer<typeof deleteAccountSchema>) {
  return withAuth(async ({ userId }) => {
    const { password } = data;
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await comparePasswords(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Incorrect password');
    }

    await db.delete(users).where(eq(users.id, userId));
    await fetch('/api/auth/sign-out', { method: 'POST' });
    revalidatePath('/');
    return redirect('/sign-in');
  });
}

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  businessName: z.string().min(1, 'Business name is required'),
  whatsappNumber: z.string().optional(),
  googlePlaceId: z.string().optional(),
});

export async function updateProfile(data: z.infer<typeof updateProfileSchema>) {
  return withAuth(async ({ userId }) => {
    await db.update(users)
      .set(data)
      .where(eq(users.id, userId));

    revalidatePath('/');
    return { success: true };
  });
}

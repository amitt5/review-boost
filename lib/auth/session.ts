import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const SESSION_TOKEN = 'session-token';
const key = new TextEncoder().encode(process.env.AUTH_SECRET || 'default-secret-key');

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(plainText: string, hash: string) {
  return bcrypt.compare(plainText, hash);
}

export async function signToken(userId: number) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(key);
}

export async function verifyToken(request?: NextRequest | Request) {
  let token: string | undefined;
  
  if (request) {
    if (request instanceof NextRequest) {
      // For middleware
      token = request.cookies.get(SESSION_TOKEN)?.value;
    } else {
      // For API routes
      token = request.headers.get('cookie')?.split(';')
        .find(c => c.trim().startsWith(`${SESSION_TOKEN}=`))
        ?.split('=')[1];
    }
  } else if (typeof window === 'undefined') {
    // For server components
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    token = cookieStore.get(SESSION_TOKEN)?.value;
  }

  if (!token) return null;

  try {
    const verified = await jwtVerify(token, key);
    return verified.payload as { userId: number };
  } catch (err) {
    return null;
  }
}

export function createSessionCookie(token: string) {
  return {
    name: SESSION_TOKEN,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    path: '/',
  } as const;
}

export async function clearSession(response: NextResponse) {
  response.cookies.delete(SESSION_TOKEN);
  return response;
}

export function getSessionToken(req: NextRequest) {
  return req.cookies.get(SESSION_TOKEN)?.value;
}

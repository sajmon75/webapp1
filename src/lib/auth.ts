// src/lib/auth.ts
import * as jose from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'chiave-segreta-paninoteca-scuola-intervallo-2026-super-secure';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'CLASS_REP' | 'CATERING' | 'ADMIN';
  schoolId?: string | null;
  branchId?: string | null;
  classroomId?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(payload: TokenPayload): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        school: true,
        branch: true,
        classroom: true,
      },
    });

    return user;
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw err;
    }
    console.error('Error fetching current user:', err);
    return null;
  }
}

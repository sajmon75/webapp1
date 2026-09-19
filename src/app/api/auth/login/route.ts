// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signSessionToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e password sono obbligatori' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        school: true,
        branch: true,
        classroom: true,
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
    }

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      schoolId: user.schoolId,
      branchId: user.branchId,
      classroomId: user.classroomId,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        school: user.school,
        branch: user.branch,
        classroom: user.classroom,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 giorni
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}


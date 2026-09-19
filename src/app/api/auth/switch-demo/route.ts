// src/app/api/auth/switch-demo/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signSessionToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        school: true,
        branch: true,
        classroom: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
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
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Switch demo error:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}


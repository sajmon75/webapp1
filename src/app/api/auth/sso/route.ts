// src/app/api/auth/sso/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signSessionToken } from '@/lib/auth';

// Endpoint per gestione SSO (Google / Microsoft) sia in modalità diretta che simulata
export async function POST(req: Request) {
  try {
    const { provider, email, name } = await req.json();

    if (!provider || !email) {
      return NextResponse.json({ error: 'Dati SSO mancanti' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Cerca se esiste già un utente
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { school: true, branch: true, classroom: true },
    });

    if (!user) {
      // Se non esiste, associa alla scuola primaria e prima classe disponibile
      const firstSchool = await prisma.school.findFirst();
      const firstBranch = await prisma.branch.findFirst({ where: { schoolId: firstSchool?.id } });
      const firstClassroom = await prisma.classroom.findFirst({ where: { schoolId: firstSchool?.id } });

      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: name || cleanEmail.split('@')[0],
          role: 'STUDENT',
          ssoProvider: provider.toUpperCase(),
          schoolId: firstSchool?.id,
          branchId: firstBranch?.id,
          classroomId: firstClassroom?.id,
        },
        include: { school: true, branch: true, classroom: true },
      });
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
    console.error('SSO Login error:', error);
    return NextResponse.json({ error: 'Errore durante autenticazione SSO' }, { status: 500 });
  }
}


// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      branchId: user.branchId,
      classroomId: user.classroomId,
      school: user.school,
      branch: user.branch,
      classroom: user.classroom,
      avatarUrl: user.avatarUrl,
    },
  });
}


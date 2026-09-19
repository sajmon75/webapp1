// src/app/api/schools/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const schools = await prisma.school.findMany({
      include: {
        branches: {
          include: {
            classrooms: {
              include: {
                users: {
                  where: { role: 'CLASS_REP' },
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ schools });
  } catch (error) {
    console.error('Fetch schools error:', error);
    return NextResponse.json({ error: 'Errore nel recupero scuole' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accesso riservato all’amministrazione' }, { status: 403 });
    }

    const { schoolId, enableStockTracking, orderCutoffTime, name } = await req.json();

    if (!schoolId) {
      return NextResponse.json({ error: 'ID Scuola mancante' }, { status: 400 });
    }

    const updated = await prisma.school.update({
      where: { id: schoolId },
      data: {
        ...(enableStockTracking !== undefined && { enableStockTracking: Boolean(enableStockTracking) }),
        ...(orderCutoffTime !== undefined && { orderCutoffTime }),
        ...(name !== undefined && { name }),
      },
    });

    return NextResponse.json({ success: true, school: updated });
  } catch (error) {
    console.error('Update school error:', error);
    return NextResponse.json({ error: 'Errore nell’aggiornamento scuola' }, { status: 500 });
  }
}


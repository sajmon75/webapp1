// src/app/api/orders/class/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    if (!user.classroomId) {
      return NextResponse.json({ error: 'Nessuna classe associata' }, { status: 400 });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const classroom = await prisma.classroom.findUnique({
      where: { id: user.classroomId },
      include: { branch: true, school: true },
    });

    const classOrder = await prisma.classDailyOrder.findUnique({
      where: {
        classroomId_date: {
          classroomId: user.classroomId,
          date: todayStr,
        },
      },
      include: {
        confirmedBy: { select: { id: true, name: true } },
        items: {
          include: {
            student: { select: { id: true, name: true, email: true } },
            product: true,
          },
          orderBy: [{ student: { name: 'asc' } }, { createdAt: 'asc' }],
        },
      },
    });

    // Raggruppa gli articoli per studente per una visualizzazione comoda
    const studentOrdersMap: Record<
      string,
      {
        studentId: string;
        studentName: string;
        studentEmail: string;
        isAllPaid: boolean;
        total: number;
        items: any[];
      }
    > = {};

    if (classOrder?.items) {
      for (const item of classOrder.items) {
        const sid = item.student.id;
        if (!studentOrdersMap[sid]) {
          studentOrdersMap[sid] = {
            studentId: sid,
            studentName: item.student.name,
            studentEmail: item.student.email,
            isAllPaid: true,
            total: 0,
            items: [],
          };
        }

        studentOrdersMap[sid].items.push(item);
        studentOrdersMap[sid].total += item.quantity * item.unitPrice;
        if (!item.isPaid) {
          studentOrdersMap[sid].isAllPaid = false;
        }
      }
    }

    const studentsList = Object.values(studentOrdersMap);
    const totalCollected = studentsList.reduce(
      (sum, st) => sum + (st.isAllPaid ? st.total : 0),
      0
    );
    const totalDue = classOrder?.totalAmount || 0;

    return NextResponse.json({
      classroom,
      date: todayStr,
      classOrder: classOrder
        ? {
            id: classOrder.id,
            status: classOrder.status,
            totalAmount: classOrder.totalAmount,
            notes: classOrder.notes,
            confirmedAt: classOrder.confirmedAt,
            confirmedBy: classOrder.confirmedBy,
          }
        : null,
      studentsList,
      totalDue,
      totalCollected,
      allPaid: totalDue > 0 && totalCollected >= totalDue,
    });
  } catch (error) {
    console.error('Fetch class orders error:', error);
    return NextResponse.json({ error: 'Errore nel recupero dati classe' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // Il responsabile di classe o admin possono confermare l'ordine o aggiornare pagamenti
    if (user.role !== 'CLASS_REP' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo il responsabile di classe può compiere questa azione' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    const todayStr = new Date().toISOString().split('T')[0];

    if (action === 'TOGGLE_STUDENT_PAID') {
      const { studentId, isPaid } = body;
      if (!studentId || isPaid === undefined) {
        return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
      }

      const classOrder = await prisma.classDailyOrder.findUnique({
        where: { classroomId_date: { classroomId: user.classroomId!, date: todayStr } },
      });

      if (!classOrder) {
        return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 });
      }

      // Aggiorna tutti gli articoli di questo studente per oggi
      await prisma.orderItem.updateMany({
        where: {
          orderBatchId: classOrder.id,
          studentId: studentId,
        },
        data: { isPaid: Boolean(isPaid) },
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'CONFIRM_CLASS_ORDER') {
      const { notes } = body;

      const classOrder = await prisma.classDailyOrder.findUnique({
        where: { classroomId_date: { classroomId: user.classroomId!, date: todayStr } },
        include: { items: true },
      });

      if (!classOrder || classOrder.items.length === 0) {
        return NextResponse.json({ error: 'Nessun ordine presente per questa classe oggi' }, { status: 400 });
      }

      const updated = await prisma.classDailyOrder.update({
        where: { id: classOrder.id },
        data: {
          status: 'CONFIRMED_BY_REP',
          confirmedAt: new Date(),
          confirmedById: user.id,
          notes: notes || classOrder.notes || 'Ordine confermato dal responsabile di classe',
        },
      });

      return NextResponse.json({ success: true, classOrder: updated });
    }

    if (action === 'REOPEN_CLASS_ORDER') {
      // Per riaprire se serve una correzione prima della preparazione
      const classOrder = await prisma.classDailyOrder.findUnique({
        where: { classroomId_date: { classroomId: user.classroomId!, date: todayStr } },
      });

      if (!classOrder) return NextResponse.json({ error: 'Non trovato' }, { status: 404 });

      if (classOrder.status === 'READY' || classOrder.status === 'DELIVERED') {
        return NextResponse.json({ error: 'L’ordine è già in stato avanzato o consegnato' }, { status: 400 });
      }

      const updated = await prisma.classDailyOrder.update({
        where: { id: classOrder.id },
        data: {
          status: 'DRAFT',
          confirmedAt: null,
          confirmedById: null,
        },
      });

      return NextResponse.json({ success: true, classOrder: updated });
    }

    return NextResponse.json({ error: 'Azione non riconosciuta' }, { status: 400 });
  } catch (error) {
    console.error('Class rep action error:', error);
    return NextResponse.json({ error: 'Errore nell’azione' }, { status: 500 });
  }
}


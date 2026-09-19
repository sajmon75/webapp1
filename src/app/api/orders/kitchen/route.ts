// src/app/api/orders/kitchen/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'CATERING' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Accesso riservato al servizio ristorazione' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filterBranchId = searchParams.get('branchId');
    const filterSchoolId = searchParams.get('schoolId') || user.schoolId;

    const todayStr = new Date().toISOString().split('T')[0];

    // Solo ordini CONFERMATI dal responsabile (o già in lavorazione/pronti)
    // Gli ordini ancora in 'DRAFT' NON sono visibili al bar!
    const classOrders = await prisma.classDailyOrder.findMany({
      where: {
        date: todayStr,
        status: { in: ['CONFIRMED_BY_REP', 'PREPARING', 'READY', 'DELIVERED'] },
        classroom: {
          schoolId: filterSchoolId || undefined,
          branchId: filterBranchId || undefined,
        },
      },
      include: {
        classroom: {
          include: {
            branch: true,
            school: true,
          },
        },
        confirmedBy: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: true,
            student: { select: { id: true, name: true } },
          },
          orderBy: [{ student: { name: 'asc' } }, { createdAt: 'asc' }],
        },
      },
      orderBy: [
        { classroom: { branch: { name: 'asc' } } },
        { classroom: { name: 'asc' } },
      ],
    });

    // Calcolo Totali Aggregati di Preparazione (es. 42 panini cotto, 18 focacce)
    const prepSummaryMap: Record<
      string,
      {
        productId: string;
        productName: string;
        categoryName: string;
        totalQuantity: number;
        customizations: string[];
      }
    > = {};

    for (const order of classOrders) {
      for (const item of order.items) {
        const pid = item.productId;
        if (!prepSummaryMap[pid]) {
          prepSummaryMap[pid] = {
            productId: pid,
            productName: item.product.name,
            categoryName: item.product.allergens || 'Generale',
            totalQuantity: 0,
            customizations: [],
          };
        }
        prepSummaryMap[pid].totalQuantity += item.quantity;
        if (item.customization && item.customization.trim() !== '') {
          prepSummaryMap[pid].customizations.push(
            `${order.classroom.name} (${item.student.name}): ${item.customization}`
          );
        }
      }
    }

    const prepSummary = Object.values(prepSummaryMap).sort(
      (a, b) => b.totalQuantity - a.totalQuantity
    );

    // Lista filtri plessi disponibili per la cucina
    const branches = await prisma.branch.findMany({
      where: filterSchoolId ? { schoolId: filterSchoolId } : undefined,
      include: { school: true },
    });

    return NextResponse.json({
      date: todayStr,
      classOrders,
      prepSummary,
      branches,
      totalClasses: classOrders.length,
      totalItems: prepSummary.reduce((sum, item) => sum + item.totalQuantity, 0),
      totalRevenue: classOrders.reduce((sum, ord) => sum + ord.totalAmount, 0),
    });
  } catch (error) {
    console.error('Kitchen orders error:', error);
    return NextResponse.json({ error: 'Errore caricamento ordini cucina' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'CATERING' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Accesso riservato alla ristorazione' }, { status: 403 });
    }

    const { orderId, newStatus } = await req.json();
    const validStatuses = ['CONFIRMED_BY_REP', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];

    if (!orderId || !validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: 'Stato o ID ordine non valido' }, { status: 400 });
    }

    const updated = await prisma.classDailyOrder.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: { classroom: true },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('Update kitchen order error:', error);
    return NextResponse.json({ error: 'Errore aggiornamento ordine' }, { status: 500 });
  }
}


// src/app/api/orders/student/route.ts
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
      return NextResponse.json({ error: 'Nessuna classe associata al profilo' }, { status: 400 });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Trova l'ordine giornaliero della classe
    const classOrder = await prisma.classDailyOrder.findUnique({
      where: {
        classroomId_date: {
          classroomId: user.classroomId,
          date: todayStr,
        },
      },
      include: {
        confirmedBy: { select: { name: true } },
        items: {
          where: { studentId: user.id },
          include: { product: true },
        },
      },
    });

    return NextResponse.json({
      date: todayStr,
      classOrder: classOrder
        ? {
            id: classOrder.id,
            status: classOrder.status,
            confirmedAt: classOrder.confirmedAt,
            confirmedBy: classOrder.confirmedBy?.name,
          }
        : null,
      myItems: classOrder?.items || [],
      totalMyOrder:
        classOrder?.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0) || 0,
    });
  } catch (error) {
    console.error('Fetch student order error:', error);
    return NextResponse.json({ error: 'Errore nel recupero ordine' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    if (!user.classroomId) {
      return NextResponse.json({ error: 'Devi appartenere a una classe per ordinare' }, { status: 400 });
    }

    const { items } = await req.json(); // Array di { productId, quantity, customization }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Nessun prodotto selezionato' }, { status: 400 });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Trova o crea l'ordine giornaliero per la classe di oggi
    let classOrder = await prisma.classDailyOrder.findUnique({
      where: {
        classroomId_date: {
          classroomId: user.classroomId,
          date: todayStr,
        },
      },
    });

    if (classOrder && classOrder.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'L’ordine per la tua classe è già stato confermato dal responsabile o inviato al bar e non può essere modificato.' },
        { status: 400 }
      );
    }

    if (!classOrder) {
      classOrder = await prisma.classDailyOrder.create({
        data: {
          classroomId: user.classroomId,
          date: todayStr,
          status: 'DRAFT',
          totalAmount: 0,
        },
      });
    }

    // 2. Rimuovi i vecchi item di questo studente per oggi (sovrascrittura carrello)
    await prisma.orderItem.deleteMany({
      where: {
        orderBatchId: classOrder.id,
        studentId: user.id,
      },
    });

    // 3. Aggiungi i nuovi articoli controllando disponibilità
    let studentTotal = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      if (!product.isAvailable) {
        return NextResponse.json({ error: `Il prodotto "${product.name}" è esaurito!` }, { status: 400 });
      }

      // Se il tracciamento scorte è attivo e la scorta è minore della quantità richiesta
      if (product.stockQuantity !== null && product.stockQuantity < (item.quantity || 1)) {
        return NextResponse.json(
          { error: `Scorte insufficienti per "${product.name}" (rimasti: ${product.stockQuantity})` },
          { status: 400 }
        );
      }

      const qty = Math.max(1, parseInt(item.quantity) || 1);
      studentTotal += product.price * qty;

      await prisma.orderItem.create({
        data: {
          orderBatchId: classOrder.id,
          studentId: user.id,
          productId: product.id,
          quantity: qty,
          unitPrice: product.price,
          customization: item.customization || '',
          isPaid: false,
        },
      });

      // Se gestisce le scorte, decrementa
      if (product.stockQuantity !== null) {
        await prisma.product.update({
          where: { id: product.id },
          data: { stockQuantity: Math.max(0, product.stockQuantity - qty) },
        });
      }
    }

    // 4. Ricalcola il totale complessivo dell'ordine della classe
    const allItems = await prisma.orderItem.findMany({
      where: { orderBatchId: classOrder.id },
    });
    const batchTotal = allItems.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);

    await prisma.classDailyOrder.update({
      where: { id: classOrder.id },
      data: { totalAmount: batchTotal },
    });

    return NextResponse.json({ success: true, studentTotal });
  } catch (error) {
    console.error('Submit order error:', error);
    return NextResponse.json({ error: 'Errore nell’invio dell’ordine' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.classroomId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const classOrder = await prisma.classDailyOrder.findUnique({
      where: {
        classroomId_date: {
          classroomId: user.classroomId,
          date: todayStr,
        },
      },
    });

    if (!classOrder || classOrder.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Impossibile annullare l’ordine: già confermato o inesistente' }, { status: 400 });
    }

    await prisma.orderItem.deleteMany({
      where: {
        orderBatchId: classOrder.id,
        studentId: user.id,
      },
    });

    // Ricalcola totale
    const remainingItems = await prisma.orderItem.findMany({
      where: { orderBatchId: classOrder.id },
    });
    const batchTotal = remainingItems.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);

    await prisma.classDailyOrder.update({
      where: { id: classOrder.id },
      data: { totalAmount: batchTotal },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json({ error: 'Errore nell’annullamento' }, { status: 500 });
  }
}


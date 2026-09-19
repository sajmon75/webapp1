// src/app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'CATERING' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const dataToUpdate: any = {};
    if (body.isAvailable !== undefined) dataToUpdate.isAvailable = Boolean(body.isAvailable);
    if (body.stockQuantity !== undefined) {
      dataToUpdate.stockQuantity = body.stockQuantity === null || body.stockQuantity === '' ? null : parseInt(body.stockQuantity);
    }
    if (body.price !== undefined) dataToUpdate.price = parseFloat(body.price);
    if (body.name !== undefined) dataToUpdate.name = body.name;
    if (body.description !== undefined) dataToUpdate.description = body.description;
    if (body.categoryId !== undefined) dataToUpdate.categoryId = body.categoryId;
    if (body.allergens !== undefined) dataToUpdate.allergens = body.allergens;
    if (body.isVegetarian !== undefined) dataToUpdate.isVegetarian = Boolean(body.isVegetarian);
    if (body.isGlutenFree !== undefined) dataToUpdate.isGlutenFree = Boolean(body.isGlutenFree);

    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
      include: { category: true },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Errore nell’aggiornamento prodotto' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'CATERING' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Errore nell’eliminazione prodotto' }, { status: 500 });
  }
}


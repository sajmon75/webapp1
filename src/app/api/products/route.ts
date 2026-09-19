// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const schoolId = searchParams.get('schoolId');

    const user = await getCurrentUser();
    const effectiveSchoolId = schoolId || user?.schoolId;

    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const whereClause: any = {};
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (effectiveSchoolId) {
      whereClause.OR = [
        { schoolId: null },
        { schoolId: effectiveSchoolId },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
    });

    // Se la scuola ha abilitato il tracciamento scorte
    let schoolSettings = null;
    if (effectiveSchoolId) {
      schoolSettings = await prisma.school.findUnique({
        where: { id: effectiveSchoolId },
        select: { enableStockTracking: true, orderCutoffTime: true, name: true },
      });
    }

    return NextResponse.json({
      categories,
      products,
      schoolSettings,
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Errore nel caricamento prodotti' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'CATERING' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Accesso non autorizzato' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      description,
      price,
      categoryId,
      schoolId,
      imageUrl,
      isAvailable,
      stockQuantity,
      allergens,
      isVegetarian,
      isGlutenFree,
    } = body;

    if (!name || price === undefined || !categoryId) {
      return NextResponse.json({ error: 'Nome, prezzo e categoria sono obbligatori' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        schoolId: schoolId || user.schoolId,
        imageUrl: imageUrl || null,
        isAvailable: isAvailable ?? true,
        stockQuantity: stockQuantity !== undefined && stockQuantity !== '' ? parseInt(stockQuantity) : null,
        allergens: allergens || null,
        isVegetarian: !!isVegetarian,
        isGlutenFree: !!isGlutenFree,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Errore nella creazione del prodotto' }, { status: 500 });
  }
}


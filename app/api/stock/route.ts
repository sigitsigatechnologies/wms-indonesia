import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/stock - Get stock movements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const referenceType = searchParams.get('referenceType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const whereClause: {
      productId?: string;
      referenceType?: string;
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (productId) {
      whereClause.productId = productId;
    }

    if (referenceType) {
      whereClause.referenceType = referenceType;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate);
      }
    }

    const stockMovements = await prisma.stockMovement.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
      },
    });

    return NextResponse.json(stockMovements);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    return NextResponse.json({ error: 'Failed to fetch stock movements' }, { status: 500 });
  }
}

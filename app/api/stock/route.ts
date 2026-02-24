import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/stock - Get stock movements or products with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'movements'; // 'products' or 'movements'
    const productId = searchParams.get('productId');
    const referenceType = searchParams.get('referenceType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (type === 'products') {
      // Get products with stock info
      const totalItems = await prisma.product.count();
      const totalPages = Math.ceil(totalItems / limit);

      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      return NextResponse.json({
        data: products,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
        },
      });
    }

    // Get stock movements
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

    // Get total count for pagination
    const totalItems = await prisma.stockMovement.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / limit);

    const stockMovements = await prisma.stockMovement.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        product: true,
      },
    });

    return NextResponse.json({
      data: stockMovements,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
}

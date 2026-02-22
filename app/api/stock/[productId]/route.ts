import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/stock/[productId] - Get stock for a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      productId: product.id,
      productName: product.name,
      currentStock: product.currentStock,
      minStock: product.minStock,
      averageCost: product.averageCost,
      sellingPrice: product.sellingPrice,
      movements: product.stockMovements,
    });
  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json({ error: 'Failed to fetch stock' }, { status: 500 });
  }
}

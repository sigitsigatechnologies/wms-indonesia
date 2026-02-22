import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barcode, name, unit, sellingPrice, minStock } = body;

    // Check if barcode already exists
    const existingProduct = await prisma.product.findUnique({
      where: { barcode },
    });

    if (existingProduct) {
      return NextResponse.json({ error: 'Barcode already exists' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        barcode,
        name,
        unit,
        sellingPrice: parseFloat(sellingPrice) || 0,
        averageCost: parseFloat(body.averageCost) || 0,
        currentStock: parseFloat(body.currentStock) || 0,
        minStock: parseFloat(minStock) || 0,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

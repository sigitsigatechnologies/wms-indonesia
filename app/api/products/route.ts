import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products - Get all products or search by barcode with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get('barcode');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // If barcode is provided, search for that specific product
    if (barcode) {
      const product = await prisma.product.findUnique({
        where: { barcode },
      });
      if (product) {
        return NextResponse.json([product]);
      }
      return NextResponse.json([]);
    }
    
    // Build where clause for search
    let whereClause = {};
    if (search) {
      whereClause = {
        OR: [
          { barcode: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      };
    }
    
    // Get total count for pagination
    const totalItems = await prisma.product.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / limit);
    
    // Get paginated products
    const products = await prisma.product.findMany({
      where: whereClause,
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

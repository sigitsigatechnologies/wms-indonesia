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
        return NextResponse.json({
          data: [product],
          pagination: {
            page: 1,
            limit: 1,
            totalItems: 1,
            totalPages: 1,
          },
        });
      }
      return NextResponse.json({
        data: [],
        pagination: {
          page: 1,
          limit: 1,
          totalItems: 0,
          totalPages: 0,
        },
      });
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

    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Validate sortBy field to prevent invalid queries
    const validSortFields = ['barcode', 'name', 'sellingPrice', 'currentStock', 'createdAt'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const finalSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';
    // Get total count for pagination
    const totalItems = await prisma.product.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / limit);
    
    // Get paginated products
    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { [finalSortBy]: finalSortOrder },
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
    let { barcode, name, unit, sellingPrice, minStock } = body;

    // Generate barcode if not provided or empty
    if (!barcode || barcode.trim() === '') {
      const timestamp = Date.now().toString();
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      barcode = `PRD${timestamp}${randomSuffix}`;
    }

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

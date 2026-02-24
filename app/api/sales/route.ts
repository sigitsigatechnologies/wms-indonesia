import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/sales - Get all sales with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const whereClause: { createdAt?: { gte?: Date; lte?: Date } } = {};
    
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
    const totalItems = await prisma.sale.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / limit);

    const sales = await prisma.sale.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      data: sales,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

// Helper function to execute with retry for Neon/Serverless
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      // Only retry on transaction errors
      if (error.code !== 'P2028' || i === maxRetries - 1) {
        throw error;
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  throw lastError;
}

// POST /api/sales - Create a new sale
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceNumber, paymentMethod, items } = body;

    // First, validate and prepare data outside transaction
    const processedItems: {
      productId: string;
      quantity: number;
      sellingPrice: number;
      costPrice: number;
      subtotal: number;
      profit: number;
      currentStock: number;
    }[] = [];
    let totalAmount = 0;
    let totalProfit = 0;

    // Check if invoice number already exists
    const existingSale = await prisma.sale.findUnique({
      where: { invoiceNumber },
    });

    if (existingSale) {
      return NextResponse.json({ error: 'Invoice number already exists' }, { status: 400 });
    }

    // Validate stock and get product data
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }

      const currentStock = Number(product.currentStock);
      if (currentStock < Number(item.quantity)) {
        return NextResponse.json({ error: `Insufficient stock for product: ${product.name}` }, { status: 400 });
      }

      const sellingPrice = Number(item.sellingPrice);
      const costPrice = Number(product.averageCost);
      const quantity = Number(item.quantity);
      
      const subtotal = sellingPrice * quantity;
      const profit = (sellingPrice - costPrice) * quantity;

      totalAmount += subtotal;
      totalProfit += profit;

      processedItems.push({
        productId: item.productId,
        quantity: quantity,
        sellingPrice: sellingPrice,
        costPrice: costPrice,
        subtotal: subtotal,
        profit: profit,
        currentStock: currentStock,
      });
    }

    // Now do minimal transaction for creating records
    const result = await prisma.$transaction(async (tx: any) => {
      // Create sale with items
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          paymentMethod,
          totalAmount: String(totalAmount),
          totalProfit: String(totalProfit),
          items: {
            create: processedItems.map((item: any) => ({
              productId: item.productId,
              quantity: String(item.quantity),
              sellingPrice: String(item.sellingPrice),
              costPriceSnapshot: String(item.costPrice),
              profit: String(item.profit),
              subtotal: String(item.subtotal),
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update stock in batch using updateMany
      for (const item of processedItems) {
        const newStock = item.currentStock - item.quantity;
        
        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: String(newStock),
          },
        });

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            referenceType: 'SALE',
            referenceId: sale.id,
            movementType: 'OUT',
            quantity: String(item.quantity),
            stockBefore: String(item.currentStock),
            stockAfter: String(newStock),
          },
        });
      }

      return sale;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    const message = error instanceof Error ? error.message : 'Failed to create sale';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/sales - Get all sales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

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

    const sales = await prisma.sale.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

// POST /api/sales - Create a new sale
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceNumber, paymentMethod, items } = body;

    // Start transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Check if invoice number already exists
      const existingSale = await tx.sale.findUnique({
        where: { invoiceNumber },
      });

      if (existingSale) {
        throw new Error('Invoice number already exists');
      }

      let totalAmount = 0;
      let totalProfit = 0;

      // Validate stock and calculate totals
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        const currentStock = Number(product.currentStock);
        if (currentStock < Number(item.quantity)) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        const sellingPrice = Number(item.sellingPrice);
        const costPrice = Number(product.averageCost);
        const quantity = Number(item.quantity);
        
        const subtotal = sellingPrice * quantity;
        const profit = (sellingPrice - costPrice) * quantity;

        totalAmount += subtotal;
        totalProfit += profit;
      }

      // Create sale with items
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          paymentMethod,
          totalAmount: String(totalAmount),
          totalProfit: String(totalProfit),
          items: {
            create: items.map((item: { productId: string; quantity: number; sellingPrice: number }) => {
              const quantity = Number(item.quantity);
              const sellingPrice = Number(item.sellingPrice);
              
              return {
                productId: item.productId,
                quantity: String(quantity),
                sellingPrice: String(sellingPrice),
                costPriceSnapshot: String(0), // Will update after product lookup
                profit: String(0), // Will update after
                subtotal: String(sellingPrice * quantity),
              };
            }),
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

      // Update stock and create stock movements
      for (const item of sale.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (product) {
          const currentStock = Number(product.currentStock);
          const newStock = currentStock - Number(item.quantity);
          const costPrice = Number(product.averageCost);

          // Update sale item with cost price snapshot and profit
          await tx.saleItem.update({
            where: { id: item.id },
            data: {
              costPriceSnapshot: String(costPrice),
              profit: String((Number(item.sellingPrice) - costPrice) * Number(item.quantity)),
            },
          });

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
              stockBefore: String(currentStock),
              stockAfter: String(newStock),
            },
          });
        }
      }

      // Return updated sale with correct profits
      return await tx.sale.findUnique({
        where: { id: sale.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    const message = error instanceof Error ? error.message : 'Failed to create sale';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

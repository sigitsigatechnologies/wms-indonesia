import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to parse number to Decimal-like object
const toDecimal = (value: number | string) => {
  return { value: Number(value), toString: () => String(value) };
};

// Helper function for decimal operations
const mul = (a: { toString: () => string }, b: { toString: () => string }) => {
  return Number(a.toString()) * Number(b.toString());
};

const add = (a: number, b: number) => {
  return a + b;
};

// GET /api/purchases - Get all purchases
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');
    const purchases = await prisma.purchase.findMany({
      where: supplierId ? { supplierId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

// POST /api/purchases - Create a new purchase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceNumber, supplierId, purchaseDate, items } = body;
    // Start transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Check if invoice number already exists
      const existingPurchase = await tx.purchase.findUnique({
        where: { invoiceNumber },
      });

      if (existingPurchase) {
        throw new Error('Invoice number already exists');
      }

      let totalAmount = 0;

      // Create purchase with items
      const purchase = await tx.purchase.create({
        data: {
          invoiceNumber,
          supplierId,
          purchaseDate: new Date(purchaseDate),
          totalAmount: 0, // Will update after items
          items: {
            create: items.map((item: { productId: string; quantity: number; costPrice: number }) => {
              const quantity = Number(item.quantity);
              const costPrice = Number(item.costPrice);
              const subtotal = quantity * costPrice;
              totalAmount = add(totalAmount, subtotal);

              return {
                productId: item.productId,
                quantity,
                costPrice,
                subtotal,
              };
            }),
          },
        },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update total amount
      const updatedPurchase = await tx.purchase.update({
        where: { id: purchase.id },
        data: { totalAmount },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update product stock and average cost
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (product) {
          const currentStock = Number(product.currentStock);
          const newStock = currentStock + Number(item.quantity);
          
          // Calculate new average cost
          const currentTotalValue = currentStock * Number(product.averageCost);
          const newTotalValue = Number(item.quantity) * Number(item.costPrice);
          const newTotalStock = currentStock + Number(item.quantity);
          const newAverageCost = newTotalStock > 0 ? (newTotalValue + currentTotalValue) / newTotalStock : 0;

          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: newStock,
              averageCost: newAverageCost,
            },
          });

          // Create stock movement
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              referenceType: 'PURCHASE',
              referenceId: purchase.id,
              movementType: 'IN',
              quantity: item.quantity,
              stockBefore: currentStock,
              stockAfter: newStock,
            },
          });
        }
      }

      return updatedPurchase;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase:', error);
    const message = error instanceof Error ? error.message : 'Failed to create purchase';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

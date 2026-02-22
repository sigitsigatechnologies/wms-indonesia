import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

// GET /api/sales/[id] - Get a single sale by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    return NextResponse.json({ error: 'Failed to fetch sale' }, { status: 500 });
  }
}

// DELETE /api/sales/[id] - Delete a sale (and reverse stock)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prisma = new PrismaClient();
    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if sale exists
      const sale = await tx.sale.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!sale) {
        throw new Error('Sale not found');
      }

      // Reverse stock for each item
      for (const item of sale.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (product) {
          const currentStock = Number(product.currentStock);
          const newStock = currentStock + Number(item.quantity);

          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: newStock,
            },
          });

          // Create reverse stock movement
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              referenceType: 'SALE_DELETE',
              referenceId: sale.id,
              movementType: 'IN',
              quantity: item.quantity,
              stockBefore: currentStock,
              stockAfter: newStock,
            },
          });
        }
      }

      // Delete sale (cascade will delete items)
      await tx.sale.delete({
        where: { id },
      });

      return { message: 'Sale deleted successfully' };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting sale:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete sale';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

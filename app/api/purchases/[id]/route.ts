import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/purchases/[id] - Get a single purchase by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Error fetching purchase:', error);
    return NextResponse.json({ error: 'Failed to fetch purchase' }, { status: 500 });
  }
}

// DELETE /api/purchases/[id] - Delete a purchase (and reverse stock)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Start transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Check if purchase exists
      const purchase = await tx.purchase.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!purchase) {
        throw new Error('Purchase not found');
      }

      // Reverse stock for each item
      for (const item of purchase.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (product) {
          const currentStock = Number(product.currentStock);
          const newStock = currentStock - Number(item.quantity);

          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: String(newStock),
            },
          });

          // Create reverse stock movement
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              referenceType: 'PURCHASE_DELETE',
              referenceId: purchase.id,
              movementType: 'OUT',
              quantity: String(item.quantity),
              stockBefore: String(currentStock),
              stockAfter: String(newStock),
            },
          });
        }
      }

      // Delete purchase (cascade will delete items)
      await tx.purchase.delete({
        where: { id },
      });

      return { message: 'Purchase deleted successfully' };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting purchase:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete purchase';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

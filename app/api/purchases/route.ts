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

// GET /api/purchases - Get all purchases with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build where clause
    const whereClause = supplierId ? { supplierId } : {};
    
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Validate sortBy field
    const validSortFields = ['invoiceNumber', 'purchaseDate', 'totalAmount', 'createdAt'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const finalSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    // Get total count for pagination
    const totalItems = await prisma.purchase.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / limit);
    
    // Get paginated purchases
    const purchases = await prisma.purchase.findMany({
      where: whereClause,
      orderBy: { [finalSortBy]: finalSortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      data: purchases,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

// POST /api/purchases - Create a new purchase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { invoiceNumber, supplierId, purchaseDate, items } = body;
    
    // Generate invoice number if not provided or empty
    if (!invoiceNumber || invoiceNumber.trim() === '') {
      const timestamp = Date.now().toString();
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      invoiceNumber = `INV${timestamp}${randomSuffix}`;
    }
    // Start transaction with retry
    const result = await withRetry(async () => {
      return await prisma.$transaction(async (tx: any) => {
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
            totalAmount: String(0), // Will update after items
            items: {
              create: items.map((item: { productId: string; quantity: number; costPrice: number }) => {
                const quantity = Number(item.quantity);
                const costPrice = Number(item.costPrice);
                const subtotal = quantity * costPrice;
                totalAmount = add(totalAmount, subtotal);

                return {
                  productId: item.productId,
                  quantity: String(quantity),
                  costPrice: String(costPrice),
                  subtotal: String(subtotal),
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
            let newAverageCost = 0;
            if (newTotalStock > 0) {
              newAverageCost = (newTotalValue + currentTotalValue) / newTotalStock;
            }

            await tx.product.update({
              where: { id: item.productId },
              data: {
                currentStock: String(newStock),
                averageCost: String(newAverageCost),
              },
            });

            // Create stock movement
            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                referenceType: 'PURCHASE',
                referenceId: purchase.id,
                movementType: 'IN',
                quantity: String(item.quantity),
                stockBefore: String(currentStock),
                stockAfter: String(newStock),
              },
            });
          }
        }

        return updatedPurchase;
      });
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase:', error);
    const message = error instanceof Error ? error.message : 'Failed to create purchase';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

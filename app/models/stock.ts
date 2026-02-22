// Stock Movement Model - CRUD Operations (Audit Log Stok)
// ============================================

export type CreateStockMovementInput = {
  productId: string
  referenceType: string // PURCHASE, SALE, ADJUSTMENT
  referenceId?: string
  movementType: string // IN, OUT
  quantity: number
  stockBefore: number
  stockAfter: number
}

// CREATE - Record stock movement (IN - from purchase)
export async function createStockIn(
  productId: string,
  referenceId: string,
  quantity: number,
  currentStock: number
) {
  const { prisma } = await import('@/lib/prisma')
  
  const stockBefore = currentStock
  const stockAfter = currentStock + quantity
  
  return await prisma.stockMovement.create({
    data: {
      productId,
      referenceType: 'PURCHASE',
      referenceId,
      movementType: 'IN',
      quantity,
      stockBefore,
      stockAfter,
    },
  })
}

// CREATE - Record stock movement (OUT - from sale)
export async function createStockOut(
  productId: string,
  referenceId: string,
  quantity: number,
  currentStock: number
) {
  const { prisma } = await import('@/lib/prisma')
  
  const stockBefore = currentStock
  const stockAfter = currentStock - quantity
  
  return await prisma.stockMovement.create({
    data: {
      productId,
      referenceType: 'SALE',
      referenceId,
      movementType: 'OUT',
      quantity,
      stockBefore,
      stockAfter,
    },
  })
}

// CREATE - Record stock adjustment
export async function createStockAdjustment(
  productId: string,
  quantity: number,
  stockBefore: number,
  stockAfter: number,
  note?: string
) {
  const { prisma } = await import('@/lib/prisma')
  
  return await prisma.stockMovement.create({
    data: {
      productId,
      referenceType: 'ADJUSTMENT',
      movementType: quantity > 0 ? 'IN' : 'OUT',
      quantity: Math.abs(quantity),
      stockBefore,
      stockAfter,
    },
  })
}

// READ - Get all stock movements
export async function getAllStockMovements() {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.stockMovement.findMany({
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

// READ - Get stock movements by product
export async function getStockMovementsByProduct(productId: string) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.stockMovement.findMany({
    where: { productId },
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

// READ - Get stock movements by reference
export async function getStockMovementsByReference(
  referenceType: string,
  referenceId: string
) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.stockMovement.findMany({
    where: {
      referenceType,
      referenceId,
    },
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

// READ - Get stock movements by date range
export async function getStockMovementsByDateRange(startDate: Date, endDate: Date) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.stockMovement.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

// READ - Get stock movements by type (IN or OUT)
export async function getStockMovementsByType(movementType: string) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.stockMovement.findMany({
    where: { movementType },
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

// READ - Get current stock of a product
export async function getCurrentStock(productId: string) {
  const { prisma } = await import('@/lib/prisma')
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { currentStock: true },
  })
  return product?.currentStock ?? 0
}

// READ - Get stock history summary
export async function getStockSummary(productId: string) {
  const { prisma } = await import('@/lib/prisma')
  
  const movements = await prisma.stockMovement.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
  })
  
  const summary = movements.reduce(
    (acc, movement) => {
      if (movement.movementType === 'IN') {
        acc.totalIn += Number(movement.quantity)
      } else {
        acc.totalOut += Number(movement.quantity)
      }
      return acc
    },
    { totalIn: 0, totalOut: 0 }
  )
  
  return summary
}

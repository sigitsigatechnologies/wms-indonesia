// Purchase Model - CRUD Operations (Header Barang Masuk)
// ============================================

export type CreatePurchaseInput = {
  invoiceNumber: string
  supplierId: string
  purchaseDate: Date
  totalAmount: number
}

export type UpdatePurchaseInput = {
  invoiceNumber?: string
  supplierId?: string
  purchaseDate?: Date
  totalAmount?: number
}

export type CreatePurchaseItemInput = {
  purchaseId: string
  productId: string
  quantity: number
  costPrice: number
  subtotal: number
}

// CREATE - Create new purchase with items
export async function createPurchase(data: CreatePurchaseInput, items: CreatePurchaseItemInput[]) {
  const { prisma } = await import('@/lib/prisma')
  
  // Calculate total from items
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)
  
  return await prisma.purchase.create({
    data: {
      invoiceNumber: data.invoiceNumber,
      supplierId: data.supplierId,
      purchaseDate: data.purchaseDate,
      totalAmount,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          costPrice: item.costPrice,
          subtotal: item.subtotal,
        })),
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
  })
}

// READ - Get all purchases
export async function getAllPurchases() {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.purchase.findMany({
    include: {
      supplier: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { purchaseDate: 'desc' },
  })
}

// READ - Get purchase by ID
export async function getPurchaseById(id: string) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.purchase.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  })
}

// READ - Get purchase by invoice number
export async function getPurchaseByInvoice(invoiceNumber: string) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.purchase.findUnique({
    where: { invoiceNumber },
    include: {
      supplier: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  })
}

// UPDATE - Update purchase
export async function updatePurchase(id: string, data: UpdatePurchaseInput) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.purchase.update({
    where: { id },
    data,
    include: {
      supplier: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  })
}

// DELETE - Delete purchase
export async function deletePurchase(id: string) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.purchase.delete({
    where: { id },
  })
}

// READ - Get purchases by supplier
export async function getPurchasesBySupplier(supplierId: string) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.purchase.findMany({
    where: { supplierId },
    include: {
      supplier: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { purchaseDate: 'desc' },
  })
}

// READ - Get purchases by date range
export async function getPurchasesByDateRange(startDate: Date, endDate: Date) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.purchase.findMany({
    where: {
      purchaseDate: {
        gte: startDate,
        lte: endDate,
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
    orderBy: { purchaseDate: 'desc' },
  })
}

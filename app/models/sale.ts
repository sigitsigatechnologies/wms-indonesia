// Sale Model - CRUD Operations (Header Penjualan)
// ============================================

export type CreateSaleInput = {
  invoiceNumber: string
  totalAmount: number
  totalProfit: number
  paymentMethod: string // CASH, QRIS, TRANSFER
}

export type UpdateSaleInput = {
  invoiceNumber?: string
  totalAmount?: number
  totalProfit?: number
  paymentMethod?: string
}

export type CreateSaleItemInput = {
  saleId: string
  productId: string
  quantity: number
  sellingPrice: number
  costPriceSnapshot: number
  profit: number
  subtotal: number
}

// CREATE - Create new sale with items
export async function createSale(data: CreateSaleInput, items: CreateSaleItemInput[]) {
  const { prisma } = await import('@/lib/prisma')
  
  // Calculate totals from items
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)
  const totalProfit = items.reduce((sum, item) => sum + item.profit, 0)
  
  return await prisma.sale.create({
    data: {
      invoiceNumber: data.invoiceNumber,
      totalAmount,
      totalProfit,
      paymentMethod: data.paymentMethod,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          sellingPrice: item.sellingPrice,
          costPriceSnapshot: item.costPriceSnapshot,
          profit: item.profit,
          subtotal: item.subtotal,
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
  })
}

// READ - Get all sales
export async function getAllSales() {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.sale.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// READ - Get sale by ID
export async function getSaleById(id: string) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.sale.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })
}

// READ - Get sale by invoice number
export async function getSaleByInvoice(invoiceNumber: string) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.sale.findUnique({
    where: { invoiceNumber },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })
}

// UPDATE - Update sale
export async function updateSale(id: string, data: UpdateSaleInput) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.sale.update({
    where: { id },
    data,
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })
}

// DELETE - Delete sale
export async function deleteSale(id: string) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.sale.delete({
    where: { id },
  })
}

// READ - Get sales by payment method
export async function getSalesByPaymentMethod(paymentMethod: string) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.sale.findMany({
    where: { paymentMethod },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// READ - Get sales by date range
export async function getSalesByDateRange(startDate: Date, endDate: Date) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.sale.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// READ - Get today's sales
export async function getTodaySales() {
  const { prisma } = await import('@/lib/prisma')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return await prisma.sale.findMany({
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// READ - Get sales summary (total amount and profit)
export async function getSalesSummary(startDate?: Date, endDate?: Date) {
  const { prisma } = await import('@/lib/prisma')
  
  const where: any = {}
  if (startDate && endDate) {
    where.createdAt = {
      gte: startDate,
      lte: endDate,
    }
  }
  
  const sales = await prisma.sale.findMany({
    where,
    select: {
      totalAmount: true,
      totalProfit: true,
    },
  })
  
  const summary = sales.reduce(
    (acc, sale) => ({
      totalRevenue: acc.totalRevenue + Number(sale.totalAmount),
      totalProfit: acc.totalProfit + Number(sale.totalProfit),
      transactionCount: acc.transactionCount + 1,
    }),
    { totalRevenue: 0, totalProfit: 0, transactionCount: 0 }
  )
  
  return summary
}

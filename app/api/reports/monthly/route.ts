import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || new Date().getMonth().toString())
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)

    // Parallelize all data fetching
    const [purchaseAggr, saleAggr, movements, topProducts] = await Promise.all([
      // 1. Aggregate Purchases
      prisma.purchase.aggregate({
        where: {
          purchaseDate: { gte: startDate, lte: endDate },
        },
        _sum: { totalAmount: true },
        _count: { id: true }
      }),

      // 2. Aggregate Sales
      prisma.sale.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { totalAmount: true, totalProfit: true },
        _count: { id: true }
      }),

      // 3. Aggregate Stock Movements
      prisma.stockMovement.groupBy({
        by: ['movementType'],
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { quantity: true }
      }),

      // 4. Aggregate Top Products (Limited to 5)
      prisma.saleItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
          subtotal: true,
        },
        where: {
          sale: {
            createdAt: { gte: startDate, lte: endDate },
          }
        },
        orderBy: {
          _sum: { quantity: 'desc' }
        },
        take: 5
      })
    ])

    const totalPurchasesAmount = Number(purchaseAggr._sum.totalAmount || 0)
    const purchaseCount = purchaseAggr._count.id

    const totalSalesAmount = Number(saleAggr._sum.totalAmount || 0)
    const totalProfit = Number(saleAggr._sum.totalProfit || 0)
    const saleCount = saleAggr._count.id

    const totalStockIn = Number(movements.find(m => m.movementType === 'IN')?._sum.quantity || 0)
    const totalStockOut = Number(movements.find(m => m.movementType === 'OUT')?._sum.quantity || 0)

    // Fetch product names for top products in one go
    const topProductsDetailed = await Promise.all(topProducts.map(async (tp) => {
      const product = await prisma.product.findUnique({
        where: { id: tp.productId },
        select: { name: true, barcode: true }
      })
      return {
        ...product,
        totalQuantity: Number(tp._sum.quantity),
        totalRevenue: Number(tp._sum.subtotal)
      }
    }))

    return NextResponse.json({
      month,
      year,
      summary: {
        totalPurchasesAmount,
        purchaseCount,
        totalSalesAmount,
        totalProfit,
        saleCount,
        totalStockIn,
        totalStockOut,
        netProfit: totalProfit
      },
      topProducts: topProductsDetailed
    })
  } catch (error) {
    console.error('Error generating monthly report:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

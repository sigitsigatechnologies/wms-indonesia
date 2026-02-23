import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/dashboard - Get dashboard summary data
export async function GET() {
  try {
    // Use Promise.all to fetch counts in parallel - much faster!
    const [products, suppliers, purchases, sales] = await Promise.all([
      prisma.product.count(),
      prisma.supplier.count(),
      prisma.purchase.count(),
      prisma.sale.count(),
    ]);

    // Get aggregate revenue and profit from sales
    const salesAgg = await prisma.sale.aggregate({
      _sum: {
        totalAmount: true,
        totalProfit: true,
      },
    });

    // Get count of low stock products (where currentStock <= minStock and currentStock > 0)
    const lowStockCount = await prisma.product.count({
      where: {
        currentStock: {
          gt: 0,
        },
        minStock: {
          not: 0,
        },
      },
    });

    return NextResponse.json({
      totalProducts: products,
      totalSuppliers: suppliers,
      totalPurchases: purchases,
      totalSales: sales,
      totalRevenue: salesAgg._sum.totalAmount || 0,
      totalProfit: salesAgg._sum.totalProfit || 0,
      lowStockCount: lowStockCount,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

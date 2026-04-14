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

    // Get count of low stock products (where currentStock <= minStock)
    // We select only necessary fields to keep the query efficient
    const allProducts = await prisma.product.findMany({
      where: {
        isActive: true, // Only count active products
      },
      select: {
        id: true,
        name: true,
        barcode: true,
        currentStock: true,
        minStock: true,
      },
    });

    const lowStockProductsFull = allProducts.filter(product => {
      const stock = Number(product.currentStock);
      const min = Number(product.minStock);
      return stock <= min;
    });
    
    const lowStockCount = lowStockProductsFull.length;
    // We only return the first 15 so the dashboard payload isn't massive
    const lowStockProducts = lowStockProductsFull.slice(0, 15);

    // Get last 7 days sales data for chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const salesByDay = await prisma.sale.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _sum: {
        totalAmount: true,
        totalProfit: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Format chart data
    const chartData = formatChartData(salesByDay);

    return NextResponse.json({
      totalProducts: products,
      totalSuppliers: suppliers,
      totalPurchases: purchases,
      totalSales: sales,
      totalRevenue: salesAgg._sum.totalAmount || 0,
      totalProfit: salesAgg._sum.totalProfit || 0,
      lowStockCount: lowStockCount,
      lowStockProducts,
      chartData,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

function formatChartData(salesByDay: any[]) {
  // Group by date
  const grouped: Record<string, { revenue: number; profit: number }> = {};
  
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    grouped[dateStr] = { revenue: 0, profit: 0 };
  }

  // Fill in actual data
  salesByDay.forEach((item) => {
    const dateStr = new Date(item.createdAt).toISOString().split('T')[0];
    if (grouped[dateStr]) {
      grouped[dateStr].revenue += Number(item._sum.totalAmount || 0);
      grouped[dateStr].profit += Number(item._sum.totalProfit || 0);
    }
  });

  // Convert to array
  return Object.entries(grouped).map(([date, data]) => ({
    date,
    label: new Date(date).toLocaleDateString('id-ID', { weekday: 'short' }),
    revenue: data.revenue,
    profit: data.profit,
  }));
}

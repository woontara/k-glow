import { NextResponse } from 'next/server';
import { createWildberriesClient } from '@/lib/wildberries/client';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wildberries/dashboard
 * Wildberries 대시보드 요약 데이터
 */
export async function GET() {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '권한이 없습니다' },
        { status: 403 }
      );
    }

    // API 토큰 확인
    const token = process.env.WILDBERRIES_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: 'Wildberries API 토큰이 설정되지 않았습니다' },
        { status: 500 }
      );
    }

    const client = createWildberriesClient(token);

    // 날짜 계산
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // 병렬로 데이터 조회
    const [productsResult, sales30d, sales7d, orders30d, stocks] = await Promise.all([
      client.getProducts({ limit: 100 }).catch(() => ({ cards: [], cursor: { total: 0 } })),
      client.getSales(formatDate(thirtyDaysAgo)).catch(() => []),
      client.getSales(formatDate(sevenDaysAgo)).catch(() => []),
      client.getOrders(formatDate(thirtyDaysAgo)).catch(() => []),
      client.getStocks(formatDate(today)).catch(() => []),
    ]);

    // 30일 판매 통계
    const revenue30d = sales30d.reduce((sum, sale) => sum + sale.finishedPrice, 0);
    const forPay30d = sales30d.reduce((sum, sale) => sum + sale.forPay, 0);

    // 7일 판매 통계
    const revenue7d = sales7d.reduce((sum, sale) => sum + sale.finishedPrice, 0);

    // 일별 판매 추이 (최근 7일)
    const dailySales: Record<string, { date: string; sales: number; revenue: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      dailySales[dateStr] = { date: dateStr, sales: 0, revenue: 0 };
    }

    sales7d.forEach(sale => {
      const dateStr = sale.date.split('T')[0];
      if (dailySales[dateStr]) {
        dailySales[dateStr].sales++;
        dailySales[dateStr].revenue += sale.finishedPrice;
      }
    });

    // 재고 현황
    const totalStock = stocks.reduce((sum, stock) => sum + stock.quantity, 0);
    const lowStockItems = stocks.filter(stock => stock.quantity < 10 && stock.quantity > 0);
    const outOfStockItems = stocks.filter(stock => stock.quantity === 0);

    // 베스트셀러 (판매량 기준)
    const productSales: Record<number, { nmId: number; subject: string; brand: string; count: number; revenue: number }> = {};
    sales30d.forEach(sale => {
      if (!productSales[sale.nmId]) {
        productSales[sale.nmId] = {
          nmId: sale.nmId,
          subject: sale.subject,
          brand: sale.brand,
          count: 0,
          revenue: 0,
        };
      }
      productSales[sale.nmId].count++;
      productSales[sale.nmId].revenue += sale.finishedPrice;
    });

    const bestSellers = Object.values(productSales)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 주문 현황
    const pendingOrders = orders30d.filter(order => !order.isCancel).length;
    const cancelledOrders = orders30d.filter(order => order.isCancel).length;

    return NextResponse.json({
      overview: {
        totalProducts: productsResult.cursor?.total || productsResult.cards.length,
        totalStock,
        revenue30d,
        revenue7d,
        forPay30d,
        sales30d: sales30d.length,
        sales7d: sales7d.length,
        orders30d: orders30d.length,
        pendingOrders,
        cancelledOrders,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
      },
      charts: {
        dailySales: Object.values(dailySales),
      },
      bestSellers,
      lowStockItems: lowStockItems.slice(0, 10).map(item => ({
        nmId: item.nmId,
        subject: item.subject,
        brand: item.brand,
        quantity: item.quantity,
        warehouseName: item.warehouseName,
      })),
      recentProducts: productsResult.cards.slice(0, 5).map(p => ({
        nmID: p.nmID,
        title: p.title,
        brand: p.brand,
        vendorCode: p.vendorCode,
        photo: p.photos?.[0]?.c246x328,
      })),
    });
  } catch (error) {
    console.error('Wildberries 대시보드 조회 실패:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '대시보드 데이터 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

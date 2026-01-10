import { NextResponse } from 'next/server';
import { createWildberriesClient } from '@/lib/wildberries/client';
import { canAccessBrandDashboard } from '@/lib/get-user-brand';
import {
  filterWildberriesProducts,
  filterWildberriesSales,
  filterWildberriesOrders,
  filterWildberriesStocks,
} from '@/lib/brand-filter';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wildberries/dashboard
 * Wildberries 대시보드 요약 데이터
 * - 관리자: 전체 데이터
 * - 브랜드 사용자: SKU 접두사로 필터링된 데이터
 */
export async function GET() {
  try {
    // 브랜드 권한 확인
    const { authorized, userBrand, error } = await canAccessBrandDashboard();
    if (!authorized || !userBrand) {
      return NextResponse.json({ error: error || '권한이 없습니다' }, { status: 403 });
    }

    const skuPrefix = userBrand.skuPrefix; // null이면 전체 데이터

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
    const [productsResult, rawSales30d, rawSales7d, rawOrders30d, rawStocks] = await Promise.all([
      client.getProducts({ limit: 100 }).catch(() => ({ cards: [], cursor: { total: 0 } })),
      client.getSales(formatDate(thirtyDaysAgo)).catch(() => []),
      client.getSales(formatDate(sevenDaysAgo)).catch(() => []),
      client.getOrders(formatDate(thirtyDaysAgo)).catch(() => []),
      client.getStocks(formatDate(today)).catch(() => []),
    ]);

    // 브랜드 필터링 적용
    const products = filterWildberriesProducts(productsResult.cards || [], skuPrefix);
    const sales30d = filterWildberriesSales(rawSales30d, skuPrefix);
    const sales7d = filterWildberriesSales(rawSales7d, skuPrefix);
    const orders30d = filterWildberriesOrders(rawOrders30d, skuPrefix);
    const stocks = filterWildberriesStocks(rawStocks, skuPrefix);

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
    const productSales: Record<number, { nmId: number; subject: string; brand: string; supplierArticle: string; count: number; revenue: number }> = {};
    sales30d.forEach(sale => {
      if (!productSales[sale.nmId]) {
        productSales[sale.nmId] = {
          nmId: sale.nmId,
          subject: sale.subject,
          brand: sale.brand,
          supplierArticle: sale.supplierArticle,
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
      // 브랜드 정보 (UI에서 표시용)
      brandInfo: skuPrefix ? {
        name: userBrand.brandName,
        skuPrefix,
        isFiltered: true,
      } : null,
      overview: {
        totalProducts: products.length,
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
        supplierArticle: item.supplierArticle,
        quantity: item.quantity,
        warehouseName: item.warehouseName,
      })),
      recentProducts: products.slice(0, 5).map(p => ({
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

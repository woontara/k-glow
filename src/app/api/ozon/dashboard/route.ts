import { NextResponse } from 'next/server';
import { createOzonClient } from '@/lib/ozon/client';
import { canAccessBrandDashboard } from '@/lib/get-user-brand';
import { filterOzonProducts, filterOzonPostings, filterOzonStocks } from '@/lib/brand-filter';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ozon/dashboard
 * OZON 대시보드 요약 데이터
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

    // API 키 확인
    const clientId = process.env.OZON_CLIENT_ID;
    const apiKey = process.env.OZON_API_KEY;

    if (!clientId || !apiKey) {
      return NextResponse.json(
        { error: 'OZON API 키가 설정되지 않았습니다' },
        { status: 500 }
      );
    }

    const client = createOzonClient(clientId, apiKey);

    // 날짜 계산
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // 병렬로 데이터 조회
    const [productsResult, rawPostings30d, rawPostings7d, rawStocks, transactions] = await Promise.all([
      client.getProducts({ limit: 100 }).catch(() => ({ result: { items: [], total: 0, last_id: '' } })),
      client.getPostings({
        since: thirtyDaysAgo.toISOString(),
        to: today.toISOString(),
        limit: 100,
      }).catch(() => ({ result: { postings: [], has_next: false } })),
      client.getPostings({
        since: sevenDaysAgo.toISOString(),
        to: today.toISOString(),
        limit: 100,
      }).catch(() => ({ result: { postings: [], has_next: false } })),
      client.getStocks({ limit: 100 }).catch(() => ({ result: { rows: [] } })),
      client.getTransactions({
        from: formatDate(thirtyDaysAgo),
        to: formatDate(today),
        pageSize: 100,
      }).catch(() => ({ result: { operations: [], page_count: 0, row_count: 0 } })),
    ]);

    // 브랜드 필터링 적용
    const products = filterOzonProducts(productsResult.result?.items || [], skuPrefix);
    const allPostings30d = filterOzonPostings(rawPostings30d.result?.postings || [], skuPrefix);
    const allPostings7d = filterOzonPostings(rawPostings7d.result?.postings || [], skuPrefix);
    const stockItems = filterOzonStocks(rawStocks.result?.rows || [], skuPrefix);
    const allTransactions = transactions.result?.operations || [];

    // 매출 계산 (거래 내역에서)
    const revenue30d = allTransactions
      .filter(t => t.accruals_for_sale > 0)
      .reduce((sum, t) => sum + t.accruals_for_sale, 0);

    // 7일 매출 (주문에서 계산)
    const revenue7d = allPostings7d.reduce((sum, posting) => {
      const postingRevenue = posting.products.reduce((pSum, product) => {
        return pSum + (parseFloat(product.price) * product.quantity);
      }, 0);
      return sum + postingRevenue;
    }, 0);

    // 주문 상태별 집계
    const ordersByStatus = allPostings30d.reduce((acc, posting) => {
      acc[posting.status] = (acc[posting.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 일별 주문 추이 (최근 7일)
    const dailyOrders: Record<string, { date: string; orders: number; revenue: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      dailyOrders[dateStr] = { date: dateStr, orders: 0, revenue: 0 };
    }

    allPostings7d.forEach(posting => {
      const dateStr = posting.in_process_at.split('T')[0];
      if (dailyOrders[dateStr]) {
        dailyOrders[dateStr].orders++;
        const postingRevenue = posting.products.reduce((sum, product) => {
          return sum + (parseFloat(product.price) * product.quantity);
        }, 0);
        dailyOrders[dateStr].revenue += postingRevenue;
      }
    });

    // 베스트셀러 (판매량 기준)
    const productSales: Record<number, {
      sku: number;
      name: string;
      offerId: string;
      count: number;
      revenue: number;
    }> = {};

    allPostings30d.forEach(posting => {
      posting.products.forEach(product => {
        if (!productSales[product.sku]) {
          productSales[product.sku] = {
            sku: product.sku,
            name: product.name,
            offerId: product.offer_id,
            count: 0,
            revenue: 0,
          };
        }
        productSales[product.sku].count += product.quantity;
        productSales[product.sku].revenue += parseFloat(product.price) * product.quantity;
      });
    });

    const bestSellers = Object.values(productSales)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 재고 현황
    const totalStock = stockItems.reduce((sum, item) => sum + item.free_to_sell_amount, 0);
    const lowStockItems = stockItems.filter(item => item.free_to_sell_amount < 10 && item.free_to_sell_amount > 0);
    const outOfStockItems = stockItems.filter(item => item.free_to_sell_amount === 0);

    // 최근 주문
    const recentOrders = allPostings7d.slice(0, 10).map(posting => ({
      postingNumber: posting.posting_number,
      orderId: posting.order_id,
      status: posting.status,
      inProcessAt: posting.in_process_at,
      products: posting.products.map(p => ({
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        offerId: p.offer_id,
      })),
      totalAmount: posting.products.reduce((sum, p) => sum + (parseFloat(p.price) * p.quantity), 0),
    }));

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
        orders30d: allPostings30d.length,
        orders7d: allPostings7d.length,
        ordersByStatus,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
      },
      charts: {
        dailyOrders: Object.values(dailyOrders),
      },
      bestSellers,
      lowStockItems: lowStockItems.slice(0, 10).map(item => ({
        sku: item.sku,
        name: item.item_name,
        itemCode: item.item_code,
        quantity: item.free_to_sell_amount,
        warehouseName: item.warehouse_name,
      })),
      recentOrders,
      recentProducts: products.slice(0, 5).map(p => ({
        productId: p.product_id,
        offerId: p.offer_id,
        name: p.name || p.offer_id,
        archived: p.archived,
      })),
    });
  } catch (error) {
    console.error('OZON 대시보드 조회 실패:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '대시보드 데이터 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

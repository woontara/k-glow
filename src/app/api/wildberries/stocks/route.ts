import { NextRequest, NextResponse } from 'next/server';
import { createWildberriesClient } from '@/lib/wildberries/client';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wildberries/stocks
 * Wildberries 재고 현황 조회
 */
export async function GET(request: NextRequest) {
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

    // 쿼리 파라미터 (기본값: 오늘)
    const searchParams = request.nextUrl.searchParams;
    const dateFrom = searchParams.get('dateFrom') || new Date().toISOString().split('T')[0];

    const stocks = await client.getStocks(dateFrom);

    // 재고 통계 계산
    const stats = {
      totalItems: stocks.length,
      totalQuantity: stocks.reduce((sum, stock) => sum + stock.quantity, 0),
      totalValue: stocks.reduce((sum, stock) => sum + (stock.Price * stock.quantity), 0),
      lowStock: stocks.filter(stock => stock.quantity < 10 && stock.quantity > 0).length,
      outOfStock: stocks.filter(stock => stock.quantity === 0).length,
      byWarehouse: {} as Record<string, { items: number; quantity: number }>,
      byBrand: {} as Record<string, { items: number; quantity: number }>,
    };

    // 창고별, 브랜드별 집계
    stocks.forEach(stock => {
      if (!stats.byWarehouse[stock.warehouseName]) {
        stats.byWarehouse[stock.warehouseName] = { items: 0, quantity: 0 };
      }
      stats.byWarehouse[stock.warehouseName].items++;
      stats.byWarehouse[stock.warehouseName].quantity += stock.quantity;

      if (!stats.byBrand[stock.brand]) {
        stats.byBrand[stock.brand] = { items: 0, quantity: 0 };
      }
      stats.byBrand[stock.brand].items++;
      stats.byBrand[stock.brand].quantity += stock.quantity;
    });

    return NextResponse.json({
      stocks,
      stats,
    });
  } catch (error) {
    console.error('Wildberries 재고 조회 실패:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '재고 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

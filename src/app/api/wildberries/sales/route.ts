import { NextRequest, NextResponse } from 'next/server';
import { createWildberriesClient } from '@/lib/wildberries/client';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wildberries/sales
 * Wildberries 판매 데이터 조회
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

    // 쿼리 파라미터
    const searchParams = request.nextUrl.searchParams;
    const dateFrom = searchParams.get('dateFrom');
    const flag = searchParams.get('flag');

    if (!dateFrom) {
      return NextResponse.json(
        { error: 'dateFrom 파라미터가 필요합니다 (형식: YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const sales = await client.getSales(
      dateFrom,
      flag ? (parseInt(flag) as 0 | 1) : undefined
    );

    // 판매 통계 계산
    const stats = {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.finishedPrice, 0),
      totalForPay: sales.reduce((sum, sale) => sum + sale.forPay, 0),
      returns: sales.filter(sale => sale.IsStorno === 1).length,
      byBrand: {} as Record<string, { count: number; revenue: number }>,
      byCategory: {} as Record<string, { count: number; revenue: number }>,
    };

    // 브랜드별, 카테고리별 집계
    sales.forEach(sale => {
      if (!stats.byBrand[sale.brand]) {
        stats.byBrand[sale.brand] = { count: 0, revenue: 0 };
      }
      stats.byBrand[sale.brand].count++;
      stats.byBrand[sale.brand].revenue += sale.finishedPrice;

      if (!stats.byCategory[sale.category]) {
        stats.byCategory[sale.category] = { count: 0, revenue: 0 };
      }
      stats.byCategory[sale.category].count++;
      stats.byCategory[sale.category].revenue += sale.finishedPrice;
    });

    return NextResponse.json({
      sales,
      stats,
    });
  } catch (error) {
    console.error('Wildberries 판매 데이터 조회 실패:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '판매 데이터 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

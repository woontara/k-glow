import { NextRequest, NextResponse } from 'next/server';
import { createWildberriesClient } from '@/lib/wildberries/client';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wildberries/orders
 * Wildberries 주문 데이터 조회
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

    const orders = await client.getOrders(
      dateFrom,
      flag ? (parseInt(flag) as 0 | 1) : undefined
    );

    // 주문 통계 계산
    const stats = {
      totalOrders: orders.length,
      totalValue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
      cancelled: orders.filter(order => order.isCancel).length,
      byWarehouse: {} as Record<string, number>,
      byRegion: {} as Record<string, number>,
    };

    // 창고별, 지역별 집계
    orders.forEach(order => {
      if (!stats.byWarehouse[order.warehouseName]) {
        stats.byWarehouse[order.warehouseName] = 0;
      }
      stats.byWarehouse[order.warehouseName]++;

      if (order.oblast) {
        if (!stats.byRegion[order.oblast]) {
          stats.byRegion[order.oblast] = 0;
        }
        stats.byRegion[order.oblast]++;
      }
    });

    return NextResponse.json({
      orders,
      stats,
    });
  } catch (error) {
    console.error('Wildberries 주문 데이터 조회 실패:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '주문 데이터 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

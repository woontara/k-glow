import { NextRequest, NextResponse } from 'next/server';
import { createCoupangClient } from '@/lib/coupang/client';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/coupang/orders
 * 쿠팡 주문 목록 조회
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

    // API 키 확인
    const accessKey = process.env.COUPANG_ACCESS_KEY;
    const secretKey = process.env.COUPANG_SECRET_KEY;
    const vendorId = process.env.COUPANG_VENDOR_ID;

    if (!accessKey || !secretKey || !vendorId) {
      return NextResponse.json(
        { error: '쿠팡 API 키가 설정되지 않았습니다' },
        { status: 500 }
      );
    }

    const client = createCoupangClient(accessKey, secretKey, vendorId);

    // 쿼리 파라미터
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const nextToken = searchParams.get('nextToken') || undefined;
    const maxPerPage = parseInt(searchParams.get('maxPerPage') || '50');

    // 날짜 범위 (기본: 최근 30일)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const formatDateTime = (date: Date) => {
      return date.toISOString().slice(0, 16).replace('T', ' ');
    };

    const createdAtFrom = searchParams.get('createdAtFrom') || formatDateTime(thirtyDaysAgo);
    const createdAtTo = searchParams.get('createdAtTo') || formatDateTime(today);

    const result = await client.getOrders({
      createdAtFrom,
      createdAtTo,
      status,
      nextToken,
      maxPerPage,
    });

    // 통계 계산
    const orders = result.data || [];
    const stats = {
      total: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalPaymentPrice, 0),
      byStatus: orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      ...result,
      stats,
    });
  } catch (error) {
    console.error('쿠팡 주문 조회 실패:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '주문 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

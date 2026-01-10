import { NextRequest, NextResponse } from 'next/server';
import { createOzonClient } from '@/lib/ozon/client';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ozon/orders
 * OZON 주문 목록 조회 (FBS)
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
    const clientId = process.env.OZON_CLIENT_ID;
    const apiKey = process.env.OZON_API_KEY;

    if (!clientId || !apiKey) {
      return NextResponse.json(
        { error: 'OZON API 키가 설정되지 않았습니다' },
        { status: 500 }
      );
    }

    const client = createOzonClient(clientId, apiKey);

    // 쿼리 파라미터
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || undefined;

    // 날짜 범위 (기본: 최근 30일)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const since = searchParams.get('since') || thirtyDaysAgo.toISOString();
    const to = searchParams.get('to') || today.toISOString();

    const result = await client.getPostings({
      since,
      to,
      status,
      limit,
      offset,
    });

    // 통계 계산
    const postings = result.result?.postings || [];
    const stats = {
      total: postings.length,
      byStatus: postings.reduce((acc, posting) => {
        acc[posting.status] = (acc[posting.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      ...result,
      stats,
    });
  } catch (error) {
    console.error('OZON 주문 조회 실패:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '주문 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

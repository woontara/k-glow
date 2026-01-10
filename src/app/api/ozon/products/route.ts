import { NextRequest, NextResponse } from 'next/server';
import { createOzonClient } from '@/lib/ozon/client';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ozon/products
 * OZON 상품 목록 조회
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
    const lastId = searchParams.get('lastId') || '';
    const visibility = searchParams.get('visibility') || 'ALL';

    const result = await client.getProducts({
      limit,
      lastId,
      visibility: visibility as 'ALL' | 'VISIBLE' | 'INVISIBLE',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('OZON 상품 조회 실패:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '상품 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

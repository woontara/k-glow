import { NextRequest, NextResponse } from 'next/server';
import { createWildberriesClient } from '@/lib/wildberries/client';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wildberries/products
 * Wildberries 상품 목록 조회
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
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || undefined;

    const result = await client.getProducts({
      limit,
      textSearch: search,
    });

    return NextResponse.json({
      products: result.cards,
      cursor: result.cursor,
    });
  } catch (error) {
    console.error('Wildberries 상품 조회 실패:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '상품 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

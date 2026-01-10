import { NextRequest, NextResponse } from 'next/server';
import { createCoupangClient } from '@/lib/coupang/client';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/coupang/products
 * 쿠팡 상품 목록 조회
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
    const nextToken = searchParams.get('nextToken') || undefined;
    const maxPerPage = parseInt(searchParams.get('maxPerPage') || '50');
    const status = searchParams.get('status') || undefined;

    const result = await client.getProducts({
      nextToken,
      maxPerPage,
      status,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('쿠팡 상품 조회 실패:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '상품 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

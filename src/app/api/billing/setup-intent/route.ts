import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/billing/setup-intent
 * 빌링키 발급을 위한 PortOne 설정 정보 반환
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // PortOne 설정 정보 반환 (클라이언트에서 SDK 초기화에 사용)
    return NextResponse.json({
      storeId: process.env.PORTONE_STORE_ID,
      channelKey: process.env.PORTONE_CHANNEL_KEY,
    });
  } catch (error) {
    console.error('설정 조회 실패:', error);
    return NextResponse.json(
      { error: '설정 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/billing/setup-intent
 * 클라이언트에서 발급받은 빌링키 저장
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { billingKey } = await request.json();

    if (!billingKey) {
      return NextResponse.json({ error: '빌링키가 필요합니다' }, { status: 400 });
    }

    // 사용자 정보 업데이트 (빌링키 저장)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { billingKey },
    });

    return NextResponse.json({
      success: true,
      message: '결제 수단이 등록되었습니다',
    });
  } catch (error) {
    console.error('빌링키 저장 실패:', error);
    return NextResponse.json(
      { error: '결제 수단 등록에 실패했습니다' },
      { status: 500 }
    );
  }
}

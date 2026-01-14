import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/billing/balance
 * 현재 사용자의 크레딧 잔액 조회
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        creditBalance: true,
        autoRecharge: true,
        rechargeThreshold: true,
        rechargeAmount: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    return NextResponse.json({
      creditBalance: user.creditBalance,
      autoRecharge: user.autoRecharge,
      rechargeThreshold: user.rechargeThreshold,
      rechargeAmount: user.rechargeAmount,
    });
  } catch (error) {
    console.error('잔액 조회 실패:', error);
    return NextResponse.json(
      { error: '잔액 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

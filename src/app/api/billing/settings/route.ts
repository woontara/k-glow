import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/billing/settings
 * 자동 충전 설정 및 잔액 조회
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
        billingKey: true,
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
      hasPaymentMethod: !!user.billingKey,
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
 * PUT /api/billing/settings
 * 자동 충전 설정 변경
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { autoRecharge, rechargeThreshold, rechargeAmount } = body;

    // 유효성 검사
    if (rechargeThreshold !== undefined && (rechargeThreshold < 0 || rechargeThreshold > 100)) {
      return NextResponse.json(
        { error: '임계값은 0~100 사이여야 합니다' },
        { status: 400 }
      );
    }

    if (rechargeAmount !== undefined && (rechargeAmount < 5 || rechargeAmount > 500)) {
      return NextResponse.json(
        { error: '충전 금액은 $5~$500 사이여야 합니다' },
        { status: 400 }
      );
    }

    // 자동 충전 활성화 시 결제 수단 확인
    if (autoRecharge) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { billingKey: true },
      });

      if (!user?.billingKey) {
        return NextResponse.json(
          { error: '자동 충전을 활성화하려면 먼저 결제 수단을 등록하세요' },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (autoRecharge !== undefined) updateData.autoRecharge = autoRecharge;
    if (rechargeThreshold !== undefined) updateData.rechargeThreshold = rechargeThreshold;
    if (rechargeAmount !== undefined) updateData.rechargeAmount = rechargeAmount;

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        autoRecharge: true,
        rechargeThreshold: true,
        rechargeAmount: true,
      },
    });

    return NextResponse.json({
      success: true,
      ...updated,
    });
  } catch (error) {
    console.error('설정 변경 실패:', error);
    return NextResponse.json(
      { error: '설정 변경에 실패했습니다' },
      { status: 500 }
    );
  }
}

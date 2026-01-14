import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getBillingKeyInfo, deleteBillingKey } from '@/lib/portone';

export const dynamic = 'force-dynamic';

/**
 * GET /api/billing/payment-methods
 * 등록된 결제 수단(빌링키) 정보 조회
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { billingKey: true },
    });

    if (!user?.billingKey) {
      return NextResponse.json({ paymentMethod: null });
    }

    // PortOne에서 빌링키 정보 조회
    const billingInfo = await getBillingKeyInfo(user.billingKey);

    if (!billingInfo) {
      return NextResponse.json({ paymentMethod: null });
    }

    // 카드 정보 추출
    const cardInfo = billingInfo.methods?.find(
      (method: { type: string }) => method.type === 'BillingKeyPaymentMethodCard'
    );

    const paymentMethod = {
      billingKey: user.billingKey,
      card: cardInfo
        ? {
            brand: cardInfo.card?.name || '카드',
            last4: cardInfo.card?.number?.slice(-4) || '****',
          }
        : null,
    };

    return NextResponse.json({ paymentMethod });
  } catch (error) {
    console.error('결제 수단 조회 실패:', error);
    return NextResponse.json(
      { error: '결제 수단 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/billing/payment-methods
 * 결제 수단(빌링키) 삭제
 */
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { billingKey: true, autoRecharge: true },
    });

    if (!user?.billingKey) {
      return NextResponse.json({ error: '등록된 결제 수단이 없습니다' }, { status: 400 });
    }

    // 자동 충전이 활성화되어 있으면 삭제 불가
    if (user.autoRecharge) {
      return NextResponse.json(
        { error: '자동 충전을 먼저 비활성화해주세요' },
        { status: 400 }
      );
    }

    // PortOne에서 빌링키 삭제
    await deleteBillingKey(user.billingKey);

    // DB에서 빌링키 제거
    await prisma.user.update({
      where: { id: session.user.id },
      data: { billingKey: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('결제 수단 삭제 실패:', error);
    return NextResponse.json(
      { error: '결제 수단 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}

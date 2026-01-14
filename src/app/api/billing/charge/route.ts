import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { payWithBillingKey, generatePaymentId, usdToKrw } from '@/lib/portone';

export const dynamic = 'force-dynamic';

/**
 * POST /api/billing/charge
 * 크레딧 충전 (수동 또는 자동)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, isAutoCharge = false } = body;

    // 금액 유효성 검사 (USD)
    if (!amount || amount < 5 || amount > 500) {
      return NextResponse.json(
        { error: '충전 금액은 $5~$500 사이여야 합니다' },
        { status: 400 }
      );
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        creditBalance: true,
        billingKey: true,
        autoRecharge: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    if (!user.billingKey) {
      return NextResponse.json(
        { error: '결제 수단이 등록되지 않았습니다' },
        { status: 400 }
      );
    }

    // 결제 기록 생성 (PENDING)
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount,
        currency: 'USD',
        status: 'PENDING',
        description: isAutoCharge ? '자동 충전' : '크레딧 충전',
      },
    });

    try {
      // PortOne 결제 실행 (USD를 KRW로 변환)
      const krwAmount = usdToKrw(amount);
      const portonePaymentId = generatePaymentId();

      const result = await payWithBillingKey(
        user.billingKey,
        portonePaymentId,
        krwAmount,
        `K-Glow 크레딧 ${isAutoCharge ? '자동 ' : ''}충전 - ${user.email}`
      );

      if (result.success) {
        const newBalance = user.creditBalance + amount;

        // 트랜잭션으로 잔액 업데이트 + 로그 생성
        await prisma.$transaction([
          // 사용자 잔액 업데이트
          prisma.user.update({
            where: { id: user.id },
            data: { creditBalance: newBalance },
          }),
          // 결제 기록 완료 처리
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'COMPLETED',
              portonePaymentId,
              completedAt: new Date(),
            },
          }),
          // 크레딧 로그 생성
          prisma.creditLog.create({
            data: {
              userId: user.id,
              amount: amount,
              type: isAutoCharge ? 'AUTO_CHARGE' : 'CHARGE',
              description: `$${amount.toFixed(2)} 충전`,
              paymentId: payment.id,
              balanceAfter: newBalance,
            },
          }),
        ]);

        return NextResponse.json({
          success: true,
          creditBalance: newBalance,
          chargedAmount: amount,
          paymentId: payment.id,
        });
      } else {
        throw new Error(result.error || '결제 실패');
      }
    } catch (chargeError) {
      // 결제 실패 시 Payment 상태 업데이트
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      console.error('결제 실패:', chargeError);
      return NextResponse.json(
        { error: '결제에 실패했습니다. 카드 정보를 확인해주세요.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('충전 실패:', error);
    return NextResponse.json(
      { error: '충전에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * 자동 충전 실행 함수 (내부 사용)
 */
export async function executeAutoCharge(userId: string): Promise<{
  success: boolean;
  newBalance?: number;
  error?: string;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        creditBalance: true,
        billingKey: true,
        autoRecharge: true,
        rechargeAmount: true,
      },
    });

    if (!user || !user.autoRecharge || !user.billingKey) {
      return { success: false, error: '자동 충전 조건 미충족' };
    }

    const amount = user.rechargeAmount;

    // 결제 기록 생성
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount,
        currency: 'USD',
        status: 'PENDING',
        description: '자동 충전',
      },
    });

    // PortOne 결제 실행
    const krwAmount = usdToKrw(amount);
    const portonePaymentId = generatePaymentId();

    const result = await payWithBillingKey(
      user.billingKey,
      portonePaymentId,
      krwAmount,
      `K-Glow 크레딧 자동 충전 - ${user.email}`
    );

    if (result.success) {
      const newBalance = user.creditBalance + amount;

      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { creditBalance: newBalance },
        }),
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            portonePaymentId,
            completedAt: new Date(),
          },
        }),
        prisma.creditLog.create({
          data: {
            userId: user.id,
            amount: amount,
            type: 'AUTO_CHARGE',
            description: `자동 충전 $${amount.toFixed(2)}`,
            paymentId: payment.id,
            balanceAfter: newBalance,
          },
        }),
      ]);

      return { success: true, newBalance };
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
      return { success: false, error: '결제 실패' };
    }
  } catch (error) {
    console.error('자동 충전 실행 오류:', error);
    return { success: false, error: '자동 충전 오류' };
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhook, getPayment } from '@/lib/portone';

export const dynamic = 'force-dynamic';

// PortOne Webhook 타입 정의
interface PortOneWebhookPayload {
  type: string;
  timestamp: string;
  data: {
    paymentId?: string;
    transactionId?: string;
    status?: string;
  };
}

/**
 * POST /api/billing/webhook
 * PortOne Webhook 이벤트 처리
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const webhookId = request.headers.get('webhook-id');
    const webhookTimestamp = request.headers.get('webhook-timestamp');
    const webhookSignature = request.headers.get('webhook-signature');

    // Webhook 검증
    const isValid = await verifyWebhook(body, {
      'webhook-id': webhookId,
      'webhook-timestamp': webhookTimestamp,
      'webhook-signature': webhookSignature,
    });

    if (!isValid) {
      console.error('Webhook 서명 검증 실패');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload: PortOneWebhookPayload = JSON.parse(body);

    // 이벤트 타입별 처리
    switch (payload.type) {
      case 'Transaction.Paid': {
        await handlePaymentPaid(payload.data.paymentId);
        break;
      }

      case 'Transaction.Failed': {
        await handlePaymentFailed(payload.data.paymentId);
        break;
      }

      case 'Transaction.Cancelled': {
        await handlePaymentCancelled(payload.data.paymentId);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${payload.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook 처리 오류:', error);
    return NextResponse.json(
      { error: 'Webhook 처리 실패' },
      { status: 500 }
    );
  }
}

/**
 * 결제 성공 처리
 */
async function handlePaymentPaid(paymentId?: string) {
  if (!paymentId) return;

  // PortOne에서 결제 정보 조회
  const portonePayment = await getPayment(paymentId);
  if (!portonePayment) {
    console.error('PortOne 결제 정보 조회 실패:', paymentId);
    return;
  }

  // DB에서 Payment 레코드 찾기
  const payment = await prisma.payment.findFirst({
    where: {
      portonePaymentId: paymentId,
      status: 'PENDING',
    },
    include: {
      user: {
        select: { creditBalance: true },
      },
    },
  });

  if (!payment) {
    console.log('매칭되는 PENDING 결제 없음:', paymentId);
    return;
  }

  // 이미 처리된 결제인지 확인
  const existingCompleted = await prisma.payment.findFirst({
    where: {
      portonePaymentId: paymentId,
      status: 'COMPLETED',
    },
  });

  if (existingCompleted) {
    console.log('이미 처리된 결제:', paymentId);
    return;
  }

  const newBalance = payment.user.creditBalance + payment.amount;

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: payment.userId },
      data: { creditBalance: newBalance },
    }),
    prisma.creditLog.create({
      data: {
        userId: payment.userId,
        amount: payment.amount,
        type: 'CHARGE',
        description: `Webhook 확인 충전 $${payment.amount.toFixed(2)}`,
        paymentId: payment.id,
        balanceAfter: newBalance,
      },
    }),
  ]);

  console.log('Webhook 결제 완료 처리:', paymentId);
}

/**
 * 결제 실패 처리
 */
async function handlePaymentFailed(paymentId?: string) {
  if (!paymentId) return;

  const payment = await prisma.payment.findFirst({
    where: {
      portonePaymentId: paymentId,
      status: 'PENDING',
    },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });
    console.log('Webhook 결제 실패 처리:', paymentId);
  }
}

/**
 * 결제 취소 처리
 */
async function handlePaymentCancelled(paymentId?: string) {
  if (!paymentId) return;

  const payment = await prisma.payment.findFirst({
    where: {
      portonePaymentId: paymentId,
      status: 'COMPLETED',
    },
    include: {
      user: {
        select: { creditBalance: true },
      },
    },
  });

  if (payment) {
    const newBalance = payment.user.creditBalance - payment.amount;

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' },
      }),
      prisma.user.update({
        where: { id: payment.userId },
        data: { creditBalance: Math.max(0, newBalance) },
      }),
      prisma.creditLog.create({
        data: {
          userId: payment.userId,
          amount: -payment.amount,
          type: 'REFUND',
          description: `결제 취소 환불 $${payment.amount.toFixed(2)}`,
          paymentId: payment.id,
          balanceAfter: Math.max(0, newBalance),
        },
      }),
    ]);
    console.log('Webhook 결제 취소 처리:', paymentId);
  }
}

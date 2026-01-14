import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/billing
 * 사용자별 크레딧 및 결제 정보 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // 검색 조건
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // 사용자 목록 조회
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          creditBalance: true,
          autoRecharge: true,
          billingKey: true,
          createdAt: true,
          _count: {
            select: {
              payments: true,
              aiUsageLogs: true,
            },
          },
        },
        orderBy: { creditBalance: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // 전체 통계
    const stats = await prisma.user.aggregate({
      _sum: { creditBalance: true },
      _avg: { creditBalance: true },
    });

    const totalPayments = await prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
      _count: true,
    });

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalCreditBalance: stats._sum.creditBalance || 0,
        avgCreditBalance: stats._avg.creditBalance || 0,
        totalPaymentAmount: totalPayments._sum.amount || 0,
        totalPaymentCount: totalPayments._count || 0,
      },
    });
  } catch (error) {
    console.error('Admin 과금 정보 조회 실패:', error);
    return NextResponse.json(
      { error: '조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/billing
 * 사용자 크레딧 조정
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const { userId, amount, description } = await request.json();

    if (!userId || amount === undefined) {
      return NextResponse.json(
        { error: 'userId와 amount가 필요합니다' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { creditBalance: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    const newBalance = user.creditBalance + amount;

    if (newBalance < 0) {
      return NextResponse.json(
        { error: '잔액이 음수가 될 수 없습니다' },
        { status: 400 }
      );
    }

    // 크레딧 조정 트랜잭션
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { creditBalance: newBalance },
      }),
      prisma.creditLog.create({
        data: {
          userId,
          amount,
          type: 'ADMIN_ADJUST',
          description: description || `관리자 조정 ${amount >= 0 ? '+' : ''}${amount}`,
          balanceAfter: newBalance,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      newBalance,
      message: `${user.email}의 크레딧이 조정되었습니다`,
    });
  } catch (error) {
    console.error('크레딧 조정 실패:', error);
    return NextResponse.json(
      { error: '크레딧 조정에 실패했습니다' },
      { status: 500 }
    );
  }
}

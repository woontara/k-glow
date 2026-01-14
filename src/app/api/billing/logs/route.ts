import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/billing/logs
 * 현재 사용자의 크레딧 사용 내역 조회
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const logs = await prisma.creditLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        balanceAfter: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('크레딧 로그 조회 실패:', error);
    return NextResponse.json(
      { error: '사용 내역 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

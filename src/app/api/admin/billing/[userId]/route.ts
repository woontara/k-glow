import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/billing/[userId]
 * 특정 사용자의 결제/크레딧 상세 정보 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const { userId } = await params;

    // 사용자 정보
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        creditBalance: true,
        autoRecharge: true,
        rechargeThreshold: true,
        rechargeAmount: true,
        billingKey: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    // 결제 내역
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // 크레딧 로그
    const creditLogs = await prisma.creditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // AI 사용 통계
    const usageStats = await prisma.aiUsageLog.groupBy({
      by: ['modelId'],
      where: { userId },
      _count: true,
    });

    // 모델별 사용량 상세
    const modelIds = usageStats.map((s) => s.modelId);
    const models = await prisma.aiModel.findMany({
      where: { id: { in: modelIds } },
      select: { id: true, name: true, pricePerUse: true },
    });

    const usageByModel = usageStats.map((stat) => {
      const model = models.find((m) => m.id === stat.modelId);
      return {
        modelId: stat.modelId,
        modelName: model?.name || 'Unknown',
        pricePerUse: model?.pricePerUse || 0,
        count: stat._count,
        totalCost: (model?.pricePerUse || 0) * stat._count,
      };
    });

    // 월별 사용량 (최근 6개월)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyUsage = await prisma.creditLog.groupBy({
      by: ['type'],
      where: {
        userId,
        createdAt: { gte: sixMonthsAgo },
        type: 'USAGE',
      },
      _sum: { amount: true },
      _count: true,
    });

    return NextResponse.json({
      user,
      payments,
      creditLogs,
      usageByModel,
      summary: {
        totalUsageCount: monthlyUsage[0]?._count || 0,
        totalUsageAmount: Math.abs(monthlyUsage[0]?._sum?.amount || 0),
      },
    });
  } catch (error) {
    console.error('사용자 상세 정보 조회 실패:', error);
    return NextResponse.json(
      { error: '조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

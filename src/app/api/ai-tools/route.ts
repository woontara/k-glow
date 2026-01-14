import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai-tools
 * 활성화된 AI 모델 목록 조회 (사용자용)
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const models = await prisma.aiModel.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        nameEn: true,
        modelId: true,
        category: true,
        description: true,
        iconUrl: true,
        defaultParams: true,
        pricePerUse: true,
      },
    });

    return NextResponse.json({ models });
  } catch (error) {
    console.error('AI 모델 목록 조회 실패:', error);
    return NextResponse.json(
      { error: 'AI 모델 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

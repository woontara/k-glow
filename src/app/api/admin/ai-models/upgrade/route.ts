import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/ai-models/upgrade
 * AI 모델을 새 버전으로 업그레이드 (Bria RMBG 2.0, CCSR)
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const results: string[] = [];

    // 1. 배경 제거 모델 업데이트 (BiRefNet → Bria RMBG 2.0)
    const bgModel = await prisma.aiModel.findFirst({
      where: { category: 'BACKGROUND_REMOVAL' },
    });

    if (bgModel) {
      await prisma.aiModel.update({
        where: { id: bgModel.id },
        data: {
          name: '배경 제거',
          nameEn: 'Bria RMBG 2.0',
          modelId: 'fal-ai/bria/background/remove',
          description: '상업용 라이선스 데이터로 학습된 고품질 배경 제거',
          defaultParams: { sync_mode: false },
        },
      });
      results.push(`배경 제거: ${bgModel.modelId} → fal-ai/bria/background/remove`);
    } else {
      await prisma.aiModel.create({
        data: {
          name: '배경 제거',
          nameEn: 'Bria RMBG 2.0',
          modelId: 'fal-ai/bria/background/remove',
          category: 'BACKGROUND_REMOVAL',
          description: '상업용 라이선스 데이터로 학습된 고품질 배경 제거',
          defaultParams: { sync_mode: false },
          isActive: true,
          order: 1,
        },
      });
      results.push('배경 제거: 새로 생성 (Bria RMBG 2.0)');
    }

    // 2. 업스케일 모델 업데이트 (Clarity → CCSR)
    const upscaleModel = await prisma.aiModel.findFirst({
      where: { category: 'UPSCALING' },
    });

    if (upscaleModel) {
      await prisma.aiModel.update({
        where: { id: upscaleModel.id },
        data: {
          name: '이미지 업스케일',
          nameEn: 'CCSR (SOTA)',
          modelId: 'fal-ai/ccsr',
          description: 'SOTA 업스케일러 - 최대 4배 확대, 무료',
          defaultParams: { scale: 2, steps: 50, color_fix_type: 'adain' },
        },
      });
      results.push(`업스케일: ${upscaleModel.modelId} → fal-ai/ccsr`);
    } else {
      await prisma.aiModel.create({
        data: {
          name: '이미지 업스케일',
          nameEn: 'CCSR (SOTA)',
          modelId: 'fal-ai/ccsr',
          category: 'UPSCALING',
          description: 'SOTA 업스케일러 - 최대 4배 확대, 무료',
          defaultParams: { scale: 2, steps: 50, color_fix_type: 'adain' },
          isActive: true,
          order: 2,
        },
      });
      results.push('업스케일: 새로 생성 (CCSR)');
    }

    // 업데이트된 모델 목록
    const models = await prisma.aiModel.findMany({
      orderBy: { order: 'asc' },
      select: { name: true, modelId: true, category: true, isActive: true },
    });

    return NextResponse.json({
      success: true,
      message: 'AI 모델 업그레이드 완료',
      changes: results,
      models,
    });
  } catch (error) {
    console.error('AI 모델 업그레이드 실패:', error);
    return NextResponse.json(
      { error: 'AI 모델 업그레이드에 실패했습니다' },
      { status: 500 }
    );
  }
}

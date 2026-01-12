import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/ai-models
 * AI 모델 목록 조회 (관리자용)
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const models = await prisma.aiModel.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { usageLogs: true },
        },
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

/**
 * POST /api/admin/ai-models
 * AI 모델 생성 (관리자용)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const body = await request.json();
    const { name, nameEn, modelId, category, description, iconUrl, apiKey, defaultParams, isActive, order } = body;

    if (!name || !nameEn || !modelId || !category) {
      return NextResponse.json(
        { error: '모델명(한글, 영문), 모델 ID, 카테고리는 필수입니다' },
        { status: 400 }
      );
    }

    // 모델 ID 중복 확인
    const existing = await prisma.aiModel.findUnique({
      where: { modelId },
    });

    if (existing) {
      return NextResponse.json(
        { error: '이미 등록된 모델 ID입니다' },
        { status: 400 }
      );
    }

    const model = await prisma.aiModel.create({
      data: {
        name,
        nameEn,
        modelId,
        category,
        description,
        iconUrl,
        apiKey,
        defaultParams: defaultParams || {},
        isActive: isActive ?? true,
        order: order ?? 0,
      },
    });

    return NextResponse.json({ model }, { status: 201 });
  } catch (error) {
    console.error('AI 모델 생성 실패:', error);
    return NextResponse.json(
      { error: 'AI 모델 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}

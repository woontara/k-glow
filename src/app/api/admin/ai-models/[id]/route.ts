import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/ai-models/[id]
 * AI 모델 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const { id } = await params;

    const model = await prisma.aiModel.findUnique({
      where: { id },
      include: {
        _count: {
          select: { usageLogs: true },
        },
      },
    });

    if (!model) {
      return NextResponse.json({ error: '모델을 찾을 수 없습니다' }, { status: 404 });
    }

    return NextResponse.json({ model });
  } catch (error) {
    console.error('AI 모델 조회 실패:', error);
    return NextResponse.json(
      { error: 'AI 모델 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/ai-models/[id]
 * AI 모델 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, nameEn, modelId, category, description, iconUrl, apiKey, defaultParams, isActive, order } = body;

    // 기존 모델 확인
    const existingModel = await prisma.aiModel.findUnique({
      where: { id },
    });

    if (!existingModel) {
      return NextResponse.json({ error: '모델을 찾을 수 없습니다' }, { status: 404 });
    }

    // 모델 ID 중복 확인 (자기 자신 제외)
    if (modelId && modelId !== existingModel.modelId) {
      const duplicate = await prisma.aiModel.findFirst({
        where: {
          modelId,
          NOT: { id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: '이미 등록된 모델 ID입니다' },
          { status: 400 }
        );
      }
    }

    const model = await prisma.aiModel.update({
      where: { id },
      data: {
        name,
        nameEn,
        modelId,
        category,
        description,
        iconUrl,
        apiKey: apiKey !== undefined ? apiKey : existingModel.apiKey,
        defaultParams: defaultParams || existingModel.defaultParams,
        isActive,
        order,
      },
    });

    return NextResponse.json({ model });
  } catch (error) {
    console.error('AI 모델 수정 실패:', error);
    return NextResponse.json(
      { error: 'AI 모델 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/ai-models/[id]
 * AI 모델 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const { id } = await params;

    // 사용 기록이 있는지 확인
    const model = await prisma.aiModel.findUnique({
      where: { id },
      include: {
        _count: {
          select: { usageLogs: true },
        },
      },
    });

    if (!model) {
      return NextResponse.json({ error: '모델을 찾을 수 없습니다' }, { status: 404 });
    }

    // 사용 기록이 있으면 비활성화 권장
    if (model._count.usageLogs > 0) {
      return NextResponse.json(
        {
          error: `이 모델은 ${model._count.usageLogs}개의 사용 기록이 있습니다. 삭제 대신 비활성화를 권장합니다.`,
          hasUsageLogs: true,
          usageCount: model._count.usageLogs,
        },
        { status: 400 }
      );
    }

    await prisma.aiModel.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('AI 모델 삭제 실패:', error);
    return NextResponse.json(
      { error: 'AI 모델 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}

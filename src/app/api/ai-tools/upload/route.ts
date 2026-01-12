import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fal } from '@fal-ai/client';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai-tools/upload
 * 이미지를 fal.ai 스토리지에 업로드
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const modelId = formData.get('modelId') as string;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다' }, { status: 400 });
    }

    if (!modelId) {
      return NextResponse.json({ error: '모델 ID가 없습니다' }, { status: 400 });
    }

    // 모델에서 API 키 조회
    const aiModel = await prisma.aiModel.findUnique({
      where: { id: modelId },
    });

    if (!aiModel) {
      return NextResponse.json({ error: '모델을 찾을 수 없습니다' }, { status: 404 });
    }

    const apiKey = aiModel.apiKey || process.env.FAL_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다' }, { status: 500 });
    }

    // fal.ai 설정
    fal.config({
      credentials: apiKey,
    });

    // fal.ai 스토리지에 업로드
    const url = await fal.storage.upload(file);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('파일 업로드 실패:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '파일 업로드에 실패했습니다' },
      { status: 500 }
    );
  }
}

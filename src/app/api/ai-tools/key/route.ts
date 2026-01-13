import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai-tools/key
 * 모델별 API 키 조회 (클라이언트 업로드용)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const modelId = request.nextUrl.searchParams.get('modelId');

    if (!modelId) {
      return NextResponse.json({ error: '모델 ID가 필요합니다' }, { status: 400 });
    }

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

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error('API 키 조회 실패:', error);
    return NextResponse.json(
      { error: 'API 키 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { runAiModel } from '@/lib/fal-client';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai-tools/[modelId]/run
 * AI 모델 실행
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ modelId: string }> }
) {
  try {
    // 1. 인증 확인
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { modelId } = await params;

    // 2. 모델 조회 및 활성화 확인
    const aiModel = await prisma.aiModel.findUnique({
      where: { id: modelId },
    });

    if (!aiModel) {
      return NextResponse.json({ error: '모델을 찾을 수 없습니다' }, { status: 404 });
    }

    if (!aiModel.isActive) {
      return NextResponse.json({ error: '비활성화된 모델입니다' }, { status: 400 });
    }

    // 3. API 키 확인 (모델별 키 또는 기본 환경변수 키)
    const apiKey = aiModel.apiKey || process.env.FAL_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다. 관리자에게 문의하세요.' },
        { status: 500 }
      );
    }

    // 4. 요청 파라미터 파싱
    const body = await request.json();
    const { image_url, audio_url, ...otherParams } = body;

    // 기본 파라미터와 사용자 파라미터 병합
    const defaultParams = (aiModel.defaultParams as Record<string, unknown>) || {};
    const inputParams = {
      ...defaultParams,
      ...otherParams,
      ...(image_url && { image_url }),
      ...(audio_url && { audio_url }),
    };

    // 5. 사용 로그 생성 (PROCESSING 상태)
    const usageLog = await prisma.aiUsageLog.create({
      data: {
        userId: session.user.id as string,
        modelId: aiModel.id,
        inputParams,
        status: 'PROCESSING',
      },
    });

    // 6. fal.ai API 호출 (모델별 API 키 사용)
    const rawResult = await runAiModel(aiModel.modelId, inputParams, apiKey);

    // 7. 결과 정규화 (일관된 형식으로 변환)
    const result = normalizeResult(rawResult);

    // 8. 결과에서 출력 URL 추출
    const outputUrl = extractOutputUrl(result);

    // 9. 사용 로그 업데이트 (완료)
    await prisma.aiUsageLog.update({
      where: { id: usageLog.id },
      data: {
        status: 'COMPLETED',
        outputUrl,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      result,
      usageId: usageLog.id,
    });

  } catch (error) {
    console.error('AI 모델 실행 실패:', error);

    // 에러 메시지 추출
    const errorMessage = error instanceof Error ? error.message : 'AI 처리에 실패했습니다';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * 결과 데이터를 일관된 형식으로 정규화
 */
function normalizeResult(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {};

  const result = data as Record<string, unknown>;
  const normalized: Record<string, unknown> = { ...result };

  // MiniMax TTS는 audio_file로 반환하므로 audio로 변환
  if (result.audio_file && typeof result.audio_file === 'object') {
    normalized.audio = result.audio_file;
  }

  // 직접 audio_url이 있는 경우
  if (typeof result.audio_url === 'string') {
    normalized.audio = { url: result.audio_url };
  }

  return normalized;
}

/**
 * 결과 데이터에서 출력 URL 추출
 */
function extractOutputUrl(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;

  const result = data as Record<string, unknown>;

  // 이미지 결과
  if (result.image && typeof result.image === 'object') {
    const image = result.image as Record<string, unknown>;
    if (typeof image.url === 'string') return image.url;
  }

  // 비디오 결과
  if (result.video && typeof result.video === 'object') {
    const video = result.video as Record<string, unknown>;
    if (typeof video.url === 'string') return video.url;
  }

  // 오디오 결과 (TTS)
  if (result.audio && typeof result.audio === 'object') {
    const audio = result.audio as Record<string, unknown>;
    if (typeof audio.url === 'string') return audio.url;
  }

  // MiniMax TTS는 audio_file로 반환
  if (result.audio_file && typeof result.audio_file === 'object') {
    const audioFile = result.audio_file as Record<string, unknown>;
    if (typeof audioFile.url === 'string') return audioFile.url;
  }

  // 직접 URL
  if (typeof result.url === 'string') return result.url;

  // 직접 audio_url (일부 TTS 모델)
  if (typeof result.audio_url === 'string') return result.audio_url;

  return null;
}

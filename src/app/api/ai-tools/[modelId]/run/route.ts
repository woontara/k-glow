import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { runAiModel } from '@/lib/fal-client';
import { executeAutoCharge } from '@/app/api/billing/charge/route';

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

    // 3. 사용자 정보 및 크레딧 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: {
        id: true,
        creditBalance: true,
        autoRecharge: true,
        rechargeThreshold: true,
        rechargeAmount: true,
        billingKey: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    const pricePerUse = aiModel.pricePerUse || 0;
    let currentBalance = user.creditBalance;

    // 4. 크레딧 확인 (ADMIN은 무료)
    if (user.role !== 'ADMIN') {
      // 크레딧이 전혀 없는 경우 - 충전 필요
      if (currentBalance <= 0) {
        return NextResponse.json(
          {
            error: '크레딧이 없습니다. 먼저 크레딧을 충전해주세요.',
            creditBalance: currentBalance,
            pricePerUse,
            needsCharge: true,
          },
          { status: 402 } // Payment Required
        );
      }

      // 유료 모델인데 잔액이 부족한 경우
      if (pricePerUse > 0 && currentBalance < pricePerUse) {
        // 자동 충전 시도
        if (user.autoRecharge && user.billingKey) {
          const chargeResult = await executeAutoCharge(user.id);
          if (chargeResult.success && chargeResult.newBalance !== undefined) {
            currentBalance = chargeResult.newBalance;
          } else {
            return NextResponse.json(
              {
                error: '잔액이 부족합니다. 자동 충전에 실패했습니다.',
                creditBalance: currentBalance,
                pricePerUse,
              },
              { status: 402 } // Payment Required
            );
          }
        } else {
          return NextResponse.json(
            {
              error: `잔액이 부족합니다. 현재 잔액: $${currentBalance.toFixed(2)}, 필요 금액: $${pricePerUse.toFixed(2)}`,
              creditBalance: currentBalance,
              pricePerUse,
            },
            { status: 402 } // Payment Required
          );
        }
      }
    }

    // 5. API 키 확인 (모델별 키 또는 기본 환경변수 키)
    const apiKey = aiModel.apiKey || process.env.FAL_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다. 관리자에게 문의하세요.' },
        { status: 500 }
      );
    }

    // 6. 요청 파라미터 파싱
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

    // 7. 사용 로그 생성 (PROCESSING 상태)
    const usageLog = await prisma.aiUsageLog.create({
      data: {
        userId: user.id,
        modelId: aiModel.id,
        inputParams,
        status: 'PROCESSING',
      },
    });

    // 8. fal.ai API 호출 (모델별 API 키 사용)
    const rawResult = await runAiModel(aiModel.modelId, inputParams, apiKey);

    // 9. 결과 정규화 (일관된 형식으로 변환)
    const result = normalizeResult(rawResult);

    // 10. 결과에서 출력 URL 추출
    const outputUrl = extractOutputUrl(result);

    // 11. 크레딧 차감 (무료 모델이 아닌 경우, ADMIN은 제외)
    let newBalance = currentBalance;
    if (pricePerUse > 0 && user.role !== 'ADMIN') {
      newBalance = currentBalance - pricePerUse;

      await prisma.$transaction([
        // 잔액 차감
        prisma.user.update({
          where: { id: user.id },
          data: { creditBalance: newBalance },
        }),
        // 크레딧 로그 생성
        prisma.creditLog.create({
          data: {
            userId: user.id,
            amount: -pricePerUse,
            type: 'USAGE',
            description: `${aiModel.name} 사용`,
            aiUsageLogId: usageLog.id,
            balanceAfter: newBalance,
          },
        }),
      ]);

      // 임계값 이하로 떨어지면 자동 충전 예약 (비동기로 실행)
      if (user.autoRecharge && newBalance < user.rechargeThreshold) {
        // 백그라운드에서 자동 충전 실행 (결과 기다리지 않음)
        executeAutoCharge(user.id).catch(console.error);
      }
    }

    // 12. 사용 로그 업데이트 (완료)
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
      creditBalance: newBalance,
      charged: pricePerUse,
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

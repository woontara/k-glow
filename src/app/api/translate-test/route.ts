import { NextRequest, NextResponse } from 'next/server';
import { translate, translateProductName, translateProductDescription } from '@/lib/translator';
import { isTranslateGemmaAvailable } from '@/lib/translate-gemma';

export async function POST(request: NextRequest) {
  try {
    const { text, type = 'general' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: '텍스트를 입력해주세요.' }, { status: 400 });
    }

    const startTime = Date.now();
    let result: string;
    let method: string;

    // TranslateGemma 사용 여부 확인
    const usingGemma = isTranslateGemmaAvailable();
    method = usingGemma ? 'TranslateGemma (Vertex AI)' : 'Claude API';

    // 번역 타입에 따라 다른 함수 사용
    switch (type) {
      case 'product_name':
        result = await translateProductName(text, 'ru');
        break;
      case 'product_description':
        result = await translateProductDescription(text, 'ru');
        break;
      default:
        const translateResult = await translate({
          text,
          targetLanguage: 'ru',
        });
        result = translateResult.translated;
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      original: text,
      translated: result,
      method,
      type,
      duration: `${duration}ms`,
    });
  } catch (error) {
    console.error('[Translate Test] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '번역 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // TranslateGemma 설정 상태 확인
  const gemmaAvailable = isTranslateGemmaAvailable();
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'not set';
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1 (default)';

  return NextResponse.json({
    status: 'ok',
    translateGemma: {
      available: gemmaAvailable,
      projectId: gemmaAvailable ? projectId : 'not configured',
      location: gemmaAvailable ? location : 'not configured',
    },
    claudeApi: {
      available: !!process.env.CLAUDE_API_KEY,
    },
  });
}

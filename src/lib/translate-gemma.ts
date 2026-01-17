// TranslateGemma - Hugging Face Inference API 기반 번역
// Google의 오픈소스 번역 모델 TranslateGemma를 Hugging Face에서 사용

// 지원 언어 코드
type SupportedLanguage = 'ru' | 'en' | 'ko' | 'zh' | 'ja';

interface TranslateGemmaRequest {
  text: string;
  sourceLanguage?: SupportedLanguage;
  targetLanguage: SupportedLanguage;
}

interface TranslateGemmaResult {
  original: string;
  translated: string;
  sourceLanguage: string;
  targetLanguage: string;
}

// 언어 코드 -> 영문 언어명 매핑
const languageNames: Record<SupportedLanguage, string> = {
  ru: 'Russian',
  en: 'English',
  ko: 'Korean',
  zh: 'Chinese',
  ja: 'Japanese',
};

// Hugging Face TranslateGemma 모델 ID
const HUGGINGFACE_MODEL = 'google/translategemma-12b-it';

/**
 * TranslateGemma를 사용한 번역 (Hugging Face Inference API)
 * @param request 번역 요청 (텍스트, 소스 언어, 대상 언어)
 * @returns 번역 결과
 */
export async function translateWithGemma(
  request: TranslateGemmaRequest
): Promise<TranslateGemmaResult> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  // 환경변수 확인
  if (!apiKey) {
    console.warn('⚠️ HUGGINGFACE_API_KEY가 설정되지 않았습니다.');
    return {
      original: request.text,
      translated: `[TranslateGemma 미설정: ${request.text}]`,
      sourceLanguage: request.sourceLanguage || 'auto',
      targetLanguage: request.targetLanguage,
    };
  }

  try {
    const targetLang = languageNames[request.targetLanguage];
    const sourceLang = request.sourceLanguage
      ? languageNames[request.sourceLanguage]
      : '';

    // TranslateGemma 프롬프트 형식
    let prompt: string;
    if (sourceLang) {
      prompt = `<translate>${sourceLang} to ${targetLang}: ${request.text}</translate>`;
    } else {
      prompt = `<translate>to ${targetLang}: ${request.text}</translate>`;
    }

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 1024,
            temperature: 0.3,
            do_sample: false,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TranslateGemma] API 에러:', response.status, errorText);
      throw new Error(`Hugging Face API 오류: ${response.status}`);
    }

    const data = await response.json();

    // 응답 파싱
    let translated = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      translated = data[0].generated_text.trim();
    } else if (data.generated_text) {
      translated = data.generated_text.trim();
    } else if (typeof data === 'string') {
      translated = data.trim();
    }

    // 프롬프트가 응답에 포함된 경우 제거
    if (translated.startsWith(prompt)) {
      translated = translated.substring(prompt.length).trim();
    }

    if (!translated) {
      throw new Error('번역 결과가 비어있습니다.');
    }

    return {
      original: request.text,
      translated,
      sourceLanguage: request.sourceLanguage || 'auto',
      targetLanguage: request.targetLanguage,
    };
  } catch (error) {
    console.error('[TranslateGemma] 번역 실패:', error);
    return {
      original: request.text,
      translated: `[번역 실패: ${request.text}]`,
      sourceLanguage: request.sourceLanguage || 'auto',
      targetLanguage: request.targetLanguage,
    };
  }
}

/**
 * 러시아어 번역 (한국어 -> 러시아어)
 */
export async function translateToRussian(text: string): Promise<string> {
  const result = await translateWithGemma({
    text,
    sourceLanguage: 'ko',
    targetLanguage: 'ru',
  });
  return result.translated;
}

/**
 * 일괄 번역 (TranslateGemma)
 */
export async function batchTranslateWithGemma(
  texts: string[],
  targetLanguage: SupportedLanguage,
  sourceLanguage?: SupportedLanguage
): Promise<string[]> {
  const results: string[] = [];

  for (const text of texts) {
    const result = await translateWithGemma({
      text,
      sourceLanguage,
      targetLanguage,
    });
    results.push(result.translated);

    // Rate limiting (100ms)
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * 화장품 제품명 번역 (TranslateGemma)
 */
export async function translateProductNameWithGemma(
  name: string,
  targetLanguage: SupportedLanguage = 'ru'
): Promise<string> {
  // 화장품 제품명에 맞게 컨텍스트 추가
  const contextualText = `[Cosmetic product name] ${name}`;
  const result = await translateWithGemma({
    text: contextualText,
    sourceLanguage: 'ko',
    targetLanguage,
  });

  // 컨텍스트 프리픽스 제거
  return result.translated.replace(/^\[.*?\]\s*/, '');
}

/**
 * 제품 설명 번역 (TranslateGemma)
 */
export async function translateDescriptionWithGemma(
  description: string,
  targetLanguage: SupportedLanguage = 'ru'
): Promise<string> {
  // 너무 긴 설명은 분할
  if (description.length > 2000) {
    description = description.substring(0, 2000) + '...';
  }

  const result = await translateWithGemma({
    text: description,
    sourceLanguage: 'ko',
    targetLanguage,
  });
  return result.translated;
}

/**
 * 성분 번역 (TranslateGemma)
 */
export async function translateIngredientsWithGemma(
  ingredients: string[],
  targetLanguage: SupportedLanguage = 'ru'
): Promise<string[]> {
  // 최대 30개 성분만 번역
  const toTranslate = ingredients.slice(0, 30);
  return batchTranslateWithGemma(toTranslate, targetLanguage, 'ko');
}

/**
 * TranslateGemma 사용 가능 여부 확인
 */
export function isTranslateGemmaAvailable(): boolean {
  return !!process.env.HUGGINGFACE_API_KEY;
}

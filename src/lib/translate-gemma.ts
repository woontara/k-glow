// Gemini API 기반 번역
// Google Gemini를 사용한 고품질 번역

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

/**
 * Gemini API를 사용한 번역
 * @param request 번역 요청 (텍스트, 소스 언어, 대상 언어)
 * @returns 번역 결과
 */
export async function translateWithGemma(
  request: TranslateGemmaRequest
): Promise<TranslateGemmaResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // 환경변수 확인
  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY가 설정되지 않았습니다.');
    return {
      original: request.text,
      translated: `[Gemini 미설정: ${request.text}]`,
      sourceLanguage: request.sourceLanguage || 'auto',
      targetLanguage: request.targetLanguage,
    };
  }

  try {
    const targetLang = languageNames[request.targetLanguage];
    const sourceLang = request.sourceLanguage
      ? languageNames[request.sourceLanguage]
      : '';

    // 번역 프롬프트
    let prompt: string;
    if (sourceLang) {
      prompt = `You are a professional translator. Translate the following ${sourceLang} text to ${targetLang}.
Only output the translated text, nothing else. No explanations, no quotes, just the translation.

Text: ${request.text}`;
    } else {
      prompt = `You are a professional translator. Translate the following text to ${targetLang}.
Only output the translated text, nothing else. No explanations, no quotes, just the translation.

Text: ${request.text}`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Gemini] API 에러:', response.status, errorText);
      throw new Error(`Gemini API 오류: ${response.status}`);
    }

    const data = await response.json();
    const translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

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
    console.error('[Gemini] 번역 실패:', error);
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
 * Gemini 번역 사용 가능 여부 확인
 */
export function isTranslateGemmaAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

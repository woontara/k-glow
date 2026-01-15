// Claude API 기반 번역 유틸리티

interface TranslationRequest {
  text: string;
  targetLanguage: 'ru' | 'en' | 'ko';
  context?: string; // 번역 맥락 (예: "화장품 제품명", "마케팅 카피")
}

interface TranslationResult {
  original: string;
  translated: string;
  language: string;
}

/**
 * Claude API를 사용한 번역
 */
export async function translateWithClaude(
  request: TranslationRequest
): Promise<TranslationResult> {
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ CLAUDE_API_KEY가 설정되지 않았습니다. 기본 번역을 사용합니다.');
    console.warn('⚠️ 현재 환경변수:', Object.keys(process.env).filter(k => k.includes('CLAUDE') || k.includes('API')));
    return {
      original: request.text,
      translated: `[번역 필요: ${request.text}]`,
      language: request.targetLanguage,
    };
  }

  console.log('[Translator] API 키 확인됨, 길이:', apiKey.length);

  try {
    const prompt = buildTranslationPrompt(request);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[Translator] API 오류 응답:', response.status, errorBody);
      throw new Error(`Claude API 오류: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    const translated = data.content[0].text.trim();

    return {
      original: request.text,
      translated,
      language: request.targetLanguage,
    };
  } catch (error) {
    console.error('번역 실패:', error);
    return {
      original: request.text,
      translated: `[번역 실패: ${request.text}]`,
      language: request.targetLanguage,
    };
  }
}

/**
 * 일괄 번역
 */
export async function batchTranslate(
  texts: string[],
  targetLanguage: 'ru' | 'en' | 'ko',
  context?: string
): Promise<string[]> {
  const results: string[] = [];

  for (const text of texts) {
    const result = await translateWithClaude({
      text,
      targetLanguage,
      context,
    });
    results.push(result.translated);

    // Rate limiting (200ms - Vercel 타임아웃 대응)
    await sleep(200);
  }

  return results;
}

/**
 * 화장품 제품명 번역 (특화)
 */
export async function translateProductName(
  name: string,
  targetLanguage: 'ru' = 'ru'
): Promise<string> {
  const result = await translateWithClaude({
    text: name,
    targetLanguage,
    context: '화장품 제품명 - 브랜드 톤을 유지하며 자연스럽게 번역',
  });
  return result.translated;
}

/**
 * 제품 설명 번역 (마케팅 카피 현지화)
 */
export async function translateProductDescription(
  description: string,
  targetLanguage: 'ru' = 'ru'
): Promise<string> {
  const result = await translateWithClaude({
    text: description,
    targetLanguage,
    context: '화장품 제품 설명 - 마케팅 효과를 유지하며 러시아 소비자 관점으로 재구성',
  });
  return result.translated;
}

/**
 * 성분 번역 (전문 용어)
 */
export async function translateIngredients(
  ingredients: string[],
  targetLanguage: 'ru' = 'ru'
): Promise<string[]> {
  return batchTranslate(
    ingredients,
    targetLanguage,
    '화장품 성분 - 러시아 화장품 규정 표준 용어 사용'
  );
}

// ===== 유틸리티 함수 =====

function buildTranslationPrompt(request: TranslationRequest): string {
  const languageMap = {
    ru: '러시아어',
    en: '영어',
    ko: '한국어',
  };

  const targetLang = languageMap[request.targetLanguage];

  let prompt = `다음 텍스트를 ${targetLang}로 번역해주세요.\n\n`;

  if (request.context) {
    prompt += `[맥락: ${request.context}]\n\n`;
  }

  prompt += `원문:\n${request.text}\n\n`;
  prompt += `번역 시 주의사항:\n`;
  prompt += `- 자연스러운 ${targetLang} 표현 사용\n`;
  prompt += `- 화장품 업계 전문 용어 정확히 번역\n`;
  prompt += `- 브랜드 이미지와 톤 유지\n`;
  prompt += `- 번역문만 출력 (설명 불필요)\n\n`;
  prompt += `번역:`;

  return prompt;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===== 상품 리빌드 번역 =====

export interface ProductRebuildTranslation {
  nameRu: string;
  descriptionRu: string;
  ingredientsRu: string[];
}

/**
 * 상품 리빌드용 통합 번역
 * 상품명, 설명, 성분을 한 번에 번역
 */
export async function translateProductRebuild(
  product: {
    name: string;
    description: string;
    ingredients: string[];
  }
): Promise<ProductRebuildTranslation> {
  console.log('[Translator] 상품 번역 시작:', product.name);

  // 상품명 번역
  const nameRu = await translateProductName(product.name, 'ru');
  console.log('[Translator] 상품명 번역 완료');

  // 설명 번역 (긴 텍스트는 분할)
  let descriptionRu = '';
  if (product.description) {
    // 너무 긴 설명은 앞부분만 번역
    const truncatedDescription = product.description.substring(0, 3000);
    descriptionRu = await translateProductDescription(truncatedDescription, 'ru');
    console.log('[Translator] 설명 번역 완료');
  }

  // 성분 번역
  let ingredientsRu: string[] = [];
  if (product.ingredients && product.ingredients.length > 0) {
    // 최대 30개 성분만 번역
    const ingredientsToTranslate = product.ingredients.slice(0, 30);
    ingredientsRu = await translateIngredients(ingredientsToTranslate, 'ru');
    console.log('[Translator] 성분 번역 완료 (' + ingredientsRu.length + '개)');
  }

  console.log('[Translator] 상품 번역 완료');

  return {
    nameRu,
    descriptionRu,
    ingredientsRu,
  };
}

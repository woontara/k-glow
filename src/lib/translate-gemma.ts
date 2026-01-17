// TranslateGemma - Google Vertex AI 기반 번역
// Google의 오픈소스 번역 모델 TranslateGemma를 사용한 고품질 번역

import { VertexAI } from '@google-cloud/vertexai';

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

// 언어 코드 -> 영문 언어명 매핑 (TranslateGemma 프롬프트용)
const languageNames: Record<SupportedLanguage, string> = {
  ru: 'Russian',
  en: 'English',
  ko: 'Korean',
  zh: 'Chinese',
  ja: 'Japanese',
};

/**
 * 서비스 계정 JSON 파싱
 */
function getServiceAccountCredentials() {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentialsJson) {
    return null;
  }

  try {
    return JSON.parse(credentialsJson);
  } catch (error) {
    console.error('[TranslateGemma] 서비스 계정 JSON 파싱 실패:', error);
    return null;
  }
}

/**
 * Vertex AI 클라이언트 생성
 */
function getVertexAIClient() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

  if (!projectId) {
    throw new Error('GOOGLE_CLOUD_PROJECT 환경변수가 설정되지 않았습니다.');
  }

  // 서비스 계정 JSON 키 사용 (Vercel 환경)
  const credentials = getServiceAccountCredentials();

  if (credentials) {
    return new VertexAI({
      project: projectId,
      location: location,
      googleAuthOptions: {
        credentials: credentials,
      },
    });
  }

  // 기본 인증 사용 (로컬 환경)
  return new VertexAI({
    project: projectId,
    location: location,
  });
}

/**
 * TranslateGemma를 사용한 번역
 * @param request 번역 요청 (텍스트, 소스 언어, 대상 언어)
 * @returns 번역 결과
 */
export async function translateWithGemma(
  request: TranslateGemmaRequest
): Promise<TranslateGemmaResult> {
  // 환경변수 확인
  if (!process.env.GOOGLE_CLOUD_PROJECT) {
    console.warn('⚠️ GOOGLE_CLOUD_PROJECT가 설정되지 않았습니다.');
    return {
      original: request.text,
      translated: `[TranslateGemma 미설정: ${request.text}]`,
      sourceLanguage: request.sourceLanguage || 'auto',
      targetLanguage: request.targetLanguage,
    };
  }

  try {
    const vertexAI = getVertexAIClient();

    // TranslateGemma 12B 모델 사용 (성능/효율 균형)
    const model = vertexAI.getGenerativeModel({
      model: 'translategemma-12b',
    });

    // TranslateGemma 프롬프트 형식
    const targetLang = languageNames[request.targetLanguage];
    const sourceLang = request.sourceLanguage
      ? languageNames[request.sourceLanguage]
      : '';

    // TranslateGemma 권장 프롬프트 형식
    let prompt: string;
    if (sourceLang) {
      prompt = `Translate from ${sourceLang} to ${targetLang}:\n${request.text}`;
    } else {
      prompt = `Translate to ${targetLang}:\n${request.text}`;
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    const translated = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

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
  return !!process.env.GOOGLE_CLOUD_PROJECT;
}

// 상품 상세페이지 리빌드 기능 타입 정의

// 사이트 타입
export type SiteType = 'coupang' | 'naver' | '11st' | 'innisfree' | 'generic';

// 사이트별 셀렉터 설정
export interface SiteSelectors {
  productName: string | string[];
  price: string | string[];
  description: string | string[];
  images: string | string[];
  ingredients?: string | string[];
  detailImages?: string | string[];
}

export interface SiteConfig {
  name: SiteType;
  hostPatterns: string[];
  contentSelector: string;
  selectors: SiteSelectors;
  scrollConfig?: {
    scrollDelay: number;
    maxScrolls: number;
  };
  waitForSelector?: string;
}

// 스크래핑 옵션
export interface ScrapeOptions {
  captureScreenshot: boolean;
  downloadImages: boolean;
  timeout: number;
}

// 스크래핑 결과
export interface ScrapedProduct {
  name: string;
  price: number | null;
  priceOriginal: string | null;
  description: string;
  ingredients: string[];
  imageUrls: string[];           // 다운로드된 로컬 경로
  originalImageUrls: string[];   // 원본 URL
  screenshotPath: string | null;
  sourceSite: SiteType;
}

// API 요청
export interface ProductRebuildRequest {
  url: string;
  options?: {
    downloadImages?: boolean;
    captureScreenshot?: boolean;
    translateToRussian?: boolean;
    saveToDatabase?: boolean;
    timeout?: number;
  };
}

// API 응답 데이터
export interface ProductRebuildData {
  id?: string;
  sourceUrl: string;
  sourceSite: SiteType;

  // 한국어 원본
  name: string;
  price: number | null;
  priceOriginal: string | null;
  description: string;
  ingredients: string[];

  // 러시아어 번역
  nameRu: string;
  descriptionRu: string;
  ingredientsRu: string[];

  // 이미지
  screenshotUrl: string | null;
  imageUrls: string[];
  originalImageUrls: string[];

  // 메타데이터
  extractedAt: string;
}

// API 응답
export interface ProductRebuildResponse {
  success: boolean;
  data?: ProductRebuildData;
  error?: string;
}

// 번역 입력
export interface ProductTranslationInput {
  name: string;
  description: string;
  ingredients: string[];
}

// 번역 결과
export interface ProductTranslationResult {
  nameRu: string;
  descriptionRu: string;
  ingredientsRu: string[];
}

// 진행 상태 (UI용)
export interface RebuildProgress {
  step: 'idle' | 'connecting' | 'scraping' | 'capturing' | 'downloading' | 'translating' | 'saving' | 'done' | 'error';
  message: string;
  percentage: number;
}

export const PROGRESS_STEPS: Record<RebuildProgress['step'], { message: string; percentage: number }> = {
  idle: { message: '대기 중', percentage: 0 },
  connecting: { message: '페이지 접속 중...', percentage: 10 },
  scraping: { message: '상품 정보 추출 중...', percentage: 30 },
  capturing: { message: '스크린샷 캡처 중...', percentage: 50 },
  downloading: { message: '이미지 다운로드 중...', percentage: 65 },
  translating: { message: '러시아어 번역 중...', percentage: 80 },
  saving: { message: '저장 중...', percentage: 90 },
  done: { message: '완료!', percentage: 100 },
  error: { message: '오류 발생', percentage: 0 },
};

// 범용 상품 정보 추출 로직
import { Page } from 'puppeteer';
import { SiteConfig, SiteSelectors } from '@/types/product-rebuild';

// 범용 셀렉터 설정
export const genericConfig: SiteConfig = {
  name: 'generic',
  hostPatterns: [], // 모든 사이트에 적용
  contentSelector: 'body',
  selectors: {
    productName: [
      // Cafe24/한국 쇼핑몰 특화
      '.headingArea h2',
      '.xans-product-detail .name',
      '.product_name',
      '.prd_name',
      '.goods_name',
      '.item_name',
      '#prdDetail .name',
      '.detailArea .name',
      // 일반적인 패턴
      'h1.product-name',
      'h1.product-title',
      'h1[class*="product"]',
      '[class*="product-name"]:not(script)',
      '[class*="product-title"]:not(script)',
      '[class*="item-name"]:not(script)',
      '[class*="goods-name"]:not(script)',
      'h1',
      'meta[property="og:title"]',
    ],
    price: [
      // Cafe24/한국 쇼핑몰 특화
      '#span_product_price_text',
      '.price .sale',
      '.product_price',
      '.prd_price',
      '.sale_price',
      // 일반적인 패턴
      '[class*="price"]:not([class*="origin"]):not([class*="regular"]):not([class*="before"])',
      '[class*="cost"]',
      '[class*="amount"]',
      'meta[property="product:price:amount"]',
    ],
    description: [
      '[class*="description"]',
      '[class*="detail"]',
      '[class*="content"]',
      '[class*="info"]',
      'meta[property="og:description"]',
      'meta[name="description"]',
    ],
    images: [
      '[class*="product"] img',
      '[class*="detail"] img',
      '[class*="gallery"] img',
      '[class*="slide"] img',
      '[class*="thumb"] img',
      'main img',
      'article img',
    ],
    ingredients: [
      '[class*="ingredient"]',
      '[class*="component"]',
      '[class*="composition"]',
      ':contains("성분")',
      ':contains("전성분")',
    ],
    detailImages: [
      '[class*="detail-image"] img',
      '[class*="product-detail"] img',
      '[class*="description"] img',
      '[class*="content"] img',
    ],
  },
};

/**
 * 여러 셀렉터 중 첫 번째로 매칭되는 요소의 텍스트 추출
 */
async function extractTextFromSelectors(
  page: Page,
  selectors: string | string[]
): Promise<string> {
  const selectorList = Array.isArray(selectors) ? selectors : [selectors];

  for (const selector of selectorList) {
    try {
      // meta 태그 처리
      if (selector.startsWith('meta[')) {
        const content = await page.$eval(selector, (el) =>
          el.getAttribute('content')
        ).catch(() => null);
        if (content) return content.trim();
        continue;
      }

      // :contains 가상 셀렉터 처리
      if (selector.includes(':contains(')) {
        const match = selector.match(/:contains\("([^"]+)"\)/);
        if (match) {
          const searchText = match[1];
          const text = await page.evaluate((search) => {
            const elements = Array.from(document.querySelectorAll('*'));
            for (const el of elements) {
              if (el.textContent?.includes(search)) {
                // 해당 요소의 부모나 형제에서 실제 내용 추출
                const parent = el.parentElement;
                if (parent) {
                  const content = parent.textContent || '';
                  // 제목 이후의 내용만 추출
                  const idx = content.indexOf(search);
                  if (idx !== -1) {
                    return content.substring(idx).trim();
                  }
                }
              }
            }
            return '';
          }, searchText);
          if (text) return text;
        }
        continue;
      }

      // 일반 셀렉터
      const text = await page.$eval(selector, (el) => el.textContent?.trim() || '').catch(() => '');
      if (text) return text;
    } catch {
      continue;
    }
  }

  return '';
}

/**
 * 이미지 URL 추출
 */
async function extractImageUrls(
  page: Page,
  selectors: string | string[]
): Promise<string[]> {
  const selectorList = Array.isArray(selectors) ? selectors : [selectors];
  const allImages: string[] = [];

  for (const selector of selectorList) {
    try {
      const images = await page.$$eval(selector, (elements) =>
        elements
          .map((el) => {
            // img 태그인 경우
            if (el.tagName === 'IMG') {
              return (
                el.getAttribute('src') ||
                el.getAttribute('data-src') ||
                el.getAttribute('data-lazy-src') ||
                el.getAttribute('data-original')
              );
            }
            // 배경 이미지가 있는 경우
            const style = window.getComputedStyle(el);
            const bgImage = style.backgroundImage;
            if (bgImage && bgImage !== 'none') {
              const match = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
              if (match) return match[1];
            }
            return null;
          })
          .filter((url): url is string => url !== null && url !== '')
      );
      allImages.push(...images);
    } catch {
      continue;
    }
  }

  // 중복 제거
  return Array.from(new Set(allImages));
}

/**
 * 가격 문자열에서 숫자 추출
 */
function parsePrice(priceText: string): { price: number | null; original: string | null } {
  if (!priceText) return { price: null, original: null };

  // 원본 저장
  const original = priceText.trim();

  // 숫자와 콤마만 추출
  const match = priceText.match(/[\d,]+/);
  if (match) {
    const numStr = match[0].replace(/,/g, '');
    const num = parseInt(numStr, 10);
    if (!isNaN(num) && num > 0) {
      return { price: num, original };
    }
  }

  return { price: null, original };
}

/**
 * 성분 텍스트 파싱
 */
function parseIngredients(text: string): string[] {
  if (!text) return [];

  // 일반적인 구분자로 분리
  const separators = /[,，、\/\|]/;
  const parts = text.split(separators).map((s) => s.trim()).filter(Boolean);

  // 너무 긴 항목은 문장일 가능성이 높음
  return parts.filter((part) => part.length < 100);
}

/**
 * 범용 상품 정보 추출
 */
export async function extractGenericProduct(page: Page): Promise<{
  name: string;
  price: number | null;
  priceOriginal: string | null;
  description: string;
  ingredients: string[];
  imageUrls: string[];
}> {
  const config = genericConfig;

  // 상품명 추출 - 스마트 추출
  let name = await extractProductName(page);

  // 실패시 기존 방식 시도
  if (!name) {
    name = await extractTextFromSelectors(page, config.selectors.productName);
  }

  // 가격 추출
  const priceText = await extractTextFromSelectors(page, config.selectors.price);
  const { price, original: priceOriginal } = parsePrice(priceText);

  // 설명 추출
  const description = await extractTextFromSelectors(page, config.selectors.description);

  // 성분 추출
  const ingredientsText = await extractTextFromSelectors(
    page,
    config.selectors.ingredients || []
  );
  const ingredients = parseIngredients(ingredientsText);

  // 이미지 추출
  const productImages = await extractImageUrls(page, config.selectors.images);
  const detailImages = await extractImageUrls(
    page,
    config.selectors.detailImages || []
  );

  // 이미지 합치기 (중복 제거)
  const imageUrls = Array.from(new Set([...productImages, ...detailImages]));

  return {
    name: name || '상품명 없음',
    price,
    priceOriginal,
    description: description || '',
    ingredients,
    imageUrls,
  };
}

/**
 * 스마트 상품명 추출
 */
async function extractProductName(page: Page): Promise<string> {
  return page.evaluate(() => {
    // 1. og:title 메타 태그 (가장 신뢰도 높음)
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      const content = ogTitle.getAttribute('content');
      if (content && content.length > 2 && content.length < 200) {
        // 사이트명 분리 (예: "상품명 | 사이트명" 또는 "상품명 - 사이트명")
        const separators = ['|', ' - ', ' :: ', ' · '];
        for (const sep of separators) {
          if (content.includes(sep)) {
            const part = content.split(sep)[0].trim();
            if (part.length > 2) return part;
          }
        }
        return content.trim();
      }
    }

    // 2. Cafe24/한국 쇼핑몰 특화 셀렉터
    const koreanSelectors = [
      '.headingArea h2',
      '.xans-product-detail .name',
      '#prdDetail .name',
      '.detailArea .name',
      '.product_name',
      '.prd_name',
      '.goods_name',
      '.item_name',
      '[class*="productName"]',
      '[class*="product_name"]',
      '[class*="prdName"]',
      '[class*="prd_name"]',
    ];

    for (const sel of koreanSelectors) {
      try {
        const el = document.querySelector(sel);
        if (el) {
          const text = el.textContent?.trim();
          if (text && text.length > 2 && text.length < 200 && !isAdminText(text)) {
            return text;
          }
        }
      } catch {
        // 무시
      }
    }

    // 3. h1 태그 (보이는 것만)
    const h1s = document.querySelectorAll('h1');
    for (const h1 of h1s) {
      const style = window.getComputedStyle(h1);
      if (style.display !== 'none' && style.visibility !== 'hidden') {
        const text = h1.textContent?.trim();
        if (text && text.length > 2 && text.length < 200 && !isAdminText(text)) {
          return text;
        }
      }
    }

    // 4. title 태그
    const title = document.title;
    if (title && title.length > 2) {
      const separators = ['|', ' - ', ' :: ', ' · '];
      for (const sep of separators) {
        if (title.includes(sep)) {
          const part = title.split(sep)[0].trim();
          if (part.length > 2 && !isAdminText(part)) return part;
        }
      }
    }

    return '';

    // 관리자/시스템 텍스트 필터링
    function isAdminText(text: string): boolean {
      const adminPatterns = [
        '메인', '관리', 'admin', 'edit', '수정', '삭제',
        '로그인', '회원', 'login', 'member', '장바구니',
        '검색', 'search', 'menu', '메뉴', 'nav', 'footer',
        'header', 'sidebar', '배너', 'banner'
      ];
      const lowerText = text.toLowerCase();
      return adminPatterns.some(pattern => lowerText.includes(pattern));
    }
  });
}

/**
 * 페이지에서 OG 태그 기반 기본 정보 추출
 */
export async function extractOGData(page: Page): Promise<{
  title: string;
  description: string;
  image: string;
}> {
  return page.evaluate(() => {
    const getMetaContent = (property: string): string => {
      const el = document.querySelector(`meta[property="${property}"]`);
      return el?.getAttribute('content') || '';
    };

    return {
      title: getMetaContent('og:title') || document.title || '',
      description:
        getMetaContent('og:description') ||
        document.querySelector('meta[name="description"]')?.getAttribute('content') ||
        '',
      image: getMetaContent('og:image') || '',
    };
  });
}

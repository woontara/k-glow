// 이니스프리 상품 정보 추출
import { Page } from 'puppeteer';
import { SiteConfig } from '@/types/product-rebuild';

// 이니스프리 설정
export const innisfreeConfig: SiteConfig = {
  name: 'innisfree',
  hostPatterns: ['innisfree.com'],
  contentSelector: '.product-detail, .prd-detail, #content',
  waitForSelector: '.prd-info, .product-info, .prd-name',
  selectors: {
    productName: [
      '.prd-info .tit',
      '.prd-info h2',
      '.product-name',
      'h1.product-title',
    ],
    price: [
      '.prd-info .price .num',
      '.prd-info .sale-price',
      '.price-info .price',
      '.final-price',
    ],
    description: [
      '.prd-info .desc',
      '.product-description',
      '.detail-info',
    ],
    images: [
      '.prd-img img',
      '.product-image img',
      '.main-image img',
      '.thumbnail-list img',
    ],
    ingredients: [
      '.ingredients-list',
      '.product-ingredients',
      '[class*="ingredient"]',
    ],
    detailImages: [
      '.detail-content img',
      '.product-detail-content img',
      '.editor-content img',
    ],
  },
  scrollConfig: {
    scrollDelay: 500,
    maxScrolls: 20,
  },
};

/**
 * 이니스프리 상품 정보 추출
 */
export async function extractInnisfreeProduct(page: Page): Promise<{
  name: string;
  price: number | null;
  priceOriginal: string | null;
  description: string;
  ingredients: string[];
  imageUrls: string[];
}> {
  console.log('[Innisfree] 상품 정보 추출 시작');

  // 팝업 닫기 시도
  await closePopups(page);

  // 페이지가 완전히 로드되도록 대기
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 다양한 셀렉터로 페이지 로딩 대기 시도
  const waitSelectors = [
    '.prd-info',
    '.product-detail',
    '.prd-name',
    '.product-name',
    '[class*="product"][class*="name"]',
    '[class*="prd"][class*="tit"]',
  ];

  for (const selector of waitSelectors) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      console.log(`[Innisfree] 셀렉터 발견: ${selector}`);
      break;
    } catch {
      // 다음 셀렉터 시도
    }
  }

  // 추가 팝업 닫기
  await closePopups(page);

  // 페이지 구조 디버깅 - 어떤 요소들이 있는지 확인
  const pageStructure = await page.evaluate(() => {
    const result: { [key: string]: number } = {};

    // 주요 클래스 패턴 검색
    const patterns = ['prd', 'product', 'detail', 'name', 'price', 'desc', 'info'];

    patterns.forEach(pattern => {
      const elements = document.querySelectorAll(`[class*="${pattern}"]`);
      result[pattern] = elements.length;
    });

    // h1, h2 태그 수
    result['h1'] = document.querySelectorAll('h1').length;
    result['h2'] = document.querySelectorAll('h2').length;

    return result;
  });

  console.log('[Innisfree] 페이지 구조:', pageStructure);

  // 상품 정보 추출 - 더 넓은 범위의 셀렉터 사용
  const productData = await page.evaluate(() => {
    // 상품명 추출 - 매우 광범위한 셀렉터 시도
    const nameSelectors = [
      // 이니스프리 특화
      '.prd-info .tit',
      '.prd-name',
      '.prd-tit',
      '.product-name',
      '.product-title',
      // 일반적인 패턴
      'h1',
      'h2.tit',
      '[class*="product-name"]',
      '[class*="product-title"]',
      '[class*="prd-name"]',
      '[class*="prd-tit"]',
      '[class*="goods-name"]',
      '[class*="item-name"]',
      // 메타 태그
      'meta[property="og:title"]',
    ];

    let name = '';
    for (const sel of nameSelectors) {
      try {
        if (sel.startsWith('meta')) {
          const meta = document.querySelector(sel);
          if (meta) {
            const content = meta.getAttribute('content') || '';
            // "상품명 | 이니스프리" 형태에서 상품명만 추출
            if (content && !content.includes('공식 홈페이지')) {
              const parts = content.split('|');
              name = parts[0].trim();
              if (name) break;
            }
          }
        } else {
          const el = document.querySelector(sel);
          if (el && el.textContent) {
            const text = el.textContent.trim();
            // 유효한 상품명인지 확인
            if (text &&
                text.length > 2 &&
                text.length < 200 &&
                !text.includes('공식 홈페이지') &&
                !text.includes('오늘 그만') &&
                !text.includes('닫기')) {
              name = text;
              break;
            }
          }
        }
      } catch {
        // 무시
      }
    }

    // 가격 추출
    const priceSelectors = [
      '.prd-info .price .num',
      '.prd-info .sale-price',
      '.price .num',
      '.sale-price',
      '.final-price',
      '[class*="price"] .num',
      '[class*="price"][class*="sale"]',
      '[class*="price"]:not([class*="origin"]):not([class*="regular"])',
    ];

    let priceOriginal = '';
    for (const sel of priceSelectors) {
      try {
        const el = document.querySelector(sel);
        if (el && el.textContent) {
          const text = el.textContent.trim();
          if (text && /\d{1,3}(,\d{3})*/.test(text)) {
            priceOriginal = text;
            break;
          }
        }
      } catch {
        // 무시
      }
    }

    // 설명 추출
    const descSelectors = [
      '.prd-info .desc',
      '.prd-desc',
      '.product-desc',
      '.product-description',
      '[class*="product"][class*="desc"]',
      '[class*="prd"][class*="desc"]',
    ];

    let description = '';
    for (const sel of descSelectors) {
      try {
        const el = document.querySelector(sel);
        if (el && el.textContent) {
          const text = el.textContent.trim();
          if (text && text.length > 10 && text.length < 5000) {
            description = text;
            break;
          }
        }
      } catch {
        // 무시
      }
    }

    // 이미지 추출 - 상품 이미지만 필터링
    const imageSelectors = [
      '.prd-img img',
      '.product-image img',
      '.main-image img',
      '.prd-detail img',
      '[class*="product"][class*="img"] img',
      '[class*="prd"][class*="img"] img',
      '[class*="detail"] img',
      '.swiper-slide img',
      '.slick-slide img',
    ];

    const images: string[] = [];
    const seenUrls = new Set<string>();

    for (const sel of imageSelectors) {
      try {
        const els = document.querySelectorAll(sel);
        els.forEach((el) => {
          const src = el.getAttribute('src') ||
                      el.getAttribute('data-src') ||
                      el.getAttribute('data-lazy') ||
                      el.getAttribute('data-original');
          if (src &&
              !seenUrls.has(src) &&
              !src.includes('blank') &&
              !src.includes('loading') &&
              !src.includes('icon') &&
              !src.includes('logo') &&
              (src.includes('product') || src.includes('prd') || src.includes('detail'))) {
            seenUrls.add(src);
            images.push(src);
          }
        });
      } catch {
        // 무시
      }
    }

    // 모든 이미지도 수집 (상품 관련)
    if (images.length === 0) {
      const allImgs = document.querySelectorAll('img');
      allImgs.forEach((el) => {
        const src = el.getAttribute('src') ||
                    el.getAttribute('data-src');
        if (src &&
            !seenUrls.has(src) &&
            (src.includes('cdn.innisfree') || src.includes('inm-cdn')) &&
            !src.includes('icon') &&
            !src.includes('logo') &&
            !src.includes('banner') &&
            !src.includes('menu')) {
          seenUrls.add(src);
          images.push(src);
        }
      });
    }

    // 성분 추출
    let ingredientsText = '';
    const ingredientSelectors = [
      '.ingredients',
      '[class*="ingredient"]',
      '[class*="component"]',
    ];

    for (const sel of ingredientSelectors) {
      try {
        const el = document.querySelector(sel);
        if (el && el.textContent) {
          ingredientsText = el.textContent.trim();
          break;
        }
      } catch {
        // 무시
      }
    }

    // 현재 URL 확인
    const currentUrl = window.location.href;

    return {
      name,
      priceOriginal,
      description,
      images,
      ingredientsText,
      currentUrl,
    };
  });

  console.log('[Innisfree] 현재 URL:', productData.currentUrl);

  // 가격 파싱
  let price: number | null = null;
  if (productData.priceOriginal) {
    const match = productData.priceOriginal.match(/[\d,]+/);
    if (match) {
      const numStr = match[0].replace(/,/g, '');
      const num = parseInt(numStr, 10);
      if (!isNaN(num) && num > 0) {
        price = num;
      }
    }
  }

  // 성분 파싱
  const ingredients: string[] = [];
  if (productData.ingredientsText) {
    const parts = productData.ingredientsText.split(/[,，、\/\|]/).map(s => s.trim()).filter(Boolean);
    ingredients.push(...parts.filter(p => p.length < 100));
  }

  console.log('[Innisfree] 추출 결과:', {
    name: productData.name,
    price,
    imagesCount: productData.images.length,
  });

  return {
    name: productData.name || '상품명 없음',
    price,
    priceOriginal: productData.priceOriginal || null,
    description: productData.description || '',
    ingredients,
    imageUrls: productData.images,
  };
}

/**
 * 팝업 닫기
 */
async function closePopups(page: Page): Promise<void> {
  try {
    // ESC 키 누르기
    await page.keyboard.press('Escape');
    await new Promise(resolve => setTimeout(resolve, 500));

    // 일반적인 팝업 닫기 버튼들
    const closeSelectors = [
      'button.close',
      '.popup-close',
      '.modal-close',
      '.close-btn',
      '.btn-close',
      '[class*="popup"] [class*="close"]',
      '[class*="modal"] [class*="close"]',
      'button[aria-label="닫기"]',
      'button[aria-label="Close"]',
      // 이니스프리 특화
      '.layer-close',
      '.pop-close',
    ];

    for (const selector of closeSelectors) {
      try {
        const buttons = await page.$$(selector);
        for (const btn of buttons) {
          try {
            await btn.click();
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch {
            // 무시
          }
        }
      } catch {
        // 무시
      }
    }

    // "오늘 그만 보기" 버튼 클릭
    try {
      const todayClose = await page.$('[class*="today"][class*="close"], [class*="nomore"], .today-close');
      if (todayClose) {
        await todayClose.click();
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch {
      // 무시
    }
  } catch {
    // 팝업 처리 실패해도 계속 진행
  }
}

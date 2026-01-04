// 네이버 쇼핑/스마트스토어 상품 정보 추출
import { Page } from 'puppeteer';
import { SiteConfig } from '@/types/product-rebuild';

export const naverConfig: SiteConfig = {
  name: 'naver',
  hostPatterns: [
    'smartstore.naver.com',
    'shopping.naver.com',
    'brand.naver.com',
    'shop.naver.com',
  ],
  contentSelector: '._3o5gn, .product_info, #content',
  selectors: {
    productName: [
      '._3oDef',
      '._2tLuX',
      '.product_title',
      'h3._22kNQuEXmb',
      'meta[property="og:title"]',
    ],
    price: [
      '._1LY7D',
      '._3bqKH',
      '.price_area ._1LY7D',
      '._2jIlW',
      'meta[property="product:price:amount"]',
    ],
    description: [
      '.se-main-container',
      '._1eDO7',
      '.product_detail_area',
      '.se-component-content',
      'meta[property="og:description"]',
    ],
    images: [
      '._25CKx img',
      '.product_thumb img',
      '.se-image-resource',
      '._3yHSX img',
    ],
    ingredients: [
      '.se-text-paragraph',
      '[class*="ingredient"]',
    ],
    detailImages: [
      '.se-main-container img',
      '.product_detail_area img',
      '.se-image-resource',
    ],
  },
  scrollConfig: {
    scrollDelay: 300,
    maxScrolls: 30,
  },
  waitForSelector: '._3oDef, .product_title, h3',
};

/**
 * 네이버 전용 상품 정보 추출
 */
export async function extractNaverProduct(page: Page): Promise<{
  name: string;
  price: number | null;
  priceOriginal: string | null;
  description: string;
  ingredients: string[];
  imageUrls: string[];
}> {
  return page.evaluate(() => {
    // 상품명 (여러 셀렉터 시도)
    let name = '';
    const nameSelectors = ['._3oDef', '._22kNQuEXmb', '.product_title h3', 'h3'];
    for (const sel of nameSelectors) {
      const el = document.querySelector(sel);
      if (el?.textContent?.trim()) {
        name = el.textContent.trim();
        break;
      }
    }
    if (!name) {
      name = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '상품명 없음';
    }

    // 가격
    let price: number | null = null;
    let priceOriginal: string | null = null;
    const priceSelectors = ['._1LY7D', '._3bqKH', '._2jIlW', '.price_area strong'];
    for (const sel of priceSelectors) {
      const el = document.querySelector(sel);
      const text = el?.textContent || '';
      const match = text.match(/[\d,]+/);
      if (match) {
        price = parseInt(match[0].replace(/,/g, ''), 10);
        priceOriginal = text.trim();
        break;
      }
    }

    // 설명 (스마트에디터 컨텐츠)
    let description = '';
    const descSelectors = ['.se-main-container', '._1eDO7', '.product_detail_area'];
    for (const sel of descSelectors) {
      const el = document.querySelector(sel);
      if (el?.textContent?.trim()) {
        description = el.textContent.substring(0, 2000).trim();
        break;
      }
    }

    // 이미지
    const images: string[] = [];

    // 메인 썸네일
    const thumbSelectors = ['._25CKx img', '.product_thumb img', '._3yHSX img'];
    for (const sel of thumbSelectors) {
      document.querySelectorAll(sel).forEach((img) => {
        const src = img.getAttribute('src') || img.getAttribute('data-src');
        if (src && !images.includes(src)) {
          images.push(src);
        }
      });
    }

    // 상세 이미지 (스마트에디터)
    document.querySelectorAll('.se-image-resource, .se-main-container img').forEach((img) => {
      const src = img.getAttribute('src') || img.getAttribute('data-src');
      if (src && !images.includes(src)) {
        images.push(src);
      }
    });

    // 성분 (텍스트에서 추출)
    const ingredients: string[] = [];
    document.querySelectorAll('.se-text-paragraph').forEach((p) => {
      const text = p.textContent || '';
      if (text.includes('성분') || text.includes('전성분')) {
        const parts = text.split(/[,，、]/).map((s) => s.trim()).filter(Boolean);
        ingredients.push(...parts.slice(0, 20));
      }
    });

    return {
      name,
      price,
      priceOriginal,
      description,
      ingredients: ingredients.slice(0, 50),
      imageUrls: images.slice(0, 30),
    };
  });
}

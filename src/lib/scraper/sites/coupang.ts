// 쿠팡 상품 정보 추출
import { Page } from 'puppeteer';
import { SiteConfig } from '@/types/product-rebuild';

export const coupangConfig: SiteConfig = {
  name: 'coupang',
  hostPatterns: ['coupang.com', 'www.coupang.com'],
  contentSelector: '.prod-buy-header, .product-detail',
  selectors: {
    productName: [
      '.prod-buy-header__title',
      'h1.prod-buy-header__title',
      'meta[property="og:title"]',
    ],
    price: [
      '.total-price strong',
      '.prod-price .total-price',
      '.prod-sale-price .total-price',
      'meta[property="product:price:amount"]',
    ],
    description: [
      '.product-detail-content',
      '.product-detail-content-inside',
      '#productDetail',
      'meta[property="og:description"]',
    ],
    images: [
      '.prod-image__detail img',
      '.prod-image img',
      '.gallery__image img',
      '.product-detail-content img',
    ],
    ingredients: [
      '.product-detail-content table',
      '[class*="ingredient"]',
    ],
    detailImages: [
      '.product-detail-content img',
      '#productDetail img',
    ],
  },
  scrollConfig: {
    scrollDelay: 300,
    maxScrolls: 25,
  },
  waitForSelector: '.prod-buy-header__title',
};

/**
 * 쿠팡 전용 상품 정보 추출
 */
export async function extractCoupangProduct(page: Page): Promise<{
  name: string;
  price: number | null;
  priceOriginal: string | null;
  description: string;
  ingredients: string[];
  imageUrls: string[];
}> {
  return page.evaluate(() => {
    // 상품명
    const nameEl = document.querySelector('.prod-buy-header__title');
    const name = nameEl?.textContent?.trim() ||
      document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      '상품명 없음';

    // 가격
    const priceEl = document.querySelector('.total-price strong');
    const priceText = priceEl?.textContent || '';
    const priceMatch = priceText.match(/[\d,]+/);
    const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, ''), 10) : null;
    const priceOriginal = priceText.trim() || null;

    // 설명
    const descEl = document.querySelector('.product-detail-content');
    const description = descEl?.textContent?.substring(0, 2000).trim() || '';

    // 이미지
    const images: string[] = [];

    // 메인 이미지
    const mainImg = document.querySelector('.prod-image__detail img, .prod-image img');
    if (mainImg) {
      const src = mainImg.getAttribute('src') || mainImg.getAttribute('data-src');
      if (src) images.push(src);
    }

    // 상세 이미지
    document.querySelectorAll('.product-detail-content img').forEach((img) => {
      const src = img.getAttribute('src') || img.getAttribute('data-src');
      if (src && !images.includes(src)) {
        images.push(src);
      }
    });

    // 성분 (테이블에서 추출)
    const ingredients: string[] = [];
    document.querySelectorAll('.product-detail-content table tr').forEach((row) => {
      const th = row.querySelector('th')?.textContent || '';
      const td = row.querySelector('td')?.textContent || '';
      if (th.includes('성분') || th.includes('원재료')) {
        ingredients.push(...td.split(',').map((s) => s.trim()).filter(Boolean));
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

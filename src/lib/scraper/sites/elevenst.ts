// 11번가 상품 정보 추출
import { Page } from 'puppeteer';
import { SiteConfig } from '@/types/product-rebuild';

export const elevenstConfig: SiteConfig = {
  name: '11st',
  hostPatterns: ['11st.co.kr', 'www.11st.co.kr'],
  contentSelector: '.c_product_info, #productInfoDetail',
  selectors: {
    productName: [
      '.c_product_info_title h2',
      '.product_title',
      'h1.title',
      'meta[property="og:title"]',
    ],
    price: [
      '.price_detail .final_price',
      '.price_info .sale_price',
      '.c_prd_price .price',
      'meta[property="product:price:amount"]',
    ],
    description: [
      '#productDetailInfoTab',
      '.product_detail_info',
      '.prd_detail_box',
      'meta[property="og:description"]',
    ],
    images: [
      '.basic_img img',
      '.c_product_view_img img',
      '.thumb_gallery img',
      '#prdDetailBoxImg img',
    ],
    ingredients: [
      '.product_spec_list',
      '[class*="ingredient"]',
    ],
    detailImages: [
      '#prdDetailBoxImg img',
      '.product_detail_info img',
      '.prd_detail_box img',
    ],
  },
  scrollConfig: {
    scrollDelay: 300,
    maxScrolls: 25,
  },
  waitForSelector: '.c_product_info_title, .product_title',
};

/**
 * 11번가 전용 상품 정보 추출
 */
export async function extractElevenstProduct(page: Page): Promise<{
  name: string;
  price: number | null;
  priceOriginal: string | null;
  description: string;
  ingredients: string[];
  imageUrls: string[];
}> {
  return page.evaluate(() => {
    // 상품명
    let name = '';
    const nameSelectors = ['.c_product_info_title h2', '.product_title', 'h1.title'];
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
    const priceSelectors = ['.final_price', '.sale_price', '.c_prd_price .price'];
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

    // 설명
    let description = '';
    const descSelectors = ['#productDetailInfoTab', '.product_detail_info', '.prd_detail_box'];
    for (const sel of descSelectors) {
      const el = document.querySelector(sel);
      if (el?.textContent?.trim()) {
        description = el.textContent.substring(0, 2000).trim();
        break;
      }
    }

    // 이미지
    const images: string[] = [];

    // 메인 이미지
    const mainSelectors = ['.basic_img img', '.c_product_view_img img', '.thumb_gallery img'];
    for (const sel of mainSelectors) {
      document.querySelectorAll(sel).forEach((img) => {
        const src = img.getAttribute('src') || img.getAttribute('data-src');
        if (src && !images.includes(src)) {
          images.push(src);
        }
      });
    }

    // 상세 이미지
    document.querySelectorAll('#prdDetailBoxImg img, .prd_detail_box img').forEach((img) => {
      const src = img.getAttribute('src') || img.getAttribute('data-src');
      if (src && !images.includes(src)) {
        images.push(src);
      }
    });

    // 성분 (스펙 목록에서)
    const ingredients: string[] = [];
    document.querySelectorAll('.product_spec_list li, .spec_list li').forEach((li) => {
      const text = li.textContent || '';
      if (text.includes('성분') || text.includes('원재료')) {
        const parts = text.split(':').slice(1).join(':');
        ingredients.push(...parts.split(',').map((s) => s.trim()).filter(Boolean));
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

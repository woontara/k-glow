// 웹 크롤링 유틸리티
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface CrawledPage {
  url: string;
  title: string;
  content: string;
  images: string[];
  links: string[];
}

export interface ProductInfo {
  name: string;
  price?: string;
  description: string;
  images: string[];
  ingredients?: string[];
  category?: string;
}

/**
 * 단일 페이지 크롤링
 */
export async function crawlPage(url: string): Promise<CrawledPage> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 30000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 페이지 제목
    const title = $('title').text() || $('h1').first().text() || '';

    // 본문 텍스트 추출
    $('script, style, nav, footer, header').remove();
    const content = $('body').text().replace(/\s+/g, ' ').trim();

    // 이미지 URL 추출
    const images: string[] = [];
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        images.push(makeAbsoluteUrl(src, url));
      }
    });

    // 링크 추출
    const links: string[] = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        links.push(makeAbsoluteUrl(href, url));
      }
    });

    return {
      url,
      title,
      content: content.substring(0, 10000), // 최대 10,000자
      images: Array.from(new Set(images)), // 중복 제거
      links: Array.from(new Set(links)).filter((link) => isSameDomain(link, url)),
    };
  } catch (error) {
    console.error(`페이지 크롤링 실패 (${url}):`, error);
    throw new Error(`페이지 크롤링 실패: ${url}`);
  }
}

/**
 * 제품 페이지에서 정보 추출
 */
export function extractProductInfo(page: CrawledPage): ProductInfo {
  const $ = cheerio.load(page.content);

  // 제품명 추출 (h1 또는 title)
  let name = $('h1').first().text().trim();
  if (!name) {
    name = page.title;
  }

  // 가격 추출 (원, KRW, won 포함 텍스트)
  let price: string | undefined;
  const pricePatterns = [
    /₩[\d,]+/,
    /[\d,]+원/,
    /[\d,]+\s*KRW/i,
    /price[:\s]*[\d,]+/i,
  ];

  for (const pattern of pricePatterns) {
    const match = page.content.match(pattern);
    if (match) {
      price = match[0];
      break;
    }
  }

  // 설명 추출 (meta description 또는 첫 p 태그)
  let description = $('meta[name="description"]').attr('content') || '';
  if (!description) {
    description = $('p').first().text().trim();
  }

  // 성분 추출 (ingredients 키워드 포함)
  const ingredients: string[] = [];
  const ingredientSection = page.content.match(/성분|ingredients?[:\s]*(.*?)(?:\n|$)/i);
  if (ingredientSection) {
    const ingredientText = ingredientSection[1];
    ingredients.push(...ingredientText.split(/[,、]/).map((s) => s.trim()));
  }

  // 카테고리 추출
  let category: string | undefined;
  const categoryMatch = page.content.match(/카테고리|category[:\s]*([^\n]+)/i);
  if (categoryMatch) {
    category = categoryMatch[1].trim();
  }

  return {
    name,
    price,
    description,
    images: page.images.slice(0, 10), // 최대 10개
    ingredients: ingredients.filter((i) => i.length > 0),
    category,
  };
}

/**
 * 웹사이트 전체 크롤링 (BFS 방식)
 */
export async function crawlWebsite(
  startUrl: string,
  maxPages: number = 20,
  maxDepth: number = 3
): Promise<CrawledPage[]> {
  const visited = new Set<string>();
  const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];
  const results: CrawledPage[] = [];

  while (queue.length > 0 && results.length < maxPages) {
    const { url, depth } = queue.shift()!;

    // 이미 방문했거나 깊이 초과
    if (visited.has(url) || depth > maxDepth) {
      continue;
    }

    visited.add(url);

    try {
      console.log(`크롤링 중: ${url} (깊이: ${depth})`);
      const page = await crawlPage(url);
      results.push(page);

      // 다음 레벨 링크 추가
      if (depth < maxDepth) {
        for (const link of page.links) {
          if (!visited.has(link)) {
            queue.push({ url: link, depth: depth + 1 });
          }
        }
      }

      // Rate limiting (1초 대기)
      await sleep(1000);
    } catch (error) {
      console.error(`크롤링 실패: ${url}`, error);
    }
  }

  return results;
}

/**
 * 제품 페이지 필터링
 * 제품 관련 키워드가 포함된 페이지만 선택
 */
export function filterProductPages(pages: CrawledPage[]): CrawledPage[] {
  const productKeywords = [
    'product',
    'item',
    '제품',
    '상품',
    'shop',
    'detail',
    '크림',
    '세럼',
    '토너',
    '클렌저',
    '마스크',
  ];

  return pages.filter((page) => {
    const urlLower = page.url.toLowerCase();
    const titleLower = page.title.toLowerCase();
    const contentLower = page.content.toLowerCase();

    return productKeywords.some(
      (keyword) =>
        urlLower.includes(keyword.toLowerCase()) ||
        titleLower.includes(keyword.toLowerCase()) ||
        contentLower.includes(keyword.toLowerCase())
    );
  });
}

// ===== 유틸리티 함수 =====

function makeAbsoluteUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

function isSameDomain(url1: string, url2: string): boolean {
  try {
    const domain1 = new URL(url1).hostname;
    const domain2 = new URL(url2).hostname;
    return domain1 === domain2;
  } catch {
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

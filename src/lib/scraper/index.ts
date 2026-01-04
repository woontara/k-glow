// Puppeteer 기반 상품 스크래퍼 메인 모듈
import puppeteer, { Browser, Page } from 'puppeteer';
import {
  ScrapeOptions,
  ScrapedProduct,
  SiteType,
  SiteConfig,
} from '@/types/product-rebuild';
import { captureFullPageScreenshot } from './utils/screenshot';
import { downloadImages } from './utils/image-downloader';
import { coupangConfig, extractCoupangProduct } from './sites/coupang';
import { naverConfig, extractNaverProduct } from './sites/naver';
import { elevenstConfig, extractElevenstProduct } from './sites/elevenst';
import { innisfreeConfig, extractInnisfreeProduct } from './sites/innisfree';
import { genericConfig, extractGenericProduct } from './sites/generic';

// 사이트 설정 목록
const siteConfigs: SiteConfig[] = [coupangConfig, naverConfig, elevenstConfig, innisfreeConfig];

/**
 * URL에서 사이트 타입 감지
 */
export function detectSite(url: string): SiteType {
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    for (const config of siteConfigs) {
      for (const pattern of config.hostPatterns) {
        if (hostname.includes(pattern)) {
          return config.name;
        }
      }
    }
  } catch {
    // URL 파싱 실패
  }

  return 'generic';
}

/**
 * 사이트 타입에 맞는 설정 가져오기
 */
function getSiteConfig(siteType: SiteType): SiteConfig {
  const configMap: Record<SiteType, SiteConfig> = {
    coupang: coupangConfig,
    naver: naverConfig,
    '11st': elevenstConfig,
    innisfree: innisfreeConfig,
    generic: genericConfig,
  };

  return configMap[siteType] || genericConfig;
}

/**
 * 사이트별 추출 함수 실행
 */
async function extractBySite(
  page: Page,
  siteType: SiteType
): Promise<{
  name: string;
  price: number | null;
  priceOriginal: string | null;
  description: string;
  ingredients: string[];
  imageUrls: string[];
}> {
  switch (siteType) {
    case 'coupang':
      return extractCoupangProduct(page);
    case 'naver':
      return extractNaverProduct(page);
    case '11st':
      return extractElevenstProduct(page);
    case 'innisfree':
      return extractInnisfreeProduct(page);
    default:
      return extractGenericProduct(page);
  }
}

/**
 * 페이지 자동 스크롤 (lazy-load 이미지 로딩)
 */
async function autoScroll(page: Page, config: SiteConfig): Promise<void> {
  const scrollDelay = config.scrollConfig?.scrollDelay || 300;
  const maxScrolls = config.scrollConfig?.maxScrolls || 20;

  await page.evaluate(
    async (delay: number, max: number) => {
      await new Promise<void>((resolve) => {
        let scrollCount = 0;
        const distance = 500;

        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          scrollCount++;

          if (
            window.innerHeight + window.scrollY >= scrollHeight ||
            scrollCount >= max
          ) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            resolve();
          }
        }, delay);
      });
    },
    scrollDelay,
    maxScrolls
  );
}

/**
 * 메인 스크래핑 함수
 */
export async function scrapeProduct(
  url: string,
  options: Partial<ScrapeOptions> = {}
): Promise<ScrapedProduct> {
  const opts: ScrapeOptions = {
    captureScreenshot: options.captureScreenshot ?? true,
    downloadImages: options.downloadImages ?? true,
    timeout: options.timeout ?? 60000,
  };

  // 사이트 감지
  const siteType = detectSite(url);
  const siteConfig = getSiteConfig(siteType);

  console.log(`[Scraper] 스크래핑 시작: ${url}`);
  console.log(`[Scraper] 감지된 사이트: ${siteType}`);

  let browser: Browser | null = null;

  try {
    // Puppeteer 브라우저 실행
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });

    const page = await browser.newPage();

    // 뷰포트 설정
    await page.setViewport({ width: 1280, height: 800 });

    // User-Agent 설정 (봇 감지 우회)
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // 추가 헤더 설정
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    });

    // 페이지 이동
    console.log(`[Scraper] 페이지 로딩 중...`);
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: opts.timeout,
    });

    // 동적 콘텐츠 대기
    if (siteConfig.waitForSelector) {
      try {
        await page.waitForSelector(siteConfig.waitForSelector, {
          timeout: 10000,
        });
      } catch {
        console.log(`[Scraper] 셀렉터 대기 타임아웃, 계속 진행...`);
      }
    }

    // 자동 스크롤 (lazy-load 이미지 로딩)
    console.log(`[Scraper] 페이지 스크롤 중...`);
    await autoScroll(page, siteConfig);

    // 추가 대기 (이미지 로딩)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 상품 정보 추출
    console.log(`[Scraper] 상품 정보 추출 중...`);
    const productData = await extractBySite(page, siteType);

    // 스크린샷 캡처
    let screenshotPath: string | null = null;
    if (opts.captureScreenshot) {
      console.log(`[Scraper] 스크린샷 캡처 중...`);
      screenshotPath = await captureFullPageScreenshot(page, url);
    }

    // 이미지 다운로드
    let localImagePaths: string[] = [];
    let originalImageUrls: string[] = productData.imageUrls;

    if (opts.downloadImages && productData.imageUrls.length > 0) {
      console.log(`[Scraper] 이미지 다운로드 중... (${productData.imageUrls.length}개)`);
      const downloadResult = await downloadImages(productData.imageUrls, url);
      localImagePaths = downloadResult.localPaths;
      originalImageUrls = downloadResult.originalUrls;
    }

    console.log(`[Scraper] 스크래핑 완료!`);

    return {
      name: productData.name,
      price: productData.price,
      priceOriginal: productData.priceOriginal,
      description: productData.description,
      ingredients: productData.ingredients,
      imageUrls: localImagePaths.length > 0 ? localImagePaths : originalImageUrls,
      originalImageUrls,
      screenshotPath,
      sourceSite: siteType,
    };
  } catch (error) {
    console.error(`[Scraper] 스크래핑 실패:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * URL 유효성 검사
 */
export function isValidProductUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // HTTP/HTTPS만 허용
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Re-export from constants for backward compatibility
export { SUPPORTED_SITES } from './constants';

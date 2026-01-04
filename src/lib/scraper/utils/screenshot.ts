// 전체 페이지 스크롤 스크린샷 유틸리티
import { Page } from 'puppeteer';
import path from 'path';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import crypto from 'crypto';

/**
 * URL을 해시하여 파일명으로 사용
 */
function hashUrl(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
}

/**
 * 페이지 자동 스크롤 (lazy-load 이미지 로딩용)
 */
async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const delay = 200;
      const maxHeight = 15000; // 최대 스크롤 높이 제한

      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight || totalHeight >= maxHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0); // 상단으로 복귀
          resolve();
        }
      }, delay);
    });
  });
}

/**
 * 모든 이미지 로딩 대기
 */
async function waitForImages(page: Page): Promise<void> {
  await page.evaluate(() => {
    return Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((resolve) => {
              img.onload = img.onerror = resolve;
              // 5초 타임아웃
              setTimeout(resolve, 5000);
            })
        )
    );
  });
}

/**
 * 전체 페이지 스크린샷 캡처
 */
export async function captureFullPageScreenshot(
  page: Page,
  sourceUrl: string
): Promise<string> {
  // 업로드 디렉토리 생성
  const uploadsDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'product-rebuild',
    'screenshots'
  );

  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  // 고유 파일명 생성
  const timestamp = Date.now();
  const urlHash = hashUrl(sourceUrl);
  const filename = `${timestamp}-${urlHash}.png`;
  const filepath = path.join(uploadsDir, filename);

  // 스크롤하여 lazy-load 이미지 로딩
  await autoScroll(page);

  // 잠시 대기 (추가 로딩)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 이미지 로딩 대기
  await waitForImages(page);

  // 전체 페이지 스크린샷
  await page.screenshot({
    path: filepath,
    fullPage: true,
    type: 'png',
  });

  return `/uploads/product-rebuild/screenshots/${filename}`;
}

/**
 * 상세 이미지 영역만 스크린샷 (선택적)
 */
export async function captureDetailSection(
  page: Page,
  selector: string,
  sourceUrl: string
): Promise<string | null> {
  try {
    const element = await page.$(selector);
    if (!element) {
      console.log(`[Screenshot] 셀렉터를 찾을 수 없음: ${selector}`);
      return null;
    }

    const uploadsDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'product-rebuild',
      'screenshots'
    );

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const urlHash = hashUrl(sourceUrl);
    const filename = `${timestamp}-${urlHash}-detail.png`;
    const filepath = path.join(uploadsDir, filename);

    await element.screenshot({
      path: filepath,
      type: 'png',
    });

    return `/uploads/product-rebuild/screenshots/${filename}`;
  } catch (error) {
    console.error('[Screenshot] 상세 섹션 캡처 실패:', error);
    return null;
  }
}

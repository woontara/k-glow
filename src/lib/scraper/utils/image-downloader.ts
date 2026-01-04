// 이미지 다운로드 유틸리티
import axios from 'axios';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const MAX_IMAGES = 20;
const DOWNLOAD_TIMEOUT = 30000;
const RATE_LIMIT_DELAY = 200;

/**
 * 상대 URL을 절대 URL로 변환
 */
function makeAbsoluteUrl(imageUrl: string, baseUrl: string): string {
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  if (imageUrl.startsWith('//')) {
    return `https:${imageUrl}`;
  }
  try {
    const base = new URL(baseUrl);
    if (imageUrl.startsWith('/')) {
      return `${base.origin}${imageUrl}`;
    }
    return new URL(imageUrl, baseUrl).href;
  } catch {
    return imageUrl;
  }
}

/**
 * Content-Type에서 확장자 추출
 */
function getExtensionFromContentType(contentType: string | undefined): string {
  if (!contentType) return 'jpg';

  const type = contentType.toLowerCase();
  if (type.includes('png')) return 'png';
  if (type.includes('gif')) return 'gif';
  if (type.includes('webp')) return 'webp';
  if (type.includes('svg')) return 'svg';
  if (type.includes('jpeg') || type.includes('jpg')) return 'jpg';
  return 'jpg';
}

/**
 * URL에서 확장자 추출
 */
function getExtensionFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    if (match) {
      const ext = match[1].toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
        return ext === 'jpeg' ? 'jpg' : ext;
      }
    }
  } catch {
    // URL 파싱 실패 시 무시
  }
  return null;
}

/**
 * sleep 함수
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 이미지 URL 필터링 (유효한 이미지만)
 */
function filterValidImageUrls(urls: string[]): string[] {
  return urls.filter((url) => {
    // 빈 URL 제외
    if (!url || url.trim() === '') return false;

    // data URI 제외 (너무 작은 이미지)
    if (url.startsWith('data:')) return false;

    // 트래킹 픽셀 등 제외
    if (url.includes('pixel') || url.includes('tracking') || url.includes('beacon')) {
      return false;
    }

    // 아이콘/로고 등 제외 (보통 작은 이미지)
    if (url.includes('icon') || url.includes('logo') || url.includes('favicon')) {
      return false;
    }

    return true;
  });
}

/**
 * 중복 URL 제거
 */
function deduplicateUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  return urls.filter((url) => {
    // 쿼리 파라미터 제거 후 비교
    const normalizedUrl = url.split('?')[0];
    if (seen.has(normalizedUrl)) return false;
    seen.add(normalizedUrl);
    return true;
  });
}

/**
 * 여러 이미지 다운로드
 */
export async function downloadImages(
  imageUrls: string[],
  sourceUrl: string
): Promise<{ localPaths: string[]; originalUrls: string[] }> {
  // 업로드 디렉토리 생성
  const uploadsDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'product-rebuild',
    'images'
  );

  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  // URL 필터링 및 중복 제거
  const filteredUrls = deduplicateUrls(filterValidImageUrls(imageUrls));
  const urlsToDownload = filteredUrls.slice(0, MAX_IMAGES);

  const timestamp = Date.now();
  const localPaths: string[] = [];
  const originalUrls: string[] = [];

  for (let i = 0; i < urlsToDownload.length; i++) {
    const imageUrl = urlsToDownload[i];

    try {
      const absoluteUrl = makeAbsoluteUrl(imageUrl, sourceUrl);

      const response = await axios.get(absoluteUrl, {
        responseType: 'arraybuffer',
        timeout: DOWNLOAD_TIMEOUT,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: sourceUrl,
          Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
        },
        maxRedirects: 5,
      });

      // 확장자 결정
      const contentType = response.headers['content-type'];
      const ext = getExtensionFromUrl(absoluteUrl) || getExtensionFromContentType(contentType);

      const filename = `${timestamp}-${i}.${ext}`;
      const filepath = path.join(uploadsDir, filename);

      await writeFile(filepath, response.data);

      localPaths.push(`/uploads/product-rebuild/images/${filename}`);
      originalUrls.push(absoluteUrl);

      console.log(`[ImageDownloader] 다운로드 완료: ${i + 1}/${urlsToDownload.length}`);

      // 레이트 리미팅
      if (i < urlsToDownload.length - 1) {
        await sleep(RATE_LIMIT_DELAY);
      }
    } catch (error) {
      console.error(`[ImageDownloader] 다운로드 실패 (${i}):`, imageUrl);
      // 실패해도 계속 진행
    }
  }

  return { localPaths, originalUrls };
}

/**
 * 단일 이미지 다운로드
 */
export async function downloadSingleImage(
  imageUrl: string,
  sourceUrl: string,
  filename?: string
): Promise<string | null> {
  try {
    const uploadsDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'product-rebuild',
      'images'
    );

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const absoluteUrl = makeAbsoluteUrl(imageUrl, sourceUrl);

    const response = await axios.get(absoluteUrl, {
      responseType: 'arraybuffer',
      timeout: DOWNLOAD_TIMEOUT,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: sourceUrl,
      },
    });

    const contentType = response.headers['content-type'];
    const ext = getExtensionFromUrl(absoluteUrl) || getExtensionFromContentType(contentType);

    const finalFilename = filename || `${Date.now()}-single.${ext}`;
    const filepath = path.join(uploadsDir, finalFilename);

    await writeFile(filepath, response.data);

    return `/uploads/product-rebuild/images/${finalFilename}`;
  } catch (error) {
    console.error('[ImageDownloader] 단일 이미지 다운로드 실패:', imageUrl, error);
    return null;
  }
}

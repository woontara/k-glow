// 상품 상세페이지 리빌드 API
import { NextRequest, NextResponse } from 'next/server';
import { scrapeProduct, isValidProductUrl, detectSite } from '@/lib/scraper';
import { translateProductRebuild } from '@/lib/translator';
import { prisma } from '@/lib/prisma';
import { ProductRebuildRequest, ProductRebuildResponse } from '@/types/product-rebuild';

export async function POST(request: NextRequest) {
  try {
    const body: ProductRebuildRequest = await request.json();
    const { url, options = {} } = body;

    // URL 검증
    if (!url || !isValidProductUrl(url)) {
      return NextResponse.json(
        { success: false, error: '유효한 상품 URL을 입력해주세요.' },
        { status: 400 }
      );
    }

    console.log('[ProductRebuild] 요청 시작:', url);

    // 기본 옵션
    const opts = {
      downloadImages: options.downloadImages ?? true,
      captureScreenshot: options.captureScreenshot ?? true,
      translateToRussian: options.translateToRussian ?? true,
      saveToDatabase: options.saveToDatabase ?? false,
      timeout: options.timeout ?? 60000,
    };

    // Step 1: 스크래핑
    console.log('[ProductRebuild] 스크래핑 시작...');
    const scrapedData = await scrapeProduct(url, {
      captureScreenshot: opts.captureScreenshot,
      downloadImages: opts.downloadImages,
      timeout: opts.timeout,
    });

    // Step 2: 번역
    let translatedData = {
      nameRu: '',
      descriptionRu: '',
      ingredientsRu: [] as string[],
    };

    if (opts.translateToRussian) {
      console.log('[ProductRebuild] 번역 시작...');
      translatedData = await translateProductRebuild({
        name: scrapedData.name,
        description: scrapedData.description,
        ingredients: scrapedData.ingredients,
      });
    }

    // Step 3: 데이터베이스 저장 (옵션)
    let savedId: string | undefined;
    if (opts.saveToDatabase) {
      console.log('[ProductRebuild] 데이터베이스 저장...');
      const saved = await prisma.productRebuild.create({
        data: {
          sourceUrl: url,
          sourceSite: scrapedData.sourceSite,
          name: scrapedData.name,
          price: scrapedData.price,
          priceOriginal: scrapedData.priceOriginal,
          description: scrapedData.description,
          nameRu: translatedData.nameRu,
          descriptionRu: translatedData.descriptionRu,
          ingredients: scrapedData.ingredients,
          ingredientsRu: translatedData.ingredientsRu,
          screenshotUrl: scrapedData.screenshotPath,
          imageUrls: scrapedData.imageUrls,
          originalImageUrls: scrapedData.originalImageUrls,
        },
      });
      savedId = saved.id;
    }

    console.log('[ProductRebuild] 완료!');

    // 응답 구성
    const response: ProductRebuildResponse = {
      success: true,
      data: {
        id: savedId,
        sourceUrl: url,
        sourceSite: scrapedData.sourceSite,
        name: scrapedData.name,
        price: scrapedData.price,
        priceOriginal: scrapedData.priceOriginal,
        description: scrapedData.description,
        ingredients: scrapedData.ingredients,
        nameRu: translatedData.nameRu,
        descriptionRu: translatedData.descriptionRu,
        ingredientsRu: translatedData.ingredientsRu,
        screenshotUrl: scrapedData.screenshotPath,
        imageUrls: scrapedData.imageUrls,
        originalImageUrls: scrapedData.originalImageUrls,
        extractedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[ProductRebuild] 오류:', error);

    const errorMessage =
      error instanceof Error ? error.message : '상품 정보를 가져오는데 실패했습니다.';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// 저장된 리빌드 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const rebuilds = await prisma.productRebuild.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.productRebuild.count();

    return NextResponse.json({
      success: true,
      data: rebuilds,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('[ProductRebuild] 목록 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { analyzeBrandWebsite } from '@/lib/analyzer';
import { prisma } from '@/lib/prisma';
import type { AnalyzerInput } from '@/types';

/**
 * POST /api/analyze-website
 * 브랜드 웹사이트 분석
 */
export async function POST(request: NextRequest) {
  try {
    const body: AnalyzerInput & { saveToDb?: boolean } = await request.json();

    // 입력 검증
    if (!body.websiteUrl) {
      return NextResponse.json(
        { error: '웹사이트 URL이 필요합니다' },
        { status: 400 }
      );
    }

    // URL 형식 검증
    try {
      new URL(body.websiteUrl);
    } catch {
      return NextResponse.json(
        { error: '올바른 URL 형식이 아닙니다' },
        { status: 400 }
      );
    }

    console.log('🚀 웹사이트 분석 시작:', body.websiteUrl);

    // 분석 실행
    const result = await analyzeBrandWebsite({
      websiteUrl: body.websiteUrl,
      brandName: body.brandName,
      maxDepth: body.maxDepth || 2,
      targetCategories: body.targetCategories,
    });

    console.log('✅ 분석 완료');

    // DB 저장 (선택사항)
    if (body.saveToDb) {
      try {
        // 파트너사 생성
        const partner = await prisma.partner.create({
          data: {
            name: result.brand.name,
            nameRu: result.brand.nameRu,
            websiteUrl: body.websiteUrl,
            logoUrl: result.brand.logoUrl || '',
            description: result.brand.description,
            descriptionRu: result.brand.descriptionRu,
            marketScore: result.brand.marketScore,
          },
        });

        // 제품 생성
        for (const product of result.products.slice(0, 20)) {
          await prisma.product.create({
            data: {
              partnerId: partner.id,
              name: product.name,
              nameRu: product.nameRu,
              category: product.category,
              price: product.price,
              priceRub: product.price * 0.075,
              ingredients: product.ingredients as any,
              ingredientsRu: product.ingredientsRu as any,
              description: product.description,
              descriptionRu: product.descriptionRu,
              imageUrls: product.imageUrls as any,
            },
          });
        }

        console.log('💾 DB 저장 완료');
      } catch (dbError) {
        console.error('DB 저장 실패:', dbError);
        // 저장 실패해도 분석 결과는 반환
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('웹사이트 분석 실패:', error);

    const errorMessage =
      error instanceof Error ? error.message : '웹사이트 분석에 실패했습니다';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * GET /api/analyze-website?url=...
 * 분석 상태 확인 (향후 구현)
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL 파라미터가 필요합니다' }, { status: 400 });
  }

  // 해당 URL로 분석된 파트너사 찾기
  const partner = await prisma.partner.findFirst({
    where: { websiteUrl: url },
    include: { products: true },
  });

  if (!partner) {
    return NextResponse.json({ analyzed: false });
  }

  return NextResponse.json({
    analyzed: true,
    partner,
  });
}

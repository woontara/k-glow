import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { findProductImage } from '@/lib/naver-search';

// 이미지가 없는 제품들의 이미지를 네이버 쇼핑에서 검색하여 업데이트
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  const { id: supplierId } = await params;

  try {
    // 공급업체 정보 조회
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId }
    });

    if (!supplier) {
      return NextResponse.json({ error: '공급업체를 찾을 수 없습니다' }, { status: 404 });
    }

    // 이미지가 없는 제품들 조회
    const productsWithoutImage = await prisma.supplierProduct.findMany({
      where: {
        supplierId,
        isActive: true,
        OR: [
          { imageUrl: null },
          { imageUrl: '' }
        ]
      },
      select: {
        id: true,
        nameKr: true,
        barcode: true
      },
      take: 50  // 한 번에 최대 50개 처리 (API 제한 고려)
    });

    if (productsWithoutImage.length === 0) {
      return NextResponse.json({
        message: '이미지가 없는 제품이 없습니다',
        updated: 0,
        failed: 0
      });
    }

    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    // 각 제품에 대해 이미지 검색 및 업데이트
    for (const product of productsWithoutImage) {
      try {
        // 브랜드명(공급업체명) + 제품명으로 검색
        const imageUrl = await findProductImage(product.nameKr, supplier.name);

        if (imageUrl) {
          await prisma.supplierProduct.update({
            where: { id: product.id },
            data: { imageUrl }
          });
          updated++;
          console.log(`[FetchImages] ${product.nameKr}: ${imageUrl}`);
        } else {
          failed++;
          errors.push(`${product.nameKr}: 이미지를 찾을 수 없음`);
        }

        // Rate limit 방지 (200ms 딜레이)
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`${product.nameKr}: ${errorMessage}`);
      }
    }

    return NextResponse.json({
      message: `${updated}개 이미지 수집 완료, ${failed}개 실패`,
      updated,
      failed,
      total: productsWithoutImage.length,
      errors: errors.slice(0, 10)  // 처음 10개 에러만 반환
    });

  } catch (error) {
    console.error('이미지 수집 실패:', error);

    // 네이버 API 키 누락 에러 처리
    if (error instanceof Error && error.message.includes('네이버 API 키')) {
      return NextResponse.json({
        error: error.message,
        hint: 'NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET 환경변수를 설정하세요'
      }, { status: 500 });
    }

    return NextResponse.json({
      error: '이미지 수집에 실패했습니다',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// 이미지 수집 상태 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  const { id: supplierId } = await params;

  try {
    const [withImage, withoutImage, total] = await Promise.all([
      prisma.supplierProduct.count({
        where: {
          supplierId,
          isActive: true,
          imageUrl: { not: null },
          NOT: { imageUrl: '' }
        }
      }),
      prisma.supplierProduct.count({
        where: {
          supplierId,
          isActive: true,
          OR: [
            { imageUrl: null },
            { imageUrl: '' }
          ]
        }
      }),
      prisma.supplierProduct.count({
        where: { supplierId, isActive: true }
      })
    ]);

    return NextResponse.json({
      total,
      withImage,
      withoutImage,
      percentage: total > 0 ? Math.round((withImage / total) * 100) : 0
    });

  } catch (error) {
    console.error('이미지 상태 조회 실패:', error);
    return NextResponse.json({ error: '조회에 실패했습니다' }, { status: 500 });
  }
}

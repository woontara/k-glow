import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface ProductUploadData {
  상품코드?: string;
  '자체 상품코드'?: string;
  진열상태?: string;
  판매상태?: string;
  상품명?: string;
  '영문 상품명'?: string;
  판매가?: string;
  공급가?: string;
  소비자가?: string;
  제조사?: string;
  브랜드?: string;
  원산지?: string;
  '상품 상세설명'?: string;
  '상품 간략설명'?: string;
  [key: string]: string | undefined;
}

/**
 * POST /api/products/upload
 * cafe24 CSV 양식으로 상품 일괄 업로드
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products } = body as { products: ProductUploadData[] };

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: '상품 데이터가 없습니다' },
        { status: 400 }
      );
    }

    if (products.length > 1000) {
      return NextResponse.json(
        { error: '최대 1,000개 상품까지 업로드 가능합니다' },
        { status: 400 }
      );
    }

    // 테스트 모드: 테스트 사용자 가져오기
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@kglow.com' }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@kglow.com',
          name: '테스트 사용자',
          role: 'ADMIN',
          companyName: 'K-Glow',
        }
      });
    }

    // 상품 데이터 변환 및 저장
    const savedProducts = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      // 필수 필드 검증
      if (!product['상품명']) {
        errors.push({ row: i + 1, error: '상품명이 없습니다' });
        continue;
      }

      try {
        // 상품 저장 (Product 모델이 있다고 가정, 없으면 JSON으로 저장)
        const savedProduct = await prisma.uploadedProduct.create({
          data: {
            userId: testUser.id,
            productCode: product['상품코드'] || null,
            customCode: product['자체 상품코드'] || null,
            displayStatus: product['진열상태'] === 'Y',
            saleStatus: product['판매상태'] === 'Y',
            name: product['상품명'] || '',
            nameEn: product['영문 상품명'] || null,
            price: product['판매가'] ? parseInt(product['판매가']) : 0,
            supplyPrice: product['공급가'] ? parseInt(product['공급가']) : null,
            retailPrice: product['소비자가'] ? parseInt(product['소비자가']) : null,
            manufacturer: product['제조사'] || null,
            brand: product['브랜드'] || null,
            origin: product['원산지'] || null,
            description: product['상품 상세설명'] || null,
            shortDescription: product['상품 간략설명'] || null,
            rawData: product as any, // 원본 데이터 전체 저장
          },
        });
        savedProducts.push(savedProduct);
      } catch (err) {
        console.error(`상품 저장 실패 (행 ${i + 1}):`, err);
        errors.push({ row: i + 1, error: '저장 실패' });
      }
    }

    return NextResponse.json({
      success: true,
      total: products.length,
      saved: savedProducts.length,
      errors: errors.length,
      errorDetails: errors.slice(0, 10), // 처음 10개 에러만 반환
    });
  } catch (error) {
    console.error('상품 업로드 실패:', error);
    return NextResponse.json(
      { error: '상품 업로드에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/products/upload
 * 업로드된 상품 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const products = await prisma.uploadedProduct.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.uploadedProduct.count();

    return NextResponse.json({
      products,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('상품 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '상품 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/upload
 * 상품 삭제 (단일 또는 다중)
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body as { ids: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: '삭제할 상품 ID가 없습니다' },
        { status: 400 }
      );
    }

    const result = await prisma.uploadedProduct.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
    });
  } catch (error) {
    console.error('상품 삭제 실패:', error);
    return NextResponse.json(
      { error: '상품 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}

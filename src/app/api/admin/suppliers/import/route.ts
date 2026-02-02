import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// JSON 데이터로 제품 일괄 등록
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { supplierName, replaceExisting, products } = body;

    if (!supplierName) {
      return NextResponse.json({ error: '공급업체명이 필요합니다' }, { status: 400 });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: '유효한 상품 데이터가 없습니다' }, { status: 400 });
    }

    // 공급업체 생성 또는 조회
    let supplier = await prisma.supplier.findUnique({
      where: { name: supplierName }
    });

    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: { name: supplierName }
      });
    }

    // 기존 제품 삭제 (옵션)
    if (replaceExisting) {
      await prisma.supplierProduct.deleteMany({
        where: { supplierId: supplier.id }
      });
    }

    // 제품 데이터 변환
    const productData: Prisma.SupplierProductCreateManyInput[] = products.map((p: Record<string, unknown>) => ({
      supplierId: supplier.id,
      productCode: p.productCode ? String(p.productCode) : null,
      barcode: p.barcode ? String(p.barcode) : null,
      name: String(p.name || ''),
      nameEn: p.nameEn ? String(p.nameEn) : null,
      category: p.category ? String(p.category) : null,
      subCategory: p.subCategory ? String(p.subCategory) : null,
      supplyPrice: typeof p.supplyPrice === 'number' ? p.supplyPrice : null,
      retailPrice: typeof p.retailPrice === 'number' ? p.retailPrice : null,
      volume: p.volume ? String(p.volume) : null,
      weight: typeof p.weight === 'number' ? p.weight : null,
      unit: p.unit ? String(p.unit) : null,
      minOrderQty: typeof p.minOrderQty === 'number' ? Math.round(p.minOrderQty) : null,
      boxQty: typeof p.boxQty === 'number' ? Math.round(p.boxQty) : null,
      imageUrl: p.imageUrl ? String(p.imageUrl) : null,
      rawData: p.rawData as Prisma.InputJsonValue || {}
    }));

    // 일괄 저장
    const created = await prisma.supplierProduct.createMany({
      data: productData,
      skipDuplicates: true
    });

    return NextResponse.json({
      message: `${created.count}개의 상품이 등록되었습니다`,
      supplier: {
        id: supplier.id,
        name: supplier.name
      },
      stats: {
        totalRows: products.length,
        validProducts: productData.length,
        created: created.count
      }
    });

  } catch (error) {
    console.error('제품 등록 실패:', error);
    return NextResponse.json({
      error: '제품 등록에 실패했습니다',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

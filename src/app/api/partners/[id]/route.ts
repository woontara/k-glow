import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/partners/[id]
 * 파트너사 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        products: {
          orderBy: { createdAt: 'desc' },
          take: 50, // 최대 50개 제품
        },
      },
    });

    if (!partner) {
      return NextResponse.json(
        { error: '파트너사를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: partner.id,
      name: partner.name,
      nameRu: partner.nameRu,
      websiteUrl: partner.websiteUrl,
      logoUrl: partner.logoUrl,
      description: partner.description,
      descriptionRu: partner.descriptionRu,
      marketScore: partner.marketScore,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
      products: partner.products.map((p) => ({
        id: p.id,
        name: p.name,
        nameRu: p.nameRu,
        category: p.category,
        price: p.price,
        priceRub: p.priceRub,
        ingredients: p.ingredients,
        ingredientsRu: p.ingredientsRu,
        description: p.description,
        descriptionRu: p.descriptionRu,
        imageUrls: p.imageUrls,
      })),
    });
  } catch (error) {
    console.error('파트너사 조회 실패:', error);
    return NextResponse.json(
      { error: '파트너사 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/partners
 * 파트너사 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    // 검색 조건
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { nameRu: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {};

    // 파트너사 목록 조회 (제품 개수 포함)
    const partners = await prisma.partner.findMany({
      where,
      include: {
        products: {
          select: { id: true },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        marketScore: 'desc', // 시장 점수 높은 순
      },
      take: limit,
      skip: offset,
    });

    // 총 개수
    const total = await prisma.partner.count({ where });

    return NextResponse.json({
      partners: partners.map((p) => ({
        id: p.id,
        name: p.name,
        nameRu: p.nameRu,
        websiteUrl: p.websiteUrl,
        logoUrl: p.logoUrl,
        description: p.description,
        descriptionRu: p.descriptionRu,
        marketScore: p.marketScore,
        productCount: p._count.products,
        createdAt: p.createdAt,
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('파트너사 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '파트너사 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

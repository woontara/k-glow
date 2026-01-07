import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/portfolio
 * 포트폴리오 목록 조회 (공개)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const featured = searchParams.get('featured') === 'true';

    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (featured) {
      where.isFeatured = true;
    }

    if (category && category !== 'all') {
      where.category = category.toUpperCase();
    }

    const portfolios = await prisma.portfolio.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ portfolios });
  } catch (error) {
    console.error('포트폴리오 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '포트폴리오 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portfolio
 * 포트폴리오 생성 (어드민만 가능)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '권한이 없습니다' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // 입력 검증
    if (!body.brand || !body.title || !body.imageUrl || !body.category) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다 (brand, title, imageUrl, category)' },
        { status: 400 }
      );
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        // 브랜드 정보
        brand: body.brand,
        brandLogoUrl: body.brandLogoUrl || null,
        brandWebsite: body.brandWebsite || null,
        category: body.category.toUpperCase(),

        // 프로젝트 정보
        title: body.title,
        marketplaces: body.marketplaces || [],
        services: body.services || [],
        projectYear: body.projectYear || null,
        duration: body.duration || null,

        // 성과 지표
        monthlySales: body.monthlySales || null,
        productCount: body.productCount || null,
        rating: body.rating || null,
        achievement: body.achievement || null,

        // 스토리
        challenge: body.challenge || null,
        solution: body.solution || null,
        results: body.results || null,

        // 표시 설정
        imageUrl: body.imageUrl,
        gradient: body.gradient || 'from-[#8BA4B4] to-[#6B8A9A]',
        isActive: body.isActive !== false,
        isFeatured: body.isFeatured || false,
        order: body.order || 0,
      },
    });

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('포트폴리오 생성 실패:', error);
    return NextResponse.json(
      { error: '포트폴리오 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}

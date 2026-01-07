import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/portfolio/[id]
 * 특정 포트폴리오 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: '포트폴리오를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('포트폴리오 조회 실패:', error);
    return NextResponse.json(
      { error: '포트폴리오 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/portfolio/[id]
 * 포트폴리오 수정 (어드민만 가능)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '권한이 없습니다' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const portfolio = await prisma.portfolio.update({
      where: { id },
      data: {
        // 브랜드 정보
        ...(body.brand && { brand: body.brand }),
        ...(body.brandLogoUrl !== undefined && { brandLogoUrl: body.brandLogoUrl }),
        ...(body.brandWebsite !== undefined && { brandWebsite: body.brandWebsite }),
        ...(body.category && { category: body.category.toUpperCase() }),

        // 프로젝트 정보
        ...(body.title && { title: body.title }),
        ...(body.marketplaces !== undefined && { marketplaces: body.marketplaces }),
        ...(body.services !== undefined && { services: body.services }),
        ...(body.projectYear !== undefined && { projectYear: body.projectYear }),
        ...(body.duration !== undefined && { duration: body.duration }),

        // 성과 지표
        ...(body.monthlySales !== undefined && { monthlySales: body.monthlySales }),
        ...(body.productCount !== undefined && { productCount: body.productCount }),
        ...(body.rating !== undefined && { rating: body.rating }),
        ...(body.achievement !== undefined && { achievement: body.achievement }),

        // 스토리
        ...(body.challenge !== undefined && { challenge: body.challenge }),
        ...(body.solution !== undefined && { solution: body.solution }),
        ...(body.results !== undefined && { results: body.results }),

        // 표시 설정
        ...(body.imageUrl && { imageUrl: body.imageUrl }),
        ...(body.gradient && { gradient: body.gradient }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
        ...(body.order !== undefined && { order: body.order }),
      },
    });

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('포트폴리오 수정 실패:', error);
    return NextResponse.json(
      { error: '포트폴리오 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/portfolio/[id]
 * 포트폴리오 삭제 (어드민만 가능)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '권한이 없습니다' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.portfolio.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('포트폴리오 삭제 실패:', error);
    return NextResponse.json(
      { error: '포트폴리오 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}

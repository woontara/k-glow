import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/admin/brands
 * 브랜드 목록 조회 (관리자용)
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const brands = await prisma.brand.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return NextResponse.json({ brands });
  } catch (error) {
    console.error('브랜드 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '브랜드 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/brands
 * 브랜드 생성 (관리자용)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const body = await request.json();
    const { name, nameKo, skuPrefix, description, logoUrl, websiteUrl, contactEmail, contactPhone } = body;

    if (!name || !nameKo || !skuPrefix) {
      return NextResponse.json(
        { error: '브랜드명(영문, 한글)과 SKU 접두사는 필수입니다' },
        { status: 400 }
      );
    }

    // SKU 접두사 중복 확인
    const existing = await prisma.brand.findUnique({
      where: { skuPrefix },
    });

    if (existing) {
      return NextResponse.json(
        { error: '이미 사용중인 SKU 접두사입니다' },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        nameKo,
        skuPrefix: skuPrefix.toUpperCase(),
        description,
        logoUrl,
        websiteUrl,
        contactEmail,
        contactPhone,
      },
    });

    return NextResponse.json({ brand }, { status: 201 });
  } catch (error) {
    console.error('브랜드 생성 실패:', error);
    return NextResponse.json(
      { error: '브랜드 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}

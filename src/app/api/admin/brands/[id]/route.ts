import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/admin/brands/[id]
 * 브랜드 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const { id } = await params;

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!brand) {
      return NextResponse.json({ error: '브랜드를 찾을 수 없습니다' }, { status: 404 });
    }

    return NextResponse.json({ brand });
  } catch (error) {
    console.error('브랜드 조회 실패:', error);
    return NextResponse.json(
      { error: '브랜드 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/brands/[id]
 * 브랜드 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, nameKo, skuPrefix, description, logoUrl, websiteUrl, contactEmail, contactPhone, isActive } = body;

    // SKU 접두사 중복 확인 (자기 자신 제외)
    if (skuPrefix) {
      const existing = await prisma.brand.findFirst({
        where: {
          skuPrefix: skuPrefix.toUpperCase(),
          NOT: { id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: '이미 사용중인 SKU 접두사입니다' },
          { status: 400 }
        );
      }
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(nameKo && { nameKo }),
        ...(skuPrefix && { skuPrefix: skuPrefix.toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(websiteUrl !== undefined && { websiteUrl }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ brand });
  } catch (error) {
    console.error('브랜드 수정 실패:', error);
    return NextResponse.json(
      { error: '브랜드 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/brands/[id]
 * 브랜드 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const { id } = await params;

    // 연결된 사용자가 있는지 확인
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!brand) {
      return NextResponse.json({ error: '브랜드를 찾을 수 없습니다' }, { status: 404 });
    }

    if (brand._count.users > 0) {
      return NextResponse.json(
        { error: '연결된 사용자가 있어 삭제할 수 없습니다. 먼저 사용자 연결을 해제하세요.' },
        { status: 400 }
      );
    }

    await prisma.brand.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('브랜드 삭제 실패:', error);
    return NextResponse.json(
      { error: '브랜드 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

/**
 * GET /api/admin/users/[id]
 * 사용자 상세 조회
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

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyName: true,
        brandId: true,
        brand: {
          select: {
            id: true,
            name: true,
            nameKo: true,
            skuPrefix: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('사용자 조회 실패:', error);
    return NextResponse.json(
      { error: '사용자 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id]
 * 사용자 정보 수정
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
    const { name, role, companyName, brandId, password } = body;

    // 데이터 준비
    const updateData: {
      name?: string;
      role?: 'BRAND' | 'BUYER' | 'ADMIN';
      companyName?: string | null;
      brandId?: string | null;
      password?: string;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (companyName !== undefined) updateData.companyName = companyName || null;
    if (brandId !== undefined) updateData.brandId = brandId || null;

    // 비밀번호 변경 시 해싱
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyName: true,
        brandId: true,
        brand: {
          select: {
            id: true,
            name: true,
            nameKo: true,
            skuPrefix: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('사용자 수정 실패:', error);
    return NextResponse.json(
      { error: '사용자 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * 사용자 삭제
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

    // 자기 자신은 삭제 불가
    if (id === session.user.id) {
      return NextResponse.json(
        { error: '자기 자신은 삭제할 수 없습니다' },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('사용자 삭제 실패:', error);
    return NextResponse.json(
      { error: '사용자 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}

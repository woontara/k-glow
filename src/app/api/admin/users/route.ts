import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

/**
 * GET /api/admin/users
 * 사용자 목록 조회 (관리자용)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role') || undefined;
    const brandId = searchParams.get('brandId') || undefined;

    const users = await prisma.user.findMany({
      where: {
        ...(role && { role: role as 'BRAND' | 'BUYER' | 'ADMIN' }),
        ...(brandId && { brandId }),
      },
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json({ users });
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '사용자 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * 새 사용자 생성 (관리자용)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const body = await request.json();
    const { email, name, password, role, companyName, brandId } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: '이메일, 이름, 비밀번호는 필수입니다' },
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: '이미 사용중인 이메일입니다' },
        { status: 400 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'BRAND',
        companyName,
        brandId: brandId || null,
      },
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
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('사용자 생성 실패:', error);
    return NextResponse.json(
      { error: '사용자 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}

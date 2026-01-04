import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/certifications
 * 인증 신청 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    if (status) {
      where.status = status;
    }

    const certifications = await prisma.certificationRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
            nameRu: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ certifications });
  } catch (error) {
    console.error('인증 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '인증 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/certifications
 * 인증 신청
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 입력 검증
    if (!body.partnerId || !body.certType) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다' },
        { status: 400 }
      );
    }

    // 인증 신청 생성
    const certification = await prisma.certificationRequest.create({
      data: {
        userId: session.user.id,
        partnerId: body.partnerId,
        certType: body.certType,
        status: 'PENDING',
        documents: body.documents || [],
        estimatedCost: body.estimatedCost || 0,
        notes: body.notes,
      },
      include: {
        partner: true,
        user: {
          select: {
            name: true,
            email: true,
            companyName: true,
          },
        },
      },
    });

    return NextResponse.json(certification);
  } catch (error) {
    console.error('인증 신청 실패:', error);
    return NextResponse.json(
      { error: '인증 신청에 실패했습니다' },
      { status: 500 }
    );
  }
}

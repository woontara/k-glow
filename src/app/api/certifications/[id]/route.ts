import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/certifications/[id]
 * 인증 신청 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const certification = await prisma.certificationRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
          },
        },
        partner: true,
      },
    });

    if (!certification) {
      return NextResponse.json(
        { error: '인증 신청을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json(certification);
  } catch (error) {
    console.error('인증 조회 실패:', error);
    return NextResponse.json(
      { error: '인증 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/certifications/[id]
 * 인증 신청 상태 업데이트 (관리자용)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const certification = await prisma.certificationRequest.update({
      where: { id },
      data: {
        status: body.status,
        notes: body.notes,
        estimatedCost: body.estimatedCost,
      },
      include: {
        user: true,
        partner: true,
      },
    });

    return NextResponse.json(certification);
  } catch (error) {
    console.error('인증 업데이트 실패:', error);
    return NextResponse.json(
      { error: '인증 업데이트에 실패했습니다' },
      { status: 500 }
    );
  }
}

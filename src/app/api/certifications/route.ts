import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
 * 인증 신청 (브랜드 직접 신청)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 입력 검증 (새 폼 구조)
    if (!body.brandName || !body.certType || !body.email) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다 (브랜드명, 인증종류, 이메일)' },
        { status: 400 }
      );
    }

    // 테스트 사용자 확보 (인증 없이 신청 가능하도록)
    let user = await prisma.user.findFirst({
      where: { email: body.email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: body.email,
          name: body.brandName,
          role: 'BRAND',
          companyName: body.brandName,
        }
      });
    }

    // 직접 신청용 기본 파트너 확보
    let directPartner = await prisma.partner.findFirst({
      where: { name: '직접 신청' }
    });

    if (!directPartner) {
      directPartner = await prisma.partner.create({
        data: {
          name: '직접 신청',
          nameRu: 'Прямая заявка',
          websiteUrl: body.websiteUrl || 'https://k-glow.kr',
          description: '브랜드 직접 인증 신청',
          descriptionRu: 'Прямая заявка бренда на сертификацию',
        }
      });
    }

    // notes에 모든 정보 저장
    const fullNotes = [
      `📧 연락처 이메일: ${body.email}`,
      `🏢 브랜드명: ${body.brandName}`,
      body.websiteUrl ? `🌐 웹사이트: ${body.websiteUrl}` : null,
      '---',
      body.notes || '',
    ].filter(Boolean).join('\n');

    // 인증 신청 생성
    const certification = await prisma.certificationRequest.create({
      data: {
        userId: user.id,
        partnerId: directPartner.id,
        certType: body.certType,
        status: 'PENDING',
        documents: body.documents || [],
        estimatedCost: body.estimatedCost || 0,
        notes: fullNotes,
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

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/testimonial
 * 고객 후기 목록 조회 (공개)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('고객 후기 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '고객 후기 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/testimonial
 * 고객 후기 생성 (어드민만 가능)
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
    if (!body.name || !body.company || !body.content) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다 (name, company, content)' },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name: body.name,
        company: body.company,
        content: body.content,
        gradient: body.gradient || 'from-[#8BA4B4] to-[#6B8A9A]',
        isActive: body.isActive !== false,
        order: body.order || 0,
      },
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('고객 후기 생성 실패:', error);
    return NextResponse.json(
      { error: '고객 후기 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/testimonial/[id]
 * 특정 고객 후기 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return NextResponse.json(
        { error: '고객 후기를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('고객 후기 조회 실패:', error);
    return NextResponse.json(
      { error: '고객 후기 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/testimonial/[id]
 * 고객 후기 수정 (어드민만 가능)
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

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.company && { company: body.company }),
        ...(body.content && { content: body.content }),
        ...(body.gradient && { gradient: body.gradient }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.order !== undefined && { order: body.order }),
      },
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('고객 후기 수정 실패:', error);
    return NextResponse.json(
      { error: '고객 후기 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/testimonial/[id]
 * 고객 후기 삭제 (어드민만 가능)
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

    await prisma.testimonial.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('고객 후기 삭제 실패:', error);
    return NextResponse.json(
      { error: '고객 후기 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}

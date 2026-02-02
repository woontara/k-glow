import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 공급업체 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } }
      }
    });

    if (!supplier) {
      return NextResponse.json({ error: '공급업체를 찾을 수 없습니다' }, { status: 404 });
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error('공급업체 조회 실패:', error);
    return NextResponse.json({ error: '공급업체 조회에 실패했습니다' }, { status: 500 });
  }
}

// 공급업체 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, contactName, contactEmail, contactPhone, website, notes, isActive } = body;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(contactName !== undefined && { contactName }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(website !== undefined && { website }),
        ...(notes !== undefined && { notes }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json(supplier);
  } catch (error: unknown) {
    console.error('공급업체 수정 실패:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: '공급업체를 찾을 수 없습니다' }, { status: 404 });
    }
    return NextResponse.json({ error: '공급업체 수정에 실패했습니다' }, { status: 500 });
  }
}

// 공급업체 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.supplier.delete({
      where: { id }
    });

    return NextResponse.json({ message: '공급업체가 삭제되었습니다' });
  } catch (error: unknown) {
    console.error('공급업체 삭제 실패:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: '공급업체를 찾을 수 없습니다' }, { status: 404 });
    }
    return NextResponse.json({ error: '공급업체 삭제에 실패했습니다' }, { status: 500 });
  }
}

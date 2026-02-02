import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 공급업체 제품 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const skip = (page - 1) * limit;

  try {
    const [products, total] = await Promise.all([
      prisma.supplierProduct.findMany({
        where: {
          supplierId: id,
          isActive: true,
          ...(search ? {
            OR: [
              { nameKr: { contains: search, mode: 'insensitive' } },
              { nameEn: { contains: search, mode: 'insensitive' } },
              { productCode: { contains: search, mode: 'insensitive' } },
              { barcode: { contains: search, mode: 'insensitive' } },
            ]
          } : {})
        },
        orderBy: { nameKr: 'asc' },
        skip,
        take: limit
      }),
      prisma.supplierProduct.count({
        where: {
          supplierId: id,
          isActive: true,
          ...(search ? {
            OR: [
              { nameKr: { contains: search, mode: 'insensitive' } },
              { nameEn: { contains: search, mode: 'insensitive' } },
              { productCode: { contains: search, mode: 'insensitive' } },
              { barcode: { contains: search, mode: 'insensitive' } },
            ]
          } : {})
        }
      })
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('제품 목록 조회 실패:', error);
    return NextResponse.json({ error: '제품 목록을 불러오는데 실패했습니다' }, { status: 500 });
  }
}

// 제품 전체 삭제 (공급업체별)
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
    const result = await prisma.supplierProduct.deleteMany({
      where: { supplierId: id }
    });

    return NextResponse.json({
      message: `${result.count}개의 제품이 삭제되었습니다`,
      count: result.count
    });
  } catch (error) {
    console.error('제품 삭제 실패:', error);
    return NextResponse.json({ error: '제품 삭제에 실패했습니다' }, { status: 500 });
  }
}

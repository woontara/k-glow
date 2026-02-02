import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 공급업체 목록 조회
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const includeProducts = searchParams.get('includeProducts') === 'true';

  try {
    const suppliers = await prisma.supplier.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { contactName: { contains: search, mode: 'insensitive' } },
        ]
      } : undefined,
      include: includeProducts ? {
        products: {
          where: { isActive: true },
          orderBy: { nameKr: 'asc' }
        },
        _count: { select: { products: true } }
      } : {
        _count: { select: { products: true } }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('공급업체 목록 조회 실패:', error);
    return NextResponse.json({ error: '공급업체 목록을 불러오는데 실패했습니다' }, { status: 500 });
  }
}

// 공급업체 생성
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, contactName, contactEmail, contactPhone, website, notes } = body;

    if (!name) {
      return NextResponse.json({ error: '공급업체명은 필수입니다' }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactName,
        contactEmail,
        contactPhone,
        website,
        notes
      }
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error: unknown) {
    console.error('공급업체 생성 실패:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: '이미 등록된 공급업체입니다' }, { status: 400 });
    }
    return NextResponse.json({ error: '공급업체 생성에 실패했습니다' }, { status: 500 });
  }
}

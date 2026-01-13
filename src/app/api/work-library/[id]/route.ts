import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 작업물 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id } = await params;

    // 소유권 확인
    const item = await prisma.workLibraryItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: '작업물을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (item.userId !== session.user.id) {
      return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
    }

    await prisma.workLibraryItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('작업물 삭제 실패:', error);
    return NextResponse.json(
      { error: '작업물을 삭제하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 작업물 이름 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: '이름이 필요합니다.' }, { status: 400 });
    }

    // 소유권 확인
    const item = await prisma.workLibraryItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: '작업물을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (item.userId !== session.user.id) {
      return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
    }

    const updatedItem = await prisma.workLibraryItem.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error('작업물 수정 실패:', error);
    return NextResponse.json(
      { error: '작업물을 수정하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

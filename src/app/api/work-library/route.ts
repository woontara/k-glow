import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { WorkItemType } from '@prisma/client';

// 작업물 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as WorkItemType | null;

    const items = await prisma.workLibraryItem.findMany({
      where: {
        userId: session.user.id,
        ...(type && { type }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('작업물 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '작업물 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 작업물 저장
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, url, thumbnail, metadata, sourceLogId } = body;

    if (!name || !type || !url) {
      return NextResponse.json(
        { error: '필수 항목이 누락되었습니다.' },
        { status: 400 }
      );
    }

    const item = await prisma.workLibraryItem.create({
      data: {
        userId: session.user.id,
        name,
        type,
        url,
        thumbnail,
        metadata,
        sourceLogId,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('작업물 저장 실패:', error);
    return NextResponse.json(
      { error: '작업물을 저장하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

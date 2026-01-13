import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { WorkItemType } from '@prisma/client';

// 파일 타입 매핑
function getWorkItemType(mimeType: string): WorkItemType {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('text/') || mimeType === 'application/json') return 'TEXT';
  return 'FILE';
}

// 파일 확장자로 타입 추론
function getTypeFromExtension(filename: string): WorkItemType {
  const ext = filename.split('.').pop()?.toLowerCase();
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'];
  const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
  const textExts = ['txt', 'md', 'json', 'csv', 'xml', 'html', 'css', 'js'];

  if (imageExts.includes(ext || '')) return 'IMAGE';
  if (audioExts.includes(ext || '')) return 'AUDIO';
  if (videoExts.includes(ext || '')) return 'VIDEO';
  if (textExts.includes(ext || '')) return 'TEXT';
  return 'FILE';
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, url, mimeType, fileSize, filename } = body;

    if (!name || !url) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    // 파일 타입 결정
    let type: WorkItemType;
    if (mimeType) {
      type = getWorkItemType(mimeType);
    } else if (filename) {
      type = getTypeFromExtension(filename);
    } else {
      type = 'FILE';
    }

    const item = await prisma.workLibraryItem.create({
      data: {
        userId: session.user.id,
        name,
        type,
        url,
        metadata: {
          fileSize,
          mimeType,
          originalFilename: filename,
        },
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('라이브러리 업로드 실패:', error);
    return NextResponse.json(
      { error: '파일 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 미리 생성된 Export 파일 다운로드
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const supplierId = searchParams.get('supplierId');
  const includeImages = searchParams.get('images') === 'true';

  try {
    const isAll = !supplierId || supplierId === 'all';

    // 미리 생성된 파일 조회
    const exportRecord = await prisma.supplierExport.findUnique({
      where: {
        supplierId_includeImages: {
          supplierId: isAll ? null : supplierId,
          includeImages
        }
      }
    });

    if (!exportRecord) {
      return NextResponse.json({
        error: '내보내기 파일이 없습니다. 먼저 파일을 생성해주세요.',
        needGenerate: true
      }, { status: 404 });
    }

    // 파일 URL로 리다이렉트
    return NextResponse.redirect(exportRecord.fileUrl);

  } catch (error) {
    console.error('Export 파일 다운로드 실패:', error);
    return NextResponse.json({
      error: '파일 다운로드에 실패했습니다',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

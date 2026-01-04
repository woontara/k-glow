import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: '파일이 선택되지 않았습니다' },
        { status: 400 }
      );
    }

    const uploadedFiles: { originalName: string; savedName: string; url: string; size: number }[] = [];

    // uploads 디렉토리 확인 및 생성
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    for (const file of files) {
      // 파일 검증
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `파일 크기는 10MB를 초과할 수 없습니다: ${file.name}` },
          { status: 400 }
        );
      }

      // 허용된 파일 형식
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `지원하지 않는 파일 형식입니다: ${file.name}` },
          { status: 400 }
        );
      }

      // 파일명 생성 (타임스탬프 + 랜덤 문자열 + 원본 확장자)
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const ext = path.extname(file.name);
      const savedName = `${timestamp}-${randomString}${ext}`;

      // 파일 저장
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(uploadsDir, savedName);
      await writeFile(filePath, buffer);

      uploadedFiles.push({
        originalName: file.name,
        savedName,
        url: `/uploads/${savedName}`,
        size: file.size,
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('파일 업로드 실패:', error);
    return NextResponse.json(
      { error: '파일 업로드에 실패했습니다' },
      { status: 500 }
    );
  }
}

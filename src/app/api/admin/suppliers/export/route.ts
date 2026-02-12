import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

// 공급업체 제품 데이터를 엑셀로 내보내기
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const supplierId = searchParams.get('supplierId'); // 특정 브랜드만 또는 'all'

  try {
    // 데이터 조회
    let suppliers;
    if (supplierId && supplierId !== 'all') {
      suppliers = await prisma.supplier.findMany({
        where: { id: supplierId },
        include: {
          products: {
            where: { isActive: true },
            orderBy: { nameKr: 'asc' }
          }
        }
      });
    } else {
      suppliers = await prisma.supplier.findMany({
        where: { isActive: true },
        include: {
          products: {
            where: { isActive: true },
            orderBy: { nameKr: 'asc' }
          }
        },
        orderBy: { name: 'asc' }
      });
    }

    // 워크북 생성
    const workbook = XLSX.utils.book_new();

    if (supplierId === 'all') {
      // 모든 브랜드를 하나의 시트에
      const allProducts = suppliers.flatMap(s =>
        s.products.map(p => ({
          '브랜드': s.name,
          '바코드': p.barcode || '',
          '제품명(한글)': p.nameKr,
          '제품명(영문)': p.nameEn || '',
          '용량': p.volume || '',
          '공급가(원)': p.supplyPrice || '',
          '소비자가(원)': p.msrp || '',
          'VAT포함': p.vatIncluded === true ? 'Y' : p.vatIncluded === false ? 'N' : '',
          '박스수량': p.boxQty || '',
          '제품무게(g)': p.itemWeight || '',
          '제품사이즈(mm)': p.itemSize || '',
          '박스무게(kg)': p.boxWeight || '',
          '박스사이즈(cm)': p.boxSize || '',
          '유통기한': p.shelfLife || '',
          '이미지URL': p.imageUrl || '',
        }))
      );

      const worksheet = XLSX.utils.json_to_sheet(allProducts);

      // 컬럼 너비 설정
      worksheet['!cols'] = [
        { wch: 15 }, // 브랜드
        { wch: 15 }, // 바코드
        { wch: 40 }, // 제품명(한글)
        { wch: 40 }, // 제품명(영문)
        { wch: 10 }, // 용량
        { wch: 12 }, // 공급가
        { wch: 12 }, // 소비자가
        { wch: 8 },  // VAT포함
        { wch: 10 }, // 박스수량
        { wch: 12 }, // 제품무게
        { wch: 15 }, // 제품사이즈
        { wch: 12 }, // 박스무게
        { wch: 15 }, // 박스사이즈
        { wch: 12 }, // 유통기한
        { wch: 50 }, // 이미지URL
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, '전체 제품');
    } else {
      // 브랜드별 시트 생성
      for (const supplier of suppliers) {
        const products = supplier.products.map(p => ({
          '바코드': p.barcode || '',
          '제품명(한글)': p.nameKr,
          '제품명(영문)': p.nameEn || '',
          '용량': p.volume || '',
          '공급가(원)': p.supplyPrice || '',
          '소비자가(원)': p.msrp || '',
          'VAT포함': p.vatIncluded === true ? 'Y' : p.vatIncluded === false ? 'N' : '',
          '박스수량': p.boxQty || '',
          '제품무게(g)': p.itemWeight || '',
          '제품사이즈(mm)': p.itemSize || '',
          '박스무게(kg)': p.boxWeight || '',
          '박스사이즈(cm)': p.boxSize || '',
          '유통기한': p.shelfLife || '',
          '이미지URL': p.imageUrl || '',
        }));

        if (products.length === 0) continue;

        const worksheet = XLSX.utils.json_to_sheet(products);

        // 컬럼 너비 설정
        worksheet['!cols'] = [
          { wch: 15 }, // 바코드
          { wch: 40 }, // 제품명(한글)
          { wch: 40 }, // 제품명(영문)
          { wch: 10 }, // 용량
          { wch: 12 }, // 공급가
          { wch: 12 }, // 소비자가
          { wch: 8 },  // VAT포함
          { wch: 10 }, // 박스수량
          { wch: 12 }, // 제품무게
          { wch: 15 }, // 제품사이즈
          { wch: 12 }, // 박스무게
          { wch: 15 }, // 박스사이즈
          { wch: 12 }, // 유통기한
          { wch: 50 }, // 이미지URL
        ];

        // 시트 이름은 31자 제한
        const sheetName = supplier.name.substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
    }

    // 엑셀 파일 생성
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 파일명 생성
    const date = new Date().toISOString().split('T')[0];
    const fileName = supplierId === 'all'
      ? `K-Glow_전체제품_${date}.xlsx`
      : suppliers.length === 1
        ? `K-Glow_${suppliers[0].name}_${date}.xlsx`
        : `K-Glow_제품목록_${date}.xlsx`;

    // Response 반환
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    });

  } catch (error) {
    console.error('엑셀 내보내기 실패:', error);
    return NextResponse.json({
      error: '엑셀 파일 생성에 실패했습니다',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

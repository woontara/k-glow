import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

// 이미지 URL에서 버퍼로 가져오기
async function fetchImageAsBuffer(url: string): Promise<{ buffer: Buffer; extension: 'png' | 'jpeg' | 'gif' } | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000) // 5초 타임아웃
    });
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || '';
    let extension: 'png' | 'jpeg' | 'gif' = 'jpeg';
    if (contentType.includes('png')) extension = 'png';
    else if (contentType.includes('gif')) extension = 'gif';

    const arrayBuffer = await response.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), extension };
  } catch {
    return null;
  }
}

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
    const workbook = new ExcelJS.Workbook();

    // 공급가 계산: 원가 * 1.15, 백원 단위 버림
    const calculateSupplyPrice = (price: number | null): number | string => {
      if (!price) return '';
      const calculated = price * 1.15;
      return Math.floor(calculated / 100) * 100;
    };

    // 컬럼 정의
    const columnsWithImage = [
      { header: '이미지', key: 'image', width: 15 },
      { header: '브랜드', key: 'brand', width: 15 },
      { header: '바코드', key: 'barcode', width: 15 },
      { header: '제품명(한글)', key: 'nameKr', width: 40 },
      { header: '제품명(영문)', key: 'nameEn', width: 40 },
      { header: '용량', key: 'volume', width: 10 },
      { header: '공급가(원)', key: 'supplyPrice', width: 12 },
      { header: '소비자가(원)', key: 'msrp', width: 12 },
      { header: 'VAT포함', key: 'vatIncluded', width: 8 },
      { header: '박스수량', key: 'boxQty', width: 10 },
      { header: '제품무게(g)', key: 'itemWeight', width: 12 },
      { header: '제품사이즈(mm)', key: 'itemSize', width: 15 },
      { header: '박스무게(kg)', key: 'boxWeight', width: 12 },
      { header: '박스사이즈(cm)', key: 'boxSize', width: 15 },
      { header: '유통기한', key: 'shelfLife', width: 12 },
    ];

    const columnsWithoutBrand = columnsWithImage.filter(c => c.key !== 'brand');

    if (supplierId === 'all') {
      // 모든 브랜드를 하나의 시트에
      const worksheet = workbook.addWorksheet('전체 제품');
      worksheet.columns = columnsWithImage;

      // 헤더 스타일
      const headerRow = worksheet.getRow(1);
      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4A4A4A' } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      let rowIndex = 2;
      for (const supplier of suppliers) {
        for (const p of supplier.products) {
          const row = worksheet.addRow({
            image: '', // 이미지 셀은 비워둠
            brand: supplier.name,
            barcode: p.barcode || '',
            nameKr: p.nameKr,
            nameEn: p.nameEn || '',
            volume: p.volume || '',
            supplyPrice: calculateSupplyPrice(p.supplyPrice),
            msrp: p.msrp || '',
            vatIncluded: p.vatIncluded === true ? 'Y' : p.vatIncluded === false ? 'N' : '',
            boxQty: p.boxQty || '',
            itemWeight: p.itemWeight || '',
            itemSize: p.itemSize || '',
            boxWeight: p.boxWeight || '',
            boxSize: p.boxSize || '',
            shelfLife: p.shelfLife || '',
          });

          row.height = 60; // 셀 높이 80
          row.eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          });

          // 이미지 추가
          if (p.imageUrl) {
            const imageData = await fetchImageAsBuffer(p.imageUrl);
            if (imageData) {
              const imageId = workbook.addImage({
                buffer: imageData.buffer,
                extension: imageData.extension,
              });
              worksheet.addImage(imageId, {
                tl: { col: 0, row: rowIndex - 1 },
                ext: { width: 75, height: 55 },
              });
            }
          }

          rowIndex++;
        }
      }
    } else {
      // 브랜드별 시트 생성
      for (const supplier of suppliers) {
        if (supplier.products.length === 0) continue;

        const sheetName = supplier.name.substring(0, 31);
        const worksheet = workbook.addWorksheet(sheetName);
        worksheet.columns = columnsWithoutBrand;

        // 헤더 스타일
        const headerRow = worksheet.getRow(1);
        headerRow.height = 25;
        headerRow.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4A4A4A' } };
          cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        let rowIndex = 2;
        for (const p of supplier.products) {
          const row = worksheet.addRow({
            image: '',
            barcode: p.barcode || '',
            nameKr: p.nameKr,
            nameEn: p.nameEn || '',
            volume: p.volume || '',
            supplyPrice: calculateSupplyPrice(p.supplyPrice),
            msrp: p.msrp || '',
            vatIncluded: p.vatIncluded === true ? 'Y' : p.vatIncluded === false ? 'N' : '',
            boxQty: p.boxQty || '',
            itemWeight: p.itemWeight || '',
            itemSize: p.itemSize || '',
            boxWeight: p.boxWeight || '',
            boxSize: p.boxSize || '',
            shelfLife: p.shelfLife || '',
          });

          row.height = 60;
          row.eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          });

          // 이미지 추가
          if (p.imageUrl) {
            const imageData = await fetchImageAsBuffer(p.imageUrl);
            if (imageData) {
              const imageId = workbook.addImage({
                buffer: imageData.buffer,
                extension: imageData.extension,
              });
              worksheet.addImage(imageId, {
                tl: { col: 0, row: rowIndex - 1 },
                ext: { width: 75, height: 55 },
              });
            }
          }

          rowIndex++;
        }
      }
    }

    // 엑셀 파일 생성
    const buffer = await workbook.xlsx.writeBuffer();

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

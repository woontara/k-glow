import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';
import { fal } from '@fal-ai/client';

// 제품 타입 (물류 정보 포함)
interface ProductWithLogistics {
  id: string;
  barcode: string | null;
  nameKr: string;
  nameEn: string | null;
  supplyPrice: number | null;
  msrp: number | null;
  volume: string | null;
  shelfLife: string | null;
  boxQty: number | null;
  imageUrl: string | null;
  itemWeight?: number | null;
  itemSize?: string | null;
  boxWeight?: number | null;
  boxSize?: string | null;
  vatIncluded?: boolean | null;
}

// 이미지 URL에서 base64로 가져오기
async function fetchImageAsBase64(url: string): Promise<{ base64: string; extension: 'png' | 'jpeg' | 'gif' } | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || '';
    let extension: 'png' | 'jpeg' | 'gif' = 'jpeg';
    if (contentType.includes('png')) extension = 'png';
    else if (contentType.includes('gif')) extension = 'gif';

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return { base64, extension };
  } catch {
    return null;
  }
}

// Excel 파일 생성
async function generateExcelFile(
  suppliers: Array<{ id: string; name: string; products: ProductWithLogistics[] }>,
  isAll: boolean,
  includeImages: boolean
): Promise<{ buffer: Buffer; productCount: number }> {
  const workbook = new ExcelJS.Workbook();

  const calculateSupplyPrice = (price: number | null): number | string => {
    if (!price) return '';
    const calculated = price * 1.15;
    return Math.floor(calculated / 100) * 100;
  };

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
  let totalProducts = 0;

  if (isAll) {
    const worksheet = workbook.addWorksheet('전체 제품');
    worksheet.columns = columnsWithImage;

    const headerRow = worksheet.getRow(1);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4A4A4A' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    let rowIndex = 2;
    for (const supplier of suppliers) {
      for (const product of supplier.products) {
        const p = product as ProductWithLogistics;
        const row = worksheet.addRow({
          image: '',
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

        row.height = 60;
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        });

        if (includeImages && p.imageUrl) {
          const imageData = await fetchImageAsBase64(p.imageUrl);
          if (imageData) {
            const imageId = workbook.addImage({
              base64: imageData.base64,
              extension: imageData.extension,
            });
            worksheet.addImage(imageId, {
              tl: { col: 0, row: rowIndex - 1 },
              ext: { width: 75, height: 55 },
            });
          }
        }

        rowIndex++;
        totalProducts++;
      }
    }
  } else {
    for (const supplier of suppliers) {
      if (supplier.products.length === 0) continue;

      const sheetName = supplier.name.substring(0, 31);
      const worksheet = workbook.addWorksheet(sheetName);
      worksheet.columns = columnsWithoutBrand;

      const headerRow = worksheet.getRow(1);
      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4A4A4A' } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      let rowIndex = 2;
      for (const product of supplier.products) {
        const p = product as ProductWithLogistics;
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

        if (includeImages && p.imageUrl) {
          const imageData = await fetchImageAsBase64(p.imageUrl);
          if (imageData) {
            const imageId = workbook.addImage({
              base64: imageData.base64,
              extension: imageData.extension,
            });
            worksheet.addImage(imageId, {
              tl: { col: 0, row: rowIndex - 1 },
              ext: { width: 75, height: 55 },
            });
          }
        }

        rowIndex++;
        totalProducts++;
      }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return { buffer: Buffer.from(buffer), productCount: totalProducts };
}

// Export 파일 생성 및 저장
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  const body = await request.json();
  const { supplierId, includeImages = false } = body;

  try {
    // fal.ai API 키 가져오기
    const aiModel = await prisma.aiModel.findFirst({
      where: { provider: 'fal' }
    });
    if (!aiModel?.apiKey) {
      return NextResponse.json({ error: 'fal.ai API 키가 설정되지 않았습니다' }, { status: 500 });
    }
    fal.config({ credentials: aiModel.apiKey });

    // 데이터 조회
    let suppliers;
    const isAll = !supplierId || supplierId === 'all';

    if (isAll) {
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
    } else {
      suppliers = await prisma.supplier.findMany({
        where: { id: supplierId },
        include: {
          products: {
            where: { isActive: true },
            orderBy: { nameKr: 'asc' }
          }
        }
      });
    }

    // Excel 파일 생성
    const { buffer, productCount } = await generateExcelFile(
      suppliers as Array<{ id: string; name: string; products: ProductWithLogistics[] }>,
      isAll,
      includeImages
    );

    // 파일명 생성
    const date = new Date().toISOString().split('T')[0];
    const fileName = isAll
      ? `K-Glow_전체제품_${date}.xlsx`
      : suppliers.length === 1
        ? `K-Glow_${suppliers[0].name}_${date}.xlsx`
        : `K-Glow_제품목록_${date}.xlsx`;

    // fal.ai 스토리지에 업로드
    const file = new File([buffer], fileName, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const fileUrl = await fal.storage.upload(file);

    // DB에 저장 (upsert)
    const exportRecord = await prisma.supplierExport.upsert({
      where: {
        supplierId_includeImages: {
          supplierId: isAll ? null : supplierId,
          includeImages
        }
      },
      update: {
        fileUrl,
        fileName,
        fileSize: buffer.length,
        productCount,
        updatedAt: new Date()
      },
      create: {
        supplierId: isAll ? null : supplierId,
        fileUrl,
        fileName,
        fileSize: buffer.length,
        productCount,
        includeImages
      }
    });

    return NextResponse.json({
      success: true,
      message: `${productCount}개 제품 내보내기 파일 생성 완료`,
      export: exportRecord
    });

  } catch (error) {
    console.error('Export 파일 생성 실패:', error);
    return NextResponse.json({
      error: '파일 생성에 실패했습니다',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

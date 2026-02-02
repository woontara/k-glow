import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

// 컬럼명 매핑 (다양한 형식의 컬럼명을 표준 필드로 매핑)
const COLUMN_MAPPINGS: Record<string, string[]> = {
  productCode: ['상품코드', '품목코드', 'SKU', 'Code', 'Product Code', '제품코드', 'Item Code', 'No', 'NO', 'no', 'No.'],
  barcode: ['바코드', 'Barcode', 'EAN', 'UPC', 'JAN'],
  name: ['상품명', '품명', '제품명', 'Product Name', 'Name', 'Item Name', '품목명', 'Description', 'PRODUCT', 'Product', 'item'],
  nameEn: ['영문상품명', 'English Name', 'Product Name (EN)', 'Name EN', 'English Product Name'],
  category: ['카테고리', 'Category', '분류', '대분류', 'Main Category', 'Type'],
  subCategory: ['서브카테고리', 'Sub Category', '소분류', '중분류', 'Sub-Category'],
  supplyPrice: ['공급가', '공급가격', 'Supply Price', 'Cost', 'Unit Price', '단가', '원가', 'FOB', 'EXW', 'Price', 'PRICE', '가격'],
  retailPrice: ['소비자가', '권장소비자가', 'Retail Price', 'MSRP', 'SRP', '판매가', '정가', 'Retail'],
  volume: ['용량', 'Volume', 'Size', 'Capacity', '사이즈', 'ML', 'ml', 'g', 'G'],
  weight: ['중량', 'Weight', '무게', 'Net Weight', 'Gross Weight'],
  unit: ['단위', 'Unit', 'UOM'],
  minOrderQty: ['최소주문수량', 'MOQ', 'Min Order', 'Minimum Order Qty', '최소수량'],
  boxQty: ['박스수량', 'Box Qty', 'Carton Qty', '케이스입수', '입수', 'PCS/CTN', 'Inner'],
  imageUrl: ['이미지', 'Image', 'Image URL', '사진', 'Photo', 'Picture']
};

// 컬럼명에서 필드 찾기
function findField(header: string): string | null {
  const normalizedHeader = header.trim().toLowerCase();

  for (const [field, aliases] of Object.entries(COLUMN_MAPPINGS)) {
    for (const alias of aliases) {
      if (normalizedHeader === alias.toLowerCase() ||
          normalizedHeader.includes(alias.toLowerCase()) ||
          alias.toLowerCase().includes(normalizedHeader)) {
        return field;
      }
    }
  }
  return null;
}

// 숫자 추출
function extractNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;

  const str = String(value).replace(/[,\s₩$￦원]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

// Excel 파일 업로드 및 파싱
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const supplierName = formData.get('supplierName') as string;
    const replaceExisting = formData.get('replaceExisting') === 'true';

    if (!file) {
      return NextResponse.json({ error: '파일이 필요합니다' }, { status: 400 });
    }

    if (!supplierName) {
      return NextResponse.json({ error: '공급업체명이 필요합니다' }, { status: 400 });
    }

    // 파일 형식 확인
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      return NextResponse.json({ error: 'Excel 파일(.xlsx, .xls)만 지원합니다' }, { status: 400 });
    }

    // 파일 읽기
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    // 첫 번째 시트 사용
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // JSON으로 변환 (첫 행을 헤더로)
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];

    if (rawData.length < 2) {
      return NextResponse.json({ error: '데이터가 없습니다' }, { status: 400 });
    }

    // 헤더 행 찾기 (첫 번째 비어있지 않은 행)
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const row = rawData[i];
      const nonEmptyCount = row.filter(cell => cell !== '').length;
      if (nonEmptyCount >= 3) {
        headerRowIndex = i;
        break;
      }
    }

    const headers = rawData[headerRowIndex] as string[];
    const dataRows = rawData.slice(headerRowIndex + 1);

    // 헤더 매핑
    const columnMapping: Record<number, string> = {};
    headers.forEach((header, index) => {
      if (header) {
        const field = findField(String(header));
        if (field) {
          columnMapping[index] = field;
        }
      }
    });

    // 공급업체 생성 또는 조회
    let supplier = await prisma.supplier.findUnique({
      where: { name: supplierName }
    });

    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: { name: supplierName }
      });
    }

    // 기존 제품 삭제 (옵션)
    if (replaceExisting) {
      await prisma.supplierProduct.deleteMany({
        where: { supplierId: supplier.id }
      });
    }

    // 제품 데이터 파싱 및 저장
    const products: Array<{
      supplierId: string;
      productCode?: string;
      barcode?: string;
      name: string;
      nameEn?: string;
      category?: string;
      subCategory?: string;
      supplyPrice?: number;
      retailPrice?: number;
      volume?: string;
      weight?: number;
      unit?: string;
      minOrderQty?: number;
      boxQty?: number;
      imageUrl?: string;
      rawData: Record<string, unknown>;
    }> = [];

    for (const row of dataRows) {
      if (!row || row.every(cell => cell === '')) continue;

      // 원본 데이터 저장
      const rawRowData: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        if (header && row[index] !== undefined) {
          rawRowData[String(header)] = row[index];
        }
      });

      // 필드 매핑
      const product: Record<string, unknown> = {
        supplierId: supplier.id,
        rawData: rawRowData
      };

      for (const [colIndex, field] of Object.entries(columnMapping)) {
        const value = row[parseInt(colIndex)];

        if (value === null || value === undefined || value === '') continue;

        switch (field) {
          case 'supplyPrice':
          case 'retailPrice':
          case 'weight':
            product[field] = extractNumber(value);
            break;
          case 'minOrderQty':
          case 'boxQty':
            const num = extractNumber(value);
            product[field] = num ? Math.round(num) : null;
            break;
          case 'volume':
            product[field] = String(value).trim();
            break;
          default:
            product[field] = String(value).trim();
        }
      }

      // 상품명이 있는 경우에만 추가
      if (product.name && String(product.name).trim()) {
        products.push(product as typeof products[0]);
      }
    }

    if (products.length === 0) {
      return NextResponse.json({ error: '유효한 상품 데이터가 없습니다' }, { status: 400 });
    }

    // 일괄 저장
    const created = await prisma.supplierProduct.createMany({
      data: products,
      skipDuplicates: true
    });

    return NextResponse.json({
      message: `${created.count}개의 상품이 등록되었습니다`,
      supplier: {
        id: supplier.id,
        name: supplier.name
      },
      stats: {
        totalRows: dataRows.length,
        validProducts: products.length,
        created: created.count
      },
      headers: headers.filter(h => h),
      mappedFields: Object.values(columnMapping)
    });

  } catch (error) {
    console.error('Excel 업로드 실패:', error);
    return NextResponse.json({
      error: 'Excel 파일 처리에 실패했습니다',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// 업로드 미리보기 (파일 분석만 수행)
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '파일이 필요합니다' }, { status: 400 });
    }

    // 파일 읽기
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];

    // 헤더 행 찾기
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const row = rawData[i];
      const nonEmptyCount = row.filter(cell => cell !== '').length;
      if (nonEmptyCount >= 3) {
        headerRowIndex = i;
        break;
      }
    }

    const headers = rawData[headerRowIndex] as string[];
    const sampleRows = rawData.slice(headerRowIndex + 1, headerRowIndex + 6);

    // 헤더 매핑 분석
    const columnAnalysis = headers.map((header, index) => ({
      index,
      original: header,
      mappedTo: header ? findField(String(header)) : null,
      sampleValues: sampleRows.map(row => row[index]).filter(v => v !== '')
    })).filter(col => col.original);

    return NextResponse.json({
      sheetNames: workbook.SheetNames,
      selectedSheet: sheetName,
      headerRowIndex,
      headers: headers.filter(h => h),
      columnAnalysis,
      totalRows: rawData.length - headerRowIndex - 1,
      sampleData: sampleRows.slice(0, 5)
    });

  } catch (error) {
    console.error('파일 분석 실패:', error);
    return NextResponse.json({
      error: '파일 분석에 실패했습니다',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

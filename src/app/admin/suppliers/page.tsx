'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { fal } from '@fal-ai/client';

interface Supplier {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    products: number;
  };
}

interface ColumnAnalysis {
  index: number;
  original: string;
  mappedTo: string | null;
  sampleValues: unknown[];
}

// 컬럼명 매핑 (업체별 다양한 형식 지원)
const COLUMN_MAPPINGS: Record<string, string[]> = {
  // 핵심 공통 필드
  barcode: ['바코드', 'Barcode', 'Barcode(Case)', 'Barcode(Pouch)', 'EAN', 'UPC'],
  nameKr: ['제품명(한글)', 'Product Name(KR)', 'Product Name (KR)', '상품명', '품명', '제품명', '한글명'],
  nameEn: ['Product Name(EN)', 'Product Name (EN)', '영문상품명', 'English Name', 'Product Name'],
  msrp: ['MSRP', 'MSRP (KRW)', '소비자가', '권장소비자가', 'Retail Price', 'SRP', '정가'],
  supplyPrice: ['Supply Price', 'SUPPLY PRICE', 'SUPPLY PRICE (-VAT)', 'SUPPLY PRICE(-VAT)', 'Supply Price (KRW/-VAT)', '공급가', '공급가격'],
  // 선택적 필드
  productCode: ['Product Code', '상품코드', '품목코드', 'SKU', 'Code'],
  volume: ['Volume', '용량', 'Size', 'Capacity', 'ml', 'ML'],
  shelfLife: ['Shelf Life', 'Shelf Life (Month)', 'Shelf Life(Month)', '유통기한'],
  boxQty: ['QTY per Shipping box', 'QTY per Shipping box (EA)', 'Qty per inbox', 'Qty per outbox', "Q'ty", '박스수량', 'Box Qty', '입수'],
  imageUrl: ['SKU Image', 'SKU image', 'Product Image', 'Image', 'image', '이미지', '제품이미지'],
};

// 컬럼명 정규화 (줄바꿈, 여러 공백 제거)
function normalizeHeader(header: string): string {
  return header.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function findField(header: string): string | null {
  const normalizedHeader = normalizeHeader(header).toLowerCase();
  for (const [field, aliases] of Object.entries(COLUMN_MAPPINGS)) {
    for (const alias of aliases) {
      const normalizedAlias = alias.toLowerCase();
      if (normalizedHeader === normalizedAlias ||
          normalizedHeader.includes(normalizedAlias) ||
          normalizedAlias.includes(normalizedHeader)) {
        return field;
      }
    }
  }
  return null;
}

function extractNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  const str = String(value).replace(/[,\s₩$￦원]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // 업로드 모달 상태
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [parsedData, setParsedData] = useState<{
    headers: string[];
    columnAnalysis: ColumnAnalysis[];
    totalRows: number;
    products: Record<string, unknown>[];
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [parsing, setParsing] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    stats?: { totalRows: number; created: number; updated: number; skipped: number };
  } | null>(null);

  // 공급업체 생성 모달
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    notes: ''
  });

  const fetchSuppliers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/suppliers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('공급업체 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // 이미지를 Base64 Data URL로 변환
  const imageToDataUrl = (buffer: ArrayBuffer, extension: string): string => {
    const base64 = btoa(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  };

  // 클라이언트에서 Excel 파싱
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setParsedData(null);
    setUploadResult(null);

    // 파일명에서 공급업체명 추출
    const fileName = file.name.replace(/\.(xlsx|xls)$/i, '');
    const brandMatch = fileName.match(/^([A-Za-z]+)/);
    if (brandMatch) {
      setSupplierName(brandMatch[1].toUpperCase());
    }

    try {
      const buffer = await file.arrayBuffer();

      // 1. xlsx로 데이터 파싱
      const xlsxWorkbook = XLSX.read(buffer, { type: 'array' });

      // 가장 적합한 시트 찾기 (PRODUCT LIST 우선, 없으면 데이터가 가장 많은 시트)
      let bestSheetName = xlsxWorkbook.SheetNames[0];
      let bestSheetIndex = 0;

      // "PRODUCT LIST" 또는 유사한 이름 찾기
      const productSheetNames = ['PRODUCT LIST', 'PRODUCTS', '상품목록', '제품목록', 'LIST'];
      for (const name of xlsxWorkbook.SheetNames) {
        const upperName = name.toUpperCase();
        if (productSheetNames.some(pn => upperName.includes(pn))) {
          bestSheetName = name;
          bestSheetIndex = xlsxWorkbook.SheetNames.indexOf(name);
          console.log(`제품 시트 발견: "${name}"`);
          break;
        }
      }

      // 특별한 시트를 못 찾았다면, 데이터가 가장 많은 시트 선택
      if (bestSheetIndex === 0 && xlsxWorkbook.SheetNames.length > 1) {
        let maxCells = 0;
        for (let i = 0; i < xlsxWorkbook.SheetNames.length; i++) {
          const sheetName = xlsxWorkbook.SheetNames[i];
          const sheet = xlsxWorkbook.Sheets[sheetName];
          const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
          const cellCount = (range.e.r - range.s.r + 1) * (range.e.c - range.s.c + 1);
          if (cellCount > maxCells) {
            maxCells = cellCount;
            bestSheetName = sheetName;
            bestSheetIndex = i;
          }
        }
        console.log(`가장 큰 시트 선택: "${bestSheetName}" (인덱스: ${bestSheetIndex})`);
      }

      console.log(`시트 목록: ${xlsxWorkbook.SheetNames.join(', ')} | 선택된 시트: "${bestSheetName}"`);

      const sheet = xlsxWorkbook.Sheets[bestSheetName];
      const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];

      if (rawData.length < 2) {
        setUploadResult({ success: false, message: '데이터가 없습니다' });
        setParsing(false);
        return;
      }

      // 2. exceljs로 이미지 추출 (같은 시트 인덱스 사용)
      const imageMap = new Map<number, string>(); // row -> image data URL
      try {
        const excelWorkbook = new ExcelJS.Workbook();
        await excelWorkbook.xlsx.load(buffer);
        const worksheet = excelWorkbook.worksheets[bestSheetIndex];

        if (worksheet) {
          const images = worksheet.getImages();
          for (const image of images) {
            const img = excelWorkbook.getImage(Number(image.imageId));
            if (img && img.buffer && image.range) {
              // 이미지가 위치한 행 (tl = top-left)
              const row = image.range.tl.row;
              const dataUrl = imageToDataUrl(img.buffer as ArrayBuffer, img.extension || 'png');
              imageMap.set(Math.floor(row), dataUrl);
            }
          }
        }
        console.log(`이미지 ${imageMap.size}개 추출됨`);
      } catch (imgError) {
        console.warn('이미지 추출 실패 (계속 진행):', imgError);
      }

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

      const headers = (rawData[headerRowIndex] as string[]).map(h => String(h || ''));
      const dataRows = rawData.slice(headerRowIndex + 1);

      // 컬럼 매핑
      const columnMapping: Record<number, string> = {};
      headers.forEach((header, index) => {
        if (header) {
          const field = findField(header);
          if (field) {
            columnMapping[index] = field;
          }
        }
      });

      // 컬럼 분석
      const sampleRows = dataRows.slice(0, 5);
      const columnAnalysis: ColumnAnalysis[] = headers.map((header, index) => ({
        index,
        original: header,
        mappedTo: header ? findField(header) : null,
        sampleValues: sampleRows.map(row => row[index]).filter(v => v !== '')
      })).filter(col => col.original);

      // 제품 데이터 파싱
      const products: Record<string, unknown>[] = [];
      for (let rowIdx = 0; rowIdx < dataRows.length; rowIdx++) {
        const row = dataRows[rowIdx];
        if (!row || row.every(cell => cell === '')) continue;

        const rawRowData: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          if (header && row[index] !== undefined) {
            rawRowData[header] = row[index];
          }
        });

        const product: Record<string, unknown> = { rawData: rawRowData };

        for (const [colIndex, field] of Object.entries(columnMapping)) {
          const value = row[parseInt(colIndex)];
          if (value === null || value === undefined || value === '') continue;

          switch (field) {
            case 'supplyPrice':
            case 'msrp':
              product[field] = extractNumber(value);
              break;
            case 'boxQty':
              const num = extractNumber(value);
              product[field] = num ? Math.round(num) : null;
              break;
            case 'imageUrl':
              // URL 문자열인 경우
              if (typeof value === 'string' && value.startsWith('http')) {
                product[field] = value.trim();
              }
              break;
            default:
              product[field] = String(value).trim();
          }
        }

        // 임베딩 이미지가 있으면 추가 (ExcelJS는 0-based, 실제 Excel 행 = headerRowIndex + 1 + rowIdx)
        const excelRow = headerRowIndex + 1 + rowIdx;
        if (!product.imageUrl && imageMap.has(excelRow)) {
          product.imageUrl = imageMap.get(excelRow);
        }

        if (product.nameKr && String(product.nameKr).trim()) {
          products.push(product);
        }
      }

      // 이미지가 있는 제품 수 표시
      const productsWithImages = products.filter(p => p.imageUrl).length;
      console.log(`이미지가 있는 제품: ${productsWithImages}개`);

      setParsedData({
        headers: headers.filter(h => h),
        columnAnalysis,
        totalRows: dataRows.length,
        products
      });

    } catch (error) {
      console.error('파일 파싱 실패:', error);
      setUploadResult({ success: false, message: '파일 파싱에 실패했습니다' });
    } finally {
      setParsing(false);
    }
  };

  // Base64 Data URL을 Blob으로 변환
  const dataUrlToBlob = (dataUrl: string): Blob => {
    const [header, base64] = dataUrl.split(',');
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mime });
  };

  // 이미지를 fal.ai 스토리지에 업로드
  const uploadImageToStorage = async (dataUrl: string, index: number): Promise<string> => {
    const blob = dataUrlToBlob(dataUrl);
    const file = new File([blob], `product-image-${index}.png`, { type: blob.type });
    const url = await fal.storage.upload(file);
    return url;
  };

  // 서버에 데이터 전송
  const handleUpload = async () => {
    if (!parsedData || !supplierName) return;

    setUploading(true);
    setUploadResult(null);
    setUploadProgress('준비 중...');

    try {
      // 1. fal.ai API 키 가져오기
      setUploadProgress('이미지 업로드 준비 중...');
      const keyResponse = await fetch('/api/ai-tools/key?modelId=any');
      if (!keyResponse.ok) {
        throw new Error('이미지 업로드 키를 가져올 수 없습니다');
      }
      const keyData = await keyResponse.json();
      fal.config({ credentials: keyData.apiKey });

      // 2. Base64 이미지를 fal.ai 스토리지에 업로드
      const productsWithUrls = [...parsedData.products];
      const imagesWithBase64 = productsWithUrls.filter(
        p => p.imageUrl && String(p.imageUrl).startsWith('data:')
      );

      if (imagesWithBase64.length > 0) {
        let uploadedCount = 0;
        console.log(`이미지 ${imagesWithBase64.length}개 업로드 중...`);

        for (let i = 0; i < productsWithUrls.length; i++) {
          const product = productsWithUrls[i];
          if (product.imageUrl && String(product.imageUrl).startsWith('data:')) {
            try {
              setUploadProgress(`이미지 업로드 중... (${uploadedCount + 1}/${imagesWithBase64.length})`);
              const url = await uploadImageToStorage(String(product.imageUrl), i);
              productsWithUrls[i] = { ...product, imageUrl: url };
              uploadedCount++;
              console.log(`이미지 ${uploadedCount}/${imagesWithBase64.length} 업로드 완료`);
            } catch (imgError) {
              console.warn(`이미지 ${i + 1} 업로드 실패:`, imgError);
              productsWithUrls[i] = { ...product, imageUrl: null };
            }
          }
        }
      }

      // 3. 서버에 제품 데이터 전송
      setUploadProgress('제품 데이터 저장 중...');
      const response = await fetch('/api/admin/suppliers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierName,
          replaceExisting,
          products: productsWithUrls
        })
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult({
          success: true,
          message: data.message,
          stats: data.stats
        });
        fetchSuppliers();
      } else {
        setUploadResult({
          success: false,
          message: `${data.error || '업로드 실패'}${data.details ? ` - ${data.details}` : ''}`
        });
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: '업로드 중 오류가 발생했습니다'
      });
      console.error('업로드 실패:', error);
    } finally {
      setUploading(false);
    }
  };

  // 공급업체 생성
  const handleCreateSupplier = async () => {
    if (!newSupplier.name) return;

    try {
      const response = await fetch('/api/admin/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewSupplier({
          name: '',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          website: '',
          notes: ''
        });
        fetchSuppliers();
      }
    } catch (error) {
      console.error('공급업체 생성 실패:', error);
    }
  };

  // 공급업체 삭제
  const handleDeleteSupplier = async (id: string, name: string) => {
    if (!confirm(`"${name}" 공급업체와 모든 제품을 삭제하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/admin/suppliers/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchSuppliers();
      }
    } catch (error) {
      console.error('공급업체 삭제 실패:', error);
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSupplierName('');
    setReplaceExisting(false);
    setParsedData(null);
    setUploadResult(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">공급업체 관리</h1>
          <p className="text-gray-600">한국 화장품 공급업체 및 제품 리스트를 관리합니다</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Excel 업로드
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            + 공급업체 추가
          </button>
        </div>
      </div>

      {/* 검색 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="공급업체명 또는 담당자 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* 공급업체 목록 */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 mb-4">등록된 공급업체가 없습니다</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            Excel 파일 업로드로 시작하기
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{supplier.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      supplier.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {supplier.isActive ? '활성' : '비활성'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    {supplier.contactName && (
                      <span>담당자: {supplier.contactName}</span>
                    )}
                    {supplier.contactEmail && (
                      <span>이메일: {supplier.contactEmail}</span>
                    )}
                    {supplier.contactPhone && (
                      <span>연락처: {supplier.contactPhone}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm font-medium">
                      제품 {supplier._count.products}개
                    </span>
                    <span className="text-sm text-gray-400">
                      등록일: {new Date(supplier.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/suppliers/${supplier.id}`}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    상세보기
                  </Link>
                  <button
                    onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 모달 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">제품 리스트 업로드</h2>
              <p className="text-sm text-gray-500 mt-1">Excel 파일을 선택하면 자동으로 분석됩니다</p>
            </div>

            <div className="p-6 space-y-6">
              {/* 파일 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excel 파일 선택
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-400 transition-colors cursor-pointer"
                />
                {parsing && (
                  <p className="mt-2 text-sm text-gray-500">파일 분석 중...</p>
                )}
              </div>

              {/* 공급업체명 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  공급업체명 *
                </label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="예: TIRTIR, BEPLAIN, ABIB"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* 옵션 */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="replaceExisting"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="w-4 h-4 text-pink-600 rounded"
                />
                <label htmlFor="replaceExisting" className="text-sm text-gray-600">
                  기존 제품 데이터 교체 (체크하지 않으면 추가됨)
                </label>
              </div>

              {/* 미리보기 */}
              {parsedData && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">파일 분석 결과</h4>
                  <div className="space-y-2 text-sm">
                    <p>총 데이터 행: <span className="font-semibold">{parsedData.totalRows}개</span></p>
                    <p>유효 상품: <span className="font-semibold text-pink-600">{parsedData.products.length}개</span></p>
                    <p>이미지 포함: <span className="font-semibold text-blue-600">{parsedData.products.filter(p => p.imageUrl).length}개</span></p>
                    <p>인식된 컬럼:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {parsedData.columnAnalysis.map((col, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 rounded text-xs ${
                            col.mappedTo
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {col.original} {col.mappedTo && `→ ${col.mappedTo}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 업로드 결과 */}
              {uploadResult && (
                <div className={`p-4 rounded-lg ${
                  uploadResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  <p className="font-medium">{uploadResult.message}</p>
                  {uploadResult.stats && (
                    <p className="text-sm mt-1">
                      전체 {uploadResult.stats.totalRows}개 중 신규 {uploadResult.stats.created}개, 업데이트 {uploadResult.stats.updated}개
                      {uploadResult.stats.skipped > 0 && `, 건너뜀 ${uploadResult.stats.skipped}개`}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeUploadModal}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                닫기
              </button>
              <button
                onClick={handleUpload}
                disabled={!parsedData || !supplierName || uploading}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? uploadProgress : `${parsedData?.products.length || 0}개 상품 업로드`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공급업체 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">공급업체 추가</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">공급업체명 *</label>
                <input
                  type="text"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">담당자명</label>
                <input
                  type="text"
                  value={newSupplier.contactName}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contactName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={newSupplier.contactEmail}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                <input
                  type="tel"
                  value={newSupplier.contactPhone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contactPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
                <textarea
                  value={newSupplier.notes}
                  onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreateSupplier}
                disabled={!newSupplier.name}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

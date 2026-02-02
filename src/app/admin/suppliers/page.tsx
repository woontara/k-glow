'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

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

interface UploadPreview {
  headers: string[];
  columnAnalysis: ColumnAnalysis[];
  totalRows: number;
  sampleData: unknown[][];
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // 업로드 모달 상태
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [supplierName, setSupplierName] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<UploadPreview | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    stats?: { totalRows: number; validProducts: number; created: number };
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

  // 파일 선택 시 미리보기
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setUploadPreview(null);
    setUploadResult(null);

    // 파일명에서 공급업체명 추출 시도
    const fileName = file.name.replace(/\.(xlsx|xls)$/i, '');
    const brandMatch = fileName.match(/^([A-Za-z]+)/);
    if (brandMatch) {
      setSupplierName(brandMatch[1].toUpperCase());
    }

    // 미리보기 요청
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/suppliers/upload', {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setUploadPreview(data);
      }
    } catch (error) {
      console.error('파일 분석 실패:', error);
    }
  };

  // 업로드 실행
  const handleUpload = async () => {
    if (!uploadFile || !supplierName) return;

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('supplierName', supplierName);
    formData.append('replaceExisting', String(replaceExisting));

    try {
      const response = await fetch('/api/admin/suppliers/upload', {
        method: 'POST',
        body: formData
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
          message: data.error || '업로드 실패'
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
    setUploadFile(null);
    setSupplierName('');
    setReplaceExisting(false);
    setUploadPreview(null);
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
              <p className="text-sm text-gray-500 mt-1">Excel 파일을 업로드하여 제품 데이터를 등록합니다</p>
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
              {uploadPreview && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">파일 분석 결과</h4>
                  <div className="space-y-2 text-sm">
                    <p>총 데이터 행: <span className="font-semibold">{uploadPreview.totalRows}개</span></p>
                    <p>인식된 컬럼:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {uploadPreview.columnAnalysis.map((col, idx) => (
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
                      전체 {uploadResult.stats.totalRows}행 중 {uploadResult.stats.validProducts}개 유효, {uploadResult.stats.created}개 등록됨
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
                disabled={!uploadFile || !supplierName || uploading}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? '업로드 중...' : '업로드'}
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

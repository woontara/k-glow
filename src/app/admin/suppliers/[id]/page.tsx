'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

interface SupplierProduct {
  id: string;
  productCode: string | null;
  barcode: string | null;
  name: string;
  nameEn: string | null;
  category: string | null;
  subCategory: string | null;
  supplyPrice: number | null;
  retailPrice: number | null;
  currency: string;
  volume: string | null;
  weight: number | null;
  minOrderQty: number | null;
  boxQty: number | null;
  imageUrl: string | null;
  rawData: Record<string, unknown>;
}

interface ProductsResponse {
  products: SupplierProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.id as string;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<SupplierProduct | null>(null);

  // 편집 모달
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    notes: ''
  });

  const fetchSupplier = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/suppliers/${supplierId}`);
      if (response.ok) {
        const data = await response.json();
        setSupplier(data);
        setEditData({
          name: data.name,
          contactName: data.contactName || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          website: data.website || '',
          notes: data.notes || ''
        });
      } else if (response.status === 404) {
        router.push('/admin/suppliers');
      }
    } catch (error) {
      console.error('공급업체 조회 실패:', error);
    }
  }, [supplierId, router]);

  const fetchProducts = useCallback(async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '50'
      });
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/suppliers/${supplierId}/products?${params}`);
      if (response.ok) {
        const data: ProductsResponse = await response.json();
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('제품 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [supplierId, search]);

  useEffect(() => {
    fetchSupplier();
  }, [fetchSupplier]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleUpdateSupplier = async () => {
    try {
      const response = await fetch(`/api/admin/suppliers/${supplierId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        setShowEditModal(false);
        fetchSupplier();
      }
    } catch (error) {
      console.error('공급업체 수정 실패:', error);
    }
  };

  const handleDeleteAllProducts = async () => {
    if (!confirm('모든 제품을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.')) return;

    try {
      const response = await fetch(`/api/admin/suppliers/${supplierId}/products`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchProducts();
        fetchSupplier();
      }
    } catch (error) {
      console.error('제품 삭제 실패:', error);
    }
  };

  const formatPrice = (price: number | null, currency: string) => {
    if (price === null) return '-';
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency === 'KRW' ? 'KRW' : 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!supplier) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/suppliers"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{supplier.name}</h1>
          <p className="text-gray-600">제품 {supplier._count.products}개</p>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          정보 수정
        </button>
      </div>

      {/* 공급업체 정보 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4">공급업체 정보</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">담당자</span>
            <p className="font-medium">{supplier.contactName || '-'}</p>
          </div>
          <div>
            <span className="text-gray-500">이메일</span>
            <p className="font-medium">{supplier.contactEmail || '-'}</p>
          </div>
          <div>
            <span className="text-gray-500">연락처</span>
            <p className="font-medium">{supplier.contactPhone || '-'}</p>
          </div>
          <div>
            <span className="text-gray-500">웹사이트</span>
            <p className="font-medium">
              {supplier.website ? (
                <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">
                  {supplier.website}
                </a>
              ) : '-'}
            </p>
          </div>
        </div>
        {supplier.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-gray-500 text-sm">메모</span>
            <p className="mt-1 text-gray-700">{supplier.notes}</p>
          </div>
        )}
      </div>

      {/* 제품 목록 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">제품 목록</h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="제품명, 코드 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
              />
              {products.length > 0 && (
                <button
                  onClick={handleDeleteAllProducts}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  전체 삭제
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">로딩 중...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {search ? '검색 결과가 없습니다' : '등록된 제품이 없습니다'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">코드</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품명</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">공급가</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">소비자가</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">용량</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">MOQ</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                        {product.productCode || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        {product.nameEn && (
                          <div className="text-xs text-gray-500">{product.nameEn}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {product.category || '-'}
                        {product.subCategory && ` > ${product.subCategory}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatPrice(product.supplyPrice, product.currency)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">
                        {formatPrice(product.retailPrice, product.currency)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-500">
                        {product.volume || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-500">
                        {product.minOrderQty || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="text-pink-600 hover:text-pink-700 text-sm"
                        >
                          상세
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  총 {pagination.total}개 중 {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)}개
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchProducts(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                  >
                    이전
                  </button>
                  <span className="px-3 py-1 text-sm">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchProducts(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 제품 상세 모달 */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">{selectedProduct.name}</h2>
              {selectedProduct.nameEn && (
                <p className="text-gray-500">{selectedProduct.nameEn}</p>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">상품 코드</label>
                  <p className="font-medium">{selectedProduct.productCode || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">바코드</label>
                  <p className="font-medium font-mono">{selectedProduct.barcode || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">공급가</label>
                  <p className="font-medium text-lg">{formatPrice(selectedProduct.supplyPrice, selectedProduct.currency)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">소비자가</label>
                  <p className="font-medium">{formatPrice(selectedProduct.retailPrice, selectedProduct.currency)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">용량</label>
                  <p className="font-medium">{selectedProduct.volume || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">중량</label>
                  <p className="font-medium">{selectedProduct.weight ? `${selectedProduct.weight}g` : '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">최소 주문량</label>
                  <p className="font-medium">{selectedProduct.minOrderQty || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">박스 수량</label>
                  <p className="font-medium">{selectedProduct.boxQty || '-'}</p>
                </div>
              </div>

              {/* 원본 데이터 */}
              <div className="pt-4 border-t border-gray-200">
                <label className="text-sm text-gray-500 block mb-2">원본 데이터</label>
                <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs text-gray-600">
                    {JSON.stringify(selectedProduct.rawData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공급업체 편집 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">공급업체 정보 수정</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">공급업체명</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">담당자명</label>
                <input
                  type="text"
                  value={editData.contactName}
                  onChange={(e) => setEditData({ ...editData, contactName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={editData.contactEmail}
                  onChange={(e) => setEditData({ ...editData, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                <input
                  type="tel"
                  value={editData.contactPhone}
                  onChange={(e) => setEditData({ ...editData, contactPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">웹사이트</label>
                <input
                  type="url"
                  value={editData.website}
                  onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleUpdateSupplier}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

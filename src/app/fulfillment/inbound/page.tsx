'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProductItem {
  id: string;
  productName: string;
  barcode: string;
  quantity: number;
  boxCount: number;
}

export default function FulfillmentInboundPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    brandName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    expectedDate: '',
    notes: '',
  });

  const [products, setProducts] = useState<ProductItem[]>([
    { id: '1', productName: '', barcode: '', quantity: 0, boxCount: 0 },
  ]);

  const addProduct = () => {
    setProducts([
      ...products,
      { id: Date.now().toString(), productName: '', barcode: '', quantity: 0, boxCount: 0 },
    ]);
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const updateProduct = (id: string, field: keyof ProductItem, value: string | number) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const getTotalQuantity = () => products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const getTotalBoxes = () => products.reduce((sum, p) => sum + (p.boxCount || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.brandName || !formData.contactEmail) {
      alert('필수 항목을 모두 입력해주세요');
      return;
    }

    const validProducts = products.filter((p) => p.productName && p.quantity > 0);
    if (validProducts.length === 0) {
      alert('최소 1개 이상의 제품 정보를 입력해주세요');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/fulfillment/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          products: validProducts,
          totalQuantity: getTotalQuantity(),
          totalBoxes: getTotalBoxes(),
        }),
      });

      if (!response.ok) {
        throw new Error('신청 실패');
      }

      alert('입고 신청이 완료되었습니다!\n\n담당자가 확인 후 연락드리겠습니다.');
      router.push('/');
    } catch (error) {
      console.error('신청 실패:', error);
      alert('신청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FAFBFC] to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#8BA4B4] hover:text-[#5A7A8A] transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            홈으로
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#9B6B9E] to-[#C49BC8] rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#2D3436]">Wildberries 입고 신청</h1>
              <p className="text-[#636E72]">풀필먼트 센터 입고를 위한 물류 대행</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8">
          {/* 1. 브랜드/담당자 정보 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#9B6B9E] text-white rounded-full flex items-center justify-center text-sm">1</span>
              브랜드 및 담당자 정보
            </h3>
            <div className="space-y-4 pl-10">
              <div>
                <label className="block text-sm font-medium mb-2">
                  브랜드명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder="예: 아모레퍼시픽"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9B6B9E] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">담당자명</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="홍길동"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9B6B9E] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">연락처</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="010-1234-5678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9B6B9E] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="example@company.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9B6B9E] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. 입고 제품 정보 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#9B6B9E] text-white rounded-full flex items-center justify-center text-sm">2</span>
              입고 제품 정보
            </h3>
            <div className="space-y-4 pl-10">
              {products.map((product, index) => (
                <div key={product.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-600">제품 #{index + 1}</span>
                    {products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        className="text-red-500 hover:text-red-600 text-sm"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={product.productName}
                        onChange={(e) => updateProduct(product.id, 'productName', e.target.value)}
                        placeholder="제품명"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B6B9E] focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={product.barcode}
                        onChange={(e) => updateProduct(product.id, 'barcode', e.target.value)}
                        placeholder="바코드 (선택)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B6B9E] focus:border-transparent text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={product.quantity || ''}
                        onChange={(e) => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 0)}
                        placeholder="수량"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B6B9E] focus:border-transparent text-sm"
                      />
                      <input
                        type="number"
                        value={product.boxCount || ''}
                        onChange={(e) => updateProduct(product.id, 'boxCount', parseInt(e.target.value) || 0)}
                        placeholder="박스 수"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B6B9E] focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addProduct}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#9B6B9E] hover:text-[#9B6B9E] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                제품 추가
              </button>

              {/* 합계 표시 */}
              <div className="flex justify-end gap-6 pt-2 text-sm">
                <span className="text-gray-600">
                  총 수량: <strong className="text-[#9B6B9E]">{getTotalQuantity().toLocaleString()}개</strong>
                </span>
                <span className="text-gray-600">
                  총 박스: <strong className="text-[#9B6B9E]">{getTotalBoxes().toLocaleString()}박스</strong>
                </span>
              </div>
            </div>
          </div>

          {/* 3. 추가 요청사항 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm">3</span>
              추가 요청사항 (선택)
            </h3>
            <div className="pl-10">
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="특별 포장 요청, 긴급 배송 등 추가 요청사항을 입력해주세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#9B6B9E] focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* 안내 사항 */}
          <div className="bg-[#9B6B9E]/10 border border-[#9B6B9E]/30 rounded-xl p-5">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-[#9B6B9E] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-[#2D3436] mb-2">입고 신청 안내</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 신청 후 담당자가 1-2 영업일 내 연락드립니다.</li>
                  <li>• 정확한 견적은 제품 정보 확인 후 안내됩니다.</li>
                  <li>• 인증이 필요한 제품은 EAC/GOST 인증을 먼저 진행해주세요.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !formData.brandName || !formData.contactEmail}
              className="flex-1 px-6 py-4 bg-[#9B6B9E] text-white font-semibold rounded-xl hover:bg-[#8A5A8D] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
            >
              {loading ? '신청 중...' : '입고 신청하기'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

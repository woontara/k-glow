'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageWrapper, { Card, InfoBox } from '@/components/ui/PageWrapper';

interface Product {
  id: string;
  name: string;
  nameRu: string;
  category: string;
  price: number;
  priceRub: number;
  ingredients: string[];
  ingredientsRu: string[];
  description: string;
  descriptionRu: string;
  imageUrls: string[];
}

interface PartnerDetail {
  id: string;
  name: string;
  nameRu: string;
  websiteUrl: string;
  logoUrl?: string;
  description: string;
  descriptionRu: string;
  marketScore: number;
  products: Product[];
  createdAt: string;
  updatedAt: string;
}

export default function PartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [partner, setPartner] = useState<PartnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (id) {
      loadPartner();
    }
  }, [id]);

  const loadPartner = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/partners/${id}`);
      if (!response.ok) {
        throw new Error('파트너사를 찾을 수 없습니다');
      }
      const data = await response.json();
      setPartner(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="파트너사 상세" badge="Partner">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-[#8BA4B4] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#636E72]">파트너사 정보를 불러오는 중...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error || !partner) {
    return (
      <PageWrapper title="파트너사 상세" badge="Partner">
        <Card hover={false} className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#E8B4B8]/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#E8B4B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-[#2D3436] mb-2">{error || '파트너사를 찾을 수 없습니다'}</p>
          <button
            onClick={() => router.push('/partners')}
            className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white font-medium rounded-xl hover:shadow-lg transition-all"
          >
            목록으로 돌아가기
          </button>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={partner.name} subtitle={partner.nameRu} badge="Partner">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => router.push('/partners')}
        className="mb-6 text-[#8BA4B4] hover:text-[#5A7A8A] flex items-center gap-2 font-medium transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        목록으로 돌아가기
      </button>

      {/* 파트너사 정보 카드 */}
      <Card hover={false} className="mb-6 overflow-hidden p-0">
        <div className="bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] p-6">
          <div className="flex items-start gap-6">
            {partner.logoUrl && (
              <div className="w-24 h-24 flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-2xl p-2">
                <img
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1 text-white">
              <h1 className="text-2xl font-bold mb-1">{partner.name}</h1>
              <p className="text-white/80 mb-4">{partner.nameRu}</p>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-white/70 text-sm">시장 적합도:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-white/20 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full"
                        style={{ width: `${partner.marketScore}%` }}
                      />
                    </div>
                    <span className="font-bold">{partner.marketScore}점</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="font-semibold">{partner.products.length}</span>
                  <span className="text-white/70">제품</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 설명 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E2D9]">
              <span className="text-xs font-medium text-[#636E72] uppercase tracking-wider mb-2 block">한국어 설명</span>
              <p className="text-sm text-[#2D3436] leading-relaxed">{partner.description}</p>
            </div>
            <div className="p-4 bg-[#8BA4B4]/5 rounded-xl border border-[#8BA4B4]/20">
              <span className="text-xs font-medium text-[#8BA4B4] uppercase tracking-wider mb-2 block">러시아어 설명</span>
              <p className="text-sm text-[#2D3436] leading-relaxed">{partner.descriptionRu}</p>
            </div>
          </div>

          {/* 웹사이트 링크 */}
          <a
            href={partner.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white font-medium rounded-xl shadow-lg shadow-[#8BA4B4]/25 hover:shadow-xl hover:shadow-[#8BA4B4]/30 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            공식 웹사이트 방문
          </a>
        </div>
      </Card>

      {/* 제품 목록 */}
      <Card hover={false}>
        <h2 className="text-xl font-semibold text-[#2D3436] mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          제품 목록 ({partner.products.length}개)
        </h2>

        {partner.products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#8BA4B4]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-[#636E72]">등록된 제품이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {partner.products.map((product) => (
              <div
                key={product.id}
                className="group bg-[#FAF8F5] border border-[#E8E2D9] rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#8BA4B4]/30 transition-all cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                {/* 제품 이미지 */}
                {product.imageUrls && product.imageUrls.length > 0 && (
                  <div className="relative h-48 bg-white overflow-hidden">
                    <img
                      src={
                        typeof product.imageUrls === 'string'
                          ? product.imageUrls
                          : product.imageUrls[0]
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-[#8BA4B4]/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg">
                        {product.category}
                      </span>
                    </div>
                  </div>
                )}

                {/* 제품 정보 */}
                <div className="p-4">
                  <h3 className="font-semibold text-[#2D3436] mb-1 group-hover:text-[#5A7A8A] transition-colors">{product.name}</h3>
                  <p className="text-sm text-[#8BA4B4] mb-3">{product.nameRu}</p>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-bold text-[#2D3436]">
                      ₩{product.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-[#636E72]">
                      ₽{product.priceRub.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm text-[#636E72] line-clamp-2 mb-3">{product.description}</p>

                  {/* 성분 미리보기 */}
                  {product.ingredients && product.ingredients.length > 0 && (
                    <div className="pt-3 border-t border-[#E8E2D9]">
                      <p className="text-xs font-medium text-[#5A7A8A] mb-1.5">주요 성분</p>
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(product.ingredients) ? product.ingredients : [product.ingredients])
                          .slice(0, 3)
                          .map((ingredient, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-white border border-[#E8E2D9] rounded text-xs text-[#636E72]"
                            >
                              {ingredient}
                            </span>
                          ))}
                        {Array.isArray(product.ingredients) && product.ingredients.length > 3 && (
                          <span className="px-2 py-0.5 text-xs text-[#8BA4B4]">
                            +{product.ingredients.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 제품 상세 모달 */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-[#2D3436]/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-white border-b border-[#E8E2D9] p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#2D3436]">제품 상세</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#FAF8F5] transition-colors"
              >
                <svg className="w-5 h-5 text-[#636E72]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6">
              {/* 이미지 */}
              {selectedProduct.imageUrls && selectedProduct.imageUrls.length > 0 && (
                <div className="mb-6">
                  <img
                    src={
                      typeof selectedProduct.imageUrls === 'string'
                        ? selectedProduct.imageUrls
                        : selectedProduct.imageUrls[0]
                    }
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
              )}

              {/* 제품명 */}
              <div className="mb-4">
                <span className="px-2.5 py-1 bg-[#8BA4B4]/10 text-[#5A7A8A] text-xs font-medium rounded-lg">
                  {selectedProduct.category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#2D3436] mb-1">{selectedProduct.name}</h2>
              <p className="text-[#8BA4B4] mb-4">{selectedProduct.nameRu}</p>

              {/* 가격 */}
              <div className="flex items-baseline gap-3 mb-6 p-4 bg-[#FAF8F5] rounded-xl">
                <span className="text-2xl font-bold text-[#2D3436]">
                  ₩{selectedProduct.price.toLocaleString()}
                </span>
                <span className="text-lg text-[#8BA4B4]">
                  ₽{selectedProduct.priceRub.toLocaleString()}
                </span>
              </div>

              {/* 설명 */}
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E2D9]">
                  <span className="text-xs font-medium text-[#636E72] uppercase tracking-wider mb-2 block">한국어 설명</span>
                  <p className="text-sm text-[#2D3436] leading-relaxed">{selectedProduct.description}</p>
                </div>
                <div className="p-4 bg-[#8BA4B4]/5 rounded-xl border border-[#8BA4B4]/20">
                  <span className="text-xs font-medium text-[#8BA4B4] uppercase tracking-wider mb-2 block">러시아어 설명</span>
                  <p className="text-sm text-[#2D3436] leading-relaxed">{selectedProduct.descriptionRu}</p>
                </div>
              </div>

              {/* 성분 */}
              {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E2D9]">
                    <span className="text-xs font-medium text-[#636E72] uppercase tracking-wider mb-3 block">성분 (한국어)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(selectedProduct.ingredients) ? selectedProduct.ingredients : [selectedProduct.ingredients]).map((ingredient, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-white border border-[#E8E2D9] rounded-lg text-xs text-[#2D3436]"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-[#8BA4B4]/5 rounded-xl border border-[#8BA4B4]/20">
                    <span className="text-xs font-medium text-[#8BA4B4] uppercase tracking-wider mb-3 block">성분 (러시아어)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProduct.ingredientsRu && selectedProduct.ingredientsRu.length > 0 ? (
                        (Array.isArray(selectedProduct.ingredientsRu) ? selectedProduct.ingredientsRu : [selectedProduct.ingredientsRu]).map((ingredient, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-white border border-[#8BA4B4]/30 rounded-lg text-xs text-[#2D3436]"
                          >
                            {ingredient}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-[#636E72]">번역 없음</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

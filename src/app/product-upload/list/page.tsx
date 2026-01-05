'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

interface UploadedProduct {
  id: string;
  productCode: string | null;
  customCode: string | null;
  displayStatus: boolean;
  saleStatus: boolean;
  name: string;
  nameEn: string | null;
  price: number;
  supplyPrice: number | null;
  retailPrice: number | null;
  manufacturer: string | null;
  brand: string | null;
  origin: string | null;
  createdAt: string;
}

// Liquid Blob Component
function LiquidBlob({ size, color, x, y, delay, duration }: {
  size: number;
  color: string;
  x: string;
  y: string;
  delay: number;
  duration: number;
}) {
  return (
    <div
      className="absolute rounded-full opacity-40 blur-3xl animate-liquid pointer-events-none"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        left: x,
        top: y,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  );
}

// Premium Card Component
function PremiumCard({
  children,
  className = '',
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || !hover) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, [hover]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/40 shadow-xl transition-all duration-500 ${hover ? 'hover:shadow-2xl hover:border-[#8BA4B4]/30' : ''} ${className}`}
      style={{
        transform: hover && isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {hover && isHovered && (
        <div
          className="absolute inset-0 opacity-30 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 200px at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 164, 180, 0.4), transparent)`,
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  );
}

export default function ProductListPage() {
  const [products, setProducts] = useState<UploadedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products/upload');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '상품 목록을 불러올 수 없습니다');
      }

      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (ids.length === 0) return;

    setDeleting(true);
    try {
      const response = await fetch('/api/products/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '삭제에 실패했습니다');
      }

      setSelectedIds(new Set());
      setDeleteConfirm(null);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setDeleteConfirm('selected');
  };

  const handleDeleteSingle = (id: string) => {
    setDeleteConfirm(id);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAFBFC] via-[#F5F7F9] to-[#FAF8F5] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <LiquidBlob size={600} color="#A8C5D4" x="-10%" y="15%" delay={0} duration={25} />
        <LiquidBlob size={500} color="#A4B4A8" x="75%" y="55%" delay={2} duration={30} />
        <LiquidBlob size={400} color="#D4C4A8" x="45%" y="80%" delay={4} duration={20} />
      </div>

      {/* Grain Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Header */}
      <section className="relative pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/product-upload"
            className="inline-flex items-center gap-2 text-[#8BA4B4] hover:text-[#5A7A8A] transition-colors mb-8 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">상품 업로드</span>
          </Link>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8BA4B4]/10 to-[#A8C5D4]/10 rounded-full border border-[#8BA4B4]/20 mb-6">
              <svg className="w-4 h-4 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="text-[#8BA4B4] font-medium text-sm tracking-wider uppercase">Product List</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[#2D3436] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              업로드된{' '}
              <span className="bg-gradient-to-r from-[#8BA4B4] via-[#A8C5D4] to-[#8BA4B4] bg-clip-text text-transparent">
                상품 목록
              </span>
            </h1>
            <p className="text-lg text-[#636E72] max-w-2xl mx-auto" style={{ fontFamily: 'Pretendard, sans-serif' }}>
              cafe24 양식으로 업로드된 상품들을 확인하고 관리할 수 있습니다
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <PremiumCard hover={false} className="animate-reveal">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] rounded-2xl flex items-center justify-center shadow-lg shadow-[#8BA4B4]/30">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#2D3436]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    상품 목록
                  </h2>
                  <p className="text-sm text-[#9EA7AA]">총 {total}개 상품</p>
                </div>
              </div>

              <div className="flex gap-3">
                {selectedIds.size > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E8B4B8] text-white font-medium rounded-xl hover:bg-[#D4A4A8] transition-all disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {selectedIds.size}개 삭제
                  </button>
                )}
                <button
                  onClick={loadProducts}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/80 text-[#5A7A8A] font-medium rounded-xl border border-[#E8E2D9] hover:border-[#8BA4B4]/30 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  새로고침
                </button>
                <Link
                  href="/product-upload"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white font-medium rounded-xl shadow-lg shadow-[#8BA4B4]/30 hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  새 상품 업로드
                </Link>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-3 border-[#8BA4B4] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[#9EA7AA]">상품 목록을 불러오는 중...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-5 bg-gradient-to-br from-[#E8B4B8]/20 to-[#D4A4A8]/10 rounded-2xl border border-[#E8B4B8]/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#E8B4B8] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#2D3436]">오류 발생</p>
                    <p className="text-sm text-[#636E72]">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-[#8BA4B4]/20 to-[#A8C5D4]/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-[#2D3436] mb-2">업로드된 상품이 없습니다</p>
                <p className="text-sm text-[#9EA7AA] mb-6">CSV 파일을 업로드하여 상품을 등록하세요</p>
                <Link
                  href="/product-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white font-semibold rounded-xl shadow-lg shadow-[#8BA4B4]/30 hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  상품 업로드하기
                </Link>
              </div>
            )}

            {/* Product Table */}
            {!loading && !error && products.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#E8E2D9]">
                      <th className="px-4 py-4 text-center">
                        <button
                          onClick={toggleSelectAll}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            selectedIds.size === products.length
                              ? 'bg-[#8BA4B4] border-[#8BA4B4]'
                              : 'border-[#DDD] hover:border-[#8BA4B4]'
                          }`}
                        >
                          {selectedIds.size === products.length && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-4 text-left font-semibold text-[#5A7A8A]">상품코드</th>
                      <th className="px-4 py-4 text-left font-semibold text-[#5A7A8A]">상품명</th>
                      <th className="px-4 py-4 text-left font-semibold text-[#5A7A8A]">브랜드</th>
                      <th className="px-4 py-4 text-right font-semibold text-[#5A7A8A]">판매가</th>
                      <th className="px-4 py-4 text-center font-semibold text-[#5A7A8A]">진열</th>
                      <th className="px-4 py-4 text-center font-semibold text-[#5A7A8A]">판매</th>
                      <th className="px-4 py-4 text-left font-semibold text-[#5A7A8A]">등록일</th>
                      <th className="px-4 py-4 text-center font-semibold text-[#5A7A8A]">삭제</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => (
                      <tr
                        key={product.id}
                        className={`border-b border-[#E8E2D9]/50 hover:bg-[#8BA4B4]/5 transition-colors ${
                          selectedIds.has(product.id) ? 'bg-[#8BA4B4]/10' : ''
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleSelect(product.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              selectedIds.has(product.id)
                                ? 'bg-[#8BA4B4] border-[#8BA4B4]'
                                : 'border-[#DDD] hover:border-[#8BA4B4]'
                            }`}
                          >
                            {selectedIds.has(product.id) && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-[#2D3436]">{product.productCode || '-'}</p>
                            {product.customCode && (
                              <p className="text-xs text-[#9EA7AA]">{product.customCode}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="max-w-[250px]">
                            <p className="font-medium text-[#2D3436] truncate">{product.name}</p>
                            {product.nameEn && (
                              <p className="text-xs text-[#9EA7AA] truncate">{product.nameEn}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex px-3 py-1 bg-[#8BA4B4]/10 text-[#5A7A8A] text-xs font-medium rounded-full">
                            {product.brand || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-[#2D3436]">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex w-8 h-8 rounded-full items-center justify-center ${
                            product.displayStatus
                              ? 'bg-[#A4B4A8]/20 text-[#5A8A6A]'
                              : 'bg-[#E8E2D9] text-[#9EA7AA]'
                          }`}>
                            {product.displayStatus ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex w-8 h-8 rounded-full items-center justify-center ${
                            product.saleStatus
                              ? 'bg-[#A4B4A8]/20 text-[#5A8A6A]'
                              : 'bg-[#E8B4B8]/20 text-[#8A5A5A]'
                          }`}>
                            {product.saleStatus ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[#636E72] text-xs whitespace-nowrap">
                          {formatDate(product.createdAt)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleDeleteSingle(product.id)}
                            className="p-2 text-[#9EA7AA] hover:text-[#E8B4B8] hover:bg-[#E8B4B8]/10 rounded-lg transition-all"
                            title="삭제"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PremiumCard>

          {/* Stats Cards */}
          {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <div className="p-5 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg animate-reveal" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#2D3436]">{total}</p>
                    <p className="text-xs text-[#9EA7AA]">전체 상품</p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg animate-reveal" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#A4B4A8] to-[#C4D4C8] rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#2D3436]">{products.filter(p => p.saleStatus).length}</p>
                    <p className="text-xs text-[#9EA7AA]">판매중</p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg animate-reveal" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#E8B4B8] to-[#F0D0D4] rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#2D3436]">{products.filter(p => !p.saleStatus).length}</p>
                    <p className="text-xs text-[#9EA7AA]">판매중지</p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg animate-reveal" style={{ animationDelay: '0.25s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#D4C4A8] to-[#E8DCC8] rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#2D3436]">{new Set(products.map(p => p.brand).filter(Boolean)).size}</p>
                    <p className="text-xs text-[#9EA7AA]">브랜드</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-reveal">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#E8B4B8]/20 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#E8B4B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#2D3436]">상품 삭제</h3>
                <p className="text-sm text-[#9EA7AA]">Delete Product</p>
              </div>
            </div>

            <p className="text-[#636E72] mb-6">
              {deleteConfirm === 'selected'
                ? `선택한 ${selectedIds.size}개 상품을 삭제하시겠습니까?`
                : '이 상품을 삭제하시겠습니까?'
              }
              <br />
              <span className="text-sm text-[#9EA7AA]">삭제된 상품은 복구할 수 없습니다.</span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 py-3 border-2 border-[#E8E2D9] text-[#636E72] font-semibold rounded-xl hover:border-[#8BA4B4]/30 transition-all disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm === 'selected') {
                    handleDelete(Array.from(selectedIds));
                  } else {
                    handleDelete([deleteConfirm]);
                  }
                }}
                disabled={deleting}
                className="flex-1 py-3 bg-[#E8B4B8] text-white font-semibold rounded-xl hover:bg-[#D4A4A8] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  '삭제'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');

        @keyframes liquid {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: rotate(0deg) scale(1);
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
          }
          50% {
            border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%;
            transform: rotate(180deg) scale(1.1);
          }
          75% {
            border-radius: 60% 40% 60% 30% / 70% 30% 50% 60%;
          }
        }

        @keyframes reveal {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-liquid {
          animation: liquid 20s ease-in-out infinite;
        }

        .animate-reveal {
          animation: reveal 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </main>
  );
}

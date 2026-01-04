'use client';

import { useState } from 'react';
import { ProductRebuildData } from '@/types/product-rebuild';
import ImageGallery from './ImageGallery';
import ScreenshotViewer from './ScreenshotViewer';
import { Card } from '@/components/ui/PageWrapper';

interface ProductRebuildResultProps {
  data: ProductRebuildData;
}

type TabType = 'overview' | 'screenshot' | 'images' | 'translation';

export default function ProductRebuildResult({ data }: ProductRebuildResultProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview',
      label: '개요',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'screenshot',
      label: '스크린샷',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'images',
      label: `이미지 (${data.imageUrls.length})`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
    },
    {
      id: 'translation',
      label: '번역',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
    },
  ];

  const formatPrice = (price: number | null, original: string | null) => {
    if (price) {
      return `₩${price.toLocaleString()}`;
    }
    return original || '가격 정보 없음';
  };

  const priceInRub = data.price ? Math.round(data.price * 0.075) : null;

  return (
    <div className="space-y-6">
      {/* 상단 요약 카드 */}
      <Card hover={false} className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{data.name}</h2>
              {data.nameRu && !data.nameRu.startsWith('[번역') && (
                <p className="text-white/80 text-sm">{data.nameRu}</p>
              )}
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-white/70 text-xs mb-1">KRW</p>
                <p className="text-2xl font-bold">{formatPrice(data.price, data.priceOriginal)}</p>
              </div>
              {priceInRub && (
                <div className="text-center">
                  <p className="text-white/70 text-xs mb-1">RUB</p>
                  <p className="text-2xl font-bold">₽{priceInRub.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* 메타 정보 */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/20">
            <span className="inline-flex items-center text-sm text-white/80">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              {data.sourceSite}
            </span>
            <span className="inline-flex items-center text-sm text-white/80">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {data.imageUrls.length}개 이미지
            </span>
            <span className="inline-flex items-center text-sm text-white/80">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {data.extractedAt ? new Date(data.extractedAt).toLocaleDateString('ko-KR') : '-'}
            </span>
            <a
              href={data.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              원본 보기
            </a>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-[#E8E2D9] bg-[#FAF8F5]">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-[#8BA4B4] text-[#5A7A8A] bg-white'
                    : 'border-transparent text-[#636E72] hover:text-[#5A7A8A] hover:bg-white/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="p-6">
          {/* 개요 탭 */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 상품 설명 */}
              <div>
                <h3 className="text-lg font-semibold text-[#2D3436] mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#8BA4B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  상품 설명
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E2D9]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-[#636E72] uppercase tracking-wider">한국어</span>
                    </div>
                    <p className="text-sm text-[#2D3436] whitespace-pre-wrap leading-relaxed">
                      {data.description || '설명 없음'}
                    </p>
                  </div>
                  <div className="p-4 bg-[#8BA4B4]/5 rounded-xl border border-[#8BA4B4]/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-[#8BA4B4] uppercase tracking-wider">러시아어</span>
                    </div>
                    <p className="text-sm text-[#2D3436] whitespace-pre-wrap leading-relaxed">
                      {data.descriptionRu && !data.descriptionRu.startsWith('[번역')
                        ? data.descriptionRu
                        : '번역 없음'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 성분 */}
              {data.ingredients && data.ingredients.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#2D3436] mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#8BA4B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    성분 ({data.ingredients.length}개)
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E2D9]">
                      <span className="text-xs font-medium text-[#636E72] uppercase tracking-wider mb-3 block">한국어</span>
                      <div className="flex flex-wrap gap-1.5">
                        {data.ingredients.map((ingredient, idx) => (
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
                      <span className="text-xs font-medium text-[#8BA4B4] uppercase tracking-wider mb-3 block">러시아어</span>
                      <div className="flex flex-wrap gap-1.5">
                        {data.ingredientsRu && data.ingredientsRu.length > 0 ? (
                          data.ingredientsRu.map((ingredient, idx) => (
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
                </div>
              )}

              {/* 이미지 미리보기 */}
              {data.imageUrls.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#2D3436] mb-4 flex items-center justify-between">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-[#8BA4B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      이미지 미리보기
                    </span>
                    <button
                      onClick={() => setActiveTab('images')}
                      className="text-sm text-[#8BA4B4] hover:text-[#5A7A8A] font-medium transition-colors"
                    >
                      전체 보기 →
                    </button>
                  </h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {data.imageUrls.slice(0, 8).map((url, idx) => (
                      <div
                        key={idx}
                        className="aspect-square bg-[#FAF8F5] rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-[#E8E2D9]"
                        onClick={() => setActiveTab('images')}
                      >
                        <img
                          src={url}
                          alt={`미리보기 ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                    {data.imageUrls.length > 8 && (
                      <div
                        className="aspect-square bg-[#8BA4B4]/10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-[#8BA4B4]/20 transition-colors border border-[#8BA4B4]/20"
                        onClick={() => setActiveTab('images')}
                      >
                        <span className="text-sm font-medium text-[#5A7A8A]">
                          +{data.imageUrls.length - 8}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 스크린샷 탭 */}
          {activeTab === 'screenshot' && (
            <ScreenshotViewer screenshotUrl={data.screenshotUrl} />
          )}

          {/* 이미지 탭 */}
          {activeTab === 'images' && (
            <ImageGallery
              images={data.imageUrls}
              originalUrls={data.originalImageUrls}
            />
          )}

          {/* 번역 탭 */}
          {activeTab === 'translation' && (
            <div className="space-y-6">
              {/* 상품명 번역 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-[#FAF8F5] rounded-xl border border-[#E8E2D9]">
                  <h4 className="text-xs font-medium text-[#636E72] uppercase tracking-wider mb-2">상품명 (한국어)</h4>
                  <p className="text-lg font-semibold text-[#2D3436]">{data.name}</p>
                </div>
                <div className="p-5 bg-[#8BA4B4]/5 rounded-xl border border-[#8BA4B4]/20">
                  <h4 className="text-xs font-medium text-[#8BA4B4] uppercase tracking-wider mb-2">상품명 (러시아어)</h4>
                  <p className="text-lg font-semibold text-[#2D3436]">
                    {data.nameRu && !data.nameRu.startsWith('[번역') ? data.nameRu : '번역 없음'}
                  </p>
                </div>
              </div>

              {/* 설명 번역 */}
              <div>
                <h3 className="text-lg font-semibold text-[#2D3436] mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#8BA4B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  상품 설명
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E2D9] max-h-96 overflow-y-auto">
                    <span className="text-xs font-medium text-[#636E72] uppercase tracking-wider mb-3 block">한국어</span>
                    <p className="text-sm text-[#2D3436] whitespace-pre-wrap">
                      {data.description || '설명 없음'}
                    </p>
                  </div>
                  <div className="p-4 bg-[#8BA4B4]/5 rounded-xl border border-[#8BA4B4]/20 max-h-96 overflow-y-auto">
                    <span className="text-xs font-medium text-[#8BA4B4] uppercase tracking-wider mb-3 block">러시아어</span>
                    <p className="text-sm text-[#2D3436] whitespace-pre-wrap">
                      {data.descriptionRu && !data.descriptionRu.startsWith('[번역')
                        ? data.descriptionRu
                        : '번역 없음'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 성분 번역 */}
              {data.ingredients && data.ingredients.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#2D3436] mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[#8BA4B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    성분
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E2D9]">
                      <span className="text-xs font-medium text-[#636E72] uppercase tracking-wider mb-3 block">한국어</span>
                      <div className="flex flex-wrap gap-1.5">
                        {data.ingredients.map((ingredient, idx) => (
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
                      <span className="text-xs font-medium text-[#8BA4B4] uppercase tracking-wider mb-3 block">러시아어</span>
                      <div className="flex flex-wrap gap-1.5">
                        {data.ingredientsRu && data.ingredientsRu.length > 0 ? (
                          data.ingredientsRu.map((ingredient, idx) => (
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
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

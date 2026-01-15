'use client';

import { useState } from 'react';
import { Card, Button, InfoBox } from '@/components/ui/PageWrapper';
import type { AnalyzerOutput } from '@/types';

export default function AnalyzeForm() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [maxDepth, setMaxDepth] = useState(2);
  const [saveToDb, setSaveToDb] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzerOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllProducts, setShowAllProducts] = useState(false);

  const handleAnalyze = async () => {
    if (!websiteUrl) {
      alert('웹사이트 URL을 입력해주세요');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);
    setShowAllProducts(false);

    try {
      const response = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl,
          maxDepth,
          saveToDb,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '분석 실패');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 입력 폼 */}
      <Card hover={false}>
        <h2 className="text-xl font-semibold text-[#2D3436] mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          웹사이트 분석 요청
        </h2>

        <div className="space-y-5">
          {/* URL 입력 */}
          <div>
            <label className="block text-sm font-medium text-[#5A7A8A] mb-2">
              브랜드 웹사이트 URL <span className="text-[#E8B4B8]">*</span>
            </label>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B2BEC3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example-cosmetics.co.kr"
                className="w-full pl-12 pr-4 py-3.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all disabled:opacity-50"
                disabled={analyzing}
              />
            </div>
            <p className="text-xs text-[#636E72] mt-2">
              분석할 한국 화장품 브랜드의 공식 웹사이트 주소를 입력하세요
            </p>
          </div>

          {/* 크롤링 깊이 */}
          <div>
            <label className="block text-sm font-medium text-[#5A7A8A] mb-3">
              크롤링 깊이: <span className="text-[#8BA4B4] font-bold">{maxDepth}</span>
            </label>
            <input
              type="range"
              min="1"
              max="4"
              value={maxDepth}
              onChange={(e) => setMaxDepth(parseInt(e.target.value))}
              className="w-full h-2 bg-[#E8E2D9] rounded-full appearance-none cursor-pointer accent-[#8BA4B4]"
              disabled={analyzing}
            />
            <div className="flex justify-between text-xs text-[#636E72] mt-2">
              <span>빠름 (1)</span>
              <span>보통 (2-3)</span>
              <span>상세 (4)</span>
            </div>
          </div>

          {/* DB 저장 옵션 */}
          <label className="flex items-center gap-3 p-4 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl cursor-pointer hover:border-[#8BA4B4]/50 transition-all">
            <input
              type="checkbox"
              checked={saveToDb}
              onChange={(e) => setSaveToDb(e.target.checked)}
              className="w-5 h-5 rounded border-[#8BA4B4] text-[#8BA4B4] focus:ring-[#8BA4B4]/20"
              disabled={analyzing}
            />
            <div>
              <p className="text-sm font-medium text-[#2D3436]">파트너사로 등록</p>
              <p className="text-xs text-[#636E72]">분석 결과를 데이터베이스에 저장합니다</p>
            </div>
          </label>

          {/* 분석 버튼 */}
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !websiteUrl}
            className="w-full py-4 bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white font-semibold rounded-xl shadow-lg shadow-[#8BA4B4]/25 hover:shadow-xl hover:shadow-[#8BA4B4]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                분석 중... (최대 2분 소요)
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                분석 시작
              </span>
            )}
          </button>
        </div>
      </Card>

      {/* 진행 상태 */}
      {analyzing && (
        <Card hover={false} className="border-[#8BA4B4]/30 bg-[#8BA4B4]/5">
          <h3 className="font-semibold text-[#5A7A8A] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            분석 진행 중
          </h3>
          <div className="space-y-3 text-sm text-[#636E72]">
            {['웹사이트 크롤링 중...', '제품 정보 추출 중...', '러시아어 번역 중...', '시장 분석 중...'].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#8BA4B4] animate-pulse" />
                {step}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="w-full bg-[#E8E2D9] rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] h-2 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        </Card>
      )}

      {/* 에러 */}
      {error && (
        <InfoBox variant="warning" title="분석 실패">
          <p>{error}</p>
        </InfoBox>
      )}

      {/* 결과 */}
      {result && (
        <div className="space-y-6">
          {/* 브랜드 정보 */}
          <Card hover={false}>
            <h2 className="text-xl font-semibold text-[#2D3436] mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              브랜드 정보
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-[#636E72] mb-1">브랜드명</p>
                <p className="text-lg font-semibold text-[#2D3436]">{result.brand.name}</p>
                <p className="text-sm text-[#8BA4B4]">{result.brand.nameRu}</p>
              </div>
              <div>
                <p className="text-sm text-[#636E72] mb-2">시장 적합도</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-[#E8E2D9] rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#A4B4A8] to-[#8BA4B4] h-3 rounded-full transition-all"
                      style={{ width: `${result.brand.marketScore}%` }}
                    />
                  </div>
                  <span className="font-bold text-[#2D3436]">{result.brand.marketScore}점</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-[#636E72] mb-1">설명</p>
                <p className="text-sm text-[#2D3436]">{result.brand.description}</p>
                <p className="text-sm text-[#8BA4B4] mt-1">{result.brand.descriptionRu}</p>
              </div>
            </div>
          </Card>

          {/* 제품 목록 */}
          <Card hover={false}>
            <h2 className="text-xl font-semibold text-[#2D3436] mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              제품 목록 ({result.products.length}개)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(showAllProducts ? result.products : result.products.slice(0, 9)).map((product, index) => (
                <div
                  key={index}
                  className="p-4 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl hover:shadow-md transition-shadow"
                >
                  {product.imageUrls[0] ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-[#E8E2D9] to-[#D4CFC6] rounded-lg mb-3 flex items-center justify-center">
                      <svg className="w-10 h-10 text-[#B2BEC3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <h3 className="font-semibold text-[#2D3436] text-sm">{product.name}</h3>
                  <p className="text-xs text-[#8BA4B4] mb-2">{product.nameRu}</p>
                  <p className="text-sm font-bold text-[#5A7A8A]">
                    {product.price > 0 ? `₩${product.price.toLocaleString()}` : '가격 미정'}
                  </p>
                  <p className="text-xs text-[#636E72]">{product.category}</p>
                </div>
              ))}
            </div>
            {result.products.length > 9 && !showAllProducts && (
              <button
                onClick={() => setShowAllProducts(true)}
                className="w-full mt-4 py-3 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-[#5A7A8A] font-medium hover:bg-[#F0EBE3] hover:border-[#8BA4B4] transition-all"
              >
                +{result.products.length - 9}개 제품 더보기
              </button>
            )}
            {showAllProducts && result.products.length > 9 && (
              <button
                onClick={() => setShowAllProducts(false)}
                className="w-full mt-4 py-3 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-[#5A7A8A] font-medium hover:bg-[#F0EBE3] hover:border-[#8BA4B4] transition-all"
              >
                접기
              </button>
            )}
          </Card>

          {/* 성공 메시지 */}
          {saveToDb && (
            <InfoBox variant="success" title="파트너사 등록 완료">
              <p>파트너사 목록에서 확인할 수 있습니다</p>
            </InfoBox>
          )}
        </div>
      )}
    </div>
  );
}

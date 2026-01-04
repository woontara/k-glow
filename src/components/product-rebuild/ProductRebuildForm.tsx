'use client';

import { useState } from 'react';
import { ProductRebuildData, PROGRESS_STEPS, RebuildProgress } from '@/types/product-rebuild';
import { SUPPORTED_SITES } from '@/lib/scraper/constants';
import { Card, InfoBox } from '@/components/ui/PageWrapper';

interface ProductRebuildFormProps {
  onResult: (data: ProductRebuildData) => void;
}

export default function ProductRebuildForm({ onResult }: ProductRebuildFormProps) {
  const [url, setUrl] = useState('');
  const [options, setOptions] = useState({
    captureScreenshot: true,
    downloadImages: true,
    translateToRussian: true,
    saveToDatabase: false,
  });
  const [progress, setProgress] = useState<RebuildProgress>({
    step: 'idle',
    message: '',
    percentage: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError('상품 URL을 입력해주세요.');
      return;
    }

    try {
      // 진행 상태 시뮬레이션
      const steps: RebuildProgress['step'][] = [
        'connecting',
        'scraping',
        'capturing',
        'downloading',
        'translating',
      ];

      let currentStepIndex = 0;
      const updateProgress = () => {
        if (currentStepIndex < steps.length) {
          const step = steps[currentStepIndex];
          setProgress(PROGRESS_STEPS[step] as RebuildProgress);
          currentStepIndex++;
        }
      };

      // 2초마다 진행 상태 업데이트
      updateProgress();
      const progressInterval = setInterval(updateProgress, 3000);

      const response = await fetch('/api/product-rebuild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, options }),
      });

      clearInterval(progressInterval);

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '요청 실패');
      }

      setProgress(PROGRESS_STEPS.done as RebuildProgress);
      onResult(result.data);
    } catch (err) {
      setProgress(PROGRESS_STEPS.error as RebuildProgress);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const isLoading = progress.step !== 'idle' && progress.step !== 'done' && progress.step !== 'error';

  return (
    <Card hover={false}>
      <form onSubmit={handleSubmit}>
        {/* URL 입력 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#5A7A8A] mb-2">
            상품 URL <span className="text-[#E8B4B8]">*</span>
          </label>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B2BEC3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.coupang.com/vp/products/..."
              className="w-full pl-12 pr-4 py-3.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all disabled:opacity-50"
              disabled={isLoading}
            />
          </div>
          <p className="mt-2 text-xs text-[#636E72]">
            쿠팡, 네이버 스마트스토어, 11번가 또는 브랜드 공식몰의 상품 URL을 입력하세요.
          </p>
        </div>

        {/* 지원 사이트 목록 */}
        <div className="mb-6">
          <p className="text-sm font-medium text-[#5A7A8A] mb-3">지원 사이트</p>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_SITES.map((site) => (
              <span
                key={site.pattern}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-[#8BA4B4]/10 text-[#5A7A8A] border border-[#8BA4B4]/20"
              >
                {site.name}
              </span>
            ))}
          </div>
        </div>

        {/* 옵션 */}
        <div className="mb-6">
          <p className="text-sm font-medium text-[#5A7A8A] mb-3">옵션</p>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl cursor-pointer hover:border-[#8BA4B4]/50 transition-all">
              <input
                type="checkbox"
                checked={options.captureScreenshot}
                onChange={(e) =>
                  setOptions({ ...options, captureScreenshot: e.target.checked })
                }
                className="w-5 h-5 rounded border-[#8BA4B4] text-[#8BA4B4] focus:ring-[#8BA4B4]/20"
                disabled={isLoading}
              />
              <div>
                <p className="text-sm font-medium text-[#2D3436]">전체 페이지 스크린샷 캡처</p>
                <p className="text-xs text-[#636E72]">상품 상세페이지 전체를 이미지로 저장</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl cursor-pointer hover:border-[#8BA4B4]/50 transition-all">
              <input
                type="checkbox"
                checked={options.downloadImages}
                onChange={(e) =>
                  setOptions({ ...options, downloadImages: e.target.checked })
                }
                className="w-5 h-5 rounded border-[#8BA4B4] text-[#8BA4B4] focus:ring-[#8BA4B4]/20"
                disabled={isLoading}
              />
              <div>
                <p className="text-sm font-medium text-[#2D3436]">상품 이미지 다운로드</p>
                <p className="text-xs text-[#636E72]">상품 이미지를 로컬에 저장 (최대 20개)</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl cursor-pointer hover:border-[#8BA4B4]/50 transition-all">
              <input
                type="checkbox"
                checked={options.translateToRussian}
                onChange={(e) =>
                  setOptions({ ...options, translateToRussian: e.target.checked })
                }
                className="w-5 h-5 rounded border-[#8BA4B4] text-[#8BA4B4] focus:ring-[#8BA4B4]/20"
                disabled={isLoading}
              />
              <div>
                <p className="text-sm font-medium text-[#2D3436]">러시아어 번역</p>
                <p className="text-xs text-[#636E72]">Claude AI로 러시아어 번역</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl cursor-pointer hover:border-[#8BA4B4]/50 transition-all">
              <input
                type="checkbox"
                checked={options.saveToDatabase}
                onChange={(e) =>
                  setOptions({ ...options, saveToDatabase: e.target.checked })
                }
                className="w-5 h-5 rounded border-[#8BA4B4] text-[#8BA4B4] focus:ring-[#8BA4B4]/20"
                disabled={isLoading}
              />
              <div>
                <p className="text-sm font-medium text-[#2D3436]">데이터베이스에 저장</p>
                <p className="text-xs text-[#636E72]">결과를 데이터베이스에 저장하여 나중에 확인</p>
              </div>
            </label>
          </div>
        </div>

        {/* 진행 상태 */}
        {isLoading && (
          <div className="mb-6 p-4 bg-[#8BA4B4]/5 border border-[#8BA4B4]/30 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[#5A7A8A] flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {progress.message}
              </span>
              <span className="text-sm font-bold text-[#8BA4B4]">{progress.percentage}%</span>
            </div>
            <div className="w-full bg-[#E8E2D9] rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6">
            <InfoBox variant="warning" title="오류 발생">
              <p>{error}</p>
            </InfoBox>
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white font-semibold rounded-xl shadow-lg shadow-[#8BA4B4]/25 hover:shadow-xl hover:shadow-[#8BA4B4]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              처리 중...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              상품 정보 가져오기
            </span>
          )}
        </button>
      </form>
    </Card>
  );
}

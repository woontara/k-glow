'use client';

import { useState } from 'react';

interface ScreenshotViewerProps {
  screenshotUrl: string | null;
}

export default function ScreenshotViewer({ screenshotUrl }: ScreenshotViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!screenshotUrl) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#8BA4B4]/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-[#636E72]">스크린샷이 없습니다.</p>
      </div>
    );
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  return (
    <div>
      {/* 컨트롤 바 */}
      <div className="flex items-center justify-between mb-4 p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E2D9]">
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#E8E2D9] transition-colors text-[#5A7A8A]"
            title="축소"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-sm font-medium text-[#2D3436] min-w-[50px] text-center">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#E8E2D9] transition-colors text-[#5A7A8A]"
            title="확대"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={handleResetZoom}
            className="px-3 py-1.5 text-sm font-medium text-[#5A7A8A] hover:bg-[#E8E2D9] rounded-lg transition-colors"
            title="초기화"
          >
            초기화
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#E8E2D9] transition-colors text-[#5A7A8A]"
            title="전체 화면"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <a
            href={screenshotUrl}
            download
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#E8E2D9] transition-colors text-[#5A7A8A]"
            title="다운로드"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </div>
      </div>

      {/* 스크린샷 뷰어 */}
      <div className="relative overflow-auto border border-[#E8E2D9] rounded-xl bg-[#FAF8F5] max-h-[600px]">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
            transition: 'transform 0.2s ease',
          }}
        >
          <img
            src={screenshotUrl}
            alt="상품 페이지 스크린샷"
            className="max-w-none"
          />
        </div>
      </div>

      {/* 전체 화면 모달 */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-[#2D3436]/95 overflow-auto backdrop-blur-sm"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="fixed top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="p-4">
            <img
              src={screenshotUrl}
              alt="상품 페이지 스크린샷"
              className="mx-auto rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* 안내 텍스트 */}
      <p className="mt-4 text-sm text-[#636E72] text-center">
        원본 상품 페이지의 전체 스크린샷입니다. 확대/축소하여 상세 내용을 확인하세요.
      </p>
    </div>
  );
}

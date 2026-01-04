'use client';

import { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
  originalUrls: string[];
}

export default function ImageGallery({ images, originalUrls }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#8BA4B4]/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-[#636E72]">다운로드된 이미지가 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      {/* 이미지 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, idx) => (
          <div
            key={idx}
            className="relative aspect-square bg-[#FAF8F5] rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-[#E8E2D9] group"
            onClick={() => setSelectedIndex(idx)}
          >
            <img
              src={image}
              alt={`상품 이미지 ${idx + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-image.png';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-[#2D3436]/70 text-white text-xs rounded-lg backdrop-blur-sm">
              {idx + 1}/{images.length}
            </div>
          </div>
        ))}
      </div>

      {/* 라이트박스 */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-[#2D3436]/95 flex items-center justify-center backdrop-blur-sm"
          onClick={() => setSelectedIndex(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            {/* 닫기 버튼 */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 이전 버튼 */}
            {selectedIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(selectedIndex - 1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* 다음 버튼 */}
            {selectedIndex < images.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(selectedIndex + 1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* 이미지 */}
            <img
              src={images[selectedIndex]}
              alt={`상품 이미지 ${selectedIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain mx-auto rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* 정보 */}
            <div className="text-center mt-4 text-white">
              <p className="text-sm font-medium">
                {selectedIndex + 1} / {images.length}
              </p>
              {originalUrls[selectedIndex] && (
                <a
                  href={originalUrls[selectedIndex]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#8BA4B4] hover:text-[#A8C5D4] transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  원본 이미지 보기
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 전체 다운로드 버튼 */}
      <div className="mt-6 text-center">
        <p className="text-sm text-[#636E72]">
          총 <span className="font-semibold text-[#8BA4B4]">{images.length}개</span>의 이미지가 다운로드되었습니다.
        </p>
      </div>
    </div>
  );
}

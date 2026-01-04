'use client';

import { useState } from 'react';
import PageWrapper, { Card, InfoBox, Button } from '@/components/ui/PageWrapper';
import ProductRebuildForm from '@/components/product-rebuild/ProductRebuildForm';
import ProductRebuildResult from '@/components/product-rebuild/ProductRebuildResult';
import { ProductRebuildData } from '@/types/product-rebuild';

export default function ProductRebuildPage() {
  const [result, setResult] = useState<ProductRebuildData | null>(null);

  const handleResult = (data: ProductRebuildData) => {
    setResult(data);
  };

  const handleReset = () => {
    setResult(null);
  };

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      title: 'URL 입력',
      description: '상품 페이지 URL 입력',
      color: 'from-[#8BA4B4] to-[#A8C5D4]',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: '스크린샷 캡처',
      description: '전체 페이지 스크린샷',
      color: 'from-[#A4B4A8] to-[#C4D4C8]',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      title: '이미지 다운로드',
      description: '상품 이미지 저장',
      color: 'from-[#D4C4A8] to-[#E8DCC8]',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      title: '러시아어 번역',
      description: 'AI 기반 번역',
      color: 'from-[#E8B4B8] to-[#F0D0D4]',
    },
  ];

  return (
    <PageWrapper
      title={result ? '리빌드 결과' : '상품 리빌드'}
      subtitle={result ? undefined : '한국 쇼핑몰의 상품 URL을 입력하면 상품 정보를 자동으로 추출하고, 러시아어로 번역하여 새로운 상세페이지를 구성합니다'}
      badge="Product Rebuild"
    >
      {!result ? (
        <>
          {/* Feature Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center py-6" hover={false}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-[#2D3436] mb-1">{feature.title}</h3>
                <p className="text-sm text-[#636E72]">{feature.description}</p>
              </Card>
            ))}
          </div>

          {/* Form */}
          <div className="max-w-2xl mx-auto">
            <ProductRebuildForm onResult={handleResult} />
          </div>

          {/* Warning */}
          <div className="max-w-2xl mx-auto mt-8">
            <InfoBox
              variant="warning"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="안내 사항"
            >
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#D4C4A8] mt-0.5">•</span>
                  처리 시간은 페이지 크기에 따라 1-3분 정도 소요됩니다
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4C4A8] mt-0.5">•</span>
                  일부 사이트는 봇 차단으로 인해 정보 추출이 제한될 수 있습니다
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4C4A8] mt-0.5">•</span>
                  번역 기능은 Claude API 키가 설정된 경우에만 작동합니다
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4C4A8] mt-0.5">•</span>
                  다운로드된 이미지는 서버에 저장되며, 일정 기간 후 삭제됩니다
                </li>
              </ul>
            </InfoBox>
          </div>
        </>
      ) : (
        <>
          {/* Result Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={handleReset}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              새로운 URL 분석
            </Button>
          </div>

          {/* Result */}
          <ProductRebuildResult data={result} />
        </>
      )}
    </PageWrapper>
  );
}

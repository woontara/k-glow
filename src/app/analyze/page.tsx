'use client';

import PageWrapper, { Card, InfoBox } from '@/components/ui/PageWrapper';
import AnalyzeForm from '@/components/analyzer/AnalyzeForm';

export default function AnalyzePage() {
  const steps = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      title: '웹 크롤링',
      description: '사이트 전체 탐색',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      title: '정보 추출',
      description: '제품명, 가격, 성분',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      title: 'AI 번역',
      description: 'Claude로 러시아어 번역',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: '시장 분석',
      description: '러시아 시장 적합도',
    },
  ];

  return (
    <PageWrapper
      title="브랜드 분석"
      subtitle="한국 화장품 브랜드 웹사이트를 분석하여 제품 정보를 자동으로 추출하고 러시아어로 번역합니다"
      badge="AI Analysis"
    >
      {/* Process Steps */}
      <Card className="mb-8" hover={false}>
        <h3 className="text-lg font-semibold text-[#2D3436] mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          AI 자동 분석 프로세스
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8BA4B4]/20 to-[#A8C5D4]/20 flex items-center justify-center text-[#5A7A8A]">
                {step.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#8BA4B4]">{index + 1}</span>
                  <h4 className="font-semibold text-[#2D3436]">{step.title}</h4>
                </div>
                <p className="text-sm text-[#636E72]">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Warning */}
      <InfoBox
        variant="warning"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
        title="주의사항"
        className="mb-8"
      >
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-[#D4C4A8] mt-0.5">•</span>
            분석에 1-2분 정도 소요될 수 있습니다
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#D4C4A8] mt-0.5">•</span>
            웹사이트 구조에 따라 일부 정보가 누락될 수 있습니다
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#D4C4A8] mt-0.5">•</span>
            Claude API 키가 설정되어 있어야 번역이 작동합니다
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#D4C4A8] mt-0.5">•</span>
            robots.txt를 확인하여 크롤링이 허용된 사이트만 분석하세요
          </li>
        </ul>
      </InfoBox>

      <AnalyzeForm />
    </PageWrapper>
  );
}

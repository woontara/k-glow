'use client';

import PageWrapper, { Card, InfoBox } from '@/components/ui/PageWrapper';
import CalculatorForm from '@/components/calculator/CalculatorForm';

export default function CalculatorPage() {
  return (
    <PageWrapper
      title="견적 계산기"
      subtitle="실시간 환율을 반영한 러시아 수출 견적을 자동으로 계산합니다"
      badge="Calculator"
    >
      {/* Info Box */}
      <InfoBox
        variant="warning"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        }
        title="견적 계산 안내"
        className="mb-8"
      >
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-[#D4C4A8] mt-0.5">•</span>
            제품 가격, 무게, 부피 정보를 입력해주세요
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#D4C4A8] mt-0.5">•</span>
            배송 방법(항공/해상)에 따라 운송비가 달라집니다
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#D4C4A8] mt-0.5">•</span>
            관세(6.5%) 및 부가세(20%)가 자동 계산됩니다
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#D4C4A8] mt-0.5">•</span>
            인증이 필요한 경우 인증 종류를 선택해주세요
          </li>
        </ul>
      </InfoBox>

      <CalculatorForm />
    </PageWrapper>
  );
}

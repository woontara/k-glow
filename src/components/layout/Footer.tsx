import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 회사 정보 */}
          <div>
            <Image
              src="/logo.png"
              alt="K-Glow"
              width={100}
              height={36}
              className="h-9 w-auto mb-3"
              unoptimized
            />
            <p className="text-sm text-gray-600 mb-2">
              한국 중소 화장품 브랜드의 러시아/CIS 시장 진출을 지원하는 B2B 플랫폼
            </p>
            <p className="text-xs text-gray-500">
              © 2025 K-Glow. All rights reserved.
            </p>
          </div>

          {/* 주요 링크 */}
          <div>
            <h4 className="font-semibold mb-3">주요 서비스</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/partners" className="hover:text-blue-600">파트너사 목록</a>
              </li>
              <li>
                <a href="/calculator" className="hover:text-blue-600">견적 계산기</a>
              </li>
              <li>
                <a href="/analyze" className="hover:text-blue-600">브랜드 분석</a>
              </li>
              <li>
                <a href="/certification/new" className="hover:text-blue-600">인증 대행</a>
              </li>
            </ul>
          </div>

          {/* 지원 */}
          <div>
            <h4 className="font-semibold mb-3">지원</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/contact" className="hover:text-blue-600">문의하기</a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-blue-600">개인정보처리방침</a>
              </li>
              <li>
                <a href="/terms" className="hover:text-blue-600">이용약관</a>
              </li>
            </ul>
          </div>
        </div>

        {/* 사업자 정보 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              <span className="font-medium text-gray-700">케이글로우 (K-Glow)</span>
              <span className="mx-2">|</span>
              대표자명 : 양희웅
              <span className="mx-2">|</span>
              사업자등록번호 : 538-15-02695
              <span className="mx-2">|</span>
              통신판매신고번호 : 2025-경기의왕-0085
            </p>
            <p>
              대표메일 : <a href="mailto:contact@k-glow.com" className="hover:text-blue-600">contact@k-glow.com</a>
              <span className="mx-2">|</span>
              마케팅/제휴문의 : <a href="mailto:contact@k-glow.com" className="hover:text-blue-600">contact@k-glow.com</a>
              <span className="mx-2">|</span>
              개인정보보호책임자 : 양희웅
            </p>
            <p>
              주소 : 경기도 의왕시 오전로 150, 103-1904
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

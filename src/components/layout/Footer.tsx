export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 회사 정보 */}
          <div>
            <h3 className="font-bold text-lg mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              K-Glow
            </h3>
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
                <a href="https://github.com/anthropics/claude-code" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                  문의하기
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-blue-600">관리자</a>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                Powered by Claude AI
              </p>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <div>
              <span>기술 스택: Next.js 14 · TypeScript · Tailwind CSS · Prisma · Claude API</span>
            </div>
            <div className="flex gap-4">
              <span>🇰🇷 한국</span>
              <span>→</span>
              <span>🇷🇺 러시아</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

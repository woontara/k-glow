import Link from 'next/link';
import CertificationManager from '@/components/admin/CertificationManager';

// 테스트 모드: 인증 체크 비활성화
export default async function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
        <p className="text-gray-600">
          K-Glow 플랫폼을 관리합니다
        </p>
      </div>

      {/* 관리 메뉴 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/portfolio"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-[#8BA4B4] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8BA4B4] to-[#6B8A9A] rounded-lg flex items-center justify-center text-white text-2xl">
              📸
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[#5A7A8A]">포트폴리오 관리</h2>
              <p className="text-sm text-gray-500">성공 사례 및 고객 후기 관리</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">인증 요청 관리</h2>
      </div>

      <CertificationManager />
    </div>
  );
}

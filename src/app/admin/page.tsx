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
          href="/admin/brands"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-amber-400 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white text-2xl">
              🏷️
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600">브랜드 관리</h2>
              <p className="text-sm text-gray-500">한국 브랜드 고객사 관리</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-emerald-400 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-2xl">
              👥
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600">사용자 관리</h2>
              <p className="text-sm text-gray-500">사용자 계정 및 브랜드 연결</p>
            </div>
          </div>
        </Link>

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

        <Link
          href="/admin/coupang"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-red-400 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E83F33] to-[#C62828] rounded-lg flex items-center justify-center text-white text-sm font-bold">
              CP
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[#E83F33]">쿠팡 대시보드</h2>
              <p className="text-sm text-gray-500">판매 현황 및 주문 관리</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/ozon"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-400 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#005BFF] to-[#0047CC] rounded-lg flex items-center justify-center text-white text-sm font-bold">
              OZ
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[#005BFF]">OZON 대시보드</h2>
              <p className="text-sm text-gray-500">러시아 마켓 판매 현황</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/wildberries"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-400 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              WB
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600">Wildberries 대시보드</h2>
              <p className="text-sm text-gray-500">판매 현황 및 재고 관리</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/ai-models"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-violet-400 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-2xl">
              🤖
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-violet-600">AI 모델 관리</h2>
              <p className="text-sm text-gray-500">fal.ai 모델 설정 및 관리</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/call"
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-green-400 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white text-2xl">
              📞
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-green-600">전화/SMS 발신</h2>
              <p className="text-sm text-gray-500">고객사 전화 및 문자 발신</p>
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

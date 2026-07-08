import Link from "next/link"

export default function CertificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                K-Glow
              </Link>
            </div>
            <div className="flex items-center">
              <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
                ← 대시보드로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">인증서 발급 대행</h1>
          <p className="text-gray-600 mb-2">
            러시아 인증서 발급 요청 관리, 진행 상태 추적, 비용 견적 기능을 준비하고 있습니다.
          </p>
          <p className="text-gray-500">곧 만나보실 수 있습니다.</p>
        </div>
      </div>
    </div>
  )
}

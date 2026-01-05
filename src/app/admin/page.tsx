import CertificationManager from '@/components/admin/CertificationManager';

// 테스트 모드: 인증 체크 비활성화
export default async function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
        <p className="text-gray-600">
          K-Glow 플랫폼 인증 요청을 관리합니다
        </p>
      </div>

      <CertificationManager />
    </div>
  );
}

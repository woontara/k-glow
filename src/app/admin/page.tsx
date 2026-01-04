import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import CertificationManager from '@/components/admin/CertificationManager';

export default async function AdminPage() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/error?error=unauthorized');
  }

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

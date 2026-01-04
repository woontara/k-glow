import CertificationList from '@/components/certification/CertificationList';
import Link from 'next/link';

export default function CertificationStatusPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">인증 신청 현황</h1>
          <p className="text-gray-600">
            진행 중인 인증 신청 내역을 확인하세요
          </p>
        </div>
        <Link
          href="/certification/new"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
        >
          + 새 신청
        </Link>
      </div>

      <CertificationList />
    </div>
  );
}

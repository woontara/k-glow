import CertificationForm from '@/components/certification/CertificationForm';

export default function NewCertificationPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">인증 대행 신청</h1>
        <p className="text-gray-600">
          러시아/CIS 시장 진출을 위한 EAC, GOST 인증을 대행해드립니다
        </p>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <CertificationForm />
      </div>
    </div>
  );
}

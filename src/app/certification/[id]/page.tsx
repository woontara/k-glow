'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Partner {
  id: string;
  name: string;
  nameRu: string;
  websiteUrl?: string;
  description?: string;
  descriptionRu?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  companyName: string;
}

interface Certification {
  id: string;
  certType: 'EAC' | 'GOST' | 'OTHER';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  estimatedCost: number;
  notes: string;
  documents: any[];
  createdAt: string;
  updatedAt: string;
  partner: Partner;
  user: User;
}

export default function CertificationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [certification, setCertification] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadCertification(params.id);
    }
  }, [params.id]);

  const loadCertification = async (certId: string) => {
    try {
      const response = await fetch(`/api/certifications/${certId}`);
      if (!response.ok) {
        throw new Error('인증 정보를 찾을 수 없습니다');
      }
      const data = await response.json();
      setCertification(data);
    } catch (error) {
      console.error('인증 조회 실패:', error);
      alert('인증 정보를 불러오는데 실패했습니다');
      router.push('/certification/status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { text: '대기 중', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      IN_PROGRESS: { text: '진행 중', className: 'bg-blue-100 text-blue-800 border-blue-300' },
      COMPLETED: { text: '완료', className: 'bg-green-100 text-green-800 border-green-300' },
      REJECTED: { text: '반려', className: 'bg-red-100 text-red-800 border-red-300' },
    };
    const badge = badges[status as keyof typeof badges] || badges.PENDING;
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${badge.className}`}>
        {badge.text}
      </span>
    );
  };

  const getCertTypeLabel = (type: string) => {
    const labels = {
      EAC: 'EAC 인증 (유라시아 경제 연합)',
      GOST: 'GOST 인증 (러시아 국가 표준)',
      OTHER: '기타 인증',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!certification) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">인증 정보를 찾을 수 없습니다</p>
          <Link
            href="/certification/status"
            className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          뒤로가기
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{getCertTypeLabel(certification.certType)}</h1>
            <p className="text-gray-600">신청 번호: {certification.id}</p>
          </div>
          {getStatusBadge(certification.status)}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="space-y-6">
        {/* 인증 정보 카드 */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            인증 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">인증 종류</p>
              <p className="font-semibold">{getCertTypeLabel(certification.certType)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">예상 비용</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(certification.estimatedCost)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">신청일</p>
              <p className="font-medium">{formatDate(certification.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">최종 수정일</p>
              <p className="font-medium">{formatDate(certification.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* 파트너사 정보 카드 */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            파트너사 정보
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">파트너사명</p>
              <p className="font-semibold text-lg">{certification.partner.name}</p>
              <p className="text-gray-600">{certification.partner.nameRu}</p>
            </div>
            {certification.partner.websiteUrl && (
              <div>
                <p className="text-sm text-gray-600 mb-1">웹사이트</p>
                <a
                  href={certification.partner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  {certification.partner.websiteUrl}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
            {certification.partner.description && (
              <div>
                <p className="text-sm text-gray-600 mb-1">설명</p>
                <p className="text-gray-700">{certification.partner.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* 신청자 정보 카드 */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            신청자 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">회사명</p>
              <p className="font-semibold">{certification.user.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">담당자</p>
              <p className="font-semibold">{certification.user.name}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 mb-1">이메일</p>
              <a href={`mailto:${certification.user.email}`} className="text-blue-600 hover:text-blue-700">
                {certification.user.email}
              </a>
            </div>
          </div>
        </div>

        {/* 제품 정보 및 요청사항 */}
        {certification.notes && (
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              제품 정보 및 요청사항
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-line">{certification.notes}</p>
            </div>
          </div>
        )}

        {/* 첨부 파일 */}
        {certification.documents && Array.isArray(certification.documents) && certification.documents.length > 0 && (
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              첨부 파일 ({certification.documents.length})
            </h2>
            <div className="space-y-3">
              {certification.documents.map((doc: any, idx: number) => (
                <a
                  key={idx}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate group-hover:text-blue-600">
                      {doc.originalName || '파일'}
                    </p>
                    {doc.size && (
                      <p className="text-sm text-gray-500">
                        {(doc.size / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 진행 상태 안내 */}
        <div className={`border rounded-lg p-6 ${
          certification.status === 'COMPLETED' ? 'bg-green-50 border-green-200' :
          certification.status === 'REJECTED' ? 'bg-red-50 border-red-200' :
          certification.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200' :
          'bg-yellow-50 border-yellow-200'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            certification.status === 'COMPLETED' ? 'text-green-800' :
            certification.status === 'REJECTED' ? 'text-red-800' :
            certification.status === 'IN_PROGRESS' ? 'text-blue-800' :
            'text-yellow-800'
          }`}>
            {certification.status === 'COMPLETED' ? '✓ 인증이 완료되었습니다' :
             certification.status === 'REJECTED' ? '✗ 인증이 반려되었습니다' :
             certification.status === 'IN_PROGRESS' ? '⏳ 인증이 진행 중입니다' :
             '📋 인증 신청이 접수되었습니다'}
          </h3>
          <p className={`text-sm ${
            certification.status === 'COMPLETED' ? 'text-green-700' :
            certification.status === 'REJECTED' ? 'text-red-700' :
            certification.status === 'IN_PROGRESS' ? 'text-blue-700' :
            'text-yellow-700'
          }`}>
            {certification.status === 'COMPLETED' ? '인증서가 발급되었습니다. 담당자가 곧 연락드릴 예정입니다.' :
             certification.status === 'REJECTED' ? '신청이 반려되었습니다. 자세한 사항은 담당자에게 문의하세요.' :
             certification.status === 'IN_PROGRESS' ? '인증 기관에서 심사가 진행 중입니다. 완료까지 4-8주 소요될 수 있습니다.' :
             '신청서를 검토 중입니다. 1-2일 이내에 연락드리겠습니다.'}
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/certification/status')}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            목록으로
          </button>
          {certification.status === 'PENDING' && (
            <button
              onClick={() => router.push(`/certification/edit/${certification.id}`)}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              disabled
            >
              수정하기 (준비 중)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

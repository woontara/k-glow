'use client';

import { useState, useEffect } from 'react';

interface Partner {
  id: string;
  name: string;
  nameRu: string;
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

export default function CertificationManager() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    try {
      const response = await fetch('/api/certifications');
      const data = await response.json();
      setCertifications(data.certifications || []);
    } catch (error) {
      console.error('인증 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (certId: string, newStatus: string, newCost?: number) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/certifications/${certId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          estimatedCost: newCost,
        }),
      });

      if (response.ok) {
        alert('상태가 업데이트되었습니다');
        loadCertifications();
        setSelectedCert(null);
      } else {
        alert('업데이트 실패');
      }
    } catch (error) {
      console.error('업데이트 실패:', error);
      alert('업데이트 실패');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { text: '대기 중', className: 'bg-yellow-100 text-yellow-800' },
      IN_PROGRESS: { text: '진행 중', className: 'bg-blue-100 text-blue-800' },
      COMPLETED: { text: '완료', className: 'bg-green-100 text-green-800' },
      REJECTED: { text: '반려', className: 'bg-red-100 text-red-800' },
    };
    const badge = badges[status as keyof typeof badges] || badges.PENDING;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>
        {badge.text}
      </span>
    );
  };

  const getCertTypeLabel = (type: string) => {
    const labels = {
      EAC: 'EAC 인증',
      GOST: 'GOST 인증',
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

  const stats = {
    total: certifications.length,
    pending: certifications.filter(c => c.status === 'PENDING').length,
    inProgress: certifications.filter(c => c.status === 'IN_PROGRESS').length,
    completed: certifications.filter(c => c.status === 'COMPLETED').length,
    rejected: certifications.filter(c => c.status === 'REJECTED').length,
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div>
      {/* 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">전체</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-600 mb-1">대기 중</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600 mb-1">진행 중</p>
          <p className="text-2xl font-bold text-blue-900">{stats.inProgress}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 mb-1">완료</p>
          <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 mb-1">반려</p>
          <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
        </div>
      </div>

      {/* 인증 목록 */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  신청일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  브랜드/파트너사
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  인증 종류
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  예상 비용
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {certifications.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(cert.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900">{cert.user.companyName}</div>
                    <div className="text-gray-500">{cert.partner.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCertTypeLabel(cert.certType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {formatCurrency(cert.estimatedCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(cert.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      관리
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {certifications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            등록된 인증 요청이 없습니다
          </div>
        )}
      </div>

      {/* 상세 관리 모달 */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{getCertTypeLabel(selectedCert.certType)}</h2>
                  <p className="text-gray-600">신청 ID: {selectedCert.id}</p>
                </div>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* 기업 정보 */}
              <div>
                <h3 className="font-semibold mb-3">기업 정보</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">회사명:</span>
                    <span className="font-medium">{selectedCert.user.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">담당자:</span>
                    <span className="font-medium">{selectedCert.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">이메일:</span>
                    <span className="font-medium">{selectedCert.user.email}</span>
                  </div>
                </div>
              </div>

              {/* 파트너사 정보 */}
              <div>
                <h3 className="font-semibold mb-3">파트너사 정보</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium">{selectedCert.partner.name}</p>
                  <p className="text-gray-600">{selectedCert.partner.nameRu}</p>
                </div>
              </div>

              {/* 신청 내용 */}
              {selectedCert.notes && (
                <div>
                  <h3 className="font-semibold mb-3">신청 내용</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-line">{selectedCert.notes}</p>
                  </div>
                </div>
              )}

              {/* 첨부 파일 */}
              {selectedCert.documents && Array.isArray(selectedCert.documents) && selectedCert.documents.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">첨부 파일 ({selectedCert.documents.length})</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {selectedCert.documents.map((doc: any, idx: number) => (
                      <a
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.originalName || '파일'}</p>
                          {doc.size && (
                            <p className="text-xs text-gray-500">
                              {(doc.size / 1024).toFixed(1)} KB
                            </p>
                          )}
                        </div>
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* 상태 변경 */}
              <div>
                <h3 className="font-semibold mb-3">상태 관리</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateStatus(selectedCert.id, 'IN_PROGRESS')}
                    disabled={updating || selectedCert.status === 'IN_PROGRESS'}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    진행 중으로 변경
                  </button>
                  <button
                    onClick={() => updateStatus(selectedCert.id, 'COMPLETED')}
                    disabled={updating || selectedCert.status === 'COMPLETED'}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    완료 처리
                  </button>
                  <button
                    onClick={() => updateStatus(selectedCert.id, 'REJECTED')}
                    disabled={updating || selectedCert.status === 'REJECTED'}
                    className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    반려
                  </button>
                  <button
                    onClick={() => updateStatus(selectedCert.id, 'PENDING')}
                    disabled={updating || selectedCert.status === 'PENDING'}
                    className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    대기 중으로 변경
                  </button>
                </div>
              </div>

              {/* 일자 정보 */}
              <div className="text-sm text-gray-500 border-t pt-4">
                <p>신청일: {formatDate(selectedCert.createdAt)}</p>
                <p>수정일: {formatDate(selectedCert.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

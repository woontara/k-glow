'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Partner {
  id: string;
  name: string;
  nameRu: string;
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
}

export default function CertificationList() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

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
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const filteredCertifications = filter === 'all'
    ? certifications
    : certifications.filter(cert => cert.status === filter);

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
      {/* 필터 */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg border ${
            filter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'
          }`}
        >
          전체 ({certifications.length})
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 rounded-lg border ${
            filter === 'PENDING' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'
          }`}
        >
          대기 중 ({certifications.filter(c => c.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilter('IN_PROGRESS')}
          className={`px-4 py-2 rounded-lg border ${
            filter === 'IN_PROGRESS' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'
          }`}
        >
          진행 중 ({certifications.filter(c => c.status === 'IN_PROGRESS').length})
        </button>
        <button
          onClick={() => setFilter('COMPLETED')}
          className={`px-4 py-2 rounded-lg border ${
            filter === 'COMPLETED' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'
          }`}
        >
          완료 ({certifications.filter(c => c.status === 'COMPLETED').length})
        </button>
      </div>

      {/* 인증 목록 */}
      {filteredCertifications.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            신청 내역이 없습니다
          </h3>
          <p className="text-gray-500 mb-6">
            첫 인증을 신청하고 러시아 시장 진출을 시작하세요
          </p>
          <Link
            href="/certification/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            인증 신청하기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCertifications.map((cert) => (
            <div key={cert.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{getCertTypeLabel(cert.certType)}</h3>
                    {getStatusBadge(cert.status)}
                  </div>
                  <p className="text-gray-600">
                    파트너사: {cert.partner.name} ({cert.partner.nameRu})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">예상 비용</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(cert.estimatedCost)}</p>
                </div>
              </div>

              {/* 제품 정보 (notes에서 추출) */}
              {cert.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{cert.notes}</p>
                </div>
              )}

              {/* 첨부 파일 */}
              {cert.documents && Array.isArray(cert.documents) && cert.documents.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">첨부 파일 ({cert.documents.length})</p>
                  <div className="space-y-2">
                    {cert.documents.map((doc: any, idx: number) => (
                      <a
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-white border rounded hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-700 truncate">{doc.originalName || '파일'}</span>
                        <svg className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
                <div>
                  <span>신청일: {formatDate(cert.createdAt)}</span>
                  {cert.updatedAt !== cert.createdAt && (
                    <span className="ml-4">수정일: {formatDate(cert.updatedAt)}</span>
                  )}
                </div>
                <Link
                  href={`/certification/${cert.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  상세보기 →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 통계 */}
      {certifications.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium mb-1">총 신청</p>
            <p className="text-2xl font-bold text-blue-900">{certifications.length}건</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-600 font-medium mb-1">진행 중</p>
            <p className="text-2xl font-bold text-yellow-900">
              {certifications.filter(c => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length}건
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium mb-1">완료</p>
            <p className="text-2xl font-bold text-green-900">
              {certifications.filter(c => c.status === 'COMPLETED').length}건
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

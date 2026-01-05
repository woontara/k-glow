'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Partner {
  id: string;
  name: string;
  nameRu: string;
}

interface UploadedFile {
  originalName: string;
  savedName: string;
  url: string;
  size: number;
}

export default function CertificationForm() {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState({
    partnerId: '',
    certType: 'EAC' as 'EAC' | 'GOST' | 'OTHER',
    productName: '',
    productCategory: '',
    quantity: '',
    notes: '',
  });

  // 테스트 모드: 바로 파트너 로드
  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const response = await fetch('/api/partners');
      const data = await response.json();
      setPartners(data.partners || []);
    } catch (error) {
      console.error('파트너사 로드 실패:', error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '파일 업로드 실패');
      }

      const data = await response.json();
      setUploadedFiles([...uploadedFiles, ...data.files]);

      // 파일 input 초기화
      e.target.value = '';
    } catch (error: any) {
      console.error('파일 업로드 실패:', error);
      alert(error.message || '파일 업로드에 실패했습니다');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.partnerId || !formData.certType) {
      alert('필수 항목을 모두 입력해주세요');
      return;
    }

    setLoading(true);

    try {
      const certCosts = {
        EAC: 500000,
        GOST: 300000,
        OTHER: 400000,
      };
      const estimatedCost = certCosts[formData.certType];

      // 업로드된 파일 정보를 documents 필드에 저장
      const documents = uploadedFiles.map((file) => ({
        originalName: file.originalName,
        url: file.url,
        size: file.size,
      }));

      const response = await fetch('/api/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: formData.partnerId,
          certType: formData.certType,
          estimatedCost,
          notes: `제품명: ${formData.productName}\n카테고리: ${formData.productCategory}\n수량: ${formData.quantity}\n\n${formData.notes}`,
          documents,
        }),
      });

      if (!response.ok) {
        throw new Error('신청 실패');
      }

      const result = await response.json();
      alert('인증 신청이 완료되었습니다!');
      router.push('/certification/status');
    } catch (error) {
      console.error('신청 실패:', error);
      alert('신청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const getCertDescription = (type: string) => {
    switch (type) {
      case 'EAC':
        return 'EAC 인증 (유라시아 경제 연합 인증) - 500,000원';
      case 'GOST':
        return 'GOST 인증 (러시아 국가 표준) - 300,000원';
      case 'OTHER':
        return '기타 인증 - 400,000원';
      default:
        return '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 파트너사 선택 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          파트너사 선택 <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.partnerId}
          onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">파트너사를 선택하세요</option>
          {partners.map((partner) => (
            <option key={partner.id} value={partner.id}>
              {partner.name} ({partner.nameRu})
            </option>
          ))}
        </select>
        {partners.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">
            등록된 파트너사가 없습니다. 먼저 브랜드 분석을 진행해주세요.
          </p>
        )}
      </div>

      {/* 인증 종류 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          인증 종류 <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {(['EAC', 'GOST', 'OTHER'] as const).map((type) => (
            <label key={type} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="certType"
                value={type}
                checked={formData.certType === type}
                onChange={(e) => setFormData({ ...formData, certType: e.target.value as any })}
                className="mt-1"
              />
              <div>
                <div className="font-semibold">{type}</div>
                <div className="text-sm text-gray-600">{getCertDescription(type)}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 제품 정보 */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">제품 정보</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">제품명</label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              placeholder="예: 수분 크림"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">제품 카테고리</label>
            <select
              value={formData.productCategory}
              onChange={(e) => setFormData({ ...formData, productCategory: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">선택하세요</option>
              <option value="스킨케어">스킨케어</option>
              <option value="메이크업">메이크업</option>
              <option value="선케어">선케어</option>
              <option value="클렌징">클렌징</option>
              <option value="마스크">마스크</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">수량 (개)</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="100"
              className="w-full px-4 py-2 border rounded-lg"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* 서류 업로드 */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-2">인증 서류 업로드</h3>
        <p className="text-sm text-gray-600 mb-4">
          인증에 필요한 서류를 업로드하세요 (PDF, 이미지, Word, Excel 파일 / 최대 10MB)
        </p>

        <div className="space-y-4">
          {/* 파일 선택 버튼 */}
          <div>
            <label className="inline-block px-6 py-3 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {uploading ? '업로드 중...' : '파일 선택'}
              </span>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                multiple
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              여러 파일을 동시에 선택할 수 있습니다
            </p>
          </div>

          {/* 업로드된 파일 목록 */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">업로드된 파일 ({uploadedFiles.length})</p>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.originalName}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-4 text-red-600 hover:text-red-700 p-1"
                    title="삭제"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 추가 메모 */}
      <div>
        <label className="block text-sm font-medium mb-2">추가 요청사항</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          placeholder="인증 관련 추가 요청사항이나 문의사항을 입력하세요"
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* 안내사항 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">📋 인증 절차 안내</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>1. 신청서 접수 및 검토 (1-2일)</li>
          <li>2. 필요 서류 요청 및 제출</li>
          <li>3. 인증 기관 제출 및 심사</li>
          <li>4. 인증서 발급 (4-8주 소요)</li>
        </ul>
      </div>

      {/* 제출 버튼 */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading || !formData.partnerId}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? '신청 중...' : '인증 신청하기'}
        </button>
      </div>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HSCodeSearch from './HSCodeSearch';
import { HSCode } from '@/data/hs-codes-cosmetics';

interface UploadedFile {
  originalName: string;
  savedName: string;
  url: string;
  size: number;
}

export default function CertificationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState({
    brandName: '',
    websiteUrl: '',
    certType: 'EAC' as 'EAC' | 'GOST' | 'OTHER',
    productName: '',
    productCategory: '',
    productDescription: '',
    hsCode: '',
    hsCodeName: '',
    email: '',
    notes: '',
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formDataObj = new FormData();
      Array.from(files).forEach((file) => {
        formDataObj.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '파일 업로드 실패');
      }

      const data = await response.json();
      setUploadedFiles([...uploadedFiles, ...data.files]);
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
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.brandName || !formData.email || !formData.productName) {
      alert('필수 항목을 모두 입력해주세요');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('올바른 이메일 주소를 입력해주세요');
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

      const documents = uploadedFiles.map((file) => ({
        originalName: file.originalName,
        url: file.url,
        size: file.size,
      }));

      const hsCodeInfo = formData.hsCode
        ? `HS코드: ${formData.hsCode} (${formData.hsCodeName})\n`
        : '';

      const response = await fetch('/api/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: formData.brandName,
          websiteUrl: formData.websiteUrl,
          certType: formData.certType,
          estimatedCost,
          email: formData.email,
          hsCode: formData.hsCode,
          notes: `제품명: ${formData.productName}\n카테고리: ${formData.productCategory}\n${hsCodeInfo}제품 설명: ${formData.productDescription}\n\n${formData.notes}`,
          documents,
        }),
      });

      if (!response.ok) {
        throw new Error('신청 실패');
      }

      alert('인증 대행 신청이 완료되었습니다!\n\n입력하신 이메일로 전자계약서가 발송될 예정입니다.');
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
        return 'EAC 인증 - 유라시아 경제 연합(러시아, 벨라루스, 카자흐스탄 등) 수출 시 필수';
      case 'GOST':
        return 'GOST-R 인증 - 러시아 국가 표준 인증';
      case 'OTHER':
        return '기타 인증 - 상담 후 결정';
      default:
        return '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 브랜드 정보 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-[#8BA4B4] text-white rounded-full flex items-center justify-center text-sm">1</span>
          브랜드 정보
        </h3>
        <div className="space-y-4 pl-10">
          <div>
            <label className="block text-sm font-medium mb-2">
              브랜드명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              placeholder="예: 아모레퍼시픽"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              자사몰 주소
            </label>
            <input
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              placeholder="https://www.example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">브랜드 웹사이트 또는 자사몰 URL을 입력해주세요</p>
          </div>
        </div>
      </div>

      {/* 인증 신청 품목 정보 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-[#8BA4B4] text-white rounded-full flex items-center justify-center text-sm">2</span>
          인증 신청 품목 정보
        </h3>
        <div className="space-y-4 pl-10">
          {/* 인증 종류 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              인증 종류 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {(['EAC', 'GOST', 'OTHER'] as const).map((type) => (
                <label
                  key={type}
                  className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                    formData.certType === type
                      ? 'border-[#8BA4B4] bg-[#8BA4B4]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="certType"
                    value={type}
                    checked={formData.certType === type}
                    onChange={(e) => setFormData({ ...formData, certType: e.target.value as any })}
                    className="mt-1 accent-[#8BA4B4]"
                  />
                  <div>
                    <div className="font-semibold">{type}</div>
                    <div className="text-sm text-gray-600">{getCertDescription(type)}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              제품명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              placeholder="예: 수분 크림, 에센스 세트"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">제품 카테고리</label>
            <select
              value={formData.productCategory}
              onChange={(e) => setFormData({ ...formData, productCategory: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent transition-all"
            >
              <option value="">선택하세요</option>
              <option value="스킨케어">스킨케어</option>
              <option value="메이크업">메이크업</option>
              <option value="선케어">선케어</option>
              <option value="클렌징">클렌징</option>
              <option value="마스크팩">마스크팩</option>
              <option value="헤어케어">헤어케어</option>
              <option value="바디케어">바디케어</option>
              <option value="기타">기타</option>
            </select>
          </div>

          {/* HS코드 검색 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              HS코드 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <HSCodeSearch
              value={formData.hsCode}
              onChange={(code, hsCode) => {
                setFormData({
                  ...formData,
                  hsCode: code,
                  hsCodeName: hsCode?.nameKo || '',
                });
              }}
              placeholder="제품명으로 HS코드 검색 (예: 크림, 샴푸, 립스틱)"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              수출 시 필요한 HS코드를 검색하여 선택해주세요. 모르시면 비워두셔도 됩니다.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">제품 설명</label>
            <textarea
              value={formData.productDescription}
              onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
              rows={3}
              placeholder="인증 신청할 제품에 대한 간단한 설명을 입력해주세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* 서류 업로드 */}
          <div>
            <label className="block text-sm font-medium mb-2">참고 자료 (선택)</label>
            <p className="text-sm text-gray-600 mb-3">
              제품 관련 자료가 있으시면 업로드해주세요 (PDF, 이미지 등)
            </p>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {uploading ? '업로드 중...' : '파일 선택'}
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                multiple
                disabled={uploading}
                className="hidden"
              />
            </label>

            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border rounded-xl">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <svg className="w-5 h-5 text-[#8BA4B4] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      className="ml-4 text-red-500 hover:text-red-600 p-1"
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
      </div>

      {/* 계약 안내 및 이메일 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-[#8BA4B4] text-white rounded-full flex items-center justify-center text-sm">3</span>
          계약 체결 안내
        </h3>
        <div className="pl-10">
          {/* 계약 안내 박스 */}
          <div className="bg-[#8BA4B4]/10 border border-[#8BA4B4]/30 rounded-xl p-5 mb-4">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-[#8BA4B4] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <h4 className="font-semibold text-[#2D3436] mb-2">전자계약서 안내</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  인증 대행 서비스 진행을 위해 <strong>업무 대행 계약서</strong> 체결이 필요합니다.
                  <br />
                  신청 완료 후, 입력하신 이메일로 <strong>전자계약서</strong>가 발송됩니다.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              계약서 수신 이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@company.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent transition-all"
              required
            />
            <p className="text-xs text-gray-500 mt-1">전자계약서가 발송될 이메일 주소를 입력해주세요</p>
          </div>
        </div>
      </div>

      {/* 추가 요청사항 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm">4</span>
          추가 요청사항 (선택)
        </h3>
        <div className="pl-10">
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="인증 관련 추가 문의사항이 있으시면 입력해주세요"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent transition-all resize-none"
          />
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-6 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading || !formData.brandName || !formData.email || !formData.productName}
          className="flex-1 px-6 py-4 bg-[#8BA4B4] text-white font-semibold rounded-xl hover:bg-[#7A939F] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
        >
          {loading ? '신청 중...' : '인증 대행 신청하기'}
        </button>
      </div>
    </form>
  );
}

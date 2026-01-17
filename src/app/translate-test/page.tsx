'use client';

import { useState, useEffect } from 'react';

interface TranslateStatus {
  status: string;
  translateGemma: {
    available: boolean;
    projectId: string;
    location: string;
  };
  claudeApi: {
    available: boolean;
  };
}

interface TranslateResult {
  success: boolean;
  original: string;
  translated: string;
  method: string;
  type: string;
  duration: string;
  error?: string;
}

export default function TranslateTestPage() {
  const [status, setStatus] = useState<TranslateStatus | null>(null);
  const [text, setText] = useState('');
  const [type, setType] = useState('general');
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 상태 확인
  useEffect(() => {
    fetch('/api/translate-test')
      .then((res) => res.json())
      .then(setStatus)
      .catch((err) => console.error('Status check failed:', err));
  }, []);

  // 번역 실행
  const handleTranslate = async () => {
    if (!text.trim()) {
      setError('텍스트를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/translate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '번역 실패');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 샘플 텍스트
  const sampleTexts = {
    product_name: '어노브 딥 데미지 트리트먼트 헤어 마스크',
    product_description:
      '손상된 모발을 위한 집중 케어 트리트먼트입니다. 아르간 오일과 케라틴 성분이 모발 깊숙이 침투하여 손상된 큐티클을 복구하고, 부드럽고 윤기 있는 머릿결로 가꿔줍니다.',
    general: '안녕하세요, K-Glow입니다. 한국 프리미엄 화장품을 러시아에 소개합니다.',
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2D3436] mb-2">
            번역 테스트
          </h1>
          <p className="text-[#636E72]">
            TranslateGemma (Vertex AI) 번역 테스트 페이지
          </p>
        </div>

        {/* 상태 카드 */}
        {status && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-[#2D3436] mb-4">
              API 상태
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-xl ${
                  status.translateGemma.available
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      status.translateGemma.available
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span className="font-medium">TranslateGemma</span>
                </div>
                <div className="text-sm text-[#636E72]">
                  <p>Project: {status.translateGemma.projectId}</p>
                  <p>Location: {status.translateGemma.location}</p>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl ${
                  status.claudeApi.available
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      status.claudeApi.available
                        ? 'bg-green-500'
                        : 'bg-yellow-500'
                    }`}
                  />
                  <span className="font-medium">Claude API (Fallback)</span>
                </div>
                <div className="text-sm text-[#636E72]">
                  {status.claudeApi.available ? '설정됨' : '미설정'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 입력 폼 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-[#2D3436] mb-4">
            번역 입력
          </h2>

          {/* 번역 타입 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#636E72] mb-2">
              번역 타입
            </label>
            <div className="flex gap-2">
              {[
                { value: 'general', label: '일반' },
                { value: 'product_name', label: '제품명' },
                { value: 'product_description', label: '제품 설명' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setType(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    type === option.value
                      ? 'bg-[#8BA4B4] text-white'
                      : 'bg-[#FAF8F5] text-[#636E72] hover:bg-[#8BA4B4]/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 텍스트 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#636E72] mb-2">
              한국어 텍스트
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="번역할 한국어 텍스트를 입력하세요..."
              className="w-full h-32 px-4 py-3 border border-[#DFE6E9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8BA4B4]/50 resize-none"
            />
          </div>

          {/* 샘플 텍스트 버튼 */}
          <div className="mb-4">
            <button
              onClick={() => setText(sampleTexts[type as keyof typeof sampleTexts])}
              className="text-sm text-[#8BA4B4] hover:underline"
            >
              샘플 텍스트 사용
            </button>
          </div>

          {/* 번역 버튼 */}
          <button
            onClick={handleTranslate}
            disabled={loading || !text.trim()}
            className={`w-full py-3 rounded-xl font-medium transition-colors ${
              loading || !text.trim()
                ? 'bg-[#DFE6E9] text-[#636E72] cursor-not-allowed'
                : 'bg-[#8BA4B4] text-white hover:bg-[#7A939F]'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                번역 중...
              </span>
            ) : (
              '러시아어로 번역'
            )}
          </button>

          {/* 에러 표시 */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* 결과 */}
        {result && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#2D3436]">
                번역 결과
              </h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#8BA4B4]/10 text-[#8BA4B4] rounded-full text-sm font-medium">
                  {result.method}
                </span>
                <span className="px-3 py-1 bg-[#FAF8F5] text-[#636E72] rounded-full text-sm">
                  {result.duration}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* 원문 */}
              <div className="p-4 bg-[#FAF8F5] rounded-xl">
                <span className="text-xs font-medium text-[#636E72] uppercase mb-2 block">
                  원문 (한국어)
                </span>
                <p className="text-[#2D3436]">{result.original}</p>
              </div>

              {/* 번역 */}
              <div className="p-4 bg-[#8BA4B4]/5 rounded-xl border border-[#8BA4B4]/20">
                <span className="text-xs font-medium text-[#8BA4B4] uppercase mb-2 block">
                  번역 (러시아어)
                </span>
                <p className="text-[#2D3436]">{result.translated}</p>
              </div>
            </div>
          </div>
        )}

        {/* 돌아가기 */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="text-[#8BA4B4] hover:underline"
          >
            홈으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}

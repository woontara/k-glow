'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ProductRebuildData, PROGRESS_STEPS, RebuildProgress } from '@/types/product-rebuild';
import { SUPPORTED_SITES } from '@/lib/scraper/constants';
import ProductRebuildResult from '@/components/product-rebuild/ProductRebuildResult';

// Liquid Blob Component
function LiquidBlob({ size, color, x, y, delay, duration }: {
  size: number;
  color: string;
  x: string;
  y: string;
  delay: number;
  duration: number;
}) {
  return (
    <div
      className="absolute rounded-full opacity-40 blur-3xl animate-liquid pointer-events-none"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        left: x,
        top: y,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  );
}

// Premium Card Component
function PremiumCard({
  children,
  className = '',
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || !hover) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, [hover]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/40 shadow-xl transition-all duration-500 ${hover ? 'hover:shadow-2xl hover:border-[#8BA4B4]/30' : ''} ${className}`}
      style={{
        transform: hover && isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {hover && isHovered && (
        <div
          className="absolute inset-0 opacity-30 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 200px at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 164, 180, 0.4), transparent)`,
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  gradient,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  index: number;
}) {
  return (
    <div
      className="group text-center animate-reveal"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="font-bold text-[#2D3436] mb-1">{title}</h3>
      <p className="text-sm text-[#9EA7AA]">{description}</p>
    </div>
  );
}

// Option Toggle Component
function OptionToggle({
  checked,
  onChange,
  title,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
      checked
        ? 'bg-gradient-to-br from-[#8BA4B4]/20 to-[#A8C5D4]/10 border-2 border-[#8BA4B4]'
        : 'bg-white/60 border-2 border-white/60 hover:border-[#8BA4B4]/30'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
        checked ? 'border-[#8BA4B4] bg-[#8BA4B4]' : 'border-[#DDD]'
      }`}>
        {checked && (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        disabled={disabled}
      />
      <div>
        <p className="font-semibold text-[#2D3436]">{title}</p>
        <p className="text-sm text-[#9EA7AA]">{description}</p>
      </div>
    </label>
  );
}

// Progress Step Component
function ProgressStep({
  step,
  currentStep,
  message,
  percentage,
}: {
  step: string;
  currentStep: string;
  message: string;
  percentage: number;
}) {
  const steps = ['connecting', 'scraping', 'capturing', 'downloading', 'translating'];
  const currentIndex = steps.indexOf(currentStep);
  const stepIndex = steps.indexOf(step);
  const isActive = step === currentStep;
  const isComplete = stepIndex < currentIndex;

  return (
    <div className={`flex items-center gap-3 ${isActive ? 'opacity-100' : isComplete ? 'opacity-60' : 'opacity-30'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
        isComplete
          ? 'bg-[#A4B4A8] text-white'
          : isActive
            ? 'bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] text-white animate-pulse'
            : 'bg-[#E8E2D9] text-[#9EA7AA]'
      }`}>
        {isComplete ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : isActive ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <span className="text-xs font-bold">{stepIndex + 1}</span>
        )}
      </div>
      <span className={`text-sm font-medium ${isActive ? 'text-[#5A7A8A]' : 'text-[#9EA7AA]'}`}>
        {message}
      </span>
    </div>
  );
}

export default function ProductRebuildPage() {
  const [result, setResult] = useState<ProductRebuildData | null>(null);
  const [url, setUrl] = useState('');
  const [options, setOptions] = useState({
    captureScreenshot: true,
    downloadImages: true,
    translateToRussian: true,
    saveToDatabase: false,
  });
  const [progress, setProgress] = useState<RebuildProgress>({
    step: 'idle',
    message: '',
    percentage: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError('상품 URL을 입력해주세요.');
      return;
    }

    try {
      const steps: RebuildProgress['step'][] = [
        'connecting',
        'scraping',
        'capturing',
        'downloading',
        'translating',
      ];

      let currentStepIndex = 0;
      const updateProgress = () => {
        if (currentStepIndex < steps.length) {
          const step = steps[currentStepIndex];
          setProgress(PROGRESS_STEPS[step] as RebuildProgress);
          currentStepIndex++;
        }
      };

      updateProgress();
      const progressInterval = setInterval(updateProgress, 3000);

      const response = await fetch('/api/product-rebuild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, options }),
      });

      clearInterval(progressInterval);

      const resultData = await response.json();

      if (!resultData.success) {
        throw new Error(resultData.error || '요청 실패');
      }

      setProgress(PROGRESS_STEPS.done as RebuildProgress);
      setResult(resultData.data);
    } catch (err) {
      setProgress(PROGRESS_STEPS.error as RebuildProgress);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const handleReset = () => {
    setResult(null);
    setUrl('');
    setProgress({ step: 'idle', message: '', percentage: 0 });
    setError(null);
  };

  const isLoading = progress.step !== 'idle' && progress.step !== 'done' && progress.step !== 'error';

  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      title: 'URL 입력',
      description: '상품 페이지 URL',
      gradient: 'from-[#8BA4B4] to-[#A8C5D4]',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: '스크린샷',
      description: '전체 페이지 캡처',
      gradient: 'from-[#A4B4A8] to-[#C4D4C8]',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      title: '이미지 저장',
      description: '상품 이미지 다운로드',
      gradient: 'from-[#D4C4A8] to-[#E8DCC8]',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      title: 'AI 번역',
      description: '러시아어 자동 번역',
      gradient: 'from-[#E8B4B8] to-[#F0D0D4]',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAFBFC] via-[#F5F7F9] to-[#FAF8F5] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <LiquidBlob size={600} color="#A8C5D4" x="-10%" y="15%" delay={0} duration={25} />
        <LiquidBlob size={500} color="#E8B4B8" x="75%" y="55%" delay={2} duration={30} />
        <LiquidBlob size={400} color="#D4C4A8" x="45%" y="80%" delay={4} duration={20} />
      </div>

      {/* Grain Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Header */}
      <section className="relative pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#8BA4B4] hover:text-[#5A7A8A] transition-colors mb-8 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">홈으로</span>
          </Link>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8BA4B4]/10 to-[#A8C5D4]/10 rounded-full border border-[#8BA4B4]/20 mb-6">
              <svg className="w-4 h-4 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-[#8BA4B4] font-medium text-sm tracking-wider uppercase">Product Rebuild</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[#2D3436] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              {result ? '리빌드 결과' : (
                <>
                  상품{' '}
                  <span className="bg-gradient-to-r from-[#8BA4B4] via-[#A8C5D4] to-[#8BA4B4] bg-clip-text text-transparent">
                    리빌드
                  </span>
                </>
              )}
            </h1>
            {!result && (
              <p className="text-lg text-[#636E72] max-w-2xl mx-auto" style={{ fontFamily: 'Pretendard, sans-serif' }}>
                한국 쇼핑몰 상품 URL을 입력하면 정보를 자동 추출하고 러시아어로 번역합니다
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          {!result ? (
            <>
              {/* Feature Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {features.map((feature, index) => (
                  <FeatureCard key={index} {...feature} index={index} />
                ))}
              </div>

              {/* Form */}
              <div className="max-w-2xl mx-auto">
                <PremiumCard hover={false} className="animate-reveal">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] rounded-2xl flex items-center justify-center shadow-lg shadow-[#8BA4B4]/30">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#2D3436]" style={{ fontFamily: 'Playfair Display, serif' }}>상품 URL 입력</h2>
                      <p className="text-sm text-[#9EA7AA]">Product URL Input</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {/* URL Input */}
                    <div className="mb-6">
                      <label className="block text-xs font-medium text-[#8BA4B4] mb-2 uppercase tracking-wider">
                        상품 URL <span className="text-[#E8B4B8]">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#8BA4B4]/10 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </div>
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="https://www.coupang.com/vp/products/..."
                          className="w-full pl-16 pr-4 py-4 bg-white/80 border border-[#E8E2D9] rounded-2xl text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all disabled:opacity-50 font-medium"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Supported Sites */}
                    <div className="mb-6">
                      <p className="text-xs font-medium text-[#9EA7AA] uppercase tracking-wider mb-3">지원 사이트</p>
                      <div className="flex flex-wrap gap-2">
                        {SUPPORTED_SITES.map((site) => (
                          <span
                            key={site.pattern}
                            className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-gradient-to-r from-[#8BA4B4]/10 to-[#A8C5D4]/10 text-[#5A7A8A] border border-[#8BA4B4]/20"
                          >
                            {site.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Options */}
                    <div className="mb-6 space-y-3">
                      <p className="text-xs font-medium text-[#9EA7AA] uppercase tracking-wider mb-3">옵션</p>
                      <OptionToggle
                        checked={options.captureScreenshot}
                        onChange={(checked) => setOptions({ ...options, captureScreenshot: checked })}
                        title="전체 페이지 스크린샷 캡처"
                        description="상품 상세페이지 전체를 이미지로 저장"
                        disabled={isLoading}
                      />
                      <OptionToggle
                        checked={options.downloadImages}
                        onChange={(checked) => setOptions({ ...options, downloadImages: checked })}
                        title="상품 이미지 다운로드"
                        description="상품 이미지를 로컬에 저장 (최대 20개)"
                        disabled={isLoading}
                      />
                      <OptionToggle
                        checked={options.translateToRussian}
                        onChange={(checked) => setOptions({ ...options, translateToRussian: checked })}
                        title="러시아어 번역"
                        description="Claude AI로 러시아어 번역"
                        disabled={isLoading}
                      />
                      <OptionToggle
                        checked={options.saveToDatabase}
                        onChange={(checked) => setOptions({ ...options, saveToDatabase: checked })}
                        title="데이터베이스에 저장"
                        description="결과를 데이터베이스에 저장하여 나중에 확인"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Progress */}
                    {isLoading && (
                      <div className="mb-6 p-6 bg-gradient-to-br from-[#8BA4B4]/10 to-[#A8C5D4]/5 rounded-2xl border border-[#8BA4B4]/30">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-semibold text-[#5A7A8A]">{progress.message}</span>
                          <span className="text-lg font-bold bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] bg-clip-text text-transparent">
                            {progress.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-[#E8E2D9] rounded-full h-3 overflow-hidden mb-6">
                          <div
                            className="bg-gradient-to-r from-[#8BA4B4] via-[#9BB4C4] to-[#A8C5D4] h-3 rounded-full transition-all duration-500"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                        <div className="space-y-3">
                          <ProgressStep step="connecting" currentStep={progress.step} message="페이지 연결 중..." percentage={10} />
                          <ProgressStep step="scraping" currentStep={progress.step} message="정보 추출 중..." percentage={30} />
                          <ProgressStep step="capturing" currentStep={progress.step} message="스크린샷 캡처 중..." percentage={50} />
                          <ProgressStep step="downloading" currentStep={progress.step} message="이미지 다운로드 중..." percentage={70} />
                          <ProgressStep step="translating" currentStep={progress.step} message="러시아어 번역 중..." percentage={90} />
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {error && (
                      <div className="mb-6 p-5 bg-gradient-to-br from-[#E8B4B8]/20 to-[#D4A4A8]/10 rounded-2xl border border-[#E8B4B8]/30">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-[#E8B4B8] rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-[#2D3436]">오류 발생</p>
                            <p className="text-sm text-[#636E72]">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading || !url}
                      className="w-full py-5 bg-gradient-to-r from-[#8BA4B4] via-[#9BB4C4] to-[#A8C5D4] text-white font-bold text-lg rounded-2xl shadow-xl shadow-[#8BA4B4]/30 hover:shadow-2xl hover:shadow-[#8BA4B4]/40 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-3 relative z-10">
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                          처리 중...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-3 relative z-10">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          상품 정보 가져오기
                        </span>
                      )}
                    </button>
                  </form>
                </PremiumCard>

                {/* Info Box */}
                <div className="mt-8 p-5 bg-gradient-to-br from-[#D4C4A8]/20 to-[#C4B498]/10 rounded-2xl border border-[#D4C4A8]/30 animate-reveal" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#D4C4A8] rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[#5A7A8A] mb-2">안내 사항</p>
                      <ul className="space-y-1.5 text-sm text-[#636E72]">
                        <li className="flex items-start gap-2">
                          <span className="text-[#D4C4A8] mt-0.5">•</span>
                          처리 시간은 페이지 크기에 따라 1-3분 정도 소요됩니다
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#D4C4A8] mt-0.5">•</span>
                          일부 사이트는 봇 차단으로 인해 정보 추출이 제한될 수 있습니다
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#D4C4A8] mt-0.5">•</span>
                          번역 기능은 Claude API 키가 설정된 경우에만 작동합니다
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Reset Button */}
              <div className="mb-6">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[#8BA4B4] font-medium hover:text-[#5A7A8A] transition-colors group"
                >
                  <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  새로운 URL 분석
                </button>
              </div>

              {/* Result */}
              <ProductRebuildResult data={result} />
            </>
          )}
        </div>
      </section>

      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');

        @keyframes liquid {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: rotate(0deg) scale(1);
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
          }
          50% {
            border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%;
            transform: rotate(180deg) scale(1.1);
          }
          75% {
            border-radius: 60% 40% 60% 30% / 70% 30% 50% 60%;
          }
        }

        @keyframes reveal {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-liquid {
          animation: liquid 20s ease-in-out infinite;
        }

        .animate-reveal {
          animation: reveal 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </main>
  );
}

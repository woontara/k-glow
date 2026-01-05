'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { AnalyzerOutput } from '@/types';

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

// Premium Card with Spotlight Effect
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

// Process Step Component
function ProcessStep({
  number,
  icon,
  title,
  description,
  active
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div className={`relative animate-reveal`} style={{ animationDelay: `${number * 0.1}s` }}>
      <div className={`flex items-start gap-4 p-5 rounded-2xl transition-all duration-300 ${
        active
          ? 'bg-gradient-to-br from-[#8BA4B4]/20 to-[#A8C5D4]/20 border border-[#8BA4B4]/30'
          : 'bg-white/40 border border-white/60'
      }`}>
        <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          active
            ? 'bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] text-white shadow-lg shadow-[#8BA4B4]/30'
            : 'bg-gradient-to-br from-[#8BA4B4]/20 to-[#A8C5D4]/20 text-[#5A7A8A]'
        }`}>
          {active ? (
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${active ? 'text-[#8BA4B4]' : 'text-[#9EA7AA]'}`}>
              Step {number}
            </span>
          </div>
          <h4 className={`font-bold ${active ? 'text-[#5A7A8A]' : 'text-[#2D3436]'}`}>{title}</h4>
          <p className="text-sm text-[#636E72] mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product, index }: { product: AnalyzerOutput['products'][0]; index: number }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="group p-5 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-2xl border border-white/60 hover:shadow-xl hover:border-[#8BA4B4]/30 transition-all duration-500 animate-reveal"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {product.imageUrls[0] && !imageError && (
        <div className="relative overflow-hidden rounded-xl mb-4">
          <img
            src={product.imageUrls[0]}
            alt={product.name}
            className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      <h3 className="font-bold text-[#2D3436] line-clamp-2">{product.name}</h3>
      <p className="text-sm text-[#8BA4B4] mt-1 line-clamp-1">{product.nameRu}</p>

      <div className="mt-4 pt-4 border-t border-[#E8E2D9]/50 flex items-center justify-between">
        <span className="text-lg font-bold bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] bg-clip-text text-transparent">
          ₩{product.price.toLocaleString()}
        </span>
        <span className="text-xs px-3 py-1 bg-[#8BA4B4]/10 text-[#5A7A8A] rounded-full font-medium">
          {product.category || '화장품'}
        </span>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [maxDepth, setMaxDepth] = useState(2);
  const [saveToDb, setSaveToDb] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzerOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      title: '웹 크롤링',
      description: '웹사이트 전체 탐색 및 페이지 수집',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      title: '정보 추출',
      description: '제품명, 가격, 성분 정보 자동 추출',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      title: 'AI 번역',
      description: 'Claude AI 기반 러시아어 번역',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: '시장 분석',
      description: '러시아 시장 적합도 분석',
    },
  ];

  const handleAnalyze = async () => {
    if (!websiteUrl) {
      alert('웹사이트 URL을 입력해주세요');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);
    setCurrentStep(1);

    // Simulate step progression
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 8000);

    try {
      const response = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl,
          maxDepth,
          saveToDb,
        }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '분석 실패');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      clearInterval(stepInterval);
      setAnalyzing(false);
      setCurrentStep(0);
    }
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-[#A4B4A8] to-[#84A488]';
    if (score >= 60) return 'from-[#8BA4B4] to-[#6B94A4]';
    if (score >= 40) return 'from-[#D4C4A8] to-[#C4B498]';
    return 'from-[#E8B4B8] to-[#D4A4A8]';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAFBFC] via-[#F5F7F9] to-[#FAF8F5] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <LiquidBlob size={600} color="#A8C5D4" x="-15%" y="5%" delay={0} duration={25} />
        <LiquidBlob size={500} color="#E8B4B8" x="85%" y="50%" delay={2} duration={30} />
        <LiquidBlob size={400} color="#D4C4A8" x="40%" y="85%" delay={4} duration={20} />
      </div>

      {/* Grain Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Header */}
      <section className="relative pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
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
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8BA4B4] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8BA4B4]"></span>
              </span>
              <span className="text-[#8BA4B4] font-medium text-sm tracking-wider uppercase">AI Analysis</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[#2D3436] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              브랜드{' '}
              <span className="bg-gradient-to-r from-[#8BA4B4] via-[#A8C5D4] to-[#8BA4B4] bg-clip-text text-transparent">
                분석
              </span>
            </h1>
            <p className="text-lg text-[#636E72] max-w-2xl mx-auto" style={{ fontFamily: 'Pretendard, sans-serif' }}>
              한국 화장품 브랜드 웹사이트를 분석하여 제품 정보를 자동으로 추출하고 러시아어로 번역합니다
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Left Side: Input Form */}
            <div className="lg:col-span-3 space-y-8">
              {/* Analysis Form */}
              <PremiumCard hover={false} className="animate-reveal">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] rounded-2xl flex items-center justify-center shadow-lg shadow-[#8BA4B4]/30">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#2D3436]" style={{ fontFamily: 'Playfair Display, serif' }}>웹사이트 분석</h2>
                    <p className="text-sm text-[#9EA7AA]">Website Analysis</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* URL Input */}
                  <div>
                    <label className="block text-xs font-medium text-[#8BA4B4] mb-2 uppercase tracking-wider">
                      브랜드 웹사이트 URL <span className="text-[#E8B4B8]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#8BA4B4]/10 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://example-cosmetics.co.kr"
                        className="w-full pl-16 pr-4 py-4 bg-white/80 border border-[#E8E2D9] rounded-2xl text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all disabled:opacity-50 font-medium"
                        disabled={analyzing}
                      />
                    </div>
                    <p className="text-xs text-[#9EA7AA] mt-2">분석할 한국 화장품 브랜드의 공식 웹사이트 주소</p>
                  </div>

                  {/* Crawling Depth */}
                  <div className="p-5 bg-gradient-to-br from-white/60 to-white/30 rounded-2xl border border-white/60">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-semibold text-[#2D3436]">크롤링 깊이</label>
                      <span className="px-3 py-1 bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white text-sm font-bold rounded-lg">
                        {maxDepth}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      value={maxDepth}
                      onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                      className="w-full h-2 bg-[#E8E2D9] rounded-full appearance-none cursor-pointer accent-[#8BA4B4]"
                      disabled={analyzing}
                    />
                    <div className="flex justify-between text-xs text-[#9EA7AA] mt-3">
                      <span>빠름 (1)</span>
                      <span>보통 (2-3)</span>
                      <span>상세 (4)</span>
                    </div>
                  </div>

                  {/* Save to DB Option */}
                  <label className={`flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
                    saveToDb
                      ? 'bg-gradient-to-br from-[#8BA4B4]/20 to-[#A8C5D4]/10 border-2 border-[#8BA4B4]'
                      : 'bg-white/60 border-2 border-white/60 hover:border-[#8BA4B4]/30'
                  }`}>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      saveToDb ? 'border-[#8BA4B4] bg-[#8BA4B4]' : 'border-[#DDD]'
                    }`}>
                      {saveToDb && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={saveToDb}
                      onChange={(e) => setSaveToDb(e.target.checked)}
                      className="sr-only"
                      disabled={analyzing}
                    />
                    <div>
                      <p className="font-semibold text-[#2D3436]">파트너사로 등록</p>
                      <p className="text-sm text-[#9EA7AA]">분석 결과를 데이터베이스에 저장합니다</p>
                    </div>
                  </label>

                  {/* Analyze Button */}
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing || !websiteUrl}
                    className="w-full py-5 bg-gradient-to-r from-[#8BA4B4] via-[#9BB4C4] to-[#A8C5D4] text-white font-bold text-lg rounded-2xl shadow-xl shadow-[#8BA4B4]/30 hover:shadow-2xl hover:shadow-[#8BA4B4]/40 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {analyzing ? (
                      <span className="flex items-center justify-center gap-3 relative z-10">
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        분석 중... (최대 2분 소요)
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3 relative z-10">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        AI 분석 시작
                      </span>
                    )}
                  </button>
                </div>
              </PremiumCard>

              {/* Warning Info */}
              <div className="p-5 bg-gradient-to-br from-[#D4C4A8]/20 to-[#C4B498]/10 rounded-2xl border border-[#D4C4A8]/30 animate-reveal" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#D4C4A8] rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#5A7A8A] mb-2">분석 전 주의사항</p>
                    <ul className="space-y-1.5 text-sm text-[#636E72]">
                      <li className="flex items-start gap-2">
                        <span className="text-[#D4C4A8] mt-0.5">•</span>
                        분석에 1-2분 정도 소요될 수 있습니다
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#D4C4A8] mt-0.5">•</span>
                        웹사이트 구조에 따라 일부 정보가 누락될 수 있습니다
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#D4C4A8] mt-0.5">•</span>
                        robots.txt를 확인하여 크롤링이 허용된 사이트만 분석하세요
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Process Steps */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-semibold text-[#9EA7AA] uppercase tracking-wider mb-4 px-2">
                AI 분석 프로세스
              </h3>
              {steps.map((step, index) => (
                <ProcessStep
                  key={index}
                  number={index + 1}
                  icon={step.icon}
                  title={step.title}
                  description={step.description}
                  active={analyzing && currentStep === index + 1}
                />
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-8 p-6 bg-gradient-to-br from-[#E8B4B8]/20 to-[#D4A4A8]/10 rounded-2xl border border-[#E8B4B8]/30 animate-reveal">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#E8B4B8] rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#2D3436] mb-1">분석 실패</h3>
                  <p className="text-[#636E72]">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="mt-12 space-y-8 animate-reveal">
              {/* Brand Info */}
              <PremiumCard hover={false}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#A4B4A8] to-[#94A498] rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#2D3436]" style={{ fontFamily: 'Playfair Display, serif' }}>브랜드 정보</h2>
                    <p className="text-sm text-[#9EA7AA]">Brand Information</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs text-[#9EA7AA] uppercase tracking-wider font-medium mb-2">브랜드명</p>
                    <p className="text-2xl font-bold text-[#2D3436]" style={{ fontFamily: 'Playfair Display, serif' }}>{result.brand.name}</p>
                    <p className="text-lg text-[#8BA4B4] mt-1">{result.brand.nameRu}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#9EA7AA] uppercase tracking-wider font-medium mb-3">시장 적합도</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-4 bg-[#E8E2D9] rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getScoreGradient(result.brand.marketScore)} rounded-full transition-all duration-1000`}
                          style={{ width: `${result.brand.marketScore}%` }}
                        />
                      </div>
                      <span className={`text-2xl font-bold bg-gradient-to-r ${getScoreGradient(result.brand.marketScore)} bg-clip-text text-transparent`}>
                        {result.brand.marketScore}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-4 border-t border-[#E8E2D9]/50">
                    <p className="text-xs text-[#9EA7AA] uppercase tracking-wider font-medium mb-2">브랜드 설명</p>
                    <p className="text-[#2D3436] leading-relaxed">{result.brand.description}</p>
                    <p className="text-[#8BA4B4] mt-2 leading-relaxed">{result.brand.descriptionRu}</p>
                  </div>
                </div>
              </PremiumCard>

              {/* Products */}
              <PremiumCard hover={false}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#D4C4A8] to-[#C4B498] rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#2D3436]" style={{ fontFamily: 'Playfair Display, serif' }}>제품 목록</h2>
                      <p className="text-sm text-[#9EA7AA]">Products Found</p>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-gradient-to-r from-[#8BA4B4]/10 to-[#A8C5D4]/10 rounded-full text-[#5A7A8A] font-bold">
                    {result.products.length}개
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {result.products.slice(0, 9).map((product, index) => (
                    <ProductCard key={index} product={product} index={index} />
                  ))}
                </div>

                {result.products.length > 9 && (
                  <div className="text-center mt-6 pt-6 border-t border-[#E8E2D9]/50">
                    <button className="px-6 py-3 text-[#8BA4B4] font-semibold hover:text-[#5A7A8A] transition-colors">
                      +{result.products.length - 9}개 제품 더 보기
                    </button>
                  </div>
                )}
              </PremiumCard>

              {/* Success Message */}
              {saveToDb && (
                <div className="p-6 bg-gradient-to-br from-[#A4B4A8]/20 to-[#94A498]/10 rounded-2xl border border-[#A4B4A8]/30 animate-reveal">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#A4B4A8] to-[#94A498] rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2D3436]">파트너사 등록 완료</h3>
                      <p className="text-[#636E72]">
                        <Link href="/partners" className="text-[#8BA4B4] hover:underline">파트너사 목록</Link>에서 확인할 수 있습니다
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
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

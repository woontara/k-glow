'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Floating orb component
function FloatingOrb({
  size,
  color,
  initialX,
  initialY,
  delay = 0
}: {
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  delay?: number;
}) {
  return (
    <div
      className="absolute rounded-full blur-xl opacity-60 animate-float pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        left: `${initialX}%`,
        top: `${initialY}%`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

// Feature card component
function FeatureCard({
  href,
  icon,
  title,
  description,
  cta,
  disabled = false,
  index = 0,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  disabled?: boolean;
  index?: number;
}) {
  return (
    <Link href={disabled ? '#' : href} className={disabled ? 'cursor-not-allowed' : ''}>
      <div
        className={`
          group relative overflow-hidden rounded-3xl p-8 h-full
          bg-white/70 backdrop-blur-sm
          border border-white/50
          shadow-[0_8px_32px_rgba(139,164,180,0.15)]
          transition-all duration-500 ease-out
          ${disabled ? 'opacity-50' : 'hover:shadow-[0_16px_48px_rgba(139,164,180,0.25)] hover:-translate-y-2 hover:bg-white/90'}
        `}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute -inset-1 bg-gradient-to-br from-[#8BA4B4]/20 via-transparent to-[#E8B4B8]/20 blur-xl" />
        </div>

        {/* Icon */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] flex items-center justify-center text-white shadow-lg shadow-[#8BA4B4]/30 group-hover:scale-110 transition-transform duration-500">
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          <h3 className="font-display text-xl font-semibold text-[#2D3436] mb-3 group-hover:text-[#5A7A8A] transition-colors">
            {title}
          </h3>
          <p className="text-[#636E72] text-sm leading-relaxed mb-6">
            {description}
          </p>
          <div className={`
            inline-flex items-center gap-2 text-sm font-medium
            ${disabled ? 'text-[#B2BEC3]' : 'text-[#8BA4B4] group-hover:text-[#5A7A8A] group-hover:gap-3'}
            transition-all duration-300
          `}>
            {cta}
            {!disabled && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Stat component
function StatItem({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center group">
      <div
        className="font-display text-4xl md:text-5xl font-bold mb-3 transition-transform duration-300 group-hover:scale-105"
        style={{ color }}
      >
        {value}
      </div>
      <p className="text-[#636E72] text-sm md:text-base">{label}</p>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Custom styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .font-display {
          font-family: 'Cormorant Garamond', serif;
        }

        .font-body {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
          }
          25% {
            transform: translateY(-20px) translateX(10px) scale(1.05);
          }
          50% {
            transform: translateY(-10px) translateX(-5px) scale(0.95);
          }
          75% {
            transform: translateY(-25px) translateX(5px) scale(1.02);
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .animate-shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.4),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }

        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(139, 164, 180, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 40px rgba(139, 164, 180, 0.5));
          }
        }

        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
      `}</style>

      <main className="font-body min-h-screen bg-[#FAF8F5] overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-20">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FAF8F5] via-[#F0EBE3] to-[#E8E2D9]" />

          {/* Floating orbs */}
          {mounted && (
            <>
              <FloatingOrb size={300} color="linear-gradient(135deg, #8BA4B4 0%, #A8C5D4 100%)" initialX={10} initialY={20} delay={0} />
              <FloatingOrb size={200} color="linear-gradient(135deg, #E8B4B8 0%, #F0D0D4 100%)" initialX={80} initialY={60} delay={2} />
              <FloatingOrb size={150} color="linear-gradient(135deg, #D4C4A8 0%, #E8DCC8 100%)" initialX={70} initialY={15} delay={4} />
              <FloatingOrb size={100} color="linear-gradient(135deg, #8BA4B4 0%, #B8D0DC 100%)" initialX={20} initialY={70} delay={1} />
              <FloatingOrb size={180} color="linear-gradient(135deg, #C4B4A8 0%, #E0D4C8 100%)" initialX={85} initialY={80} delay={3} />
            </>
          )}

          {/* Content */}
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            {/* Logo */}
            <div className={`mb-8 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
              <Image
                src="/logo.png"
                alt="K-Glow"
                width={280}
                height={100}
                className="mx-auto animate-glow"
                priority
                unoptimized
              />
            </div>

            {/* Tagline */}
            <div className={`mb-6 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-[#2D3436] leading-tight">
                한국의 <span className="text-[#8BA4B4]">빛나는</span> 아름다움을
                <br />
                <span className="text-[#5A7A8A]">세계로</span>
              </h1>
            </div>

            {/* Subtitle */}
            <p
              className={`text-lg md:text-xl text-[#636E72] max-w-2xl mx-auto mb-10 leading-relaxed ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}
              style={{ animationDelay: '0.4s' }}
            >
              K-Glow는 한국 중소 화장품 브랜드의 러시아·CIS 시장 진출을
              <br className="hidden md:block" />
              AI 기반 분석과 원스톱 서비스로 지원합니다
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}
              style={{ animationDelay: '0.6s' }}
            >
              <Link
                href="/analyze"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white font-semibold rounded-full overflow-hidden shadow-lg shadow-[#8BA4B4]/30 hover:shadow-xl hover:shadow-[#8BA4B4]/40 transition-all duration-300 hover:-translate-y-1"
              >
                <span className="relative z-10">브랜드 분석 시작하기</span>
                <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="absolute inset-0 animate-shimmer" />
              </Link>

              <Link
                href="/partners"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-sm text-[#5A7A8A] font-semibold rounded-full border-2 border-[#8BA4B4]/30 hover:border-[#8BA4B4] hover:bg-white transition-all duration-300 hover:-translate-y-1"
              >
                파트너사 둘러보기
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-[#8BA4B4]/50 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-[#8BA4B4]/50 rounded-full" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-24 px-6">
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5]" />

          <div className="relative max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-[#8BA4B4]/10 text-[#5A7A8A] text-sm font-medium rounded-full mb-4">
                Our Services
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-semibold text-[#2D3436] mb-4">
                K-Glow가 제공하는 서비스
              </h2>
              <p className="text-[#636E72] max-w-xl mx-auto">
                러시아 시장 진출에 필요한 모든 것을 한 곳에서
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                href="/partners"
                icon={
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                title="파트너사"
                description="K-Glow와 함께하는 검증된 한국 화장품 브랜드 네트워크"
                cta="둘러보기"
                index={0}
              />

              <FeatureCard
                href="/calculator"
                icon={
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                }
                title="견적 계산"
                description="실시간 환율 반영, 관세·물류비 포함 정확한 수출 견적"
                cta="계산하기"
                index={1}
              />

              <FeatureCard
                href="/analyze"
                icon={
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                title="AI 브랜드 분석"
                description="Claude AI 기반 웹사이트 분석 및 러시아어 자동 번역"
                cta="분석하기"
                index={2}
              />

              <FeatureCard
                href="/certification/new"
                icon={
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                }
                title="인증 대행"
                description="EAC, GOST 등 러시아 화장품 인증 절차 전문 대행"
                cta="준비 중..."
                disabled
                index={3}
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative py-24 px-6">
          {/* Decorative background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-[#8BA4B4]/5 via-[#E8B4B8]/5 to-[#D4C4A8]/5" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#8BA4B4]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#8BA4B4]/20 to-transparent" />
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-5xl font-semibold text-[#2D3436] mb-4">
                왜 <span className="text-[#8BA4B4]">K-Glow</span>인가?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <StatItem
                value="AI 자동화"
                label="Claude AI 기반 번역 및 분석으로 빠르고 정확한 현지화"
                color="#8BA4B4"
              />
              <StatItem
                value="실시간 환율"
                label="KRW ↔ RUB 실시간 환율 반영으로 정확한 견적 산출"
                color="#C4A4A8"
              />
              <StatItem
                value="원스톱"
                label="분석부터 인증까지 러시아 진출에 필요한 모든 서비스"
                color="#A4B4A8"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 px-6">
          <div className="relative max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#8BA4B4] via-[#9BB4C4] to-[#A8C5D4] p-12 md:p-16">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#E8B4B8]/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

              <div className="relative text-center text-white">
                <h2 className="font-display text-3xl md:text-5xl font-semibold mb-6">
                  지금 시작하세요
                </h2>
                <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                  브랜드 웹사이트 URL만 입력하면 AI가 자동으로 분석하고
                  러시아 시장 진출 전략을 제안합니다
                </p>
                <Link
                  href="/analyze"
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-[#5A7A8A] font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
                >
                  무료로 분석 시작하기
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-[#E8E2D9]">
          <div className="max-w-6xl mx-auto text-center">
            <Image
              src="/logo.png"
              alt="K-Glow"
              width={100}
              height={35}
              className="mx-auto mb-4 opacity-70"
              unoptimized
            />
            <p className="text-[#B2BEC3] text-sm">
              © 2024 K-Glow. 한국 화장품 러시아 수출 플랫폼
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef, useCallback } from 'react';

// Magnetic button component
function MagneticButton({
  children,
  href,
  variant = 'primary',
  className = '',
}: {
  children: React.ReactNode;
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}) {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x: x * 0.3, y: y * 0.3 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  const variants = {
    primary: `
      bg-gradient-to-r from-[#7A9AAD] via-[#8BA4B4] to-[#9BB4C4]
      text-white font-semibold
      shadow-[0_10px_40px_rgba(123,154,173,0.4)]
      hover:shadow-[0_20px_60px_rgba(123,154,173,0.5)]
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity
    `,
    secondary: `
      bg-white/10 backdrop-blur-xl
      text-[#2D3436] font-semibold
      border border-white/30
      shadow-[0_8px_32px_rgba(0,0,0,0.08)]
      hover:bg-white/20 hover:border-white/50
      hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)]
    `,
    ghost: `
      text-[#5A7A8A] font-medium
      hover:text-[#2D3436]
      hover:bg-[#8BA4B4]/10
    `,
  };

  return (
    <Link
      ref={buttonRef}
      href={href}
      className={`
        relative inline-flex items-center justify-center gap-3 px-10 py-5
        rounded-full overflow-hidden
        transition-all duration-500 ease-out
        ${variants[variant]}
        ${className}
      `}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <span className="relative z-10">{children}</span>
    </Link>
  );
}

// Liquid blob component
function LiquidBlob({
  size,
  color,
  x,
  y,
  delay = 0,
  duration = 20,
}: {
  size: number;
  color: string;
  x: number;
  y: number;
  delay?: number;
  duration?: number;
}) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="w-full h-full rounded-full blur-3xl animate-liquid"
        style={{
          background: color,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      />
    </div>
  );
}

// Dewdrop component
function Dewdrop({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <div
      className="absolute rounded-full animate-dewdrop"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(139,164,180,0.3))',
        boxShadow: `
          inset -2px -2px 4px rgba(139,164,180,0.3),
          inset 2px 2px 4px rgba(255,255,255,0.8),
          0 4px 8px rgba(139,164,180,0.2)
        `,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

// Animated counter
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// Premium feature card
function PremiumCard({
  href,
  icon,
  title,
  titleEn,
  description,
  gradient,
  index,
  disabled = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  titleEn: string;
  description: string;
  gradient: string;
  index: number;
  disabled?: boolean;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <Link href={disabled ? '#' : href} className={disabled ? 'cursor-not-allowed' : 'group'}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className={`
          relative h-full p-8 rounded-[2rem]
          bg-white/60 backdrop-blur-2xl
          border border-white/40
          transition-all duration-700 ease-out
          overflow-hidden
          ${disabled ? 'opacity-50' : 'hover:bg-white/80 hover:border-white/60 hover:shadow-[0_32px_64px_rgba(139,164,180,0.2)] hover:-translate-y-3'}
        `}
        style={{
          animationDelay: `${index * 0.15}s`,
        }}
      >
        {/* Spotlight effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139,164,180,0.15) 0%, transparent 50%)`,
          }}
        />

        {/* Gradient border on hover */}
        <div className={`absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient} p-[1px]`}>
          <div className="w-full h-full bg-white/90 rounded-[2rem]" />
        </div>

        <div className="relative z-10">
          {/* Icon container */}
          <div className={`
            w-20 h-20 rounded-3xl mb-8
            flex items-center justify-center
            ${gradient}
            shadow-lg
            transition-transform duration-500
            group-hover:scale-110 group-hover:rotate-3
          `}>
            <div className="text-white">{icon}</div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <span className="block text-xs font-medium text-[#8BA4B4] tracking-[0.2em] uppercase mb-2">
              {titleEn}
            </span>
            <h3 className="font-display text-2xl font-semibold text-[#2D3436] group-hover:text-[#5A7A8A] transition-colors">
              {title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-[#636E72] leading-relaxed mb-8">
            {description}
          </p>

          {/* CTA */}
          <div className={`
            inline-flex items-center gap-2 text-sm font-semibold
            ${disabled ? 'text-[#B2BEC3]' : 'text-[#8BA4B4] group-hover:text-[#5A7A8A]'}
            transition-all duration-300
          `}>
            {disabled ? '준비 중' : '자세히 보기'}
            {!disabled && (
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Pretendard:wght@300;400;500;600;700&display=swap');

        .font-display {
          font-family: 'Playfair Display', serif;
        }

        .font-body {
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        @keyframes liquid {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: rotate(0deg) scale(1);
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: rotate(90deg) scale(1.1);
          }
          50% {
            border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%;
            transform: rotate(180deg) scale(0.95);
          }
          75% {
            border-radius: 60% 40% 60% 30% / 70% 30% 50% 60%;
            transform: rotate(270deg) scale(1.05);
          }
        }

        .animate-liquid {
          animation: liquid 20s ease-in-out infinite;
        }

        @keyframes dewdrop {
          0%, 100% {
            transform: scale(1) translateY(0);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.1) translateY(-5px);
            opacity: 1;
          }
        }

        .animate-dewdrop {
          animation: dewdrop 4s ease-in-out infinite;
        }

        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(2deg);
          }
        }

        .animate-float-gentle {
          animation: float-gentle 6s ease-in-out infinite;
        }

        @keyframes glow-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 30px rgba(139, 164, 180, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 60px rgba(139, 164, 180, 0.6));
          }
        }

        .animate-glow-pulse {
          animation: glow-pulse 4s ease-in-out infinite;
        }

        @keyframes reveal {
          from {
            opacity: 0;
            transform: translateY(60px);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        .animate-reveal {
          animation: reveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes shimmer-premium {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .animate-shimmer-premium {
          background: linear-gradient(
            120deg,
            transparent 30%,
            rgba(255,255,255,0.5) 50%,
            transparent 70%
          );
          background-size: 200% 100%;
          animation: shimmer-premium 3s infinite;
        }

        @keyframes aurora {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-aurora {
          background-size: 400% 400%;
          animation: aurora 15s ease infinite;
        }

        .text-gradient {
          background: linear-gradient(135deg, #7A9AAD 0%, #5A7A8A 50%, #8BA4B4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        /* Grain texture overlay */
        .grain::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
        }
      `}</style>

      <main className="font-body min-h-screen bg-[#FAFBFC] overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-6 py-20 grain">
          {/* Aurora gradient background */}
          <div
            className="absolute inset-0 animate-aurora"
            style={{
              background: 'linear-gradient(-45deg, #FAF8F5 0%, #F0F4F8 25%, #E8EEF2 50%, #F5F0EB 75%, #FAF8F5 100%)',
            }}
          />

          {/* Liquid blobs */}
          {mounted && (
            <>
              <LiquidBlob
                size={600}
                color="linear-gradient(135deg, rgba(139,164,180,0.3) 0%, rgba(168,197,212,0.2) 100%)"
                x={15}
                y={30}
                delay={0}
                duration={25}
              />
              <LiquidBlob
                size={400}
                color="linear-gradient(135deg, rgba(232,180,184,0.25) 0%, rgba(240,208,212,0.15) 100%)"
                x={80}
                y={20}
                delay={5}
                duration={20}
              />
              <LiquidBlob
                size={350}
                color="linear-gradient(135deg, rgba(212,196,168,0.2) 0%, rgba(232,220,200,0.1) 100%)"
                x={70}
                y={70}
                delay={10}
                duration={22}
              />
              <LiquidBlob
                size={250}
                color="linear-gradient(135deg, rgba(139,164,180,0.25) 0%, rgba(122,154,173,0.15) 100%)"
                x={25}
                y={75}
                delay={3}
                duration={18}
              />
            </>
          )}

          {/* Dewdrops */}
          {mounted && (
            <>
              <Dewdrop x={10} y={20} size={12} delay={0} />
              <Dewdrop x={85} y={15} size={8} delay={1} />
              <Dewdrop x={75} y={80} size={10} delay={2} />
              <Dewdrop x={20} y={85} size={6} delay={0.5} />
              <Dewdrop x={90} y={50} size={14} delay={1.5} />
              <Dewdrop x={5} y={60} size={9} delay={2.5} />
            </>
          )}

          {/* Content */}
          <div className="relative z-10 max-w-6xl mx-auto text-center">
            {/* Logo with parallax */}
            <div
              className={`mb-12 ${mounted ? 'animate-reveal' : 'opacity-0'}`}
              style={{
                transform: `translateY(${scrollY * 0.1}px)`,
              }}
            >
              <Image
                src="/logo.png"
                alt="K-Glow"
                width={320}
                height={115}
                className="mx-auto animate-glow-pulse animate-float-gentle"
                priority
                unoptimized
              />
            </div>

            {/* Main heading */}
            <div
              className={`mb-8 ${mounted ? 'animate-reveal' : 'opacity-0'}`}
              style={{ animationDelay: '0.2s' }}
            >
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold text-[#2D3436] leading-[1.1] tracking-tight">
                <span className="block">한국의</span>
                <span className="block text-gradient">빛나는 아름다움</span>
                <span className="block text-[#5A7A8A]">세계로</span>
              </h1>
            </div>

            {/* Subtitle */}
            <p
              className={`text-xl md:text-2xl text-[#636E72] max-w-3xl mx-auto mb-14 leading-relaxed font-light ${mounted ? 'animate-reveal' : 'opacity-0'}`}
              style={{ animationDelay: '0.4s' }}
            >
              K-Glow는 한국 프리미엄 화장품 브랜드의
              <br className="hidden md:block" />
              <span className="text-[#8BA4B4] font-medium">러시아·CIS 시장</span> 진출을 AI 기반으로 지원합니다
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-6 justify-center ${mounted ? 'animate-reveal' : 'opacity-0'}`}
              style={{ animationDelay: '0.6s' }}
            >
              <MagneticButton href="/analyze" variant="primary">
                <span>브랜드 분석 시작</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </MagneticButton>

              <MagneticButton href="/partners" variant="secondary">
                <span>파트너사 둘러보기</span>
              </MagneticButton>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs font-medium text-[#8BA4B4] tracking-[0.2em] uppercase">Scroll</span>
              <div className="w-6 h-12 border-2 border-[#8BA4B4]/40 rounded-full flex justify-center pt-2">
                <div className="w-1.5 h-3 bg-[#8BA4B4]/60 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="relative py-32 px-6">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAFBFC] via-white to-[#F8F9FA]" />

          <div className="relative max-w-7xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-20">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8BA4B4]/10 text-[#5A7A8A] text-sm font-semibold rounded-full mb-6 tracking-wide">
                <span className="w-2 h-2 bg-[#8BA4B4] rounded-full animate-pulse" />
                SERVICES
              </span>
              <h2 className="font-display text-4xl md:text-6xl font-semibold text-[#2D3436] mb-6">
                프리미엄 수출 서비스
              </h2>
              <p className="text-xl text-[#636E72] max-w-2xl mx-auto">
                러시아 시장 진출에 필요한 모든 것을
                <br />
                원스톱으로 제공합니다
              </p>
            </div>

            {/* Feature cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PremiumCard
                href="/partners"
                icon={
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                title="파트너사 네트워크"
                titleEn="Partners"
                description="K-Glow와 함께하는 검증된 한국 화장품 브랜드들을 만나보세요. 엄선된 파트너사들이 러시아 시장 진출을 기다리고 있습니다."
                gradient="bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4]"
                index={0}
              />

              <PremiumCard
                href="/calculator"
                icon={
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                }
                title="스마트 견적 계산"
                titleEn="Calculator"
                description="실시간 환율 반영, 관세 및 물류비 포함. 정확한 수출 견적을 즉시 확인하세요."
                gradient="bg-gradient-to-br from-[#7A9AAD] to-[#9BB4C4]"
                index={1}
              />

              <PremiumCard
                href="/analyze"
                icon={
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                title="AI 브랜드 분석"
                titleEn="AI Analysis"
                description="Claude AI 기반 웹사이트 분석으로 브랜드 정보를 자동 추출하고, 러시아어로 번역합니다."
                gradient="bg-gradient-to-br from-[#6B8A9A] to-[#8BA4B4]"
                index={2}
              />

              <PremiumCard
                href="/certification/new"
                icon={
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                }
                title="인증 대행 서비스"
                titleEn="Certification"
                description="EAC, GOST 등 러시아 화장품 인증 절차를 전문가가 대행합니다."
                gradient="bg-gradient-to-br from-[#9AA4B4] to-[#B4C4D4]"
                index={3}
                disabled
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative py-32 px-6 overflow-hidden">
          {/* Glass background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#8BA4B4]/5 via-[#E8B4B8]/5 to-[#D4C4A8]/5" />
          <div className="absolute inset-0 glass-effect" />

          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-display text-4xl md:text-6xl font-semibold text-[#2D3436] mb-4">
                왜 <span className="text-gradient">K-Glow</span>인가?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  value: 'AI',
                  label: '자동화',
                  description: 'Claude AI 기반 번역 및 분석으로 빠르고 정확한 현지화',
                  gradient: 'from-[#8BA4B4] to-[#6B8A9A]',
                },
                {
                  value: '실시간',
                  label: '환율',
                  description: 'KRW ↔ RUB 실시간 환율 반영으로 정확한 견적 산출',
                  gradient: 'from-[#C4A4A8] to-[#A48488]',
                },
                {
                  value: '원스톱',
                  label: '서비스',
                  description: '분석부터 인증까지 러시아 진출에 필요한 모든 서비스',
                  gradient: 'from-[#A4B4A8] to-[#849488]',
                },
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className={`
                    font-display text-5xl md:text-6xl font-bold mb-2
                    bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent
                    transition-transform duration-500 group-hover:scale-110
                  `}>
                    {stat.value}
                  </div>
                  <div className="text-2xl font-semibold text-[#2D3436] mb-4">
                    {stat.label}
                  </div>
                  <p className="text-[#636E72] max-w-xs mx-auto">
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-32 px-6">
          <div className="relative max-w-5xl mx-auto">
            <div className="relative overflow-hidden rounded-[3rem] p-16 md:p-20">
              {/* Animated gradient background */}
              <div
                className="absolute inset-0 animate-aurora"
                style={{
                  background: 'linear-gradient(-45deg, #7A9AAD, #8BA4B4, #9BB4C4, #A8C5D4, #8BA4B4)',
                }}
              />

              {/* Glass overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#E8B4B8]/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

              {/* Shimmer effect */}
              <div className="absolute inset-0 animate-shimmer-premium" />

              <div className="relative text-center text-white">
                <h2 className="font-display text-4xl md:text-6xl font-semibold mb-8">
                  지금 시작하세요
                </h2>
                <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                  브랜드 웹사이트 URL만 입력하면
                  <br />
                  AI가 자동으로 분석하고 러시아 시장 진출 전략을 제안합니다
                </p>
                <Link
                  href="/analyze"
                  className="inline-flex items-center justify-center gap-4 px-12 py-6 bg-white text-[#5A7A8A] font-bold text-lg rounded-full shadow-2xl hover:shadow-[0_30px_60px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-2 hover:scale-105"
                >
                  무료로 분석 시작하기
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-6 border-t border-[#E8E2D9]/50">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center gap-6">
              <Image
                src="/logo.png"
                alt="K-Glow"
                width={120}
                height={42}
                className="opacity-60 hover:opacity-100 transition-opacity"
                unoptimized
              />
              <p className="text-[#B2BEC3] text-sm text-center">
                © 2024 K-Glow. Premium K-Beauty Export Platform
              </p>
              <div className="flex gap-6 text-sm text-[#8BA4B4]">
                <Link href="/partners" className="hover:text-[#5A7A8A] transition-colors">파트너사</Link>
                <Link href="/calculator" className="hover:text-[#5A7A8A] transition-colors">견적 계산</Link>
                <Link href="/analyze" className="hover:text-[#5A7A8A] transition-colors">브랜드 분석</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

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
            group-hover:scale-110 
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
              K-Glow는 한국의 뷰티 브랜드의
              <br className="hidden md:block" />
              <span className="text-[#8BA4B4] font-medium">러시아 CIS 시장</span> 진출을 지원합니다.
            </p>
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

            {/* Feature card */}
            <div className="max-w-lg mx-auto">
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
                gradient="bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4]"
                index={0}
              />
            </div>
          </div>
        </section>

      </main>
    </>
  );
}

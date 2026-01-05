'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { value: '500+', label: '파트너 브랜드', labelEn: 'Partner Brands', icon: '🏢' },
    { value: '1,200+', label: '수출 상품', labelEn: 'Exported Products', icon: '📦' },
    { value: '98%', label: '고객 만족도', labelEn: 'Satisfaction', icon: '⭐' },
    { value: '5년+', label: '업력', labelEn: 'Experience', icon: '📅' },
  ];

  const values = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: '전문성',
      titleEn: 'Expertise',
      desc: '러시아 시장에 대한 깊은 이해와 인증 노하우를 바탕으로 최적의 솔루션을 제공합니다.',
      gradient: 'from-[#8BA4B4] to-[#6B8A9A]',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      title: '신뢰',
      titleEn: 'Trust',
      desc: '투명한 프로세스와 정직한 커뮤니케이션으로 파트너와의 신뢰를 쌓아갑니다.',
      gradient: 'from-[#A4B4A8] to-[#849488]',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: '혁신',
      titleEn: 'Innovation',
      desc: 'AI 기반 분석과 최신 기술을 활용하여 효율적인 수출 솔루션을 제공합니다.',
      gradient: 'from-[#E8B4B8] to-[#C8949A]',
    },
  ];

  const team = [
    { name: '김대표', role: 'CEO', desc: '러시아 시장 15년 경력의 전문가', gradient: 'from-[#8BA4B4] to-[#6B8A9A]' },
    { name: '박이사', role: 'COO', desc: '글로벌 물류 및 인증 전문가', gradient: 'from-[#A4B4A8] to-[#849488]' },
    { name: '이팀장', role: 'Sales Lead', desc: 'K-뷰티 마케팅 10년 경력', gradient: 'from-[#D4C4A8] to-[#B4A488]' },
  ];

  return (
    <main className="min-h-screen bg-gradient-luxury relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none bg-mesh" />

      {/* Decorative Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[700px] h-[700px] rounded-full opacity-30 blur-3xl animate-liquid"
          style={{ background: 'linear-gradient(135deg, rgba(139,164,180,0.4) 0%, rgba(168,197,212,0.2) 100%)', left: '-15%', top: '10%' }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-25 blur-3xl animate-liquid"
          style={{ background: 'linear-gradient(135deg, rgba(232,180,184,0.3) 0%, rgba(240,208,212,0.15) 100%)', right: '-10%', top: '40%', animationDelay: '5s' }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-3xl animate-liquid"
          style={{ background: 'linear-gradient(135deg, rgba(201,169,98,0.2) 0%, transparent 70%)', left: '30%', bottom: '10%', animationDelay: '10s' }}
        />
      </div>

      {/* Grain Overlay */}
      <div className="fixed inset-0 grain pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className={`${mounted ? 'animate-reveal' : 'opacity-0'}`}>
            <span className="badge-premium mb-8 inline-flex">
              <span className="w-2 h-2 bg-[#8BA4B4] rounded-full animate-pulse" />
              ABOUT US
            </span>
          </div>

          <h1 className={`font-display text-5xl md:text-7xl font-semibold text-[#2D3436] mb-8 ${mounted ? 'animate-reveal delay-100' : 'opacity-0'}`}>
            한국의 빛나는 아름다움을
            <br />
            <span className="text-gradient-luxury">세계로 전합니다</span>
          </h1>

          <p className={`text-xl text-[#636E72] max-w-3xl mx-auto leading-relaxed ${mounted ? 'animate-reveal delay-200' : 'opacity-0'}`}>
            K-Glow는 한국 프리미엄 화장품 브랜드의 러시아·CIS 시장 진출을
            <br className="hidden md:block" />
            AI 기반 기술과 전문 노하우로 지원하는 수출 플랫폼입니다.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Text */}
            <div className={`${mounted ? 'animate-reveal delay-300' : 'opacity-0'}`}>
              <span className="text-sm font-semibold text-[#8BA4B4] tracking-[0.2em] uppercase mb-4 block">
                OUR MISSION
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#2D3436] mb-8">
                우리의 <span className="text-gradient-luxury">미션</span>
              </h2>
              <div className="space-y-6 text-[#636E72] text-lg leading-relaxed">
                <p>
                  K-Glow는 한국 화장품 브랜드와 러시아 시장을 연결하는
                  <span className="text-[#5A7A8A] font-medium"> 가장 신뢰할 수 있는 다리</span> 역할을 합니다.
                </p>
                <p>
                  복잡한 수출 절차, 인증, 물류를 원스톱으로 해결하여
                  브랜드가 글로벌 시장에 쉽게 진출할 수 있도록 지원합니다.
                </p>
                <p>
                  EAC, GOST 등 러시아 필수 인증부터 현지 마케팅, 물류까지
                  수출에 필요한 모든 과정을 전문적으로 관리합니다.
                </p>
              </div>
            </div>

            {/* Right - Stats Card */}
            <div className={`${mounted ? 'animate-reveal delay-400' : 'opacity-0'}`}>
              <div className="card-luxury rounded-[2rem] p-10">
                <div className="grid grid-cols-2 gap-8">
                  {stats.map((stat, i) => (
                    <div key={i} className="text-center group">
                      <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-125">
                        {stat.icon}
                      </div>
                      <p className="font-display text-4xl font-bold text-gradient-luxury mb-2">
                        {stat.value}
                      </p>
                      <p className="font-medium text-[#2D3436]">{stat.label}</p>
                      <p className="text-xs text-[#9EA7AA] mt-1">{stat.labelEn}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#8BA4B4] tracking-[0.2em] uppercase mb-4 block">
              CORE VALUES
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#2D3436]">
              핵심 가치
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <div
                key={i}
                className={`card-luxury rounded-[2rem] p-8 text-center group ${mounted ? 'animate-reveal' : 'opacity-0'}`}
                style={{ animationDelay: `${(i + 5) * 100}ms` }}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${value.gradient} rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  {value.icon}
                </div>
                <span className="text-xs font-medium text-[#8BA4B4] tracking-[0.15em] uppercase">
                  {value.titleEn}
                </span>
                <h3 className="font-display text-2xl font-semibold text-[#2D3436] mt-2 mb-4 group-hover:text-[#5A7A8A] transition-colors">
                  {value.title}
                </h3>
                <p className="text-[#636E72] leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent" />

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#8BA4B4] tracking-[0.2em] uppercase mb-4 block">
              OUR TEAM
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#2D3436]">
              팀 소개
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div
                key={i}
                className={`card-luxury rounded-[2rem] p-8 text-center group ${mounted ? 'animate-reveal' : 'opacity-0'}`}
                style={{ animationDelay: `${(i + 8) * 100}ms` }}
              >
                <div className={`w-24 h-24 bg-gradient-to-br ${member.gradient} rounded-full flex items-center justify-center text-white text-3xl font-display font-bold mx-auto mb-6 shadow-xl transition-all duration-500 group-hover:scale-110`}>
                  {member.name[0]}
                </div>
                <h3 className="font-display text-xl font-semibold text-[#2D3436]">
                  {member.name}
                </h3>
                <p className="text-sm font-semibold text-[#8BA4B4] mb-3">{member.role}</p>
                <p className="text-[#636E72] text-sm">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className={`relative overflow-hidden rounded-[3rem] p-12 md:p-16 ${mounted ? 'animate-reveal delay-700' : 'opacity-0'}`}>
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
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#E8B4B8]/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            {/* Shimmer effect */}
            <div className="absolute inset-0 animate-shimmer" />

            <div className="relative text-center text-white">
              <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6">
                함께 성장하세요
              </h2>
              <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                K-Glow와 함께 러시아 시장 진출의 첫 걸음을 시작하세요.
                <br />
                전문가가 성공적인 진출을 도와드립니다.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-[#5A7A8A] font-bold text-lg rounded-full shadow-2xl hover:shadow-[0_30px_60px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-2 hover:scale-105"
              >
                문의하기
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

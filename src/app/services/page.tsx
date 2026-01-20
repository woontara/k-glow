'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function ServicesPage() {
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    setMounted(true);
  }, []);

  // 어드민이 아닌 경우 접근 제한
  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gradient-luxury flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8BA4B4]/30 border-t-[#8BA4B4] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#636E72]">로딩 중...</p>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-gradient-luxury flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-[#E8B4B8]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#E8B4B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V7a4 4 0 00-8 0v4m-4 6h16a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#2D3436] mb-4">접근 권한이 없습니다</h1>
          <p className="text-[#636E72] mb-8">이 페이지는 관리자만 접근할 수 있습니다.</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  const services = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: '인증 대행',
      titleEn: 'Certification',
      desc: 'EAC, GOST 등 러시아 필수 인증을 대행합니다. 서류 준비부터 인증 완료까지 원스톱 서비스를 제공합니다.',
      features: ['EAC 인증', 'GOST 인증', '서류 번역', '인증서 발급'],
      gradient: 'from-[#8BA4B4] to-[#6B8A9A]',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      title: '번역 서비스',
      titleEn: 'Translation',
      desc: 'AI 기반 번역과 전문 번역가의 검수를 통해 정확하고 자연스러운 러시아어 번역을 제공합니다.',
      features: ['상품 정보 번역', '마케팅 콘텐츠', '법률 문서', '웹사이트 현지화'],
      gradient: 'from-[#A4B4A8] to-[#849488]',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      title: '물류 지원',
      titleEn: 'Logistics',
      desc: '한국에서 러시아까지 안전하고 빠른 배송을 지원합니다. 통관, 창고, 배송까지 전 과정을 관리합니다.',
      features: ['해상/항공 운송', '통관 대행', '창고 관리', '라스트마일 배송'],
      gradient: 'from-[#D4C4A8] to-[#B4A488]',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      title: '시장 분석',
      titleEn: 'Market Analysis',
      desc: '러시아 화장품 시장 트렌드와 경쟁사 분석을 통해 최적의 진출 전략을 수립합니다.',
      features: ['시장 조사', '경쟁사 분석', '가격 전략', '타겟 고객 분석'],
      gradient: 'from-[#E8B4B8] to-[#C8949A]',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: '온라인 입점',
      titleEn: 'Online Marketplace',
      desc: 'Ozon, Wildberries 등 러시아 주요 온라인 마켓플레이스 입점을 지원합니다.',
      features: ['마켓 입점 대행', '상품 등록', '재고 관리', '주문 처리'],
      gradient: 'from-[#7A9AAD] to-[#5A7A8A]',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: '마케팅 지원',
      titleEn: 'Marketing',
      desc: '러시아 현지 SNS, 인플루언서 마케팅 등 효과적인 프로모션 전략을 실행합니다.',
      features: ['SNS 마케팅', '인플루언서 협업', '광고 캠페인', '브랜드 PR'],
      gradient: 'from-[#9BB4C4] to-[#7A9AAD]',
    },
  ];

  const process = [
    { step: '01', title: '상담', desc: '무료 상담을 통한 니즈 파악', icon: '💬' },
    { step: '02', title: '분석', desc: '시장 분석 및 전략 수립', icon: '📊' },
    { step: '03', title: '실행', desc: '인증, 번역, 물류 진행', icon: '🚀' },
    { step: '04', title: '완료', desc: '러시아 시장 진출 완료', icon: '🎉' },
  ];

  return (
    <main className="min-h-screen bg-gradient-luxury relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none bg-mesh" />

      {/* Decorative Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[700px] h-[700px] rounded-full opacity-30 blur-3xl animate-liquid"
          style={{ background: 'linear-gradient(135deg, rgba(139,164,180,0.4) 0%, rgba(168,197,212,0.2) 100%)', left: '-15%', top: '5%' }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-25 blur-3xl animate-liquid"
          style={{ background: 'linear-gradient(135deg, rgba(164,180,168,0.3) 0%, rgba(196,212,200,0.15) 100%)', right: '-10%', top: '50%', animationDelay: '5s' }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-3xl animate-liquid"
          style={{ background: 'linear-gradient(135deg, rgba(232,180,184,0.25) 0%, transparent 70%)', left: '40%', bottom: '5%', animationDelay: '10s' }}
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
              OUR SERVICES
            </span>
          </div>

          <h1 className={`font-display text-5xl md:text-7xl font-semibold text-[#2D3436] mb-8 ${mounted ? 'animate-reveal delay-100' : 'opacity-0'}`}>
            프리미엄
            <br />
            <span className="text-gradient-luxury">수출 서비스</span>
          </h1>

          <p className={`text-xl text-[#636E72] max-w-3xl mx-auto leading-relaxed ${mounted ? 'animate-reveal delay-200' : 'opacity-0'}`}>
            러시아 시장 진출에 필요한 모든 서비스를
            <br className="hidden md:block" />
            원스톱으로 제공합니다
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div
                key={i}
                className={`card-luxury rounded-[2rem] p-8 group ${mounted ? 'animate-reveal' : 'opacity-0'}`}
                style={{ animationDelay: `${(i + 3) * 100}ms` }}
              >
                {/* Icon */}
                <div className={`w-18 h-18 bg-gradient-to-br ${service.gradient} rounded-2xl p-4 flex items-center justify-center text-white mb-6 shadow-lg transition-all duration-500 group-hover:scale-110 `}>
                  {service.icon}
                </div>

                {/* Title */}
                <div className="mb-4">
                  <span className="text-xs font-medium text-[#8BA4B4] tracking-[0.15em] uppercase">
                    {service.titleEn}
                  </span>
                  <h3 className="font-display text-2xl font-semibold text-[#2D3436] mt-1 group-hover:text-[#5A7A8A] transition-colors">
                    {service.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-[#636E72] leading-relaxed mb-6">
                  {service.desc}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature, j) => (
                    <span
                      key={j}
                      className="px-3 py-1.5 bg-gradient-to-r from-[#8BA4B4]/10 to-[#A8C5D4]/10 text-[#5A7A8A] text-xs font-medium rounded-full border border-[#8BA4B4]/20"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-transparent" />

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#8BA4B4] tracking-[0.2em] uppercase mb-4 block">
              OUR PROCESS
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#2D3436]">
              진행 프로세스
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {process.map((item, i) => (
              <div
                key={i}
                className={`relative text-center ${mounted ? 'animate-reveal' : 'opacity-0'}`}
                style={{ animationDelay: `${(i + 9) * 100}ms` }}
              >
                {/* Connector Line */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-[#8BA4B4]/50 to-[#8BA4B4]/10" />
                )}

                {/* Step Circle */}
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#8BA4B4] to-[#6B8A9A] rounded-full flex items-center justify-center shadow-xl animate-pulse-glow">
                    <span className="text-4xl">{item.icon}</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#8BA4B4]">
                    <span className="text-xs font-bold text-[#8BA4B4]">{item.step}</span>
                  </div>
                </div>

                <h3 className="font-display text-xl font-semibold text-[#2D3436] mb-2">
                  {item.title}
                </h3>
                <p className="text-[#636E72] text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#8BA4B4] tracking-[0.2em] uppercase mb-4 block">
              WHY K-GLOW
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#2D3436]">
              K-Glow를 선택하는 이유
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: '15+', label: '년의 경험', desc: '러시아 시장 진출 경험' },
              { value: '500+', label: '성공 사례', desc: '성공적인 수출 실적' },
              { value: '99%', label: '인증 성공률', desc: 'EAC/GOST 인증 통과율' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`card-luxury rounded-[2rem] p-8 text-center group ${mounted ? 'animate-reveal' : 'opacity-0'}`}
                style={{ animationDelay: `${(i + 13) * 100}ms` }}
              >
                <div className="font-display text-6xl font-bold text-gradient-luxury mb-2 transition-transform duration-500 group-hover:scale-110">
                  {stat.value}
                </div>
                <div className="text-xl font-semibold text-[#2D3436] mb-2">
                  {stat.label}
                </div>
                <p className="text-[#636E72]">{stat.desc}</p>
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
                서비스가 필요하신가요?
              </h2>
              <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                무료 상담을 통해 귀사에 맞는
                <br />
                최적의 솔루션을 찾아드립니다
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-[#5A7A8A] font-bold text-lg rounded-full shadow-2xl hover:shadow-[0_30px_60px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-2 hover:scale-105"
                >
                  무료 상담 신청
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/calculator"
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/20 backdrop-blur text-white font-bold text-lg rounded-full border border-white/30 hover:bg-white/30 transition-all duration-500 hover:-translate-y-2"
                >
                  견적 계산하기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

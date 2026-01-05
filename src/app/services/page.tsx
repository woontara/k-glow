'use client';

import Link from 'next/link';

export default function ServicesPage() {
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
      gradient: 'from-[#8BA4B4] to-[#A8C5D4]',
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
      gradient: 'from-[#A4B4A8] to-[#C4D4C8]',
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
      gradient: 'from-[#D4C4A8] to-[#E8DCC8]',
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
      gradient: 'from-[#E8B4B8] to-[#F0D0D4]',
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
      gradient: 'from-[#8BA4B4] to-[#A8C5D4]',
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
      gradient: 'from-[#A4B4A8] to-[#C4D4C8]',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAFBFC] via-[#F5F7F9] to-[#FAF8F5] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute rounded-full opacity-40 blur-3xl" style={{ width: 600, height: 600, background: 'radial-gradient(circle, #A8C5D4 0%, transparent 70%)', left: '-10%', top: '15%' }} />
        <div className="absolute rounded-full opacity-40 blur-3xl" style={{ width: 500, height: 500, background: 'radial-gradient(circle, #A4B4A8 0%, transparent 70%)', right: '-5%', top: '60%' }} />
      </div>

      {/* Header */}
      <section className="relative pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8BA4B4]/10 to-[#A8C5D4]/10 rounded-full border border-[#8BA4B4]/20 mb-6">
            <span className="text-[#8BA4B4] font-medium text-sm tracking-wider uppercase">Our Services</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2D3436] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            서비스{' '}
            <span className="bg-gradient-to-r from-[#8BA4B4] via-[#A8C5D4] to-[#8BA4B4] bg-clip-text text-transparent">
              안내
            </span>
          </h1>
          <p className="text-lg text-[#636E72] max-w-2xl mx-auto">
            러시아 시장 진출에 필요한 모든 서비스를 원스톱으로 제공합니다
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="relative py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div
                key={i}
                className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-[#2D3436] mb-1">{service.title}</h3>
                <p className="text-sm text-[#8BA4B4] mb-4">{service.titleEn}</p>
                <p className="text-[#636E72] text-sm mb-6 leading-relaxed">{service.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature, j) => (
                    <span
                      key={j}
                      className="px-3 py-1 bg-[#8BA4B4]/10 text-[#5A7A8A] text-xs font-medium rounded-full"
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

      {/* Process */}
      <section className="relative py-16 px-6 bg-white/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#2D3436] text-center mb-12" style={{ fontFamily: 'Playfair Display, serif' }}>
            진행 프로세스
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: '상담', desc: '무료 상담을 통한 니즈 파악' },
              { step: '02', title: '분석', desc: '시장 분석 및 전략 수립' },
              { step: '03', title: '실행', desc: '인증, 번역, 물류 진행' },
              { step: '04', title: '완료', desc: '러시아 시장 진출 완료' },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-[#2D3436] mb-2">{item.title}</h3>
                <p className="text-sm text-[#636E72]">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#8BA4B4]/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              서비스가 필요하신가요?
            </h2>
            <p className="mb-8 opacity-90">
              무료 상담을 통해 최적의 솔루션을 찾아드립니다
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#8BA4B4] font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              무료 상담 신청
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
      `}</style>
    </main>
  );
}

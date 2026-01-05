'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  const stats = [
    { value: '500+', label: '파트너 브랜드', labelEn: 'Partner Brands' },
    { value: '1,200+', label: '수출 상품', labelEn: 'Exported Products' },
    { value: '98%', label: '고객 만족도', labelEn: 'Satisfaction' },
    { value: '5년+', label: '업력', labelEn: 'Experience' },
  ];

  const team = [
    { name: '김대표', role: 'CEO', desc: '러시아 시장 전문가' },
    { name: '박이사', role: 'COO', desc: '물류 및 인증 전문가' },
    { name: '이팀장', role: 'Sales Lead', desc: 'K-뷰티 마케팅 전문가' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAFBFC] via-[#F5F7F9] to-[#FAF8F5] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute rounded-full opacity-40 blur-3xl" style={{ width: 600, height: 600, background: 'radial-gradient(circle, #A8C5D4 0%, transparent 70%)', left: '-10%', top: '15%' }} />
        <div className="absolute rounded-full opacity-40 blur-3xl" style={{ width: 500, height: 500, background: 'radial-gradient(circle, #E8B4B8 0%, transparent 70%)', right: '-5%', top: '50%' }} />
      </div>

      {/* Header */}
      <section className="relative pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8BA4B4]/10 to-[#A8C5D4]/10 rounded-full border border-[#8BA4B4]/20 mb-6">
            <span className="text-[#8BA4B4] font-medium text-sm tracking-wider uppercase">About Us</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2D3436] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            K-Glow{' '}
            <span className="bg-gradient-to-r from-[#8BA4B4] via-[#A8C5D4] to-[#8BA4B4] bg-clip-text text-transparent">
              소개
            </span>
          </h1>
          <p className="text-lg text-[#636E72] max-w-2xl mx-auto">
            한국 화장품의 우수성을 러시아 시장에 전달하는 전문 수출 플랫폼입니다
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="relative py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#2D3436] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                우리의 미션
              </h2>
              <p className="text-[#636E72] mb-4 leading-relaxed">
                K-Glow는 한국 화장품 브랜드와 러시아 시장을 연결하는 다리 역할을 합니다.
                복잡한 수출 절차, 인증, 물류를 원스톱으로 해결하여 브랜드가 글로벌 시장에
                쉽게 진출할 수 있도록 지원합니다.
              </p>
              <p className="text-[#636E72] leading-relaxed">
                EAC, GOST 등 러시아 필수 인증부터 현지 마케팅, 물류까지
                수출에 필요한 모든 과정을 전문적으로 관리합니다.
              </p>
            </div>
            <div className="relative">
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-xl">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-3xl font-bold bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                      <p className="text-sm font-medium text-[#2D3436]">{stat.label}</p>
                      <p className="text-xs text-[#9EA7AA]">{stat.labelEn}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-16 px-6 bg-white/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#2D3436] text-center mb-12" style={{ fontFamily: 'Playfair Display, serif' }}>
            핵심 가치
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🎯', title: '전문성', desc: '러시아 시장에 대한 깊은 이해와 인증 노하우' },
              { icon: '🤝', title: '신뢰', desc: '투명한 프로세스와 정직한 커뮤니케이션' },
              { icon: '🚀', title: '혁신', desc: '최신 기술을 활용한 효율적인 수출 솔루션' },
            ].map((value, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg text-center hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-[#2D3436] mb-2">{value.title}</h3>
                <p className="text-[#636E72] text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="relative py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#2D3436] text-center mb-12" style={{ fontFamily: 'Playfair Display, serif' }}>
            팀 소개
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {member.name[0]}
                </div>
                <h3 className="text-lg font-bold text-[#2D3436]">{member.name}</h3>
                <p className="text-sm text-[#8BA4B4] font-medium mb-2">{member.role}</p>
                <p className="text-sm text-[#636E72]">{member.desc}</p>
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
              함께 성장하세요
            </h2>
            <p className="mb-8 opacity-90">
              K-Glow와 함께 러시아 시장 진출의 첫 걸음을 시작하세요
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#8BA4B4] font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              문의하기
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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Portfolio {
  id: string;
  // 브랜드 정보
  brand: string;
  brandLogoUrl: string | null;
  brandWebsite: string | null;
  category: string;
  // 프로젝트 정보
  title: string;
  marketplaces: string[];
  services: string[];
  projectYear: string | null;
  duration: string | null;
  // 성과 지표
  monthlySales: string | null;
  productCount: string | null;
  rating: string | null;
  achievement: string | null;
  // 스토리
  challenge: string | null;
  solution: string | null;
  results: string | null;
  // 표시 설정
  imageUrl: string;
  gradient: string;
}

interface Testimonial {
  id: string;
  name: string;
  company: string;
  content: string;
  gradient: string;
}

export default function PortfolioPage() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState('all');
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

  const categories = [
    { id: 'all', label: '전체', icon: '🎯' },
    { id: 'SKINCARE', label: '스킨케어', icon: '💧' },
    { id: 'MAKEUP', label: '메이크업', icon: '💄' },
    { id: 'HAIRCARE', label: '헤어케어', icon: '💇' },
    { id: 'BODYCARE', label: '바디케어', icon: '🧴' },
    { id: 'OTHER', label: '기타', icon: '✨' },
  ];

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [portfolioRes, testimonialRes] = await Promise.all([
        fetch('/api/portfolio'),
        fetch('/api/testimonial'),
      ]);

      if (portfolioRes.ok) {
        const data = await portfolioRes.json();
        setPortfolios(data.portfolios);
      }

      if (testimonialRes.ok) {
        const data = await testimonialRes.json();
        setTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    }
    setLoading(false);
  };

  const filteredProjects = filter === 'all'
    ? portfolios
    : portfolios.filter(p => p.category === filter);

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.label : category;
  };

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
          style={{ background: 'linear-gradient(135deg, rgba(212,196,168,0.3) 0%, rgba(232,220,200,0.15) 100%)', right: '-10%', top: '40%', animationDelay: '5s' }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-3xl animate-liquid"
          style={{ background: 'linear-gradient(135deg, rgba(232,180,184,0.25) 0%, transparent 70%)', left: '30%', bottom: '10%', animationDelay: '10s' }}
        />
      </div>

      {/* Grain Overlay */}
      <div className="fixed inset-0 grain pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className={`${mounted ? 'animate-reveal' : 'opacity-0'}`}>
            <span className="badge-premium mb-8 inline-flex">
              <span className="w-2 h-2 bg-[#8BA4B4] rounded-full animate-pulse" />
              PORTFOLIO
            </span>
          </div>

          <h1 className={`font-display text-5xl md:text-7xl font-semibold text-[#2D3436] mb-8 ${mounted ? 'animate-reveal delay-100' : 'opacity-0'}`}>
            성공 사례
            <br />
            <span className="text-gradient-luxury">& 포트폴리오</span>
          </h1>

          <p className={`text-xl text-[#636E72] max-w-3xl mx-auto leading-relaxed ${mounted ? 'animate-reveal delay-200' : 'opacity-0'}`}>
            K-Glow와 함께 러시아 시장에
            <br className="hidden md:block" />
            성공적으로 진출한 브랜드들의 이야기
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className={`relative px-6 mb-16 ${mounted ? 'animate-reveal delay-300' : 'opacity-0'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                  filter === cat.id
                    ? 'bg-gradient-to-r from-[#8BA4B4] to-[#6B8A9A] text-white shadow-lg shadow-[#8BA4B4]/30'
                    : 'bg-white/60 backdrop-blur text-[#636E72] hover:bg-white hover:shadow-md border border-white/40'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="relative pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-[#636E72]">로딩 중...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-[#636E72]">
              등록된 성공 사례가 없습니다
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className={`card-luxury rounded-[2rem] overflow-hidden group cursor-pointer ${mounted ? 'animate-reveal' : 'opacity-0'}`}
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                  onClick={() => setSelectedPortfolio(project)}
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Brand Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className={`px-4 py-2 bg-gradient-to-r ${project.gradient} text-white text-xs font-semibold rounded-full shadow-lg`}>
                        {project.brand}
                      </span>
                      <span className="px-3 py-1.5 bg-black/40 backdrop-blur text-white text-xs rounded-full">
                        {getCategoryLabel(project.category)}
                      </span>
                    </div>

                    {/* Project Year & Duration */}
                    {(project.projectYear || project.duration) && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        {project.projectYear && (
                          <span className="px-3 py-1 bg-white/90 backdrop-blur text-[#2D3436] text-xs font-medium rounded-full">
                            {project.projectYear}
                          </span>
                        )}
                        {project.duration && (
                          <span className="px-3 py-1 bg-white/90 backdrop-blur text-[#2D3436] text-xs font-medium rounded-full">
                            {project.duration}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2D3436]/90 to-[#2D3436]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <span className="px-6 py-3 bg-white text-[#2D3436] font-semibold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        자세히 보기
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-semibold text-[#2D3436] mb-3 group-hover:text-[#5A7A8A] transition-colors line-clamp-2">
                      {project.title}
                    </h3>

                    {/* Marketplaces */}
                    {project.marketplaces && project.marketplaces.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.marketplaces.map((m: string) => (
                          <span key={m} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Services */}
                    {project.services && project.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.services.slice(0, 3).map((s: string) => (
                          <span key={s} className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">
                            {s}
                          </span>
                        ))}
                        {project.services.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                            +{project.services.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    {(project.monthlySales || project.productCount || project.rating) && (
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E8EEF2]">
                        {project.monthlySales && (
                          <div className="text-center">
                            <p className="font-display text-xl font-bold text-gradient-luxury">{project.monthlySales}</p>
                            <p className="text-xs text-[#9EA7AA] mt-1">월매출</p>
                          </div>
                        )}
                        {project.productCount && (
                          <div className="text-center">
                            <p className="font-display text-xl font-bold text-gradient-luxury">{project.productCount}</p>
                            <p className="text-xs text-[#9EA7AA] mt-1">상품</p>
                          </div>
                        )}
                        {project.rating && (
                          <div className="text-center">
                            <p className="font-display text-xl font-bold text-gradient-luxury">{project.rating}</p>
                            <p className="text-xs text-[#9EA7AA] mt-1">평점</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Achievement */}
                    {project.achievement && (
                      <div className="mt-4 pt-4 border-t border-[#E8EEF2]">
                        <p className="text-sm text-[#5A7A8A] font-medium">{project.achievement}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-transparent" />

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#8BA4B4] tracking-[0.2em] uppercase mb-4 block">
              TESTIMONIALS
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#2D3436]">
              고객 후기
            </h2>
          </div>

          {testimonials.length === 0 ? (
            <div className="text-center py-12 text-[#636E72]">
              등록된 고객 후기가 없습니다
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, i) => (
                <div
                  key={testimonial.id}
                  className={`card-luxury rounded-[2rem] p-8 ${mounted ? 'animate-reveal' : 'opacity-0'}`}
                  style={{ animationDelay: `${(i + 10) * 100}ms` }}
                >
                  {/* Quote Icon */}
                  <div className="mb-6">
                    <svg className="w-10 h-10 text-[#8BA4B4]/30" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>

                  <p className="text-[#636E72] text-lg leading-relaxed mb-8">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>

                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center text-white text-xl font-display font-bold shadow-lg`}>
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D3436]">{testimonial.name}</p>
                      <p className="text-sm text-[#8BA4B4]">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                다음 성공 사례의
                <br />주인공이 되세요
              </h2>
              <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                귀사의 브랜드도 러시아 시장에서 성공할 수 있습니다.
                <br />
                지금 바로 상담을 시작하세요.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-[#5A7A8A] font-bold text-lg rounded-full shadow-2xl hover:shadow-[0_30px_60px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-2 hover:scale-105"
              >
                상담 신청하기
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Detail Modal */}
      {selectedPortfolio && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPortfolio(null)}
        >
          <div
            className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Image */}
            <div className="relative h-64 md:h-80">
              <Image
                src={selectedPortfolio.imageUrl}
                alt={selectedPortfolio.title}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* Close Button */}
              <button
                onClick={() => setSelectedPortfolio(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Brand Info */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-4 py-2 bg-gradient-to-r ${selectedPortfolio.gradient} text-white font-semibold rounded-full`}>
                    {selectedPortfolio.brand}
                  </span>
                  <span className="px-3 py-1.5 bg-white/20 backdrop-blur text-white text-sm rounded-full">
                    {getCategoryLabel(selectedPortfolio.category)}
                  </span>
                  {selectedPortfolio.projectYear && (
                    <span className="px-3 py-1.5 bg-white/20 backdrop-blur text-white text-sm rounded-full">
                      {selectedPortfolio.projectYear}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {selectedPortfolio.title}
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-10">
              {/* Stats Grid */}
              {(selectedPortfolio.monthlySales || selectedPortfolio.productCount || selectedPortfolio.rating || selectedPortfolio.duration) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  {selectedPortfolio.monthlySales && (
                    <div className="bg-gradient-to-br from-[#8BA4B4]/10 to-[#8BA4B4]/5 rounded-2xl p-4 text-center">
                      <p className="text-3xl font-bold text-[#5A7A8A]">{selectedPortfolio.monthlySales}</p>
                      <p className="text-sm text-[#636E72] mt-1">월 매출</p>
                    </div>
                  )}
                  {selectedPortfolio.productCount && (
                    <div className="bg-gradient-to-br from-[#8BA4B4]/10 to-[#8BA4B4]/5 rounded-2xl p-4 text-center">
                      <p className="text-3xl font-bold text-[#5A7A8A]">{selectedPortfolio.productCount}</p>
                      <p className="text-sm text-[#636E72] mt-1">입점 상품</p>
                    </div>
                  )}
                  {selectedPortfolio.rating && (
                    <div className="bg-gradient-to-br from-[#8BA4B4]/10 to-[#8BA4B4]/5 rounded-2xl p-4 text-center">
                      <p className="text-3xl font-bold text-[#5A7A8A]">{selectedPortfolio.rating}</p>
                      <p className="text-sm text-[#636E72] mt-1">마켓 평점</p>
                    </div>
                  )}
                  {selectedPortfolio.duration && (
                    <div className="bg-gradient-to-br from-[#8BA4B4]/10 to-[#8BA4B4]/5 rounded-2xl p-4 text-center">
                      <p className="text-3xl font-bold text-[#5A7A8A]">{selectedPortfolio.duration}</p>
                      <p className="text-sm text-[#636E72] mt-1">소요 기간</p>
                    </div>
                  )}
                </div>
              )}

              {/* Achievement */}
              {selectedPortfolio.achievement && (
                <div className="mb-10 p-6 bg-gradient-to-r from-[#E8B4B8]/20 to-[#D4C4A8]/20 rounded-2xl">
                  <p className="text-lg font-semibold text-[#2D3436]">{selectedPortfolio.achievement}</p>
                </div>
              )}

              {/* Marketplaces & Services */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                {selectedPortfolio.marketplaces && selectedPortfolio.marketplaces.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#636E72] uppercase tracking-wider mb-3">입점 마켓플레이스</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPortfolio.marketplaces.map((m: string) => (
                        <span key={m} className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-full">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedPortfolio.services && selectedPortfolio.services.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#636E72] uppercase tracking-wider mb-3">제공 서비스</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPortfolio.services.map((s: string) => (
                        <span key={s} className="px-4 py-2 bg-green-50 text-green-700 font-medium rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Story Section */}
              {(selectedPortfolio.challenge || selectedPortfolio.solution || selectedPortfolio.results) && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#2D3436] border-b border-[#E8EEF2] pb-2">성공 스토리</h3>

                  {selectedPortfolio.challenge && (
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500 font-bold">1</div>
                      <div>
                        <h4 className="font-semibold text-[#2D3436] mb-2">도전 과제</h4>
                        <p className="text-[#636E72] leading-relaxed">{selectedPortfolio.challenge}</p>
                      </div>
                    </div>
                  )}

                  {selectedPortfolio.solution && (
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-bold">2</div>
                      <div>
                        <h4 className="font-semibold text-[#2D3436] mb-2">K-Glow 솔루션</h4>
                        <p className="text-[#636E72] leading-relaxed">{selectedPortfolio.solution}</p>
                      </div>
                    </div>
                  )}

                  {selectedPortfolio.results && (
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-500 font-bold">3</div>
                      <div>
                        <h4 className="font-semibold text-[#2D3436] mb-2">결과</h4>
                        <p className="text-[#636E72] leading-relaxed">{selectedPortfolio.results}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Brand Website Link */}
              {selectedPortfolio.brandWebsite && (
                <div className="mt-10 pt-6 border-t border-[#E8EEF2]">
                  <a
                    href={selectedPortfolio.brandWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#5A7A8A] hover:text-[#4A6A7A] font-medium"
                  >
                    브랜드 웹사이트 방문
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {/* CTA */}
              <div className="mt-10 text-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#8BA4B4] to-[#6B8A9A] text-white font-semibold rounded-full hover:shadow-lg hover:shadow-[#8BA4B4]/30 transition-all duration-300"
                >
                  나도 성공하고 싶다면?
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

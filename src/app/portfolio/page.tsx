'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PortfolioPage() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = [
    { id: 'all', label: '전체', icon: '🎯' },
    { id: 'skincare', label: '스킨케어', icon: '💧' },
    { id: 'makeup', label: '메이크업', icon: '💄' },
    { id: 'haircare', label: '헤어케어', icon: '💇' },
  ];

  const projects = [
    {
      id: 1,
      category: 'skincare',
      brand: '클린코스메틱',
      title: 'Ozon 마켓 입점 성공',
      desc: '비건 스킨케어 라인 러시아 론칭. 입점 3개월 만에 월 매출 5억 달성.',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=400&fit=crop',
      stats: { sales: '5억+', products: '12종', rating: '4.8' },
      gradient: 'from-[#8BA4B4] to-[#6B8A9A]',
    },
    {
      id: 2,
      category: 'makeup',
      brand: '뷰티브랜드',
      title: 'Wildberries 베스트셀러',
      desc: '쿠션 파운데이션 러시아 전역 판매. 뷰티 카테고리 TOP 10 진입.',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop',
      stats: { sales: '3억+', products: '8종', rating: '4.9' },
      gradient: 'from-[#E8B4B8] to-[#C8949A]',
    },
    {
      id: 3,
      category: 'skincare',
      brand: '럭셔리스킨',
      title: '프리미엄 안티에이징 라인',
      desc: '고급 백화점 입점 및 VIP 고객 대상 마케팅 성공.',
      image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=600&h=400&fit=crop',
      stats: { sales: '8억+', products: '6종', rating: '4.7' },
      gradient: 'from-[#D4C4A8] to-[#B4A488]',
    },
    {
      id: 4,
      category: 'haircare',
      brand: '실크헤어',
      title: '헤어케어 시장 진출',
      desc: '탈모 방지 샴푸 러시아 시장 론칭. 의약외품 인증 완료.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop',
      stats: { sales: '2억+', products: '4종', rating: '4.6' },
      gradient: 'from-[#A4B4A8] to-[#849488]',
    },
    {
      id: 5,
      category: 'makeup',
      brand: '컬러팝',
      title: '립스틱 컬렉션 히트',
      desc: '한국 트렌드 컬러 립스틱 러시아 인플루언서 마케팅 대성공.',
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=400&fit=crop',
      stats: { sales: '4억+', products: '20종', rating: '4.8' },
      gradient: 'from-[#9BB4C4] to-[#7A9AAD]',
    },
    {
      id: 6,
      category: 'skincare',
      brand: '아쿠아뷰티',
      title: '수분 크림 베스트셀러',
      desc: '건조한 러시아 기후에 맞춘 고보습 라인 현지화 성공.',
      image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=400&fit=crop',
      stats: { sales: '6억+', products: '5종', rating: '4.9' },
      gradient: 'from-[#7A9AAD] to-[#5A7A8A]',
    },
  ];

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => p.category === filter);

  const testimonials = [
    {
      name: '김대표',
      company: '클린코스메틱',
      text: 'K-Glow 덕분에 복잡한 러시아 인증을 쉽게 해결했습니다. 전문적인 서포트에 감사드립니다.',
      gradient: 'from-[#8BA4B4] to-[#6B8A9A]',
    },
    {
      name: '박이사',
      company: '뷰티브랜드',
      text: '현지 마케팅까지 원스톱으로 지원받아서 빠르게 시장에 안착할 수 있었습니다.',
      gradient: 'from-[#A4B4A8] to-[#849488]',
    },
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className={`card-luxury rounded-[2rem] overflow-hidden group ${mounted ? 'animate-reveal' : 'opacity-0'}`}
                style={{ animationDelay: `${(index + 4) * 100}ms` }}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Brand Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-2 bg-gradient-to-r ${project.gradient} text-white text-xs font-semibold rounded-full shadow-lg`}>
                      {project.brand}
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2D3436]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <div className="text-white">
                      <p className="text-sm opacity-80">{project.category === 'skincare' ? '스킨케어' : project.category === 'makeup' ? '메이크업' : '헤어케어'}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold text-[#2D3436] mb-2 group-hover:text-[#5A7A8A] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-[#636E72] text-sm mb-6 leading-relaxed">
                    {project.desc}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E8EEF2]">
                    <div className="text-center">
                      <p className="font-display text-xl font-bold text-gradient-luxury">{project.stats.sales}</p>
                      <p className="text-xs text-[#9EA7AA] mt-1">매출</p>
                    </div>
                    <div className="text-center">
                      <p className="font-display text-xl font-bold text-gradient-luxury">{project.stats.products}</p>
                      <p className="text-xs text-[#9EA7AA] mt-1">상품</p>
                    </div>
                    <div className="text-center">
                      <p className="font-display text-xl font-bold text-gradient-luxury">{project.stats.rating}</p>
                      <p className="text-xs text-[#9EA7AA] mt-1">평점</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
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
                  &ldquo;{testimonial.text}&rdquo;
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
    </main>
  );
}

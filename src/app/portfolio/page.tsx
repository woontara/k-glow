'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PortfolioPage() {
  const [filter, setFilter] = useState('all');

  const categories = [
    { id: 'all', label: '전체' },
    { id: 'skincare', label: '스킨케어' },
    { id: 'makeup', label: '메이크업' },
    { id: 'haircare', label: '헤어케어' },
  ];

  const projects = [
    {
      id: 1,
      category: 'skincare',
      brand: '클린코스메틱',
      title: 'Ozon 마켓 입점 성공',
      desc: '비건 스킨케어 라인 러시아 론칭. 입점 3개월 만에 월 매출 5억 달성.',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop',
      stats: { sales: '5억+', products: '12종', rating: '4.8' },
    },
    {
      id: 2,
      category: 'makeup',
      brand: '뷰티브랜드',
      title: 'Wildberries 베스트셀러',
      desc: '쿠션 파운데이션 러시아 전역 판매. 뷰티 카테고리 TOP 10 진입.',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
      stats: { sales: '3억+', products: '8종', rating: '4.9' },
    },
    {
      id: 3,
      category: 'skincare',
      brand: '럭셔리스킨',
      title: '프리미엄 안티에이징 라인',
      desc: '고급 백화점 입점 및 VIP 고객 대상 마케팅 성공.',
      image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400&h=300&fit=crop',
      stats: { sales: '8억+', products: '6종', rating: '4.7' },
    },
    {
      id: 4,
      category: 'haircare',
      brand: '실크헤어',
      title: '헤어케어 시장 진출',
      desc: '탈모 방지 샴푸 러시아 시장 론칭. 의약외품 인증 완료.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop',
      stats: { sales: '2억+', products: '4종', rating: '4.6' },
    },
    {
      id: 5,
      category: 'makeup',
      brand: '컬러팝',
      title: '립스틱 컬렉션 히트',
      desc: '한국 트렌드 컬러 립스틱 러시아 인플루언서 마케팅 대성공.',
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=300&fit=crop',
      stats: { sales: '4억+', products: '20종', rating: '4.8' },
    },
    {
      id: 6,
      category: 'skincare',
      brand: '아쿠아뷰티',
      title: '수분 크림 베스트셀러',
      desc: '건조한 러시아 기후에 맞춘 고보습 라인 현지화 성공.',
      image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=300&fit=crop',
      stats: { sales: '6억+', products: '5종', rating: '4.9' },
    },
  ];

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => p.category === filter);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAFBFC] via-[#F5F7F9] to-[#FAF8F5] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute rounded-full opacity-40 blur-3xl" style={{ width: 600, height: 600, background: 'radial-gradient(circle, #A8C5D4 0%, transparent 70%)', left: '-10%', top: '15%' }} />
        <div className="absolute rounded-full opacity-40 blur-3xl" style={{ width: 500, height: 500, background: 'radial-gradient(circle, #D4C4A8 0%, transparent 70%)', right: '-5%', top: '50%' }} />
      </div>

      {/* Header */}
      <section className="relative pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8BA4B4]/10 to-[#A8C5D4]/10 rounded-full border border-[#8BA4B4]/20 mb-6">
            <span className="text-[#8BA4B4] font-medium text-sm tracking-wider uppercase">Portfolio</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2D3436] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            포트폴리오{' '}
            <span className="bg-gradient-to-r from-[#8BA4B4] via-[#A8C5D4] to-[#8BA4B4] bg-clip-text text-transparent">
              & 성공 사례
            </span>
          </h1>
          <p className="text-lg text-[#636E72] max-w-2xl mx-auto">
            K-Glow와 함께 러시아 시장에 성공적으로 진출한 브랜드들의 이야기
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="relative px-6 mb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                  filter === cat.id
                    ? 'bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white shadow-lg'
                    : 'bg-white/60 text-[#636E72] hover:bg-[#8BA4B4]/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="relative pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/40 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 text-[#8BA4B4] text-xs font-semibold rounded-full">
                    {project.brand}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#2D3436] mb-2">{project.title}</h3>
                  <p className="text-sm text-[#636E72] mb-4 leading-relaxed">{project.desc}</p>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E8E2D9]">
                    <div className="text-center">
                      <p className="text-lg font-bold text-[#8BA4B4]">{project.stats.sales}</p>
                      <p className="text-xs text-[#9EA7AA]">매출</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-[#8BA4B4]">{project.stats.products}</p>
                      <p className="text-xs text-[#9EA7AA]">상품</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-[#8BA4B4]">{project.stats.rating}</p>
                      <p className="text-xs text-[#9EA7AA]">평점</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-16 px-6 bg-white/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#2D3436] text-center mb-12" style={{ fontFamily: 'Playfair Display, serif' }}>
            고객 후기
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { name: '김대표', company: '클린코스메틱', text: 'K-Glow 덕분에 복잡한 러시아 인증을 쉽게 해결했습니다. 전문적인 서포트에 감사드립니다.' },
              { name: '박이사', company: '뷰티브랜드', text: '현지 마케팅까지 원스톱으로 지원받아서 빠르게 시장에 안착할 수 있었습니다.' },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-[#2D3436]">{testimonial.name}</p>
                    <p className="text-sm text-[#8BA4B4]">{testimonial.company}</p>
                  </div>
                </div>
                <p className="text-[#636E72] leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
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
              다음 성공 사례의 주인공이 되세요
            </h2>
            <p className="mb-8 opacity-90">
              귀사의 브랜드도 러시아 시장에서 성공할 수 있습니다
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#8BA4B4] font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              상담 신청하기
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

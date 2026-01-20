'use client';

import { useEffect, useState, useRef, useCallback, memo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Partner {
  id: string;
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  logoUrl?: string;
  marketScore: number;
  productCount: number;
  websiteUrl: string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'from-[#A4B4A8] to-[#849488]';
  if (score >= 60) return 'from-[#8BA4B4] to-[#6B8A9A]';
  if (score >= 40) return 'from-[#D4C4A8] to-[#B4A488]';
  return 'from-[#C4A4A8] to-[#A48488]';
};

const PremiumPartnerCard = memo(function PremiumPartnerCard({ partner, index }: { partner: Partner; index: number }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  return (
    <Link href={`/partners/${partner.id}`} className="group">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="relative h-full p-6 rounded-[2rem] bg-white/60 backdrop-blur-2xl border border-white/40 transition-all duration-700 ease-out overflow-hidden hover:bg-white/80 hover:border-white/60 hover:shadow-[0_32px_64px_rgba(139,164,180,0.2)] hover:-translate-y-3"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Spotlight effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139,164,180,0.15) 0%, transparent 50%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7A9AAD] to-[#9BB4C4] flex items-center justify-center text-white text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-500">
                {partner.name[0]}
              </div>
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="font-semibold text-[#2D3436] text-lg truncate group-hover:text-[#5A7A8A] transition-colors">
                {partner.name}
              </h3>
              <p className="text-sm text-[#8BA4B4] truncate font-medium">{partner.nameRu}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-[#636E72] text-sm mb-6 line-clamp-2 leading-relaxed">
            {partner.description || '브랜드 설명이 없습니다'}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between pt-5 border-t border-[#E8E2D9]/50">
            <div className="flex items-center gap-4">
              {/* Market Score */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${getScoreColor(partner.marketScore)} flex items-center justify-center`}>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-[#2D3436]">{partner.marketScore}</span>
              </div>

              {/* Product Count */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#8BA4B4]/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-sm text-[#636E72]">{partner.productCount}개</span>
              </div>
            </div>

            {/* Arrow */}
            <div className="w-10 h-10 rounded-full bg-[#8BA4B4]/10 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-[#8BA4B4] group-hover:to-[#A8C5D4] transition-all duration-300">
              <svg className="w-5 h-5 text-[#8BA4B4] group-hover:text-white group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    setMounted(true);
    loadPartners();
  }, []);

  const loadPartners = async (searchQuery = '') => {
    setLoading(true);
    try {
      const url = searchQuery
        ? `/api/partners?search=${encodeURIComponent(searchQuery)}`
        : '/api/partners';

      const response = await fetch(url);
      const data = await response.json();
      setPartners(data.partners || []);
    } catch (error) {
      console.error('파트너사 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPartners(search);
  };

  const stats = partners.length > 0 ? {
    total: partners.length,
    avgScore: Math.round(partners.reduce((sum, p) => sum + p.marketScore, 0) / partners.length),
    totalProducts: partners.reduce((sum, p) => sum + p.productCount, 0),
  } : null;

  // 어드민이 아닌 경우 접근 제한
  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8BA4B4]/30 border-t-[#8BA4B4] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#636E72]">로딩 중...</p>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
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

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');

        .font-display {
          font-family: 'Playfair Display', serif;
        }

        @keyframes reveal {
          from {
            opacity: 0;
            transform: translateY(40px);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        .animate-reveal {
          animation: reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <main className="min-h-screen bg-[#FAFBFC]">
        {/* Hero Section */}
        <section className="relative pt-12 pb-16 px-6 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FAF8F5] via-[#F0F4F8] to-[#E8EEF2]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#8BA4B4]/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-[#E8B4B8]/15 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative max-w-7xl mx-auto">
            {/* Header */}
            <div className={`text-center mb-12 ${mounted ? 'animate-reveal' : 'opacity-0'}`}>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8BA4B4]/10 text-[#5A7A8A] text-sm font-semibold rounded-full mb-6 tracking-wide">
                <span className="w-2 h-2 bg-[#8BA4B4] rounded-full animate-pulse" />
                PARTNERS
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-semibold text-[#2D3436] mb-4">
                파트너사 네트워크
              </h1>
              <p className="text-xl text-[#636E72] max-w-2xl mx-auto">
                K-Glow와 함께하는 검증된 한국 화장품 브랜드들을 만나보세요
              </p>
            </div>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className={`max-w-2xl mx-auto mb-12 ${mounted ? 'animate-reveal' : 'opacity-0'}`}
              style={{ animationDelay: '0.1s' }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#8BA4B4]/20 to-[#A8C5D4]/20 rounded-2xl blur-xl" />
                <div className="relative flex gap-3 p-2 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_8px_32px_rgba(139,164,180,0.15)]">
                  <div className="flex-1 relative">
                    <svg
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8BA4B4]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="브랜드명으로 검색..."
                      className="w-full pl-12 pr-4 py-4 bg-transparent text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-[#7A9AAD] via-[#8BA4B4] to-[#9BB4C4] text-white font-semibold rounded-xl shadow-lg shadow-[#8BA4B4]/30 hover:shadow-xl hover:shadow-[#8BA4B4]/40 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    검색
                  </button>
                </div>
              </div>
            </form>

            {/* Stats */}
            {!loading && stats && (
              <div
                className={`grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-12 ${mounted ? 'animate-reveal' : 'opacity-0'}`}
                style={{ animationDelay: '0.2s' }}
              >
                {[
                  { label: '총 파트너사', value: stats.total, suffix: '개', gradient: 'from-[#8BA4B4] to-[#6B8A9A]' },
                  { label: '평균 시장 점수', value: stats.avgScore, suffix: '점', gradient: 'from-[#A4B4A8] to-[#849488]' },
                  { label: '총 제품 수', value: stats.totalProducts, suffix: '개', gradient: 'from-[#C4A4A8] to-[#A48488]' },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="text-center p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40"
                  >
                    <div className={`font-display text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1`}>
                      {stat.value}{stat.suffix}
                    </div>
                    <div className="text-sm text-[#636E72]">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Partners Grid */}
        <section className="px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-[#8BA4B4]/30 border-t-[#8BA4B4] rounded-full animate-spin mb-4" />
                <p className="text-[#636E72]">파트너사 목록을 불러오는 중...</p>
              </div>
            )}

            {/* Partner Cards */}
            {!loading && partners.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {partners.map((partner, index) => (
                  <PremiumPartnerCard key={partner.id} partner={partner} index={index} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && partners.length === 0 && (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-[#8BA4B4]/10 flex items-center justify-center">
                  <svg className="w-12 h-12 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-display text-2xl font-semibold text-[#2D3436] mb-3">
                  등록된 파트너사가 없습니다
                </h3>
                <p className="text-[#636E72] mb-8 max-w-md mx-auto">
                  브랜드 분석 페이지에서 새로운 파트너사를 등록하세요
                </p>
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#7A9AAD] via-[#8BA4B4] to-[#9BB4C4] text-white font-semibold rounded-full shadow-lg shadow-[#8BA4B4]/30 hover:shadow-xl hover:shadow-[#8BA4B4]/40 transition-all duration-300 hover:-translate-y-1"
                >
                  브랜드 분석하러 가기
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

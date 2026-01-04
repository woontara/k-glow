'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageWrapper, { Card, StatsBar, Button, Input, Spinner, EmptyState } from '@/components/ui/PageWrapper';

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

function PartnerCardNew({ partner }: { partner: Partner }) {
  return (
    <Link href={`/partners/${partner.id}`}>
      <Card className="h-full group cursor-pointer">
        {/* Logo / Initial */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[#8BA4B4]/20 group-hover:scale-105 transition-transform">
            {partner.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#2D3436] text-lg truncate group-hover:text-[#5A7A8A] transition-colors">
              {partner.name}
            </h3>
            <p className="text-sm text-[#8BA4B4] truncate">{partner.nameRu}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-[#636E72] text-sm mb-4 line-clamp-2">
          {partner.description || '브랜드 설명이 없습니다'}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-4 border-t border-[#E8E2D9]">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#E8B4B8]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-[#2D3436]">{partner.marketScore}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-sm text-[#636E72]">{partner.productCount}개 제품</span>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </Card>
    </Link>
  );
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
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

  const stats = partners.length > 0 ? [
    { label: '총 파트너사', value: `${partners.length}개` },
    { label: '평균 시장 점수', value: `${Math.round(partners.reduce((sum, p) => sum + p.marketScore, 0) / partners.length)}점` },
    { label: '총 제품 수', value: `${partners.reduce((sum, p) => sum + p.productCount, 0)}개` },
  ] : [];

  return (
    <PageWrapper
      title="파트너사"
      subtitle="K-Glow와 함께하는 한국 화장품 브랜드를 만나보세요"
      badge="Partners"
    >
      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B2BEC3]"
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
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/80 border border-[#8BA4B4]/20 text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
            />
          </div>
          <Button type="submit">
            검색
          </Button>
        </div>
      </form>

      {/* Stats */}
      {!loading && partners.length > 0 && (
        <div className="mb-8">
          <StatsBar stats={stats} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="mt-4 text-[#636E72]">파트너사 목록을 불러오는 중...</p>
        </div>
      )}

      {/* Partner Cards */}
      {!loading && partners.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <PartnerCardNew key={partner.id} partner={partner} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && partners.length === 0 && (
        <EmptyState
          icon={
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          title="등록된 파트너사가 없습니다"
          description="브랜드 분석 페이지에서 새로운 파트너사를 등록하세요"
          action={
            <Link href="/analyze">
              <Button>브랜드 분석하러 가기</Button>
            </Link>
          }
        />
      )}
    </PageWrapper>
  );
}

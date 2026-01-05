'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForumPage() {
  const [activeTab, setActiveTab] = useState('all');

  const categories = [
    { id: 'all', label: '전체', count: 156 },
    { id: 'notice', label: '공지사항', count: 12 },
    { id: 'news', label: '시장 뉴스', count: 45 },
    { id: 'tips', label: '수출 팁', count: 38 },
    { id: 'qna', label: 'Q&A', count: 61 },
  ];

  const posts = [
    {
      id: 1,
      category: 'notice',
      categoryLabel: '공지사항',
      title: '2024년 러시아 화장품 인증 규정 변경 안내',
      excerpt: 'EAC 인증 관련 새로운 규정이 시행됩니다. 기존 인증 보유 기업은 갱신 절차를 확인해주세요.',
      author: 'K-Glow 관리자',
      date: '2024-01-15',
      views: 1245,
      comments: 23,
      isPinned: true,
    },
    {
      id: 2,
      category: 'news',
      categoryLabel: '시장 뉴스',
      title: '러시아 K-뷰티 시장 성장률 25% 달성',
      excerpt: '2023년 러시아 K-뷰티 시장이 전년 대비 25% 성장했습니다. 특히 스킨케어 제품의 수요가 급증했습니다.',
      author: '김분석',
      date: '2024-01-14',
      views: 892,
      comments: 15,
      isPinned: false,
    },
    {
      id: 3,
      category: 'tips',
      categoryLabel: '수출 팁',
      title: 'Wildberries 입점 성공 가이드 (2024년 업데이트)',
      excerpt: 'Wildberries 입점을 준비하시는 분들을 위한 상세 가이드입니다. 필수 서류부터 최적화 팁까지.',
      author: '박마케터',
      date: '2024-01-13',
      views: 756,
      comments: 42,
      isPinned: false,
    },
    {
      id: 4,
      category: 'qna',
      categoryLabel: 'Q&A',
      title: 'EAC 인증 소요 기간 문의드립니다',
      excerpt: '신규 스킨케어 제품 5종 EAC 인증을 진행하려고 합니다. 평균 소요 기간이 어느 정도인가요?',
      author: '뷰티브랜드A',
      date: '2024-01-12',
      views: 234,
      comments: 8,
      isPinned: false,
    },
    {
      id: 5,
      category: 'news',
      categoryLabel: '시장 뉴스',
      title: 'Ozon 뷰티 카테고리 수수료 인하 발표',
      excerpt: 'Ozon이 뷰티 카테고리 판매 수수료를 15%에서 12%로 인하했습니다. K-뷰티 브랜드에 호재로 작용할 전망입니다.',
      author: '이뉴스',
      date: '2024-01-11',
      views: 567,
      comments: 19,
      isPinned: false,
    },
    {
      id: 6,
      category: 'tips',
      categoryLabel: '수출 팁',
      title: '러시아 소비자가 선호하는 화장품 패키지 디자인',
      excerpt: '러시아 현지 소비자 조사 결과를 바탕으로 선호하는 패키지 디자인 트렌드를 정리했습니다.',
      author: '디자인팀',
      date: '2024-01-10',
      views: 445,
      comments: 27,
      isPinned: false,
    },
  ];

  const filteredPosts = activeTab === 'all'
    ? posts
    : posts.filter(p => p.category === activeTab);

  const pinnedPosts = filteredPosts.filter(p => p.isPinned);
  const regularPosts = filteredPosts.filter(p => !p.isPinned);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAFBFC] via-[#F5F7F9] to-[#FAF8F5] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute rounded-full opacity-40 blur-3xl" style={{ width: 600, height: 600, background: 'radial-gradient(circle, #A8C5D4 0%, transparent 70%)', left: '-10%', top: '15%' }} />
        <div className="absolute rounded-full opacity-40 blur-3xl" style={{ width: 500, height: 500, background: 'radial-gradient(circle, #A4B4A8 0%, transparent 70%)', right: '-5%', top: '50%' }} />
      </div>

      {/* Header */}
      <section className="relative pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8BA4B4]/10 to-[#A8C5D4]/10 rounded-full border border-[#8BA4B4]/20 mb-6">
            <span className="text-[#8BA4B4] font-medium text-sm tracking-wider uppercase">Community</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2D3436] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            포럼{' '}
            <span className="bg-gradient-to-r from-[#8BA4B4] via-[#A8C5D4] to-[#8BA4B4] bg-clip-text text-transparent">
              & 커뮤니티
            </span>
          </h1>
          <p className="text-lg text-[#636E72] max-w-2xl mx-auto">
            러시아 수출에 관한 정보를 공유하고 소통하는 공간입니다
          </p>
        </div>
      </section>

      {/* Search & Write */}
      <section className="relative px-6 mb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="검색어를 입력하세요..."
                className="w-full px-4 py-3 pl-12 bg-white/60 backdrop-blur-xl rounded-xl border border-white/40 focus:outline-none focus:ring-2 focus:ring-[#8BA4B4]/50"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9EA7AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              글쓰기
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative px-6 mb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                  activeTab === cat.id
                    ? 'bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white shadow-lg'
                    : 'bg-white/60 text-[#636E72] hover:bg-[#8BA4B4]/10'
                }`}
              >
                {cat.label}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === cat.id ? 'bg-white/20' : 'bg-[#8BA4B4]/10'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="relative pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl overflow-hidden">
            {/* Pinned Posts */}
            {pinnedPosts.map(post => (
              <div
                key={post.id}
                className="p-6 border-b border-[#E8E2D9] bg-gradient-to-r from-[#8BA4B4]/5 to-transparent hover:from-[#8BA4B4]/10 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#E8B4B8] to-[#F0D0D4] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2H5V5zm0 4h10v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#E8B4B8]/20 text-[#E8B4B8] text-xs font-semibold rounded">고정</span>
                      <span className="px-2 py-0.5 bg-[#8BA4B4]/10 text-[#8BA4B4] text-xs font-medium rounded">{post.categoryLabel}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#2D3436] mb-1 truncate">{post.title}</h3>
                    <p className="text-sm text-[#636E72] mb-3 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-[#9EA7AA]">
                      <span>{post.author}</span>
                      <span>{post.date}</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Regular Posts */}
            {regularPosts.map(post => (
              <div
                key={post.id}
                className="p-6 border-b border-[#E8E2D9] hover:bg-[#8BA4B4]/5 transition-all cursor-pointer last:border-b-0"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {post.author[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#8BA4B4]/10 text-[#8BA4B4] text-xs font-medium rounded">{post.categoryLabel}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#2D3436] mb-1 truncate">{post.title}</h3>
                    <p className="text-sm text-[#636E72] mb-3 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-[#9EA7AA]">
                      <span>{post.author}</span>
                      <span>{post.date}</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8 gap-2">
            <button className="w-10 h-10 rounded-lg bg-white/60 text-[#636E72] hover:bg-[#8BA4B4]/10 transition-all flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {[1, 2, 3, 4, 5].map(page => (
              <button
                key={page}
                className={`w-10 h-10 rounded-lg font-medium transition-all flex items-center justify-center ${
                  page === 1
                    ? 'bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white'
                    : 'bg-white/60 text-[#636E72] hover:bg-[#8BA4B4]/10'
                }`}
              >
                {page}
              </button>
            ))}
            <button className="w-10 h-10 rounded-lg bg-white/60 text-[#636E72] hover:bg-[#8BA4B4]/10 transition-all flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
      `}</style>
    </main>
  );
}

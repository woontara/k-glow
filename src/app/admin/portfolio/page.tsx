'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Portfolio {
  id: string;
  category: string;
  brand: string;
  title: string;
  description: string;
  imageUrl: string;
  salesAmount: string | null;
  productCount: string | null;
  rating: string | null;
  gradient: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

interface Testimonial {
  id: string;
  name: string;
  company: string;
  content: string;
  gradient: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

const CATEGORIES = [
  { value: 'SKINCARE', label: '스킨케어' },
  { value: 'MAKEUP', label: '메이크업' },
  { value: 'HAIRCARE', label: '헤어케어' },
];

const GRADIENTS = [
  { value: 'from-[#8BA4B4] to-[#6B8A9A]', label: '블루 (기본)' },
  { value: 'from-[#E8B4B8] to-[#C8949A]', label: '핑크' },
  { value: 'from-[#D4C4A8] to-[#B4A488]', label: '골드' },
  { value: 'from-[#A4B4A8] to-[#849488]', label: '그린' },
  { value: 'from-[#9BB4C4] to-[#7A9AAD]', label: '라이트 블루' },
  { value: 'from-[#7A9AAD] to-[#5A7A8A]', label: '다크 블루' },
];

export default function AdminPortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'testimonial'>('portfolio');
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Portfolio | Testimonial | null>(null);

  // 폼 상태
  const [formData, setFormData] = useState({
    category: 'SKINCARE',
    brand: '',
    title: '',
    description: '',
    imageUrl: '',
    salesAmount: '',
    productCount: '',
    rating: '',
    gradient: 'from-[#8BA4B4] to-[#6B8A9A]',
    isActive: true,
    order: 0,
    // Testimonial용
    name: '',
    company: '',
    content: '',
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin');
      return;
    }
    fetchData();
  }, [status, session, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [portfolioRes, testimonialRes] = await Promise.all([
        fetch('/api/portfolio?includeInactive=true'),
        fetch('/api/testimonial?includeInactive=true'),
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

  const resetForm = () => {
    setFormData({
      category: 'SKINCARE',
      brand: '',
      title: '',
      description: '',
      imageUrl: '',
      salesAmount: '',
      productCount: '',
      rating: '',
      gradient: 'from-[#8BA4B4] to-[#6B8A9A]',
      isActive: true,
      order: 0,
      name: '',
      company: '',
      content: '',
    });
    setEditItem(null);
  };

  const openModal = (item?: Portfolio | Testimonial) => {
    if (item) {
      setEditItem(item);
      if (activeTab === 'portfolio') {
        const p = item as Portfolio;
        setFormData({
          category: p.category,
          brand: p.brand,
          title: p.title,
          description: p.description,
          imageUrl: p.imageUrl,
          salesAmount: p.salesAmount || '',
          productCount: p.productCount || '',
          rating: p.rating || '',
          gradient: p.gradient,
          isActive: p.isActive,
          order: p.order,
          name: '',
          company: '',
          content: '',
        });
      } else {
        const t = item as Testimonial;
        setFormData({
          ...formData,
          name: t.name,
          company: t.company,
          content: t.content,
          gradient: t.gradient,
          isActive: t.isActive,
          order: t.order,
        });
      }
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      const endpoint = activeTab === 'portfolio' ? '/api/portfolio' : '/api/testimonial';
      const method = editItem ? 'PUT' : 'POST';
      const url = editItem ? `${endpoint}/${editItem.id}` : endpoint;

      let body: any;
      if (activeTab === 'portfolio') {
        body = {
          category: formData.category,
          brand: formData.brand,
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl,
          salesAmount: formData.salesAmount || null,
          productCount: formData.productCount || null,
          rating: formData.rating || null,
          gradient: formData.gradient,
          isActive: formData.isActive,
          order: formData.order,
        };
      } else {
        body = {
          name: formData.name,
          company: formData.company,
          content: formData.content,
          gradient: formData.gradient,
          isActive: formData.isActive,
          order: formData.order,
        };
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || '저장에 실패했습니다');
      }
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const endpoint = activeTab === 'portfolio' ? '/api/portfolio' : '/api/testimonial';
      const res = await fetch(`${endpoint}/${id}`, { method: 'DELETE' });

      if (res.ok) {
        fetchData();
      } else {
        alert('삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다');
    }
  };

  const toggleActive = async (item: Portfolio | Testimonial) => {
    try {
      const endpoint = activeTab === 'portfolio' ? '/api/portfolio' : '/api/testimonial';
      const res = await fetch(`${endpoint}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('상태 변경 실패:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
              ← 관리자 대시보드
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">포트폴리오 관리</h1>
          <p className="text-gray-600 mt-2">성공 사례와 고객 후기를 관리합니다</p>
        </div>

        {/* 탭 */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'portfolio'
                ? 'bg-[#8BA4B4] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            성공 사례 ({portfolios.length})
          </button>
          <button
            onClick={() => setActiveTab('testimonial')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'testimonial'
                ? 'bg-[#8BA4B4] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            고객 후기 ({testimonials.length})
          </button>
        </div>

        {/* 추가 버튼 */}
        <div className="mb-6">
          <button
            onClick={() => openModal()}
            className="px-6 py-3 bg-[#5A7A8A] text-white rounded-lg font-medium hover:bg-[#4A6A7A] transition-all flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            {activeTab === 'portfolio' ? '새 성공 사례 추가' : '새 고객 후기 추가'}
          </button>
        </div>

        {/* 목록 */}
        {activeTab === 'portfolio' ? (
          <div className="grid gap-4">
            {portfolios.map((p) => (
              <div
                key={p.id}
                className={`bg-white rounded-xl p-6 shadow-sm border ${
                  p.isActive ? 'border-gray-200' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-6">
                  {/* 이미지 */}
                  <div className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={p.imageUrl}
                      alt={p.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded bg-gradient-to-r ${p.gradient} text-white`}>
                        {p.brand}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">
                        {CATEGORIES.find(c => c.value === p.category)?.label}
                      </span>
                      {!p.isActive && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-600">
                          비활성
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{p.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{p.description}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      {p.salesAmount && <span>매출: {p.salesAmount}</span>}
                      {p.productCount && <span>상품: {p.productCount}</span>}
                      {p.rating && <span>평점: {p.rating}</span>}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        p.isActive
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                    >
                      {p.isActive ? '숨기기' : '표시'}
                    </button>
                    <button
                      onClick={() => openModal(p)}
                      className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {portfolios.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                등록된 성공 사례가 없습니다
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className={`bg-white rounded-xl p-6 shadow-sm border ${
                  t.isActive ? 'border-gray-200' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-6">
                  {/* 아바타 */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold bg-gradient-to-br ${t.gradient}`}>
                    {t.name[0]}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{t.name}</span>
                      <span className="text-gray-500">|</span>
                      <span className="text-[#8BA4B4] font-medium">{t.company}</span>
                      {!t.isActive && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-600">
                          비활성
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-2">&ldquo;{t.content}&rdquo;</p>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(t)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        t.isActive
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                    >
                      {t.isActive ? '숨기기' : '표시'}
                    </button>
                    <button
                      onClick={() => openModal(t)}
                      className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {testimonials.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                등록된 고객 후기가 없습니다
              </div>
            )}
          </div>
        )}
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editItem ? '수정하기' : '새로 추가하기'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {activeTab === 'portfolio' ? (
                <>
                  {/* 카테고리 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* 브랜드명 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">브랜드명 *</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="예: 클린코스메틱"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                    />
                  </div>

                  {/* 제목 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="예: Ozon 마켓 입점 성공"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                    />
                  </div>

                  {/* 설명 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">설명 *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="프로젝트에 대한 상세 설명을 입력하세요"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                    />
                  </div>

                  {/* 이미지 URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL *</label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                    />
                  </div>

                  {/* 통계 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">매출</label>
                      <input
                        type="text"
                        value={formData.salesAmount}
                        onChange={(e) => setFormData({ ...formData, salesAmount: e.target.value })}
                        placeholder="예: 5억+"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">상품 수</label>
                      <input
                        type="text"
                        value={formData.productCount}
                        onChange={(e) => setFormData({ ...formData, productCount: e.target.value })}
                        placeholder="예: 12종"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">평점</label>
                      <input
                        type="text"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                        placeholder="예: 4.8"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* 고객명 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">고객명 *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="예: 김대표"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                    />
                  </div>

                  {/* 회사명 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">회사명 *</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="예: 클린코스메틱"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                    />
                  </div>

                  {/* 후기 내용 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">후기 내용 *</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="고객 후기를 입력하세요"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {/* 그라데이션 색상 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">색상 테마</label>
                <select
                  value={formData.gradient}
                  onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                >
                  {GRADIENTS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>

              {/* 정렬 순서 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">정렬 순서</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8BA4B4] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">낮은 숫자가 먼저 표시됩니다</p>
              </div>

              {/* 활성화 상태 */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#8BA4B4] rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  활성화 (체크 해제 시 사이트에 표시되지 않음)
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-[#8BA4B4] text-white rounded-lg font-medium hover:bg-[#7A949A]"
              >
                {editItem ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

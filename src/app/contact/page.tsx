'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const services = [
    '인증 대행 (EAC/GOST)',
    '번역 서비스',
    '물류 지원',
    '시장 분석',
    '온라인 입점',
    '마케팅 지원',
    '기타',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.error || '문의 접수 중 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('문의 접수 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#FAFBFC] via-[#F5F7F9] to-[#FAF8F5] relative overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute rounded-full opacity-40 blur-3xl" style={{ width: 600, height: 600, background: 'radial-gradient(circle, #A8C5D4 0%, transparent 70%)', left: '-10%', top: '15%' }} />
          <div className="absolute rounded-full opacity-40 blur-3xl" style={{ width: 500, height: 500, background: 'radial-gradient(circle, #A4B4A8 0%, transparent 70%)', right: '-5%', top: '50%' }} />
        </div>
        <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-12 border border-white/40 shadow-xl text-center max-w-md mx-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#A4B4A8] to-[#C4D4C8] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#2D3436] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            문의가 접수되었습니다
          </h2>
          <p className="text-[#636E72] mb-6">
            빠른 시일 내에 담당자가 연락드리겠습니다.<br />
            감사합니다.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', company: '', email: '', phone: '', service: '', message: '' });
            }}
            className="px-6 py-3 bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            새 문의하기
          </button>
        </div>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
        `}</style>
      </main>
    );
  }

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
            <span className="text-[#8BA4B4] font-medium text-sm tracking-wider uppercase">Contact Us</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2D3436] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            문의하기{' '}
            <span className="bg-gradient-to-r from-[#8BA4B4] via-[#A8C5D4] to-[#8BA4B4] bg-clip-text text-transparent">
              & 상담 신청
            </span>
          </h1>
          <p className="text-lg text-[#636E72] max-w-2xl mx-auto">
            러시아 수출에 대해 궁금한 점이 있으시면 언제든 문의해주세요
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="relative pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-xl">
                <h3 className="text-xl font-bold text-[#2D3436] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  연락처 정보
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D3436]">이메일</p>
                      <p className="text-[#636E72]">contact@k-glow.com</p>
                      <p className="text-[#636E72]">support@k-glow.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#A4B4A8] to-[#C4D4C8] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D3436]">전화</p>
                      <p className="text-[#636E72]">+82-2-1234-5678</p>
                      <p className="text-[#636E72]">+82-10-9876-5432</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#D4C4A8] to-[#E8DCC8] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D3436]">주소</p>
                      <p className="text-[#636E72]">서울시 강남구 테헤란로 123</p>
                      <p className="text-[#636E72]">K-Glow 빌딩 10층</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-xl">
                <h3 className="text-xl font-bold text-[#2D3436] mb-4\" style={{ fontFamily: 'Playfair Display, serif' }}>
                  업무 시간
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#636E72]">월 - 금</span>
                    <span className="text-[#2D3436] font-medium">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#636E72]">토요일</span>
                    <span className="text-[#2D3436] font-medium">10:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#636E72]">일요일</span>
                    <span className="text-[#9EA7AA]">휴무</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] rounded-3xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  긴급 문의
                </h3>
                <p className="text-sm opacity-90 mb-4">
                  긴급한 문의사항이 있으시면 카카오톡으로 연락주세요.
                </p>
                <button className="w-full py-3 bg-[#FEE500] text-[#3C1E1E] font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.47 1.607 4.647 4.031 5.907-.165.605-.601 2.19-.689 2.532-.11.428.157.422.33.307.137-.09 2.179-1.478 3.058-2.073.417.056.845.086 1.27.086 5.523 0 10-3.477 10-7.759C20 6.477 17.523 3 12 3z" />
                  </svg>
                  카카오톡 문의
                </button>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-xl">
                <h3 className="text-xl font-bold text-[#2D3436] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  문의 양식
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#2D3436] mb-2">
                        담당자명 <span className="text-[#E8B4B8]">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/60 rounded-xl border border-[#E8E2D9] focus:outline-none focus:ring-2 focus:ring-[#8BA4B4]/50 focus:border-transparent transition-all"
                        placeholder="홍길동"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2D3436] mb-2">
                        회사명 <span className="text-[#E8B4B8]">*</span>
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/60 rounded-xl border border-[#E8E2D9] focus:outline-none focus:ring-2 focus:ring-[#8BA4B4]/50 focus:border-transparent transition-all"
                        placeholder="(주)뷰티코리아"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#2D3436] mb-2">
                        이메일 <span className="text-[#E8B4B8]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/60 rounded-xl border border-[#E8E2D9] focus:outline-none focus:ring-2 focus:ring-[#8BA4B4]/50 focus:border-transparent transition-all"
                        placeholder="example@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2D3436] mb-2">
                        연락처
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/60 rounded-xl border border-[#E8E2D9] focus:outline-none focus:ring-2 focus:ring-[#8BA4B4]/50 focus:border-transparent transition-all"
                        placeholder="010-1234-5678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2D3436] mb-2">
                      관심 서비스 <span className="text-[#E8B4B8]">*</span>
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/60 rounded-xl border border-[#E8E2D9] focus:outline-none focus:ring-2 focus:ring-[#8BA4B4]/50 focus:border-transparent transition-all"
                    >
                      <option value="">서비스를 선택해주세요</option>
                      {services.map((service, i) => (
                        <option key={i} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2D3436] mb-2">
                      문의 내용 <span className="text-[#E8B4B8]">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 bg-white/60 rounded-xl border border-[#E8E2D9] focus:outline-none focus:ring-2 focus:ring-[#8BA4B4]/50 focus:border-transparent transition-all resize-none"
                      placeholder="문의하실 내용을 자세히 적어주세요..."
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      required
                      className="mt-1 w-4 h-4 accent-[#8BA4B4]"
                    />
                    <label htmlFor="privacy" className="text-sm text-[#636E72]">
                      개인정보 수집 및 이용에 동의합니다. 수집된 정보는 문의 답변 목적으로만 사용됩니다.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        전송 중...
                      </>
                    ) : (
                      <>
                        문의 보내기
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="relative py-16 px-6 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-[#2D3436] text-center mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
            오시는 길
          </h2>
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/40 shadow-xl">
            <div className="h-80 bg-gradient-to-br from-[#E8E2D9] to-[#F5F0EB] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-[#636E72] font-medium">서울시 강남구 테헤란로 123</p>
                <p className="text-sm text-[#9EA7AA]">지하철 2호선 강남역 3번 출구에서 도보 5분</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
      `}</style>
    </main>
  );
}

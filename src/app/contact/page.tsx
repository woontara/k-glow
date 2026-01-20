'use client';

import { useState, useEffect } from 'react';

export default function ContactPage() {
  const [mounted, setMounted] = useState(false);
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

  // 카카오톡 채널 ID (환경변수에서 가져옴)
  const kakaoChannelId = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_ID;

  useEffect(() => {
    setMounted(true);
  }, []);

  // 카카오톡 채널 채팅 열기
  const handleKakaoChat = () => {
    if (kakaoChannelId) {
      // 카카오톡 채널 1:1 채팅 URL로 이동
      window.open(`https://pf.kakao.com/${kakaoChannelId}/chat`, '_blank');
    } else {
      alert('카카오톡 채널이 준비 중입니다. 이메일로 문의해주세요.');
    }
  };

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
    } catch {
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
      <main className="min-h-screen bg-gradient-luxury relative overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 pointer-events-none bg-mesh" />
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-3xl animate-liquid"
            style={{ background: 'linear-gradient(135deg, rgba(164,180,168,0.4) 0%, rgba(196,212,200,0.2) 100%)', left: '-10%', top: '20%' }}
          />
        </div>
        <div className="fixed inset-0 grain pointer-events-none" />

        <div className={`relative card-luxury rounded-[2rem] p-12 max-w-md mx-6 text-center ${mounted ? 'animate-reveal' : 'opacity-0'}`}>
          <div className="w-24 h-24 bg-gradient-to-br from-[#A4B4A8] to-[#849488] rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl animate-pulse-glow">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-3xl font-semibold text-[#2D3436] mb-4">
            문의가 접수되었습니다
          </h2>
          <p className="text-[#636E72] text-lg mb-8 leading-relaxed">
            빠른 시일 내에 담당자가 연락드리겠습니다.
            <br />감사합니다.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', company: '', email: '', phone: '', service: '', message: '' });
            }}
            className="btn-primary"
          >
            새 문의하기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-luxury relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none bg-mesh" />

      {/* Decorative Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[700px] h-[700px] rounded-full opacity-30 blur-3xl animate-liquid"
          style={{ background: 'linear-gradient(135deg, rgba(139,164,180,0.4) 0%, rgba(168,197,212,0.2) 100%)', left: '-15%', top: '10%' }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-25 blur-3xl animate-liquid"
          style={{ background: 'linear-gradient(135deg, rgba(164,180,168,0.3) 0%, rgba(196,212,200,0.15) 100%)', right: '-10%', top: '50%', animationDelay: '5s' }}
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
              CONTACT US
            </span>
          </div>

          <h1 className={`font-display text-5xl md:text-6xl font-semibold text-[#2D3436] mb-6 ${mounted ? 'animate-reveal delay-100' : 'opacity-0'}`}>
            문의하기
            <br />
            <span className="text-gradient-luxury">& 상담 신청</span>
          </h1>

          <p className={`text-xl text-[#636E72] max-w-2xl mx-auto leading-relaxed ${mounted ? 'animate-reveal delay-200' : 'opacity-0'}`}>
            러시아 수출에 대해 궁금한 점이 있으시면
            <br className="hidden md:block" />
            언제든 문의해주세요
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="relative pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className={`card-luxury rounded-[2rem] p-8 ${mounted ? 'animate-reveal delay-300' : 'opacity-0'}`}>
                <h3 className="font-display text-2xl font-semibold text-[#2D3436] mb-8">
                  연락처 정보
                </h3>
                <div className="flex items-start gap-4 group">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#8BA4B4] to-[#6B8A9A] rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#2D3436] mb-1">이메일</p>
                    <a href="mailto:contact@k-glow.com" className="text-[#636E72] hover:text-[#8BA4B4] transition-colors">contact@k-glow.com</a>
                    <p className="text-[#636E72] text-sm mt-1">마케팅/제휴문의 동일</p>
                  </div>
                </div>
              </div>

              <div className={`card-luxury rounded-[2rem] p-8 ${mounted ? 'animate-reveal delay-400' : 'opacity-0'}`}>
                <h3 className="font-display text-xl font-semibold text-[#2D3436] mb-6">
                  업무 시간
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#636E72]">월 - 금</span>
                    <span className="font-medium text-[#2D3436] bg-[#8BA4B4]/10 px-3 py-1 rounded-full text-sm">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#636E72]">토요일</span>
                    <span className="font-medium text-[#2D3436] bg-[#8BA4B4]/10 px-3 py-1 rounded-full text-sm">10:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#636E72]">일요일</span>
                    <span className="font-medium text-[#9EA7AA] bg-[#E8EEF2] px-3 py-1 rounded-full text-sm">휴무</span>
                  </div>
                </div>
              </div>

              <div className={`relative overflow-hidden rounded-[2rem] p-8 ${mounted ? 'animate-reveal delay-500' : 'opacity-0'}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#8BA4B4] to-[#6B8A9A]" />
                <div className="absolute inset-0 animate-shimmer opacity-30" />
                <div className="relative text-white">
                  <h3 className="font-display text-xl font-semibold mb-3">
                    긴급 문의
                  </h3>
                  <p className="text-sm text-white/80 mb-6">
                    긴급한 문의사항이 있으시면 카카오톡으로 연락주세요.
                  </p>
                  <button
                    onClick={handleKakaoChat}
                    className="w-full py-4 bg-[#FEE500] text-[#3C1E1E] font-semibold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 hover:-translate-y-1 active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.47 1.607 4.647 4.031 5.907-.165.605-.601 2.19-.689 2.532-.11.428.157.422.33.307.137-.09 2.179-1.478 3.058-2.073.417.056.845.086 1.27.086 5.523 0 10-3.477 10-7.759C20 6.477 17.523 3 12 3z" />
                    </svg>
                    카카오톡 문의
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className={`card-luxury rounded-[2rem] p-10 ${mounted ? 'animate-reveal delay-300' : 'opacity-0'}`}>
                <h3 className="font-display text-2xl font-semibold text-[#2D3436] mb-8">
                  문의 양식
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#5A7A8A] mb-2">
                        담당자명 <span className="text-[#E8B4B8]">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="input-luxury w-full"
                        placeholder="홍길동"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#5A7A8A] mb-2">
                        회사명 <span className="text-[#E8B4B8]">*</span>
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        className="input-luxury w-full"
                        placeholder="(주)뷰티코리아"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#5A7A8A] mb-2">
                        이메일 <span className="text-[#E8B4B8]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="input-luxury w-full"
                        placeholder="example@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#5A7A8A] mb-2">
                        연락처
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-luxury w-full"
                        placeholder="010-1234-5678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#5A7A8A] mb-2">
                      관심 서비스 <span className="text-[#E8B4B8]">*</span>
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                      className="input-luxury w-full"
                    >
                      <option value="">서비스를 선택해주세요</option>
                      {services.map((service, i) => (
                        <option key={i} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#5A7A8A] mb-2">
                      문의 내용 <span className="text-[#E8B4B8]">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="input-luxury w-full resize-none"
                      placeholder="문의하실 내용을 자세히 적어주세요..."
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      required
                      className="mt-1 w-5 h-5 accent-[#8BA4B4] rounded"
                    />
                    <label htmlFor="privacy" className="text-sm text-[#636E72] leading-relaxed">
                      개인정보 수집 및 이용에 동의합니다. 수집된 정보는 문의 답변 목적으로만 사용됩니다.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-5 text-lg mt-4"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        전송 중...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        문의 보내기
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}

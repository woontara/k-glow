'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    companyName: '',
    role: 'BRAND' as 'BRAND' | 'BUYER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          companyName: formData.companyName || undefined,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '회원가입 실패');
      }

      router.push('/auth/signin?message=signup-success');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '회원가입에 실패했습니다';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .font-display {
          font-family: 'Cormorant Garamond', serif;
        }

        .font-body {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      <div className="font-body min-h-screen flex items-center justify-center bg-[#FAF8F5] py-12 px-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#8BA4B4]/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#D4C4A8]/20 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-md w-full">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="K-Glow"
                width={140}
                height={50}
                className="mx-auto mb-4"
                unoptimized
              />
            </Link>
            <h1 className="font-display text-3xl font-semibold text-[#2D3436]">회원가입</h1>
            <p className="mt-2 text-[#636E72]">K-Glow와 함께 러시아 시장에 진출하세요</p>
          </div>

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-sm shadow-[0_8px_32px_rgba(139,164,180,0.15)] rounded-3xl p-8 border border-white/50">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-[#E8B4B8]/10 border border-[#E8B4B8]/30 text-[#8B5A5A] px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#5A7A8A] mb-2">
                  이메일 <span className="text-[#E8B4B8]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5A7A8A] mb-2">
                  이름 <span className="text-[#E8B4B8]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
                  placeholder="홍길동"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5A7A8A] mb-2">
                  회사명 <span className="text-[#B2BEC3] text-xs">(선택)</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
                  placeholder="회사명"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5A7A8A] mb-2">
                  계정 유형 <span className="text-[#E8B4B8]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-center gap-2 p-4 border rounded-xl cursor-pointer transition-all ${
                      formData.role === 'BRAND'
                        ? 'border-[#8BA4B4] bg-[#8BA4B4]/10 text-[#5A7A8A]'
                        : 'border-[#E8E2D9] hover:border-[#8BA4B4]/50 text-[#636E72]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="BRAND"
                      checked={formData.role === 'BRAND'}
                      onChange={() => setFormData({ ...formData, role: 'BRAND' })}
                      className="sr-only"
                    />
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="font-medium">브랜드</span>
                  </label>
                  <label
                    className={`flex items-center justify-center gap-2 p-4 border rounded-xl cursor-pointer transition-all ${
                      formData.role === 'BUYER'
                        ? 'border-[#8BA4B4] bg-[#8BA4B4]/10 text-[#5A7A8A]'
                        : 'border-[#E8E2D9] hover:border-[#8BA4B4]/50 text-[#636E72]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="BUYER"
                      checked={formData.role === 'BUYER'}
                      onChange={() => setFormData({ ...formData, role: 'BUYER' })}
                      className="sr-only"
                    />
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="font-medium">바이어</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5A7A8A] mb-2">
                  비밀번호 <span className="text-[#E8B4B8]">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
                  placeholder="최소 8자"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5A7A8A] mb-2">
                  비밀번호 확인 <span className="text-[#E8B4B8]">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
                  placeholder="비밀번호 재입력"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white font-semibold rounded-xl shadow-lg shadow-[#8BA4B4]/25 hover:shadow-xl hover:shadow-[#8BA4B4]/30 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    처리 중...
                  </span>
                ) : (
                  '회원가입'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center text-sm mt-6 pt-6 border-t border-[#E8E2D9]">
              <span className="text-[#636E72]">이미 계정이 있으신가요? </span>
              <Link href="/auth/signin" className="text-[#8BA4B4] hover:text-[#5A7A8A] font-semibold transition-colors">
                로그인
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

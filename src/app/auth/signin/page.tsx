'use client';

import { useState, Suspense, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('로그인에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    setLoading(true);
    await signIn(provider, { callbackUrl });
  };

  return (
    <div className="w-full max-w-[460px] mx-auto px-6">
      {/* Logo & Title */}
      <div className={`text-center mb-10 ${mounted ? 'animate-reveal' : 'opacity-0'}`}>
        <Link href="/" className="inline-block group">
          <Image
            src="/logo.png"
            alt="K-Glow"
            width={160}
            height={58}
            className="mx-auto mb-6 transition-transform duration-500 group-hover:scale-105"
            unoptimized
            priority
          />
        </Link>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-[#2D3436] mb-3">
          환영합니다
        </h1>
        <p className="text-[#636E72] text-lg">
          프리미엄 K-Beauty의 세계로
        </p>
      </div>

      {/* Card */}
      <div className={`card-luxury rounded-[2rem] p-8 md:p-10 ${mounted ? 'animate-reveal delay-200' : 'opacity-0'}`}>
        {/* Social Login */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="group w-full flex items-center justify-center gap-3 px-5 py-4 bg-white border border-[#E8EEF2] rounded-2xl hover:border-[#8BA4B4]/40 hover:shadow-lg hover:shadow-[#8BA4B4]/10 transition-all duration-300 disabled:opacity-50"
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-[#2D3436] font-medium">Google로 계속하기</span>
          </button>

          <button
            onClick={() => handleSocialLogin('kakao')}
            disabled={loading}
            className="group w-full flex items-center justify-center gap-3 px-5 py-4 bg-[#FEE500] rounded-2xl hover:bg-[#F5DC00] hover:shadow-lg hover:shadow-[#FEE500]/30 transition-all duration-300 disabled:opacity-50"
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="#191919">
              <path d="M12 3C6.48 3 2 6.48 2 10.5c0 2.52 1.64 4.73 4.11 6.01-.12.44-.78 2.86-.81 3.06 0 0-.02.15.08.21.1.06.21.02.21.02.27-.04 3.15-2.07 3.65-2.43.58.08 1.17.13 1.76.13 5.52 0 10-3.48 10-7.5S17.52 3 12 3z"/>
            </svg>
            <span className="text-[#191919] font-medium">Kakao로 계속하기</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#8BA4B4]/30 to-transparent" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-white text-sm text-[#9EA7AA] font-medium">또는 이메일로 로그인</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-3 bg-[#FDF0F0] border border-[#E8B4B8]/30 text-[#8B5A5A] px-4 py-3.5 rounded-xl text-sm animate-slideUp">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#5A7A8A]">
              이메일
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-luxury w-full"
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#5A7A8A]">
              비밀번호
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-luxury w-full"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-lg mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                로그인 중...
              </span>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm mt-8 pt-8 border-t border-[#E8EEF2]">
          <span className="text-[#636E72]">계정이 없으신가요? </span>
          <Link href="/auth/signup" className="text-[#8BA4B4] hover:text-[#627D98] font-semibold transition-colors underline-offset-4 hover:underline">
            회원가입
          </Link>
        </div>
      </div>

      {/* Back to home */}
      <div className={`text-center mt-8 ${mounted ? 'animate-reveal delay-400' : 'opacity-0'}`}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#9EA7AA] hover:text-[#636E72] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full max-w-[460px] mx-auto px-6">
      <div className="text-center mb-10">
        <div className="w-[160px] h-[58px] mx-auto mb-6 bg-[#E8EEF2] rounded-lg animate-pulse" />
        <div className="h-10 w-40 mx-auto bg-[#E8EEF2] rounded-lg animate-pulse mb-3" />
        <div className="h-5 w-56 mx-auto bg-[#E8EEF2] rounded animate-pulse" />
      </div>
      <div className="card-luxury rounded-[2rem] p-8 md:p-10">
        <div className="space-y-4">
          <div className="h-14 bg-[#E8EEF2] rounded-2xl animate-pulse" />
          <div className="h-14 bg-[#E8EEF2] rounded-2xl animate-pulse" />
          <div className="h-px bg-[#E8EEF2] my-8" />
          <div className="h-14 bg-[#E8EEF2] rounded-xl animate-pulse" />
          <div className="h-14 bg-[#E8EEF2] rounded-xl animate-pulse" />
          <div className="h-14 bg-[#8BA4B4]/30 rounded-xl animate-pulse mt-6" />
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-luxury py-16 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none bg-mesh" />

      {/* Decorative Blobs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-40 blur-3xl animate-liquid"
           style={{ background: 'linear-gradient(135deg, rgba(139,164,180,0.3) 0%, rgba(168,197,212,0.2) 100%)' }} />
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full opacity-30 blur-3xl animate-liquid"
           style={{ background: 'linear-gradient(135deg, rgba(232,180,184,0.25) 0%, rgba(240,208,212,0.15) 100%)', animationDelay: '5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
           style={{ background: 'radial-gradient(circle, rgba(201,169,98,0.1) 0%, transparent 70%)' }} />

      {/* Grain overlay */}
      <div className="absolute inset-0 grain pointer-events-none" />

      <Suspense fallback={<LoadingFallback />}>
        <SignInForm />
      </Suspense>
    </div>
  );
}

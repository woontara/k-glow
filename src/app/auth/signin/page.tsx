'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="relative max-w-md w-full space-y-8">
      {/* Logo & Title */}
      <div className="text-center">
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
        <h1 className="font-display text-3xl font-semibold text-[#2D3436]">환영합니다</h1>
        <p className="mt-2 text-[#636E72]">로그인하여 서비스를 이용하세요</p>
      </div>

      {/* Card */}
      <div className="bg-white/80 backdrop-blur-sm shadow-[0_8px_32px_rgba(139,164,180,0.15)] rounded-3xl p-8 border border-white/50">
        {/* Social Login */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-[#E8E2D9] rounded-xl hover:bg-[#FAF8F5] hover:border-[#8BA4B4]/30 transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#FEE500] rounded-xl hover:bg-[#FDD835] transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000">
              <path d="M12 3C6.48 3 2 6.48 2 10.5c0 2.52 1.64 4.73 4.11 6.01-.12.44-.78 2.86-.81 3.06 0 0-.02.15.08.21.1.06.21.02.21.02.27-.04 3.15-2.07 3.65-2.43.58.08 1.17.13 1.76.13 5.52 0 10-3.48 10-7.5S17.52 3 12 3z"/>
            </svg>
            <span className="text-[#191919] font-medium">Kakao로 계속하기</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E8E2D9]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-[#B2BEC3]">또는</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-[#E8B4B8]/10 border border-[#E8B4B8]/30 text-[#8B5A5A] px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#5A7A8A] mb-2">
              이메일
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
              비밀번호
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
              placeholder="••••••••"
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
                로그인 중...
              </span>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm mt-6 pt-6 border-t border-[#E8E2D9]">
          <span className="text-[#636E72]">계정이 없으신가요? </span>
          <Link href="/auth/signup" className="text-[#8BA4B4] hover:text-[#5A7A8A] font-semibold transition-colors">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="relative max-w-md w-full space-y-8">
      <div className="text-center">
        <div className="w-[140px] h-[50px] mx-auto mb-4 bg-[#E8E2D9] rounded-lg animate-pulse" />
        <div className="h-8 w-32 mx-auto bg-[#E8E2D9] rounded animate-pulse mb-2" />
        <div className="h-4 w-48 mx-auto bg-[#E8E2D9] rounded animate-pulse" />
      </div>
      <div className="bg-white/80 backdrop-blur-sm shadow-[0_8px_32px_rgba(139,164,180,0.15)] rounded-3xl p-8 border border-white/50">
        <div className="space-y-4">
          <div className="h-12 bg-[#E8E2D9] rounded-xl animate-pulse" />
          <div className="h-12 bg-[#E8E2D9] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
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
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#8BA4B4]/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#E8B4B8]/15 to-transparent rounded-full blur-3xl" />
        </div>

        <Suspense fallback={<LoadingFallback />}>
          <SignInForm />
        </Suspense>
      </div>
    </>
  );
}

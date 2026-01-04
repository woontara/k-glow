'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: '서버 설정 오류가 발생했습니다',
    AccessDenied: '접근이 거부되었습니다',
    Verification: '인증 토큰이 만료되었거나 이미 사용되었습니다',
    Default: '인증 중 오류가 발생했습니다',
    unauthorized: '권한이 없습니다. 관리자 계정이 필요합니다.',
  };

  const message = errorMessages[error || 'Default'] || errorMessages.Default;

  return (
    <div className="relative max-w-md w-full space-y-8">
      {/* Logo */}
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
      </div>

      {/* Error Card */}
      <div className="bg-white/80 backdrop-blur-sm shadow-[0_8px_32px_rgba(139,164,180,0.15)] rounded-3xl p-8 border border-white/50 text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#E8B4B8]/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-[#E8B4B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="font-display text-2xl font-semibold text-[#2D3436] mb-3">
          인증 오류
        </h1>
        <p className="text-[#636E72] mb-8 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="block w-full py-3.5 bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white font-semibold rounded-xl shadow-lg shadow-[#8BA4B4]/25 hover:shadow-xl hover:shadow-[#8BA4B4]/30 transition-all text-center"
          >
            로그인 페이지로 돌아가기
          </Link>
          <Link
            href="/"
            className="block w-full py-3.5 bg-white border border-[#E8E2D9] text-[#5A7A8A] font-semibold rounded-xl hover:bg-[#FAF8F5] hover:border-[#8BA4B4]/30 transition-all text-center"
          >
            홈으로 이동
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
      </div>
      <div className="bg-white/80 backdrop-blur-sm shadow-[0_8px_32px_rgba(139,164,180,0.15)] rounded-3xl p-8 border border-white/50 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#E8E2D9] animate-pulse" />
        <div className="h-6 w-32 mx-auto bg-[#E8E2D9] rounded animate-pulse mb-3" />
        <div className="h-4 w-48 mx-auto bg-[#E8E2D9] rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
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
          <ErrorContent />
        </Suspense>
      </div>
    </>
  );
}

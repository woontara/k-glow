'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: '홈' },
    { href: '/partners', label: '파트너사' },
    { href: '/calculator', label: '견적 계산' },
    { href: '/analyze', label: '브랜드 분석' },
    { href: '/product-rebuild', label: '상품 리빌드' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <nav
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          ${scrolled
            ? 'bg-white/90 backdrop-blur-lg shadow-[0_4px_20px_rgba(139,164,180,0.1)] border-b border-[#8BA4B4]/10'
            : 'bg-transparent'
          }
        `}
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/logo.png"
                alt="K-Glow"
                width={100}
                height={36}
                className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
                priority
                unoptimized
              />
              <span className={`
                text-xs font-medium hidden sm:inline
                transition-colors duration-300
                ${scrolled ? 'text-[#636E72]' : 'text-[#8BA4B4]'}
              `}>
                한국 화장품 러시아 수출
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative px-5 py-2.5 rounded-full text-sm font-medium
                    transition-all duration-300
                    ${isActive(link.href)
                      ? 'text-white'
                      : scrolled
                        ? 'text-[#636E72] hover:text-[#5A7A8A] hover:bg-[#8BA4B4]/10'
                        : 'text-[#5A7A8A] hover:text-[#2D3436] hover:bg-white/50'
                    }
                  `}
                >
                  {isActive(link.href) && (
                    <span className="absolute inset-0 bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] rounded-full" />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center gap-3">
              {status === 'loading' ? (
                <div className="w-9 h-9 rounded-full bg-[#8BA4B4]/20 animate-pulse" />
              ) : session ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`
                      flex items-center gap-3 px-4 py-2 rounded-full
                      transition-all duration-300
                      ${scrolled
                        ? 'hover:bg-[#8BA4B4]/10'
                        : 'hover:bg-white/50'
                      }
                    `}
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-md">
                      {session.user.name?.[0] || 'U'}
                    </div>
                    <span className={`text-sm font-medium ${scrolled ? 'text-[#2D3436]' : 'text-[#5A7A8A]'}`}>
                      {session.user.name}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''} ${scrolled ? 'text-[#636E72]' : 'text-[#8BA4B4]'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Dropdown */}
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-lg border border-[#8BA4B4]/20 rounded-2xl shadow-[0_8px_32px_rgba(139,164,180,0.2)] py-3 z-20 overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#E8E2D9]">
                          <p className="text-sm font-semibold text-[#2D3436]">{session.user.name}</p>
                          <p className="text-xs text-[#636E72] mt-1">{session.user.email}</p>
                          {session.user.companyName && (
                            <p className="text-xs text-[#8BA4B4] mt-1">{session.user.companyName}</p>
                          )}
                          <span className="inline-block mt-3 px-3 py-1 bg-gradient-to-r from-[#8BA4B4]/20 to-[#A8C5D4]/20 text-[#5A7A8A] text-xs font-medium rounded-full">
                            {session.user.role}
                          </span>
                        </div>

                        <div className="py-2">
                          <Link
                            href="/certification/status"
                            className="flex items-center gap-3 px-5 py-3 text-sm text-[#636E72] hover:bg-[#8BA4B4]/10 hover:text-[#5A7A8A] transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            내 인증 현황
                          </Link>

                          {session.user.role === 'ADMIN' && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-3 px-5 py-3 text-sm text-[#636E72] hover:bg-[#8BA4B4]/10 hover:text-[#5A7A8A] transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              관리자 대시보드
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-[#E8E2D9] pt-2">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-5 py-3 text-sm text-[#E8B4B8] hover:bg-[#E8B4B8]/10 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            로그아웃
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/auth/signin"
                    className={`
                      px-5 py-2.5 text-sm font-medium rounded-full
                      transition-all duration-300
                      ${scrolled
                        ? 'text-[#636E72] hover:text-[#5A7A8A] hover:bg-[#8BA4B4]/10'
                        : 'text-[#5A7A8A] hover:text-[#2D3436] hover:bg-white/50'
                      }
                    `}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`
                md:hidden p-2.5 rounded-xl
                transition-all duration-300
                ${scrolled
                  ? 'hover:bg-[#8BA4B4]/10 text-[#636E72]'
                  : 'hover:bg-white/50 text-[#5A7A8A]'
                }
              `}
              aria-label="메뉴"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-6 border-t border-[#E8E2D9]">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      px-5 py-3.5 rounded-xl text-sm font-medium
                      transition-all duration-300
                      ${isActive(link.href)
                        ? 'bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white'
                        : 'text-[#636E72] hover:bg-[#8BA4B4]/10 hover:text-[#5A7A8A]'
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Mobile Auth */}
                <div className="border-t border-[#E8E2D9] pt-4 mt-4">
                  {session ? (
                    <>
                      <div className="flex items-center gap-3 px-5 py-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] text-white rounded-full flex items-center justify-center font-semibold">
                          {session.user.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2D3436]">{session.user.name}</p>
                          <p className="text-xs text-[#8BA4B4]">{session.user.role}</p>
                        </div>
                      </div>

                      <Link
                        href="/certification/status"
                        className="block px-5 py-3.5 text-sm font-medium text-[#636E72] hover:bg-[#8BA4B4]/10 rounded-xl"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        내 인증 현황
                      </Link>

                      {session.user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="block px-5 py-3.5 text-sm font-medium text-[#636E72] hover:bg-[#8BA4B4]/10 rounded-xl"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          관리자 대시보드
                        </Link>
                      )}

                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-5 py-3.5 text-sm font-medium text-[#E8B4B8] hover:bg-[#E8B4B8]/10 rounded-xl mt-2"
                      >
                        로그아웃
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3 px-2">
                      <Link
                        href="/auth/signin"
                        className="block px-5 py-3.5 text-center text-sm font-medium text-[#636E72] hover:bg-[#8BA4B4]/10 rounded-xl"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        로그인
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="block px-5 py-3.5 text-center text-sm font-semibold bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white rounded-xl"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        회원가입
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-20" />
    </>
  );
}

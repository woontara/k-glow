'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeIndicator, setActiveIndicator] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update active indicator position
  useEffect(() => {
    if (navRef.current) {
      const activeLink = navRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeLink) {
        const navRect = navRef.current.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        setActiveIndicator({
          left: linkRect.left - navRect.left,
          width: linkRect.width,
        });
      }
    }
  }, [pathname]);

  const navLinks = [
    { href: '/', label: '홈', labelEn: 'Home' },
    { href: '/about', label: '소개', labelEn: 'About' },
    { href: '/services', label: '서비스', labelEn: 'Services' },
    { href: '/portfolio', label: '포트폴리오', labelEn: 'Portfolio' },
    { href: '/partners', label: '파트너사', labelEn: 'Partners' },
    { href: '/calculator', label: '견적 계산', labelEn: 'Calculator' },
    { href: '/forum', label: '포럼', labelEn: 'Forum' },
    { href: '/contact', label: '문의하기', labelEn: 'Contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleSignOut = () => {
    setUserMenuOpen(false);
    signOut({ callbackUrl: '/' });
  };

  const getUserInitial = () => {
    if (session?.user?.name) {
      return session.user.name.charAt(0).toUpperCase();
    }
    if (session?.user?.email) {
      return session.user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    return session?.user?.name || session?.user?.email?.split('@')[0] || '사용자';
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');

        .nav-glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
        }

        .nav-glass-dark {
          background: rgba(250, 251, 252, 0.95);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }

        .nav-indicator {
          transition: left 0.4s cubic-bezier(0.16, 1, 0.3, 1), width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      <nav
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-500
          ${scrolled
            ? 'nav-glass-dark shadow-[0_4px_30px_rgba(139,164,180,0.1)] border-b border-white/50'
            : 'bg-transparent'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="K-Glow"
                  width={110}
                  height={40}
                  className="h-10 w-auto transition-all duration-500 group-hover:scale-105"
                  priority
                  unoptimized
                />
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-[#8BA4B4]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              </div>
              <div className={`
                hidden lg:flex flex-col
                transition-all duration-300
              `}>
                <span className={`
                  text-[10px] font-medium tracking-[0.15em] uppercase
                  ${scrolled ? 'text-[#8BA4B4]' : 'text-[#8BA4B4]/80'}
                `}>
                  Premium K-Beauty
                </span>
                <span className={`
                  text-xs font-medium
                  ${scrolled ? 'text-[#636E72]' : 'text-[#5A7A8A]'}
                `}>
                  러시아 수출 플랫폼
                </span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div ref={navRef} className="hidden md:flex items-center gap-1 relative">
              {/* Active indicator background */}
              <div
                className="nav-indicator absolute h-10 bg-gradient-to-r from-[#7A9AAD] via-[#8BA4B4] to-[#9BB4C4] rounded-full shadow-lg shadow-[#8BA4B4]/30 -z-10"
                style={{
                  left: activeIndicator.left,
                  width: activeIndicator.width,
                  opacity: activeIndicator.width > 0 ? 1 : 0,
                }}
              />

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  data-active={isActive(link.href)}
                  className={`
                    relative px-5 py-2.5 rounded-full text-sm font-medium
                    transition-all duration-300
                    ${isActive(link.href)
                      ? 'text-white'
                      : scrolled
                        ? 'text-[#636E72] hover:text-[#2D3436] hover:bg-[#8BA4B4]/10'
                        : 'text-[#5A7A8A] hover:text-[#2D3436] hover:bg-white/40'
                    }
                  `}
                >
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center gap-4">
              {status === 'loading' ? (
                <div className="w-10 h-10 bg-[#8BA4B4]/20 rounded-full animate-pulse" />
              ) : session ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`
                      flex items-center gap-3 px-4 py-2 rounded-full
                      transition-all duration-300 group
                      ${scrolled
                        ? 'hover:bg-[#8BA4B4]/10'
                        : 'hover:bg-white/40'
                      }
                    `}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] rounded-full blur-sm opacity-50" />
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt={getUserDisplayName()}
                          className="relative w-10 h-10 rounded-full object-cover shadow-lg"
                        />
                      ) : (
                        <div className="relative w-10 h-10 bg-gradient-to-br from-[#7A9AAD] to-[#9BB4C4] text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-lg">
                          {getUserInitial()}
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <span className={`block text-sm font-semibold ${scrolled ? 'text-[#2D3436]' : 'text-[#2D3436]'}`}>
                        {getUserDisplayName()}
                      </span>
                      <span className="block text-[10px] font-medium text-[#8BA4B4]">
                        {session.user?.role || 'USER'}
                      </span>
                    </div>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-3 w-72 nav-glass border border-white/50 rounded-3xl shadow-[0_20px_60px_rgba(139,164,180,0.25)] py-2 z-20 overflow-hidden animate-slideDown">
                        <div className="px-6 py-5 border-b border-[#E8E2D9]/50">
                          <div className="flex items-center gap-4">
                            {session.user?.image ? (
                              <img
                                src={session.user.image}
                                alt={getUserDisplayName()}
                                className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                              />
                            ) : (
                              <div className="w-14 h-14 bg-gradient-to-br from-[#7A9AAD] to-[#9BB4C4] text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
                                {getUserInitial()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-[#2D3436]">{getUserDisplayName()}</p>
                              <p className="text-xs text-[#636E72] mt-0.5">{session.user?.email}</p>
                              {session.user?.companyName && (
                                <p className="text-xs text-[#8BA4B4] mt-1 font-medium">{session.user.companyName}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="py-2 px-2">
                          <Link
                            href="/certification/status"
                            className="flex items-center gap-4 px-4 py-3 text-sm text-[#636E72] hover:bg-[#8BA4B4]/10 hover:text-[#5A7A8A] rounded-xl transition-all duration-200"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <div className="w-9 h-9 bg-[#8BA4B4]/10 rounded-xl flex items-center justify-center">
                              <svg className="w-5 h-5 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <span className="font-medium">내 인증 현황</span>
                              <p className="text-[10px] text-[#8BA4B4]">Certification Status</p>
                            </div>
                          </Link>

                          {session.user?.role === 'ADMIN' && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-4 px-4 py-3 text-sm text-[#636E72] hover:bg-[#8BA4B4]/10 hover:text-[#5A7A8A] rounded-xl transition-all duration-200"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <div className="w-9 h-9 bg-[#8BA4B4]/10 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <div>
                                <span className="font-medium">관리자 대시보드</span>
                                <p className="text-[10px] text-[#8BA4B4]">Admin Dashboard</p>
                              </div>
                            </Link>
                          )}

                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-4 px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                          >
                            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                            </div>
                            <div>
                              <span className="font-medium">로그아웃</span>
                              <p className="text-[10px] text-red-400">Sign Out</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className={`
                    px-6 py-2.5 rounded-full text-sm font-medium
                    bg-gradient-to-r from-[#7A9AAD] via-[#8BA4B4] to-[#9BB4C4]
                    text-white shadow-lg shadow-[#8BA4B4]/30
                    hover:shadow-xl hover:shadow-[#8BA4B4]/40
                    transition-all duration-300
                  `}
                >
                  로그인
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`
                md:hidden p-3 rounded-2xl
                transition-all duration-300
                ${mobileMenuOpen
                  ? 'bg-[#8BA4B4] text-white'
                  : scrolled
                    ? 'hover:bg-[#8BA4B4]/10 text-[#636E72]'
                    : 'hover:bg-white/40 text-[#5A7A8A]'
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
            <div className="md:hidden py-6 border-t border-[#E8E2D9]/50 animate-fadeIn">
              <div className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      px-5 py-4 rounded-2xl text-sm font-medium
                      transition-all duration-300
                      ${isActive(link.href)
                        ? 'bg-gradient-to-r from-[#7A9AAD] via-[#8BA4B4] to-[#9BB4C4] text-white shadow-lg shadow-[#8BA4B4]/30'
                        : 'text-[#636E72] hover:bg-[#8BA4B4]/10 hover:text-[#5A7A8A]'
                      }
                    `}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{link.label}</span>
                      <span className={`text-xs ${isActive(link.href) ? 'text-white/70' : 'text-[#8BA4B4]'}`}>
                        {link.labelEn}
                      </span>
                    </div>
                  </Link>
                ))}

                {/* Mobile Auth */}
                <div className="border-t border-[#E8E2D9]/50 pt-6 mt-4">
                  {session ? (
                    <>
                      <div className="flex items-center gap-4 px-5 py-4 mb-4 bg-gradient-to-r from-[#8BA4B4]/10 to-[#A8C5D4]/10 rounded-2xl">
                        {session.user?.image ? (
                          <img
                            src={session.user.image}
                            alt={getUserDisplayName()}
                            className="w-12 h-12 rounded-2xl object-cover shadow-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-[#7A9AAD] to-[#9BB4C4] text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg">
                            {getUserInitial()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[#2D3436]">{getUserDisplayName()}</p>
                          <p className="text-xs text-[#8BA4B4] font-medium">{session.user?.role || 'USER'}</p>
                        </div>
                      </div>

                      <Link
                        href="/certification/status"
                        className="flex items-center gap-3 px-5 py-4 text-sm font-medium text-[#636E72] hover:bg-[#8BA4B4]/10 rounded-2xl transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <svg className="w-5 h-5 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        내 인증 현황
                      </Link>

                      {session.user?.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-5 py-4 text-sm font-medium text-[#636E72] hover:bg-[#8BA4B4]/10 rounded-2xl transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <svg className="w-5 h-5 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          관리자 대시보드
                        </Link>
                      )}

                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        로그아웃
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/signin"
                      className="flex items-center justify-center gap-2 px-5 py-4 text-sm font-medium bg-gradient-to-r from-[#7A9AAD] via-[#8BA4B4] to-[#9BB4C4] text-white rounded-2xl shadow-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      로그인
                    </Link>
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

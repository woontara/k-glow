'use client';

import { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
}

export default function PageWrapper({ children, title, subtitle, badge }: PageWrapperProps) {
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

      <div className="font-body min-h-screen bg-[#FAF8F5]">
        {/* Decorative background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#8BA4B4]/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-[#E8B4B8]/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-gradient-to-br from-[#D4C4A8]/15 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative">
          {/* Page Header */}
          <div className="pt-8 pb-12 px-6">
            <div className="max-w-6xl mx-auto">
              {badge && (
                <span className="inline-block px-4 py-1.5 bg-[#8BA4B4]/10 text-[#5A7A8A] text-sm font-medium rounded-full mb-4">
                  {badge}
                </span>
              )}
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-[#2D3436] mb-3">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[#636E72] text-lg max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Page Content */}
          <div className="px-6 pb-16">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Reusable Card component
export function Card({
  children,
  className = '',
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-white/70 backdrop-blur-sm
        border border-white/50
        shadow-[0_4px_24px_rgba(139,164,180,0.1)]
        ${hover ? 'transition-all duration-300 hover:shadow-[0_8px_32px_rgba(139,164,180,0.15)] hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Info box component
export function InfoBox({
  children,
  variant = 'info',
  icon,
  title,
  className = '',
}: {
  children: ReactNode;
  variant?: 'info' | 'warning' | 'success';
  icon?: ReactNode;
  title?: string;
  className?: string;
}) {
  const variants = {
    info: {
      bg: 'bg-[#8BA4B4]/10',
      border: 'border-[#8BA4B4]/20',
      title: 'text-[#5A7A8A]',
      text: 'text-[#636E72]',
    },
    warning: {
      bg: 'bg-[#D4C4A8]/20',
      border: 'border-[#D4C4A8]/30',
      title: 'text-[#8B7355]',
      text: 'text-[#6B5D4D]',
    },
    success: {
      bg: 'bg-[#A4B4A8]/20',
      border: 'border-[#A4B4A8]/30',
      title: 'text-[#5A6B5A]',
      text: 'text-[#4A5A4A]',
    },
  };

  const v = variants[variant];

  return (
    <div className={`rounded-2xl ${v.bg} border ${v.border} p-5 ${className}`}>
      {title && (
        <div className={`flex items-center gap-2 font-semibold ${v.title} mb-3`}>
          {icon}
          {title}
        </div>
      )}
      <div className={v.text}>{children}</div>
    </div>
  );
}

// Stats component
export function StatsBar({ stats }: { stats: { label: string; value: string | number }[] }) {
  return (
    <div className="flex flex-wrap gap-8 p-6 rounded-2xl bg-gradient-to-r from-[#8BA4B4]/10 via-[#E8B4B8]/5 to-[#D4C4A8]/10 border border-[#8BA4B4]/10">
      {stats.map((stat, index) => (
        <div key={index}>
          <p className="text-sm text-[#8BA4B4] mb-1">{stat.label}</p>
          <p className="text-2xl font-bold text-[#2D3436] font-display">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

// Button component
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: 'bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white shadow-lg shadow-[#8BA4B4]/25 hover:shadow-xl hover:shadow-[#8BA4B4]/30 hover:-translate-y-0.5',
    secondary: 'bg-white/80 text-[#5A7A8A] border-2 border-[#8BA4B4]/30 hover:border-[#8BA4B4] hover:bg-white',
    ghost: 'text-[#636E72] hover:text-[#5A7A8A] hover:bg-[#8BA4B4]/10',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-full
        transition-all duration-300
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

// Input component
export function Input({
  label,
  className = '',
  ...props
}: {
  label?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[#5A7A8A] mb-2">{label}</label>
      )}
      <input
        className="w-full px-4 py-3 rounded-xl bg-white/80 border border-[#8BA4B4]/20 text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
        {...props}
      />
    </div>
  );
}

// Loading spinner
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} border-3 border-[#8BA4B4]/30 border-t-[#8BA4B4] rounded-full animate-spin`} />
  );
}

// Empty state
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-16 px-6 rounded-2xl bg-white/50 border border-[#8BA4B4]/10">
      {icon && <div className="mb-4 text-[#8BA4B4]">{icon}</div>}
      <h3 className="text-xl font-semibold text-[#2D3436] mb-2">{title}</h3>
      {description && <p className="text-[#636E72] mb-6 max-w-md mx-auto">{description}</p>}
      {action}
    </div>
  );
}

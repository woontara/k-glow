'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { QuoteItem, ShippingInfo, CertificationInfo, QuoteResult } from '@/lib/calculator';

// Liquid Blob Component
function LiquidBlob({ size, color, x, y, delay, duration }: {
  size: number;
  color: string;
  x: string;
  y: string;
  delay: number;
  duration: number;
}) {
  return (
    <div
      className="absolute rounded-full opacity-40 blur-3xl animate-liquid pointer-events-none"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        left: x,
        top: y,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  );
}

// Premium Card with Spotlight Effect
function PremiumCard({
  children,
  className = '',
  hover = true,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || !hover) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, [hover]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/40 shadow-xl transition-all duration-500 ${hover ? 'hover:shadow-2xl hover:border-[#8BA4B4]/30' : ''} ${className}`}
      style={{
        transform: hover && isHovered ? 'translateY(-4px)' : 'translateY(0)',
        ...style,
      }}
    >
      {/* Spotlight Effect */}
      {hover && isHovered && (
        <div
          className="absolute inset-0 opacity-30 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 200px at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 164, 180, 0.4), transparent)`,
          }}
        />
      )}

      {/* Glass Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  );
}

// Animated Number Component
function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const stepTime = duration / steps;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="font-bold tabular-nums">
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

// Shipping Option Card
function ShippingOptionCard({
  method,
  selected,
  onSelect,
  icon,
  title,
  subtitle,
}: {
  method: string;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <label
      className={`relative flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden ${
        selected
          ? 'bg-gradient-to-r from-[#8BA4B4]/20 to-[#A8C5D4]/20 border-2 border-[#8BA4B4]'
          : 'bg-white/40 border-2 border-white/60 hover:border-[#8BA4B4]/30'
      }`}
    >
      <input
        type="radio"
        name="shipping"
        value={method}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />

      {/* Selection Indicator */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
        selected
          ? 'bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] text-white shadow-lg shadow-[#8BA4B4]/30'
          : 'bg-[#F0F3F5] text-[#8BA4B4]'
      }`}>
        {icon}
      </div>

      <div className="flex-1">
        <p className={`font-semibold transition-colors ${selected ? 'text-[#5A7A8A]' : 'text-[#636E72]'}`}>
          {title}
        </p>
        <p className="text-sm text-[#9EA7AA]">{subtitle}</p>
      </div>

      {/* Check Mark */}
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
        selected
          ? 'border-[#8BA4B4] bg-[#8BA4B4]'
          : 'border-[#DDD]'
      }`}>
        {selected && (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </label>
  );
}

// Product Item Component
function ProductItem({
  item,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  item: QuoteItem;
  index: number;
  onUpdate: (field: keyof QuoteItem, value: string | number) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="relative p-5 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-2xl border border-white/60 transition-all duration-300 hover:shadow-lg hover:border-[#8BA4B4]/20 animate-reveal" style={{ animationDelay: `${index * 0.1}s` }}>
      {/* Product Number Badge */}
      <div className="absolute -top-3 left-5 px-3 py-1 bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white text-xs font-bold rounded-full shadow-lg">
        #{index + 1}
      </div>

      {/* Remove Button */}
      {canRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-3 right-5 w-7 h-7 bg-[#E8B4B8] text-white rounded-full flex items-center justify-center hover:bg-[#D4A4A8] transition-colors shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-[#8BA4B4] mb-2 uppercase tracking-wider">제품명</label>
          <input
            type="text"
            placeholder="예: 설화수 윤조에센스"
            value={item.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            className="w-full px-4 py-3 bg-white/80 border border-[#E8E2D9] rounded-xl text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all font-medium"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8BA4B4] mb-2 uppercase tracking-wider">수량</label>
          <input
            type="number"
            placeholder="0"
            value={item.quantity || ''}
            onChange={(e) => onUpdate('quantity', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-white/80 border border-[#E8E2D9] rounded-xl text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8BA4B4] mb-2 uppercase tracking-wider">단가 (원)</label>
          <input
            type="number"
            placeholder="0"
            value={item.priceKRW || ''}
            onChange={(e) => onUpdate('priceKRW', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-white/80 border border-[#E8E2D9] rounded-xl text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8BA4B4] mb-2 uppercase tracking-wider">무게 (kg)</label>
          <input
            type="number"
            step="0.1"
            placeholder="0.0"
            value={item.weight || ''}
            onChange={(e) => onUpdate('weight', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-white/80 border border-[#E8E2D9] rounded-xl text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8BA4B4] mb-2 uppercase tracking-wider">부피 (m³)</label>
          <input
            type="number"
            step="0.001"
            placeholder="0.000"
            value={item.volume || ''}
            onChange={(e) => onUpdate('volume', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-white/80 border border-[#E8E2D9] rounded-xl text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
          />
        </div>
      </div>

      {/* Item Total */}
      {item.priceKRW > 0 && item.quantity > 0 && (
        <div className="mt-4 pt-4 border-t border-[#E8E2D9]/50 flex justify-between items-center">
          <span className="text-sm text-[#9EA7AA]">소계</span>
          <span className="text-lg font-bold text-[#5A7A8A]">₩{(item.priceKRW * item.quantity).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

export default function CalculatorPage() {
  // 환율 정보
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [rateLoading, setRateLoading] = useState(true);

  // 제품 항목
  const [items, setItems] = useState<QuoteItem[]>([
    { name: '', quantity: 1, priceKRW: 0, weight: 0, volume: 0 },
  ]);

  // 배송 정보
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    method: 'sea',
    origin: '인천',
    destination: '모스크바',
    totalWeight: 0,
    totalVolume: 0,
  });

  // 인증 정보
  const [certificationInfo, setCertificationInfo] = useState<CertificationInfo>({
    type: 'NONE',
    productCount: 1,
  });

  // 견적 결과
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  // 환율 정보 로드
  useEffect(() => {
    async function loadExchangeRate() {
      try {
        const response = await fetch('/api/exchange-rate');
        const data = await response.json();
        setExchangeRate(data.krwToRub);
      } catch (error) {
        console.error('환율 조회 실패:', error);
        setExchangeRate(0.075); // 기본값
      } finally {
        setRateLoading(false);
      }
    }
    loadExchangeRate();
  }, []);

  // 제품 추가
  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, priceKRW: 0, weight: 0, volume: 0 }]);
  };

  // 제품 삭제
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // 제품 정보 업데이트
  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // 총 무게/부피 계산
  useEffect(() => {
    const totalWeight = items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
    const totalVolume = items.reduce((sum, item) => sum + item.volume * item.quantity, 0);
    setShippingInfo((prev) => ({ ...prev, totalWeight, totalVolume }));
  }, [items]);

  // 견적 계산
  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const response = await fetch('/api/calculate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingInfo,
          certificationInfo,
        }),
      });

      if (!response.ok) {
        throw new Error('견적 계산 실패');
      }

      const result = await response.json();
      setQuote(result);
    } catch (error) {
      console.error('견적 계산 오류:', error);
      alert('견적 계산에 실패했습니다');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAFBFC] via-[#F5F7F9] to-[#FAF8F5] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <LiquidBlob size={600} color="#A8C5D4" x="-10%" y="10%" delay={0} duration={25} />
        <LiquidBlob size={500} color="#E8B4B8" x="80%" y="60%" delay={2} duration={30} />
        <LiquidBlob size={400} color="#D4C4A8" x="50%" y="80%" delay={4} duration={20} />
      </div>

      {/* Grain Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Header */}
      <section className="relative pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#8BA4B4] hover:text-[#5A7A8A] transition-colors mb-8 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">홈으로</span>
          </Link>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8BA4B4]/10 to-[#A8C5D4]/10 rounded-full border border-[#8BA4B4]/20 mb-6">
              <span className="text-[#8BA4B4] font-medium text-sm tracking-wider uppercase">Calculator</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[#2D3436] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              수출 견적{' '}
              <span className="bg-gradient-to-r from-[#8BA4B4] via-[#A8C5D4] to-[#8BA4B4] bg-clip-text text-transparent">
                계산기
              </span>
            </h1>
            <p className="text-lg text-[#636E72] max-w-2xl mx-auto" style={{ fontFamily: 'Pretendard, sans-serif' }}>
              실시간 환율을 반영한 러시아 수출 견적을 자동으로 계산합니다
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Input Forms */}
            <div className="lg:col-span-2 space-y-8">

              {/* Exchange Rate Card */}
              <PremiumCard hover={false} className="animate-reveal">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] rounded-2xl flex items-center justify-center shadow-lg shadow-[#8BA4B4]/30">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-[#9EA7AA] uppercase tracking-wider font-medium">실시간 환율</p>
                      <p className="text-sm text-[#636E72]">Live Exchange Rate</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {rateLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#8BA4B4] border-t-transparent rounded-full animate-spin" />
                        <span className="text-[#9EA7AA]">조회 중...</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-2xl font-bold text-[#2D3436]">
                          1 KRW = <span className="bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] bg-clip-text text-transparent">{exchangeRate.toFixed(4)}</span> RUB
                        </p>
                        <p className="text-xs text-[#9EA7AA] mt-1">한국은행 기준 환율</p>
                      </div>
                    )}
                  </div>
                </div>
              </PremiumCard>

              {/* Products Section */}
              <PremiumCard hover={false} className="animate-reveal" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#D4C4A8] to-[#C4B498] rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#2D3436]" style={{ fontFamily: 'Playfair Display, serif' }}>제품 정보</h2>
                      <p className="text-sm text-[#9EA7AA]">Product Information</p>
                    </div>
                  </div>
                  <button
                    onClick={addItem}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white rounded-xl font-semibold shadow-lg shadow-[#8BA4B4]/25 hover:shadow-xl hover:shadow-[#8BA4B4]/30 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    제품 추가
                  </button>
                </div>

                <div className="space-y-6">
                  {items.map((item, index) => (
                    <ProductItem
                      key={index}
                      item={item}
                      index={index}
                      onUpdate={(field, value) => updateItem(index, field, value)}
                      onRemove={() => removeItem(index)}
                      canRemove={items.length > 1}
                    />
                  ))}
                </div>
              </PremiumCard>

              {/* Shipping Section */}
              <PremiumCard hover={false} className="animate-reveal" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#A4B4A8] to-[#94A498] rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#2D3436]" style={{ fontFamily: 'Playfair Display, serif' }}>배송 정보</h2>
                    <p className="text-sm text-[#9EA7AA]">Shipping Information</p>
                  </div>
                </div>

                {/* Shipping Method Selection */}
                <div className="space-y-4 mb-6">
                  <label className="block text-xs font-medium text-[#8BA4B4] uppercase tracking-wider">배송 방법</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ShippingOptionCard
                      method="sea"
                      selected={shippingInfo.method === 'sea'}
                      onSelect={() => setShippingInfo({ ...shippingInfo, method: 'sea' })}
                      icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      }
                      title="해상 운송"
                      subtitle="경제적, 2-4주 소요"
                    />
                    <ShippingOptionCard
                      method="air"
                      selected={shippingInfo.method === 'air'}
                      onSelect={() => setShippingInfo({ ...shippingInfo, method: 'air' })}
                      icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      }
                      title="항공 운송"
                      subtitle="신속 배송, 3-7일 소요"
                    />
                  </div>
                </div>

                {/* Origin & Destination */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-[#8BA4B4] mb-2 uppercase tracking-wider">출발지</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#8BA4B4]/10 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={shippingInfo.origin}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, origin: e.target.value })}
                        className="w-full pl-14 pr-4 py-3.5 bg-white/80 border border-[#E8E2D9] rounded-xl text-[#2D3436] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8BA4B4] mb-2 uppercase tracking-wider">도착지</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#E8B4B8]/10 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#E8B4B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={shippingInfo.destination}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, destination: e.target.value })}
                        className="w-full pl-14 pr-4 py-3.5 bg-white/80 border border-[#E8E2D9] rounded-xl text-[#2D3436] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Weight & Volume Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-[#8BA4B4]/10 to-[#A8C5D4]/10 rounded-xl border border-[#8BA4B4]/20">
                    <p className="text-xs text-[#8BA4B4] uppercase tracking-wider font-medium mb-1">총 무게</p>
                    <p className="text-2xl font-bold text-[#2D3436]">{shippingInfo.totalWeight.toFixed(2)} <span className="text-base font-normal text-[#9EA7AA]">kg</span></p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-[#D4C4A8]/10 to-[#C4B498]/10 rounded-xl border border-[#D4C4A8]/20">
                    <p className="text-xs text-[#D4C4A8] uppercase tracking-wider font-medium mb-1">총 부피</p>
                    <p className="text-2xl font-bold text-[#2D3436]">{shippingInfo.totalVolume.toFixed(3)} <span className="text-base font-normal text-[#9EA7AA]">m³</span></p>
                  </div>
                </div>
              </PremiumCard>

              {/* Certification Section */}
              <PremiumCard hover={false} className="animate-reveal" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#E8B4B8] to-[#D4A4A8] rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#2D3436]" style={{ fontFamily: 'Playfair Display, serif' }}>인증 정보</h2>
                    <p className="text-sm text-[#9EA7AA]">Certification Information</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-medium text-[#8BA4B4] mb-3 uppercase tracking-wider">인증 종류</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: 'NONE', label: '불필요', price: '무료' },
                        { value: 'EAC', label: 'EAC 인증', price: '50만원/제품' },
                        { value: 'GOST', label: 'GOST 인증', price: '30만원/제품' },
                        { value: 'BOTH', label: 'EAC+GOST', price: '70만원/제품' },
                      ].map((cert) => (
                        <label
                          key={cert.value}
                          className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 text-center ${
                            certificationInfo.type === cert.value
                              ? 'bg-gradient-to-br from-[#8BA4B4]/20 to-[#A8C5D4]/20 border-2 border-[#8BA4B4]'
                              : 'bg-white/60 border-2 border-white/60 hover:border-[#8BA4B4]/30'
                          }`}
                        >
                          <input
                            type="radio"
                            name="certification"
                            value={cert.value}
                            checked={certificationInfo.type === cert.value}
                            onChange={(e) => setCertificationInfo({ ...certificationInfo, type: e.target.value as CertificationInfo['type'] })}
                            className="sr-only"
                          />
                          <p className={`font-semibold ${certificationInfo.type === cert.value ? 'text-[#5A7A8A]' : 'text-[#636E72]'}`}>
                            {cert.label}
                          </p>
                          <p className="text-xs text-[#9EA7AA] mt-1">{cert.price}</p>
                        </label>
                      ))}
                    </div>
                  </div>

                  {certificationInfo.type !== 'NONE' && (
                    <div className="animate-reveal">
                      <label className="block text-xs font-medium text-[#8BA4B4] mb-2 uppercase tracking-wider">인증 제품 수</label>
                      <input
                        type="number"
                        value={certificationInfo.productCount}
                        onChange={(e) => setCertificationInfo({ ...certificationInfo, productCount: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-3.5 bg-white/80 border border-[#E8E2D9] rounded-xl text-[#2D3436] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
                        min="1"
                      />
                    </div>
                  )}
                </div>
              </PremiumCard>

              {/* Calculate Button */}
              <button
                onClick={handleCalculate}
                disabled={calculating || items.some((item) => !item.name || item.priceKRW <= 0)}
                className="w-full py-5 bg-gradient-to-r from-[#8BA4B4] via-[#9BB4C4] to-[#A8C5D4] text-white font-bold text-lg rounded-2xl shadow-xl shadow-[#8BA4B4]/30 hover:shadow-2xl hover:shadow-[#8BA4B4]/40 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 relative overflow-hidden group"
              >
                {/* Animated Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                {calculating ? (
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    계산 중...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    견적 계산하기
                  </span>
                )}
              </button>
            </div>

            {/* Right Column: Quote Result */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {quote ? (
                  <PremiumCard hover={false} className="animate-reveal">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#8BA4B4] to-[#A8C5D4] rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#2D3436]" style={{ fontFamily: 'Playfair Display, serif' }}>견적 결과</h2>
                        <p className="text-sm text-[#9EA7AA]">Quote Result</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Cost Breakdown */}
                      <div className="space-y-3">
                        <div className="flex justify-between py-3 border-b border-[#E8E2D9]/50">
                          <span className="text-[#636E72]">제품 합계</span>
                          <span className="font-semibold text-[#2D3436]">₩<AnimatedNumber value={quote.subtotal} /></span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-[#E8E2D9]/50">
                          <span className="text-[#636E72]">배송비 ({shippingInfo.method === 'air' ? '항공' : '해상'})</span>
                          <span className="font-semibold text-[#2D3436]">₩<AnimatedNumber value={quote.shippingCost} /></span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-[#E8E2D9]/50">
                          <span className="text-[#636E72]">관세 (6.5%)</span>
                          <span className="font-semibold text-[#2D3436]">₩<AnimatedNumber value={quote.customsDuty} /></span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-[#E8E2D9]/50">
                          <span className="text-[#636E72]">부가세 (20%)</span>
                          <span className="font-semibold text-[#2D3436]">₩<AnimatedNumber value={quote.vat} /></span>
                        </div>
                        {quote.certificationCost > 0 && (
                          <div className="flex justify-between py-3 border-b border-[#E8E2D9]/50">
                            <span className="text-[#636E72]">인증 비용</span>
                            <span className="font-semibold text-[#2D3436]">₩<AnimatedNumber value={quote.certificationCost} /></span>
                          </div>
                        )}
                      </div>

                      {/* Total KRW */}
                      <div className="pt-4 border-t-2 border-[#2D3436]">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-[#2D3436]">총 금액 (원화)</span>
                          <span className="text-2xl font-bold bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] bg-clip-text text-transparent">
                            ₩<AnimatedNumber value={quote.totalKRW} />
                          </span>
                        </div>
                      </div>

                      {/* Total RUB */}
                      <div className="p-5 bg-gradient-to-r from-[#8BA4B4]/10 via-[#9BB4C4]/10 to-[#A8C5D4]/10 rounded-2xl border border-[#8BA4B4]/20">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-[#8BA4B4] uppercase tracking-wider font-medium">총 금액 (루블)</p>
                            <p className="text-xs text-[#9EA7AA] mt-1">Russian Ruble</p>
                          </div>
                          <span className="text-3xl font-bold text-[#5A7A8A]">
                            ₽<AnimatedNumber value={quote.totalRUB} />
                          </span>
                        </div>
                      </div>

                      {/* Exchange Rate Note */}
                      <p className="text-center text-sm text-[#9EA7AA]">
                        적용 환율: 1 KRW = {quote.exchangeRate.toFixed(4)} RUB
                      </p>

                      {/* Download Button */}
                      <button
                        onClick={() => alert('PDF 다운로드 기능은 준비 중입니다')}
                        className="w-full py-4 border-2 border-[#8BA4B4] text-[#8BA4B4] font-semibold rounded-xl hover:bg-[#8BA4B4]/10 transition-all flex items-center justify-center gap-2 group"
                      >
                        <svg className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        견적서 PDF 다운로드
                      </button>
                    </div>
                  </PremiumCard>
                ) : (
                  <PremiumCard hover={false} className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#8BA4B4]/20 to-[#A8C5D4]/20 flex items-center justify-center">
                      <svg className="w-10 h-10 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-[#2D3436] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>견적 계산 대기 중</h3>
                    <p className="text-sm text-[#9EA7AA] mb-6">Waiting for Calculation</p>
                    <p className="text-sm text-[#636E72] max-w-xs mx-auto">
                      제품 정보를 입력하고 &quot;견적 계산하기&quot; 버튼을 눌러주세요
                    </p>
                  </PremiumCard>
                )}

                {/* Info Tips */}
                <div className="mt-6 p-5 bg-gradient-to-br from-[#D4C4A8]/20 to-[#C4B498]/10 rounded-2xl border border-[#D4C4A8]/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#D4C4A8] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[#5A7A8A] text-sm mb-2">견적 계산 안내</p>
                      <ul className="space-y-1.5 text-xs text-[#636E72]">
                        <li className="flex items-start gap-2">
                          <span className="text-[#D4C4A8] mt-0.5">•</span>
                          관세 6.5% 및 부가세 20% 자동 계산
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#D4C4A8] mt-0.5">•</span>
                          실제 견적과 다를 수 있습니다
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#D4C4A8] mt-0.5">•</span>
                          정확한 견적은 문의해주세요
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');

        @keyframes liquid {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: rotate(0deg) scale(1);
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
          }
          50% {
            border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%;
            transform: rotate(180deg) scale(1.1);
          }
          75% {
            border-radius: 60% 40% 60% 30% / 70% 30% 50% 60%;
          }
        }

        @keyframes reveal {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-liquid {
          animation: liquid 20s ease-in-out infinite;
        }

        .animate-reveal {
          animation: reveal 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </main>
  );
}

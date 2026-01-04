'use client';

import { useState, useEffect } from 'react';
import type { QuoteItem, ShippingInfo, CertificationInfo, QuoteResult } from '@/lib/calculator';
import { Card } from '@/components/ui/PageWrapper';

export default function CalculatorForm() {
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 좌측: 입력 폼 */}
      <div className="space-y-6">
        {/* 환율 정보 */}
        <Card hover={false} className="bg-gradient-to-r from-[#8BA4B4]/10 to-[#A8C5D4]/10 border-[#8BA4B4]/30">
          <h3 className="font-semibold text-[#2D3436] mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            실시간 환율
          </h3>
          {rateLoading ? (
            <p className="text-sm text-[#636E72]">환율 조회 중...</p>
          ) : (
            <p className="text-lg text-[#2D3436]">
              1 KRW = <span className="font-bold text-[#8BA4B4]">{exchangeRate.toFixed(4)}</span> RUB
            </p>
          )}
        </Card>

        {/* 제품 정보 */}
        <Card hover={false}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#2D3436] flex items-center gap-2">
              <svg className="w-5 h-5 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              제품 정보
            </h2>
            <button
              onClick={addItem}
              className="px-3 py-1.5 bg-[#8BA4B4] text-white rounded-lg hover:bg-[#7A9AAC] transition-colors text-sm font-medium"
            >
              + 제품 추가
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-medium text-[#5A7A8A] text-sm">제품 {index + 1}</span>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="text-[#E8B4B8] text-sm hover:text-[#D4A4A8] transition-colors"
                    >
                      삭제
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="제품명"
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    className="col-span-2 px-4 py-2.5 bg-white border border-[#E8E2D9] rounded-lg text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
                  />
                  <input
                    type="number"
                    placeholder="수량"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    className="px-4 py-2.5 bg-white border border-[#E8E2D9] rounded-lg text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
                  />
                  <input
                    type="number"
                    placeholder="가격(원)"
                    value={item.priceKRW || ''}
                    onChange={(e) => updateItem(index, 'priceKRW', parseInt(e.target.value) || 0)}
                    className="px-4 py-2.5 bg-white border border-[#E8E2D9] rounded-lg text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="무게(kg)"
                    value={item.weight || ''}
                    onChange={(e) => updateItem(index, 'weight', parseFloat(e.target.value) || 0)}
                    className="px-4 py-2.5 bg-white border border-[#E8E2D9] rounded-lg text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
                  />
                  <input
                    type="number"
                    step="0.001"
                    placeholder="부피(m³)"
                    value={item.volume || ''}
                    onChange={(e) => updateItem(index, 'volume', parseFloat(e.target.value) || 0)}
                    className="px-4 py-2.5 bg-white border border-[#E8E2D9] rounded-lg text-[#2D3436] placeholder-[#B2BEC3] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 배송 정보 */}
        <Card hover={false}>
          <h2 className="text-lg font-semibold text-[#2D3436] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            배송 정보
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#5A7A8A] mb-2">배송 방법</label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center justify-center gap-2 p-4 border rounded-xl cursor-pointer transition-all ${
                    shippingInfo.method === 'sea'
                      ? 'border-[#8BA4B4] bg-[#8BA4B4]/10 text-[#5A7A8A]'
                      : 'border-[#E8E2D9] hover:border-[#8BA4B4]/50 text-[#636E72]'
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value="sea"
                    checked={shippingInfo.method === 'sea'}
                    onChange={() => setShippingInfo({ ...shippingInfo, method: 'sea' })}
                    className="sr-only"
                  />
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8l4 4-4 4m4-4h10M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium">해상 운송</p>
                    <p className="text-xs opacity-70">저렴, 느림</p>
                  </div>
                </label>
                <label
                  className={`flex items-center justify-center gap-2 p-4 border rounded-xl cursor-pointer transition-all ${
                    shippingInfo.method === 'air'
                      ? 'border-[#8BA4B4] bg-[#8BA4B4]/10 text-[#5A7A8A]'
                      : 'border-[#E8E2D9] hover:border-[#8BA4B4]/50 text-[#636E72]'
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value="air"
                    checked={shippingInfo.method === 'air'}
                    onChange={() => setShippingInfo({ ...shippingInfo, method: 'air' })}
                    className="sr-only"
                  />
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium">항공 운송</p>
                    <p className="text-xs opacity-70">빠름, 비쌈</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#5A7A8A] mb-2">출발지</label>
                <input
                  type="text"
                  value={shippingInfo.origin}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, origin: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-[#2D3436] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5A7A8A] mb-2">도착지</label>
                <input
                  type="text"
                  value={shippingInfo.destination}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, destination: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-[#2D3436] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
                />
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl">
              <div className="flex justify-between text-sm">
                <span className="text-[#636E72]">총 무게</span>
                <span className="font-semibold text-[#2D3436]">{shippingInfo.totalWeight.toFixed(2)} kg</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-[#636E72]">총 부피</span>
                <span className="font-semibold text-[#2D3436]">{shippingInfo.totalVolume.toFixed(3)} m³</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 인증 정보 */}
        <Card hover={false}>
          <h2 className="text-lg font-semibold text-[#2D3436] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            인증 정보
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#5A7A8A] mb-2">인증 종류</label>
              <select
                value={certificationInfo.type}
                onChange={(e) =>
                  setCertificationInfo({
                    ...certificationInfo,
                    type: e.target.value as CertificationInfo['type'],
                  })
                }
                className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-[#2D3436] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
              >
                <option value="NONE">인증 불필요</option>
                <option value="EAC">EAC 인증 (500,000원/제품)</option>
                <option value="GOST">GOST 인증 (300,000원/제품)</option>
                <option value="BOTH">EAC + GOST (700,000원/제품)</option>
              </select>
            </div>

            {certificationInfo.type !== 'NONE' && (
              <div>
                <label className="block text-sm font-medium text-[#5A7A8A] mb-2">인증 제품 수</label>
                <input
                  type="number"
                  value={certificationInfo.productCount}
                  onChange={(e) =>
                    setCertificationInfo({
                      ...certificationInfo,
                      productCount: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl text-[#2D3436] focus:outline-none focus:border-[#8BA4B4] focus:ring-2 focus:ring-[#8BA4B4]/20 transition-all"
                  min="1"
                />
              </div>
            )}
          </div>
        </Card>

        {/* 계산 버튼 */}
        <button
          onClick={handleCalculate}
          disabled={calculating || items.some((item) => !item.name || item.priceKRW <= 0)}
          className="w-full py-4 bg-gradient-to-r from-[#8BA4B4] to-[#A8C5D4] text-white font-semibold rounded-xl shadow-lg shadow-[#8BA4B4]/25 hover:shadow-xl hover:shadow-[#8BA4B4]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {calculating ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              계산 중...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              견적 계산하기
            </span>
          )}
        </button>
      </div>

      {/* 우측: 견적 결과 */}
      <div>
        {quote ? (
          <Card hover={false} className="sticky top-24">
            <h2 className="text-xl font-semibold text-[#2D3436] mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              견적 결과
            </h2>

            <div className="space-y-4">
              {/* 제품 합계 */}
              <div className="flex justify-between pb-3 border-b border-[#E8E2D9]">
                <span className="text-[#636E72]">제품 합계</span>
                <span className="font-semibold text-[#2D3436]">₩{quote.subtotal.toLocaleString()}</span>
              </div>

              {/* 배송비 */}
              <div className="flex justify-between pb-3 border-b border-[#E8E2D9]">
                <span className="text-[#636E72]">배송비 ({shippingInfo.method === 'air' ? '항공' : '해상'})</span>
                <span className="font-semibold text-[#2D3436]">₩{quote.shippingCost.toLocaleString()}</span>
              </div>

              {/* 관세 */}
              <div className="flex justify-between pb-3 border-b border-[#E8E2D9]">
                <span className="text-[#636E72]">관세 (6.5%)</span>
                <span className="font-semibold text-[#2D3436]">₩{quote.customsDuty.toLocaleString()}</span>
              </div>

              {/* 부가세 */}
              <div className="flex justify-between pb-3 border-b border-[#E8E2D9]">
                <span className="text-[#636E72]">부가세 (20%)</span>
                <span className="font-semibold text-[#2D3436]">₩{quote.vat.toLocaleString()}</span>
              </div>

              {/* 인증 비용 */}
              {quote.certificationCost > 0 && (
                <div className="flex justify-between pb-3 border-b border-[#E8E2D9]">
                  <span className="text-[#636E72]">인증 비용</span>
                  <span className="font-semibold text-[#2D3436]">₩{quote.certificationCost.toLocaleString()}</span>
                </div>
              )}

              {/* 총액 (KRW) */}
              <div className="flex justify-between pt-4 pb-3 border-t-2 border-[#2D3436]">
                <span className="text-lg font-bold text-[#2D3436]">총 금액 (원화)</span>
                <span className="text-xl font-bold text-[#8BA4B4]">
                  ₩{quote.totalKRW.toLocaleString()}
                </span>
              </div>

              {/* 총액 (RUB) */}
              <div className="flex justify-between p-4 bg-gradient-to-r from-[#8BA4B4]/10 to-[#A8C5D4]/10 rounded-xl">
                <span className="text-lg font-bold text-[#2D3436]">총 금액 (루블)</span>
                <span className="text-xl font-bold text-[#8BA4B4]">
                  ₽{quote.totalRUB.toLocaleString()}
                </span>
              </div>

              {/* 환율 정보 */}
              <p className="text-sm text-[#636E72] text-center mt-4">
                적용 환율: 1 KRW = {quote.exchangeRate.toFixed(4)} RUB
              </p>
            </div>

            {/* 다운로드 버튼 */}
            <button
              onClick={() => alert('PDF 다운로드 기능은 준비 중입니다')}
              className="w-full mt-6 py-3 border-2 border-[#8BA4B4] text-[#8BA4B4] font-semibold rounded-xl hover:bg-[#8BA4B4]/10 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              견적서 PDF 다운로드
            </button>
          </Card>
        ) : (
          <Card hover={false} className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#8BA4B4]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#8BA4B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-[#2D3436] mb-2">견적 계산 대기 중</p>
            <p className="text-sm text-[#636E72]">좌측 폼을 작성하고 &quot;견적 계산하기&quot; 버튼을 눌러주세요</p>
          </Card>
        )}
      </div>
    </div>
  );
}

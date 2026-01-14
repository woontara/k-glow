'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BillingSettings {
  creditBalance: number;
  autoRecharge: boolean;
  rechargeThreshold: number;
  rechargeAmount: number;
  hasPaymentMethod: boolean;
}

interface PaymentMethod {
  billingKey: string;
  card: {
    brand: string;
    last4: string;
  } | null;
}

interface CreditLog {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  balanceAfter: number;
  createdAt: string;
}

interface AiModel {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  pricePerUse: number;
}

const categoryLabels: Record<string, { icon: string; color: string }> = {
  BACKGROUND_REMOVAL: { icon: '✂️', color: 'bg-blue-100 text-blue-700' },
  UPSCALING: { icon: '🔍', color: 'bg-green-100 text-green-700' },
  VIDEO_GENERATION: { icon: '🎬', color: 'bg-orange-100 text-orange-700' },
  TEXT_TO_SPEECH: { icon: '🎙️', color: 'bg-pink-100 text-pink-700' },
  IMAGE_GENERATION: { icon: '🎨', color: 'bg-purple-100 text-purple-700' },
};

// USD to KRW 환율 (약 1,400원/$)
const USD_KRW_RATE = 1400;

// USD를 KRW로 변환하고 포맷팅
const formatKRW = (usd: number): string => {
  const krw = Math.round(usd * USD_KRW_RATE);
  return krw.toLocaleString('ko-KR');
};

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [settings, setSettings] = useState<BillingSettings | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [creditLogs, setCreditLogs] = useState<CreditLog[]>([]);
  const [aiModels, setAiModels] = useState<AiModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [charging, setCharging] = useState(false);
  const [chargeAmount, setChargeAmount] = useState(15);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'pricing'>('overview');

  // 설정 폼 상태
  const [formData, setFormData] = useState({
    autoRecharge: false,
    rechargeThreshold: 2,
    rechargeAmount: 15,
  });

  const fetchData = useCallback(async () => {
    try {
      const [settingsRes, methodsRes, logsRes, modelsRes] = await Promise.all([
        fetch('/api/billing/settings'),
        fetch('/api/billing/payment-methods'),
        fetch('/api/billing/logs'),
        fetch('/api/ai-tools'),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data);
        setFormData({
          autoRecharge: data.autoRecharge,
          rechargeThreshold: data.rechargeThreshold,
          rechargeAmount: data.rechargeAmount,
        });
      }

      if (methodsRes.ok) {
        const data = await methodsRes.json();
        setPaymentMethod(data.paymentMethod);
      }

      if (logsRes.ok) {
        const data = await logsRes.json();
        setCreditLogs(data.logs || []);
      }

      if (modelsRes.ok) {
        const data = await modelsRes.json();
        setAiModels(data.models || []);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router, fetchData]);

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/billing/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '설정이 저장되었습니다' });
        fetchData();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || '설정 저장에 실패했습니다' });
      }
    } catch {
      setMessage({ type: 'error', text: '설정 저장 중 오류가 발생했습니다' });
    } finally {
      setSaving(false);
    }
  };

  const handleCharge = async () => {
    setCharging(true);
    setMessage(null);

    try {
      const res = await fetch('/api/billing/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: chargeAmount }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({ type: 'success', text: `$${chargeAmount} 충전 완료! 현재 잔액: $${data.creditBalance.toFixed(2)}` });
        fetchData();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || '충전에 실패했습니다' });
      }
    } catch {
      setMessage({ type: 'error', text: '충전 중 오류가 발생했습니다' });
    } finally {
      setCharging(false);
    }
  };

  const handleDeletePaymentMethod = async () => {
    if (!confirm('결제 수단을 삭제하시겠습니까?\n자동 충전이 비활성화됩니다.')) return;

    try {
      const res = await fetch('/api/billing/payment-methods', {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '결제 수단이 삭제되었습니다' });
        fetchData();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || '삭제에 실패했습니다' });
      }
    } catch {
      setMessage({ type: 'error', text: '삭제 중 오류가 발생했습니다' });
    }
  };

  const handleRegisterPaymentMethod = async () => {
    try {
      const configRes = await fetch('/api/billing/setup-intent');
      if (!configRes.ok) {
        setMessage({ type: 'error', text: '설정을 불러올 수 없습니다' });
        return;
      }

      const { storeId, channelKey } = await configRes.json();

      if (!storeId || !channelKey) {
        setMessage({ type: 'error', text: 'PortOne 설정이 완료되지 않았습니다. 관리자에게 문의하세요.' });
        return;
      }

      const PortOne = await import('@portone/browser-sdk/v2');

      const response = await PortOne.requestIssueBillingKey({
        storeId,
        channelKey,
        billingKeyMethod: 'CARD',
        customer: {
          email: session?.user?.email || undefined,
        },
      });

      if (!response || response.code) {
        setMessage({ type: 'error', text: response?.message || '카드 등록에 실패했습니다' });
        return;
      }

      const saveRes = await fetch('/api/billing/setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingKey: response.billingKey }),
      });

      if (saveRes.ok) {
        setMessage({ type: 'success', text: '결제 수단이 등록되었습니다' });
        fetchData();
      } else {
        const data = await saveRes.json();
        setMessage({ type: 'error', text: data.error || '결제 수단 저장에 실패했습니다' });
      }
    } catch (error) {
      console.error('결제 수단 등록 오류:', error);
      setMessage({ type: 'error', text: '결제 수단 등록 중 오류가 발생했습니다' });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, { style: string; label: string }> = {
      CHARGE: { style: 'bg-green-100 text-green-700', label: '충전' },
      AUTO_CHARGE: { style: 'bg-blue-100 text-blue-700', label: '자동충전' },
      USAGE: { style: 'bg-orange-100 text-orange-700', label: 'AI 사용' },
      REFUND: { style: 'bg-purple-100 text-purple-700', label: '환불' },
      ADMIN_ADJUST: { style: 'bg-gray-100 text-gray-700', label: '관리자' },
    };
    return styles[type] || { style: 'bg-gray-100 text-gray-700', label: type };
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-white to-[#f0f4f8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8BA4B4] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-white to-[#f0f4f8] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">결제 및 크레딧</h1>
            <p className="text-gray-600 mt-1">AI 도구 사용을 위한 크레딧을 관리하세요</p>
          </div>
          <Link
            href="/ai-tools"
            className="px-4 py-2 bg-gradient-to-r from-[#8BA4B4] to-[#6B8A9A] text-white rounded-lg hover:from-[#7A939C] hover:to-[#5A7989] transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI 도구 사용하기
          </Link>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {message.text}
          </div>
        )}

        {/* 크레딧 잔액 카드 */}
        <div className="bg-gradient-to-r from-[#3d5a80] to-[#2d4a70] rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-white/70 text-sm mb-1">현재 크레딧 잔액</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">
                  ${settings?.creditBalance.toFixed(2) || '0.00'}
                </span>
                <span className="text-white/70">USD</span>
              </div>
              <p className="text-white/60 text-lg mt-1">
                약 ₩{formatKRW(settings?.creditBalance || 0)}
              </p>
              {settings?.autoRecharge && (
                <p className="mt-3 text-sm text-white/80 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  자동 충전 활성화됨 (${settings.rechargeThreshold} 이하 → ${settings.rechargeAmount} 충전)
                </p>
              )}
            </div>

            {settings?.hasPaymentMethod && (
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(Number(e.target.value))}
                  className="bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value={5} className="text-gray-900">$5 (₩{formatKRW(5)})</option>
                  <option value={10} className="text-gray-900">$10 (₩{formatKRW(10)})</option>
                  <option value={15} className="text-gray-900">$15 (₩{formatKRW(15)})</option>
                  <option value={25} className="text-gray-900">$25 (₩{formatKRW(25)})</option>
                  <option value={50} className="text-gray-900">$50 (₩{formatKRW(50)})</option>
                  <option value={100} className="text-gray-900">$100 (₩{formatKRW(100)})</option>
                </select>
                <button
                  onClick={handleCharge}
                  disabled={charging}
                  className="px-6 py-3 bg-white text-[#3d5a80] font-semibold rounded-lg hover:bg-white/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {charging ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#3d5a80] border-t-transparent" />
                      충전 중...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      충전하기
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-[#3d5a80] border-b-2 border-[#3d5a80] bg-[#3d5a80]/5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              결제 설정
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-[#3d5a80] border-b-2 border-[#3d5a80] bg-[#3d5a80]/5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              사용 내역
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'pricing'
                  ? 'text-[#3d5a80] border-b-2 border-[#3d5a80] bg-[#3d5a80]/5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              AI 도구 가격표
            </button>
          </div>

          {/* 결제 설정 탭 */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* 결제 수단 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 수단</h3>
                {paymentMethod?.card ? (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-10 bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg flex items-center justify-center shadow">
                        <svg className="w-8 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{paymentMethod.card.brand}</p>
                        <p className="text-sm text-gray-500">**** **** **** {paymentMethod.card.last4}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleDeletePaymentMethod}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      삭제
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-4">등록된 결제 수단이 없습니다</p>
                    <button
                      onClick={handleRegisterPaymentMethod}
                      className="px-6 py-3 bg-[#3d5a80] text-white rounded-lg hover:bg-[#2d4a70] transition-colors font-medium"
                    >
                      카드 등록하기
                    </button>
                  </div>
                )}
              </div>

              {/* 자동 충전 설정 */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">자동 충전 설정</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">자동 충전</p>
                      <p className="text-sm text-gray-500">잔액이 임계값 이하로 떨어지면 자동으로 충전합니다</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.autoRecharge}
                        onChange={(e) => setFormData({ ...formData, autoRecharge: e.target.checked })}
                        className="sr-only peer"
                        disabled={!settings?.hasPaymentMethod}
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#3d5a80]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3d5a80]"></div>
                    </label>
                  </div>

                  {formData.autoRecharge && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          충전 임계값 (USD)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={formData.rechargeThreshold}
                          onChange={(e) => setFormData({ ...formData, rechargeThreshold: Number(e.target.value) })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#3d5a80] focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">잔액이 이 금액 이하로 떨어지면 자동 충전</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          충전 금액 (USD)
                        </label>
                        <select
                          value={formData.rechargeAmount}
                          onChange={(e) => setFormData({ ...formData, rechargeAmount: Number(e.target.value) })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#3d5a80] focus:border-transparent"
                        >
                          <option value={5}>$5</option>
                          <option value={10}>$10</option>
                          <option value={15}>$15</option>
                          <option value={25}>$25</option>
                          <option value={50}>$50</option>
                          <option value={100}>$100</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">자동 충전 시 충전되는 금액</p>
                      </div>
                    </div>
                  )}

                  {!settings?.hasPaymentMethod && (
                    <p className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg">
                      자동 충전을 사용하려면 먼저 결제 수단을 등록해주세요
                    </p>
                  )}

                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="w-full py-3 bg-[#3d5a80] text-white rounded-lg hover:bg-[#2d4a70] disabled:opacity-50 transition-colors font-medium"
                  >
                    {saving ? '저장 중...' : '설정 저장'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 사용 내역 탭 */}
          {activeTab === 'history' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">크레딧 사용 내역</h3>
              {creditLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>아직 사용 내역이 없습니다</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">일시</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">유형</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">설명</th>
                        <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">금액</th>
                        <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">잔액</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {creditLogs.map((log) => {
                        const typeInfo = getTypeBadge(log.type);
                        return (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {formatDate(log.createdAt)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeInfo.style}`}>
                                {typeInfo.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {log.description || '-'}
                            </td>
                            <td className={`px-4 py-3 text-right ${log.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              <div className="font-medium">{log.amount >= 0 ? '+' : ''}${log.amount.toFixed(2)}</div>
                              <div className="text-xs opacity-70">₩{formatKRW(Math.abs(log.amount))}</div>
                            </td>
                            <td className="px-4 py-3 text-right text-gray-600">
                              <div>${log.balanceAfter.toFixed(2)}</div>
                              <div className="text-xs text-gray-400">₩{formatKRW(log.balanceAfter)}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* AI 도구 가격표 탭 */}
          {activeTab === 'pricing' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 도구 가격표</h3>
              <p className="text-gray-500 text-sm mb-6">각 AI 도구 사용 시 차감되는 크레딧입니다</p>

              <div className="grid md:grid-cols-2 gap-4">
                {aiModels.map((model) => {
                  const catConfig = categoryLabels[model.category] || { icon: '🤖', color: 'bg-gray-100 text-gray-700' };
                  return (
                    <div key={model.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl ${catConfig.color}`}>
                          {catConfig.icon}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{model.name}</p>
                          <p className="text-sm text-gray-500">{model.nameEn}</p>
                        </div>
                      </div>
                      {model.pricePerUse > 0 ? (
                        <div className="text-right">
                          <div className="text-lg font-bold text-emerald-600">
                            ₩{formatKRW(model.pricePerUse)}
                          </div>
                          <div className="text-xs text-gray-400">
                            ${model.pricePerUse.toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          무료
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {aiModels.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>등록된 AI 도구가 없습니다</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [settings, setSettings] = useState<BillingSettings | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [charging, setCharging] = useState(false);
  const [chargeAmount, setChargeAmount] = useState(15);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 설정 폼 상태
  const [formData, setFormData] = useState({
    autoRecharge: false,
    rechargeThreshold: 2,
    rechargeAmount: 15,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const [settingsRes, methodsRes] = await Promise.all([
        fetch('/api/billing/settings'),
        fetch('/api/billing/payment-methods'),
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
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

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
    if (!confirm('결제 수단을 삭제하시겠습니까?')) return;

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
    // PortOne SDK로 빌링키 발급
    try {
      // 설정 정보 가져오기
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

      // PortOne Browser SDK 동적 로드
      const PortOne = await import('@portone/browser-sdk/v2');

      // 빌링키 발급 요청
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

      // 빌링키 저장
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

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3d5a80]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">결제 설정</h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 크레딧 잔액 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">크레딧 잔액</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#3d5a80]">
              ${settings?.creditBalance.toFixed(2) || '0.00'}
            </span>
            <span className="text-gray-500">USD</span>
          </div>

          {settings?.hasPaymentMethod && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">수동 충전</h3>
              <div className="flex gap-3">
                <select
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value={5}>$5</option>
                  <option value={10}>$10</option>
                  <option value={15}>$15</option>
                  <option value={25}>$25</option>
                  <option value={50}>$50</option>
                  <option value={100}>$100</option>
                </select>
                <button
                  onClick={handleCharge}
                  disabled={charging}
                  className="px-4 py-2 bg-[#3d5a80] text-white rounded-lg hover:bg-[#2d4a70] disabled:opacity-50 transition-colors"
                >
                  {charging ? '충전 중...' : '충전하기'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 결제 수단 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">결제 수단</h2>

          {paymentMethod?.card ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-gradient-to-r from-gray-700 to-gray-900 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">CARD</span>
                </div>
                <div>
                  <p className="font-medium">{paymentMethod.card.brand}</p>
                  <p className="text-sm text-gray-500">**** **** **** {paymentMethod.card.last4}</p>
                </div>
              </div>
              <button
                onClick={handleDeletePaymentMethod}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                삭제
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">등록된 결제 수단이 없습니다</p>
              <button
                onClick={handleRegisterPaymentMethod}
                className="px-6 py-3 bg-[#3d5a80] text-white rounded-lg hover:bg-[#2d4a70] transition-colors"
              >
                카드 등록하기
              </button>
            </div>
          )}
        </div>

        {/* 자동 충전 설정 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">자동 충전 설정</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">자동 충전</p>
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#3d5a80]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3d5a80]"></div>
              </label>
            </div>

            {formData.autoRecharge && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    충전 임계값 (USD)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">잔액이 이 금액 이하로 떨어지면 자동 충전됩니다</p>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.rechargeThreshold}
                    onChange={(e) => setFormData({ ...formData, rechargeThreshold: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    충전 금액 (USD)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">자동 충전 시 충전되는 금액입니다</p>
                  <select
                    value={formData.rechargeAmount}
                    onChange={(e) => setFormData({ ...formData, rechargeAmount: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value={5}>$5</option>
                    <option value={10}>$10</option>
                    <option value={15}>$15</option>
                    <option value={25}>$25</option>
                    <option value={50}>$50</option>
                    <option value={100}>$100</option>
                  </select>
                </div>
              </>
            )}

            {!settings?.hasPaymentMethod && (
              <p className="text-amber-600 text-sm">
                자동 충전을 사용하려면 먼저 결제 수단을 등록해주세요
              </p>
            )}

            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full py-3 bg-[#3d5a80] text-white rounded-lg hover:bg-[#2d4a70] disabled:opacity-50 transition-colors"
            >
              {saving ? '저장 중...' : '설정 저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

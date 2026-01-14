'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  creditBalance: number;
  autoRecharge: boolean;
  rechargeThreshold: number;
  rechargeAmount: number;
  billingKey: string | null;
  createdAt: string;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface CreditLog {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  balanceAfter: number;
  createdAt: string;
}

interface UsageByModel {
  modelId: string;
  modelName: string;
  pricePerUse: number;
  count: number;
  totalCost: number;
}

export default function UserBillingDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [creditLogs, setCreditLogs] = useState<CreditLog[]>([]);
  const [usageByModel, setUsageByModel] = useState<UsageByModel[]>([]);
  const [summary, setSummary] = useState({ totalUsageCount: 0, totalUsageAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'payments' | 'credits' | 'usage'>('credits');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/');
      } else {
        fetchData();
      }
    }
  }, [status, session, router, userId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/billing/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setPayments(data.payments);
        setCreditLogs(data.creditLogs);
        setUsageByModel(data.usageByModel);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      COMPLETED: 'bg-green-100 text-green-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      FAILED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-gray-100 text-gray-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3d5a80]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">사용자를 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/admin/billing"
              className="text-sm text-[#3d5a80] hover:text-[#2d4a70] mb-2 inline-block"
            >
              ← 과금 관리로 돌아가기
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* 사용자 정보 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">현재 잔액</p>
            <p className="text-2xl font-bold text-[#3d5a80]">
              ${user.creditBalance.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">자동 충전</p>
            <p className="text-lg font-medium">
              {user.autoRecharge ? (
                <span className="text-green-600">
                  ON (${user.rechargeThreshold} 이하 → ${user.rechargeAmount} 충전)
                </span>
              ) : (
                <span className="text-gray-400">OFF</span>
              )}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">총 AI 사용</p>
            <p className="text-2xl font-bold text-gray-700">
              {summary.totalUsageCount}회
            </p>
            <p className="text-sm text-gray-500">
              (${summary.totalUsageAmount.toFixed(2)})
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">결제 수단</p>
            <p className="text-lg font-medium">
              {user.billingKey ? (
                <span className="text-green-600">등록됨</span>
              ) : (
                <span className="text-gray-400">없음</span>
              )}
            </p>
          </div>
        </div>

        {/* 탭 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('credits')}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === 'credits'
                  ? 'text-[#3d5a80] border-b-2 border-[#3d5a80]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              크레딧 내역
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === 'payments'
                  ? 'text-[#3d5a80] border-b-2 border-[#3d5a80]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              결제 내역
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === 'usage'
                  ? 'text-[#3d5a80] border-b-2 border-[#3d5a80]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              AI 사용 통계
            </button>
          </div>

          {/* 크레딧 내역 */}
          {activeTab === 'credits' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">일시</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">유형</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">설명</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">금액</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">잔액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {creditLogs.map((log) => {
                    const typeInfo = getTypeBadge(log.type);
                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeInfo.style}`}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {log.description || '-'}
                        </td>
                        <td className={`px-6 py-4 text-right font-medium ${log.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {log.amount >= 0 ? '+' : ''}${log.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          ${log.balanceAfter.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                  {creditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        크레딧 내역이 없습니다
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 결제 내역 */}
          {activeTab === 'payments' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">일시</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">설명</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">금액</th>
                    <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">상태</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">완료일시</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        ${payment.amount.toFixed(2)} {payment.currency}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.completedAt ? formatDate(payment.completedAt) : '-'}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        결제 내역이 없습니다
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* AI 사용 통계 */}
          {activeTab === 'usage' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {usageByModel.map((usage) => (
                  <div key={usage.modelId} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{usage.modelName}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">사용 횟수</span>
                        <span className="font-medium">{usage.count}회</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">단가</span>
                        <span>${usage.pricePerUse.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 mt-1">
                        <span className="text-gray-500">총 비용</span>
                        <span className="font-medium text-[#3d5a80]">${usage.totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {usageByModel.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    AI 사용 기록이 없습니다
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

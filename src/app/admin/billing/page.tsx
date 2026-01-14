'use client';

import { useState, useEffect, useCallback } from 'react';
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
  billingKey: string | null;
  createdAt: string;
  _count: {
    payments: number;
    aiUsageLogs: number;
  };
}

interface Stats {
  totalCreditBalance: number;
  avgCreditBalance: number;
  totalPaymentAmount: number;
  totalPaymentCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminBillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustDescription, setAdjustDescription] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = useCallback(async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
      });

      const res = await fetch(`/api/admin/billing?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setStats(data.stats);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [search]);

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
  }, [status, session, router, fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1);
  };

  const handleAdjustCredit = async () => {
    if (!selectedUser || !adjustAmount) return;

    const amount = parseFloat(adjustAmount);
    if (isNaN(amount)) {
      setMessage({ type: 'error', text: '유효한 금액을 입력하세요' });
      return;
    }

    setAdjusting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount,
          description: adjustDescription || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({ type: 'success', text: data.message });
        setSelectedUser(null);
        setAdjustAmount('');
        setAdjustDescription('');
        fetchData(pagination.page);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: '크레딧 조정에 실패했습니다' });
    } finally {
      setAdjusting(false);
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
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">과금 관리</h1>
          <Link
            href="/admin"
            className="text-[#3d5a80] hover:text-[#2d4a70]"
          >
            ← Admin 대시보드
          </Link>
        </div>

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

        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500 mb-1">총 크레딧 잔액</p>
              <p className="text-2xl font-bold text-[#3d5a80]">
                ${stats.totalCreditBalance.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500 mb-1">평균 잔액</p>
              <p className="text-2xl font-bold text-[#3d5a80]">
                ${stats.avgCreditBalance.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500 mb-1">총 결제 금액</p>
              <p className="text-2xl font-bold text-green-600">
                ${stats.totalPaymentAmount.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500 mb-1">총 결제 건수</p>
              <p className="text-2xl font-bold text-gray-700">
                {stats.totalPaymentCount}건
              </p>
            </div>
          </div>
        )}

        {/* 검색 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이메일 또는 이름으로 검색..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-[#3d5a80] text-white rounded-lg hover:bg-[#2d4a70]"
            >
              검색
            </button>
          </form>
        </div>

        {/* 사용자 목록 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">사용자</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">역할</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">크레딧 잔액</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">자동충전</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">결제수단</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">AI 사용</th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-medium ${user.creditBalance > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      ${user.creditBalance.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.autoRecharge ? (
                      <span className="text-green-600">ON</span>
                    ) : (
                      <span className="text-gray-400">OFF</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.billingKey ? (
                      <span className="text-green-600">등록됨</span>
                    ) : (
                      <span className="text-gray-400">없음</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    {user._count.aiUsageLogs}회
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-[#3d5a80] hover:text-[#2d4a70] text-sm font-medium"
                      >
                        조정
                      </button>
                      <Link
                        href={`/admin/billing/${user.id}`}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                      >
                        상세
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 border-t">
              <button
                onClick={() => fetchData(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                이전
              </button>
              <span className="text-sm text-gray-500">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchData(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                다음
              </button>
            </div>
          )}
        </div>

        {/* 크레딧 조정 모달 */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold mb-4">크레딧 조정</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-500">대상 사용자</p>
                <p className="font-medium">{selectedUser.email}</p>
                <p className="text-sm text-gray-500 mt-2">현재 잔액</p>
                <p className="font-medium text-lg">${selectedUser.creditBalance.toFixed(2)}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  조정 금액 (USD)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  양수: 크레딧 추가, 음수: 크레딧 차감
                </p>
                <input
                  type="number"
                  step="0.01"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="예: 10 또는 -5"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사유 (선택)
                </label>
                <input
                  type="text"
                  value={adjustDescription}
                  onChange={(e) => setAdjustDescription(e.target.value)}
                  placeholder="조정 사유를 입력하세요"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setAdjustAmount('');
                    setAdjustDescription('');
                  }}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleAdjustCredit}
                  disabled={adjusting || !adjustAmount}
                  className="flex-1 py-2 bg-[#3d5a80] text-white rounded-lg hover:bg-[#2d4a70] disabled:opacity-50"
                >
                  {adjusting ? '처리 중...' : '조정하기'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

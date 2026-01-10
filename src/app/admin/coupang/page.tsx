'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardData {
  overview: {
    totalProducts: number;
    revenue30d: number;
    revenue7d: number;
    orders30d: number;
    orders7d: number;
    ordersByStatus: Record<string, number>;
  };
  charts: {
    dailyOrders: Array<{ date: string; orders: number; revenue: number }>;
  };
  bestSellers: Array<{
    sellerProductId: number;
    sellerProductName: string;
    count: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    orderId: number;
    orderedAt: string;
    status: string;
    totalPaymentPrice: number;
    receiverName: string;
    itemCount: number;
  }>;
  recentProducts: Array<{
    sellerProductId: number;
    sellerProductName: string;
    brand: string;
    statusName: string;
  }>;
}

const STATUS_LABELS: Record<string, string> = {
  'ACCEPT': '결제완료',
  'INSTRUCT': '상품준비중',
  'DEPARTURE': '배송지시',
  'DELIVERING': '배송중',
  'FINAL_DELIVERY': '배송완료',
  'NONE_TRACKING': '송장미입력',
};

const STATUS_COLORS: Record<string, string> = {
  'ACCEPT': 'bg-blue-100 text-blue-800',
  'INSTRUCT': 'bg-yellow-100 text-yellow-800',
  'DEPARTURE': 'bg-indigo-100 text-indigo-800',
  'DELIVERING': 'bg-purple-100 text-purple-800',
  'FINAL_DELIVERY': 'bg-green-100 text-green-800',
  'NONE_TRACKING': 'bg-gray-100 text-gray-800',
};

export default function CoupangDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coupang/dashboard');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '데이터 로드 실패');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E83F33] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-600 text-lg font-medium mb-2">오류 발생</div>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxOrders = Math.max(...data.charts.dailyOrders.map(d => d.orders), 1);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
              ← 관리자
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E83F33] to-[#C62828] rounded-lg flex items-center justify-center text-white text-sm font-bold">
              CP
            </div>
            쿠팡 대시보드
          </h1>
        </div>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-[#E83F33] text-white rounded-lg hover:bg-[#C62828] transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          새로고침
        </button>
      </div>

      {/* 개요 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">등록 상품</div>
          <div className="text-2xl font-bold text-gray-900">{data.overview.totalProducts}</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">30일 주문</div>
          <div className="text-2xl font-bold text-gray-900">{data.overview.orders30d}</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">30일 매출</div>
          <div className="text-2xl font-bold text-[#E83F33]">{formatCurrency(data.overview.revenue30d)}</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">7일 매출</div>
          <div className="text-2xl font-bold text-[#E83F33]">{formatCurrency(data.overview.revenue7d)}</div>
        </div>
      </div>

      {/* 주문 상태 */}
      {Object.keys(data.overview.ordersByStatus).length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">주문 상태별 현황</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(data.overview.ordersByStatus).map(([status, count]) => (
              <div
                key={status}
                className={`px-4 py-2 rounded-lg ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}`}
              >
                <span className="font-medium">{STATUS_LABELS[status] || status}</span>
                <span className="ml-2 font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* 일별 주문 차트 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 7일 주문 추이</h2>
          <div className="h-48 flex items-end gap-2">
            {data.charts.dailyOrders.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center mb-2">
                  <div className="text-xs text-gray-500 mb-1">{day.orders}</div>
                  <div
                    className="w-full bg-gradient-to-t from-[#E83F33] to-[#FF6B5E] rounded-t-lg transition-all duration-300"
                    style={{
                      height: `${(day.orders / maxOrders) * 120}px`,
                      minHeight: day.orders > 0 ? '8px' : '2px',
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">{formatDate(day.date)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 베스트셀러 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">베스트셀러 (30일)</h2>
          {data.bestSellers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">판매 데이터가 없습니다</p>
          ) : (
            <div className="space-y-3">
              {data.bestSellers.slice(0, 5).map((product, index) => (
                <div key={product.sellerProductId} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-amber-600 text-amber-100' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {product.sellerProductName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.count}개 판매 · {formatCurrency(product.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 최근 주문 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 주문</h2>
        {data.recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">최근 주문이 없습니다</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 font-medium">주문번호</th>
                  <th className="pb-3 font-medium">주문일시</th>
                  <th className="pb-3 font-medium">수령인</th>
                  <th className="pb-3 font-medium">상품수</th>
                  <th className="pb-3 font-medium">결제금액</th>
                  <th className="pb-3 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.orderId} className="border-b border-gray-100">
                    <td className="py-3 font-mono text-xs">{order.orderId}</td>
                    <td className="py-3 text-gray-600">{formatDateTime(order.orderedAt)}</td>
                    <td className="py-3">{order.receiverName}</td>
                    <td className="py-3">{order.itemCount}개</td>
                    <td className="py-3 font-medium text-[#E83F33]">{formatCurrency(order.totalPaymentPrice)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 최근 등록 상품 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 등록 상품</h2>
        {data.recentProducts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">등록된 상품이 없습니다</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.recentProducts.map((product) => (
              <div
                key={product.sellerProductId}
                className="p-4 border border-gray-200 rounded-lg hover:border-[#E83F33] transition-colors"
              >
                <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                  {product.sellerProductName}
                </div>
                <div className="text-xs text-gray-500 mb-2">{product.brand}</div>
                <div className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded inline-block">
                  {product.statusName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

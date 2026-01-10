'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface DashboardData {
  overview: {
    totalProducts: number;
    totalStock: number;
    revenue30d: number;
    revenue7d: number;
    forPay30d: number;
    sales30d: number;
    sales7d: number;
    orders30d: number;
    pendingOrders: number;
    cancelledOrders: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  charts: {
    dailySales: Array<{ date: string; sales: number; revenue: number }>;
  };
  bestSellers: Array<{
    nmId: number;
    subject: string;
    brand: string;
    count: number;
    revenue: number;
  }>;
  lowStockItems: Array<{
    nmId: number;
    subject: string;
    brand: string;
    quantity: number;
    warehouseName: string;
  }>;
  recentProducts: Array<{
    nmID: number;
    title: string;
    brand: string;
    vendorCode: string;
    photo: string;
  }>;
}

export default function WildberriesDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wildberries/dashboard');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '데이터 조회 실패');
      }
      const result = await res.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(Math.round(num));
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Wildberries 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">연결 오류</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxRevenue = Math.max(...data.charts.dailySales.map(d => d.revenue));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    WB
                  </span>
                  Wildberries 대시보드
                </h1>
                <p className="text-sm text-gray-500">실시간 판매 현황 및 재고 관리</p>
              </div>
            </div>
            <button
              onClick={fetchDashboard}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              새로고침
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">총 상품</span>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{formatNumber(data.overview.totalProducts)}</p>
            <p className="text-xs text-gray-400 mt-1">등록된 상품</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">총 재고</span>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{formatNumber(data.overview.totalStock)}</p>
            <p className="text-xs text-gray-400 mt-1">전체 수량</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">30일 매출</span>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(data.overview.revenue30d)}</p>
            <p className="text-xs text-green-500 mt-1">+{formatNumber(data.overview.sales30d)} 판매</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">7일 매출</span>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(data.overview.revenue7d)}</p>
            <p className="text-xs text-green-500 mt-1">+{formatNumber(data.overview.sales7d)} 판매</p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 text-white">
            <p className="text-sm opacity-80">정산 예정</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(data.overview.forPay30d)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border">
            <p className="text-sm text-gray-500">30일 주문</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{formatNumber(data.overview.orders30d)}</p>
          </div>
          <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200">
            <p className="text-sm text-yellow-700">재고 부족</p>
            <p className="text-2xl font-bold text-yellow-700 mt-1">{formatNumber(data.overview.lowStockCount)}</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
            <p className="text-sm text-red-700">품절</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{formatNumber(data.overview.outOfStockCount)}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">7일 판매 추이</h2>
            <div className="h-64 flex items-end gap-2">
              {data.charts.dailySales.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '200px' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-500"
                      style={{ height: maxRevenue > 0 ? `${(day.revenue / maxRevenue) * 100}%` : '0%' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{day.date.slice(5)}</p>
                  <p className="text-xs font-semibold text-purple-600">{day.sales}건</p>
                </div>
              ))}
            </div>
          </div>

          {/* Best Sellers */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">베스트셀러 (30일)</h2>
            <div className="space-y-3">
              {data.bestSellers.slice(0, 5).map((item, i) => (
                <div key={item.nmId} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-yellow-400 text-yellow-900' :
                    i === 1 ? 'bg-gray-300 text-gray-700' :
                    i === 2 ? 'bg-orange-300 text-orange-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.subject}</p>
                    <p className="text-xs text-gray-500">{item.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-600">{item.count}개</p>
                    <p className="text-xs text-gray-400">{formatCurrency(item.revenue)}</p>
                  </div>
                </div>
              ))}
              {data.bestSellers.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">판매 데이터가 없습니다</p>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {data.lowStockItems.length > 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              재고 부족 알림
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.lowStockItems.map(item => (
                <div key={`${item.nmId}-${item.warehouseName}`} className="bg-white rounded-lg p-4 border border-yellow-200">
                  <p className="font-medium text-gray-800 truncate">{item.subject}</p>
                  <p className="text-sm text-gray-500">{item.brand}</p>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-yellow-700">남은 수량: <strong>{item.quantity}</strong></span>
                    <span className="text-gray-400">{item.warehouseName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Products */}
        {data.recentProducts.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">최근 등록 상품</h2>
            <div className="grid md:grid-cols-5 gap-4">
              {data.recentProducts.map(product => (
                <div key={product.nmID} className="text-center">
                  <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden mb-2">
                    {product.photo ? (
                      <Image
                        src={product.photo}
                        alt={product.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{product.title}</p>
                  <p className="text-xs text-gray-500">{product.brand}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

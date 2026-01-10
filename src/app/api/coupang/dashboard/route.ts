import { NextResponse } from 'next/server';
import { createCoupangClient } from '@/lib/coupang/client';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/coupang/dashboard
 * 쿠팡 대시보드 요약 데이터
 */
export async function GET() {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '권한이 없습니다' },
        { status: 403 }
      );
    }

    // API 키 확인
    const accessKey = process.env.COUPANG_ACCESS_KEY;
    const secretKey = process.env.COUPANG_SECRET_KEY;
    const vendorId = process.env.COUPANG_VENDOR_ID;

    if (!accessKey || !secretKey || !vendorId) {
      return NextResponse.json(
        { error: '쿠팡 API 키가 설정되지 않았습니다' },
        { status: 500 }
      );
    }

    const client = createCoupangClient(accessKey, secretKey, vendorId);

    // 날짜 계산
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const formatDateTime = (date: Date) => {
      return date.toISOString().slice(0, 16).replace('T', ' ');
    };

    // 병렬로 데이터 조회
    const [productsResult, orders30d, orders7d] = await Promise.all([
      client.getProducts({ maxPerPage: 100 }).catch(() => ({ code: '', message: '', data: [], nextToken: '' })),
      client.getOrders({
        createdAtFrom: formatDateTime(thirtyDaysAgo),
        createdAtTo: formatDateTime(today),
        maxPerPage: 100,
      }).catch(() => ({ code: 0, message: '', data: [], nextToken: '' })),
      client.getOrders({
        createdAtFrom: formatDateTime(sevenDaysAgo),
        createdAtTo: formatDateTime(today),
        maxPerPage: 100,
      }).catch(() => ({ code: 0, message: '', data: [], nextToken: '' })),
    ]);

    const products = productsResult.data || [];
    const allOrders30d = orders30d.data || [];
    const allOrders7d = orders7d.data || [];

    // 30일 매출 통계
    const revenue30d = allOrders30d.reduce((sum, order) => sum + order.totalPaymentPrice, 0);
    const revenue7d = allOrders7d.reduce((sum, order) => sum + order.totalPaymentPrice, 0);

    // 주문 상태별 집계
    const ordersByStatus = allOrders30d.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 일별 주문 추이 (최근 7일)
    const dailyOrders: Record<string, { date: string; orders: number; revenue: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyOrders[dateStr] = { date: dateStr, orders: 0, revenue: 0 };
    }

    allOrders7d.forEach(order => {
      const dateStr = order.orderedAt.split('T')[0];
      if (dailyOrders[dateStr]) {
        dailyOrders[dateStr].orders++;
        dailyOrders[dateStr].revenue += order.totalPaymentPrice;
      }
    });

    // 베스트셀러 (판매량 기준)
    const productSales: Record<number, {
      sellerProductId: number;
      sellerProductName: string;
      count: number;
      revenue: number
    }> = {};

    allOrders30d.forEach(order => {
      order.orderItems.forEach(item => {
        if (!productSales[item.sellerProductId]) {
          productSales[item.sellerProductId] = {
            sellerProductId: item.sellerProductId,
            sellerProductName: item.sellerProductName,
            count: 0,
            revenue: 0,
          };
        }
        productSales[item.sellerProductId].count += item.shippingCount;
        productSales[item.sellerProductId].revenue += item.orderPrice;
      });
    });

    const bestSellers = Object.values(productSales)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 최근 주문
    const recentOrders = allOrders7d.slice(0, 10).map(order => ({
      orderId: order.orderId,
      orderedAt: order.orderedAt,
      status: order.status,
      totalPaymentPrice: order.totalPaymentPrice,
      receiverName: order.receiver.name,
      itemCount: order.orderItems.length,
    }));

    return NextResponse.json({
      overview: {
        totalProducts: products.length,
        revenue30d,
        revenue7d,
        orders30d: allOrders30d.length,
        orders7d: allOrders7d.length,
        ordersByStatus,
      },
      charts: {
        dailyOrders: Object.values(dailyOrders),
      },
      bestSellers,
      recentOrders,
      recentProducts: products.slice(0, 5).map(p => ({
        sellerProductId: p.sellerProductId,
        sellerProductName: p.sellerProductName,
        brand: p.brand,
        statusName: p.statusName,
      })),
    });
  } catch (error) {
    console.error('쿠팡 대시보드 조회 실패:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '대시보드 데이터 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

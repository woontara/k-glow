import { NextResponse } from 'next/server';
import { getExchangeRateInfo } from '@/lib/exchange-rate';

/**
 * GET /api/exchange-rate
 * 실시간 환율 정보 조회
 */
export async function GET() {
  try {
    const rates = await getExchangeRateInfo();
    return NextResponse.json(rates);
  } catch (error) {
    console.error('환율 조회 실패:', error);
    return NextResponse.json(
      { error: '환율 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

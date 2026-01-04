import { NextRequest, NextResponse } from 'next/server';
import { calculateQuote } from '@/lib/calculator';
import { getExchangeRates } from '@/lib/exchange-rate';
import { prisma } from '@/lib/prisma';
import type { QuoteItem, ShippingInfo, CertificationInfo } from '@/lib/calculator';

interface CalculateQuoteRequest {
  items: QuoteItem[];
  shippingInfo: ShippingInfo;
  certificationInfo: CertificationInfo;
  userId?: string;
  saveQuote?: boolean;
}

/**
 * POST /api/calculate-quote
 * 견적 계산
 */
export async function POST(request: NextRequest) {
  try {
    const body: CalculateQuoteRequest = await request.json();

    // 입력 검증
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: '제품 정보가 필요합니다' },
        { status: 400 }
      );
    }

    if (!body.shippingInfo) {
      return NextResponse.json(
        { error: '배송 정보가 필요합니다' },
        { status: 400 }
      );
    }

    // 환율 조회
    const rates = await getExchangeRates();

    // 견적 계산
    const quote = calculateQuote(
      body.items,
      body.shippingInfo,
      body.certificationInfo,
      rates.KRW_RUB
    );

    // 견적 저장 (선택사항)
    if (body.saveQuote && body.userId) {
      try {
        await prisma.quote.create({
          data: {
            userId: body.userId,
            products: body.items as any, // Json 타입으로 자동 변환
            totalKrw: quote.totalKRW,
            totalRub: quote.totalRUB,
            shippingCost: quote.shippingCost,
            certificationCost: quote.certificationCost,
            exchangeRate: quote.exchangeRate,
          },
        });
      } catch (dbError) {
        console.error('견적 저장 실패:', dbError);
        // 저장 실패해도 계산 결과는 반환
      }
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error('견적 계산 실패:', error);
    return NextResponse.json(
      { error: '견적 계산에 실패했습니다' },
      { status: 500 }
    );
  }
}

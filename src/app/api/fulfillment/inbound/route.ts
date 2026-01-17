import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface ProductItem {
  productName: string;
  barcode?: string;
  quantity: number;
  boxCount: number;
}

interface InboundRequest {
  brandName: string;
  contactName?: string;
  contactEmail: string;
  contactPhone?: string;
  expectedDate?: string;
  products: ProductItem[];
  totalQuantity: number;
  totalBoxes: number;
  notes?: string;
}

/**
 * POST /api/fulfillment/inbound
 * Wildberries 풀필먼트 입고 신청
 */
export async function POST(request: NextRequest) {
  try {
    const body: InboundRequest = await request.json();

    // 입력 검증
    if (!body.brandName || !body.contactEmail) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다 (브랜드명, 이메일)' },
        { status: 400 }
      );
    }

    if (!body.products || body.products.length === 0) {
      return NextResponse.json(
        { error: '최소 1개 이상의 제품 정보가 필요합니다' },
        { status: 400 }
      );
    }

    // 사용자 확보 (이메일 기반)
    let user = await prisma.user.findFirst({
      where: { email: body.contactEmail }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: body.contactEmail,
          name: body.contactName || body.brandName,
          role: 'BRAND',
          companyName: body.brandName,
        }
      });
    }

    // 풀필먼트 입고 신청용 기본 파트너 확보
    let fulfillmentPartner = await prisma.partner.findFirst({
      where: { name: 'Wildberries 입고' }
    });

    if (!fulfillmentPartner) {
      fulfillmentPartner = await prisma.partner.create({
        data: {
          name: 'Wildberries 입고',
          nameRu: 'Поставка на Wildberries',
          websiteUrl: 'https://wildberries.ru',
          description: 'Wildberries 풀필먼트 입고 신청',
          descriptionRu: 'Заявка на поставку в фулфилмент Wildberries',
        }
      });
    }

    // 제품 정보 텍스트 생성
    const productsText = body.products
      .map((p, i) => `  ${i + 1}. ${p.productName} - ${p.quantity}개 (${p.boxCount}박스)${p.barcode ? ` [${p.barcode}]` : ''}`)
      .join('\n');

    // notes에 모든 정보 저장
    const fullNotes = [
      '📦 Wildberries 풀필먼트 입고 신청',
      '---',
      `📧 연락처: ${body.contactEmail}${body.contactPhone ? ` / ${body.contactPhone}` : ''}`,
      `🏢 브랜드: ${body.brandName}`,
      body.contactName ? `👤 담당자: ${body.contactName}` : null,
      '---',
      `📋 제품 목록 (총 ${body.totalQuantity}개 / ${body.totalBoxes}박스):`,
      productsText,
      '---',
      body.notes ? `💬 추가 요청사항: ${body.notes}` : null,
    ].filter(Boolean).join('\n');

    // CertificationRequest를 활용하여 저장 (OTHER 타입으로)
    const inboundRequest = await prisma.certificationRequest.create({
      data: {
        userId: user.id,
        partnerId: fulfillmentPartner.id,
        certType: 'OTHER', // 입고 신청은 OTHER 타입으로 저장
        status: 'PENDING',
        documents: body.products as any, // 제품 목록을 documents에 저장
        estimatedCost: 0, // 견적은 추후 산정
        notes: fullNotes,
      },
      include: {
        partner: true,
        user: {
          select: {
            name: true,
            email: true,
            companyName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      id: inboundRequest.id,
      message: '입고 신청이 완료되었습니다',
      data: {
        brandName: body.brandName,
        totalProducts: body.products.length,
        totalQuantity: body.totalQuantity,
        totalBoxes: body.totalBoxes,
      }
    });
  } catch (error) {
    console.error('입고 신청 실패:', error);
    return NextResponse.json(
      { error: '입고 신청에 실패했습니다' },
      { status: 500 }
    );
  }
}

import { PortOneClient, Webhook, type Payment } from '@portone/server-sdk';

// PortOne API Secret (관리자콘솔에서 발급)
const API_SECRET = process.env.PORTONE_API_SECRET!;

// PortOne V2 클라이언트
const portone = PortOneClient({ secret: API_SECRET });

/**
 * 빌링키로 결제 요청
 * @param billingKey 사용자 빌링키
 * @param paymentId 고유 결제 ID (우리 시스템에서 생성)
 * @param amount 결제 금액 (원화 KRW)
 * @param orderName 주문명
 */
export async function payWithBillingKey(
  billingKey: string,
  paymentId: string,
  amount: number,
  orderName: string
): Promise<{
  success: boolean;
  paymentId?: string;
  paidAt?: string;
  error?: string;
}> {
  try {
    const response = await portone.payment.payWithBillingKey({
      billingKey,
      paymentId,
      orderName,
      amount: {
        total: amount,
      },
      currency: 'KRW',
    });

    // 성공적으로 응답이 오면 결제 완료 (payment 객체에 pgTxId와 paidAt이 존재)
    if (response.payment?.pgTxId) {
      return {
        success: true,
        paymentId: paymentId,
        paidAt: response.payment.paidAt,
      };
    }

    return {
      success: false,
      error: '결제 응답이 올바르지 않습니다',
    };
  } catch (error) {
    console.error('빌링키 결제 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '결제 처리 중 오류 발생',
    };
  }
}

/**
 * 결제 정보 조회
 */
export async function getPayment(paymentId: string): Promise<Payment.Payment | null> {
  try {
    const payment = await portone.payment.getPayment({ paymentId });
    return payment;
  } catch (error) {
    console.error('결제 조회 실패:', error);
    return null;
  }
}

// BillingKeyInfo 타입 정의
interface BillingKeyInfo {
  billingKey: string;
  methods?: Array<{
    type: string;
    card?: {
      name?: string;
      number?: string;
    };
  }>;
}

/**
 * 빌링키 정보 조회
 */
export async function getBillingKeyInfo(billingKey: string): Promise<BillingKeyInfo | null> {
  try {
    const info = await portone.payment.billingKey.getBillingKeyInfo({ billingKey });
    return info as unknown as BillingKeyInfo;
  } catch (error) {
    console.error('빌링키 조회 실패:', error);
    return null;
  }
}

/**
 * 빌링키 삭제
 */
export async function deleteBillingKey(billingKey: string): Promise<boolean> {
  try {
    await portone.payment.billingKey.deleteBillingKey({ billingKey });
    return true;
  } catch (error) {
    console.error('빌링키 삭제 실패:', error);
    return false;
  }
}

/**
 * Webhook 검증 (PortOne V2)
 */
export async function verifyWebhook(
  body: string,
  headers: {
    'webhook-id'?: string | null;
    'webhook-timestamp'?: string | null;
    'webhook-signature'?: string | null;
  }
): Promise<boolean> {
  try {
    const webhookSecret = process.env.PORTONE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('PORTONE_WEBHOOK_SECRET이 설정되지 않았습니다');
      return false;
    }

    // null 값을 undefined로 변환
    const cleanHeaders: Record<string, string | undefined> = {
      'webhook-id': headers['webhook-id'] ?? undefined,
      'webhook-timestamp': headers['webhook-timestamp'] ?? undefined,
      'webhook-signature': headers['webhook-signature'] ?? undefined,
    };

    // PortOne V2 Webhook 검증
    await Webhook.verify(webhookSecret, body, cleanHeaders);
    return true;
  } catch (error) {
    console.error('Webhook 검증 실패:', error);
    return false;
  }
}

/**
 * 고유 결제 ID 생성
 */
export function generatePaymentId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `payment_${timestamp}_${random}`;
}

// USD → KRW 환율 (실제로는 환율 API 사용 권장)
const USD_TO_KRW_RATE = 1350;

/**
 * USD를 KRW로 변환
 */
export function usdToKrw(usd: number): number {
  return Math.round(usd * USD_TO_KRW_RATE);
}

/**
 * KRW를 USD로 변환
 */
export function krwToUsd(krw: number): number {
  return krw / USD_TO_KRW_RATE;
}

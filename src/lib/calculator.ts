// 견적 계산 로직

/**
 * 배송 방법
 */
export type ShippingMethod = 'air' | 'sea';

/**
 * 제품 항목
 */
export interface QuoteItem {
  name: string;
  quantity: number;
  priceKRW: number;
  weight: number; // kg
  volume: number; // m³
}

/**
 * 배송 정보
 */
export interface ShippingInfo {
  method: ShippingMethod;
  origin: string;
  destination: string;
  totalWeight: number; // kg
  totalVolume: number; // m³
}

/**
 * 인증 정보
 */
export interface CertificationInfo {
  type: 'EAC' | 'GOST' | 'BOTH' | 'NONE';
  productCount: number;
}

/**
 * 견적 결과
 */
export interface QuoteResult {
  items: QuoteItem[];
  subtotal: number;           // 제품 합계 (KRW)
  shippingCost: number;       // 배송비 (KRW)
  customsDuty: number;        // 관세 (KRW)
  vat: number;                // 부가세 (KRW)
  certificationCost: number;  // 인증 비용 (KRW)
  totalKRW: number;           // 총액 (KRW)
  totalRUB: number;           // 총액 (RUB)
  exchangeRate: number;       // 적용 환율
  breakdown: {
    itemsKRW: number;
    shippingKRW: number;
    customsKRW: number;
    vatKRW: number;
    certKRW: number;
  };
}

/**
 * 배송비 계산
 *
 * 항공: 6,000원/kg 또는 180,000원/m³ 중 높은 값
 * 해상: 1,500원/kg 또는 45,000원/m³ 중 높은 값
 */
export function calculateShippingCost(info: ShippingInfo): number {
  const rates = {
    air: {
      perKg: 6000,
      perCbm: 180000,
      baseRate: 50000, // 기본 요금
    },
    sea: {
      perKg: 1500,
      perCbm: 45000,
      baseRate: 100000,
    },
  };

  const rate = rates[info.method];

  // 무게 기준 계산
  const weightCost = info.totalWeight * rate.perKg;

  // 부피 기준 계산
  const volumeCost = info.totalVolume * rate.perCbm;

  // 둘 중 높은 값 + 기본 요금
  return Math.max(weightCost, volumeCost) + rate.baseRate;
}

/**
 * 관세 계산
 *
 * 러시아 화장품 관세율: 약 5-10% (평균 6.5%)
 * 과세 대상: 제품 가격 + 배송비
 */
export function calculateCustomsDuty(
  subtotal: number,
  shippingCost: number
): number {
  const dutyRate = 0.065; // 6.5%
  const taxableAmount = subtotal + shippingCost;
  return Math.round(taxableAmount * dutyRate);
}

/**
 * 부가세 계산
 *
 * 러시아 VAT: 20%
 * 과세 대상: 제품 가격 + 배송비 + 관세
 */
export function calculateVAT(
  subtotal: number,
  shippingCost: number,
  customsDuty: number
): number {
  const vatRate = 0.20; // 20%
  const taxableAmount = subtotal + shippingCost + customsDuty;
  return Math.round(taxableAmount * vatRate);
}

/**
 * 인증 비용 계산
 *
 * EAC 인증: 제품당 500,000원
 * GOST 인증: 제품당 300,000원
 * 둘 다: 제품당 700,000원
 */
export function calculateCertificationCost(info: CertificationInfo): number {
  const rates = {
    EAC: 500000,
    GOST: 300000,
    BOTH: 700000,
    NONE: 0,
  };

  return rates[info.type] * info.productCount;
}

/**
 * 전체 견적 계산
 */
export function calculateQuote(
  items: QuoteItem[],
  shippingInfo: ShippingInfo,
  certificationInfo: CertificationInfo,
  exchangeRate: number
): QuoteResult {
  // 1. 제품 합계
  const subtotal = items.reduce(
    (sum, item) => sum + item.priceKRW * item.quantity,
    0
  );

  // 2. 배송비
  const shippingCost = calculateShippingCost(shippingInfo);

  // 3. 관세
  const customsDuty = calculateCustomsDuty(subtotal, shippingCost);

  // 4. 부가세
  const vat = calculateVAT(subtotal, shippingCost, customsDuty);

  // 5. 인증 비용
  const certificationCost = calculateCertificationCost(certificationInfo);

  // 6. 총액 (KRW)
  const totalKRW = subtotal + shippingCost + customsDuty + vat + certificationCost;

  // 7. 총액 (RUB)
  const totalRUB = Math.round(totalKRW * exchangeRate);

  return {
    items,
    subtotal,
    shippingCost,
    customsDuty,
    vat,
    certificationCost,
    totalKRW,
    totalRUB,
    exchangeRate,
    breakdown: {
      itemsKRW: subtotal,
      shippingKRW: shippingCost,
      customsKRW: customsDuty,
      vatKRW: vat,
      certKRW: certificationCost,
    },
  };
}

/**
 * 숫자를 통화 형식으로 포맷
 */
export function formatCurrency(amount: number, currency: 'KRW' | 'RUB' = 'KRW'): string {
  if (currency === 'KRW') {
    return `₩${amount.toLocaleString('ko-KR')}`;
  } else {
    return `₽${amount.toLocaleString('ru-RU')}`;
  }
}

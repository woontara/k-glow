// 환율 조회 및 관리
// ExchangeRate-API (무료) 사용: https://www.exchangerate-api.com/

interface ExchangeRateResponse {
  result: string;
  base_code: string;
  conversion_rates: {
    [key: string]: number;
  };
}

interface ExchangeRates {
  KRW_RUB: number;  // 원 → 루블
  KRW_USD: number;  // 원 → 달러
  RUB_KRW: number;  // 루블 → 원
  USD_KRW: number;  // 달러 → 원
  lastUpdated: Date;
}

// 환율 캐시 (1시간 유효)
let cachedRates: ExchangeRates | null = null;
let cacheExpiry: Date | null = null;

/**
 * 실시간 환율 조회
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  // 캐시 확인
  if (cachedRates && cacheExpiry && new Date() < cacheExpiry) {
    return cachedRates;
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  // API 키가 없으면 기본값 사용 (개발용)
  if (!apiKey) {
    console.warn('⚠️ EXCHANGE_RATE_API_KEY가 설정되지 않았습니다. 기본 환율을 사용합니다.');
    return getDefaultRates();
  }

  try {
    // KRW 기준 환율 조회
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/KRW`,
      { next: { revalidate: 3600 } } // 1시간 캐시
    );

    if (!response.ok) {
      throw new Error(`환율 API 오류: ${response.status}`);
    }

    const data: ExchangeRateResponse = await response.json();

    if (data.result !== 'success') {
      throw new Error('환율 API 응답 오류');
    }

    const rates: ExchangeRates = {
      KRW_RUB: data.conversion_rates.RUB || 0.075,
      KRW_USD: data.conversion_rates.USD || 0.00075,
      RUB_KRW: 1 / (data.conversion_rates.RUB || 0.075),
      USD_KRW: 1 / (data.conversion_rates.USD || 0.00075),
      lastUpdated: new Date(),
    };

    // 캐시 저장 (1시간)
    cachedRates = rates;
    cacheExpiry = new Date(Date.now() + 60 * 60 * 1000);

    return rates;
  } catch (error) {
    console.error('환율 조회 실패:', error);
    return getDefaultRates();
  }
}

/**
 * 기본 환율 (API 실패 시 사용)
 */
function getDefaultRates(): ExchangeRates {
  return {
    KRW_RUB: 0.075,   // 1원 = 0.075루블 (대략 13.3루블/원)
    KRW_USD: 0.00075, // 1원 = 0.00075달러 (대략 1,333원/달러)
    RUB_KRW: 13.33,   // 1루블 = 13.33원
    USD_KRW: 1333,    // 1달러 = 1,333원
    lastUpdated: new Date(),
  };
}

/**
 * KRW → RUB 환전
 */
export async function convertKRWtoRUB(amountKRW: number): Promise<number> {
  const rates = await getExchangeRates();
  return amountKRW * rates.KRW_RUB;
}

/**
 * RUB → KRW 환전
 */
export async function convertRUBtoKRW(amountRUB: number): Promise<number> {
  const rates = await getExchangeRates();
  return amountRUB * rates.RUB_KRW;
}

/**
 * 환율 정보 가져오기 (클라이언트용)
 */
export async function getExchangeRateInfo() {
  const rates = await getExchangeRates();
  return {
    krwToRub: rates.KRW_RUB,
    rubToKrw: rates.RUB_KRW,
    krwToUsd: rates.KRW_USD,
    usdToKrw: rates.USD_KRW,
    lastUpdated: rates.lastUpdated.toISOString(),
  };
}

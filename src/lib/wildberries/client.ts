/**
 * Wildberries API Client
 *
 * 공식 문서: https://dev.wildberries.ru/en/openapi/api-information
 */

// API 기본 URL
const API_URLS = {
  content: 'https://content-api.wildberries.ru',
  statistics: 'https://statistics-api.wildberries.ru',
  analytics: 'https://seller-analytics-api.wildberries.ru',
  marketplace: 'https://marketplace-api.wildberries.ru',
};

// 타입 정의
export interface WBProduct {
  nmID: number;
  imtID: number;
  subjectID: number;
  subjectName: string;
  vendorCode: string;
  brand: string;
  title: string;
  description: string;
  photos: Array<{
    big: string;
    c246x328: string;
    c516x688: string;
    square: string;
    tm: string;
  }>;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  sizes: Array<{
    techSize: string;
    wbSize: string;
    skus: string[];
    price: number;
    discountedPrice: number;
  }>;
  characteristics: Array<{
    id: number;
    name: string;
    value: string | string[];
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface WBSale {
  srid: string;
  date: string;
  lastChangeDate: string;
  supplierArticle: string;
  techSize: string;
  barcode: string;
  totalPrice: number;
  discountPercent: number;
  isSupply: boolean;
  isRealization: boolean;
  orderId: number;
  promoCodeDiscount: number;
  warehouseName: string;
  countryName: string;
  oblastOkrugName: string;
  regionName: string;
  incomeID: number;
  saleID: string;
  odid: number;
  spp: number;
  forPay: number;
  finishedPrice: number;
  priceWithDisc: number;
  nmId: number;
  subject: string;
  category: string;
  brand: string;
  IsStorno: number;
}

export interface WBOrder {
  srid: string;
  date: string;
  lastChangeDate: string;
  supplierArticle: string;
  techSize: string;
  barcode: string;
  totalPrice: number;
  discountPercent: number;
  warehouseName: string;
  oblast: string;
  incomeID: number;
  odid: number;
  nmId: number;
  subject: string;
  category: string;
  brand: string;
  isCancel: boolean;
  cancelDate: string;
  orderType: string;
  sticker: string;
  gNumber: string;
}

export interface WBStock {
  lastChangeDate: string;
  supplierArticle: string;
  techSize: string;
  barcode: string;
  quantity: number;
  isSupply: boolean;
  isRealization: boolean;
  quantityFull: number;
  quantityNotInOrders: number;
  warehouseName: string;
  inWayToClient: number;
  inWayFromClient: number;
  nmId: number;
  subject: string;
  category: string;
  daysOnSite: number;
  brand: string;
  SCCode: string;
  Price: number;
  Discount: number;
}

export interface WBSalesFunnel {
  nmID: number;
  vendorCode: string;
  brandName: string;
  tags: Array<{ id: number; name: string }>;
  object: { id: number; name: string };
  statistics: {
    selectedPeriod: {
      begin: string;
      end: string;
      openCardCount: number;
      addToCartCount: number;
      ordersCount: number;
      ordersSumRub: number;
      buyoutsCount: number;
      buyoutsSumRub: number;
      cancelCount: number;
      cancelSumRub: number;
      avgPriceRub: number;
      avgOrdersCountPerDay: number;
      conversions: {
        addToCartPercent: number;
        cartToOrderPercent: number;
        buyoutPercent: number;
      };
    };
    previousPeriod: {
      begin: string;
      end: string;
      openCardCount: number;
      addToCartCount: number;
      ordersCount: number;
      ordersSumRub: number;
      buyoutsCount: number;
      buyoutsSumRub: number;
      cancelCount: number;
      cancelSumRub: number;
      avgPriceRub: number;
      avgOrdersCountPerDay: number;
      conversions: {
        addToCartPercent: number;
        cartToOrderPercent: number;
        buyoutPercent: number;
      };
    };
    periodComparison: {
      openCardDynamics: number;
      addToCartDynamics: number;
      ordersCountDynamics: number;
      ordersSumRubDynamics: number;
      buyoutsCountDynamics: number;
      buyoutsSumRubDynamics: number;
      cancelCountDynamics: number;
      cancelSumRubDynamics: number;
      avgPriceRubDynamics: number;
      avgOrdersCountPerDayDynamics: number;
      conversions: {
        addToCartPercent: number;
        cartToOrderPercent: number;
        buyoutPercent: number;
      };
    };
  };
}

class WildberriesClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(
    baseUrl: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': this.token,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WB API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * 상품 카드 목록 조회
   * POST /content/v2/get/cards/list
   */
  async getProducts(options: {
    limit?: number;
    updatedAt?: string;
    nmID?: number;
    withPhoto?: -1 | 0 | 1;
    textSearch?: string;
  } = {}): Promise<{ cards: WBProduct[]; cursor: { updatedAt: string; nmID: number; total: number } }> {
    const { limit = 100, updatedAt, nmID, withPhoto = -1, textSearch } = options;

    const body = {
      settings: {
        cursor: {
          limit,
          ...(updatedAt && { updatedAt }),
          ...(nmID && { nmID }),
        },
        filter: {
          withPhoto,
          ...(textSearch && { textSearch }),
        },
      },
    };

    return this.request(API_URLS.content, '/content/v2/get/cards/list', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * 모든 상품 조회 (페이지네이션 처리)
   */
  async getAllProducts(): Promise<WBProduct[]> {
    const allProducts: WBProduct[] = [];
    let cursor: { updatedAt?: string; nmID?: number } = {};
    let hasMore = true;

    while (hasMore) {
      const result = await this.getProducts({
        limit: 100,
        updatedAt: cursor.updatedAt,
        nmID: cursor.nmID,
      });

      allProducts.push(...result.cards);

      if (result.cursor.total < 100) {
        hasMore = false;
      } else {
        cursor = {
          updatedAt: result.cursor.updatedAt,
          nmID: result.cursor.nmID,
        };
      }

      // Rate limiting: 200ms 간격
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return allProducts;
  }

  /**
   * 판매 데이터 조회
   * GET /api/v1/supplier/sales
   */
  async getSales(dateFrom: string, flag?: 0 | 1): Promise<WBSale[]> {
    const params = new URLSearchParams({
      dateFrom,
      ...(flag !== undefined && { flag: String(flag) }),
    });

    return this.request(API_URLS.statistics, `/api/v1/supplier/sales?${params}`);
  }

  /**
   * 주문 데이터 조회
   * GET /api/v1/supplier/orders
   */
  async getOrders(dateFrom: string, flag?: 0 | 1): Promise<WBOrder[]> {
    const params = new URLSearchParams({
      dateFrom,
      ...(flag !== undefined && { flag: String(flag) }),
    });

    return this.request(API_URLS.statistics, `/api/v1/supplier/orders?${params}`);
  }

  /**
   * 재고 현황 조회
   * GET /api/v1/supplier/stocks
   */
  async getStocks(dateFrom: string): Promise<WBStock[]> {
    const params = new URLSearchParams({ dateFrom });
    return this.request(API_URLS.statistics, `/api/v1/supplier/stocks?${params}`);
  }

  /**
   * 판매 퍼널 분석 (상품별 지표)
   * POST /api/analytics/v3/sales-funnel/products
   */
  async getSalesFunnel(options: {
    nmIDs: number[];
    beginDate: string;
    endDate: string;
    timezone?: string;
  }): Promise<{ data: WBSalesFunnel[] }> {
    const { nmIDs, beginDate, endDate, timezone = 'Europe/Moscow' } = options;

    return this.request(API_URLS.analytics, '/api/analytics/v3/sales-funnel/products', {
      method: 'POST',
      body: JSON.stringify({
        nmIDs,
        period: {
          begin: beginDate,
          end: endDate,
        },
        timezone,
      }),
    });
  }

  /**
   * 연결 테스트
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getProducts({ limit: 1 });
      return true;
    } catch {
      return false;
    }
  }
}

export function createWildberriesClient(token: string): WildberriesClient {
  return new WildberriesClient(token);
}

export default WildberriesClient;

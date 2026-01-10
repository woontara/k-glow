/**
 * OZON Seller API Client
 *
 * 공식 문서: https://docs.ozon.ru/api/seller/
 * Base URL: https://api-seller.ozon.ru
 */

const API_BASE_URL = 'https://api-seller.ozon.ru';

// 타입 정의
export interface OzonProduct {
  product_id: number;
  offer_id: string;
  is_fbo_visible: boolean;
  is_fbs_visible: boolean;
  archived: boolean;
  is_discounted: boolean;
  name?: string;
  barcode?: string;
  barcodes?: string[];
  category_id?: number;
  created_at?: string;
  images?: string[];
  primary_image?: string;
  marketing_price?: string;
  min_price?: string;
  old_price?: string;
  price?: string;
  recommended_price?: string;
  sources?: Array<{
    source: string;
    sku: number;
  }>;
  stocks?: {
    coming: number;
    present: number;
    reserved: number;
  };
  visibility_details?: {
    has_price: boolean;
    has_stock: boolean;
    active_product: boolean;
  };
}

export interface OzonProductInfo {
  id: number;
  name: string;
  offer_id: string;
  barcode: string;
  barcodes: string[];
  buybox_price: string;
  category_id: number;
  created_at: string;
  images: string[];
  marketing_price: string;
  min_ozon_price: string;
  old_price: string;
  premium_price: string;
  price: string;
  recommended_price: string;
  min_price: string;
  sources: Array<{ source: string; sku: number }>;
  stocks: {
    coming: number;
    present: number;
    reserved: number;
  };
  errors: Array<{ code: string; message: string }>;
  vat: string;
  visible: boolean;
  visibility_details: {
    has_price: boolean;
    has_stock: boolean;
    active_product: boolean;
  };
  price_index: string;
  commissions: Array<{
    percent: number;
    min_value: number;
    value: number;
    sale_schema: string;
    delivery_amount: number;
    return_amount: number;
  }>;
  volume_weight: number;
  is_prepayment: boolean;
  is_prepayment_allowed: boolean;
  images360: string[];
  color_image: string;
  primary_image: string;
  status: {
    state: string;
    state_failed: string;
    moderate_status: string;
    decline_reasons: string[];
    validation_state: string;
    state_name: string;
    state_description: string;
    is_failed: boolean;
    is_created: boolean;
    state_tooltip: string;
    item_errors: Array<{ code: string; message: string }>;
    state_updated_at: string;
  };
}

export interface OzonPosting {
  posting_number: string;
  order_id: number;
  order_number: string;
  status: string;
  delivery_method: {
    id: number;
    name: string;
    warehouse_id: number;
    warehouse: string;
    tpl_provider_id: number;
    tpl_provider: string;
  };
  tracking_number: string;
  tpl_integration_type: string;
  in_process_at: string;
  shipment_date: string;
  delivering_date: string | null;
  cancellation: {
    cancel_reason_id: number;
    cancel_reason: string;
    cancellation_type: string;
    cancelled_after_ship: boolean;
    affect_cancellation_rating: boolean;
    cancellation_initiator: string;
  };
  customer: {
    customer_id: number;
    name: string;
    address: {
      address_tail: string;
      city: string;
      comment: string;
      country: string;
      district: string;
      latitude: number;
      longitude: number;
      provider_pvz_code: string;
      pvz_code: number;
      region: string;
      zip_code: string;
    } | null;
  } | null;
  products: Array<{
    sku: number;
    name: string;
    quantity: number;
    offer_id: string;
    price: string;
    digital_codes: string[];
    currency_code: string;
  }>;
  addressee: {
    name: string;
    phone: string;
  } | null;
  barcodes: {
    upper_barcode: string;
    lower_barcode: string;
  } | null;
  analytics_data: {
    region: string;
    city: string;
    delivery_type: string;
    is_premium: boolean;
    payment_type_group_name: string;
    warehouse_id: number;
    warehouse: string;
    tpl_provider_id: number;
    tpl_provider: string;
    delivery_date_begin: string;
    delivery_date_end: string;
    is_legal: boolean;
  } | null;
  financial_data: {
    products: Array<{
      commission_amount: number;
      commission_percent: number;
      payout: number;
      product_id: number;
      currency_code: string;
      old_price: number;
      price: number;
      total_discount_value: number;
      total_discount_percent: number;
      actions: string[];
      picking: {
        moment: string;
        tag: string;
        amount: number;
      } | null;
      quantity: number;
      client_price: string;
      item_services: {
        marketplace_service_item_fulfillment: number;
        marketplace_service_item_pickup: number;
        marketplace_service_item_dropoff_pvz: number;
        marketplace_service_item_dropoff_sc: number;
        marketplace_service_item_dropoff_ff: number;
        marketplace_service_item_direct_flow_trans: number;
        marketplace_service_item_return_flow_trans: number;
        marketplace_service_item_deliv_to_customer: number;
        marketplace_service_item_return_not_deliv_to_customer: number;
        marketplace_service_item_return_part_goods_customer: number;
        marketplace_service_item_return_after_deliv_to_customer: number;
      };
    }>;
    posting_services: {
      marketplace_service_item_fulfillment: number;
      marketplace_service_item_pickup: number;
      marketplace_service_item_dropoff_pvz: number;
      marketplace_service_item_dropoff_sc: number;
      marketplace_service_item_dropoff_ff: number;
      marketplace_service_item_direct_flow_trans: number;
      marketplace_service_item_return_flow_trans: number;
      marketplace_service_item_deliv_to_customer: number;
      marketplace_service_item_return_not_deliv_to_customer: number;
      marketplace_service_item_return_part_goods_customer: number;
      marketplace_service_item_return_after_deliv_to_customer: number;
    };
  } | null;
  is_express: boolean;
  requirements: {
    products_requiring_gtd: number[];
    products_requiring_country: number[];
    products_requiring_mandatory_mark: number[];
    products_requiring_rnpt: number[];
    products_requiring_jw_uin: number[];
  };
  parent_posting_number: string;
  available_actions: string[];
  multi_box_qty: number;
  is_multibox: boolean;
  substatus: string;
  prr_option: string;
}

export interface OzonTransaction {
  operation_id: number;
  operation_type: string;
  operation_date: string;
  operation_type_name: string;
  delivery_charge: number;
  return_delivery_charge: number;
  accruals_for_sale: number;
  sale_commission: number;
  amount: number;
  type: string;
  posting: {
    delivery_schema: string;
    order_date: string;
    posting_number: string;
    warehouse_id: number;
  };
  items: Array<{
    name: string;
    sku: number;
  }>;
  services: Array<{
    name: string;
    price: number;
  }>;
}

export interface OzonStock {
  sku: number;
  warehouse_name: string;
  item_code: string;
  item_name: string;
  promised_amount: number;
  free_to_sell_amount: number;
  reserved_amount: number;
}

export interface OzonAnalyticsData {
  dimensions: Array<{
    id: string;
    name: string;
  }>;
  metrics: number[];
}

// API 응답 타입
export interface OzonProductListResponse {
  result: {
    items: OzonProduct[];
    total: number;
    last_id: string;
  };
}

export interface OzonProductInfoResponse {
  result: {
    items: OzonProductInfo[];
  };
}

export interface OzonPostingListResponse {
  result: {
    postings: OzonPosting[];
    has_next: boolean;
  };
}

export interface OzonTransactionListResponse {
  result: {
    operations: OzonTransaction[];
    page_count: number;
    row_count: number;
  };
}

export interface OzonStockResponse {
  result: {
    rows: OzonStock[];
  };
}

export interface OzonAnalyticsResponse {
  result: {
    data: OzonAnalyticsData[];
    totals: number[];
  };
  timestamp: string;
}

class OzonClient {
  private clientId: string;
  private apiKey: string;

  constructor(clientId: string, apiKey: string) {
    this.clientId = clientId;
    this.apiKey = apiKey;
  }

  /**
   * API 요청 실행
   */
  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${API_BASE_URL}${path}`;

    const options: RequestInit = {
      method,
      headers: {
        'Client-Id': this.clientId,
        'Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OZON API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * 상품 목록 조회
   * POST /v3/product/list
   */
  async getProducts(options: {
    limit?: number;
    lastId?: string;
    visibility?: 'ALL' | 'VISIBLE' | 'INVISIBLE' | 'EMPTY_STOCK' | 'NOT_MODERATED' | 'MODERATED' | 'DISABLED' | 'STATE_FAILED' | 'READY_TO_SUPPLY' | 'VALIDATION_STATE_PENDING' | 'VALIDATION_STATE_FAIL' | 'VALIDATION_STATE_SUCCESS' | 'TO_SUPPLY' | 'IN_SALE' | 'REMOVED_FROM_SALE' | 'BANNED' | 'OVERPRICED' | 'CRITICALLY_OVERPRICED' | 'EMPTY_BARCODE' | 'BARCODE_EXISTS' | 'QUARANTINE' | 'ARCHIVED' | 'OVERPRICED_WITH_STOCK' | 'PARTIAL_APPROVED' | 'IMAGE_ABSENT' | 'MODERATION_BLOCK';
  } = {}): Promise<OzonProductListResponse> {
    const { limit = 100, lastId = '', visibility = 'ALL' } = options;

    return this.request<OzonProductListResponse>('POST', '/v3/product/list', {
      filter: {
        visibility,
      },
      limit,
      last_id: lastId,
    });
  }

  /**
   * 상품 상세 정보 조회
   * POST /v2/product/info
   */
  async getProductInfo(productId: number): Promise<OzonProductInfoResponse> {
    return this.request<OzonProductInfoResponse>('POST', '/v2/product/info', {
      product_id: productId,
    });
  }

  /**
   * 여러 상품 상세 정보 조회
   * POST /v2/product/info/list
   */
  async getProductInfoList(options: {
    productIds?: number[];
    offerIds?: string[];
    skus?: number[];
  }): Promise<OzonProductInfoResponse> {
    return this.request<OzonProductInfoResponse>('POST', '/v2/product/info/list', {
      product_id: options.productIds || [],
      offer_id: options.offerIds || [],
      sku: options.skus || [],
    });
  }

  /**
   * FBS 주문 목록 조회
   * POST /v3/posting/fbs/list
   */
  async getPostings(options: {
    since?: string; // ISO 8601 format
    to?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<OzonPostingListResponse> {
    const { since, to, status, limit = 100, offset = 0 } = options;

    const filter: Record<string, unknown> = {};
    if (since) filter.since = since;
    if (to) filter.to = to;
    if (status) filter.status = status;

    return this.request<OzonPostingListResponse>('POST', '/v3/posting/fbs/list', {
      dir: 'DESC',
      filter,
      limit,
      offset,
      with: {
        analytics_data: true,
        barcodes: true,
        financial_data: true,
        translit: false,
      },
    });
  }

  /**
   * 단일 주문 상세 조회
   * POST /v3/posting/fbs/get
   */
  async getPosting(postingNumber: string): Promise<{ result: OzonPosting }> {
    return this.request('POST', '/v3/posting/fbs/get', {
      posting_number: postingNumber,
      with: {
        analytics_data: true,
        barcodes: true,
        financial_data: true,
        translit: false,
      },
    });
  }

  /**
   * 거래 내역 조회
   * POST /v3/finance/transaction/list
   */
  async getTransactions(options: {
    from: string; // YYYY-MM-DD format
    to: string;
    page?: number;
    pageSize?: number;
    transactionType?: string;
  }): Promise<OzonTransactionListResponse> {
    const { from, to, page = 1, pageSize = 100, transactionType = 'all' } = options;

    return this.request<OzonTransactionListResponse>('POST', '/v3/finance/transaction/list', {
      filter: {
        date: {
          from: `${from}T00:00:00.000Z`,
          to: `${to}T23:59:59.999Z`,
        },
        operation_type: [],
        posting_number: '',
        transaction_type: transactionType,
      },
      page,
      page_size: pageSize,
    });
  }

  /**
   * 재고 현황 조회
   * POST /v2/analytics/stock_on_warehouses
   */
  async getStocks(options: {
    limit?: number;
    offset?: number;
    warehouseType?: 'ALL' | 'EXPRESS' | 'NOT_EXPRESS';
  } = {}): Promise<OzonStockResponse> {
    const { limit = 100, offset = 0, warehouseType = 'ALL' } = options;

    return this.request<OzonStockResponse>('POST', '/v2/analytics/stock_on_warehouses', {
      limit,
      offset,
      warehouse_type: warehouseType,
    });
  }

  /**
   * 분석 데이터 조회
   * POST /v1/analytics/data
   */
  async getAnalytics(options: {
    dateFrom: string; // YYYY-MM-DD
    dateTo: string;
    metrics: string[];
    dimensions?: string[];
    filters?: Array<{ key: string; op: string; value: string }>;
    limit?: number;
    offset?: number;
  }): Promise<OzonAnalyticsResponse> {
    const {
      dateFrom,
      dateTo,
      metrics,
      dimensions = ['day'],
      filters = [],
      limit = 1000,
      offset = 0,
    } = options;

    return this.request<OzonAnalyticsResponse>('POST', '/v1/analytics/data', {
      date_from: dateFrom,
      date_to: dateTo,
      metrics,
      dimension: dimensions,
      filters,
      limit,
      offset,
      sort: [{ key: 'revenue', order: 'DESC' }],
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

export function createOzonClient(clientId: string, apiKey: string): OzonClient {
  return new OzonClient(clientId, apiKey);
}

export default OzonClient;

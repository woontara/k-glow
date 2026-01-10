/**
 * Coupang WING Open API Client
 *
 * 공식 문서: https://developers.coupangcorp.com/hc/en-us
 */

import crypto from 'crypto';

const API_BASE_URL = 'https://api-gateway.coupang.com';

// 타입 정의
export interface CoupangProduct {
  sellerProductId: number;
  sellerProductName: string;
  displayCategoryCode: number;
  categoryId: number;
  productId: number;
  vendorId: string;
  mdId: string;
  mdName: string;
  saleStartedAt: string;
  saleEndedAt: string;
  brand: string;
  generalProductName: string;
  deliveryMethod: string;
  deliveryCompanyCode: string;
  deliveryChargeType: string;
  deliveryCharge: number;
  freeShipOverAmount: number;
  deliveryChargeOnReturn: number;
  remoteAreaDeliverable: string;
  unionDeliveryType: string;
  returnCenterCode: string;
  returnChargeName: string;
  companyContactNumber: string;
  returnZipCode: string;
  returnAddress: string;
  returnAddressDetail: string;
  returnCharge: number;
  returnChargeVendor: string;
  afterServiceInformation: string;
  afterServiceContactNumber: string;
  outboundShippingPlaceCode: number;
  vendorUserId: string;
  requested: boolean;
  items: CoupangProductItem[];
  statusName: string;
  sellerProductItemId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CoupangProductItem {
  sellerProductItemId: number;
  vendorItemId: number;
  itemName: string;
  originalPrice: number;
  salePrice: number;
  maximumBuyCount: number;
  maximumBuyForPerson: number;
  maximumBuyForPersonPeriod: number;
  outboundShippingTimeDay: number;
  unitCount: number;
  adultOnly: string;
  taxType: string;
  parallelImported: string;
  overseasPurchased: string;
  pccNeeded: string;
  externalVendorSku: string;
  barcode: string;
  emptyBarcode: boolean;
  emptyBarcodeReason: string;
  modelNo: string;
  extraProperties: Record<string, string>;
  certifications: Array<{
    certificationType: string;
    certificationCode: string;
  }>;
  searchTags: string[];
  images: Array<{
    imageOrder: number;
    imageType: string;
    vendorPath: string;
  }>;
  notices: Array<{
    noticeCategoryName: string;
    noticeCategoryDetailName: string;
    content: string;
  }>;
  attributes: Array<{
    attributeTypeName: string;
    attributeValueName: string;
  }>;
  contents: Array<{
    contentsType: string;
    contentDetails: Array<{
      content: string;
      detailType: string;
    }>;
  }>;
  offerCondition: string;
  offerDescription: string;
}

export interface CoupangOrder {
  shipmentBoxId: number;
  orderId: number;
  orderedAt: string;
  ordererName: string;
  ordererEmail: string;
  ordererSafeNumber: string;
  paymentDate: string;
  status: string;
  shippingPrice: number;
  remotePrice: number;
  remoteArea: boolean;
  parcelPrintMessage: string;
  splitShipping: boolean;
  ableSplitShipping: boolean;
  receiver: {
    name: string;
    safeNumber: string;
    addr1: string;
    addr2: string;
    postCode: string;
    receiverMessage: string;
  };
  orderItems: CoupangOrderItem[];
  overseaShippingInfoDto: {
    personalCustomsClearanceCode: string;
    ordererPhoneNumber: string;
  } | null;
  bundleReducedPrice: number;
  totalPaymentPrice: number;
}

export interface CoupangOrderItem {
  vendorItemPackageId: number;
  vendorItemPackageName: string;
  productId: number;
  vendorItemId: number;
  vendorItemName: string;
  shippingCount: number;
  salesPrice: number;
  orderPrice: number;
  discountPrice: number;
  instantCouponDiscount: number;
  downloadableCouponDiscount: number;
  coupangDiscount: number;
  externalVendorSkuCode: string;
  etcInfoHeader: string;
  etcInfoValue: string;
  sellerProductId: number;
  sellerProductName: string;
  sellerProductItemId: number;
  firstSellerProductItemId: number;
  cancelCount: number;
  holdCountForCancel: number;
  estimatedShippingDate: string;
  plannedShippingDate: string;
  invoiceNumberUploadDate: string;
  extraProperties: Record<string, string>;
  pricingBadge: boolean;
  usedProduct: boolean;
  confirmDate: string;
  deliveryChargeTypeName: string;
  cancelReasonCategory1: string;
  cancelReasonCategory2: string;
  cancelReason: string;
}

export interface CoupangProductListResponse {
  code: string;
  message: string;
  data: CoupangProduct[];
  nextToken: string;
}

export interface CoupangOrderListResponse {
  code: number;
  message: string;
  data: CoupangOrder[];
  nextToken: string;
}

class CoupangClient {
  private accessKey: string;
  private secretKey: string;
  private vendorId: string;

  constructor(accessKey: string, secretKey: string, vendorId: string) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.vendorId = vendorId;
  }

  /**
   * HMAC Signature 생성
   */
  private generateHmacSignature(method: string, path: string, query: string = ''): {
    authorization: string;
    datetime: string;
  } {
    // GMT 시간 기준 datetime 생성 (yyMMddTHHmmssZ)
    const now = new Date();
    const datetime = now.toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
      .slice(2); // yyMMddTHHmmssZ 형식

    // 메시지 생성
    const message = datetime + method + path + query;

    // HMAC-SHA256 서명 생성
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(message)
      .digest('hex');

    // Authorization 헤더 생성
    const authorization = `CEA algorithm=HmacSHA256, access-key=${this.accessKey}, signed-date=${datetime}, signature=${signature}`;

    return { authorization, datetime };
  }

  /**
   * API 요청 실행
   */
  private async request<T>(
    method: string,
    path: string,
    query: Record<string, string> = {},
    body?: Record<string, unknown>
  ): Promise<T> {
    const queryString = Object.keys(query).length > 0
      ? '?' + new URLSearchParams(query).toString()
      : '';

    const fullPath = path + queryString;
    const { authorization } = this.generateHmacSignature(method, path, queryString ? queryString.slice(1) : '');

    const url = `${API_BASE_URL}${fullPath}`;

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': authorization,
        'X-Requested-By': this.vendorId,
        'Content-Type': 'application/json;charset=UTF-8',
        'X-MARKET': 'KR',
      },
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Coupang API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * 상품 목록 조회 (페이징)
   * GET /v2/providers/seller_api/apis/api/v1/marketplace/seller-products
   */
  async getProducts(options: {
    nextToken?: string;
    maxPerPage?: number;
    status?: string;
  } = {}): Promise<CoupangProductListResponse> {
    const { nextToken, maxPerPage = 50, status } = options;

    const query: Record<string, string> = {
      vendorId: this.vendorId,
      maxPerPage: String(maxPerPage),
    };

    if (nextToken) query.nextToken = nextToken;
    if (status) query.status = status;

    return this.request<CoupangProductListResponse>(
      'GET',
      '/v2/providers/seller_api/apis/api/v1/marketplace/seller-products',
      query
    );
  }

  /**
   * 단일 상품 조회
   * GET /v2/providers/seller_api/apis/api/v1/marketplace/seller-products/{sellerProductId}
   */
  async getProduct(sellerProductId: number): Promise<{ code: string; message: string; data: CoupangProduct }> {
    return this.request(
      'GET',
      `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products/${sellerProductId}`
    );
  }

  /**
   * 주문 목록 조회 (일별 페이징)
   * GET /v2/providers/openapi/apis/api/v5/vendors/{vendorId}/ordersheets
   */
  async getOrders(options: {
    createdAtFrom: string; // YYYY-MM-DD HH:mm 형식
    createdAtTo: string;
    status?: string; // ACCEPT, INSTRUCT, DEPARTURE, DELIVERING, FINAL_DELIVERY, NONE_TRACKING
    nextToken?: string;
    maxPerPage?: number;
  }): Promise<CoupangOrderListResponse> {
    const { createdAtFrom, createdAtTo, status, nextToken, maxPerPage = 50 } = options;

    const query: Record<string, string> = {
      createdAtFrom: createdAtFrom.replace(' ', '+'),
      createdAtTo: createdAtTo.replace(' ', '+'),
      maxPerPage: String(maxPerPage),
    };

    if (status) query.status = status;
    if (nextToken) query.nextToken = nextToken;

    return this.request<CoupangOrderListResponse>(
      'GET',
      `/v2/providers/openapi/apis/api/v5/vendors/${this.vendorId}/ordersheets`,
      query
    );
  }

  /**
   * 단일 주문 조회 (shipmentBoxId)
   * GET /v2/providers/openapi/apis/api/v5/vendors/{vendorId}/ordersheets/{shipmentBoxId}
   */
  async getOrder(shipmentBoxId: number): Promise<{ code: number; message: string; data: CoupangOrder }> {
    return this.request(
      'GET',
      `/v2/providers/openapi/apis/api/v5/vendors/${this.vendorId}/ordersheets/${shipmentBoxId}`
    );
  }

  /**
   * 상품 준비 중 상태로 변경
   * PUT /v2/providers/openapi/apis/api/v4/vendors/{vendorId}/ordersheets/acknowledgement
   */
  async acknowledgeOrders(shipmentBoxIds: number[]): Promise<{ code: number; message: string; data: { responseList: Array<{ shipmentBoxId: number; succeed: boolean; resultCode: string; resultMessage: string }> } }> {
    return this.request(
      'PUT',
      `/v2/providers/openapi/apis/api/v4/vendors/${this.vendorId}/ordersheets/acknowledgement`,
      {},
      {
        vendorId: this.vendorId,
        shipmentBoxIds,
      }
    );
  }

  /**
   * 모든 상품 조회 (페이지네이션 처리)
   */
  async getAllProducts(): Promise<CoupangProduct[]> {
    const allProducts: CoupangProduct[] = [];
    let nextToken: string | undefined;

    do {
      const result = await this.getProducts({ nextToken, maxPerPage: 100 });
      allProducts.push(...result.data);
      nextToken = result.nextToken;

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } while (nextToken);

    return allProducts;
  }

  /**
   * 연결 테스트
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getProducts({ maxPerPage: 1 });
      return true;
    } catch {
      return false;
    }
  }
}

export function createCoupangClient(accessKey: string, secretKey: string, vendorId: string): CoupangClient {
  return new CoupangClient(accessKey, secretKey, vendorId);
}

export default CoupangClient;

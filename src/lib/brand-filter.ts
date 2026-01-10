/**
 * 브랜드 SKU 필터링 유틸리티
 *
 * SKU 형식: {브랜드접두사}-{상품코드}
 * 예: BRAND1-001, ABC-SKU123
 */

/**
 * SKU가 특정 브랜드의 접두사로 시작하는지 확인
 */
export function matchesSkuPrefix(sku: string | undefined | null, skuPrefix: string): boolean {
  if (!sku || !skuPrefix) return false;

  const normalizedSku = sku.toUpperCase();
  const normalizedPrefix = skuPrefix.toUpperCase();

  // SKU가 접두사로 시작하고, 접두사 다음에 구분자(-, _)가 있는지 확인
  if (normalizedSku.startsWith(normalizedPrefix)) {
    const nextChar = normalizedSku[normalizedPrefix.length];
    // 접두사 바로 다음이 끝이거나, 구분자인 경우 매칭
    return !nextChar || nextChar === '-' || nextChar === '_';
  }

  return false;
}

/**
 * Wildberries 상품 필터링
 */
export function filterWildberriesProducts<T extends { vendorCode?: string }>(
  products: T[],
  skuPrefix: string | null
): T[] {
  if (!skuPrefix) return products;
  return products.filter(p => matchesSkuPrefix(p.vendorCode, skuPrefix));
}

/**
 * Wildberries 판매 데이터 필터링
 */
export function filterWildberriesSales<T extends { supplierArticle?: string }>(
  sales: T[],
  skuPrefix: string | null
): T[] {
  if (!skuPrefix) return sales;
  return sales.filter(s => matchesSkuPrefix(s.supplierArticle, skuPrefix));
}

/**
 * Wildberries 주문 필터링
 */
export function filterWildberriesOrders<T extends { supplierArticle?: string }>(
  orders: T[],
  skuPrefix: string | null
): T[] {
  if (!skuPrefix) return orders;
  return orders.filter(o => matchesSkuPrefix(o.supplierArticle, skuPrefix));
}

/**
 * Wildberries 재고 필터링
 */
export function filterWildberriesStocks<T extends { supplierArticle?: string }>(
  stocks: T[],
  skuPrefix: string | null
): T[] {
  if (!skuPrefix) return stocks;
  return stocks.filter(s => matchesSkuPrefix(s.supplierArticle, skuPrefix));
}

/**
 * OZON 상품 필터링
 */
export function filterOzonProducts<T extends { offer_id?: string }>(
  products: T[],
  skuPrefix: string | null
): T[] {
  if (!skuPrefix) return products;
  return products.filter(p => matchesSkuPrefix(p.offer_id, skuPrefix));
}

/**
 * OZON 주문(Posting) 필터링 - 주문 내 상품 중 하나라도 매칭되면 포함
 */
export function filterOzonPostings<T extends { products: Array<{ offer_id?: string }> }>(
  postings: T[],
  skuPrefix: string | null
): T[] {
  if (!skuPrefix) return postings;
  return postings.filter(posting =>
    posting.products.some(p => matchesSkuPrefix(p.offer_id, skuPrefix))
  );
}

/**
 * OZON 재고 필터링
 */
export function filterOzonStocks<T extends { item_code?: string }>(
  stocks: T[],
  skuPrefix: string | null
): T[] {
  if (!skuPrefix) return stocks;
  return stocks.filter(s => matchesSkuPrefix(s.item_code, skuPrefix));
}

/**
 * 쿠팡 상품 필터링 (externalVendorSku 사용)
 */
export function filterCoupangProducts<T extends { items?: Array<{ externalVendorSku?: string }> }>(
  products: T[],
  skuPrefix: string | null
): T[] {
  if (!skuPrefix) return products;
  return products.filter(p =>
    p.items?.some(item => matchesSkuPrefix(item.externalVendorSku, skuPrefix))
  );
}

/**
 * 쿠팡 주문 필터링
 */
export function filterCoupangOrders<T extends { orderItems: Array<{ externalVendorSkuCode?: string }> }>(
  orders: T[],
  skuPrefix: string | null
): T[] {
  if (!skuPrefix) return orders;
  return orders.filter(order =>
    order.orderItems.some(item => matchesSkuPrefix(item.externalVendorSkuCode, skuPrefix))
  );
}

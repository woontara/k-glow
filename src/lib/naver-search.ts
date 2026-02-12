// 네이버 검색 API를 이용한 상품 이미지 검색

interface NaverShopItem {
  title: string;
  link: string;
  image: string;
  lprice: string;
  hprice: string;
  mallName: string;
  productId: string;
  productType: string;
  brand: string;
  maker: string;
  category1: string;
  category2: string;
  category3: string;
  category4: string;
}

interface NaverSearchResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverShopItem[];
}

/**
 * 네이버 쇼핑 검색 API로 상품 이미지 검색
 */
export async function searchNaverShopping(query: string): Promise<NaverShopItem[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('네이버 API 키가 설정되지 않았습니다. NAVER_CLIENT_ID, NAVER_CLIENT_SECRET 환경변수를 확인하세요.');
  }

  const encodedQuery = encodeURIComponent(query);
  const url = `https://openapi.naver.com/v1/search/shop.json?query=${encodedQuery}&display=5&sort=sim`;

  const response = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`네이버 API 요청 실패: ${response.status} - ${errorText}`);
  }

  const data: NaverSearchResponse = await response.json();
  return data.items || [];
}

/**
 * 상품명으로 이미지 URL 검색
 * 브랜드명을 포함하면 더 정확한 결과를 얻을 수 있음
 */
export async function findProductImage(
  productName: string,
  brandName?: string
): Promise<string | null> {
  try {
    // 검색어 구성: 브랜드명 + 상품명
    const query = brandName ? `${brandName} ${productName}` : productName;

    const items = await searchNaverShopping(query);

    if (items.length === 0) {
      return null;
    }

    // 첫 번째 결과의 이미지 반환
    return items[0].image || null;
  } catch (error) {
    console.error(`[NaverSearch] 이미지 검색 실패 (${productName}):`, error);
    return null;
  }
}

/**
 * 여러 상품의 이미지를 일괄 검색
 * Rate limit 방지를 위해 딜레이 추가
 */
export async function findProductImages(
  products: Array<{ id: string; nameKr: string }>,
  brandName?: string,
  delayMs: number = 200
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  for (const product of products) {
    try {
      const imageUrl = await findProductImage(product.nameKr, brandName);
      if (imageUrl) {
        results.set(product.id, imageUrl);
      }

      // Rate limit 방지
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`[NaverSearch] ${product.nameKr} 이미지 검색 실패:`, error);
    }
  }

  return results;
}

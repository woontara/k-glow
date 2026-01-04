// 브랜드 및 제품 분석 유틸리티
import {
  crawlWebsite,
  filterProductPages,
  extractProductInfo,
  type CrawledPage,
  type ProductInfo,
} from '@/lib/crawler';
import {
  translateProductName,
  translateProductDescription,
  translateIngredients,
} from '@/lib/translator';
import type { AnalyzerInput, AnalyzerOutput, ProductAnalysis, BrandAnalysis } from '@/types';

/**
 * 브랜드 웹사이트 전체 분석
 */
export async function analyzeBrandWebsite(input: AnalyzerInput): Promise<AnalyzerOutput> {
  console.log('🔍 브랜드 분석 시작:', input.websiteUrl);

  // 1. 웹사이트 크롤링
  console.log('📡 웹사이트 크롤링 중...');
  const allPages = await crawlWebsite(input.websiteUrl, 30, input.maxDepth || 3);

  if (allPages.length === 0) {
    throw new Error('웹사이트 크롤링 실패');
  }

  // 2. 제품 페이지 필터링
  console.log('🔎 제품 페이지 필터링 중...');
  const productPages = filterProductPages(allPages);

  if (productPages.length === 0) {
    console.warn('제품 페이지를 찾을 수 없습니다. 전체 페이지에서 분석합니다.');
  }

  // 3. 제품 정보 추출
  console.log('📦 제품 정보 추출 중...');
  const products = productPages.map((page) => extractProductInfo(page));

  // 4. 브랜드 정보 추출
  console.log('🏢 브랜드 정보 추출 중...');
  const brandInfo = extractBrandInfo(allPages[0], products);

  // 5. 번역 (제품별로)
  console.log('🌐 러시아어 번역 중...');
  const translatedProducts = await translateProducts(products.slice(0, 10)); // 최대 10개

  // 6. 브랜드 번역
  const brandNameRu = await translateProductName(brandInfo.name);
  const brandDescRu = await translateProductDescription(brandInfo.description);

  // 7. 시장 분석
  console.log('📊 시장 분석 중...');
  const analysis = analyzeMarketPotential(translatedProducts);

  // 8. 결과 조합
  const brand: BrandAnalysis = {
    name: brandInfo.name,
    nameRu: brandNameRu,
    description: brandInfo.description,
    descriptionRu: brandDescRu,
    logoUrl: brandInfo.logoUrl,
    marketScore: analysis.marketScore,
    strengths: brandInfo.strengths,
    strengthsRu: brandInfo.strengths, // TODO: 번역
  };

  const uniqueCategories = products.map((p) => p.category).filter((c): c is string => !!c);
  const categories = Array.from(new Set(uniqueCategories));

  return {
    brand,
    products: translatedProducts,
    analysis: {
      totalProducts: products.length,
      categories,
      priceRange: calculatePriceRange(products),
      keyIngredients: extractKeyIngredients(products),
      competitiveAdvantage: analysis.competitiveAdvantage,
      recommendedProducts: analysis.recommendedProducts,
    },
  };
}

/**
 * 브랜드 정보 추출
 */
function extractBrandInfo(
  mainPage: CrawledPage,
  products: ProductInfo[]
): {
  name: string;
  description: string;
  logoUrl: string;
  strengths: string[];
} {
  // 브랜드명 (도메인 또는 타이틀에서 추출)
  const name = mainPage.title.split(/[-|]/)[0].trim() || '브랜드명';

  // 브랜드 설명 (첫 페이지 콘텐츠 일부)
  const description = mainPage.content.substring(0, 200).trim() || '한국 화장품 브랜드';

  // 로고 (첫 이미지)
  const logoUrl = mainPage.images[0] || '';

  // 강점 (자동 추론)
  const strengths = inferBrandStrengths(products);

  return {
    name,
    description,
    logoUrl,
    strengths,
  };
}

/**
 * 제품 번역
 */
async function translateProducts(products: ProductInfo[]): Promise<ProductAnalysis[]> {
  const translated: ProductAnalysis[] = [];

  for (const product of products) {
    try {
      const nameRu = await translateProductName(product.name);
      const descriptionRu = await translateProductDescription(product.description);
      const ingredientsRu = product.ingredients
        ? await translateIngredients(product.ingredients)
        : [];

      // 가격 파싱
      const price = parsePrice(product.price);
      const priceRub = price ? price * 0.075 : 0; // 환율 적용

      translated.push({
        name: product.name,
        nameRu,
        category: product.category || '스킨케어',
        price,
        ingredients: product.ingredients || [],
        ingredientsRu,
        description: product.description,
        descriptionRu,
        imageUrls: product.images,
        sellingPoints: extractSellingPoints(product.description),
        sellingPointsRu: [], // TODO: 번역
      });
    } catch (error) {
      console.error('제품 번역 실패:', product.name, error);
    }
  }

  return translated;
}

/**
 * 시장 잠재력 분석
 */
function analyzeMarketPotential(products: ProductAnalysis[]): {
  marketScore: number;
  competitiveAdvantage: string;
  recommendedProducts: string[];
} {
  let score = 50; // 기본 점수

  // 인기 성분 보너스
  const popularIngredients = [
    '히알루론산',
    '나이아신아마이드',
    '레티놀',
    '비타민C',
    '세라마이드',
    '콜라겐',
    'hyaluronic',
    'niacinamide',
    'retinol',
    'vitamin c',
    'ceramide',
    'collagen',
  ];

  for (const product of products) {
    const hasPopularIngredient = product.ingredients.some((ing) =>
      popularIngredients.some((pop) => ing.toLowerCase().includes(pop.toLowerCase()))
    );

    if (hasPopularIngredient) {
      score += 5;
    }
  }

  // 가격 경쟁력 (10,000~50,000원 범위가 러시아에서 인기)
  const affordableProducts = products.filter((p) => p.price >= 10000 && p.price <= 50000);
  score += Math.min(affordableProducts.length * 3, 20);

  // 제품 다양성
  const categories = new Set(products.map((p) => p.category));
  score += categories.size * 2;

  // 최대 100점
  score = Math.min(score, 100);

  // 경쟁 우위
  const competitiveAdvantage = generateCompetitiveAdvantage(products);

  // 추천 제품 (가격 경쟁력 + 인기 성분)
  const recommendedProducts = products
    .filter((p) => p.price >= 10000 && p.price <= 50000)
    .slice(0, 3)
    .map((p) => p.name);

  return {
    marketScore: score,
    competitiveAdvantage,
    recommendedProducts,
  };
}

// ===== 유틸리티 함수 =====

function parsePrice(priceStr?: string): number {
  if (!priceStr) return 0;
  const numbers = priceStr.replace(/[^\d]/g, '');
  return parseInt(numbers) || 0;
}

function calculatePriceRange(products: ProductInfo[]): { min: number; max: number } {
  const prices = products
    .map((p) => parsePrice(p.price))
    .filter((p) => p > 0);

  if (prices.length === 0) {
    return { min: 0, max: 0 };
  }

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

function extractKeyIngredients(products: ProductInfo[]): string[] {
  const ingredientCount: { [key: string]: number } = {};

  for (const product of products) {
    if (product.ingredients) {
      for (const ingredient of product.ingredients) {
        ingredientCount[ingredient] = (ingredientCount[ingredient] || 0) + 1;
      }
    }
  }

  return Object.entries(ingredientCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ing]) => ing);
}

function extractSellingPoints(description: string): string[] {
  const points: string[] = [];

  // 간단한 패턴 매칭
  if (description.includes('수분') || description.includes('보습')) {
    points.push('보습 효과');
  }
  if (description.includes('미백') || description.includes('화이트닝')) {
    points.push('미백 효과');
  }
  if (description.includes('주름') || description.includes('안티에이징')) {
    points.push('주름 개선');
  }
  if (description.includes('진정') || description.includes('민감')) {
    points.push('피부 진정');
  }

  return points;
}

function inferBrandStrengths(products: ProductInfo[]): string[] {
  const strengths: string[] = [];

  if (products.length >= 10) {
    strengths.push('다양한 제품 라인업');
  }

  const hasNaturalIngredients = products.some((p) =>
    p.ingredients?.some((ing) =>
      ['천연', '자연', 'natural', 'organic'].some((keyword) =>
        ing.toLowerCase().includes(keyword.toLowerCase())
      )
    )
  );

  if (hasNaturalIngredients) {
    strengths.push('천연 성분 사용');
  }

  strengths.push('한국 K-뷰티 브랜드');

  return strengths;
}

function generateCompetitiveAdvantage(products: ProductAnalysis[]): string {
  const categories = new Set(products.map((p) => p.category));
  const avgPrice =
    products.reduce((sum, p) => sum + p.price, 0) / products.length;

  let advantage = `${categories.size}개 카테고리에 걸친 `;

  if (avgPrice < 30000) {
    advantage += '합리적인 가격대의 ';
  } else {
    advantage += '프리미엄 ';
  }

  advantage += 'K-뷰티 제품군';

  return advantage;
}

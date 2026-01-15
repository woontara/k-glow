// 브랜드 및 제품 분석 유틸리티 - Claude AI 기반
import {
  crawlWebsite,
  crawlPage,
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
 * Gemini API로 브랜드 2차 정보 수집
 */
async function getBrandInfoFromGemini(brandName: string): Promise<{
  history: string;
  philosophy: string;
  targetAudience: string;
  popularProducts: string[];
  uniqueFeatures: string[];
} | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY 없음 - 2차 정보 수집 스킵');
    return null;
  }

  try {
    const prompt = `한국 화장품 브랜드 "${brandName}"에 대해 다음 정보를 JSON 형식으로 알려주세요:

{
  "history": "브랜드 설립 연도와 간략한 역사 (2-3문장)",
  "philosophy": "브랜드 철학과 핵심 가치 (2-3문장)",
  "targetAudience": "주요 타겟 고객층",
  "popularProducts": ["제품명1", "제품명2", ... 최대 20개까지 브랜드의 대표 제품/인기 제품 나열],
  "uniqueFeatures": ["차별화 포인트 1", "차별화 포인트 2", "차별화 포인트 3"]
}

주의: popularProducts에는 해당 브랜드가 실제로 판매하는 주요 제품들을 최대한 많이 (최대 20개) 나열해주세요.
해당 브랜드를 모르면 null을 반환하세요.
JSON만 출력:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API 오류:', response.status);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text || text === 'null') return null;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Gemini 브랜드 정보 수집 실패:', error);
  }

  return null;
}

/**
 * Claude AI로 브랜드 정보 추출
 */
async function extractBrandInfoWithAI(page: CrawledPage, websiteUrl: string): Promise<{
  name: string;
  description: string;
  logoUrl: string;
  strengths: string[];
}> {
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    console.warn('CLAUDE_API_KEY 없음 - 기본 추출 사용');
    return {
      name: new URL(websiteUrl).hostname.replace('www.', '').split('.')[0],
      description: '한국 화장품 브랜드',
      logoUrl: page.images[0] || '',
      strengths: ['K-뷰티 브랜드'],
    };
  }

  try {
    const prompt = `다음은 화장품 브랜드 웹사이트의 메인 페이지 정보입니다.

URL: ${websiteUrl}
페이지 제목: ${page.title}
페이지 내용 (일부):
${page.content.substring(0, 3000)}

위 정보를 분석하여 다음 JSON 형식으로 브랜드 정보를 추출해주세요:
{
  "name": "브랜드명 (한글 또는 영문)",
  "description": "브랜드 소개 (2-3문장, 브랜드의 특징과 철학)",
  "strengths": ["강점1", "강점2", "강점3"]
}

주의사항:
- 브랜드명은 정확히 추출 (예: 어노브, 이니스프리, 닥터자르트 등)
- 설명은 마케팅 문구가 아닌 실제 브랜드 특징 요약
- 강점은 제품 특징, 성분 철학, 타겟 고객 등 기반

JSON만 출력하세요:`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API 오류: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content[0].text.trim();

    // JSON 파싱
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        name: parsed.name || '브랜드명',
        description: parsed.description || '한국 화장품 브랜드',
        logoUrl: page.images.find(img => img.includes('logo')) || page.images[0] || '',
        strengths: parsed.strengths || ['K-뷰티 브랜드'],
      };
    }
  } catch (error) {
    console.error('AI 브랜드 추출 실패:', error);
  }

  return {
    name: page.title.split(/[-|–]/)[0].trim() || '브랜드명',
    description: '한국 화장품 브랜드',
    logoUrl: page.images[0] || '',
    strengths: ['K-뷰티 브랜드'],
  };
}

/**
 * Claude AI로 제품 목록 추출
 */
async function extractProductsWithAI(pages: CrawledPage[], websiteUrl: string): Promise<ProductInfo[]> {
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    console.warn('CLAUDE_API_KEY 없음 - 제품 추출 스킵');
    return [];
  }

  // 모든 페이지 콘텐츠 합치기
  const allContent = pages.map(p => `[${p.url}]\n제목: ${p.title}\n내용: ${p.content.substring(0, 1500)}`).join('\n\n---\n\n');
  const allImages = pages.flatMap(p => p.images).filter(img =>
    img.includes('product') || img.includes('item') || img.includes('goods') ||
    img.includes('thumb') || img.includes('상품') || img.includes('.jpg') || img.includes('.png')
  );

  try {
    const prompt = `다음은 화장품 브랜드 웹사이트에서 크롤링한 페이지들입니다.

${allContent.substring(0, 6000)}

위 내용에서 화장품 제품 정보를 추출해주세요. 다음 JSON 배열 형식으로 출력:
[
  {
    "name": "제품명 (풀네임)",
    "price": "가격 (원화, 숫자만)",
    "category": "카테고리 (스킨케어/메이크업/헤어케어/바디케어 중 하나)",
    "description": "제품 설명 (1-2문장)"
  }
]

주의사항:
- 실제 판매 제품만 추출 (브랜드명, 회사명 제외)
- 가격이 없으면 "0"으로 표시
- 최대 30개 제품 추출 (발견된 모든 제품)
- 제품명은 풀네임으로 정확하게 (예: "AGE-R 부스터 프로", "레드 아크네 클리어 수딩 크림")

JSON 배열만 출력하세요:`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API 오류: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content[0].text.trim();

    // JSON 배열 파싱
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((p: any, idx: number) => {
        // 제품명 키워드로 이미지 매칭 시도
        const productNameLower = (p.name || '').toLowerCase().replace(/\s+/g, '');
        const matchedImage = allImages.find(img => {
          const imgLower = img.toLowerCase();
          // 제품명의 일부가 이미지 URL에 포함되어 있는지 확인
          const nameWords = productNameLower.split(/[-_]/);
          return nameWords.some((word: string) => word.length > 3 && imgLower.includes(word));
        });

        return {
          name: p.name || `제품 ${idx + 1}`,
          price: p.price || '0',
          category: p.category || '스킨케어',
          description: p.description || '',
          images: matchedImage ? [matchedImage] : [], // 매칭된 이미지만 사용, 없으면 빈 배열
          ingredients: [],
        };
      });
    }
  } catch (error) {
    console.error('AI 제품 추출 실패:', error);
  }

  return [];
}

/**
 * 브랜드 웹사이트 전체 분석 (Claude AI 기반)
 */
export async function analyzeBrandWebsite(input: AnalyzerInput): Promise<AnalyzerOutput> {
  console.log('🔍 브랜드 분석 시작:', input.websiteUrl);

  // 1. 웹사이트 크롤링 (10페이지, 깊이 2로 더 많은 제품 페이지 수집)
  console.log('📡 웹사이트 크롤링 중...');
  const allPages = await crawlWebsite(input.websiteUrl, 10, 2);

  if (allPages.length === 0) {
    throw new Error('웹사이트에 접근할 수 없습니다. URL을 확인해주세요.');
  }

  // 2. Claude AI로 브랜드 정보 추출 (1차 - 웹사이트 기반)
  console.log('🏢 AI 브랜드 분석 중 (1차: 웹사이트)...');
  const brandInfo = await extractBrandInfoWithAI(allPages[0], input.websiteUrl);

  // 3. Gemini로 브랜드 2차 정보 수집 (외부 지식 기반)
  console.log('🔍 브랜드 2차 정보 수집 중 (Gemini)...');
  const geminiInfo = await getBrandInfoFromGemini(brandInfo.name);

  // 브랜드 정보 취합 (1차 + 2차)
  if (geminiInfo) {
    console.log('✅ Gemini 2차 정보 수집 성공');
    // 설명에 역사와 철학 추가
    if (geminiInfo.history || geminiInfo.philosophy) {
      brandInfo.description = `${brandInfo.description}\n\n${geminiInfo.history || ''} ${geminiInfo.philosophy || ''}`.trim();
    }
    // 강점에 차별화 포인트 추가
    if (geminiInfo.uniqueFeatures && geminiInfo.uniqueFeatures.length > 0) {
      brandInfo.strengths = [...new Set([...brandInfo.strengths, ...geminiInfo.uniqueFeatures])];
    }
  }

  // 4. Claude AI로 제품 정보 추출
  console.log('📦 AI 제품 분석 중...');
  let products = await extractProductsWithAI(allPages, input.websiteUrl);

  // Gemini 대표 제품 추가 (중복 제외하고 항상 추가)
  if (geminiInfo?.popularProducts && geminiInfo.popularProducts.length > 0) {
    console.log(`📦 Gemini 제품 ${geminiInfo.popularProducts.length}개 병합 중...`);
    const existingNames = products.map(p => p.name.toLowerCase());
    for (const popularProduct of geminiInfo.popularProducts) {
      const popularLower = popularProduct.toLowerCase();
      // 이미 존재하는 제품인지 확인 (부분 매칭)
      const isDuplicate = existingNames.some(n =>
        n.includes(popularLower) || popularLower.includes(n)
      );
      if (!isDuplicate) {
        products.push({
          name: popularProduct,
          price: '0',
          category: '스킨케어',
          description: `${brandInfo.name}의 대표 제품`,
          images: [],
          ingredients: [],
        });
        existingNames.push(popularLower); // 중복 방지를 위해 추가
      }
    }
    console.log(`📦 총 제품 수: ${products.length}개`);
  }

  // 5. 번역 (모든 제품 - 빠른 번역 모드)
  console.log('🌐 러시아어 번역 중...');
  const translatedProducts = await translateProductsFast(products);

  // 5. 브랜드 번역
  const brandNameRu = await translateProductName(brandInfo.name);
  const brandDescRu = await translateProductDescription(brandInfo.description);

  // 6. 시장 분석
  console.log('📊 시장 분석 중...');
  const analysis = analyzeMarketPotential(translatedProducts);

  // 7. 결과 조합
  const brand: BrandAnalysis = {
    name: brandInfo.name,
    nameRu: brandNameRu,
    description: brandInfo.description,
    descriptionRu: brandDescRu,
    logoUrl: brandInfo.logoUrl,
    marketScore: analysis.marketScore,
    strengths: brandInfo.strengths,
    strengthsRu: brandInfo.strengths,
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];

  console.log('✅ 분석 완료');

  return {
    brand,
    products: translatedProducts,
    analysis: {
      totalProducts: products.length,
      categories,
      priceRange: calculatePriceRange(products),
      keyIngredients: [],
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
 * 빠른 제품 번역 (한 번의 API 호출로 모든 제품 번역)
 */
async function translateProductsFast(products: ProductInfo[]): Promise<ProductAnalysis[]> {
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey || products.length === 0) {
    // API 키 없으면 원문 그대로 반환
    return products.map(p => ({
      name: p.name,
      nameRu: p.name,
      category: p.category || '스킨케어',
      price: parsePrice(p.price),
      ingredients: p.ingredients || [],
      ingredientsRu: [],
      description: p.description,
      descriptionRu: p.description,
      imageUrls: p.images,
      sellingPoints: [],
      sellingPointsRu: [],
    }));
  }

  try {
    // 모든 제품명과 설명을 한 번에 번역 요청
    const productList = products.map((p, i) => `${i + 1}. ${p.name}: ${p.description || '설명 없음'}`).join('\n');

    const prompt = `다음 한국 화장품 제품 목록을 러시아어로 번역해주세요.

${productList}

다음 JSON 배열 형식으로 번역 결과를 출력하세요:
[
  {"nameRu": "러시아어 제품명", "descriptionRu": "러시아어 설명"}
]

- 제품 순서 유지
- 브랜드명은 음역 (예: 어노브 → Анобу)
- 화장품 전문 용어 사용
- JSON 배열만 출력:`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API 오류: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content[0].text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      const translations = JSON.parse(jsonMatch[0]);

      return products.map((p, idx) => ({
        name: p.name,
        nameRu: translations[idx]?.nameRu || p.name,
        category: p.category || '스킨케어',
        price: parsePrice(p.price),
        ingredients: p.ingredients || [],
        ingredientsRu: [],
        description: p.description,
        descriptionRu: translations[idx]?.descriptionRu || p.description,
        imageUrls: p.images,
        sellingPoints: [],
        sellingPointsRu: [],
      }));
    }
  } catch (error) {
    console.error('빠른 번역 실패:', error);
  }

  // 실패 시 원문 반환
  return products.map(p => ({
    name: p.name,
    nameRu: p.name,
    category: p.category || '스킨케어',
    price: parsePrice(p.price),
    ingredients: p.ingredients || [],
    ingredientsRu: [],
    description: p.description,
    descriptionRu: p.description,
    imageUrls: p.images,
    sellingPoints: [],
    sellingPointsRu: [],
  }));
}

/**
 * 제품 번역 (개별 - 레거시)
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

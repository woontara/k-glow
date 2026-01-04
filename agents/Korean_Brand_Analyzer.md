# Korean Brand Analyzer Agent

## 역할
한국 화장품 브랜드 웹사이트를 분석하여 제품 정보를 추출하고, 
러시아어로 번역한 뒤 파트너사 페이지를 자동 생성하는 서브에이전트입니다.

## 입력
```typescript
interface AnalyzerInput {
  websiteUrl: string        // 한국 브랜드 웹사이트 URL
  brandName?: string        // 브랜드명 (선택)
  maxDepth?: number         // 크롤링 깊이 (기본: 3)
  targetCategories?: string[] // 분석할 카테고리 필터
}
```

## 출력
```typescript
interface AnalyzerOutput {
  brand: {
    name: string
    nameRu: string
    description: string
    descriptionRu: string
    logoUrl: string
    marketScore: number       // 1-100 러시아 시장 적합도
    strengths: string[]       // 브랜드 강점
    strengthsRu: string[]
  }
  products: {
    name: string
    nameRu: string
    category: string
    price: number
    ingredients: string[]
    ingredientsRu: string[]
    description: string
    descriptionRu: string
    imageUrls: string[]
    sellingPoints: string[]   // 판매 포인트
    sellingPointsRu: string[]
  }[]
  analysis: {
    totalProducts: number
    categories: string[]
    priceRange: { min: number, max: number }
    keyIngredients: string[]  // 주요 성분 트렌드
    competitiveAdvantage: string
    recommendedProducts: string[] // 러시아 시장 추천 제품 ID
  }
}
```

## 워크플로우

### Step 1: 웹사이트 구조 파악
```
1. 메인 페이지 접근
2. 사이트맵 또는 네비게이션 분석
3. 제품 카테고리 페이지 URL 수집
4. 개별 제품 페이지 URL 수집
```

### Step 2: 제품 정보 크롤링
```
각 제품 페이지에서 추출:
- 제품명
- 가격 (KRW)
- 제품 이미지 (모든 이미지)
- 상세 설명
- 성분표
- 용량/규격
- 사용법
```

### Step 3: 데이터 정제
```
- 중복 제거
- 누락 데이터 표시
- 카테고리 표준화
- 가격 숫자 변환
```

### Step 4: 러시아어 번역
```
Claude API 사용:
- 제품명: 브랜드 톤 유지하며 번역
- 설명: 마케팅 카피 현지화
- 성분: 러시아 화장품 규정 용어 사용
- 효능: 러시아 소비자 관점으로 재구성
```

### Step 5: 시장 분석
```
평가 기준:
- 러시아 인기 성분 포함 여부 (히알루론산, 나이아신아마이드 등)
- 가격 경쟁력 (러시아 시장 기준)
- 카테고리 트렌드 매칭
- 패키지 디자인 적합성
```

### Step 6: 리포트 생성
```
- JSON 형태로 구조화된 데이터 출력
- DB 저장용 포맷
- 파트너사 페이지 렌더링용 데이터
```

## 크롤링 규칙

### 허용
- 공개된 제품 페이지
- 제품 이미지 URL 수집
- 가격 정보

### 금지
- 로그인 필요 페이지
- 개인정보 수집
- 과도한 요청 (rate limit 준수)

### 예외 처리
- robots.txt 확인
- 크롤링 차단 시 관리자 알림
- 타임아웃: 30초/페이지

## 크롤링 셀렉터 가이드

### 일반적인 한국 쇼핑몰 구조
```javascript
const selectors = {
  // 제품 목록 페이지
  productList: '.product-list .item, .prd-list li, .goods-list .item',
  productLink: 'a[href*="product"], a[href*="goods"]',
  
  // 제품 상세 페이지
  productName: '.product-name, .prd-name, h1.name, .goods-name',
  productPrice: '.price, .prd-price, .sale-price, [class*="price"]',
  productImage: '.product-image img, .prd-img img, .goods-img img',
  productDesc: '.product-desc, .prd-detail, .goods-desc, .description',
  ingredients: '.ingredients, .component, [class*="ingredient"]',
  
  // 카테고리 네비게이션
  category: '.category a, .gnb a, .nav-menu a'
}
```

### 동적 페이지 처리
```javascript
// Puppeteer 설정
const browserConfig = {
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  timeout: 30000
}

// 페이지 로드 대기
await page.waitForSelector('.product-list', { timeout: 10000 })
await page.waitForNetworkIdle({ idleTime: 500 })
```

## 번역 프롬프트 템플릿

### 제품명 번역
```
다음 한국 화장품 제품명을 러시아어로 번역해주세요.
브랜드의 감성과 톤을 유지하면서 러시아 소비자에게 자연스럽게 들리도록 해주세요.

제품명: {productName}
브랜드: {brandName}
카테고리: {category}
```

### 성분 번역
```
다음 화장품 성분 목록을 러시아어로 번역해주세요.
러시아 화장품 규정에서 사용하는 공식 용어를 사용해주세요.
INCI 명칭이 있다면 함께 표기해주세요.

성분: {ingredients}
```

## 사용 예시

```typescript
// 분석 요청
const result = await analyzeKoreanBrand({
  websiteUrl: "https://example-cosmetics.co.kr",
  maxDepth: 3,
  targetCategories: ["스킨케어", "선케어"]
});

// 결과 활용
await createPartnerPage(result.brand, result.products);
await saveToDatabase(result);
```

## 의존성
- Puppeteer (동적 페이지 크롤링)
- Cheerio (HTML 파싱)
- Claude API (번역 및 분석)

## 에러 처리

| 에러 코드 | 설명 | 대응 |
|----------|------|------|
| CRAWL_BLOCKED | 크롤링 차단됨 | 관리자에게 수동 처리 요청 |
| PARSE_FAILED | 페이지 구조 파싱 실패 | 다른 셀렉터 시도 |
| TRANSLATE_ERROR | 번역 API 오류 | 재시도 (최대 3회) |
| TIMEOUT | 응답 시간 초과 | 페이지 스킵, 로그 기록 |
| NO_PRODUCTS | 제품을 찾을 수 없음 | 수동 URL 입력 요청 |

## 로깅 포맷

```typescript
interface CrawlLog {
  timestamp: Date
  url: string
  status: 'success' | 'failed' | 'skipped'
  productsFound: number
  errorMessage?: string
  duration: number // ms
}
```

## 성능 최적화

- 동시 요청 제한: 최대 3개
- 요청 간 딜레이: 1-2초 랜덤
- 이미지는 URL만 저장 (다운로드 X)
- 캐싱: 동일 URL 24시간 내 재크롤링 방지

# 브랜드 웹사이트 분석 시스템 가이드

## 개요

K-Glow의 브랜드 분석 시스템은 한국 화장품 브랜드 웹사이트를 자동으로 크롤링하고, Claude AI로 러시아어 번역하며, 러시아 시장 적합도를 분석합니다.

## 주요 기능

### 1. 웹 크롤링 (Crawler)

**위치**: `src/lib/crawler/index.ts`

#### 기능

- **단일 페이지 크롤링**: HTML 파싱 및 정보 추출
- **전체 사이트 크롤링**: BFS 방식으로 전체 사이트 탐색
- **제품 정보 추출**: 제품명, 가격, 설명, 이미지, 성분 추출
- **제품 페이지 필터링**: 제품 관련 페이지만 선별

#### 크롤링 제한

- 최대 페이지: 30개 (조절 가능)
- 최대 깊이: 3단계 (조절 가능)
- Rate limiting: 페이지당 1초 대기
- 타임아웃: 30초/페이지

#### 사용 예시

```typescript
import { crawlWebsite, filterProductPages } from '@/lib/crawler';

// 웹사이트 전체 크롤링
const pages = await crawlWebsite('https://example.com', 20, 2);

// 제품 페이지만 필터링
const productPages = filterProductPages(pages);
```

### 2. AI 번역 (Translator)

**위치**: `src/lib/translator/index.ts`

#### 기능

- **Claude API 기반 번역**: GPT 대비 우수한 한-러 번역 품질
- **맥락 기반 번역**: 화장품 전문 용어 정확히 번역
- **일괄 번역**: 여러 텍스트를 한 번에 번역
- **특화 번역 함수**:
  - `translateProductName()`: 제품명 번역
  - `translateProductDescription()`: 마케팅 카피 현지화
  - `translateIngredients()`: 성분 전문 용어 번역

#### 번역 프롬프트 구조

```
다음 텍스트를 러시아어로 번역해주세요.

[맥락: 화장품 제품명 - 브랜드 톤을 유지하며 자연스럽게 번역]

원문:
수분 크림

번역 시 주의사항:
- 자연스러운 러시아어 표현 사용
- 화장품 업계 전문 용어 정확히 번역
- 브랜드 이미지와 톤 유지
- 번역문만 출력 (설명 불필요)

번역:
```

#### Rate Limiting

- Claude API는 분당 요청 수 제한
- 각 번역 후 500ms 대기
- API 키 없으면 기본 텍스트 반환

### 3. 브랜드 분석 (Analyzer)

**위치**: `src/lib/analyzer/index.ts`

#### 분석 프로세스

```
1. 웹사이트 크롤링
   ↓
2. 제품 페이지 필터링
   ↓
3. 제품 정보 추출
   ↓
4. 브랜드 정보 추출
   ↓
5. 러시아어 번역
   ↓
6. 시장 분석
   ↓
7. 결과 반환
```

#### 시장 적합도 점수 계산

기본 점수: 50점

**보너스 요소**:
- 인기 성분 포함 (히알루론산, 나이아신아마이드 등): +5점/제품
- 가격 경쟁력 (10,000~50,000원): +3점/제품 (최대 20점)
- 제품 카테고리 다양성: +2점/카테고리

**최대 점수**: 100점

#### 경쟁 우위 분석

자동으로 다음을 분석:
- 제품 카테고리 수
- 평균 가격대
- 주요 성분
- K-뷰티 브랜드 강점

### 4. API 엔드포인트

**POST /api/analyze-website**

```typescript
// 요청
{
  "websiteUrl": "https://example.com",
  "maxDepth": 2,
  "saveToDb": true
}

// 응답
{
  "brand": {
    "name": "브랜드명",
    "nameRu": "Название бренда",
    "description": "설명",
    "descriptionRu": "Описание",
    "logoUrl": "https://...",
    "marketScore": 85,
    "strengths": ["천연 성분", "K-뷰티"],
    "strengthsRu": [...]
  },
  "products": [
    {
      "name": "수분 크림",
      "nameRu": "Увлажняющий крем",
      "category": "스킨케어",
      "price": 35000,
      "ingredients": [...],
      "ingredientsRu": [...],
      "description": "...",
      "descriptionRu": "...",
      "imageUrls": [...],
      "sellingPoints": [...],
      "sellingPointsRu": [...]
    }
  ],
  "analysis": {
    "totalProducts": 15,
    "categories": ["스킨케어", "메이크업"],
    "priceRange": { "min": 10000, "max": 50000 },
    "keyIngredients": ["히알루론산", ...],
    "competitiveAdvantage": "2개 카테고리에 걸친 합리적인 가격대의 K-뷰티 제품군",
    "recommendedProducts": [...]
  }
}
```

## 사용 방법

### 1. 프론트엔드에서 분석 요청

```typescript
const response = await fetch('/api/analyze-website', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    websiteUrl: 'https://example-cosmetics.co.kr',
    maxDepth: 2,
    saveToDb: true,
  }),
});

const result = await response.json();
```

### 2. 결과 처리

- `saveToDb: true`: 파트너사 및 제품을 DB에 자동 저장
- `saveToDb: false`: 분석 결과만 반환 (DB 저장 안 함)

## Claude API 설정

### 1. API 키 발급

1. [Anthropic Console](https://console.anthropic.com) 접속
2. API Keys 메뉴에서 새 키 발급
3. `.env` 파일에 추가:

```env
CLAUDE_API_KEY=sk-ant-api03-...
```

### 2. 비용

- **모델**: Claude 3.5 Sonnet
- **가격**: $3 / 1M input tokens, $15 / 1M output tokens
- **예상 비용**:
  - 제품 1개 번역: 약 $0.01
  - 브랜드 전체 분석 (10개 제품): 약 $0.10

무료 크레딧: $5 (신규 가입 시)

## 제한사항

### 1. 크롤링 제한

- **robots.txt 준수**: 크롤링 금지된 사이트는 분석 불가
- **동적 콘텐츠**: JavaScript로 로드되는 콘텐츠는 추출 안 됨
  - 해결: Puppeteer 사용 (추가 구현 필요)
- **반응형 차단**: 일부 사이트는 봇 차단 가능

### 2. 번역 제한

- **API 키 필수**: Claude API 키 없으면 번역 스킵
- **Rate Limit**: 분당 요청 수 제한 (Free tier: 50/min)
- **비용**: 많은 제품 번역 시 비용 발생

### 3. 정확도 제한

- **HTML 구조 의존**: 사이트 구조에 따라 정보 추출 실패 가능
- **가격 파싱**: 다양한 가격 표기 방식 대응 필요
- **성분 추출**: 정형화되지 않은 성분 표기는 추출 어려움

## 최적화 팁

### 1. 크롤링 최적화

```typescript
// 빠른 분석 (주요 페이지만)
await analyzeBrandWebsite({
  websiteUrl: url,
  maxDepth: 1,  // 메인 페이지 + 링크된 페이지만
});

// 상세 분석 (전체 사이트)
await analyzeBrandWebsite({
  websiteUrl: url,
  maxDepth: 3,  // 3단계까지 탐색
});
```

### 2. 번역 최적화

- 제품 수가 많으면 상위 10개만 번역
- 동일 텍스트 반복 번역 방지 (캐시 추가 권장)
- 간단한 텍스트는 사전 기반 번역 사용

### 3. 비용 절감

- API 키 없이도 크롤링 및 추출은 작동
- 번역이 필수가 아니면 `CLAUDE_API_KEY` 생략 가능
- 제품 수 제한 (`products.slice(0, 10)`)

## 향후 개발 계획

- [ ] Puppeteer 통합 (동적 콘텐츠 크롤링)
- [ ] 번역 캐시 시스템
- [ ] 이미지 분석 (제품 이미지 자동 태깅)
- [ ] 경쟁사 비교 분석
- [ ] 자동 SEO 최적화 제안
- [ ] 다국어 지원 (영어, 중국어)

## 문제 해결

### 1. 크롤링 실패

**증상**: "웹사이트 크롤링 실패" 에러

**원인**:
- 네트워크 오류
- robots.txt 차단
- 타임아웃

**해결**:
1. URL이 올바른지 확인
2. 사이트가 접속 가능한지 확인
3. maxDepth를 낮춰서 재시도

### 2. 번역 실패

**증상**: "[번역 필요: ...]" 형태로 표시

**원인**:
- Claude API 키 미설정
- API 요청 한도 초과
- 네트워크 오류

**해결**:
1. `.env`에 `CLAUDE_API_KEY` 설정 확인
2. API 사용량 확인 (Anthropic Console)
3. 잠시 후 재시도

### 3. 제품 정보 누락

**증상**: 일부 제품 정보가 비어 있음

**원인**:
- 비표준 HTML 구조
- 이미지/텍스트가 JavaScript로 로드됨

**해결**:
1. 해당 사이트의 HTML 구조 확인
2. 크롤러 로직 커스터마이징
3. Puppeteer 사용 고려

## 예제 사이트

테스트용 공개 웹사이트:
- [Innisfree](https://www.innisfree.com)
- [Etude House](https://www.etudehouse.com)
- [Laneige](https://www.laneige.com)

주의: 실제 분석 전 robots.txt 확인 필수

# K-Glow (케이글로우) 웹앱 프로젝트 요청서

## 1. 프로젝트 개요

**프로젝트명**: K-Glow Platform  
**목적**: 한국 중소 화장품 브랜드의 러시아/CIS 시장 진출을 지원하는 B2B 플랫폼  
**핵심 가치**: 인증 대행 + 견적 자동화 + 파트너사 제품 정보 자동 분석/번역

---

## 2. 비즈니스 배경

### 2.1 문제 정의
- 한국 중소 화장품 브랜드들이 해외 시장 진출을 원하지만 인력/자본력 부족
- 러시아 수출 시 까다로운 인증 절차 (EAC 인증 등)
- 언어 장벽으로 인한 유통 걸림돌

### 2.2 솔루션
- 러시아 현지 파트너(이리나)와 협력 체계 구축
- 현지 창고, 오프라인 매장, 온라인 판매 채널 확보
- 인증 대행 서비스 제공

### 2.3 타겟 유저
1. **한국 화장품 브랜드 (메인 고객)**: 러시아 시장 진출 희망 업체
2. **러시아/CIS 바이어**: 한국 화장품 구매 희망 도매상/소매상
3. **내부 관리자**: 케이글로우 운영팀

---

## 3. 핵심 기능 요구사항

### 3.1 인증서 발급 대행 요청 시스템

```
[기능 상세]
- 한국 화장품 업체가 회원가입/로그인
- 인증 대행 신청 폼 작성
  - 제품 정보 입력 (성분, 용량, 카테고리 등)
  - 필요 서류 업로드
  - 희망 인증 종류 선택 (EAC, GOST 등)
- 신청 현황 트래킹 대시보드
- 관리자 승인/반려 프로세스
```

### 3.2 견적 계산기

```
[기능 상세]
- 실시간 환율 조회 (KRW ↔ RUB, USD)
- 배송비 계산
  - 무게/부피 기반 운송비
  - 항공/해상 옵션
  - 출발지/도착지 설정
- 관세/부가세 자동 계산
- 인증 비용 포함 총 견적서 생성
- PDF 견적서 다운로드
```

### 3.3 파트너사 웹사이트 분석 시스템 ⭐ (핵심 기능)

```
[기능 상세]
입력: 한국 브랜드 웹사이트 URL

처리 과정:
1. 웹사이트 전체 크롤링 (모든 뎁스)
   - 제품 페이지 탐색
   - 제품명, 가격, 성분, 이미지, 설명 추출
   
2. 제품 정보 분석
   - 제품 카테고리 자동 분류
   - 핵심 성분 추출 및 효능 분석
   - 가격대 분석
   
3. 러시아어 번역
   - 제품명, 설명, 성분표 번역
   - 마케팅 카피 현지화
   
4. 브랜드 인텔리전스 리포트 생성
   - 브랜드 인지도 지표
   - 예상 판매량/잠재력
   - 경쟁사 대비 장점
   - 러시아 시장 적합도 점수

출력: 파트너사 상세 페이지 자동 생성
```

---

## 4. 프로젝트 폴더 구조

```
k-glow/
├── SKILL.md                          # 🔴 프로젝트 스킬 정의 (Claude Code 필독)
├── agents/                           # 🔴 서브에이전트 정의
│   └── Korean_Brand_Analyzer.md      # 🔴 브랜드 웹사이트 분석 에이전트
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # 홈
│   │   ├── partners/
│   │   │   ├── page.tsx              # 파트너사 목록
│   │   │   └── [id]/page.tsx         # 파트너사 상세
│   │   ├── certification/
│   │   │   ├── new/page.tsx          # 인증 신청
│   │   │   └── status/page.tsx       # 신청 현황
│   │   ├── calculator/page.tsx       # 견적 계산기
│   │   ├── analyze/page.tsx          # 웹사이트 분석 도구
│   │   ├── auth/                     # 인증 관련
│   │   └── admin/                    # 관리자 대시보드
│   ├── components/                   # 공통 컴포넌트
│   ├── lib/                          # 유틸리티, API 클라이언트
│   │   ├── crawler/                  # 웹 크롤링 모듈
│   │   ├── translator/               # 번역 모듈
│   │   └── analyzer/                 # 분석 모듈
│   └── types/                        # TypeScript 타입 정의
├── prisma/
│   └── schema.prisma                 # DB 스키마
├── public/                           # 정적 파일
└── docs/                             # 프로젝트 문서
```

---

## 5. 기술 스택 제안

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **상태관리**: Zustand 또는 React Query

### Backend
- **API**: Next.js API Routes 또는 별도 백엔드 (FastAPI)
- **Database**: PostgreSQL + Prisma ORM
- **인증**: NextAuth.js 또는 Clerk

### 핵심 기능 구현
- **웹 크롤링**: Puppeteer / Playwright / Cheerio
- **번역**: Claude API / DeepL API
- **환율**: 한국은행 API / ExchangeRate-API
- **PDF 생성**: react-pdf 또는 puppeteer

### 배포
- **호스팅**: Vercel 또는 AWS
- **DB**: Supabase 또는 PlanetScale

---

## 6. 개발 우선순위

### Phase 1: MVP (최소 기능)
1. [ ] 프로젝트 초기 세팅 (Next.js + DB)
2. [ ] 인증 시스템 (회원가입/로그인)
3. [ ] 견적 계산기 기본 기능
4. [ ] 인증 대행 신청 폼

### Phase 2: 핵심 기능
5. [ ] 웹사이트 크롤링 엔진
6. [ ] 제품 정보 분석 시스템
7. [ ] 러시아어 번역 통합
8. [ ] 파트너사 페이지 자동 생성

### Phase 3: 고도화
9. [ ] 관리자 대시보드
10. [ ] 실시간 환율 API 연동
11. [ ] PDF 견적서 생성
12. [ ] 알림 시스템 (이메일/카카오톡)

---

## 7. 데이터 모델 초안

```typescript
// 파트너사 (한국 브랜드)
interface Partner {
  id: string
  name: string
  nameRu: string          // 러시아어 브랜드명
  websiteUrl: string
  logoUrl: string
  description: string
  descriptionRu: string
  marketScore: number     // 러시아 시장 적합도
  createdAt: Date
}

// 제품
interface Product {
  id: string
  partnerId: string
  name: string
  nameRu: string
  category: string
  price: number
  priceRub: number
  ingredients: string[]
  ingredientsRu: string[]
  description: string
  descriptionRu: string
  imageUrls: string[]
}

// 인증 신청
interface CertificationRequest {
  id: string
  userId: string
  partnerId: string
  certType: 'EAC' | 'GOST' | 'OTHER'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
  documents: string[]
  estimatedCost: number
  createdAt: Date
}

// 견적
interface Quote {
  id: string
  userId: string
  products: QuoteProduct[]
  totalKrw: number
  totalRub: number
  shippingCost: number
  certificationCost: number
  exchangeRate: number
  createdAt: Date
}
```

---

## 8. 참고 사항

### 협력 파트너
- **이리나**: 러시아 현지 파트너
  - 창고 보유
  - 오프라인 매장 운영
  - 온라인 판매 채널 보유

### 인증 관련
- EAC (Eurasian Conformity): 유라시아 경제 연합 인증
- 화장품 필수 서류: 성분 분석표, 안전성 테스트 결과 등

### 환율 기준
- KRW/RUB 실시간 환율 필요
- 마진율 설정 기능 (관리자)

---

## 9. 질문/확인 사항

개발 시작 전 확인이 필요한 사항:

1. [ ] 도메인/호스팅 환경 결정
2. [ ] 결제 시스템 필요 여부
3. [ ] 다국어 지원 범위 (한국어, 러시아어, 영어?)
4. [ ] 기존 보유 API 키 (Claude, 환율 등)
5. [ ] 브랜딩 가이드라인 (로고, 컬러 등)

---

## 10. SKILL.md (프로젝트 루트에 생성)

```markdown
# K-Glow Platform Development Skill

## Overview
K-Glow는 한국 중소 화장품 브랜드의 러시아/CIS 시장 진출을 지원하는 B2B 플랫폼입니다.

## Project Context
- **비즈니스**: 한국 화장품 → 러시아 수출 유통
- **핵심 기능**: 인증 대행, 견적 계산, 브랜드 웹사이트 분석/번역
- **기술 스택**: Next.js 14+, TypeScript, Tailwind CSS, Prisma, PostgreSQL

## Development Guidelines

### 코드 스타일
- TypeScript strict 모드 사용
- 한글 주석 허용 (비즈니스 로직 설명 시)
- 컴포넌트는 함수형 + hooks 패턴
- API는 RESTful 규칙 준수

### 폴더 규칙
- 페이지: `src/app/` (App Router)
- 컴포넌트: `src/components/` (기능별 하위 폴더)
- 비즈니스 로직: `src/lib/`
- 타입 정의: `src/types/`

### 핵심 모듈
1. **Crawler** (`src/lib/crawler/`): 한국 브랜드 웹사이트 크롤링
2. **Translator** (`src/lib/translator/`): Claude API 기반 번역
3. **Analyzer** (`src/lib/analyzer/`): 제품/브랜드 분석 로직

### 서브에이전트
복잡한 작업은 서브에이전트에게 위임합니다:
- `agents/Korean_Brand_Analyzer.md`: 브랜드 웹사이트 분석 전담

### 환경 변수 (필수)
```env
DATABASE_URL=
CLAUDE_API_KEY=
EXCHANGE_RATE_API_KEY=
NEXT_PUBLIC_APP_URL=
```

### 커밋 컨벤션
- feat: 새 기능
- fix: 버그 수정
- docs: 문서 수정
- refactor: 리팩토링
- style: 포맷팅

## Quick Commands
```bash
# 개발 서버
npm run dev

# DB 마이그레이션
npx prisma migrate dev

# 타입 생성
npx prisma generate

# 빌드
npm run build
```
```

---

## 11. Korean_Brand_Analyzer.md (agents/ 폴더에 생성)

```markdown
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
```

---

*문서 작성일: 2025년 1월 2일*  
*작성자: Claude (희웅 요청)*

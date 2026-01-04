# 파트너사 관리 시스템 가이드

## 개요

파트너사 관리 시스템은 K-Glow와 협력하는 한국 화장품 브랜드를 관리하고, 제품 정보를 표시하는 기능을 제공합니다.

## 주요 기능

### 1. 파트너사 목록 (`/partners`)

**기능**:
- 등록된 모든 파트너사 표시
- 시장 점수 기준 정렬 (높은 순)
- 브랜드명 검색
- 통계 정보 표시 (총 파트너사, 평균 점수, 총 제품 수)

**표시 정보**:
- 브랜드명 (한글/러시아어)
- 브랜드 설명
- 시장 적합도 점수
- 제품 개수
- 공식 웹사이트 링크

### 2. 파트너사 상세 (`/partners/[id]`)

**기능**:
- 파트너사 상세 정보 표시
- 모든 제품 목록 표시
- 제품별 상세 정보 (이미지, 가격, 성분)

**표시 정보**:
- 브랜드 로고
- 브랜드 설명 (한글/러시아어)
- 시장 적합도 점수 (진행 바)
- 제품 목록
  - 제품 이미지
  - 제품명 (한글/러시아어)
  - 카테고리
  - 가격 (원화/루블)
  - 설명
  - 주요 성분

## API 엔드포인트

### 파트너사 목록 조회

```http
GET /api/partners
```

**쿼리 파라미터**:
- `limit`: 최대 개수 (기본: 20)
- `offset`: 시작 위치 (기본: 0)
- `search`: 검색 키워드 (브랜드명/설명)

**응답 예시**:
```json
{
  "partners": [
    {
      "id": "clx...",
      "name": "뷰티브랜드",
      "nameRu": "Бьюти Бренд",
      "websiteUrl": "https://example.com",
      "logoUrl": "https://...",
      "description": "한국의 우수한 화장품 브랜드",
      "descriptionRu": "Отличный корейский косметический бренд",
      "marketScore": 85,
      "productCount": 15,
      "createdAt": "2025-01-02T..."
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

### 파트너사 상세 조회

```http
GET /api/partners/[id]
```

**응답 예시**:
```json
{
  "id": "clx...",
  "name": "뷰티브랜드",
  "nameRu": "Бьюти Бренд",
  "websiteUrl": "https://example.com",
  "logoUrl": "https://...",
  "description": "한국의 우수한 화장품 브랜드",
  "descriptionRu": "Отличный корейский косметический бренд",
  "marketScore": 85,
  "createdAt": "2025-01-02T...",
  "updatedAt": "2025-01-02T...",
  "products": [
    {
      "id": "clx...",
      "name": "수분 세럼",
      "nameRu": "Увлажняющая сыворотка",
      "category": "스킨케어",
      "price": 35000,
      "priceRub": 2625,
      "ingredients": ["히알루론산", "나이아신아마이드"],
      "ingredientsRu": ["Гиалуроновая кислота", "Ниацинамид"],
      "description": "피부에 수분을 공급하는 세럼",
      "descriptionRu": "Сыворотка, увлажняющая кожу",
      "imageUrls": ["https://..."]
    }
  ]
}
```

## 컴포넌트

### PartnerCard

파트너사 카드 컴포넌트

**Props**:
```typescript
interface PartnerCardProps {
  id: string;
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  logoUrl?: string;
  marketScore: number;
  productCount: number;
  websiteUrl: string;
}
```

**기능**:
- 시장 점수에 따른 색상 표시
  - 80점 이상: 녹색 (우수)
  - 60-79점: 파랑 (양호)
  - 40-59점: 노랑 (보통)
  - 40점 미만: 회색 (낮음)
- 클릭 시 상세 페이지 이동
- 웹사이트 링크 (새 탭)

## 데이터 흐름

### 파트너사 등록

브랜드 분석 → 파트너사 자동 생성

```typescript
// /analyze 페이지에서 분석 완료 후
POST /api/analyze-website
{
  "websiteUrl": "https://example.com",
  "saveToDb": true  // 파트너사로 저장
}

// DB에 자동 저장
Partner {
  name: "브랜드명",
  nameRu: "번역된 브랜드명",
  marketScore: 85,
  ...
}

Product[] {
  partnerId: partner.id,
  name: "제품명",
  ...
}
```

### 파트너사 조회

```
1. 사용자 → /partners 접속
2. 프론트엔드 → GET /api/partners
3. API → Prisma → SQLite/PostgreSQL
4. 데이터 반환 → 화면 표시
```

## 데이터베이스 스키마

### Partner 모델

```prisma
model Partner {
  id            String   @id @default(cuid())
  name          String
  nameRu        String
  websiteUrl    String
  logoUrl       String?
  description   String
  descriptionRu String
  marketScore   Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  products      Product[]

  @@map("partners")
}
```

### Product 모델

```prisma
model Product {
  id            String   @id @default(cuid())
  partnerId     String
  partner       Partner  @relation(...)

  name          String
  nameRu        String
  category      String
  price         Float
  priceRub      Float
  ingredients   Json     // String[]
  ingredientsRu Json     // String[]
  description   String
  descriptionRu String
  imageUrls     Json     // String[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("products")
}
```

## 사용 예시

### 1. 파트너사 목록 보기

```bash
# 브라우저에서
http://localhost:3000/partners
```

### 2. 브랜드 검색

파트너사 목록 페이지 → 검색창에 "뷰티" 입력 → 검색 버튼

### 3. 파트너사 상세 보기

파트너사 카드 클릭 → 상세 페이지로 이동

### 4. 프로그래밍 방식으로 조회

```typescript
// 파트너사 목록
const response = await fetch('/api/partners?limit=10');
const { partners } = await response.json();

// 파트너사 상세
const response = await fetch('/api/partners/clx123...');
const partner = await response.json();
```

## UI/UX 특징

### 1. 반응형 디자인

- 모바일: 1열
- 태블릿: 2열
- 데스크톱: 3열

### 2. 로딩 상태

회전하는 스피너 + 안내 메시지 표시

### 3. 빈 상태

파트너사가 없을 때:
- 안내 메시지 표시
- "브랜드 분석하러 가기" 버튼 제공

### 4. 에러 처리

- 파트너사를 찾을 수 없음 → 404 메시지
- 네트워크 오류 → 에러 메시지 표시
- 목록으로 돌아가기 버튼 제공

## 향후 개발 계획

- [ ] 정렬 옵션 (이름순, 점수순, 최신순)
- [ ] 필터링 (카테고리별, 점수 범위)
- [ ] 페이지네이션 (무한 스크롤)
- [ ] 파트너사 편집 기능 (관리자)
- [ ] 즐겨찾기 기능
- [ ] 파트너사 비교 기능
- [ ] 엑셀/CSV 내보내기
- [ ] 제품 상세 페이지 (개별)

## 성능 최적화

### 1. 이미지 최적화

현재: `<img>` 태그 사용
권장: Next.js `<Image>` 컴포넌트 사용

```typescript
import Image from 'next/image';

<Image
  src={logoUrl}
  alt={name}
  width={128}
  height={128}
  className="..."
/>
```

### 2. 데이터 캐싱

API 응답 캐싱 (향후 구현):

```typescript
// API Route에서
export const revalidate = 60; // 60초 캐시
```

### 3. 무한 스크롤

현재: 모든 파트너사 한 번에 로드
개선: 스크롤 시 추가 로드

```typescript
const [offset, setOffset] = useState(0);

const loadMore = async () => {
  const response = await fetch(`/api/partners?offset=${offset}&limit=20`);
  const { partners } = await response.json();
  setPartners(prev => [...prev, ...partners]);
  setOffset(offset + 20);
};
```

## 문제 해결

### 1. 파트너사 목록이 비어 있음

**원인**: DB에 파트너사가 없음

**해결**:
1. `/analyze` 페이지로 이동
2. 브랜드 웹사이트 분석
3. "DB에 저장" 옵션 체크
4. 분석 완료 후 `/partners`에서 확인

### 2. 이미지가 표시되지 않음

**원인**:
- 잘못된 이미지 URL
- CORS 문제
- 이미지 서버 다운

**해결**:
- `onError` 핸들러로 이미지 숨김 처리 (이미 구현됨)
- 플레이스홀더 이미지 표시 (향후 추가)

### 3. 검색이 작동하지 않음

**원인**: SQLite는 대소문자 구분 없는 검색 지원

**확인**:
```sql
-- Prisma는 자동으로 LIKE 쿼리 사용
WHERE name LIKE '%검색어%' OR nameRu LIKE '%검색어%'
```

## 보안 고려사항

### 1. XSS 방지

React는 기본적으로 XSS 방지하지만, `dangerouslySetInnerHTML` 사용 금지

### 2. SQL Injection 방지

Prisma ORM이 자동으로 방지

### 3. API 인증 (향후 추가)

관리자만 파트너사 편집/삭제 가능하도록:

```typescript
// 미들웨어에서 권한 확인
if (user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

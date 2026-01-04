# K-Glow Platform

한국 중소 화장품 브랜드의 러시아/CIS 시장 진출을 지원하는 B2B 플랫폼

## 주요 기능

### ✅ 1. 견적 계산기

실시간 환율을 반영한 러시아 수출 견적 자동 계산

- 실시간 KRW ↔ RUB 환율 조회
- 배송비 자동 계산 (항공/해상)
- 관세(6.5%) 및 부가세(20%) 자동 계산
- 인증 비용 포함 (EAC, GOST)
- 한글/루블 동시 표시

**페이지**: `/calculator`

### ✅ 2. 브랜드 웹사이트 분석

한국 화장품 브랜드 웹사이트를 자동으로 분석하고 러시아어 번역

- 웹사이트 자동 크롤링
- 제품 정보 자동 추출 (제품명, 가격, 성분, 이미지)
- Claude AI 기반 러시아어 번역
- 러시아 시장 적합도 분석 (0-100점)
- 파트너사 자동 등록

**페이지**: `/analyze`

### 🚧 3. 인증 대행 신청 (준비 중)

러시아 화장품 인증(EAC, GOST) 대행 서비스

- 인증 신청 폼
- 서류 업로드
- 신청 현황 트래킹

**페이지**: `/certification/new`, `/certification/status`

## 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (개발), PostgreSQL (프로덕션)
- **ORM**: Prisma
- **AI**: Claude 3.5 Sonnet (번역 및 분석)
- **Crawling**: Cheerio, Axios, Puppeteer

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일이 이미 생성되어 있습니다. API 키를 추가하세요:

```env
# Claude API (선택 - 번역 기능에 필요)
CLAUDE_API_KEY=sk-ant-api03-...

# Exchange Rate API (선택 - 실시간 환율 조회)
EXCHANGE_RATE_API_KEY=your-key-here
```

API 키 없이도 기본 기능은 작동합니다:
- Claude API 없음 → 번역 스킵, 분석은 진행
- Exchange Rate API 없음 → 고정 환율 사용

### 3. 데이터베이스 확인

로컬 SQLite 데이터베이스가 이미 설정되어 있습니다:

```bash
# 데이터베이스 초기화 (필요시)
npx prisma db push

# Prisma Studio로 DB 확인
npm run db:studio
```

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인하세요.

## 프로젝트 구조

```
k-glow/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── calculator/         # ✅ 견적 계산기
│   │   ├── analyze/            # ✅ 브랜드 분석
│   │   ├── partners/           # 파트너사 목록/상세
│   │   ├── certification/      # 인증 대행 (준비 중)
│   │   └── api/
│   │       ├── exchange-rate/  # 환율 API
│   │       ├── calculate-quote/ # 견적 계산 API
│   │       └── analyze-website/ # 웹사이트 분석 API
│   ├── components/
│   │   ├── calculator/         # 견적 계산기 컴포넌트
│   │   └── analyzer/           # 분석 컴포넌트
│   ├── lib/
│   │   ├── crawler/            # 웹 크롤링 모듈
│   │   ├── translator/         # Claude 번역 모듈
│   │   ├── analyzer/           # 브랜드 분석 로직
│   │   ├── calculator.ts       # 견적 계산 로직
│   │   ├── exchange-rate.ts    # 환율 API
│   │   └── prisma.ts           # Prisma 클라이언트
│   └── types/                  # TypeScript 타입 정의
├── prisma/
│   ├── schema.prisma           # DB 스키마
│   └── dev.db                  # SQLite 데이터베이스
├── docs/                       # 프로젝트 문서
│   ├── calculator-guide.md     # 견적 계산기 가이드
│   └── analyzer-guide.md       # 분석 시스템 가이드
├── agents/                     # 서브에이전트 정의
│   └── Korean_Brand_Analyzer.md
├── SKILL.md                    # 프로젝트 개발 가이드
└── README.md                   # 이 파일
```

## 주요 명령어

```bash
# 개발
npm run dev              # 개발 서버 실행
npm run build            # 프로덕션 빌드
npm run start            # 프로덕션 서버 실행

# 데이터베이스
npm run db:studio        # Prisma Studio (DB GUI)
npm run db:push          # 스키마를 DB에 적용
npm run db:migrate       # 마이그레이션 생성
npm run db:generate      # Prisma 클라이언트 생성

# 테스트
npx tsx test-db.ts       # DB 연결 테스트
```

## API 엔드포인트

### 환율 조회

```http
GET /api/exchange-rate
```

응답:
```json
{
  "krwToRub": 0.075,
  "rubToKrw": 13.33,
  "lastUpdated": "2025-01-02T12:00:00.000Z"
}
```

### 견적 계산

```http
POST /api/calculate-quote
Content-Type: application/json

{
  "items": [
    {
      "name": "수분 크림",
      "quantity": 10,
      "priceKRW": 30000,
      "weight": 0.2,
      "volume": 0.0005
    }
  ],
  "shippingInfo": {
    "method": "sea",
    "origin": "인천",
    "destination": "모스크바",
    "totalWeight": 2,
    "totalVolume": 0.005
  },
  "certificationInfo": {
    "type": "EAC",
    "productCount": 1
  }
}
```

### 웹사이트 분석

```http
POST /api/analyze-website
Content-Type: application/json

{
  "websiteUrl": "https://example-cosmetics.co.kr",
  "maxDepth": 2,
  "saveToDb": true
}
```

## 데이터베이스

### 현재: SQLite (로컬 개발)

- **위치**: `prisma/dev.db`
- **장점**: 설치 불필요, 파일 기반
- **용도**: 로컬 개발 및 테스트

### PostgreSQL로 마이그레이션

프로덕션 배포 시:

1. `prisma/schema.prisma` 수정:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. `.env` 수정:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/k-glow"
   ```

3. 마이그레이션:
   ```bash
   npx prisma db push
   ```

## 개발 가이드

자세한 개발 가이드는 다음 문서를 참고하세요:

- **프로젝트 전체**: [SKILL.md](./SKILL.md)
- **견적 계산기**: [docs/calculator-guide.md](./docs/calculator-guide.md)
- **브랜드 분석**: [docs/analyzer-guide.md](./docs/analyzer-guide.md)

## 라이선스

Proprietary

---

**개발 현황**: MVP 완료 (견적 계산기, 브랜드 분석)
**다음 단계**: 인증 대행 시스템, 파트너사 관리, 사용자 인증

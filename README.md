# K-Glow

> 한국 화장품 브랜드의 러시아/CIS 시장 진출을 돕는 플랫폼

## 프로젝트 개요

K-Glow는 한국의 중소 화장품 브랜드가 러시아/CIS 시장에 진출하는데 필요한 다양한 서비스를 제공하는 웹 플랫폼입니다.

### 주요 기능

#### 1. 웹사이트 크롤링 및 분석 시스템 ✅
- 한국 화장품 브랜드 웹사이트를 자동으로 크롤링
- 제품 정보 자동 수집 (이름, 설명, 가격, 이미지 등)
- AI 기반 브랜드 분석
  - 브랜드 강점 평가 (0-100점)
  - 시장 잠재력 평가 (0-100점)
  - 경쟁력 분석 (0-100점)
  - 브랜드 인지도 추정
  - SWOT 분석 (강점, 약점, 기회)
- 자동 러시아어 번역 (제품명, 설명, 분석 결과)
- 파트너사 분석 대시보드

#### 2. 인증서 발급 대행 시스템 (예정)
- 러시아 인증서 발급 요청 관리
- 진행 상태 추적
- 비용 및 소요 기간 견적

#### 3. 견적 계산기 (예정)
- 실시간 환율 반영
- 배송비 계산
- 인증비용 포함
- 총 비용 산출 (KRW/RUB)

## 기술 스택

### Frontend
- **Next.js 15** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링

### Backend
- **Next.js API Routes** - 서버리스 API
- **Prisma** - ORM
- **PostgreSQL** - 데이터베이스 (Supabase 호환)

### 인증
- **NextAuth.js** - 인증 시스템
- **bcryptjs** - 비밀번호 해싱

### AI & 크롤링
- **OpenAI GPT-4** - AI 분석 및 번역
- **Cheerio** - HTML 파싱
- **Axios** - HTTP 클라이언트

## 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd k-glow
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# Database (Supabase PostgreSQL URL)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OpenAI API
OPENAI_API_KEY="your-openai-api-key"

# Exchange Rate API (선택사항)
EXCHANGE_RATE_API_KEY="your-api-key"
```

### 4. 데이터베이스 마이그레이션

```bash
npx prisma generate
npx prisma db push
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
k-glow/
├── app/
│   ├── api/              # API 라우트
│   │   ├── auth/         # 인증 API
│   │   └── partners/     # 파트너사 API
│   ├── auth/             # 인증 페이지
│   │   ├── signin/       # 로그인
│   │   └── register/     # 회원가입
│   ├── dashboard/        # 대시보드
│   │   └── partners/     # 파트너사 상세
│   └── page.tsx          # 홈페이지
├── components/           # React 컴포넌트
├── lib/
│   ├── prisma.ts        # Prisma 클라이언트
│   ├── scraper/         # 웹 크롤링 유틸리티
│   └── ai/              # AI 분석 및 번역
├── prisma/
│   └── schema.prisma    # 데이터베이스 스키마
└── types/               # TypeScript 타입 정의
```

## 사용 방법

### 1. 회원가입 및 로그인
1. 홈페이지에서 "회원가입" 클릭
2. 이메일, 비밀번호, 회사 정보 입력
3. 로그인

### 2. 파트너사 분석
1. 대시보드로 이동
2. "새 브랜드 분석" 섹션에 웹사이트 URL 입력
3. "분석 시작" 클릭 (1-2분 소요)
4. 분석 완료 후 결과 확인

### 3. 분석 결과 확인
- 브랜드 인지도, 강점, 시장 잠재력, 경쟁력 점수
- SWOT 분석 (강점, 약점, 기회)
- AI 추천사항
- 제품 목록 (한국어/러시아어 전환 가능)

## 데이터베이스 스키마

### 주요 모델

- **User**: 사용자 정보
- **Company**: 화장품 업체 정보
- **Partner**: 분석된 파트너사 정보
- **Product**: 제품 정보 (한국어/러시아어)
- **Analysis**: AI 분석 결과
- **CertificationRequest**: 인증서 발급 요청 (예정)
- **Quote**: 견적 정보 (예정)

## 배포

### Vercel 배포 (권장)

1. Vercel 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 배포

### Supabase 데이터베이스

1. Supabase 프로젝트 생성
2. PostgreSQL 연결 문자열 복사
3. `.env`의 `DATABASE_URL`에 설정

## 로드맵

### ✅ 완료된 기능
- [x] 프로젝트 초기 설정
- [x] 회원가입 및 로그인 시스템
- [x] 웹사이트 크롤링 시스템
- [x] AI 기반 브랜드 분석
- [x] 러시아어 자동 번역
- [x] 파트너사 분석 대시보드

### 🚧 진행 예정
- [ ] 인증서 발급 대행 시스템
- [ ] 견적 계산기 (환율, 배송비)
- [ ] 관리자 대시보드
- [ ] 이메일 알림
- [ ] PDF 보고서 생성

## 라이센스

이 프로젝트는 비공개 프로젝트입니다.

## 문의

문의 사항은 프로젝트 관리자에게 연락해주세요.

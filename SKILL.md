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

## Key Files
| 파일 | 설명 |
|-----|------|
| `SKILL.md` | 이 문서 - 프로젝트 개발 가이드 |
| `agents/Korean_Brand_Analyzer.md` | 브랜드 분석 서브에이전트 정의 |
| `prisma/schema.prisma` | 데이터베이스 스키마 |
| `src/types/index.ts` | 공통 타입 정의 |

## Notes for Claude Code
- 이 프로젝트는 1인 기업이 운영합니다
- 코드는 간결하고 유지보수하기 쉽게 작성해주세요
- 복잡한 로직은 주석으로 설명해주세요
- 에러 핸들링을 꼼꼼히 해주세요

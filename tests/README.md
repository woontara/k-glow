# K-Glow Playwright 테스트 가이드

## 📋 생성된 테스트 파일

### ✅ 완성된 그룹 (병렬 실행 가능)

1. **group1-independent-ui.spec.ts** - 독립 UI 테스트 (14개 시나리오)
   - 네비게이션 (데스크톱/모바일)
   - 홈페이지 레이아웃 및 링크
   - 브랜드 분석 UI
   - 견적 계산기 UI
   - 반응형 테스트
   - 페이지 로드 성능

2. **group2-partners-read.spec.ts** - 파트너사 읽기 테스트 (5개 시나리오)
   - 파트너사 목록 표시
   - 검색 기능
   - 상세 페이지
   - 빈 상태
   - 외부 링크

3. **group3-calculator.spec.ts** - 견적 계산기 테스트 (7개 시나리오)
   - 단일/다중 제품 계산
   - 제품 추가/삭제
   - 배송 방법 변경
   - 인증 비용 계산
   - 환율 실패 처리
   - PDF 다운로드

4. **group9-security-performance.spec.ts** - 보안 및 성능 테스트 (7개 시나리오)
   - XSS 방지
   - SQL Injection 방지
   - 파일 크기 제한
   - 중복 제출 방지
   - 이미지 오류 처리
   - 키보드 네비게이션
   - 네트워크 오류 복구

### 📝 나머지 그룹 (작성 필요)

- **group4-auth-signup.spec.ts** - 회원가입 및 인증 테스트
- **group5-brand-session.spec.ts** - BRAND 세션 테스트
- **group6-certification.spec.ts** - 인증 대행 테스트
- **group7-admin.spec.ts** - 관리자 기능 테스트
- **group8-brand-analysis.spec.ts** - 브랜드 분석 통합 테스트
- **group10-cross-browser.spec.ts** - 크로스 브라우저 테스트

---

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
npx playwright install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

서버가 http://localhost:3003에서 실행되는지 확인하세요.

### 3. 테스트 실행

#### 전체 테스트 실행
```bash
npx playwright test
```

#### 특정 그룹 실행
```bash
# Group 1: 독립 UI 테스트
npx playwright test tests/group1-independent-ui.spec.ts

# Group 2: 파트너사 읽기
npx playwright test tests/group2-partners-read.spec.ts

# Group 3: 계산기
npx playwright test tests/group3-calculator.spec.ts

# Group 9: 보안/성능
npx playwright test tests/group9-security-performance.spec.ts
```

#### 병렬 그룹 한 번에 실행
```bash
npx playwright test tests/group{1,2,3,9}*.spec.ts --workers=4
```

#### UI 모드로 실행 (디버깅)
```bash
npx playwright test --ui
```

#### 헤드풀 모드 (브라우저 보이기)
```bash
npx playwright test --headed
```

---

## 📊 테스트 실행 전략

### 병렬 실행 그룹

완성된 그룹들은 모두 `test.describe.configure({ mode: 'parallel' })` 설정으로 병렬 실행됩니다:

```bash
# 4개 worker로 병렬 실행
npx playwright test tests/group{1,2,3,9}*.spec.ts --workers=4
```

**예상 실행 시간**:
- Group 1: ~30초
- Group 2: ~15초
- Group 3: ~20초
- Group 9: ~25초
- **총 병렬 실행: ~40초** (순차 실행 시 ~90초)

### 순차 실행이 필요한 그룹

다음 그룹들은 상태 의존성으로 인해 순차 실행이 필요합니다 (아직 작성 안 됨):

- Group 4: 회원가입 → 중복 이메일 체크
- Group 6: 인증 신청 → 목록 조회 → 필터링
- Group 7: 관리자 목록 → 상태 변경
- Group 8: 브랜드 분석 → 파트너사 생성 → 조회

---

## 🧪 테스트 데이터 준비

### 필수 데이터

일부 테스트는 기존 데이터가 필요합니다:

1. **파트너사 데이터** (Group 2, 6)
   ```bash
   # 샘플 데이터 생성 스크립트 실행 (있는 경우)
   npx tsx seed-sample-data.ts
   ```

2. **테스트 계정** (Group 1, 3, 4, 5, 7)
   - **REQUIRED**: test@kglow.com / Test123456! (for calculator tests in Group 1 & 3)
   - ADMIN: admin@k-glow.com / admin123!@#
   - BRAND: brand@test.com / brand123!@#

   **중요**: Group 1의 견적 계산기 테스트 (5.1, 5.7) 및 Group 3의 모든 테스트는 인증이 필요합니다.
   테스트 실행 전에 위의 test@kglow.com 계정이 데이터베이스에 존재해야 합니다.

   **테스트 사용자 생성 방법**:
   ```bash
   # 테스트 사용자 생성
   npx tsx scripts/seed-test-user.ts

   # 또는 관리자 계정 생성
   npx tsx scripts/seed-admin.ts
   ```

### 데이터 초기화

```bash
# 데이터베이스 리셋 (개발 환경)
npx prisma db push --force-reset

# 테스트 사용자 및 샘플 데이터 생성
npx tsx scripts/seed-test-user.ts
npx tsx seed-sample-data.ts
```

---

## 🐛 디버깅

### 1. 특정 테스트만 실행

```typescript
test.only('테스트 이름', async ({ page }) => {
  // 이 테스트만 실행됨
});
```

### 2. 스크린샷 확인

실패한 테스트의 스크린샷은 `test-results/` 폴더에 저장됩니다.

### 3. 트레이스 확인

```bash
npx playwright test --trace on
npx playwright show-trace trace.zip
```

### 4. 느린 테스트 모드

```bash
npx playwright test --headed --slow-mo=1000
```

---

## 📝 테스트 작성 가이드

### 테스트 구조

```typescript
import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' }); // 병렬 실행

test.describe('그룹명', () => {

  test('시나리오 이름', async ({ page }) => {
    // 1. 페이지 이동
    await page.goto('/path');

    // 2. 요소 조작
    await page.click('button');
    await page.fill('input', 'value');

    // 3. 검증
    await expect(page.locator('text')).toBeVisible();
    await expect(page).toHaveURL('/expected');
  });
});
```

### 일반적인 패턴

#### 1. 안전한 요소 선택

```typescript
// 여러 선택자 시도
const button = page.locator('button:has-text("클릭")')
  .or(page.locator('[aria-label="클릭"]'));

if (await button.count() > 0) {
  await button.click();
}
```

#### 2. 다이얼로그 처리

```typescript
page.once('dialog', dialog => {
  expect(dialog.message()).toContain('예상 메시지');
  dialog.accept();
});

await page.click('button');
```

#### 3. API Mock

```typescript
await context.route('**/api/endpoint', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ data: 'mock' }),
  });
});
```

---

## 📌 주의사항

### 1. 포트 확인

`playwright.config.ts`에서 `baseURL`이 올바른지 확인:

```typescript
baseURL: 'http://localhost:3003', // 또는 3000
```

### 2. 테스트 격리

각 테스트는 독립적으로 실행됩니다:
- 새로운 브라우저 컨텍스트
- 깨끗한 쿠키/세션
- 독립적인 데이터

### 3. 타임아웃

기본 타임아웃: 30초

```typescript
// 테스트별 타임아웃 증가
test('느린 테스트', async ({ page }) => {
  test.setTimeout(60000); // 60초
});
```

### 4. 네트워크 대기

```typescript
// 네트워크 안정화 대기
await page.waitForLoadState('networkidle');

// 특정 응답 대기
await page.waitForResponse(resp => resp.url().includes('/api/'));
```

---

## 📈 CI/CD 통합

### GitHub Actions 예시

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run tests
        run: npx playwright test

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🎯 다음 단계

1. **나머지 그룹 테스트 작성**
   - Group 4-8, 10 구현

2. **테스트 데이터 자동 생성**
   - Fixture 작성
   - `beforeAll`에서 데이터 생성

3. **헬퍼 함수 작성**
   - `tests/helpers/auth.ts` - 로그인 헬퍼
   - `tests/helpers/data.ts` - 데이터 생성 헬퍼

4. **Visual Regression Testing**
   - 스크린샷 비교 테스트 추가

---

**작성일**: 2026-01-03
**최종 업데이트**: 2026-01-03
**테스트 커버리지**: 33개 시나리오 (전체 68개 중 48%)

## 🔧 최근 수정 사항 (2026-01-03)

### Group 1 독립 UI 테스트 수정

다음 수정사항이 `tests/group1-independent-ui.spec.ts`에 적용되었습니다:

1. **인증 처리 개선** (lines 6-64)
   - Webkit 및 Firefox용 별도 로그인 처리
   - 세션 쿠키 검증 추가
   - 타임아웃 3000ms로 증가

2. **선택자 개선**
   - Test 1.2: 모바일 메뉴 strict mode 수정
   - Test 2.1: `getByText()` → `locator().filter()` 변경
   - Test 2.2, 2.3: Server redirect 처리 (`waitUntil: 'commit'`)

3. **URL 검증 로직 변경**
   - Test 6.2: Dialog 대신 버튼 disabled 상태 확인

### 테스트 실행 결과

**마지막 성공 실행** (dev 서버 Port 3003):
- ✅ 31 passed
- ❌ 11 failed

**실패한 테스트**:
- 2.2 기능 카드 링크 (Chromium, Firefox)
- 2.3 CTA 버튼 (Chromium, Firefox)
- 6.2 브랜드 분석 URL 미입력 검증 (Webkit)
- 6.3 크롤링 깊이 조정 (Webkit)
- 5.1 견적 계산기 페이지 로드 (Webkit)
- 5.7 필수 항목 검증 (Webkit)

### 주의사항

1. **Dev Server 포트**
   - Playwright config: `baseURL: 'http://localhost:3000'`
   - webServer enabled: 자동으로 dev 서버 시작
   - 포트 충돌 시 다른 Node 프로세스 확인 필요

2. **필수 테스트 데이터**
   - 이메일: test@kglow.com
   - 비밀번호: Test123456!
   - 역할: BRAND

   생성 방법:
   ```bash
   npx tsx scripts/seed-test-user.ts
   ```

3. **Webkit 알려진 이슈**
   - 일부 테스트에서 세션 쿠키 타이밍 문제
   - 3초 대기 + 쿠키 검증 로직 추가됨
